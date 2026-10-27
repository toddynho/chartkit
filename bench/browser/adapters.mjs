import { chartTypeAdapters } from "./chart-types.mjs";

const prelude = `
import { makeSeries } from "../lib/series.mjs";
function heap() {
  return performance.memory ? performance.memory.usedJSHeapSize : null;
}
function frames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
async function timed(n, render, update) {
  if (globalThis.gc) globalThis.gc();
  const before = heap();
  const first = makeSeries(n, 1);
  const t0 = performance.now();
  const rendered = await render(first);
  const initialMs = performance.now() - t0;
  const mid = heap();
  const second = makeSeries(n, 2);
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
`;

function chartkitSource(sampling, library) {
  return prelude + `
import { createRenderer } from "../../packages/core/src/render.ts";
import { line } from "../../packages/core/src/charts/line.ts";
import { bindSampling } from "../../packages/core/src/sampling-run.ts";
import { notedDense, notedLinear, useSampler } from "../../packages/core/src/sampling.ts";
useSampler(bindSampling({ notedDense, notedLinear }));
const render = createRenderer([line]);
function spec(xs, ys) {
  return {
    version: "1",
    type: "line",
    data: { columns: { x: xs, y: ys } },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none", sampling: ${JSON.stringify(sampling)} },
    size: { width: 640, height: 360 },
    locale: "en-US",
    a11y: { alt: "Indexed line of one series." },
  };
}
globalThis.__bench = {
  library: ${JSON.stringify(library)},
  renderer: "svg",
  chart: "line",
  async run(n) {
    const host = document.createElement("div");
    document.getElementById("root").replaceChildren(host);
    const paint = async (data) => {
      const t = performance.now();
      host.innerHTML = render(spec(data.xs, data.ys));
      const renderMs = performance.now() - t;
      if (host.innerHTML.includes("ck-chart-error")) {
        throw new Error(host.textContent.replace(/\\s+/g, " ").slice(0, 240));
      }
      await frames();
      return renderMs;
    };
    return timed(n, paint, paint);
  },
};
`;
}

const uplot = prelude + `
import uPlot from "uplot";
import css from "uplot/dist/uPlot.min.css";
const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
const opts = {
  width: 640,
  height: 360,
  series: [{}, { stroke: "#22c55e", width: 1 }],
  axes: [{}, {}],
  legend: { show: false },
};
globalThis.__bench = {
  library: "uPlot",
  renderer: "canvas",
  async run(n) {
    const host = document.createElement("div");
    document.getElementById("root").replaceChildren(host);
    let plot;
    return timed(n, async (data) => {
      plot = new uPlot(opts, [data.xs, data.ys], host);
      await frames();
    }, async (data) => {
      plot.setData([data.xs, data.ys]);
      await frames();
    });
  },
};
`;

const chartjs = prelude + `
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);
function config(ys) {
  return {
    type: "line",
    data: { datasets: [{ data: ys, pointRadius: 0, borderWidth: 1, normalized: true }] },
    options: {
      animation: false,
      responsive: false,
      parsing: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { type: "linear", display: true }, y: { type: "linear", display: true } },
    },
  };
}
globalThis.__bench = {
  library: "Chart.js",
  renderer: "canvas",
  async run(n) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    document.getElementById("root").replaceChildren(canvas);
    let chart;
    return timed(n, async (data) => {
      const pairs = Array.from(data.ys, (y, i) => ({ x: data.xs[i], y }));
      chart = new Chart(canvas, config(pairs));
      await frames();
    }, async (data) => {
      chart.data.datasets[0].data = Array.from(data.ys, (y, i) => ({ x: data.xs[i], y }));
      chart.update("none");
      await frames();
    });
  },
};
`;

const echarts = prelude + `
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([LineChart, GridComponent, CanvasRenderer]);
function option(data) {
  const pairs = new Array(data.ys.length);
  for (let i = 0; i < data.ys.length; i++) pairs[i] = [data.xs[i], data.ys[i]];
  return {
    animation: false,
    xAxis: { type: "value" },
    yAxis: { type: "value" },
    series: [{ type: "line", showSymbol: false, data: pairs }],
  };
}
function settle(chart) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ECharts finished event did not fire within 20s")), 20000);
    chart.on("finished", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
globalThis.__bench = {
  library: "ECharts",
  renderer: "canvas",
  async run(n) {
    const host = document.createElement("div");
    host.style.cssText = "width:640px;height:360px";
    document.getElementById("root").replaceChildren(host);
    const chart = echarts.init(host, null, { renderer: "canvas", width: 640, height: 360 });
    return timed(n, async (data) => {
      const done = settle(chart);
      chart.setOption(option(data), true);
      await done;
      await frames();
    }, async (data) => {
      const done = settle(chart);
      chart.setOption(option(data), true);
      await done;
      await frames();
    });
  },
};
`;

