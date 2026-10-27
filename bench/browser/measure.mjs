import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";
import { browserAdapters } from "./adapters.mjs";
import { CHART_METHOD, PAINT_SCHEMA, classifyStatus } from "./chart-types.mjs";
import { unsupportedPaintCells } from "./rivals.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(benchRoot, ".out/browser");
const checkpointPath = join(benchRoot, "results/paint-checkpoint.jsonl");

const SIZES = process.env.BENCH_POINTS
  ? process.env.BENCH_POINTS.split(",").map((value) => Number(value.trim())).filter((value) => value > 0)
  : [1_000, 10_000, 100_000, 1_000_000];
const SAMPLES = Number(process.env.BENCH_SAMPLES || 5);
const ONLY = process.env.BENCH_LIBS ? new Set(process.env.BENCH_LIBS.split(",").map((id) => id.trim()).filter(Boolean)) : null;
const TYPES = process.env.BENCH_TYPES ? new Set(process.env.BENCH_TYPES.split(",").map((id) => id.trim()).filter(Boolean)) : null;

function includeAdapter(adapter) {
  if (process.env.BENCH_SKIP_CHARTS === "1" && adapter.suite === "chart-types") return false;
  if (ONLY && !ONLY.has(adapter.id)) return false;
  if (TYPES && adapter.suite === "chart-types" && !TYPES.has(adapter.chart)) return false;
  return true;
}

function median(values) {
  const sorted = values.filter((value) => value != null).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function timeoutFor(n, id, suite) {
  if (suite === "chart-types" && n >= 100_000) return 180_000;
  if (suite === "chart-types" && n >= 10_000) return 90_000;
  if (id === "chartkit-full" && n >= 1_000_000) return 180_000;
  if (id === "chartkit-full" && n >= 100_000) return 90_000;
  if (n >= 1_000_000) return 90_000;
  if (n >= 100_000) return 45_000;
  if (n >= 10_000) return 20_000;
  return 15_000;
}

function sizesFor(adapter) {
  if (adapter.suite === "chart-types") {
    const declared = adapter.sizes ?? [];
    const raw = process.env.BENCH_CHART_POINTS;
    if (!raw) return declared.slice();
    const wanted = new Set(raw.split(",").map((value) => Number(value.trim())).filter((value) => value > 0));
    return declared.filter((points) => wanted.has(points));
  }
  const limit = adapter.sizes ?? SIZES;
  return SIZES.filter((points) => limit.includes(points));
}

function loadCheckpoint() {
  const done = new Map();
  if (process.env.BENCH_RESUME !== "1" || !existsSync(checkpointPath)) return done;
  for (const line of readFileSync(checkpointPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const cell = JSON.parse(line);
      if (cell && cell.status === "ok" && cell.samples === SAMPLES && cell.id && cell.points != null) done.set(`${cell.id}:${cell.points}`, cell);
    } catch {
      // A torn line is ignored. The next run appends a fresh one.
    }
  }
  return done;
}

function saveCheckpoint(cell) {
  if (cell.status !== "ok" || cell.suite === "line") return;
  mkdirSync(dirname(checkpointPath), { recursive: true });
  appendFileSync(checkpointPath, `${JSON.stringify(cell)}\n`);
}

function paintCell(adapter, points, extra) {
  return {
    chart: adapter.chart ?? null,
    homepageRow: adapter.homepageRow ?? null,
    library: extra.library ?? adapter.id,
    id: adapter.id,
    variant: adapter.variant ?? null,
    renderer: extra.renderer ?? null,
    points,
    nMeaning: adapter.nMeaning ?? null,
    why: adapter.why ?? null,
    method: adapter.method ?? adapter.why ?? null,
    status: extra.status,
    initialMs: extra.initialMs ?? null,
    updateMs: extra.updateMs ?? null,
    renderMs: extra.renderMs ?? null,
    updateRenderMs: extra.updateRenderMs ?? null,
    gzipBytes: null,
    ssrMs: null,
    samples: extra.samples ?? 0,
    error: extra.error ?? null,
    initialSamples: extra.initialSamples,
    updateSamples: extra.updateSamples,
    heapBefore: extra.heapBefore ?? null,
    heapAfterRender: extra.heapAfterRender ?? null,
    heapAfterUpdate: extra.heapAfterUpdate ?? null,
  };
}

const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root" style="width:640px;height:360px"></div></body></html>`;

async function bundleAdapters() {
  mkdirSync(outDir, { recursive: true });
  const selected = browserAdapters.filter((adapter) => includeAdapter(adapter) && sizesFor(adapter).length > 0);
  const files = new Array(selected.length);
  let cursor = 0;
  async function worker() {
    while (cursor < selected.length) {
      const index = cursor;
      cursor += 1;
      const adapter = selected[index];
      const outfile = join(outDir, `${adapter.id}.js`);
      await build({
        stdin: {
          contents: adapter.source,
          resolveDir: join(benchRoot, "browser"),
          sourcefile: "adapter.mjs",
          loader: "js",
        },
        bundle: true,
        minify: false,
        format: "esm",
        platform: "browser",
        outfile,
        loader: { ".css": "text" },
        define: { "process.env.NODE_ENV": '"production"' },
        logLevel: "silent",
      });
      files[index] = { adapter, id: adapter.id, outfile, sizes: sizesFor(adapter) };
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, selected.length) }, () => worker()));
  return files;
}

function libraryOf(adapter, info) {
  if (info?.library && info.library !== adapter.id) return info.library;
  return adapter.library || info?.library || adapter.id;
}

