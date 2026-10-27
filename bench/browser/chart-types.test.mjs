import assert from "node:assert/strict";
import test from "node:test";
import { chartSpec } from "./chart-specs.mjs";
import { GALLERY_TYPES, chartTypeDefs, classifyStatus } from "./chart-types.mjs";
import { makeChartData } from "../lib/shapes.mjs";

test("gallery types are the chart matrix plus the projected line", () => {
  const ids = chartTypeDefs.map((def) => def.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids, "line"].sort(), [...GALLERY_TYPES].sort());
  assert.equal(GALLERY_TYPES.length, 35);
  assert.equal(chartTypeDefs.find((def) => def.id === "stacked-area").homepageRow, "area");
  assert.equal(chartTypeDefs.find((def) => def.id === "donut").homepageRow, "donut");
  assert.equal(chartTypeDefs.some((def) => def.id === "area"), false);
});

test("classifyStatus keeps blocked and unsupported distinct from errors", () => {
  assert.equal(classifyStatus("unsupported: venn draws at most three sets"), "unsupported");
  assert.equal(classifyStatus("page.evaluate: blocked: license key missing"), "blocked");
  assert.equal(classifyStatus("Timeout 180000ms exceeded"), "timeout");
  assert.equal(classifyStatus("render failed: Maximum call stack size exceeded"), "error");
});

test("data shapes match the published point counts", () => {
  const stacked = makeChartData("stacked-area", 1000, 1);
  assert.equal(stacked.data.columns.x.length, 1000);
  assert.equal(stacked.data.columns.d.length, 1000);
  const heat = makeChartData("heatmap", 1200, 1);
  assert.equal(heat.data.length, 1200);
  assert.equal(new Set(heat.data.map((row) => row.x)).size, 40);
  assert.equal(new Set(heat.data.map((row) => row.y)).size, 30);
  const box = makeChartData("boxplot", 1000, 1);
  assert.equal(new Set(box.data.columns.group).size, 8);
  const kpi = makeChartData("kpi", 1, 1);
  assert.equal(kpi.data.length, 24);
  assert.equal(typeof kpi.metric.value, "number");
  const sun = makeChartData("sunburst", 48, 1);
  const leaves = sun.data.reduce((sum, branch) => sum + branch.children.length, 0);
  assert.equal(leaves, 48);
  const sankey = makeChartData("sankey", 48, 1);
  assert.equal(sankey.data.length, 48);
  const water = makeChartData("waterfall", 12, 1);
  assert.equal(water.data.length, 12);
  assert.equal(water.data[0].total, true);
  assert.equal(water.data.at(-1).total, true);
  assert.throws(() => makeChartData("venn", 4, 1), /unsupported:/);
  assert.throws(() => makeChartData("radar", 2, 1), /unsupported:/);
  for (const def of chartTypeDefs) {
    const payload = makeChartData(def.id, def.sizes[0], 1);
    const spec = chartSpec(def.id, payload);
    assert.equal(spec.type, def.id);
    assert.equal(spec.size.width, 640);
    assert.equal(spec.size.height, 360);
    assert.equal(typeof spec.a11y.alt, "string");
  }
});
