/**
 * Bundle entry source for a native chart. The string is what esbuild tree-shakes.
 * A native cell with no source is a harness bug. Unsupported cells have no source.
 * Gallery aliases are not entries: they repair onto one chart module.
 */

export const GALLERY_ALIASES = [
  ["arc", "donut"],
  ["point", "scatter"],
  ["circle", "scatter"],
  ["square", "scatter"],
  ["rect", "heatmap"],
  ["rule", "spike"],
  ["tick", "spike"],
  ["hist", "histogram"],
  ["box", "boxplot"],
  ["box-plot", "boxplot"],
  ["radar-chart", "radar"],
  ["radar-beta", "radar"],
  ["funnel-chart", "funnel"],
  ["tree-map", "treemap"],
  ["treemap-beta", "treemap"],
  ["sankey-diagram", "sankey"],
  ["sankey-beta", "sankey"],
  ["bullet-chart", "bullet"],
  ["waterfall-chart", "waterfall"],
  ["arearange", "area-range"],
  ["area_range", "area-range"],
  ["range-area", "area-range"],
  ["rangearea", "area-range"],
  ["columnrange", "bar-range"],
  ["column-range", "bar-range"],
  ["rangebar", "bar-range"],
  ["range-bar", "bar-range"],
  ["floating-bar", "bar-range"],
  ["error-bar", "errorbar"],
  ["error-bars", "errorbar"],
  ["errorbars", "errorbar"],
  ["sun-burst", "sunburst"],
  ["sunburstchart", "sunburst"],
  ["sunburst-chart", "sunburst"],
  ["partition", "sunburst"],
  ["radialBar", "radial-bar"],
  ["polar-bar", "radial-bar"],
  ["polar", "radial-bar"],
  ["polarArea", "rose"],
  ["polar-area", "rose"],
  ["nightingale", "rose"],
  ["rose-chart", "rose"],
  ["grid-heat", "heatmap"],
  ["gridheat", "heatmap"],
  ["grid_heat", "heatmap"],
  ["grid-heatmap", "heatmap"],
  ["calendar-heatmap", "heatmap"],
];

export const AMBIGUOUS_ALIASES = [
  {
    alias: "area",
    note: "stacked-area when two or more y fields are set or mark.stack is set. Otherwise mini-area. A full-size filled line is type line with mark.area true. The homepage row area is stacked-area.",
  },
  {
    alias: "metric",
    note: "gauge when min, max, or target is set. Otherwise kpi.",
  },
  {
    alias: "xychart",
    note: "line, bar, or combo, from the series marks on the spec.",
  },
];

export function aliasesFor(type) {
  return GALLERY_ALIASES.filter((pair) => pair[1] === type).map((pair) => pair[0]);
}

function chartjs(regs, type) {
  return `import { Chart, ${regs} } from "chart.js";
Chart.register(${regs});
export function draw(canvas) {
  return new Chart(canvas, {
    type: ${JSON.stringify(type)},
    data: { labels: ["a", "b"], datasets: [{ data: [1, 2] }] },
    options: { animation: false, responsive: false },
  });
}
`;
}

function echarts(charts, components, seriesType) {
  const comp = components.length
    ? `import { ${components.join(", ")} } from "echarts/components";\n`
    : "";
  const use = [...charts, ...components, "CanvasRenderer"].join(", ");
  return `import * as echarts from "echarts/core";
import { ${charts.join(", ")} } from "echarts/charts";
${comp}import { CanvasRenderer } from "echarts/renderers";
echarts.use([${use}]);
export function draw(el) {
  const chart = echarts.init(el, null, { renderer: "canvas", width: 640, height: 360 });
  chart.setOption({ series: [{ type: ${JSON.stringify(seriesType)}, data: [1, 2] }] });
  return chart;
}
`;
}

function recharts(names) {
  const children = names.slice(1).map((name) => `createElement(${name}, null)`).join(", ");
  return `import { createElement } from "react";
import { ${names.join(", ")} } from "recharts";
export function draw() {
  return createElement(${names[0]}, { width: 640, height: 360 }${children ? `, ${children}` : ""});
}
`;
}

function nivo(pkg, name) {
  return `import { createElement } from "react";
import { ${name} } from "${pkg}";
export function draw() {
  return createElement(${name}, { width: 640, height: 360 });
}
`;
}

function plot(expr) {
  return `import * as Plot from "@observablehq/plot";
export function draw() {
  return ${expr};
}
`;
}

