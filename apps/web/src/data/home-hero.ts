import { isExtra } from "@chartkitdev/core/all";
import { paintSpec } from "../lib/chartkit";
import { chartIcon } from "./chart-icons";
import { applyHeroColor, heroPaints } from "./hero-accent";
import { heroTypes } from "./hero-catalog";

/**
 * Homepage hero carousel.
 * Each spec is validated and rendered at build time. The spec panel shows this
 * object (data truncated to two rows). The SVG is that same object without
 * `title` and `subtitle`, so the header row is the only title and the plot
 * fills the 300px frame.
 */
const SIZE = { width: 520, height: 300 };

export type HeroMotion = "bar" | "hbar" | "line" | "area" | "fade";

export type HeroChart = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  motion: HeroMotion;
  /** True when the client renderer loads the chart module on demand. */
  extra: boolean;
  icon: string;
  spec: Record<string, unknown>;
  drawn: Record<string, unknown>;
  preview: string;
  svg: string;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function icon(type: string): string {
  return chartIcon(type);
}

function highlight(json: string): string {
  return json
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="tok-key">$1</span>$2')
    .replaceAll(/: ("(?:\\.|[^"\\])*")/g, ': <span class="tok-str">$1</span>')
    .replaceAll(/: (-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>');
}

function preview(spec: Record<string, unknown>): string {
  const data = spec.data;
  const shown =
    Array.isArray(data) && data.length > 2 ? { ...spec, data: [...data.slice(0, 2), "…"] } : spec;
  const json = JSON.stringify(shown, null, 2).replaceAll('"…"', "…");
  return highlight(json);
}

function drawOf(spec: Record<string, unknown>): Record<string, unknown> {
  const drawn = { ...spec };
  delete drawn.title;
  delete drawn.subtitle;
  return drawn;
}

const heroPaint = heroPaints(heroTypes.map((type) => type.type));
const paintBySlide = new Map(
  heroTypes.flatMap((type) => (type.slide ? [[type.slide, heroPaint.get(type.type)] as const] : [])),
);

function chart(
  id: string,
  label: string,
  title: string,
  subtitle: string,
  motion: HeroMotion,
  iconType: string,
  body: Record<string, unknown>,
): HeroChart {
  const paint = paintBySlide.get(id);
  const spec = paint ? applyHeroColor(body, paint) : body;
  const type = String(spec.type ?? "");
  const drawn = drawOf(spec);
  for (const [name, part] of [
    ["spec", spec],
    ["render", drawn],
  ] as const) {
    const result = paintSpec(part);
    if (!result.ok || !result.svg.includes("<svg") || result.svg.includes("ck-chart-error")) {
      const detail = result.issues.map((issue) => `${issue.code} ${issue.path} ${issue.message}`).join("; ");
      throw new Error(`Homepage hero ${id} ${name} failed: ${result.footer} ${detail}`);
    }
  }
  const painted = paintSpec(drawn);
  return {
    id,
    label,
    title,
    subtitle,
    motion,
    extra: isExtra(type),
    icon: icon(iconType),
    spec,
    drawn,
    preview: preview(spec),
    svg: painted.svg,
  };
}

function heatRows(): Record<string, unknown>[] {
  const weights = [
    [0.2, 0.4, 0.7, 0.9, 0.8, 0.5, 0.3, 0.2],
    [0.1, 0.3, 0.6, 0.8, 0.9, 0.6, 0.3, 0.1],
    [0.2, 0.5, 0.8, 1, 0.9, 0.6, 0.4, 0.2],
    [0.1, 0.3, 0.5, 0.7, 0.8, 0.7, 0.4, 0.2],
    [0.1, 0.2, 0.4, 0.6, 0.5, 0.3, 0.2, 0.1],
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const rows: Record<string, unknown>[] = [];
  for (let day = 0; day < days.length; day++) {
    for (let hour = 0; hour < 8; hour++) {
      rows.push({
        day: days[day],
        hour: String(9 + hour),
        tickets: Math.round((weights[day]?.[hour] ?? 0) * 60),
      });
    }
  }
  return rows;
}

function histogramRows(): Record<string, unknown>[] {
  const weights = [6, 12, 22, 38, 55, 74, 92, 100, 88, 66, 44, 26, 13, 5];
  const rows: Record<string, unknown>[] = [{ ms: 12 }, { ms: 41 }];
  weights.forEach((count, bin) => {
    const n = Math.max(1, Math.round(count / 8));
    const center = bin * 10 + 5;
    for (let i = 0; i < n; i++) rows.push({ ms: Math.round(center + ((i % 5) - 2)) });
  });
  return rows;
}

const stackedPlans = [
  [30, 20, 12],
  [38, 24, 14],
  [34, 22, 10],
  [46, 28, 16],
  [42, 26, 14],
  [55, 30, 15],
  [52, 28, 18],
  [60, 32, 8],
];
const planNames = ["Free", "Pro", "Team"];

const grouped = [
  [40, 62],
  [55, 48],
  [48, 70],
  [70, 58],
  [62, 84],
  [88, 76],
];

const candles: Array<[string, number, number, number, number]> = [
  ["Mon", 30, 55, 20, 65],
  ["Tue", 55, 48, 40, 70],
  ["Wed", 48, 62, 44, 68],
  ["Thu", 62, 58, 50, 75],
  ["Fri", 58, 72, 52, 78],
  ["Sat", 72, 66, 60, 80],
  ["Sun", 66, 80, 62, 86],
  ["Mon 2", 80, 74, 70, 90],
  ["Tue 2", 74, 70, 64, 82],
  ["Wed 2", 70, 84, 66, 90],
  ["Thu 2", 84, 78, 72, 92],
  ["Fri 2", 78, 88, 74, 94],
];

const spark = [30, 42, 38, 55, 50, 68, 62, 80, 76, 92];

export const heroCharts: HeroChart[] = [
  chart("bar", "Bar", "Signups by month", "Monthly, 2026", "bar", "bar", {
    version: "1",
    type: "bar",
    title: "Signups by month",
    subtitle: "Monthly, 2026",
    data: [72, 98, 87, 129, 116, 159, 150, 189].map((signups, i) => ({ month: months[i], signups })),
    encoding: { x: "month", y: "signups" },
    mark: { cornerRadius: 3 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Signups rise from 72 in January to 189 in August." },
  }),
  chart("line", "Line", "Latency, p50 vs p95", "Milliseconds, rolling 8 weeks", "line", "line", {
    version: "1",
    type: "line",
    title: "Latency, p50 vs p95",
    subtitle: "Milliseconds, rolling 8 weeks",
    data: [40, 44, 38, 50, 46, 55, 52, 60].map((p50, i) => ({
      week: i + 1,
      p50,
      p95: [62, 70, 66, 80, 74, 88, 82, 92][i],
    })),
    encoding: { x: "week", y: ["p50", "p95"] },
    mark: { points: "none" },
    legend: false,
    size: SIZE,
    a11y: { alt: "p50 stays near 50 milliseconds while p95 climbs from 62 to 92." },
  }),
  chart("area", "Area", "Monthly recurring revenue", "USD, thousands", "area", "area", {
    version: "1",
    type: "line",
    title: "Monthly recurring revenue",
    subtitle: "USD, thousands",
    data: [22, 30, 34, 45, 52, 61, 74, 90].map((mrr, i) => ({ month: months[i], mrr })),
    encoding: { x: "month", y: "mrr" },
    mark: { area: true, points: "none" },
    legend: false,
    size: SIZE,
    a11y: { alt: "Monthly recurring revenue climbs from 22 thousand in January to 90 in August." },
  }),
  chart("donut", "Donut", "Traffic by source", "Last 30 days", "fade", "donut", {
    version: "1",
    type: "donut",
    title: "Traffic by source",
    subtitle: "Last 30 days",
    data: [
      { source: "Search", share: 46 },
      { source: "Direct", share: 28 },
      { source: "Referral", share: 16 },
      { source: "Social", share: 10 },
    ],
    encoding: { x: "source", y: "share" },
    mark: { innerRadius: 0.62 },
    size: SIZE,
    a11y: { alt: "Search is 46 percent of traffic. Social is the smallest source at 10 percent." },
  }),
  chart("heatmap", "Heatmap", "Support volume by hour", "Tickets, weekdays", "fade", "heatmap", {
    version: "1",
    type: "heatmap",
    title: "Support volume by hour",
    subtitle: "Tickets, weekdays",
    data: heatRows(),
    encoding: { x: "hour", y: "day", color: "tickets" },
    mark: { layout: "grid", cornerRadius: 4 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Weekday tickets peak late morning, and Friday is the quietest day." },
  }),
  chart("scatter", "Scatter", "Seats vs. renewal rate", "Accounts, Q3", "fade", "scatter", {
    version: "1",
    type: "scatter",
    title: "Seats vs. renewal rate",
    subtitle: "Accounts, Q3",
    data: [
      [8, 22],
      [15, 35],
      [22, 30],
      [28, 48],
      [35, 44],
      [41, 58],
      [48, 52],
      [55, 70],
      [62, 66],
      [70, 78],
      [77, 74],
      [85, 88],
      [90, 82],
      [18, 50],
      [60, 40],
      [40, 72],
    ].map(([seats, renewal]) => ({ seats, renewal })),
    encoding: { x: "seats", y: "renewal" },
    mark: { pointSize: 5 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Renewal rate tends to rise with seat count, with a few smaller accounts already high." },
  }),
  chart("stacked", "Stacked", "Revenue by plan", "USD, thousands", "bar", "bar", {
    version: "1",
    type: "bar",
    title: "Revenue by plan",
    subtitle: "USD, thousands",
    data: stackedPlans.flatMap((parts, i) =>
      parts.map((usd, plan) => ({ month: months[i], plan: planNames[plan], usd })),
    ),
    encoding: { x: "month", y: "usd", color: "plan" },
    mark: { stack: "stack", cornerRadius: 3 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Stacked revenue rises from January to August. Free is the largest plan each month." },
  }),
  chart("grouped", "Grouped", "Trials vs. conversions", "Per month", "bar", "bar", {
    version: "1",
    type: "bar",
    title: "Trials vs. conversions",
    subtitle: "Per month",
    data: grouped.map(([trials, conv], i) => ({ month: months[i], trials, conv })),
    encoding: { x: "month", y: ["trials", "conv"] },
    mark: { cornerRadius: 3 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Conversions pass trials in January and stay ahead in most of the next five months." },
  }),
  chart("histogram", "Histogram", "Response time distribution", "Milliseconds, 14 bins", "bar", "histogram", {
    version: "1",
    type: "histogram",
    title: "Response time distribution",
    subtitle: "Milliseconds, 14 bins",
    data: histogramRows(),
    encoding: { x: "ms" },
    mark: { bins: 14 },
    legend: false,
    size: SIZE,
    a11y: { alt: "Response times bunch in the middle of the range, with a thin tail of slower requests." },
  }),
  chart("pie", "Pie", "Plan mix", "Active accounts", "fade", "pie", {
    version: "1",
    type: "pie",
    title: "Plan mix",
    subtitle: "Active accounts",
    data: [
      { plan: "Free", n: 52 },
      { plan: "Pro", n: 24 },
      { plan: "Team", n: 14 },
      { plan: "Enterprise", n: 10 },
    ],
    encoding: { x: "plan", y: "n" },
    size: SIZE,
    a11y: { alt: "Free is just over half of active accounts. Enterprise is the smallest slice." },
  }),
  chart("gauge", "Gauge", "Quarterly target", "Q3 progress", "fade", "gauge", {
    version: "1",
    type: "gauge",
    title: "Quarterly target",
    subtitle: "Q3 progress",
    metric: { label: "of target", value: 74, min: 0, max: 100, format: "integer" },
    size: SIZE,
    a11y: { alt: "The quarterly target is 74 out of 100." },
  }),
  chart("radar", "Radar", "Team skills", "Self-assessed, 6 axes", "fade", "radar", {
    version: "1",
    type: "radar",
    title: "Team skills",
    subtitle: "Self-assessed, 6 axes",
    data: [
      { axis: "Design", score: 88 },
      { axis: "Infra", score: 62 },
      { axis: "Product", score: 74 },
      { axis: "Data", score: 50 },
      { axis: "Support", score: 68 },
      { axis: "Research", score: 80 },
    ],
    encoding: { x: "axis", y: "score" },
    legend: false,
    size: SIZE,
    a11y: { alt: "Design scores highest at 88. Data is the low spoke at 50." },
  }),
  chart("funnel", "Funnel", "Signup funnel", "Last 30 days", "fade", "funnel", {
    version: "1",
    type: "funnel",
    title: "Signup funnel",
    subtitle: "Last 30 days",
    data: [
      { step: "Visited", n: 100 },
      { step: "Signed up", n: 64 },
      { step: "Activated", n: 41 },
      { step: "Paid", n: 22 },
      { step: "Retained", n: 17 },
    ],
    encoding: { x: "step", y: "n" },
    legend: false,
    size: SIZE,
    a11y: { alt: "Of 100 visits, 64 sign up and 17 are still retained." },
  }),
  chart("treemap", "Treemap", "Traffic by source", "Share of sessions", "fade", "treemap", {
    version: "1",
    type: "treemap",
    title: "Traffic by source",
    subtitle: "Share of sessions",
    data: [
      { source: "Search", n: 46 },
      { source: "Direct", n: 28 },
      { source: "Referral", n: 16 },
      { source: "Social", n: 10 },
    ],
    encoding: { x: "source", y: "n", color: "source" },
    legend: false,
    size: SIZE,
    a11y: { alt: "Search is the largest tile at 46. Social is the smallest at 10." },
  }),
  chart("candle", "Candle", "CK / USD", "Daily, 12 sessions", "fade", "candlestick", {
    version: "1",
    type: "candlestick",
    title: "CK / USD",
    subtitle: "Daily, 12 sessions",
    data: candles.map(([d, open, close, low, high]) => ({ d, open, close, low, high })),
    encoding: { x: "d", open: "open", close: "close", low: "low", high: "high" },
    legend: false,
    size: SIZE,
    a11y: { alt: "The session closes higher than it opens on most of the twelve days." },
  }),
  chart("waterfall", "Waterfall", "ARR bridge", "Q2 → Q3, USD millions", "fade", "waterfall", {
    version: "1",
    type: "waterfall",
    title: "ARR bridge",
    subtitle: "Q2 → Q3, USD millions",
    data: [
      { step: "Start", delta: 40, total: true },
      { step: "New", delta: 25 },
      { step: "Churn", delta: -13 },
      { step: "Upsell", delta: 26 },
      { step: "Credits", delta: -8 },
      { step: "Expansion", delta: 18 },
      { step: "End", delta: 88, total: true },
    ],
    encoding: { x: "step", y: "delta" },
    mark: { total: "total" },
    legend: false,
    size: SIZE,
    a11y: { alt: "ARR starts at 40 and ends at 88 after new business, churn, credits, and expansion." },
  }),
  chart("spark", "Spark", "Service health", "Four sparklines, one spec each", "fade", "sparkline", {
    version: "1",
    type: "sparkline",
    title: "Requests",
    subtitle: "Four sparklines, one spec each",
    data: spark.map((v, t) => ({ t: t + 1, v })),
    encoding: { x: "t", y: "v" },
    legend: false,
    size: SIZE,
    a11y: { alt: "Requests climb from 30 to 92 across the ten samples, with two small dips." },
  }),
  chart("hbar", "Hbar", "Quota attainment", "By region, percent", "hbar", "bar", {
    version: "1",
    type: "bar",
    title: "Quota attainment",
    subtitle: "By region, percent",
    data: [
      { region: "North", pct: 82 },
      { region: "South", pct: 64 },
      { region: "East", pct: 91 },
      { region: "West", pct: 48 },
      { region: "Online", pct: 73 },
    ],
    encoding: { x: "region", y: "pct" },
    mark: { orientation: "horizontal", cornerRadius: 3 },
    legend: false,
    size: SIZE,
    a11y: { alt: "East leads quota attainment at 91 percent. West is lowest at 48." },
  }),
];

if (heroCharts.length !== 18) {
  throw new Error(`Homepage hero expected 18 charts, got ${heroCharts.length}`);
}
