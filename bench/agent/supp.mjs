/**
 * Supplementary suite, tracked apart from the 42-task set in tasks.mjs.
 * Stub prompts for the newer features. A model run selects it with BENCH_SUITE=supp.
 */

function task(id, type, prompt, data, expect) {
  return { id, type, prompt, data, expect: { type, ...expect } };
}

const line = (pairs, x, y) => pairs.map(([a, b]) => ({ [x]: a, [y]: b }));

export const suppTasks = [
  task(
    "canvas-sensor",
    "line",
    "Line chart of a temperature sensor. Draw it on canvas when the series is large.",
    line([["t1", 18], ["t2", 21], ["t3", 19]], "time", "celsius"),
    { x: "time", y: "celsius", values: [18, 21, 19], feature: "canvas" },
  ),
  task(
    "navigator-pageviews",
    "line",
    "Line chart of pageviews with an overview navigator under the chart.",
    line([["Mon", 120], ["Tue", 180], ["Wed", 150]], "day", "pageviews"),
    { x: "day", y: "pageviews", values: [120, 180, 150], feature: "navigator" },
  ),
  task(
    "synced-cpu",
    "line",
    "Line chart of CPU percent that stays in sync with other charts in the same group.",
    line([["t1", 20], ["t2", 55], ["t3", 40]], "time", "cpu"),
    { x: "time", y: "cpu", values: [20, 55, 40], feature: "sync" },
  ),
  task(
    "drilldown-region",
    "bar",
    "Bar chart of sales by region. Clicking a region drills into a child chart.",
    line([["North", 40], ["South", 55]], "region", "sales"),
    { x: "region", y: "sales", values: [40, 55], feature: "drilldown" },
  ),
  task(
    "facet-temperatures",
    "line",
    "Small multiples of temperature, one panel per city.",
    [
      { city: "Oslo", month: "Jan", celsius: -2 },
      { city: "Oslo", month: "Jul", celsius: 18 },
      { city: "Lisbon", month: "Jan", celsius: 12 },
      { city: "Lisbon", month: "Jul", celsius: 27 },
    ],
    { x: "month", y: "celsius", values: [-2, 18, 12, 27], feature: "facet" },
  ),
  task(
    "concat-dashboard",
    "line",
    "A dashboard of two charts, a line above a bar.",
    line([["Q1", 10], ["Q2", 14]], "quarter", "units"),
    { x: "quarter", y: "units", values: [10, 14], feature: "concat" },
  ),
  task(
    "breakpoint-legend",
    "bar",
    "Bar chart whose legend hides when the chart is narrow.",
    line([["A", 3], ["B", 5]], "lane", "count"),
    { x: "lane", y: "count", values: [3, 5], feature: "breakpoints" },
  ),
  task(
    "rtl",
    "bar",
    "Bar chart laid out right to left.",
    line([["East", 4], ["West", 7]], "side", "count"),
    { x: "side", y: "count", values: [4, 7], feature: "rtl" },
  ),
  task(
    "mermaid",
    "line",
    "Turn this Mermaid xychart into a ChartKit spec.",
    line([["Jan", 8], ["Feb", 12]], "month", "units"),
    { x: "month", y: "units", values: [8, 12], feature: "mermaid" },
  ),
  task(
    "waterfall",
    "waterfall",
    "Waterfall chart from an opening balance to a closing balance.",
    [
      { step: "Open", amount: 100, total: true },
      { step: "Won", amount: 40 },
      { step: "Close", amount: 140, total: true },
    ],
    { x: "step", y: "amount", values: [100, 40, 140], feature: "waterfall" },
  ),
  task(
    "boxplot",
    "boxplot",
    "Box plot of scores by group.",
    [
      { group: "A", score: 1 },
      { group: "A", score: 9 },
      { group: "B", score: 3 },
      { group: "B", score: 4 },
    ],
    { x: "group", y: "score", values: [1, 9, 3, 4], feature: "boxplot" },
  ),
  task(
    "world-renewables",
    "choropleth",
    "Choropleth of renewable electricity share by country.",
    [
      { country: "Norway", share: 98 },
      { country: "France", share: 25 },
    ],
    { region: "country", color: "share", values: [98, 25], feature: "choropleth" },
  ),
  task(
    "city-bubbles",
    "map-points",
    "Bubble map of city population.",
    [
      { city: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 },
      { city: "Lagos", lat: 6.5, lon: 3.4, pop: 16 },
    ],
    { latitude: "lat", longitude: "lon", values: [37, 16], feature: "map-points" },
  ),
  task(
    "sankey-funnel",
    "sankey",
    "Sankey of a signup funnel from visit to purchase.",
    [
      { source: "Visit", target: "Signup", count: 80 },
      { source: "Signup", target: "Purchase", count: 12 },
    ],
    { source: "source", target: "target", y: "count", values: [80, 12], feature: "sankey" },
  ),
];
