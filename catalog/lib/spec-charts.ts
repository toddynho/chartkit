import { examples } from "./specs";

export interface SpecPage {
  title: string;
  summary: string;
  fields: string[];
  example: string;
}

export const specPages: Record<string, SpecPage> = {
  histogram: {
    title: "Histogram",
    summary: "Bins one quantitative field, or draws counts that are already binned.",
    fields: [
      "type is histogram.",
      "data is one row per observation, or one row per bin when encoding.y is set.",
      "encoding.x is the value to bin. encoding.y, when present, is the pre-binned count.",
      "mark.bins is the bin count (default 8, max 60). mark.binWidth sets a fixed width. mark.bin is count, width, sturges, sqrt, or fd. mark.binLabel prints that count at the top right. Omit it and the corner stays empty.",
      "hist repairs to histogram. encoding.value moves to encoding.x when x is missing.",
    ],
    example: `{
  "version": "1",
  "type": "histogram",
  "data": [{ "score": 1 }, { "score": 2 }, { "score": 2 }, { "score": 8 }],
  "encoding": { "x": "score" },
  "mark": { "bins": 2 },
  "a11y": { "alt": "Scores cluster at the low end." }
}`,
  },
  boxplot: {
    title: "Box plot",
    summary: "Quartile box, whiskers to the 1.5 IQR fence, a median line, and outlier dots.",
    fields: [
      "type is boxplot.",
      "encoding.x is the category. encoding.y holds the raw observations.",
      "The box spans the linear-percentile quartiles. Points outside 1.5 IQR are outliers.",
      "box and box-plot repair to boxplot.",
    ],
    example: `{
  "version": "1",
  "type": "boxplot",
  "data": [
    { "group": "A", "value": 1 },
    { "group": "A", "value": 3 },
    { "group": "A", "value": 9 },
    { "group": "B", "value": 2 },
    { "group": "B", "value": 4 }
  ],
  "encoding": { "x": "group", "y": "value" },
  "a11y": { "alt": "Group A stretches higher than group B." }
}`,
  },
  radar: {
    title: "Radar",
    summary: "Compares one or more series around a shared set of spokes.",
    fields: [
      "type is radar.",
      "encoding.x is the spoke label. At least three spokes are required. Rings and spoke lines are drawn.",
      "encoding.y is one field or a list of fields, one polygon per field.",
      "Values are scaled from zero to the largest number in the spec.",
    ],
    example: `{
  "version": "1",
  "type": "radar",
  "data": [
    { "spoke": "Speed", "car": 4, "bike": 2 },
    { "spoke": "Cost", "car": 2, "bike": 5 },
    { "spoke": "Ease", "car": 3, "bike": 4 }
  ],
  "encoding": { "x": "spoke", "y": ["car", "bike"] },
  "a11y": { "alt": "The bike scores higher on cost and ease." }
}`,
  },
  funnel: {
    title: "Funnel",
    summary: "Draws stages in data order, with width proportional to the value.",
    fields: [
      "type is funnel.",
      "encoding.x is the stage label. encoding.y is the value.",
      "Negative values are drawn as zero. The first stage sets the full width.",
      "mark.shape trapezoid (the default) draws one tapering funnel. Each stage shares its bottom edge with the next stage. bar draws centered rounded bars.",
    ],
    example: `{
  "version": "1",
  "type": "funnel",
  "data": [
    { "stage": "Visit", "count": 80 },
    { "stage": "Start", "count": 40 },
    { "stage": "Pay", "count": 12 }
  ],
  "encoding": { "x": "stage", "y": "count" },
  "a11y": { "alt": "12 of 80 visits pay." }
}`,
  },
  treemap: {
    title: "Treemap",
    summary: "Squarified tiles sized by a measure. Labels truncate to the tile. An optional group shares a series color.",
    fields: [
      "type is treemap.",
      "encoding.x is the tile label. encoding.y is the size. Non-positive sizes are skipped.",
      "encoding.color is an optional group. Tiles in a group share a series color, in lighter and darker tints, and sit side by side.",
      "name, size, value, and parent repair onto x, y, and color.",
    ],
    example: `{
  "version": "1",
  "type": "treemap",
  "data": [
    { "name": "Oak", "size": 8, "group": "Wood" },
    { "name": "Pine", "size": 5, "group": "Wood" },
    { "name": "Steel", "size": 6, "group": "Metal" }
  ],
  "encoding": { "x": "name", "y": "size", "color": "group" },
  "a11y": { "alt": "Oak is the largest tile." }
}`,
  },
  sankey: {
    title: "Sankey",
    summary: "Curved links between labeled nodes. Link thickness follows the value.",
    fields: [
      "type is sankey.",
      "encoding.source is the node the flow leaves. encoding.target is the node it enters. encoding.y is the amount.",
      "from, to, and value repair onto source, target, and y.",
      "Nodes are placed in columns from the links. A cycle stops at the last column.",
    ],
    example: `{
  "version": "1",
  "type": "sankey",
  "data": [
    { "from": "Source", "to": "Mill", "flow": 10 },
    { "from": "Mill", "to": "Shop", "flow": 6 }
  ],
  "encoding": { "source": "from", "target": "to", "y": "flow" },
  "a11y": { "alt": "The mill sends flow on to the shop." }
}`,
  },
  bullet: {
    title: "Bullet",
    summary: "A measure against qualitative bands and a target marker.",
    fields: [
      "type is bullet.",
      "encoding.x is the label. encoding.y is the measure. encoding.target is the goal.",
      "mark.ranges is a list of field names, worst to best. Each value is that band's upper edge.",
      "bullet-chart repairs to bullet.",
    ],
    example: `{
  "version": "1",
  "type": "bullet",
  "data": [{ "name": "Revenue", "value": 275, "target": 250, "good": 300 }],
  "encoding": { "x": "name", "y": "value", "target": "target" },
  "mark": { "ranges": ["good"] },
  "a11y": { "alt": "Revenue is past its target." }
}`,
  },
  "area-range": {
    title: "Range area",
    summary: "A band between low and high, with an optional centre line.",
    fields: [
      "type is area-range.",
      "encoding.low and encoding.high name the band. A y list of { lo, hi, title } draws several bands.",
      "encoding.y is the centre line. mark.line false draws the band only.",
      "A rule annotation can mark today. Null low and high values break the band.",
      "On a combo, a y item with mark range and lo/hi paints the band under the other series.",
      "arearange repairs to area-range. low and high on a y series repair to lo and hi.",
    ],
    example: `{
  "version": "1",
  "type": "area-range",
  "data": [
    { "month": "Jan", "revenue": 40, "lo": 36, "hi": 48 },
    { "month": "Feb", "revenue": 55, "lo": 46, "hi": 66 }
  ],
  "encoding": { "x": "month", "y": "revenue", "low": "lo", "high": "hi" },
  "a11y": { "alt": "Revenue is forecast inside a widening band." }
}`,
  },
  "bar-range": {
    title: "Range bar",
    summary: "A floating bar from a low value to a high value.",
    fields: [
      "type is bar-range.",
      "encoding.x is the category. encoding.low and encoding.high are the ends.",
      "The bar does not start at zero.",
      "columnrange and floating-bar repair to bar-range.",
    ],
    example: `{
  "version": "1",
  "type": "bar-range",
  "data": [
    { "month": "Jan", "min": -2, "max": 6 },
    { "month": "Jul", "min": 17, "max": 29 }
  ],
  "encoding": { "x": "month", "low": "min", "high": "max" },
  "a11y": { "alt": "July ranges from 17 to 29." }
}`,
  },
  errorbar: {
    title: "Error bar",
    summary: "Whiskers on a point or a bar, from a low and high or a ± field.",
    fields: [
      "type is errorbar.",
      "encoding.y is the centre. encoding.low and encoding.high are the whisker ends.",
      "encoding.error is a ± half-width around y. low and high override it.",
      "mark.error is point or bar. point is the default.",
      "errorbars repairs to errorbar.",
    ],
    example: `{
  "version": "1",
  "type": "errorbar",
  "data": [{ "assay": "Glucose", "mean": 5.2, "lo": 4.9, "hi": 5.5 }],
  "encoding": { "x": "assay", "y": "mean", "low": "lo", "high": "hi" },
  "a11y": { "alt": "Glucose is 5.2, from 4.9 to 5.5." }
}`,
  },
  waterfall: {
    title: "Waterfall",
    summary: "Deltas float from a running total. A flagged row is an absolute total.",
    fields: [
      "type is waterfall.",
      "encoding.x is the step. encoding.y is the delta.",
      "mark.total names a field. A true value on that row draws an absolute total from zero.",
      "waterfall-chart repairs to waterfall.",
    ],
    example: `{
  "version": "1",
  "type": "waterfall",
  "data": [
    { "step": "Open", "amount": 120, "total": true },
    { "step": "Won", "amount": 40 },
    { "step": "Close", "amount": 160, "total": true }
  ],
  "encoding": { "x": "step", "y": "amount" },
  "a11y": { "alt": "The close is 160." }
}`,
  },
  gauge: {
    title: "Gauge",
    summary: "A semicircular metric on the shared metric object.",
    fields: [
      "type is gauge.",
      "metric.value, metric.min, and metric.max set the arc. metric.target and metric.bands are optional.",
      "Top-level value, min, and max repair into metric.",
    ],
    example: `{
  "version": "1",
  "type": "gauge",
  "metric": { "label": "Capacity", "value": 64, "min": 0, "max": 100 },
  "a11y": { "alt": "Capacity is 64 out of 100." }
}`,
  },
  "calendar-heatmap": {
    title: "Calendar heatmap",
    summary: "A date-by-weekday heatmap. It is type heatmap, not a separate type name.",
    fields: [
      "type is heatmap.",
      "encoding.x is the date. encoding.color is the measure.",
      "mark.layout calendar selects the weekday grid. It is also the fallback when encoding.y is omitted.",
      "calendar-heatmap repairs to heatmap and sets mark.layout to calendar.",
    ],
    example: `{
  "version": "1",
  "type": "heatmap",
  "data": [
    { "day": "2026-01-05", "level": 1 },
    { "day": "2026-01-06", "level": 4 },
    { "day": "2026-01-12", "level": 2 }
  ],
  "encoding": { "x": "day", "color": "level" },
  "mark": { "layout": "calendar" },
  "a11y": { "alt": "The sixth of January is the busiest day." }
}`,
  },
  gantt: {
    title: "Gantt",
    summary: "Tasks as horizontal bars on a time axis. Sections group the rows. A zero-length task is a diamond.",
    fields: [
      "type is gantt.",
      "task is encoding.x. section is encoding.y. start is encoding.open. end is encoding.close.",
      "duration is a day count when end is omitted. 5d and 2w are accepted.",
      "status is done, active, or crit, drawn with the positive, accent, and negative tokens.",
      "id is encoding.source. depends is encoding.target, a comma-separated list of ids. Connectors are elbows.",
      "milestone: true, duration 0, or a start that equals the end draws a diamond.",
      "progress is 0 to 1 (or 0 to 100) and fills the bar. A today date on any row draws the marker.",
      "Checks live in validatePhase4: CK1401 missing start, CK1402 missing end, CK1403 end before start, CK1404 unknown dependency, CK1411 duplicate id.",
    ],
    example: specExample("launch-gantt"),
  },
  timeline: {
    title: "Timeline",
    summary: "Events along a date axis. Periods are spans. Labels move above or below so they do not collide.",
    fields: [
      "type is timeline.",
      "label is encoding.x. An event uses date, or start.",
      "kind period (or era) uses start and end and draws a span. Overlapping periods stack.",
      "The chart shares its UTC date parser with gantt.",
      "CK1405 is a missing date, or a period whose end is before its start.",
    ],
    example: specExample("company-timeline"),
  },
  quadrant: {
    title: "Quadrant",
    summary: "A square split into four tinted regions, with axis-end labels and named points.",
    fields: [
      "type is quadrant. x and y are numbers. The domain defaults to 0..1. Set encoding.x.scale.domain and encoding.y.scale.domain to change it.",
      "encoding.x.title and encoding.y.title are the low and high end labels, split by |.",
      "quadrants is four strings: top-left, top-right, bottom-left, bottom-right. subtitle is the subtitle.",
      "size sets the point radius. color accepts positive, negative, accent, or muted, or falls back to the series palette.",
      "CK1406 is a missing coordinate or a point outside the domain. The patch clamps it. CK1412 moves a |-split subtitle into quadrants, or repairs a bad quadrants array.",
    ],
    example: specExample("priority-quadrant"),
  },
  venn: {
    title: "Venn",
    summary: "Two sets are area-proportional. Three sets are a best-effort layout, and the areas are approximate.",
    fields: [
      "type is venn. set is encoding.x and size is encoding.y.",
      "One name is a set. Names joined by + are an intersection, for example Search+Filters.",
      "The overlap of two circles is solved so its area matches the intersection size.",
      "Three circles are placed from the pairwise overlaps. The chart captions that those areas are approximate.",
      "Four or more sets draw an error and CK1407 removes the extra set. CK1408 clamps an intersection that is larger than a member set.",
    ],
    example: specExample("feature-venn"),
  },
  journey: {
    title: "Journey",
    summary: "A user journey: sections, steps, a 1–5 face on a score scale, and actor chips.",
    fields: [
      "type is journey. step is encoding.x. score is encoding.y, from 1 to 5. section is encoding.series. actors is encoding.color, comma-separated.",
      "1 and 2 use the negative token, 3 uses muted, and 4 and 5 use positive.",
      "Each actor is a legend chip. The same chips repeat on the step.",
      "CK1409 clamps a score outside 1..5, or fills a missing score with the neutral 3. CK1410 fills a missing section. user-journey repairs to journey (CK1400).",
    ],
    example: specExample("checkout-journey"),
  },
  "radial-bar": {
    title: "Radial bar",
    summary: "Categories around a circle. Bar length is the radius. Several series sit side by side unless they stack.",
    fields: [
      "type is radial-bar. It loads from @chartkitdev/core/charts/radial-bar, and from extra. createRenderer([line]) does not include it.",
      "encoding.x is the category. encoding.y is one field or a list. encoding.series splits one y field into series.",
      "The default is grouped. mark.stack stack or percent runs outward from the hole.",
      "mark.innerRadius defaults to 0.34. mark.padAngle defaults to 2. mark.cornerRadius defaults to 3. mark.startAngle is degrees clockwise from the top.",
      "layout.coordinate polar is the frame. cartesian on this type is CK3078.",
      "radialBar, radial-bars, polar-bar, and polar repair to radial-bar. Rose is the equal-angle type.",
      "A negative radius is CK3073. Fewer than three categories warns CK3074. A hole above 0.85 is CK3075. A gap above 8 degrees is CK3076. More than 16 categories warns CK3079. A radius domain that excludes zero is CK3080.",
    ],
    example: `{
  "version": "1",
  "type": "radial-bar",
  "data": [
    { "desk": "Music", "weeknight": 186, "saturday": 210 },
    { "desk": "Talk", "weeknight": 74, "saturday": 48 },
    { "desk": "News", "weeknight": 36, "saturday": 22 }
  ],
  "encoding": { "x": "desk", "y": ["weeknight", "saturday"] },
  "mark": { "innerRadius": 0.34, "padAngle": 2 },
  "layout": { "coordinate": "polar" },
  "a11y": { "alt": "Saturday music runs longer, and talk shrinks." }
}`,
  },
  rose: {
    title: "Rose",
    summary: "Equal angles. The radius is the value. This is the polar-area and nightingale chart.",
    fields: [
      "type is rose. It loads from @chartkitdev/core/charts/rose, and from extra. createRenderer([line]) does not include it.",
      "encoding.x is the category. encoding.y is the radius. Angles stay equal.",
      "mark.innerRadius defaults to 0. mark.padAngle defaults to 1.2. mark.labels prints the value when the sector is tall enough.",
      "layout.coordinate polar is the frame.",
      "polarArea, polar-area, nightingale, rose-chart, and rosechart repair to rose.",
      "layout.coordinate polar on a pie or donut repairs the type to rose. On a bar it repairs to radial-bar. On any other type the coordinate is removed (CK3077).",
    ],
    example: `{
  "version": "1",
  "type": "rose",
  "data": [
    { "place": "Hale", "listeners": 4200 },
    { "place": "Quay", "listeners": 5600 },
    { "place": "Orchard", "listeners": 3900 }
  ],
  "encoding": { "x": "place", "y": "listeners" },
  "mark": { "padAngle": 1.2, "labels": true },
  "layout": { "coordinate": "polar" },
  "a11y": { "alt": "Quay is the largest share of the evening audience." }
}`,
  },
};

function specExample(slug: string): string {
  const example = examples.find((item) => item.slug === slug);
  return JSON.stringify(example?.spec ?? {}, null, 2);
}
