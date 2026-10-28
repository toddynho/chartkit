/**
 * Phase 2 paint cells for the libraries already on the line sweep.
 * A cell is native only when that library has a real chart of that shape.
 * Unsupported cells are written with a reason and no time. Nothing is invented.
 * Commercial libraries are phase 3 (phase3.mjs). A missing license key is
 * status blocked, and that status is still part of the schema.
 */

import { GALLERY_TYPES, chartTypeDefs } from "./chart-types.mjs";

export const RIVAL_LIBS = [
  { id: "uplot", library: "uPlot", renderer: "canvas" },
  { id: "chartjs", library: "Chart.js", renderer: "canvas" },
  { id: "echarts", library: "ECharts", renderer: "canvas" },
  { id: "recharts", library: "Recharts", renderer: "svg" },
  { id: "nivo", library: "Nivo", renderer: "svg" },
  { id: "plot", library: "Observable Plot", renderer: "svg" },
];

const LINE_METHOD = "Projected from the existing line sweep. The type matrix does not paint line a second time.";

const SHARED = {
  sparkline: "No sparkline chart. A line with the axes hidden is the line cell.",
  kpi: "No KPI card. The chart is a labeled metric, not a series.",
  "progress-ring": "No progress ring. A gauge drawn as a ring is the gauge cell.",
  spike: "No spike chart. A thin bar would be the bar cell.",
  waterfall: "No waterfall series. A transparent helper bar is not a native waterfall.",
  "bar-list": "No bar-list component. A horizontal bar is the bar cell.",
  gantt: "No gantt series. A floating bar is the bar-range cell.",
  timeline: "No event timeline.",
  quadrant: "No quadrant chart. Points with guides are the scatter cell.",
  venn: "No venn chart.",
  journey: "No journey chart.",
  bullet: "No bullet chart.",
  histogram: "No histogram that bins observations. Pre-binned bars would be the bar cell.",
};

const SPECIFIC = {
  uplot: {
    pie: "No pie series.",
    donut: "No donut series.",
    "stacked-area": "A series can fill to a baseline, but uPlot has no stack. One filled series is the mini-area cell.",
    combo: "No combo and no second scale. A bar and a line on one scale would squash the margin series.",
    heatmap: "No heatmap series.",
    candlestick: "The candlestick in the uPlot demos is a custom path, not a built-in series.",
    boxplot: "No boxplot series.",
    radar: "No radar series.",
    funnel: "No funnel series.",
    treemap: "No treemap series.",
    sankey: "No sankey series.",
    gauge: "No gauge series.",
    errorbar: "No error-bar series.",
    rose: "No polar area or rose series.",
    "radial-bar": "No polar bar series.",
    sunburst: "No sunburst series.",
  },
  chartjs: {
    heatmap: "No heatmap controller.",
    candlestick: "No candlestick controller.",
    boxplot: "No boxplot controller.",
    funnel: "No funnel controller.",
    gauge: "No gauge controller.",
    treemap: "No treemap controller.",
    sankey: "No sankey controller.",
    sunburst: "No sunburst controller.",
    errorbar: "No error-bar element in chart.js core.",
    "radial-bar": "No radial bar controller. polarArea is the rose cell.",
  },
  echarts: {
    "area-range": "No area-range series. A transparent stacked helper is not this chart.",
    "bar-range": "No floating-bar data. A transparent stacked helper is not this chart.",
    errorbar: "No error-bar series. A custom series can draw anything and is not this chart.",
    timeline: "The timeline component is a playback control, not an event timeline.",
  },
  recharts: {
    heatmap: "No heatmap chart.",
    gauge: "No gauge chart.",
    candlestick: "No candlestick chart.",
    boxplot: "No boxplot chart.",
    "area-range": "No band series. ReferenceArea is an annotation, not a series.",
    rose: "No rose or polar-area chart. RadialBar is the radial-bar cell.",
  },
  nivo: {
    combo: "No combo chart and no second y scale.",
    gauge: "No gauge package in Nivo 0.99.0.",
    candlestick: "No candlestick package in Nivo 0.99.0.",
    "area-range": "No area-range package in Nivo 0.99.0.",
    "bar-range": "No floating-bar chart in Nivo 0.99.0.",
    errorbar: "No error-bar package in Nivo 0.99.0.",
    rose: "No rose or polar-area package in Nivo 0.99.0.",
  },
  plot: {
    pie: "No pie or donut mark.",
    donut: "No pie or donut mark.",
    combo: "No second y scale. A bar and a line on one scale would squash the margin series.",
    spike: "Plot.spike is a fixed-pixel vector, not a value-height spike from the baseline.",
    candlestick: "No candlestick mark.",
    radar: "No radar mark.",
    funnel: "No funnel mark.",
    gauge: "No gauge mark.",
    treemap: "The tree mark is a node-link layout, not a treemap.",
    sankey: "No sankey mark.",
    sunburst: "No sunburst mark.",
    rose: "No rose or polar-area mark.",
    "radial-bar": "No radial bar mark.",
    errorbar: "No error-bar mark.",
  },
};

function reasonFor(lib, chart) {
  const specific = SPECIFIC[lib.id]?.[chart];
  if (specific) return specific;
  if (SHARED[chart]) return SHARED[chart];
  return `${lib.library} has no native ${chart} chart.`;
}

const prelude = `
import { makeChartData } from "../lib/shapes.mjs";
function heap() {
  return performance.memory ? performance.memory.usedJSHeapSize : null;
}
function frames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
async function timed(chart, n, render, update) {
  if (globalThis.gc) globalThis.gc();
  const before = heap();
  const first = makeChartData(chart, n, 1);
  const t0 = performance.now();
  const rendered = await render(first);
  const initialMs = performance.now() - t0;
  const mid = heap();
  const second = makeChartData(chart, n, 2);
  const t1 = performance.now();
  const updated = await update(second);
  const updateMs = performance.now() - t1;
  return {
    initialMs,
    updateMs,
    renderMs: typeof rendered === "number" ? rendered : null,
    updateRenderMs: typeof updated === "number" ? updated : null,
    heapBefore: before,
    heapAfterRender: mid,
    heapAfterUpdate: heap(),
  };
}
function rowsOf(payload) {
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (ArrayBuffer.isView(data)) {
    const rows = new Array(data.length);
    for (let i = 0; i < data.length; i++) rows[i] = { x: i, y: data[i] };
    return rows;
  }
  const columns = data && data.columns;
  if (!columns) return [];
  const names = Object.keys(columns);
  const n = columns[names[0]].length;
  const rows = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = {};
    for (let k = 0; k < names.length; k++) row[names[k]] = columns[names[k]][i];
    rows[i] = row;
  }
  return rows;
}
function columnsOf(payload) {
  return payload.data.columns;
}
function painted(host, selector) {
  if (!host.querySelector(selector)) throw new Error("chart did not paint");
}
function sumNodes(nodes, nameKey) {
  return nodes.map((node) => {
    if (!node.children) return { [nameKey]: node.name, value: node.value };
    const children = sumNodes(node.children, nameKey);
    let value = 0;
    for (const child of children) value += child.value;
    return { [nameKey]: node.name, value, children };
  });
}
`;

