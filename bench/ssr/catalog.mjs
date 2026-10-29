/**
 * SSR cells. One row per bundle cell and paint-matrix N.
 * Line is 100,000. Candlestick keeps both paint sizes.
 */

import { chartTypeDefs } from "../browser/chart-types.mjs";
import { buildMatrix } from "../bundle/catalog.mjs";

const sizes = new Map(chartTypeDefs.map((def) => [def.id, { sizes: def.sizes, nMeaning: def.nMeaning }]));
sizes.set("line", { sizes: [100_000], nMeaning: "points; sampling auto" });

export const SSR_SAMPLES = 5;

export const ssrMethod = "Node string or SVG render at the paint-matrix N. Line is 100,000 points. Candlestick is timed at 2,000 and at 100,000. Other types use the paint N (100,000 where the series is dense, smaller for categories and hierarchies). Data is built before the clock. One untimed warmup, then the median of 5. ChartKit calls createRenderer of that chart. ECharts uses init(null, { renderer: svg, ssr: true }) and renderToSVGString. Recharts, Nivo, visx, Victory, MUI X, and Tremor use renderToStaticMarkup. Observable Plot uses linkedom. Vega-Lite compiles the spec and vega View.toSVG runs it. ApexCharts uses apexcharts/ssr renderToString. A library with no headless string path is unsupported. A throw is error. No timing is invented.";

export function buildSsrMatrix() {
  const cells = [];
  for (const bundleCell of buildMatrix()) {
    if (bundleCell.chart === "all") continue;
    const spec = sizes.get(bundleCell.chart);
    const pointsList = spec?.sizes ?? [null];
    for (const points of pointsList) {
      const runnable = bundleCell.status === "ok" && bundleCell.ssr;
      cells.push({
        id: bundleCell.id,
        library: bundleCell.library,
        chart: bundleCell.chart,
        points,
        nMeaning: spec?.nMeaning ?? null,
        renderer: runnable ? bundleCell.ssr === "chartkit" || bundleCell.ssr === "echarts" || bundleCell.ssr === "plot" || bundleCell.ssr === "vega" || bundleCell.ssr === "apex" ? "svg" : bundleCell.renderer : bundleCell.renderer,
        status: runnable ? "ok" : bundleCell.status === "ok" ? "unsupported" : bundleCell.status,
        note: runnable ? bundleCell.ssrNote ?? bundleCell.note : bundleCell.status === "ok" ? bundleCell.ssrNote : bundleCell.note,
        ssr: bundleCell.ssr,
        samples: SSR_SAMPLES,
      });
    }
  }
  return cells;
}
