import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { makeChartData } from "../lib/shapes.mjs";
import { assertMarkup, assertSvg, columnsOf, rowsOf } from "./rows.mjs";

function sumNodes(nodes) {
  return nodes.map((node) => {
    if (!node.children) return { name: node.name, value: node.value ?? node.size ?? 1 };
    const children = sumNodes(node.children);
    let value = 0;
    for (const child of children) value += child.value;
    return { name: node.name, value, children };
  });
}

let echartsApi;

async function echarts() {
  if (echartsApi) return echartsApi;
  const core = await import("echarts/core");
  const charts = await import("echarts/charts");
  const components = await import("echarts/components");
  const { SVGRenderer } = await import("echarts/renderers");
  core.use([
    charts.LineChart,
    charts.BarChart,
    charts.PieChart,
    charts.ScatterChart,
    charts.HeatmapChart,
    charts.GaugeChart,
    charts.CandlestickChart,
    charts.BoxplotChart,
    charts.RadarChart,
    charts.FunnelChart,
    charts.TreemapChart,
    charts.SankeyChart,
    charts.SunburstChart,
    components.GridComponent,
    components.VisualMapComponent,
    components.DatasetComponent,
    components.TransformComponent,
    components.RadarComponent,
    components.PolarComponent,
    components.TooltipComponent,
    SVGRenderer,
  ]);
  echartsApi = core;
  return core;
}

function echartsOption(chart, payload) {
  const rows = rowsOf(payload);
  const cols = columnsOf(payload);
  const quiet = { animation: false, tooltip: { show: false } };
  if (chart === "line" || chart === "spike") {
    const data = Array.from(cols.y, (y, i) => [cols.x[i], y]);
    return { ...quiet, xAxis: { type: "value" }, yAxis: { type: "value" }, series: [{ type: "line", showSymbol: false, data }] };
  }
  if (chart === "bar" || chart === "bar-range") {
    return {
      ...quiet,
      xAxis: { type: "category", data: rows.map((row) => row.x) },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: chart === "bar-range" ? rows.map((row) => [row.low, row.high]) : rows.map((row) => row.y) }],
    };
  }
  if (chart === "pie" || chart === "donut" || chart === "rose") {
    return {
      ...quiet,
      series: [{
        type: "pie",
        radius: chart === "donut" ? ["42%", "70%"] : "70%",
        roseType: chart === "rose" ? "radius" : undefined,
        data: rows.map((row) => ({ name: row.x, value: row.y })),
      }],
    };
  }
  if (chart === "stacked-area" || chart === "mini-area") {
    const keys = chart === "stacked-area" ? ["a", "b", "c", "d"] : ["y"];
    const series = keys.map((key) => ({
      type: "line",
      stack: chart === "stacked-area" ? "total" : undefined,
      areaStyle: {},
      showSymbol: false,
      data: rows.map((row) => [row.x, row[key]]),
    }));
    return { ...quiet, xAxis: { type: "value", show: chart !== "mini-area" }, yAxis: { type: "value", show: chart !== "mini-area" }, series };
  }
  if (chart === "scatter") {
    return { ...quiet, xAxis: { type: "value" }, yAxis: { type: "value" }, series: [{ type: "scatter", symbolSize: 3, data: rows.map((row) => [row.x, row.y]) }] };
  }
  if (chart === "combo") {
    return {
      ...quiet,
      xAxis: { type: "category", data: rows.map((row) => row.x) },
      yAxis: [{ type: "value" }, { type: "value" }],
      series: [
        { type: "bar", data: rows.map((row) => row.revenue) },
        { type: "line", yAxisIndex: 1, showSymbol: false, data: rows.map((row) => row.margin) },
      ],
    };
  }
  if (chart === "heatmap") {
    const xs = [];
    const ys = [];
    const xi = new Map();
    const yi = new Map();
    const data = rows.map((row) => {
      if (!xi.has(row.x)) { xi.set(row.x, xs.length); xs.push(row.x); }
      if (!yi.has(row.y)) { yi.set(row.y, ys.length); ys.push(row.y); }
      return [xi.get(row.x), yi.get(row.y), row.v];
    });
    return {
      ...quiet,
      xAxis: { type: "category", data: xs },
      yAxis: { type: "category", data: ys },
      visualMap: { min: 0, max: 20, show: false },
      series: [{ type: "heatmap", data }],
    };
  }
  if (chart === "gauge") {
    const metric = payload.metric;
    return { ...quiet, series: [{ type: "gauge", min: metric.min, max: metric.max, data: [{ value: metric.value, name: metric.label }] }] };
  }
  if (chart === "candlestick") {
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
      ...quiet,
      xAxis: [{ type: "category", data: labels }, { type: "category", data: labels, gridIndex: 1 }],
      yAxis: [{ scale: true }, { gridIndex: 1 }],
      grid: [{ bottom: "28%" }, { top: "78%" }],
      series: [{ type: "candlestick", data: candles }, { type: "bar", data: volume, xAxisIndex: 1, yAxisIndex: 1 }],
    };
  }
  if (chart === "boxplot") {
    const groups = [];
    const buckets = new Map();
    for (let i = 0; i < cols.group.length; i++) {
      const name = cols.group[i];
      if (!buckets.has(name)) { buckets.set(name, []); groups.push(name); }
      buckets.get(name).push(cols.value[i]);
    }
    return {
      ...quiet,
      dataset: [{ source: [groups, ...groups.map((name) => buckets.get(name))] }, { transform: { type: "boxplot" } }],
      xAxis: { type: "category" },
      yAxis: { type: "value" },
      series: [{ type: "boxplot", datasetIndex: 1 }],
    };
  }
  if (chart === "radar") {
    return {
      ...quiet,
      radar: { indicator: rows.map((row) => ({ name: row.spoke, max: 10 })) },
      series: [{ type: "radar", data: [{ value: rows.map((row) => row.a) }, { value: rows.map((row) => row.b) }, { value: rows.map((row) => row.c) }] }],
    };
  }
  if (chart === "funnel") {
    return { ...quiet, series: [{ type: "funnel", sort: "none", data: rows.map((row) => ({ name: row.x, value: row.y })) }] };
  }
  if (chart === "treemap") {
    return { ...quiet, series: [{ type: "treemap", roam: false, nodeClick: false, breadcrumb: { show: false }, data: rows.map((row) => ({ name: row.name, value: row.size })) }] };
  }
  if (chart === "sankey") {
    const seen = new Set();
    const nodes = [];
    for (const row of rows) {
      if (!seen.has(row.from)) { seen.add(row.from); nodes.push({ name: row.from }); }
      if (!seen.has(row.to)) { seen.add(row.to); nodes.push({ name: row.to }); }
    }
    return { ...quiet, series: [{ type: "sankey", data: nodes, links: rows.map((row) => ({ source: row.from, target: row.to, value: row.flow })) }] };
  }
  if (chart === "sunburst") {
    return { ...quiet, series: [{ type: "sunburst", data: sumNodes(payload.data), radius: ["12%", "90%"] }] };
  }
  if (chart === "radial-bar") {
    return {
      ...quiet,
      polar: {},
      angleAxis: { type: "category", data: rows.map((row) => row.x) },
      radiusAxis: {},
      series: [{ type: "bar", coordinateSystem: "polar", data: rows.map((row) => row.y) }],
    };
  }
  throw new Error(`unsupported: ECharts has no SSR series for ${chart}`);
}