function benchSource(lib, chart, body, renderer = lib.renderer) {
  return `${prelude}
const CHART = ${JSON.stringify(chart)};
${body}
globalThis.__bench = {
  library: ${JSON.stringify(lib.library)},
  renderer: ${JSON.stringify(renderer)},
  chart: CHART,
  async run(n) {
    const api = setup();
    return timed(CHART, n, api.paint, api.update);
  },
};
`;
}

function uplotSource(optsCode, packCode) {
  return `
import uPlot from "uplot";
import css from "uplot/dist/uPlot.min.css";
const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
function setup() {
  const host = document.createElement("div");
  document.getElementById("root").replaceChildren(host);
  const opts = ${optsCode};
  let plot;
  const pack = (payload) => {
    ${packCode}
  };
  const paint = async (payload) => {
    plot = new uPlot(opts, pack(payload), host);
    painted(host, "canvas");
    await frames();
  };
  const update = async (payload) => {
    plot.setData(pack(payload));
    await frames();
  };
  return { paint, update };
}
`;
}

function indexPack(fields) {
  const decls = fields.map((field) => `const ${field} = new Float64Array(rows.length);`).join("\n    ");
  const fills = fields.map((field) => `${field}[i] = rows[i].${field === "x" ? "x" : field};`).join("\n      ");
  const xFill = fields.includes("x")
    ? ""
    : "x[i] = i;\n      ";
  const xDecl = fields.includes("x") ? "" : "const x = new Float64Array(rows.length);\n    ";
  const names = ["x", ...fields.filter((field) => field !== "x")];
  return `
    const rows = rowsOf(payload);
    ${xDecl}${decls}
    for (let i = 0; i < rows.length; i++) {
      ${xFill}${fills}
    }
    return [${names.join(", ")}];
  `;
}

function chartJsSource(registerList, configFn) {
  return `
import { Chart, ${registerList} } from "chart.js";
Chart.register(${registerList});
${configFn}
function setup() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  document.getElementById("root").replaceChildren(canvas);
  let chart;
  const paint = async (payload) => {
    chart = new Chart(canvas, config(payload));
    if (!chart.canvas) throw new Error("Chart.js did not paint");
    await frames();
  };
  const update = async (payload) => {
    chart.data = config(payload).data;
    chart.update("none");
    await frames();
  };
  return { paint, update };
}
`;
}

const chartJsQuiet = `animation: false, responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }`;

function echartsSource(chartImports, componentImports, useList, optionFn) {
  const componentLine = componentImports
    ? `import { ${componentImports} } from "echarts/components";`
    : "";
  return `
import * as echarts from "echarts/core";
import { ${chartImports} } from "echarts/charts";
${componentLine}
import { CanvasRenderer } from "echarts/renderers";
echarts.use([${useList}, CanvasRenderer]);
${optionFn}
function settle(chart) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ECharts finished event did not fire within 20s")), 20000);
    chart.on("finished", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const chart = echarts.init(host, null, { renderer: "canvas", width: 640, height: 360 });
  const draw = async (payload) => {
    const done = settle(chart);
    chart.setOption(option(payload), true);
    await done;
    painted(host, "canvas");
    await frames();
  };
  return { paint: draw, update: draw };
}
`;
}

function reactSource(imports, elementFn) {
  return `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
${imports}
${elementFn}
function setup() {
  const host = document.createElement("div");
  document.getElementById("root").replaceChildren(host);
  const root = createRoot(host);
  const paint = async (payload) => {
    flushSync(() => root.render(element(payload)));
    painted(host, "svg");
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function plotSource(body) {
  return `
import * as Plot from "@observablehq/plot";
function setup() {
  const paint = async (payload) => {
    ${body}
    if (!node || String(node.tagName).toLowerCase() !== "svg") throw new Error("Plot did not paint an svg");
    document.getElementById("root").replaceChildren(node);
    await frames();
  };
  return { paint, update: paint };
}
`;
}

const quietAxes = `axes: [{}, {}], legend: { show: false }`;

function uplotBar() {
  return uplotSource(
    `{
      width: 640,
      height: 360,
      series: [{}, { paths: uPlot.paths.bars(), fill: "rgba(34,197,94,0.85)", stroke: "#15803d", width: 1 }],
      ${quietAxes},
    }`,
    `
    const rows = rowsOf(payload);
    const x = new Float64Array(rows.length);
    const y = new Float64Array(rows.length);
    for (let i = 0; i < rows.length; i++) { x[i] = i; y[i] = rows[i].y; }
    return [x, y];
    `,
  );
}

function uplotScatter() {
  return uplotSource(
    `{
      width: 640,
      height: 360,
      series: [{}, { paths: uPlot.paths.points(), stroke: "#15803d", width: 1, points: { show: false } }],
      ${quietAxes},
    }`,
    indexPack(["y"]),
  );
}

function uplotMiniArea() {
  return uplotSource(
    `{
      width: 640,
      height: 360,
      series: [{}, { stroke: "#15803d", fill: "rgba(34,197,94,0.35)", width: 1 }],
      axes: [{ show: false }, { show: false }],
      legend: { show: false },
    }`,
    `
    const rows = rowsOf(payload);
    const x = new Float64Array(rows.length);
    const y = new Float64Array(rows.length);
    for (let i = 0; i < rows.length; i++) { x[i] = rows[i].x; y[i] = rows[i].y; }
    return [x, y];
    `,
  );
}

function uplotAreaRange() {
  return uplotSource(
    `{
      width: 640,
      height: 360,
      series: [
        {},
        { stroke: "transparent", width: 0, points: { show: false } },
        { stroke: "transparent", width: 0, points: { show: false } },
        { stroke: "#15803d", width: 1, points: { show: false } },
      ],
      bands: [{ series: [1, 2], fill: "rgba(34,197,94,0.35)" }],
      ${quietAxes},
    }`,
    `
    const rows = rowsOf(payload);
    const x = new Float64Array(rows.length);
    const lo = new Float64Array(rows.length);
    const hi = new Float64Array(rows.length);
    const y = new Float64Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      x[i] = rows[i].x; lo[i] = rows[i].lo; hi[i] = rows[i].hi; y[i] = rows[i].y;
    }
    return [x, lo, hi, y];
    `,
  );
}

function uplotBarRange() {
  return uplotSource(
    `{
      width: 640,
      height: 360,
      series: [
        {},
        {
          paths: uPlot.paths.bars({
            disp: {
              y0: { unit: 1, values: (u) => u.data[2] },
              y1: { unit: 1, values: (u) => u.data[1] },
            },
          }),
          fill: "rgba(34,197,94,0.85)",
          stroke: "#15803d",
          width: 1,
        },
        { stroke: "transparent", width: 0, points: { show: false } },
      ],
      ${quietAxes},
    }`,
    `
    const rows = rowsOf(payload);
    const x = new Float64Array(rows.length);
    const high = new Float64Array(rows.length);
    const low = new Float64Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      x[i] = i; low[i] = rows[i].low; high[i] = rows[i].high;
    }
    return [x, high, low];
    `,
  );
}

function chartJsCategory(type, extraDataset = "") {
  return `
