import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";
import { browserAdapters } from "./adapters.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(benchRoot, ".out/browser");

const SIZES = process.env.BENCH_POINTS
  ? process.env.BENCH_POINTS.split(",").map((value) => Number(value.trim())).filter((value) => value > 0)
  : [1_000, 10_000, 100_000, 1_000_000];
const SAMPLES = Number(process.env.BENCH_SAMPLES || 5);
const ONLY = process.env.BENCH_LIBS ? new Set(process.env.BENCH_LIBS.split(",").map((id) => id.trim()).filter(Boolean)) : null;

function median(values) {
  const sorted = values.filter((value) => value != null).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function timeoutFor(n, id) {
  if (id === "chartkit-full" && n >= 1_000_000) return 180_000;
  if (id === "chartkit-full" && n >= 100_000) return 90_000;
  if (n >= 1_000_000) return 90_000;
  if (n >= 100_000) return 45_000;
  if (n >= 10_000) return 20_000;
  return 15_000;
}

function sizesFor(adapter) {
  const limit = adapter.sizes ?? SIZES;
  return SIZES.filter((points) => limit.includes(points));
}

const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root" style="width:640px;height:360px"></div></body></html>`;

async function bundleAdapters() {
  mkdirSync(outDir, { recursive: true });
  const files = [];
  for (const adapter of browserAdapters) {
    if (ONLY && !ONLY.has(adapter.id)) continue;
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
    files.push({ id: adapter.id, outfile, sizes: sizesFor(adapter) });
  }
  return files;
}

export async function measureBrowser() {
  const files = await bundleAdapters();
  const browser = await chromium.launch({
    args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"],
  });
  const rows = [];
  try {
    for (const file of files) {
      let skipLarger = false;
      for (const points of file.sizes) {
        if (skipLarger) {
          rows.push({
            id: file.id,
            points,
            status: "skipped",
            error: "Skipped because the previous size failed or timed out.",
          });
          continue;
        }
        console.log(`browser ${file.id} ${points}`);
        const timeout = timeoutFor(points, file.id);
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
            const result = await page.evaluate((n) => globalThis.__bench.run(n), points);
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
          rows.push({
            id: file.id,
            library: info.library,
            points,
            status: (failed || "").toLowerCase().includes("timeout") ? "timeout" : "error",
            error: failed || "A sample did not finish.",
            samples: samples.length,
          });
          skipLarger = true;
          continue;
        }
        rows.push({
          id: file.id,
          library: info.library,
          renderer: info.renderer,
          points,
          status: "ok",
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
  return {
    method: `Playwright Chromium. Each sample is a fresh page. Reported times are the median of ${SAMPLES} samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Every library does its own update, then waits for the same two animation frames. ECharts also waits for its finished event before those frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width) and returns that synchronous build as renderMs before the two frames. ChartKit canvas is the same line with render canvas. It paints sampled points straight onto a canvas and builds SVG for the axes only, and renderMs includes that paint. It does not build the mark DOM. ChartKit sampling none is the same SVG line with mark.sampling none, measured only at 100k and 1M. An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.`,
    samples: SAMPLES,
    sizes: SIZES,
    rows,
  };
}
