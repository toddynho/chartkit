import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { efficiencyFromRows } from "../lib/efficiency.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = join(here, "../.out/agent-suite.mjs");
mkdirSync(dirname(outfile), { recursive: true });
await build({
  entryPoints: [join(here, "suite.mjs")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  external: ["esbuild", "playwright"],
  logLevel: "silent",
});
const suite = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);

test("supplementary suite is tracked apart from the 42-task set", () => {
  const ids = [
    "canvas-sensor",
    "navigator-pageviews",
    "synced-cpu",
    "drilldown-region",
    "facet-temperatures",
    "concat-dashboard",
    "breakpoint-legend",
    "rtl",
    "mermaid",
    "waterfall",
    "boxplot",
    "world-renewables",
    "city-bubbles",
    "sankey-funnel",
  ];
  assert.equal(suite.suppTasks.length, ids.length);
  assert.deepEqual(suite.suppTasks.map((task) => task.id), ids);
  const main = new Set(suite.tasks.map((task) => task.id));
  for (const task of suite.suppTasks) {
    assert.equal(main.has(task.id), false);
    assert.ok(task.prompt.length > 20);
    assert.ok(task.data !== undefined);
    assert.equal(task.expect.type, task.type);
    assert.equal(typeof task.expect.feature, "string");
  }
});

test("task set spans every v1 chart type", () => {
  assert.ok(suite.tasks.length >= 30 && suite.tasks.length <= 50);
  const ids = new Set(suite.tasks.map((task) => task.id));
  assert.equal(ids.size, suite.tasks.length);
  for (const type of suite.CHART_TYPES) {
    assert.ok(suite.tasks.some((task) => task.type === type), type);
  }
  for (const task of suite.tasks) {
    assert.ok(task.prompt.length > 20);
    assert.ok(task.data !== undefined);
    assert.equal(task.expect.type, task.type);
  }
});

test("extracts JSON from a fenced reply", () => {
  const spec = suite.extractJson('```json\n{"version":"1","type":"line"}\n```');
  assert.equal(spec.type, "line");
});

test("a valid line spec passes validate, render, type, and fields", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const spec = {
    version: "1",
    type: "line",
    data: task.data,
    encoding: { x: "month", y: "revenue" },
    a11y: { alt: "Revenue rose, then eased." },
  };
  const result = suite.checkChartKit(spec, task);
  assert.equal(result.ok, true, JSON.stringify(result.stages));
});

test("a spec that fails validation does not count as a render success", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const result = suite.checkChartKit({ version: "1", type: "line", data: task.data }, task);
  assert.equal(result.ok, false);
  assert.equal(result.stages.validate.ok, false);
});

test("the wrong chart type fails the type stage", () => {
  const task = suite.tasks.find((item) => item.id === "bar-signups");
  const spec = {
    version: "1",
    type: "line",
    data: task.data,
    encoding: { x: "month", y: "signups" },
    a11y: { alt: "Signups by month." },
  };
  const result = suite.checkChartKit(spec, task);
  assert.equal(result.stages.type.ok, false);
  assert.equal(result.ok, false);
});

test("code libraries must admit a chart they cannot draw", () => {
  const task = suite.tasks.find((item) => item.id === "candle-down");
  const honest = suite.scoreModule({ meta: { unsupported: true, reason: "no candles" }, render() { return ""; } }, task, "chartjs");
  assert.equal(honest.ok, true);
  assert.equal(honest.status, "unsupported");
  const invented = suite.scoreModule({ meta: { type: "bar" }, render() { return "<svg>20</svg>"; } }, task, "chartjs");
  assert.equal(invented.ok, false);
});

test("a compiled module scores a supported chart from the rendered type", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const result = suite.scoreModule({
    meta: { type: "BarChart", values: [1] },
    render() { return '<svg><path d="M0 0" /><text>120</text><text>150</text><text>132</text></svg>'; },
  }, task, "recharts", { facts: { chartTypes: ["LineChart"] } });
  assert.equal(result.ok, true, JSON.stringify(result.stages));
  assert.equal(result.stages.type.actual, "LineChart");
});

