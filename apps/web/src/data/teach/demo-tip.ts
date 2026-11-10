/**
 * Which hover card the docs demo attaches.
 * Geo reads `data-ck-tooltip` on the SVG.
 * Cartesian types, including area-range, use `@chartkitdev/core/interact`.
 * The other extra charts use the mark tooltip in `@chartkitdev/core/extra-tip`.
 * Waterfall is in both sets; the interact card wins.
 */

const INTERACT = new Set([
  "line",
  "bar",
  "stacked-area",
  "scatter",
  "combo",
  "donut",
  "pie",
  "waterfall",
  "sunburst",
  "area-range",
  "bar-range",
  "errorbar",
  "sparkline",
  "mini-area",
  "spike",
  "candlestick",
  "heatmap",
  "bar-list",
]);

/** Keep this aligned with the EXTRA set in packages/core/src/extra-tip.ts. */
const EXTRA_MARK = new Set([
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "gantt",
  "timeline",
  "quadrant",
  "venn",
  "journey",
  "radial-bar",
  "rose",
  "strip",
  "streamgraph",
  "density",
  "tree",
]);

export type DemoTip = "geo" | "extra" | "interact";

export function demoTip(type: string): DemoTip {
  if (type === "choropleth" || type === "map-points") return "geo";
  if (EXTRA_MARK.has(type) && !INTERACT.has(type)) return "extra";
  return "interact";
}