async function prepareEcharts(chart, points) {
  const api = await echarts();
  const payload = makeChartData(chart, points, 1);
  return () => {
    const chartInst = api.init(null, null, { renderer: "svg", ssr: true, width: 640, height: 360 });
    chartInst.setOption(echartsOption(chart, payload));
    const svg = chartInst.renderToSVGString();
    chartInst.dispose();
    return assertSvg(svg, "ECharts");
  };
}

function nivoElement(chart, payload) {
  const rows = rowsOf(payload);
  const quiet = { width: 640, height: 360, animate: false, isInteractive: false };
  if (chart === "line") {
    return ["@nivo/line", "Line", { ...quiet, enablePoints: false, data: [{ id: "y", data: rows.map((row) => ({ x: row.x, y: row.y })) }] }];
  }
  if (chart === "bar") return ["@nivo/bar", "Bar", { ...quiet, data: rows, keys: ["y"], indexBy: "x" }];
  if (chart === "pie" || chart === "donut") {
    return ["@nivo/pie", "Pie", { ...quiet, innerRadius: chart === "donut" ? 0.6 : 0, data: rows.map((row) => ({ id: row.x, value: row.y })) }];
  }
  if (chart === "stacked-area" || chart === "mini-area") {
    const keys = chart === "stacked-area" ? ["a", "b", "c", "d"] : ["y"];
    return ["@nivo/stream", "Stream", { ...quiet, offsetType: "none", keys, data: rows }];
  }
  if (chart === "heatmap") {
    const by = new Map();
    for (const row of rows) {
      const list = by.get(row.y) ?? [];
      list.push({ x: row.x, y: row.v });
      by.set(row.y, list);
    }
    const data = [...by].map(([id, data]) => ({ id, data }));
    return ["@nivo/heatmap", "HeatMap", { ...quiet, data }];
  }
  if (chart === "boxplot") return ["@nivo/boxplot", "BoxPlot", { ...quiet, data: rows.map((row) => ({ group: row.group, value: row.value })) }];
  if (chart === "radar") return ["@nivo/radar", "Radar", { ...quiet, data: rows, indexBy: "spoke", keys: ["a", "b", "c"] }];
  if (chart === "funnel") return ["@nivo/funnel", "Funnel", { ...quiet, data: rows.map((row) => ({ id: row.x, value: row.y })) }];
  if (chart === "treemap") return ["@nivo/treemap", "TreeMap", { ...quiet, data: { id: "all", children: rows.map((row) => ({ id: row.name, value: row.size })) }, identity: "id", value: "value" }];
  if (chart === "sankey") {
    const seen = new Set();
    const nodes = [];
    for (const row of rows) {
      if (!seen.has(row.from)) { seen.add(row.from); nodes.push({ id: row.from }); }
      if (!seen.has(row.to)) { seen.add(row.to); nodes.push({ id: row.to }); }
    }
    return ["@nivo/sankey", "Sankey", { ...quiet, data: { nodes, links: rows.map((row) => ({ source: row.from, target: row.to, value: row.flow })) } }];
  }
  if (chart === "bullet") {
    return ["@nivo/bullet", "Bullet", { ...quiet, data: rows.map((row) => ({ id: row.name, ranges: [row.poor, row.ok, row.good], measures: [row.value], markers: [row.target] })) }];
  }
  if (chart === "radial-bar") return ["@nivo/radial-bar", "RadialBar", { ...quiet, data: [{ id: "y", data: rows.map((row) => ({ x: row.x, y: row.y })) }] }];
  if (chart === "sunburst") {
    const children = sumNodes(payload.data).map((node) => ({ id: node.name, ...node }));
    return ["@nivo/sunburst", "Sunburst", { ...quiet, data: { id: "all", children }, id: "id", value: "value" }];
  }
  throw new Error(`unsupported: Nivo has no SSR chart for ${chart}`);
}

