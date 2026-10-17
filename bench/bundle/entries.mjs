/** Entry source for each published chart bundle. esbuild tree-shakes from these imports. */

const chartkitLine = `import { createRenderer } from "../../packages/core/src/render.ts";
import { line } from "../../packages/core/src/charts/line.ts";
const render = createRenderer([line]);
export function draw() {
  return render({
    version: "1",
    type: "line",
    data: [{ month: "Jan", revenue: 120 }, { month: "Feb", revenue: 150 }],
    encoding: { x: "month", y: "revenue" },
    mark: { curve: "linear", points: "none" },
    size: { width: 640, height: 360 },
    a11y: { alt: "Revenue rose from January to February." },
  });
}
`;

const chartkitBar = `import { createRenderer } from "../../packages/core/src/render.ts";
import { bar } from "../../packages/core/src/charts/bar.ts";
const render = createRenderer([bar]);
export function draw() {
  return render({
    version: "1",
    type: "bar",
    data: [{ month: "Jan", signups: 100 }, { month: "Feb", signups: 180 }],
    encoding: { x: "month", y: "signups" },
    size: { width: 640, height: 360 },
    a11y: { alt: "Signups were higher in February." },
  });
}
`;

const chartkitDonut = `import { createRenderer } from "../../packages/core/src/render.ts";
import { donut } from "../../packages/core/src/charts/donut.ts";
const render = createRenderer([donut]);
export function draw() {
  return render({
    version: "1",
    type: "donut",
    data: [{ label: "Search", value: 42 }, { label: "Direct", value: 28 }],
    encoding: { x: "label", y: "value" },
    mark: { innerRadius: 0.6 },
    size: { width: 640, height: 360 },
    a11y: { alt: "Search is larger than direct." },
  });
}
`;

const chartkitAll = `import { render } from "../../packages/core/src/all.ts";
export function draw(type) {
  if (type === "bar") {
    return render({
      version: "1", type: "bar",
      data: [{ month: "Jan", signups: 100 }],
      encoding: { x: "month", y: "signups" },
      a11y: { alt: "January signups." },
    });
  }
  if (type === "donut") {
    return render({
      version: "1", type: "donut",
      data: [{ label: "Search", value: 42 }],
      encoding: { x: "label", y: "value" },
      a11y: { alt: "Search." },
    });
  }
  return render({
    version: "1", type: "line",
    data: [{ month: "Jan", revenue: 120 }],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt: "January revenue." },
  });
}
`;

const uplotLine = `import uPlot from "uplot";
export function draw(el) {
  return new uPlot({
    width: 640,
    height: 360,
    series: [{}, { stroke: "#22c55e", width: 1 }],
  }, [[0, 1, 2], [120, 150, 132]], el);
}
`;

const uplotBar = `import uPlot from "uplot";
export function draw(el) {
  return new uPlot({
    width: 640,
    height: 360,
    series: [{}, { stroke: "#22c55e", fill: "#22c55e", paths: uPlot.paths.bars() }],
  }, [[0, 1, 2], [100, 180, 150]], el);
}
`;

const chartjsLine = `import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);
export function draw(canvas) {
  return new Chart(canvas, {
    type: "line",
    data: { labels: ["Jan", "Feb"], datasets: [{ data: [120, 150], pointRadius: 0 }] },
    options: { animation: false, responsive: false },
  });
}
`;

const chartjsBar = `import { Chart, BarController, BarElement, LinearScale, CategoryScale } from "chart.js";
Chart.register(BarController, BarElement, LinearScale, CategoryScale);
export function draw(canvas) {
  return new Chart(canvas, {
    type: "bar",
    data: { labels: ["Jan", "Feb"], datasets: [{ data: [100, 180] }] },
    options: { animation: false, responsive: false },
  });
}
`;

const chartjsDonut = `import { Chart, DoughnutController, ArcElement } from "chart.js";
Chart.register(DoughnutController, ArcElement);
export function draw(canvas) {
  return new Chart(canvas, {
    type: "doughnut",
    data: { labels: ["Search", "Direct"], datasets: [{ data: [42, 28] }] },
    options: { animation: false, responsive: false },
  });
}
`;

const echartsLine = `import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([LineChart, GridComponent, CanvasRenderer]);
export function draw(el) {
  const chart = echarts.init(el, null, { renderer: "canvas", width: 640, height: 360 });
  chart.setOption({ xAxis: { type: "category", data: ["Jan", "Feb"] }, yAxis: { type: "value" }, series: [{ type: "line", data: [120, 150], showSymbol: false }] });
  return chart;
}
`;

const echartsBar = `import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([BarChart, GridComponent, CanvasRenderer]);
export function draw(el) {
  const chart = echarts.init(el, null, { renderer: "canvas", width: 640, height: 360 });
  chart.setOption({ xAxis: { type: "category", data: ["Jan", "Feb"] }, yAxis: { type: "value" }, series: [{ type: "bar", data: [100, 180] }] });
  return chart;
}
`;

const echartsDonut = `import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([PieChart, CanvasRenderer]);
export function draw(el) {
  const chart = echarts.init(el, null, { renderer: "canvas", width: 640, height: 360 });
  chart.setOption({ series: [{ type: "pie", radius: ["40%", "70%"], data: [{ name: "Search", value: 42 }, { name: "Direct", value: 28 }] }] });
  return chart;
}
`;

const rechartsLine = `import { createElement } from "react";
import { LineChart, Line, XAxis, YAxis } from "recharts";
export function draw() {
  return createElement(LineChart, { width: 640, height: 360, data: [{ month: "Jan", revenue: 120 }] },
    createElement(XAxis, { dataKey: "month" }),
    createElement(YAxis),
    createElement(Line, { dataKey: "revenue", dot: false, isAnimationActive: false }));
}
`;

