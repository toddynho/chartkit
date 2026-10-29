import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { Worker } from "node:worker_threads";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { summarize } from "../lib/time.mjs";
import { buildSsrMatrix, ssrMethod } from "./catalog.mjs";
import { prepareRival } from "./rivals.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function selected(cell) {
  const types = process.env.BENCH_TYPES;
  const libs = process.env.BENCH_LIBS;
  if (types) {
    const want = new Set(types.split(",").map((item) => item.trim()).filter(Boolean));
    if (!want.has(cell.chart)) return false;
  }
  if (libs) {
    const want = new Set(libs.split(",").map((item) => item.trim()).filter(Boolean));
    if (!want.has(cell.id) && !(want.has("chartkit") && cell.id === "chartkit")) return false;
  }
  return true;
}

function classify(error) {
  const text = error instanceof Error ? error.message : String(error);
  if (/^unsupported:/i.test(text)) return "unsupported";
  if (/license key|licen[cs]e.?key|enter your license/i.test(text)) return "license-blocked";
  return "error";
}

const SAMPLE_BUDGET_MS = 90_000;

function runRivalWorker(cell) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./worker.mjs", import.meta.url), {
      workerData: { chart: cell.chart, points: cell.points, ssr: cell.ssr, samples: cell.samples, library: cell.library },
    });
    let settled = false;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    let timer = setTimeout(() => {
      worker.terminate();
      finish(() => reject(new Error(`error: sample exceeded ${SAMPLE_BUDGET_MS}ms`)));
    }, SAMPLE_BUDGET_MS);
    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        worker.terminate();
        finish(() => reject(new Error(`error: sample exceeded ${SAMPLE_BUDGET_MS}ms`)));
      }, SAMPLE_BUDGET_MS);
    };
    worker.on("message", (message) => {
      if (message.type === "progress") bump();
      else if (message.type === "done") finish(() => resolve(message.timing));
      else if (message.type === "fail") finish(() => reject(new Error(message.error)));
    });
    worker.on("error", (error) => finish(() => reject(error)));
    worker.on("exit", (code) => {
      if (!settled && code !== 0) finish(() => reject(new Error(`error: worker exited ${code}`)));
    });
  });
}

async function timeCalls(fn, iterations) {
  await fn();
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    samples.push(performance.now() - start);
  }
  return { ...summarize(samples), samples: samples.map((value) => Math.round(value * 100) / 100) };
}

async function loadChartkit() {
  const outfile = join(benchRoot, ".out/ssr-chartkit.mjs");
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(benchRoot, "ssr/chartkit-probe.mjs")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

export async function measureSsr() {
  const cells = buildSsrMatrix().filter(selected);
  const needsChartkit = cells.some((cell) => cell.status === "ok" && cell.ssr === "chartkit");
  const chartkit = needsChartkit ? await loadChartkit() : null;
  let done = 0;
  for (const cell of cells) {
    if (cell.status !== "ok") continue;
    try {
      const heavy = cell.ssr !== "chartkit" && cell.points >= 10_000;
      const timing = heavy
        ? await runRivalWorker(cell)
        : await timeCalls(cell.ssr === "chartkit" ? chartkit.prepareChartkit(cell.chart, cell.points) : await prepareRival(cell), cell.samples);
      Object.assign(cell, timing);
      done += 1;
      console.log(`ssr ${cell.library} ${cell.chart} n=${cell.points} ${timing.medianMs}ms`);
    } catch (error) {
      cell.status = classify(error);
      cell.error = error instanceof Error ? error.message : String(error);
      cell.medianMs = null;
      console.log(`ssr ${cell.library} ${cell.chart} n=${cell.points} ${cell.status} ${(cell.error ?? "").replace(/\s+/g, " ").slice(0, 160)}`);
    }
  }
  return {
    phase: 4,
    method: ssrMethod,
    samples: 5,
    counts: countCells(cells),
    cells,
    filtered: Boolean(process.env.BENCH_TYPES || process.env.BENCH_LIBS),
  };
}

export function countCells(cells) {
  const counts = { ok: 0, unsupported: 0, "license-blocked": 0, error: 0 };
  for (const cell of cells) {
    if (counts[cell.status] == null) counts[cell.status] = 0;
    counts[cell.status] += 1;
  }
  return counts;
}

export function ssrOutFile(result) {
  return result?.filtered ? "ssr-smoke.json" : "ssr.json";
}
