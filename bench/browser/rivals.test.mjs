import assert from "node:assert/strict";
import test from "node:test";
import { browserAdapters } from "./adapters.mjs";
import { GALLERY_TYPES, chartTypeDefs } from "./chart-types.mjs";
import { RIVAL_LIBS, rivalAdapters, rivalMatrix, unsupportedPaintCells } from "./rivals.mjs";

const LINE_IDS = ["uplot", "chartjs", "echarts", "recharts", "nivo", "plot"];

test("every gallery type has one decision per timed rival", () => {
  const matrix = rivalMatrix();
  assert.equal(matrix.length, GALLERY_TYPES.length * RIVAL_LIBS.length);
  const seen = new Set();
  for (const row of matrix) {
    const key = `${row.libraryId}:${row.chart}`;
    assert.equal(seen.has(key), false);
    seen.add(key);
    assert.ok(row.method && row.method.length > 12);
    assert.ok(row.status === "native" || row.status === "unsupported");
    if (row.status === "native") assert.ok(row.adapterId);
    else assert.equal(row.adapterId, null);
  }
  for (const chart of GALLERY_TYPES) {
    for (const lib of RIVAL_LIBS) assert.equal(seen.has(`${lib.id}:${chart}`), true);
  }
});

test("native cells other than line are adapters at the ChartKit point count", () => {
  const matrix = rivalMatrix();
  const adapters = rivalAdapters();
  const byId = new Map(adapters.map((adapter) => [adapter.id, adapter]));
  const defs = new Map(chartTypeDefs.map((def) => [def.id, def]));
  const native = matrix.filter((row) => row.status === "native");
  const line = native.filter((row) => row.chart === "line");
  assert.deepEqual(line.map((row) => row.adapterId).sort(), [...LINE_IDS].sort());
  assert.equal(adapters.length, native.length - line.length);
  for (const row of native) {
    if (row.chart === "line") {
      assert.equal(byId.has(row.adapterId), false);
      continue;
    }
    const adapter = byId.get(row.adapterId);
    assert.ok(adapter, row.adapterId);
    assert.equal(adapter.chart, row.chart);
    assert.equal(adapter.library, row.library);
    assert.deepEqual(adapter.sizes, defs.get(row.chart).sizes);
    assert.equal(adapter.method, row.method);
    assert.equal(adapter.suite, "chart-types");
    if (row.libraryId === "nivo" && row.chart === "scatter") assert.equal(adapter.renderer, "canvas");
    assert.ok(adapter.source.includes("makeChartData"));
    assert.ok(adapter.source.includes("requestAnimationFrame"));
  }
  const ids = adapters.map((adapter) => adapter.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("unsupported cells carry a reason and no time", () => {
  const cells = unsupportedPaintCells();
  const matrix = rivalMatrix().filter((row) => row.status === "unsupported");
  const expected = [];
  const defs = new Map(chartTypeDefs.map((def) => [def.id, def]));
  for (const row of matrix) expected.push(...defs.get(row.chart).sizes.map((points) => `${row.libraryId}:${row.chart}:${points}`));
  const got = cells.map((cell) => {
    const lib = RIVAL_LIBS.find((item) => item.library === cell.library);
    return `${lib.id}:${cell.chart}:${cell.points}`;
  });
  assert.deepEqual(got.sort(), expected.sort());
  for (const cell of cells) {
    assert.equal(cell.status, "unsupported");
    assert.equal(cell.initialMs, null);
    assert.equal(cell.updateMs, null);
    assert.equal(cell.samples, 0);
    assert.equal(cell.gzipBytes, null);
    assert.equal(cell.ssrMs, null);
    assert.ok(cell.method.length > 12);
  }
  const onlyBar = unsupportedPaintCells({ only: new Set(["chartjs-bar"]), types: new Set(["funnel"]) });
  assert.equal(onlyBar.length, 1);
  assert.equal(onlyBar[0].library, "Chart.js");
  assert.equal(onlyBar[0].chart, "funnel");
});

test("line rivals project into the type matrix and stand-ins stay unsupported", () => {
  for (const id of LINE_IDS) {
    const adapter = browserAdapters.find((item) => item.id === id);
    assert.equal(adapter.chart, "line");
    assert.equal(adapter.homepageRow, "line");
  }
  const native = new Set(rivalMatrix().filter((row) => row.status === "native").map((row) => `${row.libraryId}:${row.chart}`));
  const unsupported = new Set(rivalMatrix().filter((row) => row.status === "unsupported").map((row) => `${row.libraryId}:${row.chart}`));
  for (const chart of ["spike", "waterfall", "venn", "kpi", "sparkline", "gantt", "journey", "quadrant", "timeline", "bar-list", "progress-ring"]) {
    for (const lib of RIVAL_LIBS) assert.equal(native.has(`${lib.id}:${chart}`), false, `${lib.id} ${chart}`);
  }
  assert.equal(native.has("nivo:bullet"), true);
  assert.equal(unsupported.has("uplot:bullet"), true);
  assert.equal(native.has("plot:histogram"), true);
  assert.equal(unsupported.has("chartjs:histogram"), true);
  assert.equal(unsupported.has("uplot:stacked-area"), true);
  assert.equal(native.has("chartjs:stacked-area"), true);
  assert.equal(native.has("nivo:stacked-area"), true);
  assert.equal(native.has("echarts:candlestick"), true);
  assert.equal(unsupported.has("uplot:candlestick"), true);
  assert.equal(native.has("nivo:heatmap"), true);
  assert.equal(unsupported.has("plot:combo"), true);
  assert.equal(native.has("echarts:combo"), true);
  assert.equal(native.has("chartjs:donut"), true);
  assert.equal(unsupported.has("uplot:donut"), true);
  assert.equal(unsupported.has("plot:pie"), true);
  assert.equal(native.has("recharts:errorbar"), true);
  assert.equal(native.has("uplot:area-range"), true);
  assert.equal(unsupported.has("echarts:bar-range"), true);
  assert.equal(native.has("chartjs:rose"), true);
  assert.equal(native.has("echarts:rose"), true);
  assert.equal(browserAdapters.some((adapter) => adapter.id === "chartkit-bar"), true);
  assert.equal(browserAdapters.some((adapter) => adapter.id === "chartjs-bar"), true);
});