function uplot(series) {
  return `import uPlot from "uplot";
export function draw(el) {
  return new uPlot({ width: 640, height: 360, series: ${series} }, [[0, 1], [1, 2]], el);
}
`;
}

function hc(mods, option) {
  if (mods === "gantt") {
    return `import Highcharts from "highcharts/esm/highcharts-gantt.js";
export function draw(el) {
  return Highcharts.ganttChart(el, ${option});
}
`;
  }
  const extra = (mods ?? []).map((mod) => `import "highcharts/esm/${mod}";`).join("\n");
  return `import Highcharts from "highcharts/esm/highcharts.js";
${extra}
export function draw(el) {
  return Highcharts.chart(el, ${option});
}
`;
}

function apex(entry, type) {
  return `import ApexCharts from "apexcharts/${entry}";
export function draw(el) {
  return new ApexCharts(el, { chart: { type: ${JSON.stringify(type)}, width: 640, height: 360 }, series: [{ data: [1, 2] }] });
}
`;
}

function named(pkg, names) {
  return `import { ${names.join(", ")} } from "${pkg}";
export function draw(props) {
  return [${names.join(", ")}].map((Component) => Component && props);
}
`;
}

function am(sub, names) {
  return `import * as am5 from "@amcharts/amcharts5";
import * as extra from "@amcharts/amcharts5/${sub}";
export function draw() {
  return [am5.Root, ${names.map((name) => `extra.${name}`).join(", ")}];
}
`;
}

const PLOTLY = `import Plotly from "plotly.js-dist-min";
export function draw(el) {
  return Plotly.newPlot(el, [{ y: [1, 2], type: "scatter" }], { width: 640, height: 360 });
}
`;

const VEGA = `import * as vegaLite from "vega-lite";
export function draw(spec) {
  return vegaLite.compile(spec).spec;
}
`;

const G2 = `import { Chart } from "@antv/g2";
export function draw(el) {
  const chart = new Chart({ container: el, width: 640, height: 360 });
  chart.options({ type: "line", data: [{ x: "a", y: 1 }], encode: { x: "x", y: "y" } });
  return chart;
}
`;

const MERMAID = `import mermaid from "mermaid";
export function draw(source) {
  return mermaid.render("bench", source);
}
`;

const AG_COMMUNITY = `import { AgCharts, AllCommunityModule, ModuleRegistry } from "ag-charts-community";
ModuleRegistry.registerModules([AllCommunityModule]);
export function draw(el) {
  return AgCharts.create({ container: el, data: [{ x: "a", y: 1 }], series: [{ type: "line", xKey: "x", yKey: "y" }] });
}
`;

const AG_SPARK = `import { AgCharts, AllCommunityModule, ModuleRegistry, SparklinePresetModule } from "ag-charts-community";
ModuleRegistry.registerModules([AllCommunityModule, SparklinePresetModule]);
export function draw(el) {
  return AgCharts.__createSparkline(el, { type: "line", data: [1, 2] });
}
`;

const AG_ENTERPRISE = `import { AgCharts, AllEnterpriseModule, ModuleRegistry } from "ag-charts-enterprise";
ModuleRegistry.registerModules([AllEnterpriseModule]);
export function draw(el) {
  return AgCharts.create({ container: el, data: [{ x: "a", y: 1 }], series: [{ type: "line", xKey: "x", yKey: "y" }] });
}
`;

const LIGHTWEIGHT = `import { CandlestickSeries, HistogramSeries, createChart } from "lightweight-charts";
export function draw(el) {
  const chart = createChart(el, { width: 640, height: 360 });
  chart.addSeries(CandlestickSeries);
  chart.addSeries(HistogramSeries);
  return chart;
}
`;

function meta(source, extra = {}) {
  return { source, ...extra };
}