test("meta.type does not satisfy the type stage", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const svg = '<svg><path d="M0 0" /><text>120</text><text>150</text><text>132</text></svg>';
  const unread = suite.scoreModule({
    meta: { type: "LineChart" },
    render() { return svg; },
  }, task, "recharts", { facts: { rechartsMarks: 1, plotted: [120, 150, 132] } });
  assert.equal(unread.stages.type.ok, false);
  assert.equal(unread.stages.type.actual, null);
  const wrong = suite.scoreModule({
    meta: { type: "LineChart" },
    render() { return svg; },
  }, task, "recharts", { facts: { chartTypes: ["BarChart"], rechartsMarks: 1, plotted: [120, 150, 132] } });
  assert.equal(wrong.stages.type.ok, false);
  assert.equal(wrong.stages.type.actual, "BarChart");
});

test("chartkit values match as numbers, not substrings", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const spec = {
    version: "1",
    type: "line",
    data: [{ month: "Jan", revenue: 12 }, { month: "Feb", revenue: 100 }, { month: "Mar", revenue: 132 }],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt: "Revenue is not the digit 1." },
  };
  const narrowed = { ...task, expect: { ...task.expect, values: [1, 120, 150] } };
  const result = suite.checkChartKit(spec, narrowed);
  assert.equal(result.stages.values.ok, false);
  const gauge = suite.tasks.find((item) => item.id === "gauge-done");
  const wide = suite.checkChartKit({
    version: "1",
    type: "gauge",
    metric: { value: 720, min: 0, max: 100 },
    a11y: { alt: "Completion is not 72." },
  }, gauge);
  assert.equal(wide.stages.values.ok, false);
  assert.equal(suite.checkChartKit({
    version: "1",
    type: "gauge",
    metric: { value: 72, min: 0, max: 100 },
    a11y: { alt: "Completion is 72 percent." },
  }, gauge).stages.values.ok, true);
});

test("a module that throws fails the render stage", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const result = suite.scoreModule({
    meta: { type: "LineChart" },
    render() { throw new Error("boom"); },
  }, task, "recharts");
  assert.equal(result.ok, false);
  assert.match(result.stages.render.error, /boom/);
});

test("without an API key the runner reports not yet run", async () => {
  const result = await suite.runAgent({ env: {}, tasks: suite.tasks.slice(0, 1) });
  assert.equal(result.status, "not yet run");
  assert.match(result.reason, /not yet run/);
});

test("a fake model reply is scored and is not written as a live result", async () => {
  const task = suite.tasks.find((item) => item.id === "gauge-done");
  const result = await suite.runAgent({
    env: { OPENAI_API_KEY: "test", BENCH_LLM_PROVIDER: "openai", BENCH_LIBRARIES: "chartkit" },
    tasks: [task],
    ask: async () => JSON.stringify({
      version: "1",
      type: "gauge",
      metric: { value: 72, min: 0, max: 100 },
      a11y: { alt: "Completion is 72 percent." },
    }),
  });
  assert.equal(result.status, "ok");
  assert.equal(result.results[0].library, "chartkit");
  assert.equal(result.results[0].ok, true, JSON.stringify(result.results[0].stages));
  assert.equal(result.results[0].second, null);
  assert.equal(result.repair.passedWithinTwo, 1);
});

test("extracts a typescript fence", () => {
  const source = suite.extractModule("```ts\nexport const meta = { unsupported: true };\n```");
  assert.match(source, /unsupported/);
});

