import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GALLERY_TYPES } from "../browser/chart-types.mjs";
import { phase3Matrix } from "../browser/phase3.mjs";
import { rivalMatrix } from "../browser/rivals.mjs";
import { bundleMarkdown, bundleSummary } from "../lib/phase4-md.mjs";
import { buildMatrix } from "./catalog.mjs";
import { GALLERY_ALIASES } from "./native.mjs";
import { TREE_NOISE_GZIP, collapseTreeShake, compareGzip } from "./tree.mjs";

test("ChartKit has one minimal entry per gallery type and one /all bundle", () => {
  const cells = buildMatrix();
  const minimal = cells.filter((cell) => cell.library === "ChartKit minimal");
  assert.deepEqual(minimal.map((cell) => cell.chart), GALLERY_TYPES);
  assert.equal(new Set(minimal.map((cell) => cell.source)).size, GALLERY_TYPES.length);
  for (const cell of minimal) {
    assert.equal(cell.status, "ok");
    assert.match(cell.source, /createRenderer/);
    assert.equal(cell.ssr, "chartkit");
  }
  const all = cells.filter((cell) => cell.library === "ChartKit all");
  assert.equal(all.length, 1);
  assert.equal(all[0].chart, "all");
  assert.equal(all[0].group, "chartkit-all");
});

test("phase 2 native cells have a source and unsupported cells do not", () => {
  const cells = buildMatrix();
  for (const row of rivalMatrix()) {
    const cell = cells.find((item) => item.id === row.libraryId && item.chart === row.chart);
    assert.ok(cell, `${row.libraryId} ${row.chart}`);
    if (row.status === "native") {
      assert.equal(cell.status, "ok", `${row.libraryId} ${row.chart}`);
      assert.equal(typeof cell.source, "string");
    } else {
      assert.equal(cell.status, "unsupported");
      assert.equal(cell.source, null);
    }
  }
});

test("phase 3 paint natives have a source except Google Charts", () => {
  const cells = buildMatrix();
  for (const row of phase3Matrix()) {
    const cell = cells.find((item) => item.id === row.libraryId && item.chart === row.chart);
    assert.ok(cell, `${row.libraryId} ${row.chart}`);
    if (row.libraryId === "googlecharts") {
      assert.equal(cell.status, "unsupported");
      assert.match(cell.note, /not an npm package/);
      assert.equal(cell.source, null);
      continue;
    }
    if (row.status === "native") {
      assert.equal(cell.status, "ok", `${row.libraryId} ${row.chart} ${cell.error ?? ""}`);
      assert.equal(typeof cell.source, "string");
    } else {
      assert.equal(cell.status, "unsupported");
      assert.equal(cell.source, null);
    }
  }
});

test("no ok cell is missing a source, and aliases point at gallery types", () => {
  const cells = buildMatrix();
  for (const cell of cells) {
    if (cell.status === "ok") assert.equal(typeof cell.source, "string", `${cell.id} ${cell.chart}`);
    else assert.equal(cell.source, null);
  }
  for (const [alias, type] of GALLERY_ALIASES) {
    assert.ok(GALLERY_TYPES.includes(type), alias);
    const cell = cells.find((item) => item.library === "ChartKit minimal" && item.chart === type);
    assert.ok(cell.aliases.includes(alias), `${alias} -> ${type}`);
  }
  assert.equal(cells.some((cell) => cell.chart === "area"), false);
});

