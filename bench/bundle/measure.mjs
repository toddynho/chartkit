import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { compress } from "../lib/compress.mjs";
import { AMBIGUOUS_ALIASES, buildMatrix, bundleMethod } from "./catalog.mjs";
import { bundleSummary } from "../lib/phase4-md.mjs";
import { collapseTreeShake } from "./tree.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const reactExternal = ["react", "react-dom", "react-dom/client", "react/jsx-runtime"];

const LICENSE_PROBE = {
  highcharts: "highcharts/esm/highcharts.js",
  "ag-community": "ag-charts-community",
  "ag-enterprise": "ag-charts-enterprise",
  amcharts: "@amcharts/amcharts5",
  apexcharts: "apexcharts/line",
  muix: "@mui/x-charts/LineChart",
};

function selected(cell) {
  const types = process.env.BENCH_TYPES;
  const libs = process.env.BENCH_LIBS;
  if (types) {
    const want = new Set(types.split(",").map((item) => item.trim()).filter(Boolean));
    if (!want.has(cell.chart)) return false;
  }
  if (libs) {
    const want = new Set(libs.split(",").map((item) => item.trim()).filter(Boolean));
    const id = cell.id === "chartkit-all" ? "chartkit-all" : cell.id;
    if (!want.has(id) && !(want.has("chartkit") && (id === "chartkit" || id === "chartkit-all"))) return false;
  }
  return true;
}

function licenseStatus(error) {
  const text = error instanceof Error ? error.message : String(error);
  if (/license key|licen[cs]e.?key|trial license|LICENSE_KEY|required license|enter your license/i.test(text)) {
    return { status: "license-blocked", error: text };
  }
  return null;
}

async function probeLicense(group) {
  const specifier = LICENSE_PROBE[group];
  if (!specifier) return null;
  try {
    await import(specifier);
    return null;
  } catch (error) {
    return licenseStatus(error);
  }
}

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
  try {
    return compress(readFileSync(outfile));
  } finally {
    unlinkSync(outfile);
  }
}

function publicCell(cell) {
  const { source, singleBuild, css, ...rest } = cell;
  return rest;
}

export async function measureBundles() {
  const uplotCss = compress(readFileSync(join(benchRoot, "node_modules/uplot/dist/uPlot.min.css")));
  const cells = buildMatrix().filter(selected);
  const blocked = new Map();
  for (const group of new Set(cells.filter((cell) => cell.status === "ok").map((cell) => cell.group))) {
    const result = await probeLicense(group);
    if (result) blocked.set(group, result);
  }
  const cache = new Map();
  let done = 0;
  for (const cell of cells) {
    if (cell.status !== "ok") continue;
    const block = blocked.get(cell.group);
    if (block) {
      cell.status = block.status;
      cell.error = block.error;
      cell.source = null;
      continue;
    }
    try {
      let sizes = cache.get(cell.source);
      if (!sizes) {
        sizes = await bundleSource(cell.source);
        cache.set(cell.source, sizes);
      }
      Object.assign(cell, sizes);
      if (cell.css) {
        cell.cssMinBytes = uplotCss.minBytes;
        cell.cssGzipBytes = uplotCss.gzipBytes;
        cell.cssBrotliBytes = uplotCss.brotliBytes;
        cell.note = "JS bundle plus uPlot's published uPlot.min.css, gzipped and brotli-compressed separately. css+js gzip is the sum of the two responses, not one combined stream.";
      }
      if (cell.react === "included") {
        const key = `${cell.source}\nexternal`;
        let external = cache.get(key);
        if (!external) {
          external = await bundleSource(cell.source, { external: reactExternal });
          cache.set(key, external);
        }
        cell.reactExternal = {
          ...external,
          note: "react, react-dom, and jsx-runtime are external. This is the added cost when the app already ships React.",
        };
      }
      done += 1;
      if (done % 25 === 0) console.log(`bundle ${done}`);
    } catch (error) {
      const licensed = licenseStatus(error);
      cell.status = licensed?.status ?? "error";
      cell.error = error instanceof Error ? error.message : String(error);
    }
  }
  const packages = collapseTreeShake(cells);
  const counts = countCells(cells);
  const result = {
    phase: 4,
    method: bundleMethod,
    treeNoiseGzip: 512,
    ambiguousAliases: AMBIGUOUS_ALIASES,
    uplotCss,
    counts,
    packages,
    cells: cells.map(publicCell),
    filtered: Boolean(process.env.BENCH_TYPES || process.env.BENCH_LIBS),
  };
  result.summary = bundleSummary(result);
  return result;
}

export function countCells(cells) {
  const counts = { ok: 0, unsupported: 0, "license-blocked": 0, error: 0 };
  for (const cell of cells) {
    if (counts[cell.status] == null) counts[cell.status] = 0;
    counts[cell.status] += 1;
  }
  return counts;
}

export function bundleOutFile(result) {
  return result?.filtered ? "bundle-smoke.json" : "bundle.json";
}
