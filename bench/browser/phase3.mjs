/**
 * Phase 3 paint cells. A cell is timed only when that library has a native
 * chart of the same shape as the ChartKit bench entry. Matrix claims are
 * hints. Stand-ins are unsupported and have no time.
 *
 * Commercial builds are the published npm packages. Credits, logos, and trial
 * watermarks stay visible. A library that refuses to paint without a license
 * key throws "blocked:" so the cell is status blocked.
 */

import { chartTypeDefs } from "./chart-types.mjs";

export const ELEVEN_TYPES = new Set([
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
]);

export const PHASE3_CHARTS = new Set([...ELEVEN_TYPES, "candlestick"]);

export const PHASE3_LIBS = [
  { id: "highcharts", library: "Highcharts", renderer: "svg" },
  { id: "plotly", library: "Plotly.js", renderer: "svg" },
  { id: "victory", library: "Victory", renderer: "svg" },
  { id: "visx", library: "visx", renderer: "svg" },
  { id: "apexcharts", library: "ApexCharts", renderer: "svg" },
  { id: "tremor", library: "Tremor", renderer: "svg" },
  { id: "vegalite", library: "Vega-Lite", renderer: "svg" },
  { id: "agcharts", library: "AG Charts", renderer: "canvas" },
  { id: "amcharts", library: "amCharts 5", renderer: "canvas" },
  { id: "googlecharts", library: "Google Charts", renderer: "svg" },
  { id: "lightweight", library: "TradingView Lightweight Charts", renderer: "canvas" },
  { id: "muix", library: "MUI X Charts", renderer: "svg" },
  { id: "mermaid", library: "Mermaid", renderer: "svg" },
  { id: "g2", library: "AntV G2", renderer: "canvas" },
];

const SPIKE = "No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike.";
const BAR_LIST = "No bar-list component. A horizontal bar is the bar cell.";
const JOURNEY = "No journey chart.";
const KPI = "No KPI card. A gauge is the gauge cell.";
const RING = "No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell.";
const QUADRANT = "No quadrant chart. Points with guides are the scatter cell.";
const SPARK = "No sparkline chart. Hiding the axes on a line is the line cell.";
const TIMELINE = "No event timeline.";
const VENN = "No venn chart.";
const WATERFALL = "No waterfall series. A transparent helper bar is not a native waterfall.";
const GANTT = "No gantt series. A floating bar is the bar-range cell.";
const CANDLE = "No candlestick series.";

const SHARED = {
  spike: SPIKE,
  "bar-list": BAR_LIST,
  journey: JOURNEY,
  kpi: KPI,
  "progress-ring": RING,
  quadrant: QUADRANT,
  sparkline: SPARK,
  timeline: TIMELINE,
  venn: VENN,
  waterfall: WATERFALL,
  gantt: GANTT,
  candlestick: CANDLE,
};

const SPECIFIC = {
  highcharts: {
    sparkline: "The sparkline demo disables axes on a line. That is the line cell.",
    "bar-list": BAR_LIST,
    kpi: "No KPI series.",
    quadrant: QUADRANT,
    journey: JOURNEY,
    spike: SPIKE,
  },
  plotly: {
    sparkline: SPARK,
    "bar-list": BAR_LIST,
    "progress-ring": "indicator mode gauge is a gauge, not a progress ring.",
    gantt: "No gantt trace. Shapes on a date axis are not a gantt series.",
    timeline: "No event-timeline trace.",
    quadrant: QUADRANT,
    venn: "No venn trace. layout.shapes can draw circles and are not this chart.",
    journey: JOURNEY,
    spike: SPIKE,
  },
  victory: {
    "progress-ring": "VictoryPie is the pie cell. A partial pie is not a progress ring.",
  },
  visx: {
    gantt: "No gantt chart. @visx/shape bars are the bar cell.",
    waterfall: "No waterfall shape. A bar with a computed baseline is not this chart.",
  },
  apexcharts: {
    sparkline: "chart.sparkline.enabled hides axes on a line or area. That is the line cell.",
    gantt: "No gantt type. rangeBar is the bar-range cell. ApexGantt is a different product.",
    timeline: "rangeBar is the bar-range cell, not an event timeline.",
    kpi: KPI,
    quadrant: "No quadrant chart type.",
    venn: VENN,
    journey: JOURNEY,
    spike: SPIKE,
    "bar-list": BAR_LIST,
  },
  tremor: {
    gantt: GANTT,
    timeline: TIMELINE,
    quadrant: QUADRANT,
    venn: VENN,
    waterfall: WATERFALL,
    journey: JOURNEY,
    spike: SPIKE,
    candlestick: CANDLE,
  },
  vegalite: {
    gantt: "A bar with x and x2 is the bar-range cell, not a gantt chart.",
    waterfall: "The window-transform recipe is a manual stack, not a waterfall mark.",
    sparkline: SPARK,
    timeline: TIMELINE,
    quadrant: QUADRANT,
    venn: VENN,
    journey: JOURNEY,
    kpi: KPI,
    "progress-ring": RING,
    spike: SPIKE,
    "bar-list": BAR_LIST,
    candlestick: "No candlestick mark.",
  },
  agcharts: {
    "bar-list": BAR_LIST,
    gantt: "No gantt series in ag-charts-community or ag-charts-enterprise 14.2.0.",
    timeline: TIMELINE,
    venn: VENN,
    journey: JOURNEY,
    kpi: KPI,
    spike: SPIKE,
  },
  amcharts: {
    waterfall: "The openValueY column demo is a manual column, not a waterfall series.",
    timeline: "The timeline module is a curve, serpentine, or spiral axis, not an event timeline.",
    sparkline: SPARK,
    "bar-list": BAR_LIST,
    kpi: KPI,
    "progress-ring": RING,
    quadrant: QUADRANT,
    journey: JOURNEY,
    spike: SPIKE,
  },
  googlecharts: {
    waterfall: "The candlestick waterfall trick is not a waterfall chart.",
    sparkline: SPARK,
    "bar-list": BAR_LIST,
    kpi: KPI,
    "progress-ring": RING,
    quadrant: QUADRANT,
    venn: VENN,
    journey: JOURNEY,
    spike: SPIKE,
  },
  lightweight: {
    candlestick: null,
  },
  muix: {
    waterfall: "No waterfall series in @mui/x-charts 9.15.0. Composing bars is not this chart.",
    sparkline: null,
  },
  mermaid: {
    sparkline: SPARK,
    waterfall: WATERFALL,
    kpi: KPI,
    "progress-ring": RING,
    "bar-list": BAR_LIST,
    spike: SPIKE,
    candlestick: CANDLE,
  },
  g2: {
    "progress-ring": "gauge is a dial and liquid is a liquid-fill chart. Neither is a progress ring.",
    waterfall: "An interval with a manual y1 is not a waterfall mark.",
    sparkline: SPARK,
    gantt: GANTT,
    timeline: TIMELINE,
    quadrant: QUADRANT,
    venn: VENN,
    journey: JOURNEY,
    kpi: KPI,
    "bar-list": BAR_LIST,
    spike: SPIKE,
    candlestick: CANDLE,
  },
};

