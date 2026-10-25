export type ChartType = {
  type: string;
  title: string;
  summary: string;
};

/**
 * Type ids match `docs/lib/specs.ts` so migrated URLs can stay `/docs/charts/<type>`.
 * Summaries are one line. The notes and live examples stay on the Next.js site.
 */
export const chartTypes: ChartType[] = [
  { type: "line", title: "Line", summary: "A trend across ordered categories." },
  { type: "bar", title: "Bar", summary: "A comparison across categories." },
  { type: "pie", title: "Pie", summary: "Parts of a whole, with no hole." },
  { type: "donut", title: "Donut", summary: "Parts of a whole. The center shows the total." },
  { type: "stacked-area", title: "Stacked area", summary: "Several series stacked into one shape." },
  { type: "scatter", title: "Scatter", summary: "Two quantitative fields, with an optional size for bubbles." },
  { type: "combo", title: "Combo", summary: "Bars and a line in one spec." },
  { type: "heatmap", title: "Heatmap", summary: "A grid, or a calendar when the x values are dates." },
  { type: "gauge", title: "Gauge", summary: "A semicircular meter. The number lives in metric." },
  { type: "kpi", title: "KPI", summary: "A label, a value, a delta, and an optional sparkline." },
  { type: "sparkline", title: "Sparkline", summary: "A small line with no axes." },
  { type: "mini-area", title: "Mini area", summary: "A small filled trend." },
  { type: "progress-ring", title: "Progress ring", summary: "A circular share of a maximum." },
  { type: "spike", title: "Spike", summary: "Thin marks for bursts over time." },
  { type: "candlestick", title: "Candlestick", summary: "Open, high, low, and close." },
  { type: "histogram", title: "Histogram", summary: "One quantitative field, split into bins." },
  { type: "boxplot", title: "Box plot", summary: "Quartiles, whiskers, a median, and outliers." },
  { type: "radar", title: "Radar", summary: "One polygon per series around shared spokes." },
  { type: "funnel", title: "Funnel", summary: "Stages in order, width from the value." },
  { type: "treemap", title: "Treemap", summary: "Area tiles for a whole." },
  { type: "sankey", title: "Sankey", summary: "Flow from a source to a target." },
  { type: "bullet", title: "Bullet", summary: "A value against a target and ranges." },
  { type: "waterfall", title: "Waterfall", summary: "Signed steps between totals." },
  { type: "area-range", title: "Range area", summary: "A band between a low and a high." },
  { type: "bar-range", title: "Range bar", summary: "A floating bar from low to high." },
  { type: "errorbar", title: "Error bar", summary: "Whiskers on a point or a bar." },
  { type: "gantt", title: "Gantt", summary: "Tasks on a time axis." },
  { type: "timeline", title: "Timeline", summary: "Events on a date axis." },
  { type: "quadrant", title: "Quadrant", summary: "Points on a square of four regions." },
  { type: "venn", title: "Venn", summary: "Two or three sets." },
  { type: "journey", title: "Journey", summary: "Steps with a score and actors." },
  { type: "radial-bar", title: "Radial bar", summary: "Categories around a circle. Length is the radius." },
  { type: "rose", title: "Rose", summary: "Equal angles. The radius is the value." },
  { type: "sunburst", title: "Sunburst", summary: "Concentric rings for a hierarchy. Colour follows the top branch." },
  { type: "bar-list", title: "Bar list", summary: "Ranked rows. A track behind the label, the value on the right." },
];

export function chartByType(type: string): ChartType | undefined {
  return chartTypes.find((chart) => chart.type === type);
}
