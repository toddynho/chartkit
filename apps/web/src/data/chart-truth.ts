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
  streamgraph: {
    summary: "Stacked areas around a moving baseline. The baseline is not zero.",
    entry: "@chartkitdev/core/charts/streamgraph",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "Wide data uses encoding.y as a list of fields. Long data uses one y field and encoding.color or encoding.series.",
      "mark.streamOffset is wiggle (the default), center, zero, or expand. silhouette is center.",
      "mark.order is inside-out on a wiggle, or none, ascending, or descending.",
      "The y axis is in offset space. The tooltip reports the raw value and its share.",
    ],
    options: [
      { path: "`encoding.x` / `encoding.y`", role: "Position and layer values. y may be a list.", status: drawn },
      { path: "`encoding.color`", role: "Layer name on long data, or a series color", status: drawn },
      { path: "`mark.streamOffset`", role: "wiggle (default), center, zero, or expand", status: drawn },
      { path: "`mark.order`", role: "inside-out, none, ascending, or descending", status: drawn },
      { path: "`mark.curve`", role: "monotone (default), linear, or step", status: drawn },
      { path: "`mark.labels`", role: "Full series name where the layer is thick enough to hold it. A name that would collide stays on the area.", status: drawn },
      { path: "`legend`", role: "Click and hover use the shared legend", status: drawn },
    ],
    extra: [
      {
        title: "When to use it",
        paragraphs: ["A composition over time, when the shape of the change matters more than the total or a reading off zero."],
        list: [],
        code: [],
      },
      {
        title: "Error codes",
        paragraphs: [
          "CK3095 is an error when a layer value is negative or not a number. CK3096 warns on one series and repair sets mark.streamOffset to zero. CK3097 warns above 12 series. CK3098 removes mark.stack. CK3099 and CK3100 remove streamOffset and order on other chart types. CK3101 removes mark.offset, which is the pie slice pull.",
        ],
        list: [],
        code: [],
      },
    ],
  },
  tree: {
    summary: "A tidy node-link layout of one hierarchy. Cluster lines the leaves up.",
    entry: "@chartkitdev/core/charts/tree",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "encoding.id and encoding.parent, nested children, or encoding.path. One root.",
      "mark.tree tidy is Reingold–Tilford. cluster is the dendrogram: every leaf at the same depth.",
      "mark.orient is LR, RL, TB, or BT. mark.radial puts the root at the center.",
      "Each node keeps its full name. The margin grows to hold it. Org-chart boxes are not this chart.",
    ],
    options: [
      { path: "`encoding.id` / `encoding.parent`", role: "Node and its one parent. An empty parent is the root.", status: drawn },
      { path: "`mark.tree`", role: "tidy (default) or cluster", status: drawn },
      { path: "`mark.orient`", role: "LR (default), RL, TB, or BT", status: drawn },
      { path: "`mark.link`", role: "curve (default) or step", status: drawn },
      { path: "`mark.radial`", role: "Root at the center. Off by default.", status: drawn },
    ],
    extra: [
      {
        title: "When to use it",
        paragraphs: ["Who connects to whom, and each node has one parent. A weighted flow is a sankey. A partition of a quantity is a treemap or a sunburst."],
        list: [],
        code: [],
      },
    ],
  },
  density: {
    summary: "A kernel density curve of encoding.x. The rows stay the raw sample.",
    entry: "@chartkitdev/core/charts/density",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "The spec does not contain a density transform. The rows are the observations.",
      "mark.bandwidth auto is Scott's rule. A number is the Gaussian width.",
      "mark.normalize density integrates to 1. count multiplies by the sample size.",
      "Groups from encoding.color or encoding.series overlay. mark.rug draws the raw points.",
    ],
    options: [
      { path: "`encoding.x`", role: "The raw sample", status: drawn },
      { path: "`encoding.color`", role: "One curve per group", status: drawn },
      { path: "`mark.bandwidth`", role: "auto (Scott's rule) or a number", status: drawn },
      { path: "`mark.normalize`", role: "density (default) or count", status: drawn },
      { path: "`mark.rug`", role: "Draw the raw observations under the curve", status: drawn },
      { path: "`mark.orientation`", role: "horizontal (default) or vertical", status: drawn },
    ],
    extra: [
      {
        title: "When to use it",
        paragraphs: ["The shape of a distribution: where the mass sits, and whether there is a second bump. Counts in bins are a histogram. A median and quartiles are a boxplot or a strip."],
        list: [],
        code: [],
      },
    ],
  },
  strip: {
    summary: "Every observation is a dot on one numeric axis, with one row per group. A median tick is the default.",
    entry: "@chartkitdev/core/charts/strip",
    bundle: "@chartkitdev/core/extra",
    notes: [
      "Horizontal is the default. encoding.y is the group and encoding.x is the value. mark.orientation vertical swaps them.",
      "mark.summary is median, mean, or none. mark.band is none, range, or iqr. mark.jitter is none, auto, or a pixel distance.",
      "mark.highlight names one group. That row uses accent. The others use muted. The tick stays ink.",
      "encoding.label is the point name in the tooltip. It is not drawn on the plot.",
    ],
    options: [
      { path: "`encoding.x` / `encoding.y`", role: "Value and group. Horizontal: x is the value, y is the group.", status: drawn },
      { path: "`encoding.label`", role: "Point name in the tooltip", status: drawn },
      { path: "`encoding.color`", role: "Color the dots by a field", status: drawn },
      { path: "`mark.summary`", role: "median (default), mean, or none", status: drawn },
      { path: "`mark.band`", role: "none (default), range, or iqr", status: drawn },
      { path: "`mark.jitter`", role: "auto (default), none, or a pixel distance", status: drawn },
      { path: "`mark.highlight`", role: "Group drawn in accent", status: drawn },
      { path: "`mark.sort`", role: "none (default), asc, or desc by the summary", status: drawn },
      { path: "`mark.orientation`", role: "Omitted is horizontal. vertical swaps the axes.", status: drawn },
      { path: "`annotations`", role: "compare draws a bracket between two groups", status: drawn },
    ],
    extra: [
      {
        title: "When to use it",
        paragraphs: [
          "A few groups, and you want the distribution rather than one bar per group. The token chart is the reference: five libraries, nine models, a median tick, and a min-to-max band.",
        ],
        list: [],
        code: [],
      },
      {
        title: "When not to",
        paragraphs: [
          "Use boxplot once there are many groups. Use scatter when both axes are numeric. Use bar when each group is one aggregate.",
        ],
        list: [],
        code: [],
      },
      {
        title: "One point per group",
        paragraphs: [
          "The chart becomes a dot plot. The summary tick and the band are hidden. repair() writes mark.summary and mark.band as none.",
        ],
        list: [],
        code: [
          '{\n  "version": "1",\n  "type": "strip",\n  "data": [\n    { "region": "North", "ms": 42 },\n    { "region": "South", "ms": 55 },\n    { "region": "East", "ms": 31 }\n  ],\n  "encoding": { "x": "ms", "y": "region" },\n  "a11y": { "alt": "South is slowest at 55 ms." }\n}',
        ],
      },
      {
        title: "Vertical, with color",
        paragraphs: [
          "mark.orientation vertical puts the groups on x. encoding.color splits the dots. A band needs at least three points in the group.",
        ],
        list: [],
        code: [
          '{\n  "version": "1",\n  "type": "strip",\n  "data": [\n    { "desk": "A", "minutes": 12, "shift": "Weeknight" },\n    { "desk": "A", "minutes": 18, "shift": "Weeknight" },\n    { "desk": "A", "minutes": 28, "shift": "Saturday" },\n    { "desk": "A", "minutes": 40, "shift": "Saturday" },\n    { "desk": "B", "minutes": 14, "shift": "Weeknight" },\n    { "desk": "B", "minutes": 22, "shift": "Weeknight" },\n    { "desk": "B", "minutes": 36, "shift": "Saturday" },\n    { "desk": "B", "minutes": 44, "shift": "Saturday" }\n  ],\n  "encoding": { "x": "desk", "y": "minutes", "color": "shift" },\n  "mark": { "orientation": "vertical", "summary": "mean", "band": "iqr" },\n  "a11y": { "alt": "Saturday runs longer on both desks." }\n}',
        ],
      },
      {
        title: "Error codes",
        paragraphs: [
          "CK3087 warns when the group field is numeric and draws each distinct number as a category. CK3088 is an error when the value field has no numbers. CK3089 warns above 12 groups. CK3090 warns when a band is asked for and a group has fewer than 3 points. CK3091 warns when every group has one point. CK3092 warns when highlight matches nothing. CK3093 warns when a compare annotation is not on a strip. CK3094 warns when encoding.label is set on another type.",
        ],
        list: [],
        code: [],
      },
    ],
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
