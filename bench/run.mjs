import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, stop } from "esbuild";
import { tasks } from "./agent/tasks.mjs";
import { measureBrowser } from "./browser/measure.mjs";
import { bundleOutFile, measureBundles } from "./bundle/measure.mjs";
import { machineInfo } from "./lib/machine.mjs";
import { applyPhase4, bundleSummary, ssrSummary } from "./lib/phase4-md.mjs";
import { renderReport } from "./lib/report.mjs";
import { measureSsr, ssrOutFile } from "./ssr/measure.mjs";

const benchRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(benchRoot, "..");
const args = new Set(process.argv.slice(2));

function version(name) {
  return JSON.parse(readFileSync(join(benchRoot, "node_modules", name, "package.json"), "utf8")).version;
}

const versions = {
  "@chartkitdev/core": JSON.parse(readFileSync(join(repoRoot, "packages/core/package.json"), "utf8")).version,
  uplot: version("uplot"),
  "chart.js": version("chart.js"),
  recharts: version("recharts"),
  echarts: version("echarts"),
  "@nivo/bar": version("@nivo/bar"),
  "@nivo/boxplot": version("@nivo/boxplot"),
  "@nivo/bullet": version("@nivo/bullet"),
  "@nivo/funnel": version("@nivo/funnel"),
  "@nivo/heatmap": version("@nivo/heatmap"),
  "@nivo/line": version("@nivo/line"),
  "@nivo/pie": version("@nivo/pie"),
  "@nivo/radar": version("@nivo/radar"),
  "@nivo/radial-bar": version("@nivo/radial-bar"),
  "@nivo/sankey": version("@nivo/sankey"),
  "@nivo/scatterplot": version("@nivo/scatterplot"),
  "@nivo/stream": version("@nivo/stream"),
  "@nivo/sunburst": version("@nivo/sunburst"),
  "@nivo/treemap": version("@nivo/treemap"),
  "@observablehq/plot": version("@observablehq/plot"),
  highcharts: version("highcharts"),
  "plotly.js-dist-min": version("plotly.js-dist-min"),
  victory: version("victory"),
  "@visx/visx": version("@visx/visx"),
  apexcharts: version("apexcharts"),
  "@tremor/react": version("@tremor/react"),
  "vega-lite": version("vega-lite"),
  "ag-charts-community": version("ag-charts-community"),
  "ag-charts-enterprise": version("ag-charts-enterprise"),
  "@amcharts/amcharts5": version("@amcharts/amcharts5"),
  "lightweight-charts": version("lightweight-charts"),
  "@mui/x-charts": version("@mui/x-charts"),
  "@mui/material": version("@mui/material"),
  mermaid: version("mermaid"),
  "@antv/g2": version("@antv/g2"),
  react: version("react"),
  "react-dom": version("react-dom"),
  esbuild: version("esbuild"),
  playwright: version("playwright"),
};

const skip = {
  bundle: args.has("--skip-bundle"),
  browser: args.has("--skip-browser"),
  ssr: args.has("--skip-ssr"),
  agent: args.has("--skip-agent"),
};

const result = {
  machine: machineInfo(),
  commit: gitCommit(repoRoot),
  versions,
  command: `node bench/run.mjs${process.argv.slice(2).length ? ` ${process.argv.slice(2).join(" ")}` : ""}`,
};