async function prepareNivo(chart, points) {
  const payload = makeChartData(chart, points, 1);
  const [pkg, name, props] = nivoElement(chart, payload);
  const mod = await import(pkg);
  const Component = mod[name];
  return () => assertSvg(renderToStaticMarkup(createElement(Component, props)), "Nivo");
}

function rechartsElement(chart, payload) {
  const rows = rowsOf(payload);
  const size = { width: 640, height: 360 };
  if (chart === "line") return ["recharts", ["LineChart", "Line", "XAxis", "YAxis"], (m) => createElement(m.LineChart, { ...size, data: rows }, createElement(m.XAxis, { dataKey: "x" }), createElement(m.YAxis), createElement(m.Line, { dataKey: "y", dot: false, isAnimationActive: false }))];
  if (chart === "bar" || chart === "bar-range") {
    const data = chart === "bar-range" ? rows.map((row) => ({ ...row, y: [row.low, row.high] })) : rows;
    return ["recharts", ["BarChart", "Bar", "XAxis", "YAxis"], (m) => createElement(m.BarChart, { ...size, data }, createElement(m.XAxis, { dataKey: "x" }), createElement(m.YAxis), createElement(m.Bar, { dataKey: "y", isAnimationActive: false }))];
  }
  if (chart === "pie" || chart === "donut") {
    return ["recharts", ["PieChart", "Pie"], (m) => createElement(m.PieChart, size, createElement(m.Pie, { data: rows, dataKey: "y", nameKey: "x", innerRadius: chart === "donut" ? 80 : 0, isAnimationActive: false }))];
  }
  if (chart === "stacked-area" || chart === "mini-area") {
    const keys = chart === "stacked-area" ? ["a", "b", "c", "d"] : ["y"];
    return ["recharts", ["AreaChart", "Area"], (m) => createElement(m.AreaChart, { ...size, data: rows }, ...keys.map((key) => createElement(m.Area, { key, dataKey: key, stackId: chart === "stacked-area" ? "s" : undefined, isAnimationActive: false })))];
  }
  if (chart === "scatter" || chart === "errorbar") {
    const names = chart === "errorbar" ? ["ScatterChart", "Scatter", "ErrorBar", "XAxis", "YAxis"] : ["ScatterChart", "Scatter", "XAxis", "YAxis"];
    return ["recharts", names, (m) => createElement(m.ScatterChart, { ...size, data: rows }, createElement(m.XAxis, { dataKey: "x" }), createElement(m.YAxis, { dataKey: "y" }), createElement(m.Scatter, { data: rows, dataKey: "y", isAnimationActive: false }, chart === "errorbar" ? createElement(m.ErrorBar, { dataKey: "hi" }) : null))];
  }
  if (chart === "combo") return ["recharts", ["ComposedChart", "Bar", "Line", "XAxis", "YAxis"], (m) => createElement(m.ComposedChart, { ...size, data: rows }, createElement(m.XAxis, { dataKey: "x" }), createElement(m.YAxis), createElement(m.Bar, { dataKey: "revenue", isAnimationActive: false }), createElement(m.Line, { dataKey: "margin", dot: false, isAnimationActive: false }))];
  if (chart === "radar") return ["recharts", ["RadarChart", "Radar", "PolarGrid", "PolarAngleAxis"], (m) => createElement(m.RadarChart, { ...size, data: rows }, createElement(m.PolarGrid), createElement(m.PolarAngleAxis, { dataKey: "spoke" }), createElement(m.Radar, { dataKey: "a", isAnimationActive: false }))];
  if (chart === "funnel") return ["recharts", ["FunnelChart", "Funnel"], (m) => createElement(m.FunnelChart, size, createElement(m.Funnel, { data: rows, dataKey: "y", nameKey: "x", isAnimationActive: false }))];
  if (chart === "treemap") return ["recharts", ["Treemap"], (m) => createElement(m.Treemap, { ...size, data: rows, dataKey: "size", isAnimationActive: false })];
  if (chart === "sankey") return ["recharts", ["Sankey"], (m) => createElement(m.Sankey, { ...size, data: { nodes: [], links: rows.map((row) => ({ source: row.from, target: row.to, value: row.flow })) }, isAnimationActive: false })];
  if (chart === "sunburst") return ["recharts", ["SunburstChart"], (m) => createElement(m.SunburstChart, { ...size, data: sumNodes(payload.data), dataKey: "value", isAnimationActive: false })];
  if (chart === "radial-bar") return ["recharts", ["RadialBarChart", "RadialBar"], (m) => createElement(m.RadialBarChart, { ...size, data: rows }, createElement(m.RadialBar, { dataKey: "y", isAnimationActive: false }))];
  throw new Error(`unsupported: Recharts has no SSR chart for ${chart}`);
}

