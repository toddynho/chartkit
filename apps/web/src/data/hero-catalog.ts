/**
 * Every chart type the library actually renders.
 * Schema enum is the core registry. Deferred types (planning charts and maps)
 * are the ones `packages/core/src/walker.ts` lists beside that enum.
 * Geo contributes choropleth and map-points only. Atlases are not types.
 */

export const HERO_TYPE_COUNT = 37;

const SIZE = { width: 520, height: 300 };

export type HeroGroupId = "basics" | "comparison" | "distribution" | "flow" | "time" | "geo" | "kpi";

export type HeroTypeMeta = {
  type: string;
  label: string;
  group: HeroGroupId;
  /** Curated pill id, when this type is already in the 18-type carousel. */
  slide?: string;
  title: string;
  subtitle: string;
};

export type HeroExtra = {
  motion: "bar" | "hbar" | "line" | "area" | "fade";
  spec: Record<string, unknown>;
};

export const heroGroups: { id: HeroGroupId; label: string; kicker: string; types: HeroTypeMeta[] }[] = [
  {
    id: "basics",
    label: "Basics",
    kicker: "Basics",
    types: [
      { type: "line", label: "Line", group: "basics", slide: "line", title: "Latency, p50 vs p95", subtitle: "Milliseconds, rolling 8 weeks" },
      { type: "bar", label: "Bar", group: "basics", slide: "bar", title: "Signups by month", subtitle: "Monthly, 2026" },
      { type: "pie", label: "Pie", group: "basics", slide: "pie", title: "Plan mix", subtitle: "Active accounts" },
      { type: "donut", label: "Donut", group: "basics", slide: "donut", title: "Traffic by source", subtitle: "Last 30 days" },
      { type: "scatter", label: "Scatter", group: "basics", slide: "scatter", title: "Seats vs. renewal rate", subtitle: "Accounts, Q3" },
      { type: "stacked-area", label: "Stacked", group: "basics", title: "Plan mix over time", subtitle: "Accounts, thousands" },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    kicker: "Compare",
    types: [
      { type: "combo", label: "Combo", group: "comparison", title: "Revenue and margin", subtitle: "USD and percent" },
      { type: "bullet", label: "Bullet", group: "comparison", title: "Targets", subtitle: "This quarter" },
      { type: "bar-list", label: "List", group: "comparison", title: "Top pages", subtitle: "Visits, last 7 days" },
      { type: "radial-bar", label: "Radial", group: "comparison", title: "Minutes by desk", subtitle: "Weeknight vs Saturday" },
      { type: "radar", label: "Radar", group: "comparison", slide: "radar", title: "Team skills", subtitle: "Self-assessed, 6 axes" },
      { type: "bar-range", label: "Range", group: "comparison", title: "Daily temperature", subtitle: "Low to high, °C" },
      { type: "quadrant", label: "Quad", group: "comparison", title: "Where the quarter goes", subtitle: "Effort against impact" },
    ],
  },
  {
    id: "distribution",
    label: "Distribution",
    kicker: "Distribution",
    types: [
      { type: "histogram", label: "Histogram", group: "distribution", slide: "histogram", title: "Response time distribution", subtitle: "Milliseconds, 14 bins" },
      { type: "boxplot", label: "Box", group: "distribution", title: "Days to close", subtitle: "By region" },
      { type: "heatmap", label: "Heatmap", group: "distribution", slide: "heatmap", title: "Support volume by hour", subtitle: "Tickets, weekdays" },
      { type: "errorbar", label: "Error", group: "distribution", title: "Lab measurements", subtitle: "Mean and range" },
      { type: "rose", label: "Rose", group: "distribution", title: "Saturday audience", subtitle: "Listeners by place" },
    ],
  },
  {
    id: "flow",
    label: "Flow & hierarchy",
    kicker: "Flow",
    types: [
      { type: "funnel", label: "Funnel", group: "flow", slide: "funnel", title: "Signup funnel", subtitle: "Last 30 days" },
      { type: "sankey", label: "Sankey", group: "flow", title: "Acquisition flow", subtitle: "Visits, last 30 days" },
      { type: "treemap", label: "Treemap", group: "flow", slide: "treemap", title: "Traffic by source", subtitle: "Share of sessions" },
      { type: "sunburst", label: "Sunburst", group: "flow", title: "Traffic by source", subtitle: "Organic and paid" },
      { type: "venn", label: "Venn", group: "flow", title: "What customers use together", subtitle: "Search, filters, saved views" },
    ],
  },
  {
    id: "time",
    label: "Time",
    kicker: "Time",
    types: [
      { type: "candlestick", label: "Candle", group: "time", slide: "candle", title: "CK / USD", subtitle: "Daily, 12 sessions" },
      { type: "sparkline", label: "Spark", group: "time", slide: "spark", title: "Service health", subtitle: "Four sparklines, one spec each" },
      { type: "mini-area", label: "Mini", group: "time", title: "Signups", subtitle: "Trailing six weeks" },
      { type: "spike", label: "Spike", group: "time", title: "Blocked requests", subtitle: "Five-minute buckets" },
      { type: "waterfall", label: "Waterfall", group: "time", slide: "waterfall", title: "ARR bridge", subtitle: "Q2 → Q3, USD millions" },
      { type: "area-range", label: "Band", group: "time", title: "Revenue forecast", subtitle: "Band opens in April" },
      { type: "gantt", label: "Gantt", group: "time", title: "Northstar launch", subtitle: "Plan, build, launch" },
      { type: "timeline", label: "Timeline", group: "time", title: "Northstar", subtitle: "2014 to 2026" },
      { type: "journey", label: "Journey", group: "time", title: "Checkout", subtitle: "Score by step" },
    ],
  },
  {
    id: "geo",
    label: "Geo",
    kicker: "Geo",
    types: [
      { type: "choropleth", label: "Choropleth", group: "geo", title: "Renewable share", subtitle: "Percent of electricity" },
      { type: "map-points", label: "Map", group: "geo", title: "Largest cities", subtitle: "Population, millions" },
    ],
  },
  {
    id: "kpi",
    label: "KPI",
    kicker: "KPI",
    types: [
      { type: "gauge", label: "Gauge", group: "kpi", slide: "gauge", title: "Quarterly target", subtitle: "Q3 progress" },
      { type: "kpi", label: "KPI", group: "kpi", title: "Revenue", subtitle: "Versus last month" },
      { type: "progress-ring", label: "Ring", group: "kpi", title: "Uptime", subtitle: "Last 30 days" },
    ],
  },
];

export const heroTypes: HeroTypeMeta[] = heroGroups.flatMap((group) => group.types);

if (heroTypes.length !== HERO_TYPE_COUNT) {
  throw new Error(`hero catalog has ${heroTypes.length} types, expected ${HERO_TYPE_COUNT}`);
}

const seen = new Set<string>();
for (const type of heroTypes) {
  if (seen.has(type.type)) throw new Error(`hero catalog repeats ${type.type}`);
  seen.add(type.type);
}

function spec(type: string, body: Record<string, unknown>, alt: string): Record<string, unknown> {
  return { version: "1", type, size: SIZE, legend: false, a11y: { alt }, ...body };
}

/** Specs that are not already painted by the curated 18. Fetched when picked. */
export const heroExtra: Record<string, HeroExtra> = {
  "stacked-area": {
    motion: "area",
    spec: spec("stacked-area", {
      title: "Plan mix over time",
      subtitle: "Accounts, thousands",
      data: [
        { month: "Jan", free: 40, pro: 22, team: 8 },
        { month: "Feb", free: 42, pro: 28, team: 11 },
        { month: "Mar", free: 45, pro: 36, team: 14 },
        { month: "Apr", free: 44, pro: 41, team: 18 },
        { month: "May", free: 46, pro: 48, team: 22 },
        { month: "Jun", free: 47, pro: 55, team: 27 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "free", title: "Free" },
          { field: "pro", title: "Pro" },
          { field: "team", title: "Team" },
        ],
      },
    }, "Free, Pro, and Team accounts all grow from January to June."),
  },
  combo: {
    motion: "bar",
    spec: spec("combo", {
      title: "Revenue and margin",
      subtitle: "USD and percent",
      data: [
        { month: "Jan", revenue: 100, margin: 0.2 },
        { month: "Feb", revenue: 140, margin: 0.24 },
        { month: "Mar", revenue: 130, margin: 0.22 },
        { month: "Apr", revenue: 168, margin: 0.27 },
        { month: "May", revenue: 190, margin: 0.29 },
        { month: "Jun", revenue: 210, margin: 0.31 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", mark: "bar" },
          { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
        ],
      },
      axes: { y2: { title: "Margin", format: "percent" } },
    }, "Revenue and margin both finish the half higher than they started."),
  },
  bullet: {
    motion: "hbar",
    spec: spec("bullet", {
      title: "Targets",
      subtitle: "This quarter",
      data: [
        { name: "Revenue", value: 275, target: 250, poor: 150, ok: 225, good: 300 },
        { name: "Profit", value: 22, target: 27, poor: 15, ok: 25, good: 40 },
        { name: "NPS", value: 46, target: 50, poor: 20, ok: 40, good: 70 },
      ],
      encoding: { x: "name", y: "value", target: "target" },
      mark: { ranges: ["poor", "ok", "good"] },
    }, "Revenue is past its target. Profit and NPS are still short."),
  },
  "bar-list": {
    motion: "hbar",
    spec: spec("bar-list", {
      title: "Top pages",
      subtitle: "Visits, last 7 days",
      data: [
        { page: "/pricing", visits: 1840 },
        { page: "/docs", visits: 1420 },
        { page: "/gallery", visits: 980 },
        { page: "/cloud", visits: 760 },
        { page: "/about", visits: 640 },
      ],
      encoding: { x: "page", y: { field: "visits", format: "compact" } },
    }, "Pricing leads the page list at 1,840 visits."),
  },
  "radial-bar": {
    motion: "fade",
    spec: spec("radial-bar", {
      title: "Minutes by desk",
      subtitle: "Weeknight vs Saturday",
      data: [
        { desk: "Music", weeknight: 186, saturday: 210 },
        { desk: "Talk", weeknight: 74, saturday: 48 },
        { desk: "News", weeknight: 36, saturday: 22 },
        { desk: "Sky", weeknight: 18, saturday: 16 },
        { desk: "Spots", weeknight: 28, saturday: 40 },
      ],
      encoding: {
        x: "desk",
        y: [
          { field: "weeknight", title: "Weeknight" },
          { field: "saturday", title: "Saturday" },
        ],
      },
    }, "Music is the longest desk on both weeknights and Saturday."),
  },
  "bar-range": {
    motion: "bar",
    spec: spec("bar-range", {
      title: "Daily temperature",
      subtitle: "Low to high, °C",
      data: [
        { month: "Jan", min: -2, max: 6 },
        { month: "Apr", min: 6, max: 17 },
        { month: "Jul", min: 17, max: 29 },
        { month: "Oct", min: 7, max: 18 },
      ],
      encoding: { x: "month", low: "min", high: "max" },
      axes: { y: { format: { style: "number", suffix: "°C" } } },
    }, "July is the warmest month, from 17 to 29."),
  },
  quadrant: {
    motion: "fade",
    spec: spec("quadrant", {
      title: "Where the quarter goes",
      subtitle: "Effort against impact",
      quadrants: ["Quick wins", "Big bets", "Fill-ins", "Thankless"],
      data: [
        { name: "SSO", x: 0.18, y: 0.84, size: 16 },
        { name: "Saved replies", x: 0.3, y: 0.68, size: 10 },
        { name: "Checkout", x: 0.8, y: 0.88, size: 18 },
        { name: "Search", x: 0.64, y: 0.72, size: 14 },
        { name: "Dark mode", x: 0.24, y: 0.28, size: 8 },
        { name: "PDF export", x: 0.84, y: 0.24, size: 12 },
      ],
      encoding: {
        x: { field: "x", title: "Low effort|High effort", scale: { domain: [0, 1] } },
        y: { field: "y", title: "Low impact|High impact", scale: { domain: [0, 1] } },
        size: "size",
      },
    }, "SSO is a quick win. Checkout is a big bet. PDF export is high effort and low impact."),
  },
  boxplot: {
    motion: "fade",
    spec: spec("boxplot", {
      title: "Days to close",
      subtitle: "By region",
      data: [
        ...[28, 31, 33, 36, 38, 40, 44, 52].map((days) => ({ region: "North", days })),
        ...[18, 21, 22, 24, 26, 29, 33, 41].map((days) => ({ region: "EU", days })),
        ...[22, 27, 30, 34, 37, 39, 46, 58].map((days) => ({ region: "APAC", days })),
      ],
      encoding: { x: "region", y: "days" },
    }, "EU closes fastest. APAC has the widest spread."),
  },
  errorbar: {
    motion: "fade",
    spec: spec("errorbar", {
      title: "Lab measurements",
      subtitle: "Mean and range",
      data: [
        { assay: "Control", mean: 18.2, lo: 17.1, hi: 19.3 },
        { assay: "Batch A", mean: 21.4, lo: 20.6, hi: 22.2 },
        { assay: "Batch B", mean: 16.7, lo: 15.3, hi: 18.1 },
        { assay: "Batch C", mean: 19.1, lo: 18.4, hi: 19.9 },
      ],
      encoding: { x: "assay", y: "mean", low: "lo", high: "hi" },
    }, "Batch A is highest, with a whisker from 20.6 to 22.2."),
  },
  rose: {
    motion: "fade",
    spec: spec("rose", {
      title: "Saturday audience",
      subtitle: "Listeners by place",
      data: [
        { place: "Hale", listeners: 4200 },
        { place: "Mill", listeners: 3100 },
        { place: "Quay", listeners: 5600 },
        { place: "Ridge", listeners: 1800 },
        { place: "Yard", listeners: 2400 },
        { place: "Orchard", listeners: 3900 },
      ],
      encoding: { x: "place", y: { field: "listeners", title: "Listeners" } },
      mark: { padAngle: 1.2 },
    }, "Quay is the largest share of the evening audience."),
  },
  sankey: {
    motion: "fade",
    spec: spec("sankey", {
      title: "Acquisition flow",
      subtitle: "Visits, last 30 days",
      data: [
        { from: "Ads", to: "Landing", flow: 40 },
        { from: "Ads", to: "Product", flow: 25 },
        { from: "Search", to: "Landing", flow: 30 },
        { from: "Search", to: "Blog", flow: 20 },
        { from: "Landing", to: "Trial", flow: 35 },
        { from: "Landing", to: "Paid", flow: 20 },
        { from: "Product", to: "Trial", flow: 18 },
        { from: "Blog", to: "Trial", flow: 8 },
      ],
      encoding: { source: "from", target: "to", y: "flow" },
    }, "Ads and search reach trial mostly through the landing page."),
  },
  sunburst: {
    motion: "fade",
    spec: spec("sunburst", {
      title: "Traffic by source",
      subtitle: "Organic and paid",
      data: [
        { name: "Organic", children: [{ name: "Search", value: 4200 }, { name: "Referral", value: 1800 }] },
        { name: "Paid", children: [{ name: "Search ads", value: 2600 }, { name: "Social", value: 900 }] },
        { name: "Direct", children: [{ name: "Typed", value: 1500 }, { name: "Bookmark", value: 700 }] },
      ],
    }, "Organic search is the largest share of traffic."),
  },
  venn: {
    motion: "fade",
    spec: spec("venn", {
      title: "What customers use together",
      subtitle: "Search, filters, saved views",
      data: [
        { set: "Search", size: 1280 },
        { set: "Filters", size: 860 },
        { set: "Saved views", size: 540 },
        { set: "Search+Filters", size: 410 },
        { set: "Search+Saved views", size: 220 },
        { set: "Filters+Saved views", size: 140 },
        { set: "Search+Filters+Saved views", size: 90 },
      ],
      encoding: { x: "set", y: "size" },
    }, "Search, filters, and saved views overlap. 90 customers use all three."),
  },
  "mini-area": {
    motion: "area",
    spec: spec("mini-area", {
      title: "Signups",
      subtitle: "Trailing six weeks",
      data: [40, 46, 44, 58, 63, 71],
    }, "Signups trend upward and end at their highest point."),
  },
  spike: {
    motion: "bar",
    spec: spec("spike", {
      title: "Blocked requests",
      subtitle: "Five-minute buckets",
      data: [
        { time: "00:00", count: 1 },
        { time: "00:05", count: 0 },
        { time: "00:10", count: 8 },
        { time: "00:15", count: 2 },
        { time: "00:20", count: 0 },
        { time: "00:25", count: 14 },
        { time: "00:30", count: 3 },
        { time: "00:35", count: 1 },
      ],
      encoding: { x: "time", y: "count" },
      mark: { baseline: 0 },
    }, "Blocked requests stayed low, then spiked to 14 at 00:25."),
  },
  "area-range": {
    motion: "area",
    spec: spec("area-range", {
      title: "Revenue forecast",
      subtitle: "Band opens in April",
      data: [
        { month: "Jan", revenue: 420, lo: null, hi: null },
        { month: "Feb", revenue: 390, lo: null, hi: null },
        { month: "Mar", revenue: 450, lo: null, hi: null },
        { month: "Apr", revenue: 510, lo: 470, hi: 560 },
        { month: "May", revenue: 540, lo: 480, hi: 610 },
        { month: "Jun", revenue: 580, lo: 500, hi: 670 },
      ],
      encoding: {
        x: "month",
        y: { field: "revenue", title: "Forecast" },
        low: "lo",
        high: "hi",
      },
    }, "Revenue is forecast from April, with a band that widens through June."),
  },
  gantt: {
    motion: "fade",
    spec: spec("gantt", {
      title: "Northstar launch",
      subtitle: "Plan, build, launch",
      data: [
        { id: "spec", task: "Write the spec", section: "Plan", start: "2026-03-02", end: "2026-03-13", progress: 1, status: "done" },
        { id: "design", task: "Design the UI", section: "Plan", start: "2026-03-09", end: "2026-03-20", progress: 0.8, status: "active", depends: "spec" },
        { id: "api", task: "Build the API", section: "Build", start: "2026-03-16", end: "2026-04-03", progress: 0.55, status: "active", depends: "spec" },
        { id: "web", task: "Build the web app", section: "Build", start: "2026-03-23", end: "2026-04-10", progress: 0.3, status: "crit", depends: "design" },
        { id: "beta", task: "Open the beta", section: "Launch", start: "2026-04-06", milestone: true, status: "crit", depends: "web" },
      ],
      encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
    }, "The web app is critical. Beta opens on 6 April."),
  },
  timeline: {
    motion: "fade",
    spec: spec("timeline", {
      title: "Northstar",
      subtitle: "2014 to 2026",
      data: [
        { label: "Founded", date: "2014-04-02", kind: "event" },
        { label: "First paid plan", date: "2015-11-01", kind: "event" },
        { label: "Series A", start: "2016-03-01", end: "2019-08-01", kind: "period" },
        { label: "Series B", date: "2021-06-01", kind: "event" },
        { label: "Platform", start: "2024-01-15", end: "2026-06-01", kind: "period" },
        { label: "ChartKit", date: "2026-02-02", kind: "event" },
      ],
      encoding: { x: "label", open: "start", close: "end", color: "kind" },
    }, "Northstar was founded in 2014 and opened the platform era in 2024."),
  },
  journey: {
    motion: "fade",
    spec: spec("journey", {
      title: "Checkout",
      subtitle: "Score by step",
      data: [
        { section: "Browse", step: "Land on the product", score: 5, actors: "Shopper" },
        { section: "Browse", step: "Compare two lamps", score: 4, actors: "Shopper" },
        { section: "Cart", step: "Add the lamp", score: 5, actors: "Shopper" },
        { section: "Pay", step: "Create an account", score: 2, actors: "Shopper" },
        { section: "Pay", step: "Fix a declined card", score: 1, actors: "Shopper, Support" },
        { section: "Done", step: "See the confirmation", score: 4, actors: "Shopper" },
      ],
      encoding: { x: "step", y: "score", series: "section", color: "actors" },
    }, "Checkout is smooth until payment. A declined card scores 1."),
  },
  choropleth: {
    motion: "fade",
    spec: spec("choropleth", {
      title: "Renewable share",
      subtitle: "Percent of electricity",
      theme: "soft",
      data: [
        { country: "Norway", share: 98 },
        { country: "France", share: 26 },
        { country: "United States", share: 23 },
        { country: "UK", share: 46 },
        { country: "Brazil", share: 89 },
        { country: "India", share: 22 },
        { country: "Japan", share: 24 },
        { country: "Kenya", share: 81 },
        { country: "Canada", share: 68 },
        { country: "Australia", share: 35 },
      ],
      encoding: { region: "country", color: "share" },
      mark: { atlas: "world", scale: "sequential" },
      legend: { position: "bottom" },
    }, "Norway and Brazil are darkest. France, the United States, India, and Japan are lighter."),
  },
  "map-points": {
    motion: "fade",
    spec: spec("map-points", {
      title: "Largest cities",
      subtitle: "Population, millions",
      theme: "soft",
      data: [
        { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 },
        { name: "Delhi", lat: 28.6, lon: 77.2, pop: 33 },
        { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29 },
        { name: "São Paulo", lat: -23.5, lon: -46.6, pop: 22 },
        { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16 },
        { name: "London", lat: 51.5, lon: -0.1, pop: 9 },
        { name: "New York", lat: 40.7, lon: -74.0, pop: 8 },
        { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5 },
      ],
      encoding: { lat: "lat", lon: "lon", label: "name", size: "pop" },
      mark: { atlas: "world" },
    }, "Tokyo is the largest marked city. Sydney is the smallest of the eight."),
  },
  kpi: {
    motion: "fade",
    spec: spec("kpi", {
      title: "Revenue",
      subtitle: "Versus last month",
      metric: { label: "Revenue", value: 125000, delta: 0.125, format: "compact" },
      data: [10, 12, 9, 14, 18, 17, 21],
    }, "Revenue is 125,000, up 12.5 percent versus the previous period."),
  },
  "progress-ring": {
    motion: "fade",
    spec: spec("progress-ring", {
      title: "Uptime",
      subtitle: "Last 30 days",
      metric: { label: "Uptime", value: 99.2, min: 0, max: 100, format: { style: "number", decimals: 1, suffix: "%" } },
    }, "Uptime is 99.2 percent."),
  },
};

for (const type of heroTypes) {
  if (type.slide) continue;
  if (!heroExtra[type.type]) throw new Error(`hero catalog is missing a spec for ${type.type}`);
}

for (const type of Object.keys(heroExtra)) {
  if (!heroTypes.some((item) => item.type === type && !item.slide)) {
    throw new Error(`hero extra spec ${type} is not an unloaded catalog type`);
  }
}
