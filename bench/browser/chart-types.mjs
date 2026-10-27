/**
 * ChartKit paint matrix. One adapter per gallery type except line, which is
 * projected from the existing line sweep so it is not measured twice.
 * Homepage row "area" is native stacked-area. There is no type id "area".
 */

export const GALLERY_TYPES = [
  "line",
  "bar",
  "pie",
  "donut",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "gantt",
  "timeline",
  "quadrant",
  "venn",
  "journey",
  "radial-bar",
  "rose",
  "sunburst",
  "bar-list",
];

export const PAINT_STATUSES = ["ok", "unsupported", "blocked", "error", "timeout", "skipped"];

export const PAINT_SCHEMA = {
  version: 1,
  statuses: PAINT_STATUSES,
  phase: 1,
  librariesThisPhase: ["ChartKit"],
  fields: [
    "chart",
    "homepageRow",
    "library",
    "id",
    "variant",
    "renderer",
    "points",
    "nMeaning",
    "why",
    "method",
    "status",
    "initialMs",
    "updateMs",
    "renderMs",
    "updateRenderMs",
    "gzipBytes",
    "ssrMs",
    "samples",
    "error",
  ],
  later:
    "Later paint, bundle, and SSR phases add a cell per library, including commercial compare-matrix rivals (Highcharts, amCharts, ApexCharts community and commercial builds, AG Charts enterprise, MUI X Pro and Premium, and the same class of product). Use the published npm or CDN build a customer would install. Record license and watermark limits on the cell. A missing license key is status blocked with a note, not a silent omission and not a reason to drop the rest of that set. unsupported means that library has no native chart of that type. gzipBytes and ssrMs stay null until those phases fill them.",
};

export const CHART_METHOD =
  "Phase 1 paints ChartKit only, one gallery type from apps/web/src/data/chart-types.ts. There is no type id area. The homepage row area is native stacked-area (full size, four series). A single filled line stays type line with mark.area true. mini-area is the small no-axis fill and has its own row. Line multi-size, canvas, and sampling-none cells are projected from the existing line sweep and are not measured again. The timer matches that sweep: build data before the clock, assign the SVG to innerHTML, then wait for two animation frames. The reported time is the median of BENCH_SAMPLES fresh pages (default 5) at 640×360. An error SVG (ck-chart-error) fails the sample. ChartKit updates are a second full SVG replacement, the same as the line row. gzipBytes and ssrMs are null in this phase. " +
  PAINT_SCHEMA.later;