const rechartsBar = `import { createElement } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
export function draw() {
  return createElement(BarChart, { width: 640, height: 360, data: [{ month: "Jan", signups: 100 }] },
    createElement(XAxis, { dataKey: "month" }),
    createElement(YAxis),
    createElement(Bar, { dataKey: "signups", isAnimationActive: false }));
}
`;

const rechartsDonut = `import { createElement } from "react";
import { PieChart, Pie } from "recharts";
export function draw() {
  return createElement(PieChart, { width: 640, height: 360 },
    createElement(Pie, { data: [{ name: "Search", value: 42 }], dataKey: "value", nameKey: "name", innerRadius: 60, outerRadius: 80, isAnimationActive: false }));
}
`;

const nivoLine = `import { createElement } from "react";
import { Line } from "@nivo/line";
export function draw() {
  return createElement(Line, { width: 640, height: 360, data: [{ id: "revenue", data: [{ x: "Jan", y: 120 }] }], enablePoints: false, animate: false });
}
`;

const nivoBar = `import { createElement } from "react";
import { Bar } from "@nivo/bar";
export function draw() {
  return createElement(Bar, { width: 640, height: 360, data: [{ month: "Jan", signups: 100 }], keys: ["signups"], indexBy: "month", animate: false });
}
`;

const nivoDonut = `import { createElement } from "react";
import { Pie } from "@nivo/pie";
export function draw() {
  return createElement(Pie, { width: 640, height: 360, data: [{ id: "Search", value: 42 }], innerRadius: 0.6, animate: false });
}
`;

const plotLine = `import * as Plot from "@observablehq/plot";
export function draw() {
  return Plot.plot({ width: 640, height: 360, marks: [Plot.lineY([{ y: 120 }, { y: 150 }], { y: "y" })] });
}
`;

const plotBar = `import * as Plot from "@observablehq/plot";
export function draw() {
  return Plot.plot({ width: 640, height: 360, marks: [Plot.barY([{ month: "Jan", signups: 100 }], { x: "month", y: "signups" })] });
}
`;

export const bundleEntries = [
  { id: "chartkit-minimal", library: "ChartKit minimal", chart: "line", renderer: "svg", react: "none", source: chartkitLine },
  { id: "chartkit-minimal", library: "ChartKit minimal", chart: "bar", renderer: "svg", react: "none", source: chartkitBar },
  { id: "chartkit-minimal", library: "ChartKit minimal", chart: "donut", renderer: "svg", react: "none", source: chartkitDonut },
  { id: "chartkit-all", library: "ChartKit all", chart: "line", renderer: "svg", react: "none", source: chartkitAll, note: "Same /all bundle for line, bar, and donut. It registers every chart and every theme and does not include the validator." },
  { id: "chartkit-all", library: "ChartKit all", chart: "bar", renderer: "svg", react: "none", source: chartkitAll, note: "Same /all bundle for line, bar, and donut." },
  { id: "chartkit-all", library: "ChartKit all", chart: "donut", renderer: "svg", react: "none", source: chartkitAll, note: "Same /all bundle for line, bar, and donut." },
  { id: "uplot", library: "uPlot", chart: "line", renderer: "canvas", react: "none", source: uplotLine, css: true },
  { id: "uplot", library: "uPlot", chart: "bar", renderer: "canvas", react: "none", source: uplotBar, css: true },
  { id: "uplot", library: "uPlot", chart: "donut", renderer: "canvas", react: "none", unsupported: "uPlot has no pie or donut series." },
  { id: "chartjs", library: "Chart.js", chart: "line", renderer: "canvas", react: "none", source: chartjsLine },
  { id: "chartjs", library: "Chart.js", chart: "bar", renderer: "canvas", react: "none", source: chartjsBar },
  { id: "chartjs", library: "Chart.js", chart: "donut", renderer: "canvas", react: "none", source: chartjsDonut },
  { id: "echarts", library: "ECharts", chart: "line", renderer: "canvas", react: "none", source: echartsLine, note: "Modular import: echarts/core + LineChart + GridComponent + CanvasRenderer." },
  { id: "echarts", library: "ECharts", chart: "bar", renderer: "canvas", react: "none", source: echartsBar, note: "Modular import: echarts/core + BarChart + GridComponent + CanvasRenderer." },
  { id: "echarts", library: "ECharts", chart: "donut", renderer: "canvas", react: "none", source: echartsDonut, note: "Modular import: echarts/core + PieChart + CanvasRenderer. Donut is a pie with an inner radius." },
  { id: "recharts", library: "Recharts", chart: "line", renderer: "svg", react: "included", source: rechartsLine },
  { id: "recharts", library: "Recharts", chart: "bar", renderer: "svg", react: "included", source: rechartsBar },
  { id: "recharts", library: "Recharts", chart: "donut", renderer: "svg", react: "included", source: rechartsDonut },
  { id: "nivo", library: "Nivo", chart: "line", renderer: "svg", react: "included", source: nivoLine },
  { id: "nivo", library: "Nivo", chart: "bar", renderer: "svg", react: "included", source: nivoBar },
  { id: "nivo", library: "Nivo", chart: "donut", renderer: "svg", react: "included", source: nivoDonut },
  { id: "plot", library: "Observable Plot", chart: "line", renderer: "svg", react: "none", source: plotLine },
  { id: "plot", library: "Observable Plot", chart: "bar", renderer: "svg", react: "none", source: plotBar },
  { id: "plot", library: "Observable Plot", chart: "donut", renderer: "svg", react: "none", unsupported: "Observable Plot has no pie or donut mark." },
];