function config(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) { labels[i] = rows[i].x; data[i] = rows[i].y; }
  return {
    type: ${JSON.stringify(type)},
    data: { labels, datasets: [{ data, borderWidth: 1${extraDataset} }] },
    options: { ${chartJsQuiet} },
  };
}
`;
}

function chartJsBar() {
  return chartJsSource("BarController, BarElement, CategoryScale, LinearScale", chartJsCategory("bar"));
}
function chartJsPie() {
  return chartJsSource("PieController, ArcElement", chartJsCategory("pie"));
}
function chartJsDonut() {
  return chartJsSource("DoughnutController, ArcElement", chartJsCategory("doughnut"));
}
function chartJsRose() {
  return chartJsSource("PolarAreaController, ArcElement, RadialLinearScale", chartJsCategory("polarArea"));
}
function chartJsRadar() {
  return chartJsSource(
    "RadarController, LineElement, PointElement, RadialLinearScale",
    `
function config(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const a = new Array(rows.length);
  const b = new Array(rows.length);
  const c = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    labels[i] = rows[i].spoke; a[i] = rows[i].a; b[i] = rows[i].b; c[i] = rows[i].c;
  }
  const style = { borderWidth: 1, pointRadius: 0 };
  return {
    type: "radar",
    data: { labels, datasets: [{ data: a, ...style }, { data: b, ...style }, { data: c, ...style }] },
    options: { ${chartJsQuiet}, scales: { r: { type: "radialLinear", min: 0 } } },
  };
}
`,
  );
}
function chartJsCombo() {
  return chartJsSource(
    "BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale",
    `
function config(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const revenue = new Array(rows.length);
  const margin = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    labels[i] = rows[i].x; revenue[i] = rows[i].revenue; margin[i] = rows[i].margin;
  }
  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        { type: "bar", data: revenue, yAxisID: "y" },
        { type: "line", data: margin, yAxisID: "y2", pointRadius: 0, borderWidth: 1 },
      ],
    },
    options: {
      ${chartJsQuiet},
      scales: {
        x: { type: "category" },
        y: { type: "linear", position: "left" },
        y2: { type: "linear", position: "right", grid: { drawOnChartArea: false } },
      },
    },
  };
}
`,
  );
}
function chartJsBarRange() {
  return chartJsSource(
    "BarController, BarElement, CategoryScale, LinearScale",
    `
function config(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) { labels[i] = rows[i].x; data[i] = [rows[i].low, rows[i].high]; }
  return {
    type: "bar",
    data: { labels, datasets: [{ data }] },
    options: { ${chartJsQuiet} },
  };
}
`,
  );
}
function chartJsScatter() {
  return chartJsSource(
    "ScatterController, PointElement, LinearScale",
    `
function config(payload) {
  const rows = rowsOf(payload);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) data[i] = { x: rows[i].x, y: rows[i].y };
  return {
    type: "scatter",
    data: { datasets: [{ data, pointRadius: 1, parsing: false, normalized: true }] },
    options: {
      ${chartJsQuiet},
      parsing: false,
      scales: { x: { type: "linear" }, y: { type: "linear" } },
    },
  };
}
`,
  );
}
function numericLineDatasets(keys, fill) {
  const fillProp = fill === "stack" ? "fill: true" : fill === "origin" ? 'fill: "origin"' : "fill: false";
  return `
function series(rows, key, xFromIndex) {
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) data[i] = { x: xFromIndex ? i : rows[i].x, y: rows[i][key] };
  return data;
}
function config(payload) {
  const rows = rowsOf(payload);
  const keys = ${JSON.stringify(keys)};
  const datasets = keys.map((key) => ({
    data: series(rows, key, false),
    ${fillProp},
    pointRadius: 0,
    borderWidth: 1,
    parsing: false,
    normalized: true,
  }));
  return {
    type: "line",
    data: { datasets },
    options: {
      ${chartJsQuiet},
      parsing: false,
      scales: {
        x: { type: "linear", display: ${fill === "origin" ? "false" : "true"} },
        y: { type: "linear", stacked: ${fill === "stack" ? "true" : "false"}, display: ${fill === "origin" ? "false" : "true"} },
      },
    },
  };
}
`;
}
function chartJsStackedArea() {
  return chartJsSource(
    "LineController, LineElement, PointElement, LinearScale, Filler",
    numericLineDatasets(["a", "b", "c", "d"], "stack"),
  );
}
function chartJsMiniArea() {
  return chartJsSource(
    "LineController, LineElement, PointElement, LinearScale, Filler",
    numericLineDatasets(["y"], "origin"),
  );
}
function chartJsAreaRange() {
  return chartJsSource(
    "LineController, LineElement, PointElement, LinearScale, Filler",
    `
function series(rows, key) {
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) data[i] = { x: rows[i].x, y: rows[i][key] };
  return data;
}
function config(payload) {
  const rows = rowsOf(payload);
  const common = { pointRadius: 0, borderWidth: 1, parsing: false, normalized: true };
  return {
    type: "line",
    data: {
      datasets: [
        { data: series(rows, "lo"), fill: false, ...common },
        { data: series(rows, "hi"), fill: "-1", ...common },
        { data: series(rows, "y"), fill: false, ...common },
      ],
    },
    options: {
      ${chartJsQuiet},
      parsing: false,
      scales: { x: { type: "linear" }, y: { type: "linear" } },
    },
  };
}
`,
  );
}

function echartsCategoryOption(seriesExtra) {
  return `