const HC_CREDIT = "Highcharts 13.1.1. credits stay enabled, so the Highcharts.com credit remains. No license key; this build paints without one.";
const AG_TRIAL = "ag-charts-enterprise 14.2.0 with no license key. The series paints and the build adds its trial watermark.";
const AM_LOGO = "amCharts 5.21.2 linkware build. The logo stays on the chart. No license key.";
const APEX_NOTE = "apexcharts 8.3.1. No key. The license is a revenue threshold, not a paint lock.";
const LW_NOTE = "lightweight-charts 5.2.1. The attribution logo stays on. Apache-2.0 plus that notice.";

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
function dayMs(iso) {
  return Date.parse(iso + "T00:00:00Z");
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

const hcQuiet = `
    chart: { animation: false, width: 640, height: 360 },
    title: { text: undefined },
    credits: { enabled: true },
    legend: { enabled: false },
    tooltip: { enabled: false },
    plotOptions: { series: { animation: false } },
`;

function hcChart(imports, optionBody, ctor = "Highcharts.chart") {
  return `
${imports}
${optionBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  let chart;
  const paint = async (payload) => {
    await new Promise((resolve) => {
      chart = ${ctor}(host, option(payload), function () { resolve(); });
    });
    painted(host, "svg");
    await frames();
  };
  const update = async (payload) => {
    chart.update(option(payload), true, true, false);
    await frames();
  };
  return { paint, update };
}
`;
}

function hcWaterfall() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/highcharts-more.js";`,
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = rows.map((row, index) => {
    if (index === 0) return { name: row.step, y: row.amount };
    if (row.total) return { name: row.step, isSum: true };
    return { name: row.step, y: row.amount };
  });
  return {
    ${hcQuiet}
    xAxis: { type: "category" },
    yAxis: { title: { text: undefined } },
    series: [{ type: "waterfall", data }],
  };
}
`,
  );
}

function hcGantt() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts-gantt.js";`,
    `
function option(payload) {
  const data = rowsOf(payload).map((row) => ({
    id: row.id,
    name: row.task,
    start: dayMs(row.start),
    end: row.end ? dayMs(row.end) : undefined,
    milestone: Boolean(row.milestone),
    dependency: row.depends || undefined,
    completed: row.progress,
  }));
  return {
    ${hcQuiet}
    series: [{ data }],
  };
}
`,
    "Highcharts.ganttChart",
  );
}

function hcVenn() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/modules/venn.js";`,
    `
function option(payload) {
  const data = rowsOf(payload).map((row) => ({
    sets: String(row.set).split("+"),
    value: row.size,
    name: row.set,
  }));
  return {
    ${hcQuiet}
    series: [{ type: "venn", data }],
  };
}
`,
  );
}

function hcTimeline() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/modules/timeline.js";
import "highcharts/esm/modules/xrange.js";`,
    `
function option(payload) {
  const rows = rowsOf(payload);
  const events = [];
  const periods = [];
  for (const row of rows) {
    if (row.kind === "period") {
      periods.push({ x: dayMs(row.start), x2: dayMs(row.end), y: 0, name: row.label });
    } else {
      events.push({ x: dayMs(row.date), name: row.label });
    }
  }
  return {
    ${hcQuiet}
    xAxis: { type: "datetime" },
    yAxis: { categories: ["Period"], title: { text: undefined } },
    series: [
      { type: "timeline", data: events },
      { type: "xrange", name: "Periods", data: periods },
    ],
  };
}
`,
  );
}

function hcRing() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/highcharts-more.js";
import "highcharts/esm/modules/solid-gauge.js";`,
    `
function option(payload) {
  const metric = payload.metric;
  return {
    ${hcQuiet}
    chart: { type: "solidgauge", animation: false, width: 640, height: 360 },
    pane: {
      startAngle: 0,
      endAngle: 360,
      background: [{ outerRadius: "100%", innerRadius: "78%", borderWidth: 0 }],
    },
    yAxis: {
      min: metric.min,
      max: metric.max,
      lineWidth: 0,
      tickPositions: [],
      title: { text: metric.label },
    },
    series: [{ data: [metric.value], dataLabels: { enabled: true } }],
  };
}
`,
  );
}

