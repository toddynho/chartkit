import { paintSpec } from "../lib/chartkit";
import { docsSpecForType } from "./live-specs";
import { brandTheme } from "./marketing-theme";

export type Slide = {
  label: string;
  title: string;
  subtitle: string;
  bytes: string;
  html: string;
  svg: string;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function bytesOf(spec: unknown): string {
  const n = new TextEncoder().encode(JSON.stringify(spec)).length;
  return `${n} B`;
}

function highlight(spec: unknown): string {
  const json = JSON.stringify(spec, null, 2)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return json
    .replaceAll(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="tok-key">$1</span>$2')
    .replaceAll(/: ("(?:\\.|[^"\\])*")/g, ': <span class="tok-str">$1</span>')
    .replaceAll(/: (-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>');
}

function paint(spec: Record<string, unknown>, size: { width: number; height: number }): string {
  const next = {
    ...spec,
    theme: brandTheme,
    size,
    legend: spec.legend ?? false,
  };
  const result = paintSpec(next);
  if (!result.ok || !result.svg.includes("<svg") || result.svg.includes("ck-chart-error")) {
    throw new Error(`${String(spec.type)} render failed: ${result.footer}`);
  }
  if (result.svg.includes('class="ck-chart"')) return result.svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"');
  return result.svg.replace("<svg ", '<svg class="ck-svg" ');
}

function slide(
  label: string,
  title: string,
  subtitle: string,
  spec: Record<string, unknown>,
  size = { width: 640, height: 280 },
): Slide {
  return { label, title, subtitle, bytes: bytesOf(spec), html: highlight(spec), svg: paint(spec, size) };
}

const signups = [72, 98, 86, 128, 114, 158, 148, 188];

function row(month: string, signups: number) {
  return { month, signups };
}

export function homeSlides(): Slide[] {
  const bar = slide(
    "bar",
    "Signups by month",
    "Monthly, 2026",
    {
      version: "1",
      type: "bar",
      title: "Signups by month",
      data: months.map((month, i) => row(month, signups[i])),
      encoding: { x: "month", y: "signups" },
      mark: { cornerRadius: 3 },
      a11y: { alt: "Signups rise from 72 in January to 188 in August." },
    },
  );
  const line = slide("line", "Latency, p50 vs p95", "Milliseconds, rolling 8 weeks", {
    version: "1",
    type: "line",
    title: "Latency, p50 vs p95",
    data: [40, 44, 38, 50, 46, 55, 52, 60].map((p50, i) => ({
      week: i + 1,
      p50,
      p95: [62, 70, 66, 80, 74, 88, 82, 92][i],
    })),
    encoding: { x: "week", y: ["p50", "p95"] },
    mark: { curve: "monotone", points: "none" },
    a11y: { alt: "p95 stays above p50 across eight weeks, and both end higher than they start." },
  });
  const area = slide("area", "Monthly recurring revenue", "USD, thousands", {
    version: "1",
    type: "line",
    title: "Monthly recurring revenue",
    data: [22, 30, 34, 45, 52, 61, 74, 90].map((mrr, i) => ({ month: months[i], mrr })),
    encoding: { x: "month", y: "mrr" },
    mark: { area: true, curve: "monotone", points: "none" },
    a11y: { alt: "Monthly recurring revenue climbs from 22 thousand in January to 90 thousand in August." },
  });
  const donut = slide("donut", "Traffic by source", "Last 30 days", {
    version: "1",
    type: "donut",
    title: "Traffic by source",
    data: [
      { source: "Search", share: 46 },
      { source: "Direct", share: 28 },
      { source: "Referral", share: 16 },
      { source: "Social", share: 10 },
    ],
    encoding: { x: "source", y: "share" },
    mark: { innerRadius: 0.62 },
    legend: true,
    a11y: { alt: "Search is 46 percent of traffic. Social is 10 percent." },
  });
  const heatRows = ["Mon", "Tue", "Wed", "Thu", "Fri"].flatMap((day, row) =>
    [12, 24, 41, 55, 48, 30, 18, 11].map((base, hour) => ({
      day,
      hour: 9 + hour,
      tickets: Math.max(4, base - row * 6 + (hour % 3) * 4),
    })),
  );
  const heatmap = slide("heatmap", "Support volume by hour", "Tickets, weekdays", {
    version: "1",
    type: "heatmap",
    title: "Support volume by hour",
    data: heatRows,
    encoding: { x: "hour", y: "day", color: "tickets" },
    a11y: { alt: "Weekday tickets peak late morning and ease after 15:00." },
  });
  const scatter = slide("scatter", "Seats vs. renewal rate", "Accounts, Q3", {
    version: "1",
    type: "scatter",
    title: "Seats vs. renewal rate",
    data: [8, 15, 22, 28, 35, 41, 48, 55, 62, 70, 77, 85].map((seats, i) => ({
      seats,
      renewal: [22, 35, 30, 48, 44, 58, 52, 70, 66, 78, 74, 88][i],
    })),
    encoding: {
      x: { field: "seats", type: "quantitative" },
      y: { field: "renewal", type: "quantitative" },
    },
    a11y: { alt: "Renewal rate tends to be higher at accounts with more seats." },
  });
  const stacked = slide("stacked", "Revenue by plan", "USD, thousands", {
    version: "1",
    type: "bar",
    title: "Revenue by plan",
    data: months.flatMap((month, i) => [
      { month, plan: "Free", usd: [30, 38, 34, 46, 42, 55, 52, 60][i] },
      { month, plan: "Pro", usd: [20, 24, 22, 28, 26, 30, 28, 32][i] },
      { month, plan: "Team", usd: [12, 14, 10, 16, 14, 15, 18, 8][i] },
    ]),
    encoding: { x: "month", y: "usd", series: "plan" },
    mark: { stack: "stack", cornerRadius: 3 },
    legend: true,
    a11y: { alt: "Free remains the largest plan each month, with Pro and Team stacked above it." },
  });
  const grouped = slide("grouped", "Trials vs. conversions", "Per month", {
    version: "1",
    type: "bar",
    title: "Trials vs. conversions",
    data: months.slice(0, 6).map((month, i) => ({
      month,
      trials: [40, 55, 48, 70, 62, 88][i],
      conv: [62, 48, 70, 58, 84, 76][i],
    })),
    encoding: { x: "month", y: ["trials", "conv"] },
    mark: { stack: "none", cornerRadius: 3 },
    legend: true,
    a11y: { alt: "Trials and conversions trade the lead across six months." },
  });
  const histogram = slide("histogram", "Response time", "Milliseconds", {
    version: "1",
    type: "histogram",
    title: "Response time",
    data: [40, 48, 55, 62, 70, 74, 80, 88, 92, 96, 100, 104, 110, 118, 120, 128, 132, 140, 150, 160, 170, 188, 210, 240].map(
      (ms) => ({ ms }),
    ),
    encoding: { x: "ms" },
    mark: { bins: 12 },
    a11y: { alt: "Most responses cluster between about 70 and 140 milliseconds." },
  });
  const pie = slide("pie", "Plan mix", "Active accounts", {
    version: "1",
    type: "pie",
    title: "Plan mix",
    data: [
      { plan: "Free", n: 52 },
      { plan: "Pro", n: 24 },
      { plan: "Team", n: 14 },
      { plan: "Ent", n: 10 },
    ],
    encoding: { x: "plan", y: "n" },
    legend: true,
    a11y: { alt: "Free accounts are about half of the mix. Enterprise is the smallest slice." },
  });
  const gauge = slide("gauge", "Quarterly target", "Q3 progress", {
    version: "1",
    type: "gauge",
    title: "Quarterly target",
    metric: { label: "of target", value: 74, min: 0, max: 100, format: "integer" },
    a11y: { alt: "Quarterly progress is 74 out of 100." },
  });
  const radar = slide("radar", "Team skills", "Self-assessed, six axes", {
    version: "1",
    type: "radar",
    title: "Team skills",
    data: [
      { axis: "Design", score: 88 },
      { axis: "Infra", score: 62 },
      { axis: "Data", score: 74 },
      { axis: "Support", score: 50 },
      { axis: "Sales", score: 68 },
      { axis: "Writing", score: 80 },
    ],
    encoding: { x: "axis", y: "score" },
    a11y: { alt: "Design and writing score highest. Support scores lowest." },
  });
  const funnel = slide("funnel", "Signup funnel", "Last 30 days", {
    version: "1",
    type: "funnel",
    title: "Signup funnel",
    data: [
      { step: "Visited", n: 100 },
      { step: "Signed up", n: 64 },
      { step: "Activated", n: 41 },
      { step: "Paid", n: 22 },
      { step: "Retained", n: 17 },
    ],
    encoding: { x: "step", y: "n" },
    a11y: { alt: "17 of 100 visits are retained. The largest drop is from visited to signed up." },
  });
  const treemap = slide("treemap", "Traffic by source", "Share of sessions", {
    version: "1",
    type: "treemap",
    title: "Traffic by source",
    data: [
      { source: "Search", n: 46 },
      { source: "Direct", n: 28 },
      { source: "Referral", n: 16 },
      { source: "Social", n: 10 },
    ],
    encoding: { x: "source", y: "n", color: "source" },
    a11y: { alt: "Search is the largest tile at 46. Social is the smallest at 10." },
  });
  const candle = slide("candle", "CK / USD", "Daily, eight sessions", {
    version: "1",
    type: "candlestick",
    title: "CK / USD",
    data: [
      [30, 55, 20, 65],
      [55, 48, 40, 70],
      [48, 62, 44, 68],
      [62, 58, 50, 75],
      [58, 72, 52, 78],
      [72, 66, 60, 80],
      [66, 80, 62, 86],
      [80, 74, 70, 90],
    ].map(([open, close, low, high], i) => ({
      d: `2026-03-${String(i + 2).padStart(2, "0")}`,
      open,
      close,
      low,
      high,
    })),
    encoding: { x: { field: "d", type: "temporal" }, open: "open", high: "high", low: "low", close: "close" },
    a11y: { alt: "The session closes higher than it opens on most of the eight days." },
  });
  const waterfall = slide("waterfall", "ARR bridge", "Q2 to Q3, USD millions", {
    version: "1",
    type: "waterfall",
    title: "ARR bridge",
    data: [
      { step: "Start", amount: 40, total: true },
      { step: "New", amount: 25 },
      { step: "Churn", amount: -13 },
      { step: "Upsell", amount: 26 },
      { step: "Credits", amount: -8 },
      { step: "End", amount: 70, total: true },
    ],
    encoding: { x: "step", y: "amount" },
    mark: { total: "total" },
    a11y: { alt: "ARR ends at 70 after new sales and upsell, minus churn and credits." },
  });
  const sparkSpec = {
    version: "1",
    type: "sparkline",
    title: "Requests",
    data: [30, 42, 38, 55, 50, 68, 62, 80, 76, 92].map((v, t) => ({ t: t + 1, v })),
    encoding: { x: "t", y: "v" },
    a11y: { alt: "Requests trend from 30 to 92." },
  };
  const sparkCharts = [
    ["Requests", "1.2M", sparkSpec],
    [
      "Errors",
      "0.3%",
      {
        ...sparkSpec,
        title: "Errors",
        data: [40, 36, 44, 30, 34, 26, 28, 20, 24, 16].map((v, t) => ({ t: t + 1, v })),
        a11y: { alt: "Errors trend down from 40 to 16." },
      },
    ],
    [
      "p95",
      "212 ms",
      {
        ...sparkSpec,
        title: "p95",
        data: [60, 58, 62, 54, 56, 50, 52, 46, 48, 42].map((v, t) => ({ t: t + 1, v })),
        a11y: { alt: "p95 eases from 60 to 42." },
      },
    ],
    [
      "Uptime",
      "99.98%",
      {
        ...sparkSpec,
        title: "Uptime",
        data: [90, 92, 90, 94, 92, 95, 94, 96, 95, 97].map((v, t) => ({ t: t + 1, v })),
        a11y: { alt: "Uptime stays high and ends at 97." },
      },
    ],
  ] as const;
  const spark: Slide = {
    label: "spark",
    title: "Service health",
    subtitle: "Four sparklines",
    bytes: bytesOf(sparkSpec),
    html: highlight(sparkSpec),
    svg: "",
  };
  const hbar = slide("hbar", "Quota attainment", "By region, percent", {
    version: "1",
    type: "bar",
    title: "Quota attainment",
    data: [
      { region: "North", pct: 82 },
      { region: "South", pct: 64 },
      { region: "East", pct: 91 },
      { region: "West", pct: 48 },
      { region: "Online", pct: 73 },
    ],
    encoding: { x: "region", y: "pct" },
    mark: { orientation: "horizontal", cornerRadius: 3 },
    a11y: { alt: "East leads quota attainment at 91 percent. West is at 48." },
  });

  const slides = [bar, line, area, donut, heatmap, scatter, stacked, grouped, histogram, pie, gauge, radar, funnel, treemap, candle, waterfall, spark, hbar];
  return slides.map((item) =>
    item.label === "spark"
      ? {
          ...item,
          svg: `<div class="spark-grid">${sparkCharts
            .map(([label, value, spec]) => {
              const svg = paint(spec, { width: 280, height: 64 });
              return `<div class="spark-cell"><span>${label}</span><strong>${value}</strong>${svg}</div>`;
            })
            .join("")}</div>`,
        }
      : item,
  );
}

export function paintMark(spec: Record<string, unknown>, size: { width: number; height: number }): string {
  return paint(spec, size);
}

const barSpec = {
  version: "1",
  type: "bar",
  title: "Signups by month",
  data: months.map((month, i) => row(month, signups[i])),
  encoding: { x: "month", y: "signups" },
  mark: { cornerRadius: 3 },
  a11y: { alt: "Signups rise from January to August." },
};

export function showcaseSvgs() {
  const line = {
    version: "1",
    type: "line",
    data: [30, 45, 40, 60, 55, 75, 70, 90].map((v, i) => ({ m: months[i], v })),
    encoding: { x: "m", y: "v" },
    mark: { curve: "monotone", points: "none", area: false },
    a11y: { alt: "The line trends up." },
  };
  return {
    cloud: paint(barSpec, { width: 520, height: 160 }),
    revenue: paint(line, { width: 240, height: 72 }),
    orders: paint(
      {
        version: "1",
        type: "bar",
        data: [40, 60, 50, 80, 70, 95].map((v, i) => ({ m: months[i], v })),
        encoding: { x: "m", y: "v" },
        mark: { cornerRadius: 2 },
        a11y: { alt: "Orders vary across six months and peak in the last month." },
      },
      { width: 240, height: 72 },
    ),
    sessions: paint(
      {
        ...line,
        data: [60, 50, 65, 55, 70, 62, 80, 76].map((v, i) => ({ m: months[i], v })),
        a11y: { alt: "Sessions fluctuate and finish higher." },
      },
      { width: 240, height: 72 },
    ),
    errors: paint(
      {
        version: "1",
        type: "bar",
        data: [30, 25, 35, 20, 18, 12].map((v, i) => ({ m: months[i], v })),
        encoding: { x: "m", y: "v" },
        mark: { cornerRadius: 2 },
        a11y: { alt: "Errors fall toward the last month." },
      },
      { width: 240, height: 72 },
    ),
    agent: paint(barSpec, { width: 480, height: 140 }),
    email: paint(barSpec, { width: 460, height: 140 }),
    readme: paint(line, { width: 460, height: 120 }),
    reportA: paint(barSpec, { width: 220, height: 100 }),
    reportB: paint(line, { width: 220, height: 100 }),
  };
}

/** Gallery thumb. Real render, brand series only. */
export function galleryThumb(type: string): string {
  const spec = docsSpecForType(type);
  delete spec.title;
  delete spec.subtitle;
  spec.theme = brandTheme;
  spec.legend = false;
  if (type === "bar-list") spec.size = { width: 480, height: 200 };
  else if (type === "sparkline" || type === "mini-area") spec.size = { width: 480, height: 88 };
  else spec.size = { width: 480, height: 200 };
  const result = paintSpec(spec);
  if (!result.ok || !result.svg.includes("<svg") || result.svg.includes("ck-chart-error")) {
    throw new Error(`Gallery could not paint ${type}: ${result.footer}`);
  }
  if (result.svg.includes('class="ck-chart"')) return result.svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"');
  return result.svg.replace("<svg ", '<svg class="ck-svg" ');
}
