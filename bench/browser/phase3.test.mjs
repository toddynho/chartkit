import assert from "node:assert/strict";
import test from "node:test";
import { chartTypeDefs } from "./chart-types.mjs";
import {
  ELEVEN_TYPES,
  PHASE3_CHARTS,
  PHASE3_LIBS,
  phase3Adapters,
  phase3Matrix,
  unsupportedPhase3Cells,
} from "./phase3.mjs";

const ELEVEN = [
  "bar-list",
  "gantt",
  "journey",
  "kpi",
  "progress-ring",
  "quadrant",
  "sparkline",
  "spike",
  "timeline",
  "venn",
  "waterfall",
];

test("phase 3 decides every new library on the eleven types and candlestick", () => {
  assert.deepEqual([...ELEVEN_TYPES], ELEVEN);
  assert.equal(PHASE3_CHARTS.size, ELEVEN.length + 1);
  const matrix = phase3Matrix();
  assert.equal(matrix.length, PHASE3_LIBS.length * PHASE3_CHARTS.size);
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
});

test("native phase 3 adapters use the ChartKit point count and the shared timer", () => {
  const matrix = phase3Matrix();
  const adapters = phase3Adapters();
  const byId = new Map(adapters.map((adapter) => [adapter.id, adapter]));
  const defs = new Map(chartTypeDefs.map((def) => [def.id, def]));
  const native = matrix.filter((row) => row.status === "native");
  assert.equal(adapters.length, native.length);
  for (const row of native) {
    const adapter = byId.get(row.adapterId);
    assert.ok(adapter, row.adapterId);
    assert.equal(adapter.chart, row.chart);
    assert.equal(adapter.library, row.library);
    assert.deepEqual(adapter.sizes, defs.get(row.chart).sizes);
    assert.equal(adapter.method, row.method);
    assert.equal(adapter.suite, "chart-types");
    assert.ok(adapter.source.includes("makeChartData"));
    assert.ok(adapter.source.includes("requestAnimationFrame"));
    assert.equal(adapter.source.includes("isSum") && row.chart !== "waterfall", false);
  }
  const ids = adapters.map((adapter) => adapter.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("unsupported phase 3 cells carry a reason and no time", () => {
  const cells = unsupportedPhase3Cells();
  for (const cell of cells) {
    assert.equal(cell.status, "unsupported");
    assert.equal(cell.initialMs, null);
    assert.equal(cell.updateMs, null);
    assert.equal(cell.samples, 0);
    assert.ok(cell.method.length > 12);
    assert.equal(PHASE3_CHARTS.has(cell.chart), true);
  }
  const native = new Set(phase3Matrix().filter((row) => row.status === "native").map((row) => `${row.library}:${row.chart}`));
  for (const cell of cells) assert.equal(native.has(`${cell.library}:${cell.chart}`), false);
  const journey = unsupportedPhase3Cells({ types: new Set(["journey"]) });
  assert.equal(journey.some((cell) => cell.library === "Mermaid"), false);
  assert.ok(journey.some((cell) => cell.library === "Victory"));
});

test("near misses stay unsupported", () => {
  const native = new Set(phase3Matrix().filter((row) => row.status === "native").map((row) => `${row.libraryId}:${row.chart}`));
  assert.equal(native.has("apexcharts:sparkline"), false);
  assert.equal(native.has("apexcharts:gantt"), false);
  assert.equal(native.has("plotly:progress-ring"), false);
  assert.equal(native.has("googlecharts:waterfall"), false);
  assert.equal(native.has("amcharts:timeline"), false);
  assert.equal(native.has("vegalite:gantt"), false);
  assert.equal(native.has("g2:progress-ring"), false);
  assert.equal(native.has("victory:journey"), false);
  for (const lib of PHASE3_LIBS) assert.equal(native.has(`${lib.id}:spike`), false);
  assert.equal(native.has("tremor:bar-list"), true);
  assert.equal(native.has("mermaid:journey"), true);
  assert.equal(native.has("plotly:waterfall"), true);
  assert.equal(native.has("lightweight:candlestick"), true);
});