function hcCandle() {
  return hcChart(
    `import Highcharts from "highcharts/esm/highcharts.js";
import "highcharts/esm/modules/stock.js";`,
    `
function option(payload) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const candles = new Array(n);
  const volume = new Array(n);
  for (let i = 0; i < n; i++) {
    candles[i] = [cols.x[i], cols.open[i], cols.high[i], cols.low[i], cols.close[i]];
    volume[i] = [cols.x[i], cols.volume[i]];
  }
  return {
    ${hcQuiet}
    chart: { animation: false, width: 640, height: 360 },
    xAxis: { type: "linear" },
    yAxis: [
      { height: "68%", title: { text: undefined } },
      { top: "76%", height: "20%", offset: 0, title: { text: undefined } },
    ],
    series: [
      { type: "candlestick", data: candles, yAxis: 0 },
      { type: "column", data: volume, yAxis: 1 },
    ],
  };
}
`,
  );
}

function plotlyChart(traceBody) {
  return `
import Plotly from "plotly.js-dist-min";
${traceBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const layout = { width: 640, height: 360, margin: { l: 48, r: 24, t: 28, b: 40 }, showlegend: false };
  const config = { staticPlot: true, responsive: false, displayModeBar: false };
  const paint = async (payload) => {
    const spec = traces(payload);
    await Plotly.newPlot(host, spec.data, Object.assign({}, layout, spec.layout || {}), config);
    painted(host, "svg");
    await frames();
  };
  const update = async (payload) => {
    const spec = traces(payload);
    await Plotly.react(host, spec.data, Object.assign({}, layout, spec.layout || {}), config);
    await frames();
  };
  return { paint, update };
}
`;
}

function plotlyWaterfall() {
  return plotlyChart(`
function traces(payload) {
  const rows = rowsOf(payload);
  return {
    data: [{
      type: "waterfall",
      orientation: "v",
      x: rows.map((row) => row.step),
      y: rows.map((row) => row.amount),
      measure: rows.map((row) => (row.total ? "absolute" : "relative")),
      connector: { line: { width: 1 } },
    }],
  };
}
`);
}

function plotlyKpi() {
  return plotlyChart(`
function traces(payload) {
  const metric = payload.metric;
  const reference = metric.value / (1 + metric.delta);
  return {
    data: [{
      type: "indicator",
      mode: "number+delta",
      value: metric.value,
      delta: { reference, relative: true },
      title: { text: metric.label },
      domain: { x: [0.15, 0.85], y: [0.2, 0.85] },
    }],
  };
}
`);
}

function plotlyCandle() {
  return plotlyChart(`
function traces(payload) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const x = new Array(n);
  const open = new Array(n);
  const high = new Array(n);
  const low = new Array(n);
  const close = new Array(n);
  const volume = new Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = cols.x[i];
    open[i] = cols.open[i];
    high[i] = cols.high[i];
    low[i] = cols.low[i];
    close[i] = cols.close[i];
    volume[i] = cols.volume[i];
  }
  return {
    data: [
      { type: "candlestick", x, open, high, low, close, yaxis: "y" },
      { type: "bar", x, y: volume, yaxis: "y2" },
    ],
    layout: {
      yaxis: { domain: [0.32, 1] },
      yaxis2: { domain: [0, 0.24], anchor: "x" },
    },
  };
}
`);
}

function apexChart(extraImport, optionBody) {
  return `
import ApexCharts from "apexcharts";
${extraImport}
${optionBody}
function setup() {
  const host = document.createElement("div");
  document.getElementById("root").replaceChildren(host);
  let chart;
  const paint = async (payload) => {
    chart = new ApexCharts(host, option(payload));
    await chart.render();
    painted(host, "svg");
    await frames();
  };
  const update = async (payload) => {
    const next = option(payload);
    await chart.updateSeries(next.series, false);
    await frames();
  };
  return { paint, update };
}
`;
}

function apexWaterfall() {
  return apexChart(
    `import "apexcharts/features/waterfall";`,
    `
function option(payload) {
  const rows = rowsOf(payload);
  const data = rows.map((row, index) => {
    if (index === 0) return { x: row.step, y: row.amount };
    if (row.total) return { x: row.step, isTotal: true };
    return { x: row.step, y: row.amount };
  });
  return {
    chart: { type: "waterfall", width: 640, height: 360, animations: { enabled: false }, toolbar: { show: false } },
    series: [{ data }],
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: false },
  };
}
`,
  );
}

function apexRing() {
  return apexChart(
    "",
    `
function option(payload) {
  const metric = payload.metric;
  const span = metric.max - metric.min || 1;
  const pct = Math.max(0, Math.min(100, ((metric.value - metric.min) / span) * 100));
  return {
    chart: { type: "radialBar", width: 640, height: 360, animations: { enabled: false }, toolbar: { show: false } },
    series: [pct],
    labels: [metric.label],
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        hollow: { size: "62%" },
        dataLabels: { show: true },
      },
    },
  };
}
`,
  );
}

function apexCandle() {
  return apexChart(
    "",
    `
function option(payload) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const data = new Array(n);
  for (let i = 0; i < n; i++) {
    data[i] = { x: cols.x[i], y: [cols.open[i], cols.high[i], cols.low[i], cols.close[i]] };
  }
  return {
    chart: { type: "candlestick", width: 640, height: 360, animations: { enabled: false }, toolbar: { show: false } },
    series: [{ data }],
    tooltip: { enabled: false },
  };
}
`,
  );
}