async function prepareRecharts(chart, points) {
  const payload = makeChartData(chart, points, 1);
  const [, names, build] = rechartsElement(chart, payload);
  const mod = await import("recharts");
  const picked = Object.fromEntries(names.map((name) => [name, mod[name]]));
  const node = build(picked);
  return () => assertSvg(renderToStaticMarkup(node), "Recharts");
}

let plotReady;
let plotDom;

function snapshotDom() {
  return {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    SVGElement: globalThis.SVGElement,
    Node: globalThis.Node,
    Element: globalThis.Element,
    hadWindow: "window" in globalThis,
    hadDocument: "document" in globalThis,
  };
}

function restoreDom(prev) {
  const put = (key, had, value) => {
    if (had) globalThis[key] = value;
    else delete globalThis[key];
  };
  put("window", prev.hadWindow, prev.window);
  put("document", prev.hadDocument, prev.document);
  globalThis.HTMLElement = prev.HTMLElement;
  globalThis.SVGElement = prev.SVGElement;
  globalThis.Node = prev.Node;
  globalThis.Element = prev.Element;
}

function installPlotDom() {
  const prev = snapshotDom();
  const dom = plotDom;
  globalThis.window = dom.window;
  globalThis.document = dom.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  return () => restoreDom(prev);
}

async function plotLib() {
  if (!plotDom) {
    const { parseHTML } = await import("linkedom");
    plotDom = parseHTML("<!doctype html><html><body></body></html>");
  }
  if (plotReady) return plotReady;
  const restore = installPlotDom();
  try {
    plotReady = await import("@observablehq/plot");
    return plotReady;
  } finally {
    restore();
  }
}

async function preparePlot(chart, points) {
  const Plot = await plotLib();
  const payload = makeChartData(chart, points, 1);
  return () => {
    const restore = installPlotDom();
    try {
    const rows = rowsOf(payload);
    let node;
    if (chart === "line") node = Plot.plot({ width: 640, height: 360, marks: [Plot.lineY(rows, { x: "x", y: "y" })] });
    else if (chart === "bar") node = Plot.plot({ width: 640, height: 360, marks: [Plot.barY(rows, { x: "x", y: "y" })] });
    else if (chart === "stacked-area") {
      const cols = columnsOf(payload);
      const flat = [];
      for (const key of ["a", "b", "c", "d"]) {
        for (let i = 0; i < cols.x.length; i++) flat.push({ x: cols.x[i], y: cols[key][i], series: key });
      }
      node = Plot.plot({ width: 640, height: 360, marks: [Plot.areaY(flat, { x: "x", y: "y", z: "series", fill: "series" })] });
    }
    else if (chart === "mini-area") node = Plot.plot({ width: 640, height: 360, x: { axis: null }, y: { axis: null }, marks: [Plot.areaY(rows, { x: "x", y: "y" })] });
    else if (chart === "scatter") node = Plot.plot({ width: 640, height: 360, marks: [Plot.dot(rows, { x: "x", y: "y" })] });
    else if (chart === "heatmap") node = Plot.plot({ width: 640, height: 360, marks: [Plot.cell(rows, { x: "x", y: "y", fill: "v" })] });
    else if (chart === "histogram") node = Plot.plot({ width: 640, height: 360, marks: [Plot.rectY(rows, Plot.binX({ y: "count" }, { x: "value", thresholds: 32 }))] });
    else if (chart === "boxplot") node = Plot.plot({ width: 640, height: 360, marks: [Plot.boxY(rows, { x: "group", y: "value" })] });
    else if (chart === "area-range") node = Plot.plot({ width: 640, height: 360, marks: [Plot.area(rows, { x1: "x", y1: "lo", y2: "hi" }), Plot.line(rows, { x: "x", y: "y" })] });
    else if (chart === "bar-range") node = Plot.plot({ width: 640, height: 360, marks: [Plot.barY(rows, { x: "x", y1: "low", y2: "high" })] });
    else throw new Error(`unsupported: Observable Plot has no SSR mark for ${chart}`);
    return assertSvg(node?.outerHTML ?? "", "Observable Plot");
    } finally {
      restore();
    }
  };
}

