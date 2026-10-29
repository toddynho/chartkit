import assert from "node:assert/strict";
import test from "node:test";
import { GALLERY_TYPES, chartTypeDefs } from "../browser/chart-types.mjs";
import { SSR_SAMPLES, buildSsrMatrix } from "./catalog.mjs";

test("SSR covers every gallery type at the paint N, median of 5", () => {
  const cells = buildSsrMatrix();
  assert.equal(SSR_SAMPLES, 5);
  const chartkit = cells.filter((cell) => cell.id === "chartkit");
  const charts = new Set(chartkit.map((cell) => cell.chart));
  assert.deepEqual([...charts], [...GALLERY_TYPES]);
  assert.deepEqual(chartkit.filter((cell) => cell.chart === "line").map((cell) => cell.points), [100000]);
  assert.deepEqual(chartkit.filter((cell) => cell.chart === "candlestick").map((cell) => cell.points), [2000, 100000]);
  assert.equal(chartkit.find((cell) => cell.chart === "bar").points, 48);
  assert.equal(chartkit.find((cell) => cell.chart === "heatmap").points, 1200);
  assert.equal(chartkit.find((cell) => cell.chart === "venn").points, 3);
  for (const def of chartTypeDefs) {
    if (def.id === "candlestick") continue;
    assert.deepEqual(chartkit.filter((cell) => cell.chart === def.id).map((cell) => cell.points), def.sizes);
  }
  for (const cell of chartkit) assert.equal(cell.samples, 5);
  assert.equal(cells.some((cell) => cell.chart === "all"), false);
});

test("SSR runners exist only for a real Node path", () => {
  const cells = buildSsrMatrix();
  const uplot = cells.find((cell) => cell.id === "uplot" && cell.chart === "line");
  assert.equal(uplot.status, "unsupported");
  assert.match(uplot.note, /canvas/);
  const echarts = cells.find((cell) => cell.id === "echarts" && cell.chart === "line");
  assert.equal(echarts.status, "ok");
  assert.equal(echarts.ssr, "echarts");
  const plot = cells.find((cell) => cell.id === "plot" && cell.chart === "line");
  assert.equal(plot.ssr, "plot");
  const vega = cells.find((cell) => cell.id === "vegalite" && cell.chart === "line");
  assert.equal(vega.ssr, "vega");
  const g2 = cells.find((cell) => cell.id === "g2" && cell.chart === "line");
  assert.equal(g2.status, "unsupported");
  assert.match(g2.note, /g-canvas/);
  const nivoScatter = cells.find((cell) => cell.id === "nivo" && cell.chart === "scatter");
  assert.equal(nivoScatter.status, "unsupported");
  assert.match(nivoScatter.note, /canvas/);
  const google = cells.find((cell) => cell.id === "googlecharts");
  assert.equal(google.status, "unsupported");
  assert.match(google.note, /not an npm package/);
});