const tremorCss = `
#root .w-full{width:100%}
#root .h-8{height:2rem}
#root .flex{display:flex}
#root .flex-col{flex-direction:column}
#root .items-center{align-items:center}
#root .justify-between{justify-content:space-between}
#root .justify-end{justify-content:flex-end}
#root .justify-center{justify-content:center}
#root .relative{position:relative}
#root .absolute{position:absolute}
#root .left-2{left:.5rem}
#root .pr-4{padding-right:1rem}
#root .max-w-full{max-width:100%}
#root .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#root .whitespace-nowrap{white-space:nowrap}
#root .space-y-1\\\\.5 > * + *{margin-top:.375rem}
#root .mb-1\\\\.5{margin-bottom:.375rem}
#root [class*="bg-tremor-brand-subtle"]{background:#e0e7ff}
#root [class*="text-tremor-content-emphasis"]{color:#111827}
#root .bench-spark{width:640px!important;height:360px!important}
#root .bench-spark .recharts-responsive-container{width:640px!important;height:360px!important}
#root [class*="stroke-tremor-brand-muted"]{stroke:#cbd5e1}
#root [class*="stroke-tremor-brand"]:not([class*="muted"]){stroke:#2563eb}
#root .recharts-line .recharts-line-curve{stroke:#2563eb}
`;

function tremorChart(imports, elementBody, check) {
  return `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
${imports}
const tremorStyle = document.createElement("style");
tremorStyle.textContent = ${JSON.stringify(tremorCss)};
document.head.append(tremorStyle);
${elementBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px;position:relative";
  document.getElementById("root").replaceChildren(host);
  const root = createRoot(host);
  const paint = async (payload) => {
    flushSync(() => root.render(element(payload)));
    await frames();
    ${check}
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function tremorBarList() {
  return tremorChart(
    `import { BarList } from "@tremor/react";`,
    `
function element(payload) {
  const data = rowsOf(payload).map((row) => ({ name: row.x, value: row.y }));
  return createElement(BarList, { data, sortOrder: "none", showAnimation: false });
}
`,
    `if (!host.querySelector("[style*='width']")) throw new Error("BarList did not paint");`,
  );
}

function tremorSpark() {
  return tremorChart(
    `import { SparkLineChart } from "@tremor/react";`,
    `
function element(payload) {
  const values = payload.data;
  const data = new Array(values.length);
  for (let i = 0; i < values.length; i++) data[i] = { i, y: values[i] };
  return createElement(SparkLineChart, {
    data,
    categories: ["y"],
    index: "i",
    className: "bench-spark",
    showAnimation: false,
    animationDuration: 0,
  });
}
`,
    `painted(host, "svg");`,
  );
}

function tremorRing() {
  return tremorChart(
    `import { ProgressCircle } from "@tremor/react";`,
    `
function element(payload) {
  const metric = payload.metric;
  const span = metric.max - metric.min || 1;
  const value = Math.max(0, Math.min(100, ((metric.value - metric.min) / span) * 100));
  return createElement(ProgressCircle, { value, radius: 120, strokeWidth: 14, showAnimation: false });
}
`,
    `painted(host, "svg");`,
  );
}

function tremorKpi() {
  return tremorChart(
    `import { BadgeDelta, Metric, SparkLineChart } from "@tremor/react";`,
    `
function element(payload) {
  const metric = payload.metric;
  const values = payload.data;
  const data = new Array(values.length);
  for (let i = 0; i < values.length; i++) data[i] = { i, y: values[i] };
  const deltaType = metric.delta >= 0 ? "increase" : "decrease";
  const text = (metric.delta * 100).toFixed(1) + "%";
  return createElement("div", { style: { width: "640px", height: "360px" } },
    createElement(Metric, null, String(metric.value)),
    createElement(BadgeDelta, { deltaType }, text),
    createElement(SparkLineChart, { data, categories: ["y"], index: "i", showAnimation: false, animationDuration: 0 }));
}
`,
    `if (!host.textContent.includes(String(payload.metric.value))) throw new Error("KPI did not paint");
    painted(host, "svg");`,
  );
}

function agCommunity(factory, optionBody, mark) {
  return `
import { AgCharts, AllCommunityModule, ModuleRegistry, SparklinePresetModule } from "ag-charts-community";
ModuleRegistry.registerModules([AllCommunityModule, SparklinePresetModule]);
${optionBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  let chart;
  const paint = async (payload) => {
    chart = ${factory}(option(payload, host));
    await chart.waitForUpdate();
    painted(host, ${JSON.stringify(mark)});
    await frames();
  };
  const update = async (payload) => {
    await chart.update(option(payload, host));
    await chart.waitForUpdate();
    await frames();
  };
  return { paint, update };
}
`;
}

function agEnterprise(factory, optionBody, mark) {
  return `
import { AgCharts, AllEnterpriseModule, ModuleRegistry } from "ag-charts-enterprise";
ModuleRegistry.registerModules([AllEnterpriseModule]);
${optionBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  let chart;
  const paint = async (payload) => {
    chart = ${factory}(option(payload, host));
    await chart.waitForUpdate();
    painted(host, ${JSON.stringify(mark)});
    await frames();
  };
  const update = async (payload) => {
    await chart.update(option(payload, host));
    await chart.waitForUpdate();
    await frames();
  };
  return { paint, update };
}
`;
}

function agSpark() {
  return agCommunity(
    "AgCharts.__createSparkline",
    `
function option(payload, host) {
  const values = payload.data;
  const data = new Array(values.length);
  for (let i = 0; i < values.length; i++) data[i] = { i, y: values[i] };
  return {
    container: host,
    width: 640,
    height: 360,
    data,
    type: "line",
    xKey: "i",
    yKey: "y",
    tooltip: { enabled: false },
  };
}
`,
    "canvas",
  );
}

function agWaterfall() {
  return agEnterprise(
    "AgCharts.create",
    `
function option(payload, host) {
  const rows = rowsOf(payload);
  const data = [];
  const totals = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (i > 0 && row.total) {
      totals.push({ totalType: "total", index: data.length - 1, axisLabel: row.step });
      continue;
    }
    data.push({ step: row.step, amount: row.amount });
  }
  return {
    container: host,
    width: 640,
    height: 360,
    animation: { enabled: false },
    tooltip: { enabled: false },
    legend: { enabled: false },
    data,
    series: [{ type: "waterfall", xKey: "step", yKey: "amount", totals }],
  };
}
`,
    "canvas",
  );
}

function agQuadrant() {
  return agEnterprise(
    "AgCharts.createQuadrantChart",
    `