function vegaValues(chart, payload) {
  const cols = columnsOf(payload);
  const rows = rowsOf(payload);
  if (cols && (chart === "line" || chart === "scatter" || chart === "mini-area" || chart === "stacked-area" || chart === "area-range")) {
    const fields = chart === "stacked-area" ? ["x", "a", "b", "c", "d"] : chart === "area-range" ? ["x", "y", "lo", "hi"] : ["x", "y"];
    const n = cols.x.length;
    const values = new Array(n);
    for (let i = 0; i < n; i++) {
      const row = {};
      for (const field of fields) row[field] = cols[field][i];
      values[i] = row;
    }
    if (chart === "stacked-area") {
      const flat = [];
      for (const key of ["a", "b", "c", "d"]) {
        for (let i = 0; i < n; i++) flat.push({ x: cols.x[i], y: cols[key][i], series: key });
      }
      return flat;
    }
    return values;
  }
  if (chart === "histogram") return rows.map((row) => ({ value: row.value }));
  return rows;
}

function vegaSpec(chart, values) {
  const size = { width: 640, height: 360, data: { values } };
  if (chart === "line") return { ...size, mark: "line", encoding: { x: { field: "x", type: "quantitative" }, y: { field: "y", type: "quantitative" } } };
  if (chart === "bar") return { ...size, mark: "bar", encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "quantitative" } } };
  if (chart === "pie" || chart === "donut") {
    return { ...size, mark: { type: "arc", innerRadius: chart === "donut" ? 60 : 0 }, encoding: { theta: { field: "y", type: "quantitative" }, color: { field: "x", type: "nominal" } } };
  }
  if (chart === "stacked-area" || chart === "mini-area") return { ...size, mark: "area", encoding: { x: { field: "x", type: "quantitative" }, y: { field: "y", type: "quantitative" }, color: chart === "stacked-area" ? { field: "series", type: "nominal" } : undefined } };
  if (chart === "scatter") return { ...size, mark: "point", encoding: { x: { field: "x", type: "quantitative" }, y: { field: "y", type: "quantitative" } } };
  if (chart === "combo") return { ...size, layer: [{ mark: "bar", encoding: { x: { field: "x", type: "nominal" }, y: { field: "revenue", type: "quantitative" } } }, { mark: "line", encoding: { x: { field: "x", type: "nominal" }, y: { field: "margin", type: "quantitative" } } }] };
  if (chart === "heatmap") return { ...size, mark: "rect", encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "nominal" }, color: { field: "v", type: "quantitative" } } };
  if (chart === "histogram") return { ...size, mark: "bar", encoding: { x: { field: "value", bin: { maxbins: 32 } }, y: { aggregate: "count" } } };
  if (chart === "boxplot") return { ...size, mark: "boxplot", encoding: { x: { field: "group", type: "nominal" }, y: { field: "value", type: "quantitative" } } };
  if (chart === "area-range") return { ...size, mark: "area", encoding: { x: { field: "x", type: "quantitative" }, y: { field: "lo", type: "quantitative" }, y2: { field: "hi" } } };
  if (chart === "bar-range") return { ...size, mark: "bar", encoding: { x: { field: "x", type: "nominal" }, y: { field: "low", type: "quantitative" }, y2: { field: "high" } } };
  if (chart === "errorbar") return { ...size, layer: [{ mark: "point", encoding: { x: { field: "x", type: "nominal" }, y: { field: "y", type: "quantitative" } } }, { mark: "errorbar", encoding: { x: { field: "x", type: "nominal" }, y: { field: "lo", type: "quantitative" }, y2: { field: "hi" } } }] };
  throw new Error(`unsupported: Vega-Lite has no mark for ${chart}`);
}

async function prepareVega(chart, points) {
  const vl = await import("vega-lite");
  const vega = await import("vega");
  const payload = makeChartData(chart, points, 1);
  return async () => {
    const spec = vl.compile(vegaSpec(chart, vegaValues(chart, payload))).spec;
    const view = new vega.View(vega.parse(spec), { renderer: "none" });
    try {
      const svg = await view.toSVG();
      return assertSvg(svg, "Vega-Lite");
    } finally {
      view.finalize();
    }
  };
}

