/** Specs for the ChartKit chart-type paint matrix. One native encoding per type. */

const SIZE = { width: 640, height: 360 };

function spec(type, alt, extra) {
  return {
    version: "1",
    type,
    size: SIZE,
    locale: "en-US",
    a11y: { alt },
    ...extra,
  };
}

const ALT = {
  line: "Indexed line of one series.",
  "stacked-area": "Four series stacked across the index.",
  bar: "One bar per category.",
  pie: "Slices of one whole.",
  donut: "Slices of one whole, with a hole.",
  scatter: "One point per row on x and y.",
  combo: "Bars and a line on a shared category axis.",
  heatmap: "A grid colored by value.",
  gauge: "A single capacity reading.",
  kpi: "A single revenue figure with a fixed sparkline.",
  sparkline: "A line with no axes.",
  "mini-area": "A filled trend with no axes.",
  "progress-ring": "A single share of a maximum.",
  spike: "Thin marks across the index.",
  candlestick: "Open, high, low, close, and volume.",
  histogram: "One quantitative field split into bins.",
  boxplot: "Eight groups, each with its own observations.",
  radar: "Three series around shared spokes.",
  funnel: "Stages in order.",
  treemap: "Tiles sized by value and colored by group.",
  sankey: "Flows from one layer to the next.",
  bullet: "Each row is a value against a target and ranges.",
  waterfall: "Signed steps between an opening total and a closing total.",
  "area-range": "A band between a low and a high around a centre line.",
  "bar-range": "Floating bars from a low to a high.",
  errorbar: "A point with a low and a high whisker.",
  gantt: "Tasks on a date axis.",
  timeline: "Events and periods on a date axis.",
  quadrant: "Points on a square of four regions.",
  venn: "Three sets and their overlaps.",
  journey: "Steps with a score from 1 to 5.",
  "radial-bar": "Categories around a circle.",
  rose: "Equal angles, radius from the value.",
  sunburst: "Two rings, leaves under six branches.",
  "bar-list": "Ranked rows.",
};

export function chartSpec(chart, payload) {
  const alt = ALT[chart] ?? `${chart} benchmark.`;
  const data = payload.data;
  switch (chart) {
    case "line":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y" },
        mark: { curve: "linear", points: "none", sampling: "auto" },
      });
    case "stacked-area":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: ["a", "b", "c", "d"] },
        mark: { curve: "linear", sampling: "auto" },
      });
    case "spike":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y" },
        mark: { sampling: "auto" },
      });
    case "scatter":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y" },
      });
    case "sparkline":
    case "mini-area":
      return spec(chart, alt, {
        data,
        mark: { sampling: "auto" },
      });
    case "area-range":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y", low: "lo", high: "hi" },
      });
    case "histogram":
      return spec(chart, alt, {
        data,
        encoding: { x: "value" },
        mark: { bins: 32 },
      });
    case "boxplot":
      return spec(chart, alt, {
        data,
        encoding: { x: "group", y: "value" },
      });
    case "candlestick":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", open: "open", high: "high", low: "low", close: "close", volume: "volume" },
      });
    case "bar":
    case "pie":
    case "donut":
    case "funnel":
    case "radial-bar":
    case "rose":
    case "bar-list":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y" },
      });
    case "combo":
      return spec(chart, alt, {
        data,
        encoding: {
          x: "x",
          y: [
            { field: "revenue", mark: "bar" },
            { field: "margin", mark: "line", axis: "y2" },
          ],
        },
        axes: { y2: { title: "Margin" } },
      });
    case "heatmap":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y", color: "v" },
        mark: { layout: "grid" },
      });
    case "gauge":
    case "progress-ring":
      return spec(chart, alt, { metric: payload.metric });
    case "kpi":
      return spec(chart, alt, { metric: payload.metric, data });
    case "radar":
      return spec(chart, alt, {
        data,
        encoding: { x: "spoke", y: ["a", "b", "c"] },
      });
    case "treemap":
      return spec(chart, alt, {
        data,
        encoding: { x: "name", y: "size", color: "group" },
      });
    case "sankey":
      return spec(chart, alt, {
        data,
        encoding: { source: "from", target: "to", y: "flow" },
      });
    case "bullet":
      return spec(chart, alt, {
        data,
        encoding: { x: "name", y: "value", target: "target" },
        mark: { ranges: ["poor", "ok", "good"] },
      });
    case "waterfall":
      return spec(chart, alt, {
        data,
        encoding: { x: "step", y: "amount" },
        mark: { total: "total" },
      });
    case "bar-range":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", low: "low", high: "high" },
      });
    case "errorbar":
      return spec(chart, alt, {
        data,
        encoding: { x: "x", y: "y", low: "lo", high: "hi" },
      });
    case "gantt":
      return spec(chart, alt, {
        data,
        encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
      });
    case "timeline":
      return spec(chart, alt, {
        data,
        encoding: { x: "label", open: "start", close: "end", color: "kind" },
      });
    case "quadrant":
      return spec(chart, alt, {
        data,
        quadrants: payload.quadrants,
        encoding: {
          x: { field: "x", title: "Low effort|High effort", scale: { domain: [0, 1] } },
          y: { field: "y", title: "Low impact|High impact", scale: { domain: [0, 1] } },
        },
      });
    case "venn":
      return spec(chart, alt, {
        data,
        encoding: { x: "set", y: "size" },
      });
    case "journey":
      return spec(chart, alt, {
        data,
        encoding: { x: "step", y: "score", series: "section" },
      });
    case "sunburst":
      return spec(chart, alt, { data });
    default:
      throw new Error(`unsupported: no spec for ${chart}`);
  }
}