export const chartTypeDefs = [
  {
    id: "stacked-area",
    file: "stacked-area",
    exportName: "stackedArea",
    sizes: [100_000],
    homepageRow: "area",
    nMeaning: "x positions; 4 stacked series",
    why: "Homepage area row. Dense series at the line's 100,000 x count, sampling auto. Four series is a normal stack. N is the x length, not the series count.",
  },
  {
    id: "bar",
    file: "bar",
    exportName: "bar",
    sizes: [48],
    homepageRow: "bar",
    nMeaning: "categories; one series",
    why: "Homepage bar row. A 640px bar chart of 100,000 categories is not a readable comparison. 48 categories is a long single-series bar.",
  },
  {
    id: "pie",
    file: "pie",
    exportName: "pie",
    sizes: [8],
    homepageRow: null,
    nMeaning: "slices",
    why: "Parts of a whole. Eight slices is a full pie. Hundreds of slices are not the chart people publish, and small slices collapse into other.",
  },
  {
    id: "donut",
    file: "donut",
    exportName: "donut",
    sizes: [8],
    homepageRow: "donut",
    nMeaning: "slices",
    why: "Homepage donut row. Same parts-of-a-whole limit as pie. The hole is the donut default, not a pie drawn again.",
  },
  {
    id: "scatter",
    file: "scatter",
    exportName: "scatter",
    sizes: [100_000],
    homepageRow: "scatter",
    nMeaning: "points",
    why: "Homepage scatter row. Dense cloud at the line's 100,000 count. Scatter draws every point and does not sample.",
  },
  {
    id: "combo",
    file: "combo",
    exportName: "combo",
    sizes: [48],
    homepageRow: null,
    nMeaning: "categories; one bar series and one line series",
    why: "Native combo is bars plus a line on categories. 100,000 bars would be a different chart. 48 categories matches the bar cell.",
  },
  {
    id: "heatmap",
    file: "heatmap",
    exportName: "heatmap",
    sizes: [1200],
    homepageRow: "heatmap",
    nMeaning: "grid cells; 40 columns by 30 rows",
    why: "Homepage heatmap row. layout grid, one rect per cell. A calendar paints at most weeks×7 cells, so it cannot represent a large N. 100,000 cells are not separable on 640×360. 40×30 still has a cell.",
  },
  {
    id: "gauge",
    file: "gauge",
    exportName: "gauge",
    sizes: [1],
    homepageRow: null,
    nMeaning: "one metric",
    why: "The chart is a single number in metric. There is no series to lengthen.",
  },
  {
    id: "kpi",
    file: "kpi",
    exportName: "kpi",
    sizes: [1],
    homepageRow: null,
    nMeaning: "one metric; sparkline fixed at 24",
    why: "N is the metric. The sparkline is the gallery's optional series and stays 24 numbers so it is not mistaken for N.",
  },
  {
    id: "sparkline",
    file: "sparkline",
    exportName: "sparkline",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "values in a number array",
    why: "Same dense series as the line. sampling auto. Data is a number array, which is the native sparkline shape. The frame is still 640×360.",
  },
  {
    id: "mini-area",
    file: "mini-area",
    exportName: "miniArea",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "values in a number array",
    why: "Small filled trend, not the homepage area row. sampling auto, number array, 640×360 frame.",
  },
  {
    id: "progress-ring",
    file: "progress-ring",
    exportName: "progressRing",
    sizes: [1],
    homepageRow: null,
    nMeaning: "one metric",
    why: "A single share of metric.max. No series.",
  },
  {
    id: "spike",
    file: "spike",
    exportName: "spike",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "points",
    why: "Dense marks. sampling auto, same 100,000 count as the line.",
  },
  {
    id: "candlestick",
    file: "candlestick",
    exportName: "candlestick",
    sizes: [2000, 100_000],
    homepageRow: null,
    nMeaning: "OHLC candles, plus volume",
    why: "No sampling; every candle is drawn. 2,000 is a long series that still builds. 100,000 candles put about 200,000 prices into one Math.max spread, which throws past about 150,000 numbers in V8. That larger cell stays in the matrix so a throw is status error, not a missing row. If a runtime paints it, the timing is real.",
  },
  {
    id: "histogram",
    file: "histogram",
    exportName: "histogram",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "observations before binning",
    why: "Dense sample. mark.bins is 32 and the renderer caps bins at 60, so the painted marks are bins. N is the observations.",
  },
  {
    id: "boxplot",
    file: "boxplot",
    exportName: "boxplot",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "observations across 8 categories",
    why: "N is observations, split round-robin across eight groups. Values stay inside the Tukey fences, so the paint is the boxes rather than a cloud of outlier dots.",
  },
  {
    id: "radar",
    file: "radar",
    exportName: "radar",
    sizes: [8],
    homepageRow: null,
    nMeaning: "spokes; 3 series",
    why: "A radar needs at least three spokes. Eight spokes and three series is a comparison, not a dense line. Fewer than three spokes is unsupported.",
  },
  {
    id: "funnel",
    file: "funnel",
    exportName: "funnel",
    sizes: [8],
    homepageRow: null,
    nMeaning: "stages",
    why: "Stages in order. Eight is a long funnel. N is not a dense series.",
  },
  {
    id: "treemap",
    file: "treemap",
    exportName: "treemap",
    sizes: [48],
    homepageRow: null,
    nMeaning: "tiles; 6 color groups",
    why: "Flat tiles with a group, the gallery shape. 48 tiles still read as areas. 100,000 tiles would not.",
  },
  {
    id: "sankey",
    file: "sankey",
    exportName: "sankey",
    sizes: [48],
    homepageRow: null,
    nMeaning: "links across 4 layers",
    why: "N is links in a forward layered flow, not nodes and not a dense series. 48 links is a wide sankey.",
  },
  {
    id: "bullet",
    file: "bullet",
    exportName: "bullet",
    sizes: [6],
    homepageRow: null,
    nMeaning: "rows, each with a target and three ranges",
    why: "A bullet is a short list of measures. Six rows is already a tall comparison.",
  },
  {
    id: "waterfall",
    file: "waterfall",
    exportName: "waterfall",
    sizes: [12],
    homepageRow: null,
    nMeaning: "steps, including the opening and closing totals",
    why: "Signed steps between totals. Twelve steps is a full bridge. The first and last rows are totals.",
  },
  {
    id: "area-range",
    file: "area-range",
    exportName: "areaRange",
    sizes: [100_000],
    homepageRow: null,
    nMeaning: "x positions; low, high, and a centre line",
    why: "Dense band. The renderer does not sample, so N is every vertex of the band. Same 100,000 x count as the line.",
  },
  {
    id: "bar-range",
    file: "bar-range",
    exportName: "barRange",
    sizes: [24],
    homepageRow: null,
    nMeaning: "floating bars",
    why: "One bar from low to high per category. 24 is a long range bar. Not a 100,000-bar stress test.",
  },
  {
    id: "errorbar",
    file: "errorbar",
    exportName: "errorbar",
    sizes: [24],
    homepageRow: null,
    nMeaning: "points with low and high whiskers",
    why: "Default mark is a point with whiskers. 24 categories. A 100,000-whisker plot is not this chart.",
  },
  {
    id: "gantt",
    file: "gantt",
    exportName: "gantt",
    sizes: [24],
    homepageRow: null,
    nMeaning: "tasks, with a dependency chain and one milestone",
    why: "A schedule. 24 tasks is a large plan on 640×360. N is tasks.",
  },
  {
    id: "timeline",
    file: "timeline",
    exportName: "timeline",
    sizes: [16],
    homepageRow: null,
    nMeaning: "events and periods",
    why: "Mostly events, every fourth mark a period. 16 items fill a date axis. N is items.",
  },
  {
    id: "quadrant",
    file: "quadrant",
    exportName: "quadrant",
    sizes: [24],
    homepageRow: null,
    nMeaning: "labeled points on a unit square",
    why: "A quadrant chart is a handful of named points, not a 100,000-point scatter. 24 points.",
  },
  {
    id: "venn",
    file: "venn",
    exportName: "venn",
    sizes: [3],
    homepageRow: null,
    nMeaning: "sets; the data has 7 region rows",
    why: "Three sets is the largest Venn this chart draws. Two sets are the other supported shape. Four or more is unsupported (the renderer returns an error SVG). N is sets, not regions.",
  },
  {
    id: "journey",
    file: "journey",
    exportName: "journey",
    sizes: [12],
    homepageRow: null,
    nMeaning: "steps scored 1 to 5",
    why: "Steps grouped into sections. Twelve steps is a long journey. The score scale is 1–5, so N cannot be a magnitude.",
  },
  {
    id: "radial-bar",
    file: "radial-bar",
    exportName: "radialBar",
    sizes: [12],
    homepageRow: null,
    nMeaning: "categories around a circle",
    why: "One series. Twelve bars fill the circle. More categories stop being separate bars.",
  },
  {
    id: "rose",
    file: "rose",
    exportName: "rose",
    sizes: [12],
    homepageRow: null,
    nMeaning: "equal-angle slices",
    why: "Nightingale / rose. Twelve slices. Radius encodes the value. Not a dense series.",
  },
  {
    id: "sunburst",
    file: "sunburst",
    exportName: "sunburst",
    sizes: [48],
    homepageRow: null,
    nMeaning: "leaves under 6 branches",
    why: "Nested children, two rings. 48 leaves (six branches). A 100,000-leaf sunburst is not a readable hierarchy.",
  },
  {
    id: "bar-list",
    file: "bar-list",
    exportName: "barList",
    sizes: [20],
    homepageRow: null,
    nMeaning: "ranked rows",
    why: "On-demand list, not in the line or all bundle. Twenty rows is a long ranking. The module is imported on its own.",
  },
];