function apexOptions(chart, payload) {
  const rows = rowsOf(payload);
  const base = { chart: { type: "line", animations: { enabled: false }, toolbar: { show: false } } };
  if (chart === "line" || chart === "mini-area" || chart === "stacked-area") {
    const type = chart === "line" ? "line" : "area";
    if (chart === "stacked-area") {
      const cols = columnsOf(payload);
      return { ...base, chart: { ...base.chart, type, stacked: true }, series: ["a", "b", "c", "d"].map((key) => ({ name: key, data: Array.from(cols[key]) })), xaxis: { categories: Array.from(cols.x) } };
    }
    const cols = columnsOf(payload);
    const data = chart === "line" ? Array.from(cols.y) : rows.map((row) => row.y);
    return { ...base, chart: { ...base.chart, type, sparkline: chart === "mini-area" ? { enabled: false } : undefined }, series: [{ data }], xaxis: { categories: chart === "line" ? Array.from(cols.x) : rows.map((row) => row.x) } };
  }
  if (chart === "bar" || chart === "histogram") {
    return { ...base, chart: { ...base.chart, type: chart === "histogram" ? "histogram" : "bar" }, series: [{ data: rows.map((row) => chart === "histogram" ? row.value : row.y) }] };
  }
  if (chart === "pie" || chart === "donut" || chart === "rose") {
    return { ...base, chart: { ...base.chart, type: chart === "rose" ? "polarArea" : chart }, labels: rows.map((row) => row.x), series: rows.map((row) => row.y) };
  }
  if (chart === "scatter") return { ...base, chart: { ...base.chart, type: "scatter" }, series: [{ data: rows.map((row) => [row.x, row.y]) }] };
  if (chart === "heatmap") return { ...base, chart: { ...base.chart, type: "heatmap" }, series: [{ data: rows.map((row) => ({ x: row.x, y: row.v })) }] };
  if (chart === "boxplot") return { ...base, chart: { ...base.chart, type: "boxPlot" }, series: [{ data: rows.map((row) => ({ x: row.group, y: [row.value] })) }] };
  if (chart === "radar") return { ...base, chart: { ...base.chart, type: "radar" }, series: [{ data: rows.map((row) => row.a) }], labels: rows.map((row) => row.spoke) };
  if (chart === "treemap") return { ...base, chart: { ...base.chart, type: "treemap" }, series: [{ data: rows.map((row) => ({ x: row.name, y: row.size })) }] };
  if (chart === "sunburst") return { ...base, chart: { ...base.chart, type: "sunburst" }, series: [{ data: sumNodes(payload.data) }] };
  if (chart === "area-range") return { ...base, chart: { ...base.chart, type: "rangeArea" }, series: [{ data: rows.map((row) => ({ x: row.x, y: [row.lo, row.hi] })) }] };
  if (chart === "bar-range") return { ...base, chart: { ...base.chart, type: "rangeBar" }, series: [{ data: rows.map((row) => ({ x: row.x, y: [row.low, row.high] })) }] };
  if (chart === "waterfall") return { ...base, chart: { ...base.chart, type: "waterfall" }, series: [{ data: rows.map((row) => ({ x: row.step, y: row.amount, isTotal: row.total })) }] };
  if (chart === "candlestick") {
    const cols = columnsOf(payload);
    const data = [];
    for (let i = 0; i < cols.x.length; i++) data.push({ x: cols.x[i], y: [cols.open[i], cols.high[i], cols.low[i], cols.close[i]] });
    return { ...base, chart: { ...base.chart, type: "candlestick" }, series: [{ data }] };
  }
  if (chart === "progress-ring") {
    const metric = payload.metric;
    return { ...base, chart: { ...base.chart, type: "radialBar" }, series: [metric.value], labels: [metric.label], plotOptions: { radialBar: { startAngle: 0, endAngle: 360 } } };
  }
  throw new Error(`unsupported: ApexCharts has no SSR chart for ${chart}`);
}

const APEX_REGISTER = {
  line: "apexcharts/line",
  bar: "apexcharts/column",
  pie: "apexcharts/pie",
  donut: "apexcharts/donut",
  "stacked-area": "apexcharts/area",
  scatter: "apexcharts/scatter",
  "mini-area": "apexcharts/area",
  heatmap: "apexcharts/heatmap",
  boxplot: "apexcharts/boxPlot",
  histogram: "apexcharts/histogram",
  radar: "apexcharts/radar",
  treemap: "apexcharts/treemap",
  sunburst: "apexcharts/sunburst",
  rose: "apexcharts/polarArea",
  "area-range": "apexcharts/rangeArea",
  "bar-range": "apexcharts/rangeBar",
  waterfall: "apexcharts/features/waterfall",
  candlestick: "apexcharts/candlestick",
  "progress-ring": "apexcharts/radialBar",
};

const apexLoaded = new Set();