test("identical bundles collapse and a real spread does not", () => {
  const cells = [
    { status: "ok", group: "uplot", library: "uPlot", chart: "line", gzipBytes: 1000, minBytes: 2000, brotliBytes: 900, cssGzipBytes: 10 },
    { status: "ok", group: "uplot", library: "uPlot", chart: "bar", gzipBytes: 1000 + TREE_NOISE_GZIP, minBytes: 2000, brotliBytes: 900, cssGzipBytes: 10 },
    { status: "ok", group: "chartjs", library: "Chart.js", chart: "line", gzipBytes: 5000, minBytes: 8000, brotliBytes: 4000 },
    { status: "ok", group: "chartjs", library: "Chart.js", chart: "donut", gzipBytes: 5000 + TREE_NOISE_GZIP + 1, minBytes: 7000, brotliBytes: 3000 },
    { status: "unsupported", group: "uplot", library: "uPlot", chart: "donut", gzipBytes: null },
  ];
  const packages = collapseTreeShake(cells);
  assert.equal(cells[0].label, "not tree-shakeable");
  assert.equal(cells[0].gzipBytes, null);
  assert.equal(cells[1].gzipBytes, null);
  assert.equal(cells[2].treeShakeable, true);
  assert.equal(cells[2].gzipBytes, 5000);
  const uplot = packages.find((pkg) => pkg.id === "uplot");
  assert.equal(uplot.treeShakeable, false);
  assert.equal(uplot.gzipBytes, 1000 + TREE_NOISE_GZIP);
  assert.equal(compareGzip(cells[0], packages), uplot.gzipBytes + uplot.cssGzipBytes);
  assert.equal(compareGzip(cells[2], packages), 5000);
});

test("bundle summaries are computed from the cells, including a stale summary object", () => {
  const bundle = {
    counts: { ok: 99 },
    summary: {
      counts: { ok: 1 },
      chartkitGzipMin: { chart: "progress-ring", gzipBytes: 7188 },
      chartkitGzipMax: { chart: "combo", gzipBytes: 46457 },
      rivalSmaller: [{ chart: "line", library: "uPlot", gzip: 24054, chartkitGzip: 42098, label: "not tree-shakeable", reactExternal: null }],
      notTreeShakeable: [],
    },
    packages: [
      { id: "uplot", library: "uPlot", treeShakeable: false, gzipBytes: 23292, cssGzipBytes: 762 },
    ],
    cells: [
      { id: "chartkit", library: "ChartKit minimal", chart: "progress-ring", status: "ok", gzipBytes: 6673 },
      { id: "chartkit", library: "ChartKit minimal", chart: "line", status: "ok", gzipBytes: 32110 },
      { id: "chartkit", library: "ChartKit minimal", chart: "combo", status: "ok", gzipBytes: 38220 },
      { id: "uplot", library: "uPlot", chart: "line", status: "ok", gzipBytes: null, label: "not tree-shakeable", packageId: "uplot" },
      { id: "uplot", library: "uPlot", chart: "combo", status: "unsupported" },
      { id: "chartkit-all", library: "ChartKit all", chart: "all", status: "ok", gzipBytes: 78081 },
    ],
  };
  const summary = bundleSummary(bundle);
  assert.deepEqual(summary.chartkitGzipMin, { chart: "progress-ring", gzipBytes: 6673 });
  assert.deepEqual(summary.chartkitGzipMax, { chart: "combo", gzipBytes: 38220 });
  assert.deepEqual(summary.counts, { ok: 5, unsupported: 1, "license-blocked": 0, error: 0 });
  assert.deepEqual(summary.rivalSmaller, [
    { chart: "line", library: "uPlot", gzip: 24054, chartkitGzip: 32110, label: "not tree-shakeable", reactExternal: null },
  ]);
  assert.equal(summary.notTreeShakeable[0].gzipBytes, 23292);
  const markdown = bundleMarkdown(bundle);
  assert.match(markdown, /largest for \*\*combo\*\* \(38220\)/);
  assert.match(markdown, /\| line \| 32110 \| uPlot \(full package\) \| 24054 \|/);
  assert.doesNotMatch(markdown, /46457|42098|7188/);
});

test("published bundle.json summary matches the cells", () => {
  const bundle = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../results/bundle.json"), "utf8"));
  assert.deepEqual(bundle.summary, bundleSummary(bundle));
});
