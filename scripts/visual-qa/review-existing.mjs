/**
 * Re-run the vision model on a report that was already captured.
 *
 *   node scripts/visual-qa/review-existing.mjs --only progress-ring,rose
 *   node scripts/visual-qa/review-existing.mjs --model Qwen/Qwen3.8-27B --only /docs/charts/donut
 *
 * Does not rebuild the site or take new screenshots.
 */
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEFAULT_MAX_TOKENS, hostNeedsKey } from "./model.mjs";
import { summarize, writeReport } from "./report.mjs";
import { formatDuration, reviewShots, visionConfig } from "./run.mjs";
import { parseOnly, repoRootFrom } from "./targets.mjs";

const root = repoRootFrom(dirname(fileURLToPath(import.meta.url)));

export function shotKey(shot) {
  return [shot.page ?? "", shot.demo ?? "", shot.viewport ?? "", shot.rail?.px ?? ""].join("|");
}

/** --only accepts chart types (progress-ring) and page paths (/docs/charts/rose). */
export function filterShots(shots, only) {
  const names = parseOnly(only);
  if (!names.length) return shots;
  return shots.filter((shot) =>
    names.some((name) => {
      if (name.startsWith("/")) return shot.page === name;
      return shot.type === name || shot.page === `/docs/charts/${name}`;
    }),
  );
}

function parseArgs(argv) {
  const out = {
    out: "visual-qa-report",
    model: "",
    baseUrl: "",
    maxTokens: DEFAULT_MAX_TOKENS,
    concurrency: 3,
    only: "",
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} needs a value`);
      return value;
    };
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--out") out.out = next();
    else if (arg === "--model") out.model = next();
    else if (arg === "--base-url") out.baseUrl = next();
    else if (arg === "--max-tokens") out.maxTokens = Number(next());
    else if (arg === "--concurrency") out.concurrency = Number(next());
    else if (arg === "--only") out.only = next();
    else throw new Error(`Unknown flag ${arg}`);
  }
  if (!Number.isInteger(out.concurrency) || out.concurrency < 1) throw new Error("--concurrency must be a positive integer");
  if (out.maxTokens != null && (!Number.isInteger(out.maxTokens) || out.maxTokens < 256)) {
    throw new Error("--max-tokens must be an integer >= 256");
  }
  return out;
}

function help() {
  console.log(`Re-review a visual QA report without recapturing.

  node scripts/visual-qa/review-existing.mjs --only progress-ring,rose
  node scripts/visual-qa/review-existing.mjs --model Qwen/Qwen3.8-27B --only /docs/charts/donut

Flags
  --out <dir>          Report directory. Default visual-qa-report.
  --model <id>         Overrides QA_VISION_MODEL.
  --base-url <url>     Vision API. Overrides QA_VISION_BASE_URL.
  --max-tokens <n>     Default 4096.
  --concurrency <n>    Model requests. Default 3.
  --only <list>        Comma-separated chart types or page paths.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }
  const config = visionConfig(args);
  if (hostNeedsKey(config.baseUrl) && !config.apiKey) {
    throw new Error("Set QA_VISION_API_KEY or CRUSOE_API_KEY. The key is read from the environment and is not stored.");
  }
  args.out = resolve(root, args.out);
  const reportPath = join(args.out, "report.json");
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const shots = Array.isArray(report.shots) ? report.shots : [];
  const selected = filterShots(shots, args.only);
  if (!selected.length) throw new Error(`No shots in ${reportPath} match --only ${args.only || "(all)"}`);
  console.log(`Reviewing ${selected.length} of ${shots.length} shots in ${reportPath}`);
  const started = Date.now();
  const info = await reviewShots(selected, config, args);
  const reviewed = new Map(selected.map((shot) => [shotKey(shot), shot.model]));
  for (const shot of shots) {
    if (reviewed.has(shotKey(shot))) shot.model = reviewed.get(shotKey(shot));
  }
  const elapsed = Date.now() - started;
  const summary = summarize(shots, { report: join(args.out, "index.html") });
  const modelLine = `${info.id} · ${info.imagesSent} images sent · about ${info.estimatedTokens} tokens`;
  await writeReport(args.out, {
    summary,
    shots,
    meta: {
      ...(report.meta || {}),
      when: new Date().toISOString(),
      elapsed: formatDuration(elapsed),
      modelLine,
      model: info,
      estimatedTokens: info.estimatedTokens,
      reviewed: selected.length,
    },
  });
  console.log(`model ${info.id}`);
  console.log(`images sent ${info.imagesSent}`);
  console.log(`estimated tokens ${info.estimatedTokens}`);
  const apiTokens = (info.usage?.prompt_tokens || 0) + (info.usage?.completion_tokens || 0);
  if (apiTokens) console.log(`api tokens ${apiTokens}`);
  console.log(`reviewed ${selected.length}  elapsed ${formatDuration(elapsed)}`);
  console.log(`report ${join(args.out, "index.html")}`);
}

function runMain() {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) runMain();
