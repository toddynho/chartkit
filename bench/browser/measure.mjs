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

function timeoutFor(n) {
  if (n >= 1_000_000) return 90_000;
  if (n >= 100_000) return 45_000;
  if (n >= 10_000) return 20_000;
  return 15_000;
}

const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root" style="width:640px;height:360px"></div></body></html>`;

async function bundleAdapters() {
  mkdirSync(outDir, { recursive: true });
  const files = [];
  for (const adapter of browserAdapters) {
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
    files.push({ id: adapter.id, outfile });
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
      for (const points of SIZES) {
        if (skipLarger) {
          rows.push({
            id: file.id,
            points,
            status: "skipped",
            error: "Skipped because the previous size failed or timed out.",
          });
          continue;
        }
        const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
        const timeout = timeoutFor(points);
        page.setDefaultTimeout(timeout);
        let pageError = null;
        page.on("pageerror", (error) => {
          pageError = error instanceof Error ? error.message : String(error);
        });
        try {
          await page.setContent(html);
          await page.addScriptTag({ path: file.outfile, type: "module" });
          const result = await page.evaluate((n) => globalThis.__bench.run(n), points);
          const info = await page.evaluate(() => ({
            library: globalThis.__bench.library,
            renderer: globalThis.__bench.renderer,
          }));
          rows.push({
            id: file.id,
            library: info.library,
            renderer: info.renderer,
            points,
            status: "ok",
            ...result,
            pageError,
          });
        } catch (error) {
          const message = pageError || (error instanceof Error ? error.message : String(error));
          rows.push({
            id: file.id,
            points,
            status: message.toLowerCase().includes("timeout") ? "timeout" : "error",
            error: message.slice(0, 500),
          });
          skipLarger = true;
        } finally {
          await page.close().catch(() => {});
        }
      }
    }
  } finally {
    await browser.close();
  }
  return {
    method: "Playwright Chromium. Each library is a fresh page. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Initial render and one full update (seed 2) are timed, then two animation frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none). uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off, and waits for the finished event. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.",
    sizes: SIZES,
    rows,
  };
}