async function prepareApex(chart, points) {
  const { default: ApexCharts } = await import("apexcharts/ssr");
  const side = APEX_REGISTER[chart];
  if (side && !apexLoaded.has(side)) {
    await import(side);
    apexLoaded.add(side);
  }
  const payload = makeChartData(chart, points, 1);
  return async () => assertSvg(await ApexCharts.renderToString(apexOptions(chart, payload), { width: 640, height: 360 }), "ApexCharts");
}

async function prepareVictory(chart, points) {
  const victory = await import("victory");
  const payload = makeChartData(chart, points, 1);
  const rows = rowsOf(payload);
  const size = { width: 640, height: 360, animate: false };
  return () => {
    let node;
    if (chart === "line") node = createElement(victory.VictoryLine, { ...size, data: rows, x: "x", y: "y" });
    else if (chart === "bar") node = createElement(victory.VictoryBar, { ...size, data: rows, x: "x", y: "y" });
    else if (chart === "pie" || chart === "donut") node = createElement(victory.VictoryPie, { ...size, data: rows, x: "x", y: "y", innerRadius: chart === "donut" ? 80 : 0 });
    else if (chart === "mini-area") node = createElement(victory.VictoryArea, { ...size, data: rows, x: "x", y: "y" });
    else if (chart === "stacked-area") {
      const cols = columnsOf(payload);
      const series = ["a", "b", "c", "d"].map((key) => rows.map((row, i) => ({ x: row.x ?? cols.x[i], y: row[key] })));
      node = createElement(victory.VictoryStack, size, ...series.map((data, i) => createElement(victory.VictoryArea, { key: i, data })));
    } else if (chart === "scatter") node = createElement(victory.VictoryScatter, { ...size, data: rows, x: "x", y: "y" });
    else if (chart === "boxplot") node = createElement(victory.VictoryBoxPlot, { ...size, data: rows, x: "group", y: "value" });
    else if (chart === "histogram") node = createElement(victory.VictoryHistogram, { ...size, data: rows.map((row) => ({ x: row.value })), bins: 32 });
    else if (chart === "errorbar") node = createElement(victory.VictoryErrorBar, { ...size, data: rows.map((row) => ({ x: row.x, y: row.y, errorX: 0, errorY: row.hi - row.y })) });
    else throw new Error(`unsupported: Victory has no SSR chart for ${chart}`);
    return assertSvg(renderToStaticMarkup(node), "Victory");
  };
}

async function prepareVisx(chart, points) {
  const payload = makeChartData(chart, points, 1);
  const rows = rowsOf(payload);
  if (chart === "heatmap") {
    const { HeatmapRect } = await import("@visx/heatmap");
    const bins = rows.map((row, i) => ({ bin: i, count: row.v, bins: [{ bin: 0, count: row.v }] }));
    return () => assertSvg(renderToStaticMarkup(createElement("svg", { width: 640, height: 360 }, createElement(HeatmapRect, { data: bins, xScale: (value) => value, yScale: (value) => value, width: 640, height: 360, binWidth: 8, binHeight: 8, gap: 1 }))), "visx");
  }
  const xy = await import("@visx/xychart");
  const accessors = { xAccessor: (d) => d.x, yAccessor: (d) => d.y };
  return () => {
    const series = chart === "bar"
      ? createElement(xy.BarSeries, { dataKey: "y", data: rows, ...accessors })
      : chart === "stacked-area"
        ? createElement(xy.AreaStack, null, ["a", "b", "c", "d"].map((key) => createElement(xy.AreaSeries, { key, dataKey: key, data: rows, xAccessor: (d) => d.x, yAccessor: (d) => d[key] })))
        : chart === "mini-area"
          ? createElement(xy.AreaSeries, { dataKey: "y", data: rows, ...accessors })
          : chart === "scatter"
            ? createElement(xy.GlyphSeries, { dataKey: "y", data: rows, ...accessors })
            : createElement(xy.LineSeries, { dataKey: "y", data: rows, ...accessors });
    const node = createElement(xy.XYChart, { width: 640, height: 360, xScale: { type: "linear" }, yScale: { type: "linear" } }, series);
    const html = renderToStaticMarkup(node);
    if (!/<path|<circle|visx-(line|bar|area|glyph)/.test(html)) {
      throw new Error("unsupported: visx XYChart renderToStaticMarkup returns the frame without series marks.");
    }
    return assertSvg(html, "visx");
  };
}