const PHASE2 = {
  uplot: {
    line: meta(uplot("[{}, { stroke: \"#22c55e\", width: 1 }]"), { css: true, ssr: null }),
    bar: meta(uplot("[{}, { stroke: \"#22c55e\", fill: \"#22c55e\", paths: uPlot.paths.bars() }]"), { css: true, ssr: null }),
    scatter: meta(uplot("[{}, { paths: uPlot.paths.points(), stroke: \"#15803d\" }]"), { css: true, ssr: null }),
    "mini-area": meta(uplot("[{}, { stroke: \"#15803d\", fill: \"rgba(34,197,94,0.35)\", width: 1 }]"), { css: true, ssr: null }),
    "area-range": meta(uplot("[{}, { stroke: \"transparent\" }, { stroke: \"transparent\" }, { stroke: \"#15803d\" }]"), { css: true, ssr: null, note: "Built-in bands between a low series and a high series." }),
    "bar-range": meta(uplot("[{}, { paths: uPlot.paths.bars(), fill: \"#22c55e\" }]"), { css: true, ssr: null, note: "paths.bars with y0 and y1. The floating bar." }),
  },
  chartjs: {
    line: meta(chartjs("LineController, LineElement, PointElement, LinearScale, CategoryScale", "line"), { ssr: null }),
    bar: meta(chartjs("BarController, BarElement, CategoryScale, LinearScale", "bar"), { ssr: null }),
    pie: meta(chartjs("PieController, ArcElement", "pie"), { ssr: null }),
    donut: meta(chartjs("DoughnutController, ArcElement", "doughnut"), { ssr: null }),
    "stacked-area": meta(chartjs("LineController, LineElement, PointElement, LinearScale, Filler", "line"), { ssr: null, note: "Line chart with fill and a stacked y scale." }),
    scatter: meta(chartjs("ScatterController, PointElement, LinearScale", "scatter"), { ssr: null }),
    combo: meta(chartjs("BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale", "bar"), { ssr: null, note: "Mixed bar and line datasets." }),
    "mini-area": meta(chartjs("LineController, LineElement, PointElement, LinearScale, Filler", "line"), { ssr: null, note: "Line fill to the origin. Not the stacked-area cell." }),
    radar: meta(chartjs("RadarController, LineElement, PointElement, RadialLinearScale", "radar"), { ssr: null }),
    rose: meta(chartjs("PolarAreaController, ArcElement, RadialLinearScale", "polarArea"), { ssr: null }),
    "area-range": meta(chartjs("LineController, LineElement, PointElement, LinearScale, Filler", "line"), { ssr: null, note: "Line fill to the previous dataset, the documented band." }),
    "bar-range": meta(chartjs("BarController, BarElement, CategoryScale, LinearScale", "bar"), { ssr: null, note: "Floating bars. Each datum is [low, high]." }),
  },
  echarts: {
    line: meta(echarts(["LineChart"], ["GridComponent"], "line"), { ssr: "echarts" }),
    bar: meta(echarts(["BarChart"], ["GridComponent"], "bar"), { ssr: "echarts" }),
    pie: meta(echarts(["PieChart"], [], "pie"), { ssr: "echarts" }),
    donut: meta(echarts(["PieChart"], [], "pie"), { ssr: "echarts", note: "Pie series with an inner radius." }),
    "stacked-area": meta(echarts(["LineChart"], ["GridComponent"], "line"), { ssr: "echarts", note: "Line series with areaStyle and stack." }),
    "mini-area": meta(echarts(["LineChart"], ["GridComponent"], "line"), { ssr: "echarts", note: "One line series with areaStyle. Not the stacked-area cell." }),
    scatter: meta(echarts(["ScatterChart"], ["GridComponent"], "scatter"), { ssr: "echarts" }),
    combo: meta(echarts(["BarChart", "LineChart"], ["GridComponent"], "bar"), { ssr: "echarts" }),
    heatmap: meta(echarts(["HeatmapChart"], ["GridComponent", "VisualMapComponent"], "heatmap"), { ssr: "echarts" }),
    gauge: meta(echarts(["GaugeChart"], [], "gauge"), { ssr: "echarts" }),
    candlestick: meta(echarts(["CandlestickChart", "BarChart"], ["GridComponent"], "candlestick"), { ssr: "echarts", note: "Candlestick series plus the volume bar." }),
    boxplot: meta(echarts(["BoxplotChart", "ScatterChart"], ["GridComponent", "DatasetComponent", "TransformComponent"], "boxplot"), { ssr: "echarts" }),
    radar: meta(echarts(["RadarChart"], ["RadarComponent"], "radar"), { ssr: "echarts" }),
    funnel: meta(echarts(["FunnelChart"], [], "funnel"), { ssr: "echarts" }),
    treemap: meta(echarts(["TreemapChart"], [], "treemap"), { ssr: "echarts" }),
    sankey: meta(echarts(["SankeyChart"], [], "sankey"), { ssr: "echarts" }),
    sunburst: meta(echarts(["SunburstChart"], [], "sunburst"), { ssr: "echarts" }),
    rose: meta(echarts(["PieChart"], [], "pie"), { ssr: "echarts", note: "Pie series with roseType radius." }),
    "radial-bar": meta(echarts(["BarChart"], ["PolarComponent"], "bar"), { ssr: "echarts", note: "Bar series on a polar coordinate system." }),
  },
  recharts: {
    line: meta(recharts(["LineChart", "Line", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    bar: meta(recharts(["BarChart", "Bar", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    pie: meta(recharts(["PieChart", "Pie"]), { ssr: "recharts", react: "included" }),
    donut: meta(recharts(["PieChart", "Pie"]), { ssr: "recharts", react: "included", note: "Pie with innerRadius." }),
    "stacked-area": meta(recharts(["AreaChart", "Area", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    "mini-area": meta(recharts(["AreaChart", "Area"]), { ssr: "recharts", react: "included" }),
    scatter: meta(recharts(["ScatterChart", "Scatter", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    combo: meta(recharts(["ComposedChart", "Bar", "Line", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    radar: meta(recharts(["RadarChart", "Radar", "PolarGrid", "PolarAngleAxis"]), { ssr: "recharts", react: "included" }),
    funnel: meta(recharts(["FunnelChart", "Funnel"]), { ssr: "recharts", react: "included" }),
    treemap: meta(recharts(["Treemap"]), { ssr: "recharts", react: "included" }),
    sankey: meta(recharts(["Sankey"]), { ssr: "recharts", react: "included" }),
    sunburst: meta(recharts(["SunburstChart"]), { ssr: "recharts", react: "included" }),
    "radial-bar": meta(recharts(["RadialBarChart", "RadialBar"]), { ssr: "recharts", react: "included" }),
    errorbar: meta(recharts(["ScatterChart", "Scatter", "ErrorBar", "XAxis", "YAxis"]), { ssr: "recharts", react: "included" }),
    "bar-range": meta(recharts(["BarChart", "Bar", "XAxis", "YAxis"]), { ssr: "recharts", react: "included", note: "Bar data is [low, high]." }),
  },
  nivo: {
    line: meta(nivo("@nivo/line", "Line"), { ssr: "nivo", react: "included" }),
    bar: meta(nivo("@nivo/bar", "Bar"), { ssr: "nivo", react: "included" }),
    pie: meta(nivo("@nivo/pie", "Pie"), { ssr: "nivo", react: "included" }),
    donut: meta(nivo("@nivo/pie", "Pie"), { ssr: "nivo", react: "included", note: "Pie with innerRadius 0.6." }),
    "stacked-area": meta(nivo("@nivo/stream", "Stream"), { ssr: "nivo", react: "included" }),
    "mini-area": meta(nivo("@nivo/stream", "Stream"), { ssr: "nivo", react: "included" }),
    scatter: meta(nivo("@nivo/scatterplot", "ScatterPlotCanvas"), {
      ssr: null,
      react: "included",
      renderer: "canvas",
      ssrNote: "The native 100,000-point cell is @nivo/scatterplot's canvas renderer. Canvas has no Node string render. The SVG scatter is a different renderer and is not this cell.",
    }),
    heatmap: meta(nivo("@nivo/heatmap", "HeatMap"), { ssr: "nivo", react: "included" }),
    boxplot: meta(nivo("@nivo/boxplot", "BoxPlot"), { ssr: "nivo", react: "included" }),
    radar: meta(nivo("@nivo/radar", "Radar"), { ssr: "nivo", react: "included" }),
    funnel: meta(nivo("@nivo/funnel", "Funnel"), { ssr: "nivo", react: "included" }),
    treemap: meta(nivo("@nivo/treemap", "TreeMap"), { ssr: "nivo", react: "included" }),
    sankey: meta(nivo("@nivo/sankey", "Sankey"), { ssr: "nivo", react: "included" }),
    bullet: meta(nivo("@nivo/bullet", "Bullet"), { ssr: "nivo", react: "included" }),
    "radial-bar": meta(nivo("@nivo/radial-bar", "RadialBar"), { ssr: "nivo", react: "included" }),
    sunburst: meta(nivo("@nivo/sunburst", "Sunburst"), { ssr: "nivo", react: "included" }),
  },
  plot: {
    line: meta(plot("Plot.lineY([{ y: 1 }, { y: 2 }], { y: \"y\" })"), { ssr: "plot" }),
    bar: meta(plot("Plot.barY([{ x: \"a\", y: 1 }], { x: \"x\", y: \"y\" })"), { ssr: "plot" }),
    "stacked-area": meta(plot("Plot.areaY([{ x: 1, y: 1, s: \"a\" }], { x: \"x\", y: \"y\", z: \"s\", fill: \"s\" })"), { ssr: "plot" }),
    "mini-area": meta(plot("Plot.areaY([{ x: 1, y: 1 }], { x: \"x\", y: \"y\" })"), { ssr: "plot" }),
    scatter: meta(plot("Plot.dot([{ x: 1, y: 1 }], { x: \"x\", y: \"y\" })"), { ssr: "plot" }),
    heatmap: meta(plot("Plot.cell([{ x: \"a\", y: \"b\", v: 1 }], { x: \"x\", y: \"y\", fill: \"v\" })"), { ssr: "plot" }),
    histogram: meta(plot("Plot.rectY([{ value: 1 }], Plot.binX({ y: \"count\" }, { x: \"value\", thresholds: 32 }))"), { ssr: "plot", note: "rectY with binX. Plot bins the observations." }),
    boxplot: meta(plot("Plot.boxY([{ group: \"a\", value: 1 }], { x: \"group\", y: \"value\" })"), { ssr: "plot" }),
    "area-range": meta(plot("Plot.plot({ marks: [Plot.area([{ x: 1, lo: 0, hi: 2 }], { x1: \"x\", y1: \"lo\", y2: \"hi\" }), Plot.line([{ x: 1, y: 1 }], { x: \"x\", y: \"y\" })] })"), { ssr: "plot" }),
    "bar-range": meta(plot("Plot.barY([{ x: \"a\", low: 1, high: 2 }], { x: \"x\", y1: \"low\", y2: \"high\" })"), { ssr: "plot" }),
  },
};

const more = ["highcharts-more.js"];

const HIGHCHARTS = {
  line: meta(hc([], "{ chart: { type: \"line\" }, series: [{ data: [1, 2] }] }"), { ssr: null }),
  bar: meta(hc([], "{ chart: { type: \"column\" }, series: [{ data: [1, 2] }] }"), { ssr: null, note: "Column series. Vertical bars." }),
  pie: meta(hc([], "{ series: [{ type: \"pie\", data: [{ y: 1 }, { y: 2 }] }] }"), { ssr: null }),
  donut: meta(hc([], "{ series: [{ type: \"pie\", innerSize: \"60%\", data: [{ y: 1 }, { y: 2 }] }] }"), { ssr: null, note: "Pie series with innerSize." }),
  "stacked-area": meta(hc([], "{ plotOptions: { area: { stacking: \"normal\" } }, series: [{ type: \"area\", data: [1, 2] }, { type: \"area\", data: [2, 1] }] }"), { ssr: null }),
  scatter: meta(hc([], "{ chart: { type: \"scatter\" }, series: [{ data: [[1, 2], [2, 3]] }] }"), { ssr: null }),
  combo: meta(hc([], "{ series: [{ type: \"column\", data: [1, 2] }, { type: \"line\", data: [2, 1] }] }"), { ssr: null }),
  "mini-area": meta(hc([], "{ chart: { type: \"area\" }, xAxis: { visible: false }, yAxis: { visible: false }, series: [{ data: [1, 2] }] }"), { ssr: null }),
  heatmap: meta(hc(["modules/heatmap.js"], "{ chart: { type: \"heatmap\" }, series: [{ data: [[0, 0, 1]] }] }"), { ssr: null }),
  gauge: meta(hc(more, "{ series: [{ type: \"gauge\", data: [50] }] }"), { ssr: null, note: "Dial gauge from highcharts-more. The full ring is the solidgauge progress-ring cell." }),
  candlestick: meta(hc(["modules/stock.js"], "{ series: [{ type: \"candlestick\", data: [[1, 2, 0, 1.5]] }] }"), { ssr: null }),
  histogram: meta(hc(["modules/histogram-bellcurve.js"], "{ series: [{ type: \"histogram\", baseSeries: \"s\", data: [1, 2, 3, 4] }] }"), { ssr: null, note: "histogram series. The module bins the observations." }),
  boxplot: meta(hc(more, "{ series: [{ type: \"boxplot\", data: [[1, 2, 3, 4, 5]] }] }"), { ssr: null }),
  radar: meta(hc(more, "{ chart: { polar: true, type: \"line\" }, series: [{ data: [1, 2, 3] }] }"), { ssr: null, note: "Polar line. The spider chart in highcharts-more." }),
  funnel: meta(hc(["modules/funnel.js"], "{ series: [{ type: \"funnel\", data: [4, 3, 2] }] }"), { ssr: null }),
  treemap: meta(hc(["modules/treemap.js"], "{ series: [{ type: \"treemap\", data: [{ name: \"a\", value: 1 }] }] }"), { ssr: null }),
  sankey: meta(hc(["modules/sankey.js"], "{ series: [{ type: \"sankey\", keys: [\"from\", \"to\", \"weight\"], data: [{ from: \"a\", to: \"b\", weight: 1 }] }] }"), { ssr: null }),
  bullet: meta(hc(["modules/bullet.js"], "{ chart: { type: \"bullet\" }, series: [{ data: [{ y: 1, target: 2 }] }] }"), { ssr: null }),
  waterfall: meta(hc(more, "{ series: [{ type: \"waterfall\", data: [10, 2, -3] }] }"), { ssr: null }),
  "area-range": meta(hc(more, "{ series: [{ type: \"arearange\", data: [[0, 1], [1, 2]] }] }"), { ssr: null }),
  "bar-range": meta(hc(more, "{ series: [{ type: \"columnrange\", data: [[0, 1], [1, 3]] }] }"), { ssr: null }),
  errorbar: meta(hc(more, "{ series: [{ type: \"errorbar\", data: [[0, 1], [1, 2]] }] }"), { ssr: null }),
  gantt: meta(hc("gantt", "{ series: [{ data: [{ start: 0, end: 1, name: \"a\" }] }] }"), { ssr: null }),
  timeline: meta(hc(["modules/timeline.js", "modules/xrange.js"], "{ series: [{ type: \"timeline\", data: [{ name: \"a\" }] }, { type: \"xrange\", data: [{ x: 0, x2: 1, y: 0 }] }] }"), { ssr: null }),
  venn: meta(hc(["modules/venn.js"], "{ series: [{ type: \"venn\", data: [{ sets: [\"A\"], value: 2 }, { sets: [\"A\", \"B\"], value: 1 }] }] }"), { ssr: null }),
  "progress-ring": meta(hc(["highcharts-more.js", "modules/solid-gauge.js"], "{ chart: { type: \"solidgauge\" }, pane: { startAngle: 0, endAngle: 360, background: [] }, series: [{ data: [70] }] }"), { ssr: null, note: "solidgauge with pane angles 0 to 360. Not the needle gauge." }),
  sunburst: meta(hc(["modules/sunburst.js"], "{ series: [{ type: \"sunburst\", data: [{ id: \"a\", name: \"a\" }, { parent: \"a\", name: \"b\", value: 1 }] }] }"), { ssr: null }),
  "radial-bar": meta(hc(more, "{ chart: { polar: true, type: \"column\" }, series: [{ data: [1, 2, 3] }] }"), { ssr: null, note: "Polar column. Bars around the circle." }),
};

function same(source, extra) {
  return meta(source, extra);
}

const PLOTLY_NATIVE = ["line", "bar", "pie", "donut", "stacked-area", "scatter", "combo", "mini-area", "heatmap", "gauge", "histogram", "boxplot", "funnel", "treemap", "sankey", "sunburst", "waterfall", "kpi", "candlestick", "errorbar", "radar", "radial-bar"];

const PLOTLY_NOTES = {
  line: "scatter trace, mode lines.",
  donut: "pie trace with hole.",
  "stacked-area": "scatter trace with stackgroup.",
  "mini-area": "scatter trace filled to zero. Not the stacked-area cell.",
  gauge: "indicator trace, mode gauge. Not the progress ring.",
  combo: "A bar trace and a scatter line trace on one figure.",
  errorbar: "scatter trace error_y. The documented error bar.",
  radar: "scatterpolar trace.",
  "radial-bar": "barpolar trace.",
  kpi: "indicator trace, mode number and delta.",
};

const VEGA_NATIVE = {
  line: "mark line",
  bar: "mark bar",
  pie: "mark arc",
  donut: "mark arc with innerRadius",
  "stacked-area": "mark area. Vega-Lite stacks the series.",
  scatter: "mark point",
  combo: "layer of mark bar and mark line",
  "mini-area": "mark area, one series",
  heatmap: "mark rect",
  histogram: "mark bar with a bin transform. Vega-Lite bins the observations.",
  boxplot: "mark boxplot",
  "area-range": "mark area with y and y2",
  "bar-range": "mark bar with y and y2",
  errorbar: "mark errorbar",
};

const APEX_ENTRY = {
  line: ["line", "line"],
  bar: ["column", "bar"],
  pie: ["pie", "pie"],
  donut: ["donut", "donut"],
  "stacked-area": ["area", "area"],
  scatter: ["scatter", "scatter"],
  "mini-area": ["area", "area"],
  heatmap: ["heatmap", "heatmap"],
  boxplot: ["boxPlot", "boxPlot"],
  histogram: ["histogram", "histogram"],
  radar: ["radar", "radar"],
  treemap: ["treemap", "treemap"],
  sunburst: ["sunburst", "sunburst"],
  rose: ["polarArea", "polarArea"],
  "area-range": ["rangeArea", "rangeArea"],
  "bar-range": ["rangeBar", "rangeBar"],
  waterfall: ["waterfall", "waterfall"],
  "progress-ring": ["radialBar", "radialBar"],
  candlestick: ["candlestick", "candlestick"],
};

const VICTORY = {
  line: "VictoryLine",
  bar: "VictoryBar",
  pie: "VictoryPie",
  donut: "VictoryPie",
  "stacked-area": "VictoryArea",
  scatter: "VictoryScatter",
  "mini-area": "VictoryArea",
  boxplot: "VictoryBoxPlot",
  histogram: "VictoryHistogram",
  errorbar: "VictoryErrorBar",
};

const TREMOR = {
  line: "LineChart",
  bar: "BarChart",
  donut: "DonutChart",
  "stacked-area": "AreaChart",
  scatter: "ScatterChart",
  funnel: "FunnelChart",
  "mini-area": "SparkAreaChart",
  "bar-list": "BarList",
  sparkline: "SparkLineChart",
  "progress-ring": "ProgressCircle",
  kpi: "Metric",
};

const MUI = {
  line: "LineChart",
  bar: "BarChart",
  pie: "PieChart",
  donut: "PieChart",
  scatter: "ScatterChart",
  radar: "RadarChart",
  sparkline: "SparkLineChart",
  gauge: "Gauge",
  "progress-ring": "Gauge",
};

const VISX = {
  line: ["@visx/xychart", ["XYChart", "LineSeries"]],
  bar: ["@visx/xychart", ["XYChart", "BarSeries"]],
  "stacked-area": ["@visx/xychart", ["XYChart", "AreaStack"]],
  "mini-area": ["@visx/xychart", ["XYChart", "AreaSeries"]],
  scatter: ["@visx/xychart", ["XYChart", "GlyphSeries"]],
  heatmap: ["@visx/heatmap", ["HeatmapRect"]],
};

const G2_NATIVE = ["line", "bar", "pie", "donut", "stacked-area", "scatter", "mini-area", "heatmap", "gauge", "boxplot", "sankey", "treemap", "histogram"];

const AG_COMMUNITY_TYPES = ["line", "bar", "pie", "donut", "stacked-area", "scatter", "combo", "mini-area", "sparkline"];
const AG_ENTERPRISE_TYPES = ["boxplot", "candlestick", "heatmap", "histogram", "rose", "radar", "radial-bar", "area-range", "bar-range", "sunburst", "treemap", "waterfall", "sankey", "progress-ring", "quadrant", "gauge"];

const AM = {
  line: ["xy", ["XYChart", "LineSeries"]],
  bar: ["xy", ["XYChart", "ColumnSeries"]],
  "stacked-area": ["xy", ["XYChart", "LineSeries"]],
  "mini-area": ["xy", ["XYChart", "LineSeries"]],
  combo: ["xy", ["XYChart", "ColumnSeries", "LineSeries"]],
  candlestick: ["xy", ["XYChart", "CandlestickSeries"]],
  pie: ["percent", ["PieChart", "PieSeries"]],
  donut: ["percent", ["PieChart", "PieSeries"]],
  funnel: ["percent", ["SlicedChart", "FunnelSeries"]],
  radar: ["radar", ["RadarChart", "RadarLineSeries"]],
  "radial-bar": ["radar", ["RadarChart", "RadarColumnSeries"]],
  treemap: ["hierarchy", ["Treemap"]],
  sunburst: ["hierarchy", ["Sunburst"]],
  sankey: ["flow", ["Sankey"]],
  gantt: ["gantt", ["Gantt"]],
  venn: ["venn", ["Venn"]],
};

function phase3Only(id, chart) {
  const table = {
    highcharts: HIGHCHARTS,
    plotly: Object.fromEntries(PLOTLY_NATIVE.map((type) => [type, same(PLOTLY, { ssr: null, note: PLOTLY_NOTES[type] ?? "plotly.js-dist-min. One build for every trace." })])),
    apexcharts: Object.fromEntries(Object.entries(APEX_ENTRY).map(([type, spec]) => [type, meta(apex(spec[0], spec[1]), { ssr: "apex", note: spec[0] === "radialBar" ? "radialBar with a full circle. ApexCharts' circular progress, not the radial-bar gallery shape." : `Modular entry apexcharts/${spec[0]}.` })])),
    tremor: Object.fromEntries(Object.entries(TREMOR).map(([type, name]) => [type, meta(named("@tremor/react", type === "kpi" ? ["Metric", "BadgeDelta", "SparkLineChart"] : [name]), { ssr: "tremor", react: "included", renderer: type === "bar-list" || type === "kpi" || type === "progress-ring" ? "html" : "svg" })])),
    agcharts: {},
    amcharts: Object.fromEntries(Object.entries(AM).map(([type, spec]) => [type, meta(am(spec[0], spec[1]), { ssr: null, note: `@amcharts/amcharts5/${spec[0]}.` })])),
    googlecharts: {},
    lightweight: { candlestick: meta(LIGHTWEIGHT, { ssr: null, singleBuild: true }) },
    muix: Object.fromEntries(Object.entries(MUI).map(([type, name]) => [type, meta(named(`@mui/x-charts/${name}`, [name]), { ssr: "mui", react: "included", note: type === "donut" ? "PieChart with innerRadius." : type === "progress-ring" ? "Gauge with startAngle 0 and endAngle 360." : null })])),
    mermaid: Object.fromEntries(["gantt", "journey", "quadrant", "timeline", "venn"].map((type) => [type, same(MERMAID, { ssr: null })])),
    victory: Object.fromEntries(Object.entries(VICTORY).map(([type, name]) => [type, meta(named("victory", type === "stacked-area" ? ["VictoryStack", "VictoryArea"] : type === "donut" ? ["VictoryPie"] : [name]), { ssr: "victory", react: "included", note: type === "donut" ? "VictoryPie with innerRadius." : type === "histogram" ? "VictoryHistogram bins the observations." : type === "stacked-area" ? "VictoryStack and VictoryArea." : null })])),
    visx: Object.fromEntries(Object.entries(VISX).map(([type, spec]) => [type, meta(named(spec[0], spec[1]), { ssr: "visx", react: "included" })])),
    vegalite: Object.fromEntries(Object.entries(VEGA_NATIVE).map(([type, note]) => [type, same(VEGA, { ssr: "vega", note: `${note}. The bundle is vega-lite's compile entry. vega is a peer and is not inside the bundle.` })])),
    g2: Object.fromEntries(G2_NATIVE.map((type) => [type, same(G2, { ssr: null, note: "import { Chart } from @antv/g2. The standard library registers every mark, so this entry is the full package." })])),
  };
  if (id === "agcharts") {
    if (chart === "sparkline") return meta(AG_SPARK, { ssr: null, group: "ag-community", note: "ag-charts-community AllCommunityModule and SparklinePresetModule. No license key." });
    if (AG_COMMUNITY_TYPES.includes(chart)) return same(AG_COMMUNITY, { ssr: null, group: "ag-community", note: "ag-charts-community AllCommunityModule. The package registers every community series." });
    if (AG_ENTERPRISE_TYPES.includes(chart)) return same(AG_ENTERPRISE, { ssr: null, group: "ag-enterprise", note: "ag-charts-enterprise AllEnterpriseModule. The npm package installs without a license key. The paint matrix shows a trial watermark when this series draws." });
    return null;
  }
  return table[id]?.[chart] ?? null;
}

export function entryFor(libId, chart) {
  if (PHASE2[libId]?.[chart]) return { ...PHASE2[libId][chart] };
  return phase3Only(libId, chart);
}

export const SSR_NONE = {
  uplot: "uPlot paints a canvas in the browser. Node has no document and this probe does not load node-canvas.",
  chartjs: "Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas.",
  highcharts: "Highcharts draws into a DOM node. It has no render-to-string API. This probe does not add a DOM shim.",
  plotly: "plotly.js-dist-min draws into a DOM node. It has no Node SVG renderer. This probe does not load a DOM or node-canvas.",
  agcharts: "AG Charts paints a canvas. This probe does not load node-canvas.",
  amcharts: "amCharts 5 needs a DOM root. It has no Node string renderer.",
  googlecharts: "Google Charts is not an npm package. The paint matrix loads https://www.gstatic.com/charts/loader.js. There is no bundle to minify and no Node renderer.",
  lightweight: "TradingView Lightweight Charts paints a canvas. This probe does not load node-canvas.",
  mermaid: "Mermaid render() needs a browser DOM. This probe does not add a DOM shim.",
  g2: "AntV G2 5.4.8 render() uses @antv/g-canvas. The package does not depend on @antv/g-svg and has no Node SVG string API. This probe does not load node-canvas.",
};