test("library use requires the imported binding to be called", () => {
  const used = suite.libraryUse('import { LineChart } from "recharts";\nexport function render(){ return LineChart; }\n', "recharts");
  assert.equal(used.imports, true);
  assert.equal(used.uses, true);
  const unused = suite.libraryUse('import { LineChart } from "recharts";\nexport function render(){ return "<svg></svg>"; }\n', "recharts");
  assert.equal(unused.imports, true);
  assert.equal(unused.uses, false);
  const missing = suite.libraryUse('export function render(){ return "<svg></svg>"; }\n', "recharts");
  assert.equal(missing.imports, false);
});

test("a hand-written SVG does not pass for a code library", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const source = 'export function render(){ return "<svg>120 150 132</svg>"; }\nexport const meta = { type: "LineChart", values: [120, 150, 132] };';
  const result = suite.scoreModule({
    meta: { type: "LineChart", values: [120, 150, 132] },
    render() { return "<svg>120 150 132</svg>"; },
  }, task, "recharts", { source });
  assert.equal(result.ok, false);
  assert.equal(result.stages.library.ok, false);
});

test("an empty recharts wrapper does not pass", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const source = 'import { LineChart } from "recharts";\nexport function render(){ return LineChart; }\nexport const meta = { type: "LineChart", values: [120, 150, 132] };';
  const rendered = '<div class="recharts-wrapper">120 150 132</div>';
  const result = suite.scoreModule({
    meta: { type: "LineChart", values: [120, 150, 132] },
    render() { return rendered; },
  }, task, "recharts", { source, rendered, facts: { plotted: [] } });
  assert.equal(result.ok, false, JSON.stringify(result.stages));
  assert.equal(result.stages.library.ok, false);
  assert.equal(result.stages.values.ok, false);
});

test("recharts passes from drawn marks and plotted data, not meta", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const source = 'import { LineChart } from "recharts";\nexport function render(){ return LineChart; }\n';
  const rendered = '<div class="recharts-wrapper"><svg class="recharts-surface"><path class="recharts-line-curve" /></svg></div>';
  const result = suite.scoreModule({
    meta: { type: "LineChart", values: [1, 2, 3] },
    render() { return rendered; },
  }, task, "recharts", {
    source,
    rendered,
    facts: { rechartsMarks: 1, rechartsSurface: 1, plotted: [120, 150, 132], chartTypes: ["LineChart"] },
  });
  assert.equal(result.ok, true, JSON.stringify(result.stages));
});

test("chart.js needs a browser and echarts SSR init does not", () => {
  assert.equal(suite.needsBrowser("chartjs", 'import Chart from "chart.js/auto";\nnew Chart();\n'), true);
  assert.equal(suite.needsBrowser("echarts", 'echarts.init(null, null, { renderer: "svg", ssr: true })'), false);
  assert.equal(suite.needsBrowser("echarts", 'echarts.init(document.getElementById("c"))'), true);
  assert.equal(suite.needsBrowser("recharts", 'import { LineChart } from "recharts";'), true);
});