const recharts = prelude + `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { LineChart, Line, XAxis, YAxis } from "recharts";
function element(rows) {
  return createElement(LineChart, { width: 640, height: 360, data: rows },
    createElement(XAxis, { dataKey: "x" }),
    createElement(YAxis),
    createElement(Line, { dataKey: "y", dot: false, isAnimationActive: false }));
}
globalThis.__bench = {
  library: "Recharts",
  renderer: "svg",
  async run(n) {
    const host = document.createElement("div");
    document.getElementById("root").replaceChildren(host);
    const root = createRoot(host);
    const draw = async (data) => {
      const rows = Array.from(data.ys, (y, i) => ({ x: data.xs[i], y }));
      flushSync(() => root.render(element(rows)));
      await frames();
    };
    return timed(n, draw, draw);
  },
};
`;

const nivo = prelude + `
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Line } from "@nivo/line";
function element(points) {
  return createElement(Line, {
    width: 640,
    height: 360,
    data: [{ id: "y", data: points }],
    enablePoints: false,
    animate: false,
    isInteractive: false,
    xScale: { type: "linear" },
    yScale: { type: "linear" },
  });
}
globalThis.__bench = {
  library: "Nivo",
  renderer: "svg",
  async run(n) {
    const host = document.createElement("div");
    document.getElementById("root").replaceChildren(host);
    const root = createRoot(host);
    const draw = async (data) => {
      const points = Array.from(data.ys, (y, i) => ({ x: data.xs[i], y }));
      flushSync(() => root.render(element(points)));
      await frames();
    };
    return timed(n, draw, draw);
  },
};
`;

const plot = prelude + `
import * as Plot from "@observablehq/plot";
function draw(data) {
  const rows = Array.from(data.ys, (y, i) => ({ x: data.xs[i], y }));
  const node = Plot.plot({
    width: 640,
    height: 360,
    marks: [Plot.line(rows, { x: "x", y: "y" })],
  });
  document.getElementById("root").replaceChildren(node);
}
globalThis.__bench = {
  library: "Observable Plot",
  renderer: "svg",
  async run(n) {
    const paint = async (data) => {
      draw(data);
      await frames();
    };
    return timed(n, paint, paint);
  },
};
`;

function chartkitCanvasSource() {
  return prelude + `
import { paintSpec, lastPaintProfile } from "../../packages/core/src/canvas/paint.ts";
function spec(xs, ys) {
  return {
    version: "1",
    type: "line",
    render: "canvas",
    data: { columns: { x: xs, y: ys } },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none", sampling: "auto" },
    size: { width: 640, height: 360 },
    locale: "en-US",
    a11y: { alt: "Indexed line of one series." },
  };
}
globalThis.__bench = {
  library: "ChartKit canvas",
  renderer: "canvas",
  chart: "line",
  async run(n) {
    const host = document.createElement("div");
    host.style.cssText = "position:relative;width:640px;height:360px";
    document.getElementById("root").replaceChildren(host);
    const paint = async (data) => {
      const t = performance.now();
      const ok = paintSpec(host, spec(data.xs, data.ys));
      if (!ok || host.innerHTML.includes("ck-chart-error")) {
        throw new Error(host.textContent.replace(/\\s+/g, " ").slice(0, 240) || "canvas scene did not paint");
      }
      const renderMs = performance.now() - t;
      globalThis.__ckProfile = lastPaintProfile();
      await frames();
      return renderMs;
    };
    return timed(n, paint, paint);
  },
};
`;
}

const lineWhy = "Existing line sweep. sampling auto is the homepage line. canvas and sampling-none are variants of the same type. These cells use the two-frame paint protocol, not the hover-steady figure in catalog/public/benchmarks.json.";

export const browserAdapters = [
  {
    id: "chartkit",
    source: chartkitSource("auto", "ChartKit"),
    chart: "line",
    homepageRow: "line",
    variant: "sampling-auto",
    nMeaning: "points in one series; x[i] = i",
    why: lineWhy,
  },
  {
    id: "chartkit-canvas",
    source: chartkitCanvasSource(),
    chart: "line",
    homepageRow: "line",
    variant: "canvas",
    nMeaning: "points in one series; x[i] = i",
    why: lineWhy,
  },
  {
    id: "chartkit-full",
    source: chartkitSource("none", "ChartKit sampling none"),
    sizes: [100_000, 1_000_000],
    chart: "line",
    homepageRow: "line",
    variant: "sampling-none",
    nMeaning: "points in one series; x[i] = i",
    why: lineWhy,
  },
  { id: "uplot", source: uplot },
  { id: "chartjs", source: chartjs },
  { id: "echarts", source: echarts },
  { id: "recharts", source: recharts },
  { id: "nivo", source: nivo },
  { id: "plot", source: plot },
  ...chartTypeAdapters(),
];
