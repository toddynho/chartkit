import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { compress } from "../lib/compress.mjs";
import { bundleEntries } from "./entries.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const uplotCss = readFileSync(join(benchRoot, "node_modules/uplot/dist/uPlot.min.css"));
const uplotCssSize = compress(uplotCss);

const reactExternal = ["react", "react-dom", "react-dom/client", "react/jsx-runtime"];

async function bundleSource(source, { external = [] } = {}) {
  const outfile = join(tmpdir(), `chartkit-bench-size-${Math.random().toString(36).slice(2)}.mjs`);
  await build({
    stdin: {
      contents: source,
      resolveDir: join(benchRoot, "bundle"),
      sourcefile: "entry.mjs",
      loader: "js",
    },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    outfile,
    external,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  return compress(readFileSync(outfile));
}

export async function measureBundles() {
  const rows = [];
  const allCache = new Map();
  for (const entry of bundleEntries) {
    if (entry.unsupported) {
      rows.push({
        id: entry.id,
        library: entry.library,
        chart: entry.chart,
        renderer: entry.renderer,
        react: entry.react,
        status: "unsupported",
        note: entry.unsupported,
      });
      continue;
    }
    const cacheKey = entry.source;
    let sizes = allCache.get(cacheKey);
    if (!sizes) {
      sizes = await bundleSource(entry.source);
      allCache.set(cacheKey, sizes);
    }
    const row = {
      id: entry.id,
      library: entry.library,
      chart: entry.chart,
      renderer: entry.renderer,
      react: entry.react,
      status: "ok",
      ...sizes,
      note: entry.note ?? null,
    };
    if (entry.css) {
      row.cssMinBytes = uplotCssSize.minBytes;
      row.cssGzipBytes = uplotCssSize.gzipBytes;
      row.cssBrotliBytes = uplotCssSize.brotliBytes;
      row.note = "JS bundle plus uPlot's published uPlot.min.css, gzipped and brotli-compressed separately. css+js gzip is the sum of the two responses, not one combined stream.";
    }
    if (entry.react === "included") {
      const externalSizes = await bundleSource(entry.source, { external: reactExternal });
      row.reactExternal = externalSizes;
      row.reactExternal.note = "react, react-dom, and jsx-runtime are external. This is the added cost when the app already ships React.";
    }
    rows.push(row);
  }
  return {
    method: "esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. ChartKit entries bundle packages/core/src. Competitor entries use the pinned package and only the import that chart needs. ECharts uses echarts/core plus one chart, its grid component when the chart has axes, and CanvasRenderer.",
    uplotCss: uplotCssSize,
    rows,
  };
}
