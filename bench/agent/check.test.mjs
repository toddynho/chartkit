import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = join(here, "../.out/agent-suite.mjs");
mkdirSync(dirname(outfile), { recursive: true });
await build({
  entryPoints: [join(here, "suite.mjs")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  external: ["esbuild"],
  logLevel: "silent",
});
const suite = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);

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

test("a compiled module scores a supported chart", () => {
  const task = suite.tasks.find((item) => item.id === "line-revenue");
  const result = suite.scoreModule({
    meta: { type: "LineChart", values: [120, 150, 132] },
    render() { return "<svg>120 150 132</svg>"; },
  }, task, "recharts");
  assert.equal(result.ok, true, JSON.stringify(result.stages));
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
    env: { OPENAI_API_KEY: "test", BENCH_LLM_PROVIDER: "openai" },
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
});