test("validator errors are fed back once", async () => {
  const task = suite.tasks.find((item) => item.id === "gauge-done");
  let calls = 0;
  const result = await suite.runAgent({
    env: { OPENAI_API_KEY: "test", BENCH_LLM_PROVIDER: "openai", BENCH_LIBRARIES: "chartkit" },
    tasks: [task],
    ask: async (_selected, prompt) => {
      calls += 1;
      if (calls === 1) return JSON.stringify({ version: "1", type: "gauge", a11y: { alt: "Completion." } });
      assert.match(prompt, /Validator errors/);
      assert.match(prompt, /CK1003/);
      return JSON.stringify({
        version: "1",
        type: "gauge",
        metric: { value: 72, min: 0, max: 100 },
        a11y: { alt: "Completion is 72 percent." },
      });
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.results[0].ok, false);
  assert.equal(result.results[0].second.ok, true);
  assert.equal(result.repair.recovered, 1);
  assert.equal(result.repair.passedWithinTwo, 1);
});

test("a wrong chart type is not sent back for repair", async () => {
  const task = suite.tasks.find((item) => item.id === "bar-signups");
  let calls = 0;
  const result = await suite.runAgent({
    env: { OPENAI_API_KEY: "test", BENCH_LLM_PROVIDER: "openai", BENCH_LIBRARIES: "chartkit" },
    tasks: [task],
    ask: async () => {
      calls += 1;
      return JSON.stringify({
        version: "1",
        type: "line",
        data: task.data,
        encoding: { x: "month", y: "signups" },
        a11y: { alt: "Signups by month." },
      });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.results[0].ok, false);
  assert.equal(result.results[0].second, null);
  assert.equal(suite.shouldRepair(result.results[0]), false);
});

test("a finished checkpoint row is not asked again", async () => {
  const task = suite.tasks.find((item) => item.id === "gauge-done");
  const log = join(tmpdir(), `chartkit-agent-${Date.now()}.jsonl`);
  writeFileSync(log, `${JSON.stringify({ id: task.id, library: "chartkit", ok: true, output: "cached" })}\n`);
  let calls = 0;
  const result = await suite.runAgent({
    env: { OPENAI_API_KEY: "test", BENCH_LLM_PROVIDER: "openai", BENCH_LIBRARIES: "chartkit", BENCH_AGENT_LOG: log },
    tasks: [task],
    ask: async () => { calls += 1; return "{}"; },
  });
  assert.equal(calls, 0);
  assert.equal(result.results[0].output, "cached");
});

test("a recharts JSX module resolves from bench/node_modules", async () => {
  const task = suite.tasks.find((item) => item.id === "bar-signups");
  const source = [
    'import { BarChart, Bar, XAxis, YAxis } from "recharts";',
    'import { renderToStaticMarkup } from "react-dom/server";',
    "const data = [{ month: \"Jan\", signups: 100 }, { month: \"Feb\", signups: 180 }, { month: \"Mar\", signups: 150 }];",
    "export function render() {",
    "  return renderToStaticMarkup(",
    "    <BarChart width={120} height={80} data={data}><XAxis dataKey=\"month\" /><YAxis /><Bar dataKey=\"signups\" /></BarChart>",
    "  );",
    "}",
    'export const meta = { type: "BarChart", values: [100, 180, 150] };',
  ].join("\n");
  const mod = await suite.importModule(source);
  const rendered = String(mod.render());
  assert.match(rendered, /recharts-wrapper/);
  assert.doesNotMatch(rendered, /<svg[\s>]/);
  const result = suite.scoreModule(mod, task, "recharts", { source, rendered, facts: {} });
  assert.equal(result.stages.library.ok, false, JSON.stringify(result.stages));
});

test("heat-sales accepts either axis orientation and heat-load does not", () => {
  const sales = suite.tasks.find((item) => item.id === "heat-sales");
  const swapped = {
    version: "1",
    type: "heatmap",
    data: sales.data,
    encoding: { x: "city", y: "month", color: "sales" },
    a11y: { alt: "Sales by city and month." },
  };
  assert.equal(suite.checkChartKit(swapped, sales).ok, true, JSON.stringify(suite.checkChartKit(swapped, sales).stages));
  const named = {
    ...swapped,
    encoding: { x: "month", y: "city", color: "sales" },
  };
  assert.equal(suite.checkChartKit(named, sales).ok, true);
  const load = suite.tasks.find((item) => item.id === "heat-load");
  const flipped = {
    version: "1",
    type: "heatmap",
    data: load.data,
    encoding: { x: "day", y: "hour", color: "load" },
    a11y: { alt: "Load by hour and weekday." },
  };
  assert.equal(suite.checkChartKit(flipped, load).stages.fields.ok, false);
});

test("no-docs prompts name the npm package and give each library one paragraph", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const chartkit = suite.chartkitPrompt(task);
  assert.match(chartkit, /encoding\.x/);
  assert.doesNotMatch(chartkit, /metric: \{ value, min, max/);
  assert.doesNotMatch(chartkit, /Official reference/);
  const chartjs = suite.codePrompt(task, "chartjs");
  assert.match(chartjs, /npm package "chart\.js"/);
  assert.match(chartjs, /painted pixels/);
  assert.match(chartjs, /register every scale/);
  assert.doesNotMatch(chartjs, /using chartjs\b/);
  const recharts = suite.codePrompt(task, "recharts");
  assert.match(recharts, /flushSync/);
  assert.match(recharts, /renderToStaticMarkup/);
  const official = suite.promptFor(task, "echarts", "official");
  assert.match(official, /Official reference/);
  assert.match(official, /renderToSVGString/);
  const plain = suite.promptFor(task, "echarts", "none");
  assert.doesNotMatch(plain, /Official reference/);
  const manifest = suite.docsManifest();
  const byName = Object.fromEntries(manifest.map((item) => [item.library, item]));
  const lengths = [];
  for (const library of ["chartkit", "recharts", "echarts", "chartjs"]) {
    assert.ok(byName[library].bytes > 1000, library);
    assert.ok(byName[library].url, library);
    assert.ok(byName[library].bytes <= byName.chartkit.bytes, `${library} ${byName[library].bytes}`);
    lengths.push(byName[library].noDocsHint.length);
  }
  const longest = Math.max(...lengths);
  const shortest = Math.min(...lengths);
  assert.ok(longest / shortest < 1.35, lengths.join(","));
});

test("chart.js runs in Playwright and a canvas counts as use", { timeout: 120000 }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const source = [
      'import { Chart, BarController, BarElement, CategoryScale, LinearScale } from "chart.js";',
      "Chart.register(BarController, BarElement, CategoryScale, LinearScale);",
      "export function render() {",
      '  const canvas = document.createElement("canvas");',
      "  document.body.appendChild(canvas);",
      "  new Chart(canvas, { type: \"bar\", data: { labels: [\"Jan\"], datasets: [{ data: [100] }] } });",
      "  return canvas.outerHTML;",
      "}",
      'export const meta = { type: "bar", values: [100] };',
    ].join("\n");
    const executed = await suite.renderInBrowser(browser, source);
    assert.equal(executed.renderError, null, executed.renderError?.message);
    assert.ok(executed.facts.canvases > 0, JSON.stringify(executed.facts));
    assert.equal(executed.facts.canvasDrawn, true, JSON.stringify(executed.facts));
    assert.ok(executed.facts.plotted.includes(100), JSON.stringify(executed.facts.plotted));
    assert.match(executed.rendered, /<canvas/);
    const task = suite.tasks.find((item) => item.id === "bar-signups");
    const result = suite.scoreModule(executed.mod, task, "chartjs", {
      source,
      rendered: executed.rendered,
      facts: executed.facts,
    });
    assert.equal(result.stages.library.ok, true, JSON.stringify(result.stages));
    assert.equal(result.stages.render.ok, true);
    assert.equal(result.stages.type.ok, true, JSON.stringify(result.stages.type));
    assert.ok(executed.facts.chartTypes.includes("bar"), JSON.stringify(executed.facts.chartTypes));
    const blank = suite.scoreModule(executed.mod, task, "chartjs", {
      source,
      rendered: "<canvas></canvas>",
      facts: { canvases: 1, canvasDrawn: false, plotted: [100, 180, 150] },
    });
    assert.equal(blank.stages.library.ok, false);
  } finally {
    await browser.close();
  }
});

test("recharts draws an SVG in Playwright and an empty wrapper does not", { timeout: 120000 }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const source = [
      'import { createElement } from "react";',
      'import { flushSync } from "react-dom";',
      'import { createRoot } from "react-dom/client";',
      'import { LineChart, Line, XAxis, YAxis } from "recharts";',
      "export function render() {",
      '  const host = document.createElement("div");',
      "  document.body.appendChild(host);",
      "  const root = createRoot(host);",
      "  flushSync(() => root.render(createElement(LineChart, { width: 320, height: 180, data: [{ month: \"Jan\", revenue: 120 }, { month: \"Feb\", revenue: 150 }, { month: \"Mar\", revenue: 132 }] },",
      '    createElement(XAxis, { dataKey: "month" }),',
      "    createElement(YAxis),",
      '    createElement(Line, { dataKey: "revenue", isAnimationActive: false })',
      "  )));",
      "  return host.innerHTML;",
      "}",
      'export const meta = { type: "LineChart", values: [1, 2, 3] };',
    ].join("\n");
    const executed = await suite.renderInBrowser(browser, source);
    assert.equal(executed.renderError, null, executed.renderError?.message);
    assert.ok(executed.facts.rechartsMarks > 0, JSON.stringify(executed.facts));
    assert.match(executed.rendered, /<svg[\s>]/);
    const task = suite.tasks.find((item) => item.id === "line-revenue");
    const result = suite.scoreModule(executed.mod, task, "recharts", {
      source,
      rendered: executed.rendered,
      facts: executed.facts,
    });
    assert.equal(result.ok, true, JSON.stringify(result.stages));
    assert.ok(executed.facts.chartTypes.includes("LineChart"), JSON.stringify(executed.facts.chartTypes));
  } finally {
    await browser.close();
  }
});