function option(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) { labels[i] = rows[i].x; data[i] = rows[i].y; }
  return {
    animation: false,
    tooltip: { show: false },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: [{ type: "bar", data${seriesExtra} }],
  };
}
`;
}

function echartsBar() {
  return echartsSource("BarChart", "GridComponent", "BarChart, GridComponent", echartsCategoryOption(""));
}
function echartsPie(kind) {
  const radius = kind === "donut" ? `["42%", "70%"]` : `"70%"`;
  const rose = kind === "rose" ? `roseType: "radius",` : "";
  return echartsSource(
    "PieChart",
    "",
    "PieChart",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) data[i] = { name: rows[i].x, value: rows[i].y };
  return {
    animation: false,
    tooltip: { show: false },
    series: [{ type: "pie", radius: ${radius}, ${rose} data }],
  };
}
`,
  );
}
function echartsCombo() {
  return echartsSource(
    "BarChart, LineChart",
    "GridComponent",
    "BarChart, LineChart, GridComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const revenue = new Array(rows.length);
  const margin = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    labels[i] = rows[i].x; revenue[i] = rows[i].revenue; margin[i] = rows[i].margin;
  }
  return {
    animation: false,
    tooltip: { show: false },
    xAxis: { type: "category", data: labels },
    yAxis: [{ type: "value" }, { type: "value" }],
    series: [
      { type: "bar", data: revenue },
      { type: "line", yAxisIndex: 1, showSymbol: false, data: margin },
    ],
  };
}
`,
  );
}
function echartsScatter() {
  return echartsSource(
    "ScatterChart",
    "GridComponent",
    "ScatterChart, GridComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) data[i] = [rows[i].x, rows[i].y];
  return {
    animation: false,
    tooltip: { show: false },
    xAxis: { type: "value" },
    yAxis: { type: "value" },
    series: [{ type: "scatter", data, symbolSize: 3 }],
  };
}
`,
  );
}
function echartsArea(stacked) {
  const keys = stacked ? ["a", "b", "c", "d"] : ["y"];
  return echartsSource(
    "LineChart",
    "GridComponent",
    "LineChart, GridComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const keys = ${JSON.stringify(keys)};
  const series = keys.map((key) => {
    const data = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) data[i] = [rows[i].x, rows[i][key]];
    return {
      type: "line",
      showSymbol: false,
      areaStyle: {},
      ${stacked ? 'stack: "total",' : ""}
      data,
    };
  });
  return {
    animation: false,
    tooltip: { show: false },
    xAxis: { type: "value", show: ${stacked ? "true" : "false"} },
    yAxis: { type: "value", show: ${stacked ? "true" : "false"} },
    series,
  };
}
`,
  );
}
function echartsHeatmap() {
  return echartsSource(
    "HeatmapChart",
    "GridComponent, VisualMapComponent",
    "HeatmapChart, GridComponent, VisualMapComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const xs = [];
  const ys = [];
  const xi = new Map();
  const yi = new Map();
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!xi.has(row.x)) { xi.set(row.x, xs.length); xs.push(row.x); }
    if (!yi.has(row.y)) { yi.set(row.y, ys.length); ys.push(row.y); }
    data[i] = [xi.get(row.x), yi.get(row.y), row.v];
  }
  return {
    animation: false,
    tooltip: { show: false },
    xAxis: { type: "category", data: xs },
    yAxis: { type: "category", data: ys },
    visualMap: { min: 0, max: 20, show: false },
    series: [{ type: "heatmap", data }],
  };
}
`,
  );
}
function echartsGauge() {
  return echartsSource(
    "GaugeChart",
    "",
    "GaugeChart",
    `
function option(payload) {
  const metric = payload.metric;
  return {
    animation: false,
    tooltip: { show: false },
    series: [{ type: "gauge", min: metric.min, max: metric.max, data: [{ value: metric.value, name: metric.label }] }],
  };
}
`,
  );
}
function echartsCandlestick() {
  return echartsSource(
    "CandlestickChart, BarChart",
    "GridComponent",
    "CandlestickChart, BarChart, GridComponent",
    `
function option(payload) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const labels = new Array(n);
  const candles = new Array(n);
  const volume = new Array(n);
  for (let i = 0; i < n; i++) {
    labels[i] = cols.x[i];
    candles[i] = [cols.open[i], cols.close[i], cols.low[i], cols.high[i]];
    volume[i] = cols.volume[i];
  }
  return {
    animation: false,
    tooltip: { show: false },
    grid: [{ left: 48, right: 16, top: 16, height: 200 }, { left: 48, right: 16, top: 248, height: 80 }],
    xAxis: [
      { type: "category", data: labels, boundaryGap: true },
      { type: "category", data: labels, gridIndex: 1, boundaryGap: true },
    ],
    yAxis: [{ scale: true }, { gridIndex: 1 }],
    series: [
      { type: "candlestick", data: candles },
      { type: "bar", data: volume, xAxisIndex: 1, yAxisIndex: 1 },
    ],
  };
}
`,
  );
}
function echartsBoxplot() {
  return echartsSource(
    "BoxplotChart, ScatterChart",
    "GridComponent, DatasetComponent, TransformComponent",
    "BoxplotChart, ScatterChart, GridComponent, DatasetComponent, TransformComponent",
    `
function option(payload) {
  const cols = columnsOf(payload);
  const names = [];
  const buckets = new Map();
  for (let i = 0; i < cols.value.length; i++) {
    const name = cols.group[i];
    let bucket = buckets.get(name);
    if (!bucket) { bucket = []; buckets.set(name, bucket); names.push(name); }
    bucket.push(cols.value[i]);
  }
  const source = names.map((name) => buckets.get(name));
  return {
    animation: false,
    tooltip: { show: false },
    dataset: [
      { source },
      { transform: { type: "boxplot", config: { itemNameFormatter: (params) => names[params.value] } } },
      { fromDatasetIndex: 1, fromTransformResult: 1 },
    ],
    xAxis: { type: "category" },
    yAxis: { type: "value" },
    series: [
      { type: "boxplot", datasetIndex: 1 },
      { type: "scatter", datasetIndex: 2 },
    ],
  };
}
`,
  );
}
function echartsRadar() {
  return echartsSource(
    "RadarChart",
    "RadarComponent",
    "RadarChart, RadarComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const indicator = new Array(rows.length);
  const a = new Array(rows.length);
  const b = new Array(rows.length);
  const c = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    indicator[i] = { name: rows[i].spoke, max: 10 };
    a[i] = rows[i].a; b[i] = rows[i].b; c[i] = rows[i].c;
  }
  return {
    animation: false,
    tooltip: { show: false },
    radar: { indicator },
    series: [{ type: "radar", data: [{ name: "a", value: a }, { name: "b", value: b }, { name: "c", value: c }] }],
  };
}
`,
  );
}
function echartsFunnel() {
  return echartsSource(
    "FunnelChart",
    "",
    "FunnelChart",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = rows.map((row) => ({ name: row.x, value: row.y }));
  return { animation: false, tooltip: { show: false }, series: [{ type: "funnel", sort: "none", data }] };
}
`,
  );
}
function echartsTreemap() {
  return echartsSource(
    "TreemapChart",
    "",
    "TreemapChart",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = rows.map((row) => ({ name: row.name, value: row.size }));
  return {
    animation: false,
    tooltip: { show: false },
    series: [{ type: "treemap", roam: false, nodeClick: false, breadcrumb: { show: false }, data }],
  };
}
`,
  );
}
function echartsSankey() {
  return echartsSource(
    "SankeyChart",
    "",
    "SankeyChart",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const seen = new Set();
  const nodes = [];
  for (const row of rows) {
    if (!seen.has(row.from)) { seen.add(row.from); nodes.push({ name: row.from }); }
    if (!seen.has(row.to)) { seen.add(row.to); nodes.push({ name: row.to }); }
  }
  const links = rows.map((row) => ({ source: row.from, target: row.to, value: row.flow }));
  return { animation: false, tooltip: { show: false }, series: [{ type: "sankey", data: nodes, links }] };
}
`,
  );
}
function echartsSunburst() {
  return echartsSource(
    "SunburstChart",
    "",
    "SunburstChart",
    `
function option(payload) {
  const data = sumNodes(payload.data, "name");
  return { animation: false, tooltip: { show: false }, series: [{ type: "sunburst", data, radius: ["12%", "90%"] }] };
}
`,
  );
}
function echartsRadial() {
  return echartsSource(
    "BarChart",
    "PolarComponent",
    "BarChart, PolarComponent",
    `
function option(payload) {
  const rows = rowsOf(payload);
  const labels = new Array(rows.length);
  const data = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) { labels[i] = rows[i].x; data[i] = rows[i].y; }
  return {
    animation: false,
    tooltip: { show: false },
    polar: {},
    angleAxis: { type: "category", data: labels },
    radiusAxis: { type: "value" },
    series: [{ type: "bar", coordinateSystem: "polar", data }],
  };
}
`,
  );
}