export function classifyStatus(message) {
  const text = String(message ?? "");
  const lower = text.toLowerCase();
  if (lower.includes("unsupported:")) return "unsupported";
  if (lower.includes("blocked:")) return "blocked";
  if (lower.includes("timeout")) return "timeout";
  return "error";
}

export function chartTypeAdapters() {
  return chartTypeDefs.map((def) => ({
    id: `chartkit-${def.id}`,
    suite: "chart-types",
    chart: def.id,
    homepageRow: def.homepageRow,
    nMeaning: def.nMeaning,
    why: def.why,
    variant: null,
    sizes: def.sizes,
    source: sourceFor(def),
  }));
}

function sourceFor(def) {
  return `
import { makeChartData } from "../lib/shapes.mjs";
import { chartSpec } from "./chart-specs.mjs";
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
import { createRenderer } from "../../packages/core/src/render.ts";
import { ${def.exportName} as chart } from "../../packages/core/src/charts/${def.file}.ts";
const render = createRenderer([chart]);
const CHART = ${JSON.stringify(def.id)};
globalThis.__bench = {
  library: "ChartKit",
  renderer: "svg",
  chart: CHART,
  async run(n) {
    const host = document.createElement("div");
    document.getElementById("root").replaceChildren(host);
    const paint = async (data) => {
      const t = performance.now();
      const svg = render(chartSpec(CHART, data));
      host.innerHTML = svg;
      const renderMs = performance.now() - t;
      if (!svg || !svg.includes("<svg") || svg.includes("ck-chart-error")) {
        const text = host.textContent.replace(/\\s+/g, " ").trim().slice(0, 240);
        throw new Error(text || "chart did not render");
      }
      await frames();
      return renderMs;
    };
    return timed(CHART, n, paint, paint);
  },
};
`;
}