test("echarts node SVG keeps series numbers off meta", async () => {
  const source = [
    'import * as echarts from "echarts";',
    "export function render() {",
    '  const chart = echarts.init(null, null, { renderer: "svg", ssr: true, width: 320, height: 180 });',
    "  chart.setOption({ animation: false, xAxis: { type: \"category\", data: [\"Jan\", \"Feb\", \"Mar\"] }, yAxis: { type: \"value\" }, series: [{ type: \"bar\", data: [120, 150, 132] }] });",
    "  return chart.renderToSVGString();",
    "}",
    'export const meta = { type: "bar", values: [1] };',
  ].join("\n");
  globalThis.__ckPlotted = [];
  const mod = await suite.importModule(source);
  globalThis.__ckPlotted = [];
  const rendered = String(mod.render());
  assert.match(rendered, /<svg[\s>]/);
  assert.match(rendered, /<(?:path|rect)\b/);
  const { typesFromOption } = await import("./capture.mjs");
  const plotted = [];
  const chartTypes = [];
  for (const option of globalThis.__ckPlotted ?? []) {
    const series = option.series ?? [];
    for (const item of series) {
      for (const value of item.data ?? []) if (typeof value === "number") plotted.push(value);
    }
    for (const type of typesFromOption(option)) {
      if (!chartTypes.includes(type)) chartTypes.push(type);
    }
  }
  assert.deepEqual(plotted, [120, 150, 132]);
  assert.deepEqual(chartTypes, ["bar"]);
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const result = suite.scoreModule(mod, task, "echarts", {
    source,
    rendered,
    facts: { plotted, chartTypes },
  });
  assert.equal(result.stages.library.ok, true, JSON.stringify(result.stages));
  assert.equal(result.stages.values.ok, true, JSON.stringify(result.stages));
  assert.equal(result.stages.type.ok, false, JSON.stringify(result.stages.type));
  assert.equal(result.stages.type.actual, "bar");
});