const reactMargin = `{ top: 16, right: 16, bottom: 32, left: 40 }`;

function rechartsBar() {
  return reactSource(
    `import { BarChart, Bar, XAxis, YAxis } from "recharts";`,
    `
function element(payload) {
  return createElement(BarChart, { width: 640, height: 360, data: rowsOf(payload) },
    createElement(XAxis, { dataKey: "x" }),
    createElement(YAxis),
    createElement(Bar, { dataKey: "y", isAnimationActive: false }));
}
`,
  );
}
function rechartsPie(hole) {
  return reactSource(
    `import { PieChart, Pie } from "recharts";`,
    `
function element(payload) {
  return createElement(PieChart, { width: 640, height: 360 },
    createElement(Pie, {
      data: rowsOf(payload),
      dataKey: "y",
      nameKey: "x",
      innerRadius: ${hole},
      outerRadius: 140,
      isAnimationActive: false,
    }));
}
`,
  );
}
function rechartsArea(stacked) {
  const areas = stacked
    ? ["a", "b", "c", "d"].map((key) => `createElement(Area, { dataKey: ${JSON.stringify(key)}, stackId: "s", isAnimationActive: false })`).join(",\n    ")
    : `createElement(Area, { dataKey: "y", isAnimationActive: false })`;
  const axes = stacked
    ? `createElement(XAxis, { dataKey: "x" }), createElement(YAxis),`
    : "";
  return reactSource(
    `import { AreaChart, Area, XAxis, YAxis } from "recharts";`,
    `
function element(payload) {
  return createElement(AreaChart, { width: 640, height: 360, data: rowsOf(payload) },
    ${axes}
    ${areas});
}
`,
  );
}
function rechartsScatter() {
  return reactSource(
    `import { ScatterChart, Scatter, XAxis, YAxis } from "recharts";`,
    `
function element(payload) {
  const rows = rowsOf(payload);
  return createElement(ScatterChart, { width: 640, height: 360 },
    createElement(XAxis, { dataKey: "x", type: "number" }),
    createElement(YAxis, { dataKey: "y", type: "number" }),
    createElement(Scatter, { data: rows, isAnimationActive: false }));
}
`,
  );
}
function rechartsCombo() {
  return reactSource(
    `import { ComposedChart, Bar, Line, XAxis, YAxis } from "recharts";`,
    `
function element(payload) {
  return createElement(ComposedChart, { width: 640, height: 360, data: rowsOf(payload) },
    createElement(XAxis, { dataKey: "x" }),
    createElement(YAxis, { yAxisId: "revenue" }),
    createElement(YAxis, { yAxisId: "margin", orientation: "right" }),
    createElement(Bar, { yAxisId: "revenue", dataKey: "revenue", isAnimationActive: false }),
    createElement(Line, { yAxisId: "margin", dataKey: "margin", dot: false, isAnimationActive: false }));
}
`,
  );
}
function rechartsRadar() {
  return reactSource(
    `import { RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";`,
    `
function element(payload) {
  return createElement(RadarChart, { width: 640, height: 360, data: rowsOf(payload) },
    createElement(PolarGrid),
    createElement(PolarAngleAxis, { dataKey: "spoke" }),
    createElement(Radar, { dataKey: "a", isAnimationActive: false }),
    createElement(Radar, { dataKey: "b", isAnimationActive: false }),
    createElement(Radar, { dataKey: "c", isAnimationActive: false }));
}
`,
  );
}
function rechartsFunnel() {
  return reactSource(
    `import { FunnelChart, Funnel } from "recharts";`,
    `
function element(payload) {
  return createElement(FunnelChart, { width: 640, height: 360 },
    createElement(Funnel, { data: rowsOf(payload), dataKey: "y", nameKey: "x", isAnimationActive: false }));
}
`,
  );
}
function rechartsTreemap() {
  return reactSource(
    `import { Treemap } from "recharts";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({ name: row.name, size: row.size }));
  return createElement(Treemap, { width: 640, height: 360, data, dataKey: "size", nameKey: "name", isAnimationActive: false });
}
`,
  );
}
function rechartsSankey() {
  return reactSource(
    `import { Sankey } from "recharts";`,
    `
function element(payload) {
  const rows = rowsOf(payload);
  const index = new Map();
  const nodes = [];
  const links = [];
  for (const row of rows) {
    for (const name of [row.from, row.to]) {
      if (!index.has(name)) { index.set(name, nodes.length); nodes.push({ name }); }
    }
    links.push({ source: index.get(row.from), target: index.get(row.to), value: row.flow });
  }
  return createElement(Sankey, { width: 640, height: 360, data: { nodes, links }, nodePadding: 8, nodeWidth: 12 });
}
`,
  );
}
function rechartsSunburst() {
  return reactSource(
    `import { SunburstChart } from "recharts";`,
    `
function element(payload) {
  const children = sumNodes(payload.data, "name");
  let value = 0;
  for (const child of children) value += child.value;
  return createElement(SunburstChart, { width: 640, height: 360, data: { name: "all", value, children }, dataKey: "value" });
}
`,
  );
}
function rechartsRadial() {
  return reactSource(
    `import { RadialBarChart, RadialBar } from "recharts";`,
    `
function element(payload) {
  return createElement(RadialBarChart, { width: 640, height: 360, data: rowsOf(payload), innerRadius: "20%", outerRadius: "90%" },
    createElement(RadialBar, { dataKey: "y", isAnimationActive: false }));
}
`,
  );
}
function rechartsError() {
  return reactSource(
    `import { ScatterChart, Scatter, XAxis, YAxis, ErrorBar } from "recharts";`,
    `
function element(payload) {
  const rows = rowsOf(payload).map((row) => ({ x: row.x, y: row.y, err: [row.y - row.lo, row.hi - row.y] }));
  return createElement(ScatterChart, { width: 640, height: 360 },
    createElement(XAxis, { dataKey: "x", type: "category" }),
    createElement(YAxis, { dataKey: "y" }),
    createElement(Scatter, { data: rows, isAnimationActive: false },
      createElement(ErrorBar, { dataKey: "err", direction: "y", width: 4 })));
}
`,
  );
}
function rechartsBarRange() {
  return reactSource(
    `import { BarChart, Bar, XAxis, YAxis } from "recharts";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({ x: row.x, range: [row.low, row.high] }));
  return createElement(BarChart, { width: 640, height: 360, data },
    createElement(XAxis, { dataKey: "x" }),
    createElement(YAxis),
    createElement(Bar, { dataKey: "range", isAnimationActive: false }));
}
`,
  );
}