if (!skip.bundle) {
  console.log("bundle");
  result.bundle = await measureBundles();
  result.bundle.summary = bundleSummary(result.bundle);
  writeMatrix(bundleOutFile(result.bundle), result.bundle);
} else {
  const saved = join(benchRoot, "results/bundle.json");
  if (existsSync(saved)) {
    result.bundle = JSON.parse(readFileSync(saved, "utf8"));
    console.log("loaded bench/results/bundle.json");
  }
}
if (!skip.ssr) {
  console.log("ssr");
  result.ssr = await measureSsr();
  result.ssr.summary = ssrSummary(result.ssr);
  writeMatrix(ssrOutFile(result.ssr), result.ssr);
}
if (result.bundle && result.ssr && !result.bundle.filtered && !result.ssr.filtered) {
  const benchmarks = join(repoRoot, "BENCHMARKS.md");
  const next = applyPhase4(readFileSync(benchmarks, "utf8"), {
    bundle: result.bundle,
    ssr: result.ssr,
    meta: { measuredAt: result.machine.measuredAt, commit: result.commit, node: result.machine.node },
  });
  if (!next.includes("Phase 4 measures every gallery type") || !next.includes("bench/results/bundle.json")) {
    throw new Error("BENCHMARKS.md phase 4 captions did not apply");
  }
  writeFileSync(benchmarks, next);
  console.log("updated BENCHMARKS.md phase 4 captions");
}
if (!skip.browser) {
  console.log("browser");
  result.browser = await measureBrowser();
}
if (!skip.agent) {
  console.log("agent");
  result.agent = await (await loadRunAgent())({ tasks });
} else {
  result.agent = {
    status: "not yet run",
    reason: "Skipped with --skip-agent. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY and run without that flag. The publishable token matrix is npm run bench:agent-matrix.",
    taskCount: tasks.length,
  };
}

if (result.browser?.charts) writePaint(result);

if (!result.bundle || !result.browser || !result.ssr) {
  console.log("Partial run. The full generated BENCHMARKS.md is written only when bundle, browser, and ssr all run. Phase 4 captions are updated when both of those finish.");
  mkdirSync(join(benchRoot, "results"), { recursive: true });
  writeFileSync(join(benchRoot, "results/partial.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ wrote: "bench/results/partial.json", agent: result.agent?.status ?? null }, null, 2));
} else {
  const markdown = renderReport(result);
  mkdirSync(join(benchRoot, "results"), { recursive: true });
  writeFileSync(join(benchRoot, "results/latest.json"), JSON.stringify(result, null, 2));
  writeFileSync(join(repoRoot, "BENCHMARKS.md"), markdown);
  console.log("wrote BENCHMARKS.md and bench/results/latest.json");
}
await stop();

function gitCommit(root) {
  try {
    return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function writeMatrix(name, section) {
  const payload = {
    measuredAt: result.machine.measuredAt,
    commit: result.commit,
    node: result.machine.node,
    versions: result.versions,
    ...section,
  };
  mkdirSync(join(benchRoot, "results"), { recursive: true });
  writeFileSync(join(benchRoot, "results", name), JSON.stringify(payload, null, 2));
  console.log(`wrote bench/results/${name}`);
}

function writePaint(result) {
  const browser = result.browser;
  const smoke = browser.samples !== 5;
  const name = smoke ? "paint-smoke.json" : "paint.json";
  const payload = {
    kind: smoke ? "smoke" : "median",
    disclaimer: smoke
      ? "Not a published median. BENCH_SAMPLES was not 5. Do not map these timings onto the homepage."
      : "Median of 5 fresh pages. Homepage hover-steady numbers are a different protocol and stay in catalog/public/benchmarks.json.",
    measuredAt: result.machine?.measuredAt ?? null,
    samples: browser.samples,
    chartMethod: browser.chartMethod ?? null,
    paintSchema: browser.paintSchema ?? null,
    charts: browser.charts,
  };
  mkdirSync(join(benchRoot, "results"), { recursive: true });
  writeFileSync(join(benchRoot, "results", name), JSON.stringify(payload, null, 2));
  console.log(`wrote bench/results/${name}`);
}

async function loadRunAgent() {
  const outfile = join(benchRoot, ".out/agent-suite.mjs");
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(benchRoot, "agent/suite.mjs")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    external: ["esbuild", "playwright"],
    logLevel: "silent",
  });
  const suite = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  return suite.runAgent;
}
