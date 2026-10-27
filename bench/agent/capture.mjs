import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function benchRoot() {
  let dir = dirname(fileURLToPath(import.meta.url));
  if (dir.endsWith("/.out") || dir.endsWith("/agent")) dir = dirname(dir);
  return dir;
}

const require = createRequire(join(benchRoot(), "package.json"));
const namesCache = new Map();

async function exportNames(file) {
  if (namesCache.has(file)) return namesCache.get(file);
  const mod = await import(pathToFileURL(file).href);
  const names = Object.keys(mod).filter((name) => name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name));
  namesCache.set(file, names);
  return names;
}

function chartWrapper(real, names) {
  const others = names.filter((name) => name !== "Chart");
  return `
    import * as real from ${JSON.stringify(real)};
    const Original = real.Chart ?? real.default;
    export class Chart extends Original {
      constructor(...args) {
        super(...args);
        if (this.canvas) this.canvas.__ckChart = this;
      }
    }
    ${others.map((name) => `export const ${name} = real.${name};`).join("\n")}
    export default Chart;
  `;
}

function echartsWrapper(real, names) {
  const others = names.filter((name) => name !== "init");
  return `
    import * as real from ${JSON.stringify(real)};
    function remember(option) {
      (globalThis.__ckPlotted ??= []).push(option);
    }
    function wrap(chart) {
      if (!chart || typeof chart.setOption !== "function" || chart.__ckWrapped) return chart;
      const setOption = chart.setOption.bind(chart);
      chart.setOption = (option, ...rest) => {
        remember(option);
        const result = setOption(option, ...rest);
        const host = typeof chart.getDom === "function" ? chart.getDom() : null;
        if (host) host.__ckChart = chart;
        return result;
      };
      chart.__ckWrapped = true;
      return chart;
    }
    export function init(...args) {
      return wrap(real.init(...args));
    }
    ${others.map((name) => `export const ${name} = real.${name};`).join("\n")}
  `;
}

/** Numbers the chart was given, not text the model put in meta. */
export function numbersFromOption(option) {
  const nums = [];
  const push = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) nums.push(value);
    else if (Array.isArray(value)) value.forEach(push);
    else if (value && typeof value === "object") {
      if (typeof value.value === "number" || Array.isArray(value.value)) push(value.value);
      else if (typeof value.y === "number") {
        // Chart.js scatter/bubble points are { x, y }; both are plotted values.
        if (typeof value.x === "number" && Number.isFinite(value.x)) nums.push(value.x);
        nums.push(value.y);
      }
      else {
        for (const item of Object.values(value)) {
          if (typeof item === "number" && Number.isFinite(item)) nums.push(item);
        }
      }
    }
  };
  const series = option?.series;
  const list = Array.isArray(series) ? series : series ? [series] : [];
  for (const item of list) {
    if (item?.data != null) push(item.data);
  }
  const datasets = option?.dataset;
  const datasetList = Array.isArray(datasets) ? datasets : datasets ? [datasets] : [];
  for (const dataset of datasetList) {
    if (Array.isArray(dataset?.source)) push(dataset.source);
  }
  return nums;
}

/** Series types on an ECharts option. Chart.js scatter points are not a series type. */
export function typesFromOption(option) {
  const types = [];
  const series = option?.series;
  const list = Array.isArray(series) ? series : series ? [series] : [];
  for (const item of list) {
    if (typeof item?.type === "string" && item.type) types.push(item.type);
  }
  return types;
}

const PLOT_MARKS = new Set([
  "area", "areaX", "areaY", "arrow", "auto", "barX", "barY",
  "cell", "cellX", "cellY", "circle", "dot", "dotX", "dotY", "hexagon",
  "line", "lineX", "lineY", "link", "rect", "rectX", "rectY",
  "ruleX", "ruleY", "spike", "text", "textX", "textY", "tickX", "tickY",
  "vector", "vectorX", "vectorY",
]);

function plotWrapper(real, names) {
  const marks = [...PLOT_MARKS].filter((name) => names.includes(name));
  const others = names.filter((name) => name !== "plot" && !PLOT_MARKS.has(name));
  return `
    import * as real from ${JSON.stringify(real)};
    ${marks.map((name) => `export const ${name} = (...args) => {
      (globalThis.__ckPlotMarks ??= []).push({ name: ${JSON.stringify(name)}, data: args[0] });
      return real.${name}(...args);
    };`).join("\n")}
    export function plot(...args) {
      const node = real.plot(...args);
      const svg = node?.querySelector?.("svg") ?? node;
      const cls = svg?.getAttribute?.("class");
      if (cls) (globalThis.__ckPlotClass ??= []).push(cls);
      return node;
    }
    ${others.map((name) => `export const ${name} = real.${name};`).join("\n")}
  `;
}

const CAPTURED = /^(?:chart\.js(?:\/auto)?|echarts(?:\/core)?|@observablehq\/plot)$/;

/** Wrap Chart.js, ECharts, and Observable Plot so the checker can read series data from the chart, not from meta. */
export function libraryCapturePlugin() {
  return {
    name: "library-capture",
    setup(build) {
      build.onResolve({ filter: CAPTURED }, (args) => {
        if (args.pluginData?.ckReal) return null;
        return { path: args.path, namespace: "ck-capture" };
      });
      build.onResolve({ filter: /[/\\]node_modules[/\\](?:chart\.js|echarts)[/\\]/ }, (args) => {
        if (build.initialOptions.platform === "node") return { path: args.path, external: true };
        return null;
      });
      build.onLoad({ filter: /.*/, namespace: "ck-capture" }, async (args) => {
        const real = require.resolve(args.path);
        const names = await exportNames(real);
        const contents = args.path.startsWith("chart.js")
          ? chartWrapper(real, names)
          : args.path.startsWith("echarts")
            ? echartsWrapper(real, names)
            : plotWrapper(real, names);
        return { contents, resolveDir: dirname(real) };
      });
    },
  };
}