const nivoQuiet = `width: 640, height: 360, animate: false, isInteractive: false, margin: ${reactMargin}`;

function nivoBar() {
  return reactSource(
    `import { Bar } from "@nivo/bar";`,
    `
function element(payload) {
  return createElement(Bar, {
    ${nivoQuiet},
    data: rowsOf(payload),
    keys: ["y"],
    indexBy: "x",
    enableLabel: false,
    axisBottom: { tickSize: 0 },
  });
}
`,
  );
}
function nivoPie(inner) {
  return reactSource(
    `import { Pie } from "@nivo/pie";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({ id: row.x, value: row.y }));
  return createElement(Pie, {
    ${nivoQuiet},
    data,
    innerRadius: ${inner},
    enableArcLabels: false,
    enableArcLinkLabels: false,
  });
}
`,
  );
}
function nivoStream(mini) {
  const axes = mini
    ? `axisTop: null, axisRight: null, axisBottom: null, axisLeft: null, enableGridX: false, enableGridY: false,`
    : "";
  const keys = mini ? `["y"]` : `["a", "b", "c", "d"]`;
  const pack = mini
    ? `rowsOf(payload)`
    : `(() => {
      const cols = columnsOf(payload);
      const data = new Array(cols.x.length);
      for (let i = 0; i < cols.x.length; i++) data[i] = { a: cols.a[i], b: cols.b[i], c: cols.c[i], d: cols.d[i] };
      return data;
    })()`;
  return reactSource(
    `import { Stream } from "@nivo/stream";`,
    `
function element(payload) {
  return createElement(Stream, {
    ${nivoQuiet},
    data: ${pack},
    keys: ${keys},
    offsetType: "none",
    curve: "linear",
    enableDots: false,
    ${axes}
  });
}
`,
  );
}
function nivoScatter() {
  return `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { ScatterPlotCanvas } from "@nivo/scatterplot";
function element(payload) {
  const data = [{ id: "y", data: rowsOf(payload).map((row) => ({ x: row.x, y: row.y })) }];
  return createElement(ScatterPlotCanvas, {
    ${nivoQuiet},
    data,
    nodeSize: 2,
    xScale: { type: "linear" },
    yScale: { type: "linear" },
  });
}
function setup() {
  const host = document.createElement("div");
  document.getElementById("root").replaceChildren(host);
  const root = createRoot(host);
  const paint = async (payload) => {
    flushSync(() => root.render(element(payload)));
    painted(host, "canvas");
    await frames();
  };
  return { paint, update: paint };
}
`;
}
function nivoHeatmap() {
  return reactSource(
    `import { HeatMap } from "@nivo/heatmap";`,
    `
function element(payload) {
  const series = [];
  const byId = new Map();
  for (const row of rowsOf(payload)) {
    let serie = byId.get(row.y);
    if (!serie) { serie = { id: row.y, data: [] }; byId.set(row.y, serie); series.push(serie); }
    serie.data.push({ x: row.x, y: row.v });
  }
  return createElement(HeatMap, { ${nivoQuiet}, data: series, enableLabels: false, legends: [] });
}
`,
  );
}
function nivoBox() {
  return reactSource(
    `import { BoxPlot } from "@nivo/boxplot";`,
    `
function element(payload) {
  return createElement(BoxPlot, { ${nivoQuiet}, data: rowsOf(payload), groupBy: "group", value: "value" });
}
`,
  );
}
function nivoRadar() {
  return reactSource(
    `import { Radar } from "@nivo/radar";`,
    `
function element(payload) {
  return createElement(Radar, { ${nivoQuiet}, data: rowsOf(payload), keys: ["a", "b", "c"], indexBy: "spoke" });
}
`,
  );
}
function nivoFunnel() {
  return reactSource(
    `import { Funnel } from "@nivo/funnel";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({ id: row.x, value: row.y, label: row.x }));
  return createElement(Funnel, { ${nivoQuiet}, data });
}
`,
  );
}
function nivoTreemap() {
  return reactSource(
    `import { TreeMap } from "@nivo/treemap";`,
    `
function element(payload) {
  const children = rowsOf(payload).map((row) => ({ id: row.name, value: row.size }));
  return createElement(TreeMap, { ${nivoQuiet}, data: { id: "root", children }, identity: "id", value: "value" });
}
`,
  );
}
function nivoSankey() {
  return reactSource(
    `import { Sankey } from "@nivo/sankey";`,
    `
function element(payload) {
  const rows = rowsOf(payload);
  const seen = new Set();
  const nodes = [];
  for (const row of rows) {
    if (!seen.has(row.from)) { seen.add(row.from); nodes.push({ id: row.from }); }
    if (!seen.has(row.to)) { seen.add(row.to); nodes.push({ id: row.to }); }
  }
  const links = rows.map((row) => ({ source: row.from, target: row.to, value: row.flow }));
  return createElement(Sankey, { ${nivoQuiet}, data: { nodes, links } });
}
`,
  );
}
function nivoBullet() {
  return reactSource(
    `import { Bullet } from "@nivo/bullet";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({
    id: row.name,
    ranges: [row.poor, row.ok, row.good],
    measures: [row.value],
    markers: [row.target],
  }));
  return createElement(Bullet, { ${nivoQuiet}, data });
}
`,
  );
}
function nivoRadial() {
  return reactSource(
    `import { RadialBar } from "@nivo/radial-bar";`,
    `
function element(payload) {
  const data = [{ id: "y", data: rowsOf(payload).map((row) => ({ x: row.x, y: row.y })) }];
  return createElement(RadialBar, { ${nivoQuiet}, data });
}
`,
  );
}
function nivoSunburst() {
  return reactSource(
    `import { Sunburst } from "@nivo/sunburst";`,
    `
function element(payload) {
  const children = sumNodes(payload.data, "id");
  let value = 0;
  for (const child of children) value += child.value;
  return createElement(Sunburst, { ${nivoQuiet}, data: { id: "all", value, children }, id: "id", value: "value" });
}
`,
  );
}