test("scatter points keep both x and y", async () => {
  const { numbersFromOption } = await import("./capture.mjs");
  assert.deepEqual(
    numbersFromOption({ series: [{ data: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }] }),
    [1, 2, 3, 4],
  );
  assert.deepEqual(numbersFromOption({ series: [{ data: [100, 180] }] }), [100, 180]);
});

test("efficiency uses first-try output tokens and repairs only ChartKit", () => {
  const rows = [
    {
      library: "chartkit",
      usage: { output_tokens: 10 },
      output: JSON.stringify({
        version: "1",
        type: "gauge",
        data: { value: 40, min: 0, max: 80 },
        a11y: { alt: "Load is 40 out of 80." },
      }),
    },
    {
      library: "chartkit",
      usage: { output_tokens: 30 },
      second: { usage: { output_tokens: 900 } },
      output: "not json",
    },
    { library: "recharts", usage: { output_tokens: 20 }, output: "x" },
    { library: "echarts", output: "x" },
    { library: "chartjs", usage: { output_tokens: 40 }, output: "x" },
  ];
  const stats = Object.fromEntries(efficiencyFromRows(rows, suite.repair).map((row) => [row.library, row]));
  assert.equal(stats.chartkit.meanOutput, 20);
  assert.equal(stats.chartkit.repairPassed, 1);
  assert.equal(stats.chartkit.repairChecked, 2);
  assert.equal(stats.recharts.repairLabel, "no repair()");
  assert.equal(stats.echarts.meanOutput, null);
  assert.equal(stats.echarts.tokenRows, 0);
});