async function prepareMui(chart, points) {
  const payload = makeChartData(chart, points, 1);
  const rows = rowsOf(payload);
  const { ThemeProvider, createTheme } = await import("@mui/material/styles");
  const theme = createTheme();
  const wrap = (node) => () => assertSvg(renderToStaticMarkup(createElement(ThemeProvider, { theme }, node)), "MUI X");
  if (chart === "line" || chart === "sparkline") {
    const mod = await import(chart === "sparkline" ? "@mui/x-charts/SparkLineChart" : "@mui/x-charts/LineChart");
    const data = chart === "sparkline" ? (Array.isArray(payload.data) ? payload.data : rows.map((row) => row.y)) : rows.map((row) => row.y);
    const Component = chart === "sparkline" ? mod.SparkLineChart : mod.LineChart;
    return wrap(createElement(Component, { width: 640, height: 360, series: [{ data }], xAxis: [{ data: data.map((_, i) => i), scaleType: "point" }] }));
  }
  if (chart === "bar") {
    const { BarChart } = await import("@mui/x-charts/BarChart");
    return wrap(createElement(BarChart, { width: 640, height: 360, series: [{ data: rows.map((row) => row.y) }], xAxis: [{ data: rows.map((row) => row.x), scaleType: "band" }] }));
  }
  if (chart === "pie" || chart === "donut") {
    const { PieChart } = await import("@mui/x-charts/PieChart");
    return wrap(createElement(PieChart, { width: 640, height: 360, series: [{ data: rows.map((row) => ({ id: row.x, value: row.y, label: row.x })), innerRadius: chart === "donut" ? 80 : 0 }] }));
  }
  if (chart === "scatter") {
    const { ScatterChart } = await import("@mui/x-charts/ScatterChart");
    return wrap(createElement(ScatterChart, { width: 640, height: 360, series: [{ data: rows.map((row, id) => ({ id, x: row.x, y: row.y })) }] }));
  }
  if (chart === "radar") {
    const { RadarChart } = await import("@mui/x-charts/RadarChart");
    return wrap(createElement(RadarChart, { width: 640, height: 360, radar: { metrics: rows.map((row) => row.spoke) }, series: [{ data: rows.map((row) => row.a) }] }));
  }
  if (chart === "gauge" || chart === "progress-ring") {
    const { Gauge } = await import("@mui/x-charts/Gauge");
    const metric = payload.metric;
    const angles = chart === "progress-ring" ? { startAngle: 0, endAngle: 360 } : {};
    return wrap(createElement(Gauge, { width: 640, height: 360, value: metric.value, valueMin: metric.min, valueMax: metric.max, ...angles }));
  }
  throw new Error(`unsupported: MUI X has no SSR chart for ${chart}`);
}

async function prepareTremor(chart, points) {
  const tremor = await import("@tremor/react");
  const payload = makeChartData(chart, points, 1);
  const rows = rowsOf(payload);
  const data = chart === "sparkline" || chart === "mini-area"
    ? (Array.isArray(payload.data) ? payload.data.map((y, i) => ({ i, y })) : rows)
    : rows;
  return () => {
    let node;
    if (chart === "line") node = createElement(tremor.LineChart, { data: rows, index: "x", categories: ["y"], showAnimation: false });
    else if (chart === "bar") node = createElement(tremor.BarChart, { data: rows, index: "x", categories: ["y"], showAnimation: false });
    else if (chart === "donut") node = createElement(tremor.DonutChart, { data: rows, index: "x", category: "y", showAnimation: false });
    else if (chart === "stacked-area") node = createElement(tremor.AreaChart, { data: rows, index: "x", categories: ["a", "b", "c", "d"], showAnimation: false });
    else if (chart === "scatter") node = createElement(tremor.ScatterChart, { data: rows, x: "x", y: "y", category: "x", showAnimation: false });
    else if (chart === "funnel") node = createElement(tremor.FunnelChart, { data: rows.map((row) => ({ name: row.x, value: row.y })), showAnimation: false });
    else if (chart === "mini-area") node = createElement(tremor.SparkAreaChart, { data, index: "i", categories: ["y"] });
    else if (chart === "sparkline") node = createElement(tremor.SparkLineChart, { data, index: "i", categories: ["y"] });
    else if (chart === "bar-list") node = createElement(tremor.BarList, { data: rows.map((row) => ({ name: row.x, value: row.y })) });
    else if (chart === "progress-ring") node = createElement(tremor.ProgressCircle, { value: payload.metric.value, radius: 80 });
    else if (chart === "kpi") node = createElement("div", null, createElement(tremor.Metric, null, String(payload.metric.value)), createElement(tremor.SparkLineChart, { data, index: "i", categories: ["y"] }));
    else throw new Error(`unsupported: Tremor has no SSR chart for ${chart}`);
    const html = renderToStaticMarkup(node);
    if (chart === "bar-list" || chart === "kpi" || chart === "progress-ring") return assertMarkup(html, "Tremor");
    return assertSvg(html, "Tremor");
  };
}

const preparers = {
  echarts: prepareEcharts,
  nivo: prepareNivo,
  recharts: prepareRecharts,
  plot: preparePlot,
  vega: prepareVega,
  apex: prepareApex,
  victory: prepareVictory,
  visx: prepareVisx,
  mui: prepareMui,
  tremor: prepareTremor,
};

export async function prepareRival(cell) {
  const prepare = preparers[cell.ssr];
  if (!prepare) throw new Error(`unsupported: ${cell.library} has no Node string renderer`);
  return prepare(cell.chart, cell.points);
}