function plotBar() {
  return plotSource(`
    const node = Plot.plot({ width: 640, height: 360, marks: [Plot.barY(rowsOf(payload), { x: "x", y: "y" })] });
  `);
}
function plotStacked() {
  return plotSource(`
    const cols = columnsOf(payload);
    const keys = ["a", "b", "c", "d"];
    const rows = new Array(cols.x.length * keys.length);
    let p = 0;
    for (let k = 0; k < keys.length; k++) {
      const series = keys[k];
      const values = cols[series];
      for (let i = 0; i < cols.x.length; i++) rows[p++] = { x: cols.x[i], y: values[i], series };
    }
    const node = Plot.plot({
      width: 640,
      height: 360,
      marks: [Plot.areaY(rows, { x: "x", y: "y", z: "series", fill: "series" })],
    });
  `);
}
function plotMini() {
  return plotSource(`
    const node = Plot.plot({
      width: 640,
      height: 360,
      x: { axis: null },
      y: { axis: null },
      marks: [Plot.areaY(rowsOf(payload), { x: "x", y: "y" })],
    });
  `);
}
function plotScatter() {
  return plotSource(`
    const node = Plot.plot({ width: 640, height: 360, marks: [Plot.dot(rowsOf(payload), { x: "x", y: "y" })] });
  `);
}
function plotHeat() {
  return plotSource(`
    const node = Plot.plot({ width: 640, height: 360, marks: [Plot.cell(rowsOf(payload), { x: "x", y: "y", fill: "v" })] });
  `);
}
function plotHist() {
  return plotSource(`
    const node = Plot.plot({
      width: 640,
      height: 360,
      marks: [Plot.rectY(rowsOf(payload), Plot.binX({ y: "count" }, { x: "value", thresholds: 32 }))],
    });
  `);
}
function plotBox() {
  return plotSource(`
    const node = Plot.plot({ width: 640, height: 360, marks: [Plot.boxY(rowsOf(payload), { x: "group", y: "value" })] });
  `);
}
function plotBand() {
  return plotSource(`
    const rows = rowsOf(payload);
    const node = Plot.plot({
      width: 640,
      height: 360,
      marks: [
        Plot.area(rows, { x1: "x", y1: "lo", y2: "hi" }),
        Plot.line(rows, { x: "x", y: "y" }),
      ],
    });
  `);
}
function plotBarRange() {
  return plotSource(`
    const node = Plot.plot({
      width: 640,
      height: 360,
      marks: [Plot.barY(rowsOf(payload), { x: "x", y1: "low", y2: "high" })],
    });
  `);
}

