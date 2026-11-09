/**
 * Visual QA sweep.
 *
 *   npm run qa:visual -- --no-model
 *   npm run qa:visual -- --list-models
 *   npm run qa:visual -- --url http://127.0.0.1:4321
 *
 * Builds apps/web and serves astro preview unless --url points at a server
 * that is already up. Headless Chromium. The report is visual-qa-report/.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runCapture } from "./capture.mjs";
import {
  DEFAULT_BASE_URL,
  DEFAULT_MAX_TOKENS,
  buildChatRequest,
  dataUri,
  estimateRequestTokens,
  hostNeedsKey,
  isCrusoe,
  listModels,
  multimodalModels,
  parseReview,
  pickModel,
  postChat,
} from "./model.mjs";
import { shotSeverity, summarize, writeReport } from "./report.mjs";
import { chartPageTypes, parseWidths, planJobs, repoRootFrom } from "./targets.mjs";

const root = repoRootFrom(dirname(fileURLToPath(import.meta.url)));

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function stopChild(child) {
  if (!child?.pid || child.exitCode != null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest}s`;
  return `${minutes}m ${rest}s`;
}

function help() {
  console.log(`ChartKit visual QA

  npm run qa:visual -- --no-model
  npm run qa:visual -- --list-models
  npm run qa:visual -- --url http://127.0.0.1:4321 --only progress-ring

Builds the site and serves astro preview unless --url is set.
Headless Chromium. Install it once:

  npx playwright install --with-deps chromium

Flags
  --url <site>         Already-running server. Skips build and preview.
  --only <type>        One docs chart type, for example progress-ring.
  --widths <list>      Rail widths. Default 280,380,720. 380 is the unset default.
  --no-model           Capture and deterministic checks only.
  --list-models        Print multimodal models from GET /v1/models and exit.
  --base-url <url>     Vision API. Overrides QA_VISION_BASE_URL.
  --model <id>         Overrides QA_VISION_MODEL. Use this to compare models.
  --max-tokens <n>     Default ${DEFAULT_MAX_TOKENS}. Reasoning models need the room.
  --headed             Show the browser. The default is headless.
  --concurrency <n>    Browser pages and model requests. Default 3.
  --out <dir>          Report directory. Default visual-qa-report.
`);
}

function parseArgs(argv) {
  const out = {
    widths: parseWidths("280,380,720"),
    concurrency: 3,
    maxTokens: DEFAULT_MAX_TOKENS,
    headed: false,
    noModel: false,
    listModels: false,
    help: false,
    only: "",
    url: "",
    baseUrl: "",
    model: "",
    out: "",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} needs a value`);
      return value;
    };
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--no-model") out.noModel = true;
    else if (arg === "--list-models") out.listModels = true;
    else if (arg === "--headed") out.headed = true;
    else if (arg === "--only") out.only = next();
    else if (arg === "--widths") out.widths = parseWidths(next());
    else if (arg === "--base-url") out.baseUrl = next();
    else if (arg === "--model") out.model = next();
    else if (arg === "--url") out.url = next();
    else if (arg === "--max-tokens") out.maxTokens = Number(next());
    else if (arg === "--concurrency") out.concurrency = Number(next());
    else if (arg === "--out") out.out = next();
    else throw new Error(`Unknown flag ${arg}`);
  }
  if (!Number.isInteger(out.concurrency) || out.concurrency < 1) throw new Error("--concurrency must be a positive integer");
  if (!Number.isInteger(out.maxTokens) || out.maxTokens < 256) throw new Error("--max-tokens must be an integer >= 256");
  return out;
}

function runInherit(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", env: process.env });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

function freePort(start) {
  return new Promise((resolvePromise) => {
    const server = createServer();
    server.once("error", () => resolvePromise(freePort(start + 1)));
    server.listen(start, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : start;
      server.close(() => resolvePromise(port));
    });
  });
}

async function waitForHttp(url, child) {
  const deadline = Date.now() + 90000;
  let last = "no response";
  while (Date.now() < deadline) {
    if (child.exitCode != null) throw new Error(`astro preview exited ${child.exitCode}\n${last}`);
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) return;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err instanceof Error ? err.message : String(err);
    }
    await sleep(400);
  }
  throw new Error(`astro preview did not answer at ${url}: ${last}`);
}

async function startPreview() {
  const port = await freePort(4321);
  const child = spawn(
    "npm",
    ["run", "preview", "--workspace=chartkit-web", "--", "--host", "127.0.0.1", "--port", String(port), "--force"],
    {
      cwd: root,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let log = "";
  const keep = (chunk) => {
    log = (log + chunk.toString()).slice(-4000);
  };
  child.stdout?.on("data", keep);
  child.stderr?.on("data", keep);
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForHttp(`${url}/`, child);
  } catch (err) {
    stopChild(child);
    throw new Error(`${err instanceof Error ? err.message : err}\n${log}`);
  }
  return {
    url,
    stop() {
      stopChild(child);
    },
  };
}

async function launchBrowser(headed) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error("Playwright is not installed. From the repo root: npx playwright install --with-deps chromium");
  }
  try {
    return await chromium.launch({
      headless: !headed,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Executable doesn't exist") || message.includes("browserType.launch")) {
      throw new Error(`Playwright Chromium is not installed. From the repo root:\n  npx playwright install --with-deps chromium\n${message}`);
    }
    throw err;
  }
}

function visionConfig(args) {
  const baseUrl = (args.baseUrl || process.env.QA_VISION_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const apiKey = process.env.QA_VISION_API_KEY || process.env.CRUSOE_API_KEY || "";
  const explicit = args.model || process.env.QA_VISION_MODEL || "";
  return { baseUrl, apiKey, explicit };
}

async function printModels(config) {
  if (hostNeedsKey(config.baseUrl) && !config.apiKey) {
    throw new Error("Set QA_VISION_API_KEY or CRUSOE_API_KEY. The key is read from the environment and is not stored.");
  }
  const models = await listModels(config);
  const multi = multimodalModels(models);
  if (!multi.length) {
    console.log("No multimodal models in this catalog. Ollama does not send architecture.modality. Pass --model, for example qwen2.5vl.");
    return;
  }
  for (const model of multi) console.log(model.id);
  const picked = pickModel(models, config);
  if (picked) {
    const where = isCrusoe(config.baseUrl) && picked.reason === "crusoe-prefer" ? "Crusoe preference" : picked.reason;
    console.log(`auto: ${picked.id} (${where})`);
  }
}

async function reviewShots(shots, config, args) {
  let picked = config.explicit ? { id: config.explicit, reason: "explicit" } : null;
  if (!picked) {
    const models = await listModels(config);
    picked = pickModel(models, { baseUrl: config.baseUrl, explicit: "" });
  }
  if (!picked) {
    throw new Error("No multimodal model from GET /v1/models. Pass --model. Ollama does not tag modality.");
  }
  console.log(`Vision model: ${picked.id} (${picked.reason})`);
  let cursor = 0;
  let imagesSent = 0;
  let estimatedTokens = 0;
  const usage = { prompt_tokens: 0, completion_tokens: 0 };
  const workers = Math.max(1, Math.min(args.concurrency, shots.length || 1));

  async function worker() {
    for (;;) {
      const index = cursor++;
      if (index >= shots.length) return;
      const shot = shots[index];
      if (!shot.images?.length) {
        shot.model = { issues: [], error: "no screenshot", finishReason: "" };
        continue;
      }
      try {
        const images = [];
        for (const image of shot.images) {
          const bytes = await readFile(join(args.out, image.file));
          images.push({ dataUri: dataUri(bytes) });
          imagesSent += 1;
        }
        const body = buildChatRequest({ model: picked.id, maxTokens: args.maxTokens, shot, images });
        estimatedTokens += estimateRequestTokens(shot, args.maxTokens);
        const result = await postChat({ baseUrl: config.baseUrl, apiKey: config.apiKey, body });
        const parsed = parseReview(result.content);
        if (result.usage) {
          usage.prompt_tokens += Number(result.usage.prompt_tokens) || 0;
          usage.completion_tokens += Number(result.usage.completion_tokens) || 0;
        }
        let error = parsed.error;
        if (result.finishReason === "length") {
          error = `${error ? `${error} ` : ""}finish_reason=length. Raise --max-tokens. Reasoning models spend tokens before the JSON.`;
        }
        shot.model = { issues: parsed.issues, error, finishReason: result.finishReason };
      } catch (err) {
        shot.model = { issues: [], error: err instanceof Error ? err.message : String(err), finishReason: "" };
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return { id: picked.id, reason: picked.reason, imagesSent, estimatedTokens, usage };
}

function printSummary(summary, modelInfo, elapsed) {
  console.log("");
  console.log(`shots ${summary.shots}`);
  console.log(`flagged ${summary.flagged}  high ${summary.bySeverity.high}  medium ${summary.bySeverity.medium}  low ${summary.bySeverity.low}  clear ${summary.clear}`);
  const checks = Object.entries(summary.byCheck)
    .map(([name, count]) => `${name} ${count}`)
    .join("  ");
  if (checks) console.log(checks);
  console.log(`images captured ${summary.imagesCaptured}`);
  if (modelInfo) {
    console.log(`images sent ${modelInfo.imagesSent}`);
    const apiTokens = modelInfo.usage.prompt_tokens + modelInfo.usage.completion_tokens;
    console.log(`estimated tokens ${modelInfo.estimatedTokens}${apiTokens ? `  api tokens ${apiTokens}` : ""}`);
    console.log(`model ${modelInfo.id}`);
  } else {
    console.log(`images a model sweep would send ${summary.imagesCaptured}`);
    console.log("model off");
  }
  console.log(`elapsed ${formatDuration(elapsed)}`);
  console.log(`report ${summary.report}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }
  const config = visionConfig(args);
  if (args.listModels) {
    await printModels(config);
    return;
  }
  if (!args.noModel && hostNeedsKey(config.baseUrl) && !config.apiKey) {
    throw new Error("Set QA_VISION_API_KEY or CRUSOE_API_KEY, or pass --no-model. The key is read from the environment and is not stored.");
  }

  args.out = resolve(root, args.out || "visual-qa-report");
  const started = Date.now();
  let site = null;
  let buildMs = 0;
  let preview = null;
  let shots = [];
  let captureMs = 0;
  let estimated = 0;
  try {
    if (args.url) {
      site = new URL(args.url).origin;
      const probe = await fetch(site, { redirect: "follow" });
      if (!probe.ok) throw new Error(`${site} returned HTTP ${probe.status}`);
      console.log(`Using ${site}`);
    } else {
      console.log("Building apps/web");
      const buildStarted = Date.now();
      await runInherit("npm", ["run", "build:web"]);
      buildMs = Date.now() - buildStarted;
      console.log(`Build ${formatDuration(buildMs)}. Starting astro preview`);
      preview = await startPreview();
      site = preview.url;
      console.log(`Preview ${site}`);
    }

    const types = chartPageTypes(root);
    const jobs = planJobs({ types, only: args.only, widths: args.widths });
    console.log(`${jobs.length} page passes across ${types.length} chart pages`);
    const browser = await launchBrowser(args.headed);
    const captureStarted = Date.now();
    try {
      let done = 0;
      shots = await runCapture({
        browser,
        jobs,
        siteUrl: site,
        outDir: args.out,
        concurrency: args.concurrency,
        onJob(job, produced) {
          done += 1;
          const flagged = produced.filter((shot) => shotSeverity(shot)).length;
          const rail = job.rail ? ` w${job.rail.px}` : "";
          console.log(`${done}/${jobs.length} ${job.path} ${job.viewport}${rail} shots ${produced.length} flagged ${flagged}`);
        },
      });
    } finally {
      await browser.close().catch(() => {});
      captureMs = Date.now() - captureStarted;
    }
  } finally {
    preview?.stop();
  }

  let modelInfo = null;
  if (!args.noModel) {
    console.log("Sending screenshots");
    modelInfo = await reviewShots(shots, config, args);
  } else {
    estimated = shots.reduce((sum, shot) => sum + estimateRequestTokens(shot, args.maxTokens), 0);
  }

  const summary = summarize(shots, { report: join(args.out, "index.html") });
  const elapsed = Date.now() - started;
  const modelLine = modelInfo
    ? `${modelInfo.id} · ${modelInfo.imagesSent} images sent`
    : `no model · a full sweep would send ${summary.imagesCaptured} images, about ${estimated} tokens`;
  await writeReport(args.out, {
    summary,
    shots,
    meta: {
      site,
      when: new Date().toISOString(),
      elapsed: formatDuration(elapsed),
      buildMs,
      captureMs,
      modelLine,
      headless: !args.headed,
      model: modelInfo,
      wouldSendImages: summary.imagesCaptured,
      estimatedTokens: modelInfo?.estimatedTokens ?? estimated,
    },
  });
  printSummary(summary, modelInfo, elapsed);
  if (!modelInfo) console.log(`estimated tokens if those images were sent ${estimated}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