function option(payload, host) {
  const names = payload.quadrants;
  return {
    container: host,
    width: 640,
    height: 360,
    animation: { enabled: false },
    tooltip: { enabled: false },
    legend: { enabled: false },
    data: rowsOf(payload),
    xKey: "x",
    yKey: "y",
    labelKey: "name",
    pivot: { x: 0.5, y: 0.5 },
    xAxis: { min: 0, max: 1 },
    yAxis: { min: 0, max: 1 },
    regions: {
      topLeft: { label: { text: names[0] } },
      topRight: { label: { text: names[1] } },
      bottomLeft: { label: { text: names[2] } },
      bottomRight: { label: { text: names[3] } },
    },
  };
}
`,
    "canvas",
  );
}

function agRing() {
  return agEnterprise(
    "AgCharts.createGauge",
    `
function option(payload, host) {
  const metric = payload.metric;
  return {
    type: "radial-gauge",
    container: host,
    width: 640,
    height: 360,
    value: metric.value,
    startAngle: 0,
    endAngle: 360,
    needle: { enabled: false },
    scale: { min: metric.min, max: metric.max },
    secondaryLabel: { text: metric.label },
  };
}
`,
    "canvas",
  );
}

function agCandle() {
  return agEnterprise(
    "AgCharts.create",
    `
function option(payload, host) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const data = new Array(n);
  for (let i = 0; i < n; i++) {
    data[i] = {
      x: cols.x[i],
      open: cols.open[i],
      high: cols.high[i],
      low: cols.low[i],
      close: cols.close[i],
    };
  }
  return {
    container: host,
    width: 640,
    height: 360,
    animation: { enabled: false },
    tooltip: { enabled: false },
    legend: { enabled: false },
    data,
    series: [{ type: "candlestick", xKey: "x", openKey: "open", highKey: "high", lowKey: "low", closeKey: "close" }],
  };
}
`,
    "canvas",
  );
}

function amChart(imports, buildBody) {
  return `