const BUILT = {
  uplot: {
    bar: ["Built-in paths.bars. The category axis is the numeric index because uPlot scales are numeric. Values are the same y.", uplotBar],
    scatter: ["Built-in paths.points, with no stroke line.", uplotScatter],
    "mini-area": ["Built-in series fill to the baseline, axes off. One series. uPlot has no stack, so this is not stacked-area.", uplotMiniArea],
    "area-range": ["Built-in bands between the low series and the high series, plus the centre line.", uplotAreaRange],
    "bar-range": ["paths.bars disp y0 and y1 in scale units, the built-in floating bar. The category axis is the index.", uplotBarRange],
  },
  chartjs: {
    bar: ["Bar controller.", chartJsBar],
    pie: ["Pie controller.", chartJsPie],
    donut: ["Doughnut controller. Same slices as pie, with the hole.", chartJsDonut],
    "stacked-area": ["Line chart with fill and a stacked y scale. Chart.js documents this as the stacked area chart.", chartJsStackedArea],
    scatter: ["Scatter controller. Points are {x, y}, parsing off, same as the line cell.", chartJsScatter],
    combo: ["Mixed bar and line datasets. Margin is on a second y scale.", chartJsCombo],
    "mini-area": ["Line chart with fill to the origin and axes off. One series. Not the stacked-area cell.", chartJsMiniArea],
    radar: ["Radar controller. Three datasets on the spoke labels.", chartJsRadar],
    rose: ["polarArea controller. Equal angles, radius from the value.", chartJsRose],
    "area-range": ["Line fill to the previous dataset, the documented band between low and high, plus the centre line.", chartJsAreaRange],
    "bar-range": ["Floating bars. Each datum is [low, high], which bar charts accept.", chartJsBarRange],
  },
  echarts: {
    bar: ["Bar series on a category axis.", echartsBar],
    pie: ["Pie series. Angle encodes the value.", () => echartsPie("pie")],
    donut: ["Pie series with radius [inner, outer].", () => echartsPie("donut")],
    "stacked-area": ["Line series with areaStyle and stack. The documented stacked area.", () => echartsArea(true)],
    "mini-area": ["One line series with areaStyle and axes off. Not the stacked-area cell.", () => echartsArea(false)],
    scatter: ["Scatter series. Sampling and large mode stay off, same as the line cell.", echartsScatter],
    combo: ["One bar series and one line series. Margin uses yAxisIndex 1.", echartsCombo],
    heatmap: ["Heatmap series on a category grid, with visualMap.", echartsHeatmap],
    gauge: ["Gauge series for the one metric.", echartsGauge],
    candlestick: ["Candlestick series in open, close, low, high order, plus the volume bar from the same documented chart.", echartsCandlestick],
    boxplot: ["Boxplot series. The dataset transform inside ECharts computes the five-number summary from the observations.", echartsBoxplot],
    radar: ["Radar series. Three value lists on the spoke indicators.", echartsRadar],
    funnel: ["Funnel series. sort none keeps the stage order.", echartsFunnel],
    treemap: ["Treemap series. Flat tiles, one value per tile.", echartsTreemap],
    sankey: ["Sankey series. Links keep the from, to, and flow fields.", echartsSankey],
    sunburst: ["Sunburst series. Leaves keep their values. Parents hold the sum so the rings close.", echartsSunburst],
    rose: ["Pie series with roseType radius. Equal angles, radius from the value.", () => echartsPie("rose")],
    "radial-bar": ["Bar series on a polar coordinate system.", echartsRadial],
  },
  recharts: {
    bar: ["BarChart and Bar.", rechartsBar],
    pie: ["PieChart and Pie, innerRadius 0.", () => rechartsPie(0)],
    donut: ["PieChart and Pie, innerRadius 80. Same slices as pie.", () => rechartsPie(80)],
    "stacked-area": ["AreaChart with four Area elements that share stackId. Recharts walks that stacked domain recursively and throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error.", () => rechartsArea(true)],
    "mini-area": ["AreaChart with one Area and no axes. Not the stacked-area cell.", () => rechartsArea(false)],
    scatter: ["ScatterChart and Scatter.", rechartsScatter],
    combo: ["ComposedChart. Revenue is a bar. Margin is a line on a second YAxis.", rechartsCombo],
    radar: ["RadarChart and three Radar elements.", rechartsRadar],
    funnel: ["FunnelChart and Funnel.", rechartsFunnel],
    treemap: ["Treemap. Flat tiles sized by the size field.", rechartsTreemap],
    sankey: ["Sankey. Named links become the index links the component requires.", rechartsSankey],
    sunburst: ["SunburstChart. A root wraps the branches. Each parent value is the sum of its leaves.", rechartsSunburst],
    "radial-bar": ["RadialBarChart and RadialBar.", rechartsRadial],
    errorbar: ["Scatter with ErrorBar. err is [y - low, high - y], the component's lower and upper error.", rechartsError],
    "bar-range": ["Bar data is [low, high], the floating-bar value.", rechartsBarRange],
  },
  nivo: {
    bar: ["@nivo/bar. One key.", nivoBar],
    pie: ["@nivo/pie with innerRadius 0.", () => nivoPie(0)],
    donut: ["@nivo/pie with innerRadius 0.6. Same slices as pie.", () => nivoPie(0.6)],
    "stacked-area": ["@nivo/stream with offsetType none, a zero-baseline stack of the four series. Not the wiggle offset. Nivo's stream memo throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error.", () => nivoStream(false)],
    "mini-area": ["@nivo/stream with one series, offsetType none, and axes off. Not the stacked-area cell.", () => nivoStream(true)],
    scatter: ["@nivo/scatterplot canvas renderer. The SVG scatter builds one node per point and does not finish inside the sample timeout at this N. Canvas is the published scatter for that size.", nivoScatter, "canvas"],
    heatmap: ["@nivo/heatmap. Rows are series and the cell value is the datum y. Not the calendar heatmap.", nivoHeatmap],
    boxplot: ["@nivo/boxplot. It computes the quantiles from group and value.", nivoBox],
    radar: ["@nivo/radar. indexBy spoke, keys a, b, and c.", nivoRadar],
    funnel: ["@nivo/funnel.", nivoFunnel],
    treemap: ["@nivo/treemap. Flat tiles under one root.", nivoTreemap],
    sankey: ["@nivo/sankey. Links keep source, target, and value.", nivoSankey],
    bullet: ["@nivo/bullet. ranges are poor, ok, and good. measures is the value. markers is the target.", nivoBullet],
    "radial-bar": ["@nivo/radial-bar. One series.", nivoRadial],
    sunburst: ["@nivo/sunburst. A root wraps the branches. Parent values are the leaf sums.", nivoSunburst],
  },
  plot: {
    bar: ["barY mark on the category field.", plotBar],
    "stacked-area": ["areaY with a series z channel, which stacks. Long rows are the same four series.", plotStacked],
    "mini-area": ["areaY for one series, with both axes off. Not the stacked-area cell.", plotMini],
    scatter: ["dot mark. One point per row.", plotScatter],
    heatmap: ["cell mark. fill is the grid value.", plotHeat],
    histogram: ["rectY with binX. Plot bins the observations. thresholds is 32, the same bin count as the ChartKit cell.", plotHist],
    boxplot: ["boxY mark. Plot computes the boxes from the observations.", plotBox],
    "area-range": ["area mark with y1 and y2 for the band, plus a line for the centre. y1 and y2 do not stack.", plotBand],
    "bar-range": ["barY with y1 and y2, the interval bar.", plotBarRange],
  },
};

const defs = new Map(chartTypeDefs.map((def) => [def.id, def]));

export function rivalMatrix() {
  const rows = [];
  for (const lib of RIVAL_LIBS) {
    for (const chart of GALLERY_TYPES) {
      const built = chart === "line" ? null : BUILT[lib.id][chart];
      const native = chart === "line" || Boolean(built);
      rows.push({
        libraryId: lib.id,
        library: lib.library,
        chart,
        status: native ? "native" : "unsupported",
        method: chart === "line" ? LINE_METHOD : native ? built[0] : reasonFor(lib, chart),
        adapterId: chart === "line" ? lib.id : native ? `${lib.id}-${chart}` : null,
      });
    }
  }
  return rows;
}

export function rivalAdapters() {
  const adapters = [];
  for (const lib of RIVAL_LIBS) {
    for (const [chart, entry] of Object.entries(BUILT[lib.id])) {
      const def = defs.get(chart);
      adapters.push({
        id: `${lib.id}-${chart}`,
        suite: "chart-types",
        chart,
        homepageRow: def.homepageRow,
        nMeaning: def.nMeaning,
        why: def.why,
        method: entry[0],
        variant: null,
        library: lib.library,
        renderer: entry[2] ?? lib.renderer,
        sizes: def.sizes.slice(),
        source: benchSource(lib, chart, entry[1](), entry[2] ?? lib.renderer),
      });
    }
  }
  return adapters;
}

function librarySelected(libId, only) {
  if (only.has(libId)) return true;
  const prefix = `${libId}-`;
  for (const id of only) if (id.startsWith(prefix)) return true;
  return false;
}

export function unsupportedPaintCells({ only = null, types = null } = {}) {
  const cells = [];
  for (const lib of RIVAL_LIBS) {
    if (only && !librarySelected(lib.id, only)) continue;
    for (const chart of GALLERY_TYPES) {
      if (chart === "line" || BUILT[lib.id][chart]) continue;
      if (types && !types.has(chart)) continue;
      const def = defs.get(chart);
      const reason = reasonFor(lib, chart);
      for (const points of def.sizes) {
        cells.push({
          chart,
          homepageRow: def.homepageRow,
          library: lib.library,
          id: `${lib.id}-${chart}`,
          variant: null,
          renderer: null,
          points,
          nMeaning: def.nMeaning,
          why: def.why,
          method: reason,
          status: "unsupported",
          initialMs: null,
          updateMs: null,
          renderMs: null,
          updateRenderMs: null,
          gzipBytes: null,
          ssrMs: null,
          samples: 0,
          error: null,
          initialSamples: [],
          updateSamples: [],
          heapBefore: null,
          heapAfterRender: null,
          heapAfterUpdate: null,
        });
      }
    }
  }
  return cells;
}
