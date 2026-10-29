import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ChartDoc, ChartOption, DocSection } from "./docs-catalog";
import { repoRoot } from "../lib/repo-root";

let chartkitGzipBytes: Map<string, number> | null = null;

function chartkitGzip(chart: string): string | null {
  if (!chartkitGzipBytes) {
    const file = JSON.parse(readFileSync(join(repoRoot(), "bench/results/bundle.json"), "utf8")) as {
      cells: { library?: string; chart?: string; status?: string; gzipBytes?: number | null }[];
    };
    chartkitGzipBytes = new Map();
    for (const cell of file.cells) {
      if (cell.library === "ChartKit minimal" && cell.status === "ok" && typeof cell.chart === "string" && typeof cell.gzipBytes === "number") {
        chartkitGzipBytes.set(cell.chart, cell.gzipBytes);
      }
    }
  }
  const bytes = chartkitGzipBytes.get(chart);
  return bytes == null ? null : `${bytes.toLocaleString("en-US")} B`;
}

type Truth = {
  summary: string;
  notes: string[];
  entry: string;
  bundle: string;
  options?: ChartOption[];
  extra?: DocSection[];
};

const drawn = "in the library";

const truth: Record<string, Truth> = {
  line: {
    summary: "A trend across ordered categories. Add area: true on a y channel for a filled line, or dash for a target.",
    entry: "@chartkitdev/core/charts/line",
    bundle: "@chartkitdev/core/all",
    notes: [
      "encoding.y is a field name or a list of channels.",
      "mark.curve is monotone by default. step, linear, step-before, and step-after are the other curves.",
      "mark.points is none, hover, or always. The field is not mark.markers.",
      "mark.area fills under the line. The field is not mark.fill.",
      "Axis titles are axes.x.title and axes.y.title.",
    ],
    options: [
      { path: "`encoding.y`", role: "Field name, or a list of channels", status: drawn },
      { path: "`mark.curve`", role: "monotone (default), linear, step, step-before, step-after", status: drawn },
      { path: "`mark.points`", role: "none, hover, or always", status: drawn },
      { path: "`mark.area`", role: "Fill under the line", status: drawn },
      { path: "`mark.sampling`", role: "auto by default. none draws every point", status: drawn },
      { path: "`axes.x.title`", role: "X axis title", status: drawn },
      { path: "`axes.y.title`", role: "Y axis title", status: drawn },
      { path: "`theme`", role: "soft (default), midnight, or a preset from themes/all", status: drawn },
      { path: "`a11y.alt`", role: "Required one-sentence description", status: drawn },
    ],
  },
  area: {
    summary: "There is no type area. A filled line is type line with mark.area. Several series that add up are stacked-area.",
    entry: "@chartkitdev/core/charts/line",
    bundle: "@chartkitdev/core/all",
    notes: [
      "The spec on this page is type line with mark.area true.",
      "encoding.y.area fills one channel and leaves the others as lines.",
      "stacked-area is the chart for parts of a whole over an ordered x.",
    ],
    extra: [
      {
        title: "Not a separate type",
        paragraphs: [
          "The v1 schema has line and stacked-area. It does not have area. This URL is the docs-nav name for a filled line.",
        ],
        list: [],
        code: [],
      },
    ],
  },
  bar: {
    summary: "A comparison across categories. Several y channels stack when mark.stack is stack or percent.",
    entry: "@chartkitdev/core/charts/bar",
    bundle: "@chartkitdev/core/all",
    notes: [
      "mark.orientation horizontal turns the bars sideways.",
      "encoding.series, or encoding.color set to a data field, splits the bars into series.",
      "cornerRadius and gap are mark options.",
    ],
  },
  pie: {
    summary: "Parts of a whole with no hole. encoding.x is the slice label and encoding.y is the value.",
    entry: "@chartkitdev/core/charts/pie",
    bundle: "@chartkitdev/core/all",
    notes: [
      "mark.startAngle, mark.padAngle, mark.cornerRadius, and mark.sort set the geometry.",
      "mark.other folds small slices. mark.explode and mark.offset pull slices out.",
      "Outside labels draw leader lines.",
    ],
  },
  donut: {
    summary: "Parts of a whole. encoding.x is the slice label and encoding.y is the value. The center shows the total.",
    entry: "@chartkitdev/core/charts/donut",
    bundle: "@chartkitdev/core/all",
    notes: [
      "A pie is type pie. mark.innerRadius 0 on a donut only removes the hole.",
      "legend.position bottom keeps the labels under the ring.",
    ],
  },
  "stacked-area": {
    summary: "Several series stacked into one shape. mark.stack percent normalizes each x to 100%.",
    entry: "@chartkitdev/core/charts/stacked-area",
    bundle: "@chartkitdev/core/all",
    notes: ["encoding.y is a list of fields.", "The default stack is stack, not grouped."],
  },
  scatter: {
    summary: "Two quantitative fields, with an optional size channel for bubbles.",
    entry: "@chartkitdev/core/charts/scatter",
    bundle: "@chartkitdev/core/all",
    notes: [
      "Keep the size range inside the plot. Very large bubbles are clipped.",
      "scale.type log draws a log axis for a positive domain.",
    ],
  },
  combo: {
    summary: "Bars and a line in one spec. Put the line on axis y2 when the units differ.",
    entry: "@chartkitdev/core/charts/combo",
    bundle: "@chartkitdev/core/all",
    notes: [
      "Each y channel has its own mark: bar, line, or area.",
      "axes.y2.title labels the right axis. encoding.y is a list, not encoding.bar.",
    ],
  },
  heatmap: {
    summary: "A grid when x, y, and color are set. A calendar when x is a date and color is the measure.",
    entry: "@chartkitdev/core/charts/heatmap",
    bundle: "@chartkitdev/core/all",
    notes: [
      "mark.layout calendar or grid selects the layout. A date x plus color infers calendar.",
      "The measure is encoding.color, not encoding.value.",
    ],
  },
  gauge: {
    summary: "A semicircular meter. The number lives in metric, with min, max, and optional bands.",
    entry: "@chartkitdev/core/charts/gauge",
    bundle: "@chartkitdev/core/all",
    notes: ["metric.value is required.", "Bands use token names such as positive and negative."],
  },
  kpi: {
    summary: "A label, a formatted value, a delta, and an optional sparkline from data.",
    entry: "@chartkitdev/core/charts/kpi",
    bundle: "@chartkitdev/core/all",
    notes: [
      "metric.format accepts compact, percent, currency, and duration-ms.",
      "metric.goodDirection down paints a falling error rate as positive.",
    ],
  },
  sparkline: {
    summary: "A small line with no axes. data can be a plain number array.",
    entry: "@chartkitdev/core/charts/sparkline",
    bundle: "@chartkitdev/core/all",
    notes: ["No axes. Use it in a table cell or a KPI.", "sampling auto still applies on long arrays."],
  },
  "mini-area": {
    summary: "A small filled trend. data may be a number array.",
    entry: "@chartkitdev/core/charts/mini-area",
    bundle: "@chartkitdev/core/all",
    notes: ["No axes. The area is the whole chart."],
  },
  "progress-ring": {
    summary: "A circular share of metric.max. The number is metric.value, not a data column.",
    entry: "@chartkitdev/core/charts/progress-ring",
    bundle: "@chartkitdev/core/all",
    notes: ["Set min and max. The ring is value divided by that range."],
  },
  spike: {
    summary: "Thin marks for bursts over time.",
    entry: "@chartkitdev/core/charts/spike",
    bundle: "@chartkitdev/core/all",
    notes: ["encoding.x and encoding.y name the columns."],
  },
  candlestick: {
    summary: "Open, high, low, and close. Optional volume.",
    entry: "@chartkitdev/core/charts/candlestick",
    bundle: "@chartkitdev/core/all",
    notes: [
      "encoding needs x, open, high, low, and close.",
      "A temporal x is a time axis, formatted from the span instead of a raw ISO string.",
    ],
  },
  histogram: {
    summary: "Bins one quantitative field. mark.bins sets the count.",
    entry: "@chartkitdev/core/charts/histogram",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the value to bin.", "The renderer ships in @chartkitdev/core/extra, not in the line bundle."],
  },
  boxplot: {
    summary: "Quartiles, whiskers, a median, and outlier dots for each category.",
    entry: "@chartkitdev/core/charts/boxplot",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the category and encoding.y is the observation.", "The renderer ships in @chartkitdev/core/extra."],
  },
  radar: {
    summary: "One polygon per series around a shared set of spokes.",
    entry: "@chartkitdev/core/charts/radar",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the spoke. encoding.y is one field or a list.", "At least three spokes."],
  },
  funnel: {
    summary: "Stages in data order, width proportional to the value.",
    entry: "@chartkitdev/core/charts/funnel",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the stage and encoding.y is the value."],
  },
  treemap: {
    summary: "Area tiles. encoding.color groups them.",
    entry: "@chartkitdev/core/charts/treemap",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the tile name and encoding.y is the size."],
  },
  sankey: {
    summary: "Flows from a source field to a target field.",
    entry: "@chartkitdev/core/charts/sankey",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.source, encoding.target, and encoding.y name the columns."],
  },
  bullet: {
    summary: "A value against a target and qualitative ranges.",
    entry: "@chartkitdev/core/charts/bullet",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.y is the value and encoding.target is the target.", "mark.ranges names the range fields."],
  },
  waterfall: {
    summary: "Signed steps between totals.",
    entry: "@chartkitdev/core/charts/waterfall",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.x is the step and encoding.y is the amount.", "A total row is a full bar, not a delta."],
  },
  "area-range": {
    summary: "A band between a low and a high, with an optional centre line.",
    entry: "@chartkitdev/core/charts/area-range",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "encoding.low and encoding.high, or y.lo and y.hi, name the band.",
      "encoding.y is the centre line. mark.line false draws the band only.",
    ],
  },
  "bar-range": {
    summary: "A floating bar from a low value to a high value.",
    entry: "@chartkitdev/core/charts/bar-range",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.low and encoding.high are the ends. The bar does not start at zero."],
  },
  errorbar: {
    summary: "Whiskers on a point or a bar.",
    entry: "@chartkitdev/core/charts/errorbar",
    bundle: "@chartkitdev/core/extra",
    notes: ["encoding.low and encoding.high, or encoding.error as ± around y.", "mark.error is point or bar. point is the default."],
  },
  gantt: {
    summary: "Tasks as bars on a time axis, with sections, milestones, and dependencies.",
    entry: "@chartkitdev/core/charts/gantt",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "start plus end, or duration. status is done, active, or crit.",
      "Field rules live in validatePhase4. The main validate() entry warns CK1011 and points there.",
    ],
  },
  timeline: {
    summary: "Events on a date axis, with eras as spans.",
    entry: "@chartkitdev/core/charts/timeline",
    bundle: "@chartkitdev/core/extra",
    notes: ["kind period uses start and end.", "Field rules live in validatePhase4."],
  },
  quadrant: {
    summary: "Points on a square split into four labeled regions.",
    entry: "@chartkitdev/core/charts/quadrant",
    bundle: "@chartkitdev/core/extra",
    notes: ["x and y default to 0..1. quadrants names the four regions.", "Field rules live in validatePhase4."],
  },
  venn: {
    summary: "Two or three sets. Two are area-proportional. Three are approximate.",
    entry: "@chartkitdev/core/charts/venn",
    bundle: "@chartkitdev/core/extra",
    notes: ["An intersection joins set names with +.", "Field rules live in validatePhase4."],
  },
  journey: {
    summary: "Sections and steps, with a 1–5 score and actor chips.",
    entry: "@chartkitdev/core/charts/journey",
    bundle: "@chartkitdev/core/extra",
    notes: ["The score is a face on a five-step scale. actors is a comma-separated list.", "Field rules live in validatePhase4."],
  },
  "radial-bar": {
    summary: "Categories around a circle. Length is the radius. Series sit side by side unless they stack outward.",
    entry: "@chartkitdev/core/charts/radial-bar",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "encoding.x is the category. encoding.y is one field or a list.",
      "The chart loads from @chartkitdev/core/charts/radial-bar. createRenderer([line]) does not include it.",
    ],
  },
  rose: {
    summary: "Equal angles, with the radius as the value. Polar area and nightingale use this type.",
    entry: "@chartkitdev/core/charts/rose",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "encoding.x is the category. encoding.y is the radius.",
      "polarArea, nightingale, and rose-chart repair to rose.",
    ],
  },
  sunburst: {
    summary: "Concentric rings for a hierarchy. Colour follows the top-level branch.",
    entry: "@chartkitdev/core/charts/sunburst",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "Nested children, encoding.path, or encoding.id with encoding.parent.",
      "mark.innerRadius is the hole. mark.depth caps the rings.",
    ],
  },
  "bar-list": {
    summary: "Ranked rows with no axes. A track sits behind the label and the value sits on the right.",
    entry: "@chartkitdev/core/charts/bar-list",
    bundle: "@chartkitdev/core/charts/bar-list",
    notes: [
      "Not in the line or all bundle. Call renderBarList from @chartkitdev/core/charts/bar-list.",
      "encoding.x is the label. encoding.y is the value.",
    ],
  },
};

export function withTruth(chart: ChartDoc): ChartDoc {
  const item = truth[chart.type];
  if (!item) return chart;
  const facts = [
    { k: "Import", v: item.entry },
    { k: "Bundle", v: item.bundle },
    ...(chart.type === "line" && chartkitGzip("line") ? [{ k: "Line gzip", v: chartkitGzip("line") as string }] : []),
    ...(chart.type === "area" ? [{ k: "Spec type", v: "line" }] : []),
  ];
  const options =
    item.options ??
    item.notes.map((note) => ({
      path: note,
      role: "Current docs",
      status: drawn,
    }));
  return {
    ...chart,
    lede: item.summary,
    description: item.summary,
    facts,
    options,
    anatomy: item.notes,
    notes: item.extra ?? [],
  };
}
