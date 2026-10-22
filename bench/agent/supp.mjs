/**
 * Supplementary suite, tracked apart from the 42-task set in tasks.mjs.
 * Plain asks: the prompt does not name the spec keys. A model run selects it with BENCH_SUITE=supp.
 * checkSupp scores these with the full renderer, and geo warnings fail a map.
 */

function field(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.field === "string") return value.field;
  return undefined;
}

function ok() {
  return { ok: true };
}

function miss(reason) {
  return { ok: false, reason };
}

const MERMAID = [
  "xychart-beta",
  'title "Monthly orders"',
  "x-axis [Jan, Feb, Mar, Apr]",
  'y-axis "Orders" 0 --> 500',
  "bar [210, 340, 295, 420]",
].join("\n");

function task(id, type, prompt, data, expect, pass) {
  return { id, type, prompt, data, expect: { type, feature: id, ...expect }, pass };
}

export const suppTasks = [
  task(
    "canvas-sensor",
    "line",
    "Line chart of a vibration sensor trace. The real trace is about 500,000 samples, so it has to stay fast; these rows show the shape of the data.",
    [
      { t: 0, g: 0.2 },
      { t: 1, g: 1.4 },
      { t: 2, g: 0.8 },
      { t: 3, g: 0.3 },
    ],
    { x: "t", y: "g", values: [0.2, 1.4, 0.8, 0.3] },
    (spec) => {
      const sampling = spec?.mark?.sampling;
      if (spec?.render === "canvas" || spec?.render === "auto" || sampling === "lttb" || sampling === "minmax") return ok();
      return miss("render canvas/auto or mark.sampling lttb/minmax");
    },
  ),
  task(
    "nav-pageviews",
    "line",
    "Line chart of daily page views. Put a small overview strip with a draggable range under it so readers can zoom into a few days.",
    [
      { date: "Mar 1", views: 120 },
      { date: "Mar 2", views: 132 },
      { date: "Mar 3", views: 128 },
      { date: "Mar 4", views: 160 },
      { date: "Mar 5", views: 154 },
      { date: "Mar 6", views: 171 },
      { date: "Mar 7", views: 166 },
      { date: "Mar 8", views: 180 },
    ],
    { x: "date", y: "views", values: [120, 132, 128, 160, 154, 171, 166, 180] },
    (spec) => {
      const nav = spec?.interaction?.navigator;
      if (nav === true || (nav && typeof nav === "object")) return ok();
      return miss("interaction.navigator");
    },
  ),
  task(
    "sync-cpu",
    "line",
    "Line chart of CPU percent per minute. It sits above a memory chart on the same dashboard, and hovering or zooming one should move the other. The dashboard group is called host-a.",
    [
      { minute: "00:00", cpu: 22 },
      { minute: "00:01", cpu: 41 },
      { minute: "00:02", cpu: 37 },
    ],
    { x: "minute", y: "cpu", values: [22, 41, 37] },
    (spec) => (spec?.interaction?.sync === "host-a" ? ok() : miss("interaction.sync host-a")),
  ),
  task(
    "drill-region",
    "bar",
    "Bar chart of sales by region. Clicking a region should open a bar chart of that region's stores.",
    {
      regions: [
        { region: "North", sales: 90 },
        { region: "South", sales: 60 },
      ],
      stores: [
        { region: "North", store: "N1", sales: 50 },
        { region: "North", store: "N2", sales: 40 },
        { region: "South", store: "S1", sales: 35 },
        { region: "South", store: "S2", sales: 25 },
      ],
    },
    { values: [90, 60, 50, 40, 35, 25] },
    (spec) => {
      const children = spec?.interaction?.drilldown?.children;
      if (!children || typeof children !== "object" || Array.isArray(children)) return miss("interaction.drilldown.children keyed North and South");
      if (!children.North?.type || !children.South?.type) return miss("interaction.drilldown.children keyed North and South");
      return ok();
    },
  ),
  task(
    "facet-temp",
    "line",
    "Small multiples of monthly average temperature: one line chart per city, two columns, every panel on the same y scale.",
    [
      { city: "Oslo", month: "Jan", celsius: -3 },
      { city: "Oslo", month: "Feb", celsius: -2 },
      { city: "Oslo", month: "Mar", celsius: 2 },
      { city: "Lisbon", month: "Jan", celsius: 11 },
      { city: "Lisbon", month: "Feb", celsius: 12 },
      { city: "Lisbon", month: "Mar", celsius: 14 },
      { city: "Cairo", month: "Jan", celsius: 14 },
      { city: "Cairo", month: "Feb", celsius: 16 },
      { city: "Cairo", month: "Mar", celsius: 19 },
      { city: "Denver", month: "Jan", celsius: -1 },
      { city: "Denver", month: "Feb", celsius: 1 },
      { city: "Denver", month: "Mar", celsius: 6 },
    ],
    { x: "month", y: "celsius", values: [-3, -2, 2, 11, 12, 14, 16, 19, -1, 1, 6] },
    (spec) => {
      const facet = spec?.layout?.facet;
      if (facet?.field === "city" && facet.columns === 2 && facet.scales !== "independent") return ok();
      return miss("layout.facet field city, columns 2, scales not independent");
    },
  ),
  task(
    "concat-dash",
    "bar",
    "One graphic with two charts stacked vertically: signups by month as bars on top, and plan share as a donut underneath.",
    {
      signups: [
        { month: "Jan", signups: 120 },
        { month: "Feb", signups: 180 },
      ],
      plans: [
        { plan: "Free", share: 70 },
        { plan: "Pro", share: 30 },
      ],
    },
    { values: [120, 180, 70, 30], typeFree: true },
    (spec) => {
      const concat = spec?.layout?.concat;
      const views = Array.isArray(concat?.views) ? concat.views : [];
      const types = views.map((view) => view?.type);
      if (types.includes("bar") && types.includes("donut") && concat?.direction !== "horizontal") return ok();
      return miss("layout.concat views include bar and donut, direction not horizontal");
    },
  ),
  task(
    "rtl-visitors",
    "bar",
    "Bar chart of visitors by city for an Arabic-language page, so the chart should read right to left.",
    [
      { city: "Cairo", visitors: 40 },
      { city: "Riyadh", visitors: 55 },
      { city: "Amman", visitors: 28 },
    ],
    { x: "city", y: "visitors", values: [40, 55, 28] },
    (spec) => (spec?.layout?.direction === "rtl" ? ok() : miss("layout.direction rtl")),
  ),
  task(
    "bp-legend",
    "stacked-area",
    "Stacked area of weekly traffic by channel. On phones, under 480 pixels wide, hide the legend.",
    [
      { week: "W1", channel: "Search", visits: 80 },
      { week: "W1", channel: "Social", visits: 30 },
      { week: "W2", channel: "Search", visits: 90 },
      { week: "W2", channel: "Social", visits: 36 },
    ],
    { x: "week", y: "visits", values: [80, 30, 90, 36] },
    (spec) => {
      const rules = spec?.layout?.breakpoints;
      const hit = Array.isArray(rules) && rules.some((rule) => rule && rule.legend === false && (rule.maxWidth === 479 || rule.maxWidth === 480));
      return hit ? ok() : miss("layout.breakpoints legend false and maxWidth 479 or 480");
    },
  ),
  task(
    "geo-renewables",
    "choropleth",
    "World map shaded by the share of electricity from renewables in each country.",
    [
      { country: "Norway", share: 98 },
      { country: "France", share: 25 },
    ],
    { region: "country", color: "share", values: [98, 25], aliases: ["choropleth", "choropleth-map", "heat map of countries"] },
    (spec) => {
      const aliases = new Set(["choropleth", "choropleth-map", "heat map of countries"]);
      if (!aliases.has(spec?.type)) return miss("type choropleth");
      if (field(spec?.encoding?.region) !== "country" || field(spec?.encoding?.color) !== "share") return miss("region country and color share");
      return ok();
    },
  ),
  task(
    "geo-cities",
    "map-points",
    "Map of the United States with a bubble for each city sized by population.",
    [
      { city: "Chicago", lat: 41.88, lon: -87.63, pop: 2700000 },
      { city: "Houston", lat: 29.76, lon: -95.37, pop: 2300000 },
    ],
    { latitude: "lat", longitude: "lon", values: [41.88, -87.63, 2700000, 29.76, -95.37, 2300000], aliases: ["map-points", "bubble-map", "bubble map", "map"] },
    (spec) => {
      const aliases = new Set(["map-points", "bubble-map", "bubble map", "map"]);
      const atlas = spec?.mark?.atlas ?? spec?.atlas;
      if (aliases.has(spec?.type) && atlas === "us") return ok();
      return miss("type map-points with atlas us");
    },
  ),
  task(
    "mermaid-xy",
    "bar",
    "We have this chart in a Mermaid doc. Make the same chart as a ChartKit spec.",
    MERMAID,
    { values: [210, 340, 295, 420] },
    (spec) => (spec?.type === "bar" ? ok() : miss("type bar")),
  ),
  task(
    "waterfall-cash",
    "waterfall",
    "Waterfall chart showing how cash went from the opening balance to the closing balance this quarter.",
    [
      { step: "Opening", amount: 500 },
      { step: "Sales", amount: 320 },
      { step: "Payroll", amount: -210 },
      { step: "Rent", amount: -60 },
      { step: "Closing", amount: 550 },
    ],
    { x: "step", y: "amount", values: [500, 320, -210, -60, 550] },
    (spec) => (spec?.type === "waterfall" ? ok() : miss("type waterfall")),
  ),
  task(
    "sankey-funnel",
    "sankey",
    "Sankey diagram of visitors flowing from traffic source to landing page.",
    [
      { source: "Search", target: "Pricing", visitors: 300 },
      { source: "Search", target: "Blog", visitors: 200 },
      { source: "Social", target: "Blog", visitors: 150 },
      { source: "Social", target: "Pricing", visitors: 50 },
    ],
    { source: "source", target: "target", y: "visitors", values: [300, 200, 150, 50] },
    (spec) => (spec?.type === "sankey" ? ok() : miss("type sankey")),
  ),
  task(
    "box-latency",
    "boxplot",
    "Box plot of response times in ms by server.",
    [
      { server: "a", ms: 12 },
      { server: "a", ms: 18 },
      { server: "a", ms: 15 },
      { server: "a", ms: 40 },
      { server: "b", ms: 20 },
      { server: "b", ms: 22 },
      { server: "b", ms: 19 },
      { server: "b", ms: 25 },
    ],
    { x: "server", y: "ms", values: [12, 18, 15, 40, 20, 22, 19, 25] },
    (spec) => (spec?.type === "boxplot" ? ok() : miss("type boxplot")),
  ),
];