import * as am5 from "@amcharts/amcharts5";
${imports}
${buildBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const root = am5.Root.new(host);
  const api = build(root);
  const paint = async (payload) => {
    await api.render(payload);
    painted(host, "canvas");
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function amGantt() {
  return amChart(
    `import * as am5gantt from "@amcharts/amcharts5/gantt";`,
    `
function build(root) {
  const chart = root.container.children.push(am5gantt.Gantt.new(root, {
    width: am5.p100,
    height: am5.p100,
    editable: false,
    durationUnit: "day",
    excludeWeekends: false,
  }));
  const render = (payload) => new Promise((resolve) => {
    const rows = rowsOf(payload);
    chart.series.events.once("datavalidated", () => resolve());
    chart.yAxis.data.setAll(rows.map((row) => ({ id: row.id, name: row.task })));
    chart.series.data.setAll(rows.map((row) => ({
      id: row.id,
      start: dayMs(row.start),
      duration: row.milestone || !row.end ? 0 : Math.max(1, Math.round((dayMs(row.end) - dayMs(row.start)) / 86400000)),
      progress: Math.round((row.progress || 0) * 100),
      linkTo: row.depends ? [row.depends] : [],
    })));
  });
  return { render };
}
`,
  );
}

function amVenn() {
  return amChart(
    `import * as am5venn from "@amcharts/amcharts5/venn";`,
    `
function build(root) {
  const series = root.container.children.push(am5venn.Venn.new(root, {
    width: am5.p100,
    height: am5.p100,
    categoryField: "name",
    valueField: "value",
    intersectionsField: "sets",
  }));
  const render = (payload) => new Promise((resolve) => {
    series.events.once("datavalidated", () => resolve());
    series.data.setAll(rowsOf(payload).map((row) => {
      const parts = String(row.set).split("+");
      if (parts.length === 1) return { name: parts[0], value: row.size };
      return { name: row.set, value: row.size, sets: parts };
    }));
  });
  return { render };
}
`,
  );
}

function amCandle() {
  return amChart(
    `import * as am5xy from "@amcharts/amcharts5/xy";`,
    `
function build(root) {
  const chart = root.container.children.push(am5xy.XYChart.new(root, {
    width: am5.p100,
    height: am5.p100,
    panX: false,
    panY: false,
  }));
  const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}) }));
  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));
  const series = chart.series.push(am5xy.CandlestickSeries.new(root, {
    xAxis,
    yAxis,
    valueXField: "x",
    openValueYField: "open",
    highValueYField: "high",
    lowValueYField: "low",
    valueYField: "close",
  }));
  const render = (payload) => new Promise((resolve) => {
    const cols = columnsOf(payload);
    const n = cols.x.length;
    const data = new Array(n);
    for (let i = 0; i < n; i++) {
      data[i] = { x: cols.x[i], open: cols.open[i], high: cols.high[i], low: cols.low[i], close: cols.close[i] };
    }
    series.events.once("datavalidated", () => resolve());
    series.data.setAll(data);
  });
  return { render };
}
`,
  );
}

function googleChart(packages, drawBody) {
  return `
${drawBody}
function loadGoogle(packages) {
  return new Promise((resolve, reject) => {
    const fail = setTimeout(() => reject(new Error("Google Charts loader timed out")), 12000);
    const start = () => {
      if (!globalThis.google || !google.charts) {
        clearTimeout(fail);
        reject(new Error("Google Charts loader did not create google.charts"));
        return;
      }
      google.charts.load("current", { packages });
      google.charts.setOnLoadCallback(() => {
        clearTimeout(fail);
        resolve();
      });
    };
    if (globalThis.google && google.charts) {
      start();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.onload = start;
    script.onerror = () => {
      clearTimeout(fail);
      reject(new Error("Google Charts loader failed to load"));
    };
    document.head.append(script);
  });
}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  let chart;
  let ready;
  const paint = async (payload) => {
    if (!ready) ready = loadGoogle(${JSON.stringify(packages)});
    await ready;
    chart = await draw(host, payload, chart);
    if (!host.childElementCount && !host.querySelector("svg, iframe, table")) {
      throw new Error("Google Charts did not paint");
    }
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function googleDrawHelper() {
  return `
function whenReady(chart, draw) {
  return new Promise((resolve) => {
    const finish = () => resolve();
    google.visualization.events.addListener(chart, "ready", finish);
    draw();
  });
}
`;
}

function googleGantt() {
  return googleChart(
    ["gantt"],
    `
${googleDrawHelper()}
async function draw(host, payload, chart) {
  const data = new google.visualization.DataTable();
  data.addColumn("string", "Task ID");
  data.addColumn("string", "Task Name");
  data.addColumn("string", "Resource");
  data.addColumn("date", "Start");
  data.addColumn("date", "End");
  data.addColumn("number", "Duration");
  data.addColumn("number", "Percent Complete");
  data.addColumn("string", "Dependencies");
  for (const row of rowsOf(payload)) {
    const start = new Date(dayMs(row.start));
    const end = row.end ? new Date(dayMs(row.end)) : start;
    data.addRow([
      row.id,
      row.task,
      row.section || null,
      start,
      row.milestone ? start : end,
      null,
      Math.round((row.progress || 0) * 100),
      row.depends || null,
    ]);
  }
  const next = chart || new google.visualization.Gantt(host);
  await whenReady(next, () => next.draw(data, { width: 640, height: 360 }));
  return next;
}
`,
  );
}

function googleTimeline() {
  return googleChart(
    ["timeline"],
    `
${googleDrawHelper()}
async function draw(host, payload, chart) {
  const data = new google.visualization.DataTable();
  data.addColumn({ type: "string", id: "Row" });
  data.addColumn({ type: "string", id: "Label" });
  data.addColumn({ type: "date", id: "Start" });
  data.addColumn({ type: "date", id: "End" });
  for (const row of rowsOf(payload)) {
    if (row.kind === "period") {
      data.addRow([row.label, row.label, new Date(dayMs(row.start)), new Date(dayMs(row.end))]);
    } else {
      const at = new Date(dayMs(row.date));
      data.addRow([row.label, row.label, at, at]);
    }
  }
  const next = chart || new google.visualization.Timeline(host);
  await whenReady(next, () => next.draw(data, { width: 640, height: 360 }));
  return next;
}
`,
  );
}

function googleCandle() {
  return googleChart(
    ["corechart"],
    `
${googleDrawHelper()}
async function draw(host, payload, chart) {
  const cols = columnsOf(payload);
  const data = new google.visualization.DataTable();
  data.addColumn("number", "x");
  data.addColumn("number", "low");
  data.addColumn("number", "open");
  data.addColumn("number", "close");
  data.addColumn("number", "high");
  const n = cols.x.length;
  for (let i = 0; i < n; i++) {
    data.addRow([cols.x[i], cols.low[i], cols.open[i], cols.close[i], cols.high[i]]);
  }
  const next = chart || new google.visualization.CandlestickChart(host);
  await whenReady(next, () => next.draw(data, { width: 640, height: 360, legend: "none" }));
  return next;
}
`,
  );
}

function mermaidChart(textBody) {
  return `
import mermaid from "mermaid";
mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "neutral" });
let seq = 0;
${textBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const paint = async (payload) => {
    const id = "benchMermaid" + (seq++);
    const rendered = await mermaid.render(id, text(payload));
    host.innerHTML = rendered.svg;
    const svg = host.querySelector("svg");
    if (!svg) throw new Error("Mermaid did not paint");
    svg.setAttribute("width", "640");
    svg.setAttribute("height", "360");
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function mermaidGantt() {
  return mermaidChart(`
function text(payload) {
  const lines = ["gantt", "    dateFormat YYYY-MM-DD", "    axisFormat %Y-%m-%d"];
  let section = "";
  for (const row of rowsOf(payload)) {
    if (row.section !== section) {
      section = row.section;
      lines.push("    section " + section);
    }
    if (row.milestone || !row.end) {
      lines.push("    " + row.task + " :milestone, " + row.id + ", " + row.start + ", 0d");
    } else {
      const dur = Math.max(1, Math.round((dayMs(row.end) - dayMs(row.start)) / 86400000));
      lines.push("    " + row.task + " :" + row.id + ", " + row.start + ", " + dur + "d");
    }
  }
  return lines.join("\\n");
}
`);
}

function mermaidJourney() {
  return mermaidChart(`
function text(payload) {
  const lines = ["journey", "    title Journey"];
  let section = "";
  for (const row of rowsOf(payload)) {
    if (row.section !== section) {
      section = row.section;
      lines.push("    section " + section);
    }
    const actors = String(row.actors).replaceAll(",", " and");
    lines.push("      " + row.step + ": " + row.score + ": " + actors);
  }
  return lines.join("\\n");
}
`);
}

function mermaidQuadrant() {
  return mermaidChart(`
function text(payload) {
  const names = payload.quadrants;
  const lines = [
    "quadrantChart",
    "    x-axis Low effort --> High effort",
    "    y-axis Low impact --> High impact",
    "    quadrant-1 " + names[1],
    "    quadrant-2 " + names[0],
    "    quadrant-3 " + names[2],
    "    quadrant-4 " + names[3],
  ];
  for (const row of rowsOf(payload)) {
    const x = Math.min(1, Math.max(0, row.x));
    const y = Math.min(1, Math.max(0, row.y));
    lines.push("    " + row.name + ": [" + x + ", " + y + "]");
  }
  return lines.join("\\n");
}
`);
}

function mermaidTimeline() {
  return mermaidChart(`
function text(payload) {
  const lines = ["timeline", "    title Timeline", "    section Marks"];
  for (const row of rowsOf(payload)) {
    if (row.kind === "period") lines.push("        " + row.label + " : " + row.start + " to " + row.end);
    else lines.push("        " + row.label + " : " + row.date);
  }
  return lines.join("\\n");
}
`);
}

function mermaidVenn() {
  return mermaidChart(`
function text(payload) {
  const lines = ["venn-beta", "    title Sets"];
  for (const row of rowsOf(payload)) {
    const parts = String(row.set).split("+");
    if (parts.length === 1) lines.push("    set " + parts[0] + ": " + row.size);
    else lines.push("    union " + parts.join(",") + ": " + row.size);
  }
  return lines.join("\\n");
}
`);
}

function muiChart(imports, elementBody) {
  return `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
${imports}
const theme = createTheme();
${elementBody}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const root = createRoot(host);
  const paint = async (payload) => {
    flushSync(() => root.render(createElement(ThemeProvider, { theme }, element(payload))));
    painted(host, "svg");
    await frames();
  };
  return { paint, update: paint };
}
`;
}

function muiSpark() {
  return muiChart(
    `import { SparkLineChart } from "@mui/x-charts/SparkLineChart";`,
    `
function element(payload) {
  return createElement(SparkLineChart, {
    data: payload.data,
    width: 640,
    height: 360,
    showTooltip: false,
    skipAnimation: true,
    plotType: "line",
  });
}
`,
  );
}

function muiRing() {
  return muiChart(
    `import { Gauge } from "@mui/x-charts/Gauge";`,
    `
function element(payload) {
  const metric = payload.metric;
  return createElement(Gauge, {
    width: 640,
    height: 360,
    value: metric.value,
    valueMin: metric.min,
    valueMax: metric.max,
    startAngle: 0,
    endAngle: 360,
    innerRadius: "78%",
    outerRadius: "100%",
    skipAnimation: true,
    text: metric.label,
  });
}
`,
  );
}

function lightweightCandle() {
  return `
import { CandlestickSeries, HistogramSeries, createChart } from "lightweight-charts";
function rows(payload) {
  const cols = columnsOf(payload);
  const n = cols.x.length;
  const candles = new Array(n);
  const volume = new Array(n);
  for (let i = 0; i < n; i++) {
    const time = cols.x[i];
    candles[i] = { time, open: cols.open[i], high: cols.high[i], low: cols.low[i], close: cols.close[i] };
    volume[i] = { time, value: cols.volume[i] };
  }
  return { candles, volume };
}
function setup() {
  const host = document.createElement("div");
  host.style.cssText = "width:640px;height:360px";
  document.getElementById("root").replaceChildren(host);
  const chart = createChart(host, {
    width: 640,
    height: 360,
    layout: { attributionLogo: true },
    timeScale: { visible: true },
    handleScroll: false,
    handleScale: false,
  });
  const candles = chart.addSeries(CandlestickSeries);
  const volume = chart.addSeries(HistogramSeries, { priceScaleId: "volume" });
  chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
  candles.priceScale().applyOptions({ scaleMargins: { top: 0.05, bottom: 0.28 } });
  const paint = async (payload) => {
    const data = rows(payload);
    candles.setData(data.candles);
    volume.setData(data.volume);
    painted(host, "canvas");
    await frames();
  };
  return { paint, update: paint };
}
`;
}

const BUILT = {
  highcharts: {
    waterfall: [`Waterfall series. The first point is the opening value. Later totals use isSum. ${HC_CREDIT}`, hcWaterfall],
    gantt: [`ganttChart. Tasks keep id, start, end, milestone, dependency, and completed. ${HC_CREDIT}`, hcGantt],
    venn: [`venn series. Each region is a sets array and a value, the same rows as ChartKit. ${HC_CREDIT}`, hcVenn],
    timeline: [`timeline series for events plus xrange for periods, both native series on one datetime axis. ${HC_CREDIT}`, hcTimeline],
    "progress-ring": [`solidgauge with pane angles 0 to 360 and an inner radius, one value over metric min and max. Not the needle gauge. ${HC_CREDIT}`, hcRing],
    candlestick: [`candlestick series plus the volume column on a second y axis. ${HC_CREDIT}`, hcCandle],
  },
  plotly: {
    waterfall: ["waterfall trace. Totals are measure absolute and steps are measure relative. plotly.js-dist-min 4.1.2.", plotlyWaterfall],
    kpi: ["indicator trace, mode number+delta. reference is value / (1 + delta), so the relative delta matches the metric. The fixed 24-point sparkline is not part of this trace.", plotlyKpi],
    candlestick: ["candlestick trace plus a volume bar on yaxis2.", plotlyCandle],
  },
  apexcharts: {
    waterfall: [`waterfall chart. The opening row is a y step. The closing row is isTotal. The feature import is apexcharts/features/waterfall. ${APEX_NOTE}`, apexWaterfall],
    "progress-ring": [`radialBar with one value, startAngle 0 and endAngle 360. That is ApexCharts' circular progress, not the radial-bar gallery shape. ${APEX_NOTE}`, apexRing],
    candlestick: [`candlestick chart. y is [open, high, low, close]. Volume is not on this axis. ${APEX_NOTE}`, apexCandle],
  },
  tremor: {
    "bar-list": ["BarList with sortOrder none, so the row order matches the data. Tailwind utilities those class names mean are inlined; the package ships no CSS. showAnimation is false.", tremorBarList, "html"],
    sparkline: ["SparkLineChart, one line, axes hidden by the component. showAnimation is false. The frame is forced to 640×360.", tremorSpark],
    "progress-ring": ["ProgressCircle. value is the metric as a percent of min and max. showAnimation is false. radius 120.", tremorRing],
    kpi: ["Metric, BadgeDelta, and SparkLineChart of the fixed 24-point series. N is the metric. Same React tree a Tremor KPI card uses.", tremorKpi],
  },
  agcharts: {
    sparkline: ["AgCharts.__createSparkline, type line, from ag-charts-community. Axes stay off. No license key.", agSpark],
    waterfall: [`waterfall series. The opening amount is the first bar. The closing row is a total item after the last step. ${AG_TRIAL}`, agWaterfall],
    quadrant: [`createQuadrantChart. Pivot is 0.5, 0.5. Region labels are the four ChartKit quadrant names. ${AG_TRIAL}`, agQuadrant],
    "progress-ring": [`radial-gauge, needle disabled, angles 0 to 360, scale min and max from the metric. ${AG_TRIAL}`, agRing],
    candlestick: [`candlestick series. Volume is omitted so it does not share the price scale. ${AG_TRIAL}`, agCandle],
  },
  amcharts: {
    gantt: [`Gantt chart. editable is false. duration is the day span, progress is 0–100, linkTo is the dependency. ${AM_LOGO}`, amGantt],
    venn: [`Venn series. Single names are circles. A+B rows are intersections. ${AM_LOGO}`, amVenn],
    candlestick: [`CandlestickSeries on a value axis. Volume is omitted. ${AM_LOGO}`, amCandle],
  },
  googlecharts: {
    gantt: ["Gantt chart from the current Google Charts loader. Columns are the Gantt data table, including dependencies and percent complete.", googleGantt],
    timeline: ["Timeline chart. Periods keep start and end. An event is a zero-length span on its date.", googleTimeline],
    candlestick: ["CandlestickChart. Columns are x, low, open, close, high. Volume is not part of this chart.", googleCandle],
  },
  lightweight: {
    candlestick: [`addCandlestickSeries plus a histogram volume series. ${LW_NOTE}`, lightweightCandle],
  },
  muix: {
    sparkline: ["SparkLineChart from @mui/x-charts, plotType line, tooltip off, skipAnimation. The data prop is the number array.", muiSpark],
    "progress-ring": ["Gauge with startAngle 0 and endAngle 360, the component's full ring. innerRadius 78%. No needle.", muiRing],
  },
  mermaid: {
    gantt: ["gantt diagram. Tasks use their start date and duration. Milestones are milestone rows. The after keyword is not used, so a dependency does not move the bar.", mermaidGantt],
    journey: ["journey diagram. Sections, steps, scores, and actors are the same rows. Scores stay 1–5.", mermaidJourney],
    quadrant: ["quadrantChart. quadrant-2 is the top-left ChartKit name. Points are [x, y] on the unit square.", mermaidQuadrant],
    timeline: ["timeline diagram. Periods are written as a start-to-end label. Mermaid timeline has no span mark.", mermaidTimeline],
    venn: ["venn-beta. set rows are the circles. union rows are the overlap sizes.", mermaidVenn],
  },
};

const defs = new Map(chartTypeDefs.map((def) => [def.id, def]));

function reasonFor(lib, chart) {
  const specific = SPECIFIC[lib.id]?.[chart];
  if (specific) return specific;
  if (SHARED[chart]) return SHARED[chart];
  return `${lib.library} has no native ${chart} chart.`;
}

export function phase3Matrix() {
  const rows = [];
  for (const lib of PHASE3_LIBS) {
    for (const chart of PHASE3_CHARTS) {
      const built = BUILT[lib.id]?.[chart];
      rows.push({
        libraryId: lib.id,
        library: lib.library,
        chart,
        status: built ? "native" : "unsupported",
        method: built ? built[0] : reasonFor(lib, chart),
        adapterId: built ? `${lib.id}-${chart}` : null,
      });
    }
  }
  return rows;
}

export function phase3Adapters() {
  const adapters = [];
  for (const lib of PHASE3_LIBS) {
    const built = BUILT[lib.id];
    if (!built) continue;
    for (const [chart, entry] of Object.entries(built)) {
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

export function phase3AdapterIds() {
  return new Set(phase3Adapters().map((adapter) => adapter.id));
}

function librarySelected(libId, only) {
  if (!only) return true;
  if (only.has(libId)) return true;
  const prefix = `${libId}-`;
  for (const id of only) if (id.startsWith(prefix)) return true;
  return false;
}

export function unsupportedPhase3Cells({ only = null, types = null } = {}) {
  const cells = [];
  for (const lib of PHASE3_LIBS) {
    if (!librarySelected(lib.id, only)) continue;
    for (const chart of PHASE3_CHARTS) {
      if (BUILT[lib.id]?.[chart]) continue;
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