test("chartkit drawn shapes reject bars outside the plot", () => {
  const task = suite.tasks.find((item) => item.id === "combo-orders");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240"><defs><clipPath id="c"><rect x="52" y="34" width="536" height="174" /></clipPath></defs><g clip-path="url(#c)"><rect x="80" y="-200" width="40" height="500" /><rect x="200" y="40" width="40" height="80" /><path d="M0 0" fill="none" stroke="#000" /></g></svg>`;
  const bad = suite.chartGeometry(svg, task, { data: task.data });
  assert.equal(bad.ok, false, JSON.stringify(bad));
  assert.ok(bad.issues.some((issue) => /outside the plot/.test(issue)));
  const spec = {
    version: "1",
    type: "combo",
    data: task.data,
    encoding: {
      x: "week",
      y: [
        { field: "orders", mark: "bar" },
        { field: "conversion", mark: "line", axis: "y2" },
      ],
    },
    axes: { y2: true },
    a11y: { alt: "Orders rose and the rate rose." },
  };
  const good = suite.checkChartKit(spec, task);
  assert.equal(good.ok, true, JSON.stringify(good.stages));
  assert.equal(good.stages.marks.ok, true, JSON.stringify(good.stages.marks));
});

test("grouped bars count one rect per row per series", () => {
  const task = {
    id: "bar-grouped",
    type: "bar",
    data: [
      { month: "Jan", free: 1, pro: 2 },
      { month: "Feb", free: 3, pro: 4 },
    ],
    expect: { type: "bar", x: "month", y: ["free", "pro"], values: [1, 2, 3, 4] },
  };
  const spec = {
    version: "1",
    type: "bar",
    data: task.data,
    encoding: { x: "month", y: ["free", "pro"] },
    a11y: { alt: "Free and pro both rose." },
  };
  const result = suite.checkChartKit(spec, task);
  assert.equal(result.ok, true, JSON.stringify(result.stages));
  const combo = {
    id: "combo-two-bars",
    type: "combo",
    data: [
      { month: "Jan", free: 4, pro: 2, rate: 0.2 },
      { month: "Feb", free: 5, pro: 3, rate: 0.4 },
    ],
    expect: { type: "combo", x: "month", y: ["free", "pro", "rate"], values: [4, 2, 0.2, 5, 3, 0.4] },
  };
  const comboSpec = {
    version: "1",
    type: "combo",
    data: combo.data,
    encoding: {
      x: "month",
      y: [
        { field: "free", mark: "bar" },
        { field: "pro", mark: "bar" },
        { field: "rate", mark: "line", axis: "y2" },
      ],
    },
    axes: { y2: true },
    a11y: { alt: "Free and pro rose, and the rate rose." },
  };
  const comboResult = suite.checkChartKit(comboSpec, combo);
  assert.equal(comboResult.ok, true, JSON.stringify(comboResult.stages));
});

test("a valid spec for every task passes the drawn-shape check", () => {
  for (const task of suite.tasks) {
    const result = suite.checkChartKit(specFor(task), task);
    assert.equal(result.ok, true, `${task.id} ${JSON.stringify(result.stages)}`);
  }
});

function specFor(task) {
  const base = { version: "1", type: task.type, a11y: { alt: "The chart shows the recorded values." } };
  if (task.data && !Array.isArray(task.data) && task.data.value !== undefined) return { ...base, metric: task.data };
  if (task.type === "sparkline" || task.type === "mini-area") return { ...base, data: task.data };
  if (task.type === "candlestick") {
    return {
      ...base,
      data: task.data,
      encoding: { x: task.expect.x, open: "open", high: "high", low: "low", close: "close" },
    };
  }
  if (task.type === "heatmap") {
    const encoding = { x: task.expect.x, color: task.expect.color };
    if (task.expect.y) encoding.y = task.expect.y;
    return { ...base, data: task.data, encoding };
  }
  if (task.type === "combo") {
    const [bars, line] = task.expect.y;
    return {
      ...base,
      data: task.data,
      encoding: {
        x: task.expect.x,
        y: [
          { field: bars, mark: "bar" },
          { field: line, mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: true },
    };
  }
  return { ...base, data: task.data, encoding: { x: task.expect.x, y: task.expect.y } };
}

after(async () => {
  // Registered after the top-level await so it runs once every test is done.
  // esbuild's service and the worker's stdout socket otherwise keep the loop open.
  // package.json passes --test-force-exit so the runner still exits if stop() does not.
  const { stop } = await import("esbuild");
  await Promise.race([stop(), new Promise((resolve) => setTimeout(resolve, 500))]);
});

test("series-field bars count one rect per category per series value", () => {
  const data = [
    { month: "Jan", plan: "free", users: 4 },
    { month: "Jan", plan: "pro", users: 2 },
    { month: "Feb", plan: "free", users: 5 },
    { month: "Feb", plan: "pro", users: 3 },
    { month: "Mar", plan: "free", users: 6 },
  ];
  const task = {
    id: "bar-series",
    type: "bar",
    data,
    expect: { type: "bar", x: "month", y: "users", values: [4, 2, 5, 3, 6] },
  };
  for (const encoding of [
    { x: "month", y: "users", series: "plan" },
    { x: "month", y: "users", color: { field: "plan" } },
  ]) {
    for (const stack of [undefined, "stack"]) {
      const spec = {
        version: "1",
        type: "bar",
        data,
        encoding,
        ...(stack ? { mark: { stack } } : {}),
        a11y: { alt: "Free and pro users by month." },
      };
      assert.equal(suite.seriesBarCount(spec, "bar"), 6);
      const result = suite.checkChartKit(spec, task);
      const marks = result.stages.marks;
      const detail = JSON.stringify({ encoding, stack, marks });
      // This core draws one rect per row. A core that pivots also draws the missing pair.
      const rowBars = Array.isArray(marks.issues) && marks.issues.includes("expected 6 bars, found 5");
      assert.ok(marks.ok || rowBars, detail);
    }
  }
  assert.equal(suite.seriesBarCount({
    type: "bar",
    data,
    encoding: { x: "month", y: "users", color: "month" },
  }, "bar"), null);
  assert.equal(suite.seriesBarCount({
    type: "bar",
    data,
    encoding: { x: "month", y: "users", series: "month", color: { field: "plan" } },
  }, "bar"), 6);
  const single = suite.tasks.find((item) => item.id === "bar-region");
  const plain = suite.checkChartKit({
    version: "1",
    type: "bar",
    data: single.data,
    encoding: { x: "region", y: "sales" },
    a11y: { alt: "South leads sales." },
  }, single);
  assert.equal(plain.ok, true, JSON.stringify(plain.stages));
});