function record(target, adapter, points, fields) {
  const row = {
    id: adapter.id,
    library: fields.library,
    renderer: fields.renderer,
    points,
    status: fields.status,
    samples: fields.samples,
    initialMs: fields.initialMs,
    updateMs: fields.updateMs,
    renderMs: fields.renderMs,
    updateRenderMs: fields.updateRenderMs,
    heapBefore: fields.heapBefore,
    heapAfterRender: fields.heapAfterRender,
    heapAfterUpdate: fields.heapAfterUpdate,
    initialSamples: fields.initialSamples,
    updateSamples: fields.updateSamples,
  };
  if (fields.error) row.error = fields.error;
  if (adapter.suite !== "chart-types") target.rows.push(row);
  if (!adapter.chart) return;
  const cell = paintCell(adapter, points, fields);
  target.charts.push(cell);
  if (adapter.suite === "chart-types") saveCheckpoint(cell);
}

export async function measureBrowser() {
  const files = await bundleAdapters();
  const done = loadCheckpoint();
  const browser = await chromium.launch({
    args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"],
  });
  const rows = [];
  const charts = [];
  const target = { rows, charts };
  try {
    for (const file of files) {
      let skipLarger = false;
      for (const points of file.sizes) {
        const resumed = file.adapter.suite === "chart-types" ? done.get(`${file.id}:${points}`) : null;
        if (resumed) {
          console.log(`browser ${file.id} ${points} resume`);
          charts.push(resumed);
          continue;
        }
        if (skipLarger) {
          record(target, file.adapter, points, {
            library: file.adapter.library ?? file.id,
            renderer: file.adapter.renderer ?? null,
            status: "skipped",
            error: "Skipped because the previous size failed or timed out.",
            samples: 0,
          });
          continue;
        }
        console.log(`browser ${file.id} ${points}`);
        const timeout = timeoutFor(points, file.id, file.adapter.suite);
        const samples = [];
        let failed = null;
        let info = { library: file.id, renderer: null };
        for (let sample = 0; sample < SAMPLES && !failed; sample++) {
          const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
          page.setDefaultTimeout(timeout);
          let pageError = null;
          page.on("pageerror", (error) => {
            pageError = error instanceof Error ? error.message : String(error);
          });
          try {
            await page.setContent(html);
            await page.addScriptTag({ path: file.outfile, type: "module" });
            const result = await new Promise((resolve, reject) => {
              const timer = setTimeout(() => reject(new Error(`Timeout ${timeout}ms exceeded`)), timeout);
              page.evaluate((n) => globalThis.__bench.run(n), points).then(
                (value) => {
                  clearTimeout(timer);
                  resolve(value);
                },
                (error) => {
                  clearTimeout(timer);
                  reject(error);
                },
              );
            });
            info = await page.evaluate(() => ({
              library: globalThis.__bench.library,
              renderer: globalThis.__bench.renderer,
            }));
            if (pageError) throw new Error(pageError);
            samples.push(result);
          } catch (error) {
            const message = pageError || (error instanceof Error ? error.message : String(error));
            failed = message.slice(0, 500);
          } finally {
            await page.close().catch(() => {});
          }
        }
        if (failed || samples.length !== SAMPLES) {
          const status = file.adapter.suite === "chart-types"
            ? classifyStatus(failed || "")
            : (failed || "").toLowerCase().includes("timeout") ? "timeout" : "error";
          record(target, file.adapter, points, {
            library: libraryOf(file.adapter, info),
            renderer: info.renderer ?? file.adapter.renderer ?? null,
            status,
            error: failed || "A sample did not finish.",
            samples: samples.length,
          });
          skipLarger = true;
          continue;
        }
        record(target, file.adapter, points, {
          library: libraryOf(file.adapter, info),
          renderer: info.renderer ?? file.adapter.renderer ?? null,
          status: "ok",
          error: null,
          samples: SAMPLES,
          initialMs: median(samples.map((sample) => sample.initialMs)),
          updateMs: median(samples.map((sample) => sample.updateMs)),
          renderMs: median(samples.map((sample) => sample.renderMs)),
          updateRenderMs: median(samples.map((sample) => sample.updateRenderMs)),
          heapBefore: median(samples.map((sample) => sample.heapBefore)),
          heapAfterRender: median(samples.map((sample) => sample.heapAfterRender)),
          heapAfterUpdate: median(samples.map((sample) => sample.heapAfterUpdate)),
          initialSamples: samples.map((sample) => sample.initialMs),
          updateSamples: samples.map((sample) => sample.updateMs),
        });
      }
    }
  } finally {
    await browser.close();
  }
  const chartSweep = files.some((file) => file.adapter.suite === "chart-types");
  if (chartSweep) charts.push(...unsupportedPaintCells({ only: ONLY, types: TYPES }));
  return {
    method: `Playwright Chromium. Each sample is a fresh page. Reported times are the median of ${SAMPLES} samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Every library does its own update, then waits for the same two animation frames. ECharts also waits for its finished event before those frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width) and returns that synchronous build as renderMs before the two frames. ChartKit canvas is the same line with render canvas. It paints sampled points straight onto a canvas and builds SVG for the axes only, and renderMs includes that paint. It does not build the mark DOM. ChartKit sampling none is the same SVG line with mark.sampling none, measured only at 100k and 1M. An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library. Chart-type cells are in charts, not in rows.`,
    chartMethod: CHART_METHOD,
    paintSchema: PAINT_SCHEMA,
    samples: SAMPLES,
    sizes: SIZES,
    rows,
    charts,
  };
}
