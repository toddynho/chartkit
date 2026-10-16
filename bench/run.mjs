import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { tasks } from "./agent/tasks.mjs";
import { measureBrowser } from "./browser/measure.mjs";
import { measureBundles } from "./bundle/measure.mjs";
import { machineInfo } from "./lib/machine.mjs";
import { renderReport } from "./lib/report.mjs";
import { measureSsr } from "./ssr/measure.mjs";

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
  "@nivo/line": version("@nivo/line"),
  "@nivo/bar": version("@nivo/bar"),
  "@nivo/pie": version("@nivo/pie"),
  "@observablehq/plot": version("@observablehq/plot"),
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
  versions,
  command: `node bench/run.mjs${process.argv.slice(2).length ? ` ${process.argv.slice(2).join(" ")}` : ""}`,
};

if (!skip.bundle) {
  console.log("bundle");
  result.bundle = await measureBundles();
}
if (!skip.ssr) {
  console.log("ssr");
  result.ssr = await measureSsr();
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
    reason: "Skipped with --skip-agent. Set OPENAI_API_KEY or ANTHROPIC_API_KEY and run without that flag.",
    taskCount: tasks.length,
  };
}

if (!result.bundle || !result.browser || !result.ssr) {
  console.log("Partial run. BENCHMARKS.md is written only when bundle, browser, and ssr all run.");
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

async function loadRunAgent() {
  const outfile = join(benchRoot, ".out/agent-suite.mjs");
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(benchRoot, "agent/suite.mjs")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    external: ["esbuild"],
    logLevel: "silent",
  });
  const suite = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  return suite.runAgent;
}
