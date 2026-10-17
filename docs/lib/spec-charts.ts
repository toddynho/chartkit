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
      "mark.bins is the bin count (default 8, max 60). It is ignored when y is set.",
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
    summary: "A box per category spanning the quartiles, plus outliers outside 1.5 IQR.",
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
      "encoding.x is the spoke label. At least three rows are required.",
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
    summary: "Tiles sized by a measure. An optional group shares a series color.",
    fields: [
      "type is treemap.",
      "encoding.x is the tile label. encoding.y is the size. Non-positive sizes are skipped.",
      "encoding.color is an optional group. Tiles in a group share a series color and sit side by side.",
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
    summary: "Flows between nodes. Link thickness follows the value.",
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
};
