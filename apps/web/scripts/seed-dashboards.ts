/**
 * Seed src/content/dashboards/*.json from the handoff data() array.
 * Themes, nav, titles, and blurbs are copied verbatim. Panels are ChartSpecs
 * (plus layout.col/row and an optional summary) drawn from the same series.
 *
 * Run: node --experimental-strip-types scripts/seed-dashboards.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drawPanel } from "../src/lib/dashboard-render.ts";
import type { DashTheme } from "../src/lib/dashboard-spec.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src/content/dashboards");

const L = (n: number) =>
  Array.from({ length: n }, (_, i) => 30 + Math.round(40 * Math.sin(i / 2.3) + i * (40 / n) + (i % 3) * 4));
const W = (n: number) =>
  Array.from({ length: n }, (_, i) => 25 + Math.round(35 * Math.abs(Math.sin(i * 1.7)) + (i % 4) * 6));

function days(start: string, count: number): string[] {
  const origin = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => new Date(origin + index * 86400000).toISOString().slice(0, 10));
}

type Panel = Record<string, unknown>;

function base(extra: Panel): Panel {
  return { version: "1", legend: false, tooltip: false, ...extra };
}

function summary(value: string, delta?: string): { value: string; delta?: string } {
  return delta === undefined ? { value } : { value, delta };
}

function line(
  title: string,
  col: number,
  row: number,
  dates: string[],
  series: { field: string; title: string; values: number[]; dash?: "dashed" }[],
  alt: string,
  head?: { value: string; delta?: string },
): Panel {
  const data = dates.map((date, index) => {
    const rowData: Record<string, string | number> = { date };
    for (const item of series) rowData[item.field] = item.values[index] ?? 0;
    return rowData;
  });
  return base({
    type: "line",
    title,
    data,
    encoding: {
      x: { field: "date", type: "temporal" },
      y: series.map((item) => ({
        field: item.field,
        title: item.title,
        ...(item.dash ? { dash: item.dash } : {}),
      })),
    },
    mark: { curve: "monotone", points: "none" },
    legend: series.length > 1 ? { position: "top" } : false,
    axes: { x: { ticks: 4, grid: false }, y: { grid: true } },
    a11y: { alt },
    ...(head ? { summary: head } : {}),
    layout: { col, row },
  });
}

function area(title: string, col: number, row: number, dates: string[], values: number[], alt: string): Panel {
  return base({
    type: "line",
    title,
    data: dates.map((date, index) => ({ date, value: values[index] ?? 0 })),
    encoding: { x: { field: "date", type: "temporal" }, y: { field: "value", title: title } },
    mark: { curve: "monotone", points: "none", area: true },
    axes: { x: { ticks: 4, grid: false }, y: { grid: true } },
    a11y: { alt },
    layout: { col, row },
  });
}

function spark(
  title: string,
  col: number,
  row: number,
  values: number[],
  head: { value: string; delta?: string },
  alt: string,
  tone?: "negative",
): Panel {
  if (tone === "negative") {
    return base({
      type: "sparkline",
      title,
      data: values.map((v) => ({ v })),
      encoding: { y: { field: "v", color: "negative" } },
      a11y: { alt },
      summary: head,
      layout: { col, row },
    });
  }
  return base({
    type: "sparkline",
    title,
    data: values,
    a11y: { alt },
    summary: head,
    layout: { col, row },
  });
}

function bars(
  title: string,
  col: number,
  row: number,
  values: number[],
  alt: string,
  options: { negative?: boolean; head?: { value: string; delta?: string } } = {},
): Panel {
  return base({
    type: "bar",
    title,
    data: values.map((value, index) => ({ bucket: String(index + 1), value })),
    encoding: {
      x: "bucket",
      y: options.negative ? { field: "value", color: "negative" } : "value",
    },
    mark: { gap: values.length > 16 ? 0.08 : 0.28, cornerRadius: 2 },
    axes: { x: { labels: values.length <= 12, grid: false }, y: { grid: false } },
    a11y: { alt },
    ...(options.head ? { summary: options.head } : {}),
    layout: { col, row },
  });
}

function ranked(
  title: string,
  col: number,
  row: number,
  rows: { name: string; value: number }[],
  alt: string,
  format?: unknown,
): Panel {
  return base({
    type: "bar-list",
    title,
    data: rows,
    encoding: { x: "name", y: format ? { field: "value", format } : "value" },
    a11y: { alt },
    layout: { col, row },
  });
}

function stack(
  title: string,
  col: number,
  row: number,
  labels: string[],
  series: { field: string; title: string; values: number[] }[],
  alt: string,
): Panel {
  const data = labels.map((label, index) => {
    const rowData: Record<string, string | number> = { label };
    for (const item of series) rowData[item.field] = item.values[index] ?? 0;
    return rowData;
  });
  return base({
    type: "bar",
    title,
    data,
    encoding: {
      x: "label",
      y: series.map((item) => ({ field: item.field, title: item.title })),
    },
    mark: { stack: "stack", cornerRadius: 1 },
    legend: { position: "top" },
    axes: { x: { labels: labels.length <= 12, grid: false }, y: { grid: false } },
    a11y: { alt },
    layout: { col, row },
  });
}

function ring(title: string, col: number, row: number, parts: [string, number][], alt: string): Panel {
  return base({
    type: "donut",
    title,
    data: parts.map(([name, value]) => ({ name, value })),
    encoding: { x: "name", y: "value" },
    mark: { innerRadius: 0.62 },
    legend: { position: "right", orient: "vertical" },
    a11y: { alt },
    layout: { col, row },
  });
}

function gauge(title: string, col: number, row: number, pct: number, alt: string): Panel {
  return base({
    type: "gauge",
    title,
    metric: { label: title, value: pct, min: 0, max: 100, format: "percent-raw" },
    a11y: { alt },
    layout: { col, row },
  });
}

function heatmap(
  title: string,
  col: number,
  row: number,
  cells: { x: string; y: string; value: number }[],
  alt: string,
): Panel {
  return base({
    type: "heatmap",
    title,
    data: cells,
    encoding: {
      x: "x",
      y: "y",
      color: { field: "value", type: "quantitative" },
    },
    mark: { layout: "grid", cornerRadius: 2 },
    a11y: { alt },
    layout: { col, row },
  });
}

function candles(title: string, col: number, row: number, data: Record<string, unknown>[], alt: string, bg?: string): Panel {
  return base({
    type: "candlestick",
    title,
    data,
    encoding: {
      x: { field: "date", type: "temporal" },
      open: "open",
      high: "high",
      low: "low",
      close: "close",
    },
    axes: { x: { ticks: 4, grid: false }, y: { grid: true } },
    a11y: { alt },
    ...(bg ? { bg } : {}),
    layout: { col, row },
  });
}

const money = { style: "compact", prefix: "$" };
const compact = "compact";

const countries: { country: string; users: number }[] = [
  ["United States", 8200],
  ["India", 4100],
  ["Germany", 2800],
  ["United Kingdom", 2600],
  ["Brazil", 2100],
  ["France", 1900],
  ["Canada", 1700],
  ["Japan", 1500],
  ["Australia", 1200],
  ["Mexico", 1100],
  ["Indonesia", 980],
  ["Spain", 940],
  ["Italy", 880],
  ["Netherlands", 760],
  ["Poland", 640],
  ["Sweden", 520],
  ["Norway", 310],
  ["Turkey", 480],
  ["Argentina", 420],
  ["South Africa", 390],
  ["Nigeria", 360],
  ["Egypt", 280],
  ["Vietnam", 450],
  ["Thailand", 240],
  ["Philippines", 330],
  ["Pakistan", 290],
  ["Colombia", 220],
  ["Chile", 180],
  ["New Zealand", 160],
  ["Ireland", 210],
  ["Portugal", 190],
  ["Denmark", 170],
  ["Finland", 150],
  ["Switzerland", 200],
  ["Austria", 180],
  ["Belgium", 160],
  ["Romania", 140],
  ["Ukraine", 130],
  ["Greece", 110],
  ["Israel", 150],
  ["Singapore", 190],
  ["Malaysia", 170],
  ["Kenya", 120],
  ["Morocco", 90],
  ["Peru", 100],
  ["China", 2400],
  ["South Korea", 680],
  ["United Arab Emirates", 140],
].map(([country, users]) => ({ country: String(country), users: Number(users) }));

interface Board {
  order: number;
  id: string;
  name: string;
  blurb: string;
  app: string;
  user: string;
  chrome: "sidebar" | "topbar";
  active: number;
  nav: string[];
  title: string;
  sub: string;
  filters: string[];
  theme: DashTheme;
  panels: Panel[];
}

const oct = days("2026-10-01", 24);
const rising = L(24);
const previous = rising.map((value, index) => Math.round(value * 0.78 + (index % 5)));

const boards: Board[] = [
  {
    order: 1,
    id: "stripe",
    name: "Stripe-style payments",
    blurb: "Hero metric with a dotted comparison period, a row of sparkline KPIs, and a ranked breakdown.",
    app: "Ledger",
    user: "acme-corp · live",
    chrome: "sidebar",
    active: 1,
    nav: ["Home", "Payments", "Balances", "Customers", "Products", "Reports", "Developers"],
    title: "Payments",
    sub: "Gross volume for 1–21 October, compared to the previous period.",
    filters: ["Today", "Last 3 weeks", "Custom"],
    theme: {
      bg: "#f6f8fa",
      chrome: "#fff",
      surface: "#fff",
      border: "#e3e8ee",
      text: "#1a1f36",
      muted: "#697386",
      accent: "#635bff",
      accent2: "#a5a0ff",
      accent3: "#e4e2ff",
      grid: "#eef1f5",
      up: "#1a7f4b",
      down: "#cd3d64",
      radius: 8,
      gap: 14,
      row: 52,
      navActive: "#eef1f5",
      shadow: "0 1px 2px rgba(26,31,54,.06)",
    },
    panels: [
      line(
        "Gross volume",
        12,
        5,
        oct,
        [
          { field: "volume", title: "This period", values: rising.map((value) => value * 180) },
          { field: "previous", title: "Previous", values: previous.map((value) => value * 180), dash: "dashed" },
        ],
        "Gross volume rises across 1–24 October. The dashed line is the previous period, sitting below the current one.",
        summary("$261,400", "+34% vs. $194,900"),
      ),
      spark("Net volume", 3, 2, L(16).map((value) => value * 20), summary("$251K", "+31%"), "Net volume trends up across sixteen days."),
      spark("New customers", 3, 2, W(16), summary("248", "+12%"), "New customers fluctuate and finish higher than they started."),
      spark("Successful payments", 3, 2, L(16), summary("512", "+9%"), "Successful payments rise across sixteen days."),
      spark(
        "Disputes",
        3,
        2,
        W(16).toReversed(),
        summary("$8.4K", "−3%"),
        "Disputes ease across the period.",
        "negative",
      ),
      ranked(
        "Payments by method",
        6,
        4,
        [
          { name: "Card", value: 148200 },
          { name: "Bank debit", value: 84300 },
          { name: "Wallet", value: 19400 },
          { name: "Link", value: 9500 },
        ],
        "Card is the largest method at about $148,200, ahead of bank debit, wallet, and Link.",
        money,
      ),
      bars("Failed payments", 6, 4, W(18), "Failed payments vary across eighteen buckets, with no single spike dominating.", {
        negative: true,
      }),
    ],
  },
  {
    order: 2,
    id: "plausible",
    name: "Plausible-style analytics",
    blurb: "One big area chart under a KPI strip, with tabbed source breakdowns underneath.",
    app: "Simple Stats",
    user: "ckit.dev",
    chrome: "topbar",
    active: 0,
    nav: ["Sites", "Goals", "Funnels", "Settings"],
    title: "ckit.dev",
    sub: "1.4K current visitors · Last 30 days",
    filters: ["Realtime", "Last 30 days", "Year to date"],
    theme: {
      bg: "#f9fafb",
      chrome: "#fff",
      surface: "#fff",
      border: "#e5e7eb",
      text: "#1f2937",
      muted: "#6b7280",
      accent: "#6574cd",
      accent2: "#a0a9e8",
      accent3: "#e3e6f8",
      grid: "#f1f2f4",
      up: "#16a34a",
      down: "#dc2626",
      radius: 8,
      gap: 16,
      row: 52,
      navActive: "#f1f2f4",
    },
    panels: [
      base({
        title: "Overview",
        a11y: { alt: "Six site metrics: visitors, visits, pageviews, views per visit, bounce rate, and visit duration." },
        layout: {
          col: 12,
          row: 2,
          concat: {
            direction: "horizontal",
            gap: 8,
            views: [
              kpi("Unique visitors", 18400, 0.04, L(12), compact, "Unique visitors are 18.4 thousand, up 4 percent."),
              kpi("Total visits", 22100, 0.06, W(12), compact, "Total visits are 22.1 thousand, up 6 percent."),
              kpi("Pageviews", 51200, 0.08, L(12), compact, "Pageviews are 51.2 thousand, up 8 percent."),
              kpi("Views per visit", 2.3, 0.02, W(12), { style: "number", decimals: 1 }, "Views per visit are 2.3, up 2 percent."),
              kpi("Bounce rate", 41, -0.03, W(12).toReversed(), "percent-raw", "Bounce rate is 41 percent, down 3 percent.", "down"),
              kpi("Visit duration", 144000, 0.11, L(12), "duration-hm", "Visit duration is 2 minutes 24 seconds, up 11 percent."),
            ],
          },
        },
      }),
      area(
        "Visitors",
        12,
        5,
        days("2026-10-01", 30),
        W(30),
        "Visitors over the last 30 days rise and fall in a wave, ending higher than they began.",
      ),
      ranked(
        "Top sources",
        6,
        4,
        [
          { name: "Direct / none", value: 7200 },
          { name: "Google", value: 5600 },
          { name: "Hacker News", value: 3100 },
          { name: "GitHub", value: 2000 },
          { name: "Twitter", value: 980 },
        ],
        "Direct traffic leads sources at 7.2 thousand, then Google, Hacker News, GitHub, and Twitter.",
        compact,
      ),
      ranked(
        "Top pages",
        6,
        4,
        [
          { name: "/", value: 12300 },
          { name: "/docs", value: 8100 },
          { name: "/gallery", value: 4600 },
          { name: "/dashboards", value: 3700 },
          { name: "/compare", value: 2200 },
        ],
        "The home page leads at 12.3 thousand views, ahead of docs, gallery, dashboards, and compare.",
        compact,
      ),
    ],
  },
  {
    order: 3,
    id: "ga",
    name: "Analytics-style traffic report",
    blurb: "Dense card grid: realtime counter, geo map, channel table, user cohort heatmap.",
    app: "Insights",
    user: "All accounts",
    chrome: "sidebar",
    active: 2,
    nav: ["Home", "Realtime", "Reports", "Explore", "Advertising", "Admin"],
    title: "Reports snapshot",
    sub: "Acquisition for the last 28 days.",
    filters: ["Last 7 days", "Last 28 days", "Compare"],
    theme: {
      bg: "#f8f9fa",
      chrome: "#fff",
      surface: "#fff",
      border: "#dadce0",
      text: "#202124",
      muted: "#5f6368",
      accent: "#1a73e8",
      accent2: "#8ab4f8",
      accent3: "#d2e3fc",
      grid: "#eceff1",
      up: "#188038",
      down: "#d93025",
      radius: 8,
      gap: 16,
      row: 56,
      navActive: "#e8f0fe",
      mapBg: "#f1f3f4",
    },
    panels: [
      spark("Users", 3, 3, L(20), summary("24.8K", "+9.8%"), "Users trend upward across the last twenty days."),
      bars("Users in last 30 minutes", 3, 3, W(30), "Users in the last thirty minutes vary by minute, with no empty bucket.", {
        head: summary("142"),
      }),
      ranked(
        "New users by channel",
        6,
        3,
        [
          { name: "Organic search", value: 9800 },
          { name: "Direct", value: 6900 },
          { name: "Referral", value: 4100 },
          { name: "Social", value: 1800 },
        ],
        "Organic search brings the most new users, then direct, referral, and social.",
        compact,
      ),
      base({
        type: "choropleth",
        title: "Users by country",
        data: countries,
        encoding: { region: "country", color: { field: "users" } },
        mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
        a11y: {
          alt: "Users by country. The United States is highest, then India, Germany, and the United Kingdom. Countries without a row are unmarked.",
        },
        layout: { col: 6, row: 5 },
      }),
      ranked(
        "Sessions by channel",
        3,
        5,
        [
          { name: "Organic", value: 10282 },
          { name: "Direct", value: 7003 },
          { name: "Referral", value: 3928 },
          { name: "Social", value: 1214 },
          { name: "Email", value: 886 },
        ],
        "Organic sessions lead at 10,282, then direct, referral, social, and email.",
        "integer",
      ),
      heatmap(
        "User retention",
        3,
        5,
        cohort(),
        "Retention is highest in the first week of each cohort and fades in later weeks. Empty cells are weeks that have not happened yet.",
      ),
    ],
  },
  {
    order: 4,
    id: "sentry",
    name: "Sentry-style issues",
    blurb: "A table where every row carries an inline sparkline, plus stacked event volume.",
    app: "Tracer",
    user: "chartkit-web · production",
    chrome: "sidebar",
    active: 1,
    nav: ["Projects", "Issues", "Performance", "Releases", "Alerts", "Dashboards", "Settings"],
    title: "Issues",
    sub: "Unresolved issues in the last 14 days.",
    filters: ["24h", "14d", "90d"],
    theme: {
      bg: "#fafaf9",
      chrome: "#2b2233",
      surface: "#fff",
      border: "#e7e1ec",
      text: "#2b2233",
      muted: "#80708f",
      accent: "#6c5fc7",
      accent2: "#f2b712",
      accent3: "#f55459",
      grid: "#f0ecf3",
      up: "#2ba185",
      down: "#f55459",
      radius: 6,
      gap: 14,
      row: 52,
      navActive: "rgba(108,95,199,.14)",
      labelCase: "uppercase",
      labelTrack: ".06em",
    },
    panels: [
      ranked(
        "Issue",
        12,
        6,
        [
          { name: "ChartSpec.encode is undefined", value: 4201 },
          { name: "Map tile fetch timeout", value: 1842 },
          { name: "Candlestick render: NaN in OHLC", value: 960 },
          { name: "Hydration mismatch in <Chart>", value: 512 },
          { name: "Theme token missing: accent3", value: 233 },
          { name: "WebWorker 400 on repair()", value: 118 },
        ],
        "Unresolved issues ranked by events. ChartSpec.encode is undefined leads at 4,201 events.",
        "integer",
      ),
      stack(
        "Event volume",
        8,
        4,
        Array.from({ length: 24 }, (_, index) => String(index + 1)),
        [
          { field: "error", title: "Error", values: Array.from({ length: 24 }, (_, i) => 18 + (i % 5) * 6) },
          { field: "warning", title: "Warning", values: Array.from({ length: 24 }, (_, i) => 10 + (i % 3) * 5) },
          { field: "info", title: "Info", values: Array.from({ length: 24 }, (_, i) => 6 + (i % 4) * 3) },
        ],
        "Stacked event volume over twenty-four hours. Errors are the largest band, then warnings, then info.",
      ),
      line(
        "Response time",
        4,
        4,
        days("2026-10-08", 20),
        [
          { field: "p95", title: "p95", values: W(20) },
          { field: "p50", title: "p50", values: L(20).map((value) => Math.round(value * 0.55)) },
        ],
        "Response time over twenty days. p95 stays above p50 and both move together.",
      ),
    ],
  },
  {
    order: 5,
    id: "datadog",
    name: "Datadog-style monitors",
    blurb: "Dark ops board: big-number tiles, a gauge, and multi-series latency lines.",
    app: "Watchtower",
    user: "prod-us-east",
    chrome: "topbar",
    active: 2,
    nav: ["Infrastructure", "APM", "Dashboards", "Monitors", "Logs"],
    title: "API gateway",
    sub: "Requests, errors and latency · Past 4 hours",
    filters: ["1h", "4h", "1d", "1w"],
    theme: {
      bg: "#1b1b22",
      chrome: "#15151b",
      surface: "#23232b",
      border: "#32323d",
      text: "#e9e9ee",
      muted: "#9a9aa8",
      accent: "#8bd17c",
      accent2: "#e6c85a",
      accent3: "#7c6fe0",
      grid: "#2c2c36",
      up: "#8bd17c",
      down: "#ef6f6c",
      radius: 4,
      gap: 10,
      row: 52,
      navActive: "#2a2a35",
      labelCase: "uppercase",
      labelTrack: ".05em",
      dark: true,
    },
    panels: [
      spark("Requests", 4, 2, L(24), summary("1.3K/m", "+18%"), "Requests per minute trend up across the last four hours."),
      spark("Errors", 4, 2, W(24), summary("8", "−22%"), "Errors fall across the window.", "negative"),
      spark("p95 latency", 4, 2, W(24), summary("86 ms", "+4%"), "p95 latency wobbles and ends slightly higher."),
      gauge("Error budget remaining", 4, 4, 64, "Error budget remaining is 64 percent."),
      line(
        "Requests by status",
        8,
        4,
        days("2026-10-31", 40).map((date, index) => `${date}T${String(index % 24).padStart(2, "0")}:00:00Z`).slice(0, 40),
        [
          { field: "ok", title: "2xx", values: L(40) },
          { field: "warn", title: "4xx", values: W(40).map((value) => Math.round(value * 0.5)) },
          { field: "err", title: "5xx", values: W(40).map((value) => Math.round(value * 0.3)) },
        ],
        "Requests by status over forty points. 2xx is the top line, then 4xx, then 5xx.",
      ),
      line(
        "Error rate",
        5,
        4,
        days("2026-10-20", 30),
        [{ field: "rate", title: "Error rate", values: W(30) }],
        "Error rate fluctuates across thirty days without a lasting climb.",
      ),
      line(
        "Latency p50 / p95 / p99",
        7,
        4,
        days("2026-10-01", 30),
        [
          { field: "p50", title: "p50", values: W(30).map((value) => Math.round(value * 0.4)) },
          { field: "p95", title: "p95", values: W(30).map((value) => Math.round(value * 0.7)) },
          { field: "p99", title: "p99", values: W(30) },
        ],
        "Latency percentiles stay ordered: p99 above p95 above p50 across thirty days.",
      ),
      ranked(
        "Top services",
        12,
        3,
        [
          { name: "render", value: 612 },
          { name: "validate", value: 390 },
          { name: "repair", value: 232 },
          { name: "geo-tiles", value: 121 },
        ],
        "render leads at 612 requests per second, then validate, repair, and geo-tiles.",
        { style: "number", suffix: " rps", decimals: 0 },
      ),
    ],
  },
  {
    order: 6,
    id: "robinhood",
    name: "Robinhood-style portfolio",
    blurb: "Candlesticks over volume, green-on-black, with holdings as a weighted bar list.",
    app: "Fold",
    user: "Individual · Margin",
    chrome: "topbar",
    active: 0,
    nav: ["Investing", "Crypto", "Retirement", "Cash"],
    title: "$18,432.10",
    sub: "+$1,284.22 (+7.49%) past 3 months",
    filters: ["1D", "1W", "1M", "3M", "YTD"],
    theme: {
      bg: "#000",
      chrome: "#000",
      surface: "#0b0b0b",
      border: "#1f1f1f",
      text: "#f3f3f3",
      muted: "#8d8d8d",
      accent: "#00c805",
      accent2: "#5cd968",
      accent3: "#1e4f23",
      grid: "#181818",
      up: "#00c805",
      down: "#ff5000",
      radius: 10,
      gap: 12,
      row: 52,
      navActive: "#161616",
      h1: 34,
      chipR: 999,
      dark: true,
    },
    panels: [
      candles(
        "Portfolio",
        12,
        5,
        Array.from({ length: 28 }, (_, i) => {
          const open = 20 + i * 2 + (i % 3) * 4;
          const close = open + ((i % 4) - 1.5) * 6;
          return {
            date: days("2026-08-01", 28)[i],
            open: Math.round(open * 10) / 10,
            close: Math.round(close * 10) / 10,
            low: Math.round((Math.min(open, close) - 4) * 10) / 10,
            high: Math.round((Math.max(open, close) + 5) * 10) / 10,
          };
        }),
        "Twenty-eight sessions. Closes drift upward, with down days in orange and up days in green.",
        "#000",
      ),
      { ...bars("Volume", 12, 2, W(28), "Volume across the same twenty-eight sessions, higher on a few mid-period days."), bg: "#000" },
      spark("Buying power", 4, 2, L(12), summary("$4,120"), "Buying power edges up across twelve sessions."),
      spark("Dividends", 4, 2, W(12), summary("$2.40"), "Dividends stay small and uneven across twelve sessions."),
      spark("Day change", 4, 2, L(12), summary("+$184", "+1.0%"), "Day change finishes higher than it started."),
      ranked(
        "Holdings",
        12,
        4,
        [
          { name: "Broad fund", value: 8200 },
          { name: "North index", value: 6400 },
          { name: "Cash", value: 4100 },
          { name: "Bond sleeve", value: 770 },
        ],
        "Broad fund is the largest holding at $8,200, then the north index, cash, and a small bond sleeve.",
        money,
      ),
    ],
  },
  {
    order: 7,
    id: "linear",
    name: "Linear-style insights",
    blurb: "Quiet, compact cycle metrics: cycle-time line, a donut by state, and throughput bars.",
    app: "Cadence",
    user: "CK · Charting",
    chrome: "sidebar",
    active: 3,
    nav: ["Inbox", "My issues", "Cycles", "Insights", "Projects", "Roadmap"],
    title: "Insights",
    sub: "Cycle 24 · Oct 14 – Oct 28",
    filters: ["Cycle", "Quarter", "All time"],
    theme: {
      bg: "#fcfcfd",
      chrome: "#f7f7f9",
      surface: "#fff",
      border: "#ebebef",
      text: "#1c1c21",
      muted: "#6f6f7a",
      accent: "#5e6ad2",
      accent2: "#9ea4e6",
      accent3: "#e1e3f6",
      grid: "#f1f1f4",
      up: "#2e9a5c",
      down: "#d0493f",
      radius: 6,
      gap: 12,
      row: 48,
      navActive: "#ececf0",
      h1: 20,
      shadow: "0 1px 1px rgba(0,0,0,.03)",
    },
    panels: [
      spark("Cycle time", 4, 2, L(16).toReversed(), summary("3.4d", "−18%"), "Cycle time falls across sixteen weeks."),
      spark("Completed", 4, 2, L(16), summary("32", "+28%"), "Completed issues rise across the cycle."),
      spark("Scope added", 4, 2, W(16), summary("7", "+2"), "Scope added stays uneven and ends slightly higher."),
      line(
        "Cycle time by week",
        8,
        4,
        days("2026-08-03", 12),
        [{ field: "days", title: "Days", values: L(12).toReversed().map((value) => Math.round(value / 10)) }],
        "Cycle time by week trends down across twelve weeks.",
      ),
      ring(
        "By state",
        4,
        4,
        [
          ["Done", 58],
          ["In progress", 26],
          ["Backlog", 16],
        ],
        "Done is 58 percent of issues, in progress 26 percent, and backlog 16 percent.",
      ),
      bars(
        "Throughput",
        12,
        3,
        [40, 52, 46, 58, 60, 55, 72, 80, 78, 92],
        "Throughput climbs across ten weeks, from 40 to 92 completed issues.",
      ),
    ],
  },
  {
    order: 8,
    id: "vercel",
    name: "Vercel-style analytics",
    blurb: "Monochrome. One thick line, hairline grid, and three source tables side by side.",
    app: "Deploy",
    user: "chartkit-site",
    chrome: "topbar",
    active: 2,
    nav: ["Overview", "Deployments", "Analytics", "Speed Insights", "Logs"],
    title: "Analytics",
    sub: "Visitors for 20 September – 31 October",
    filters: ["24h", "7d", "30d"],
    theme: {
      bg: "#000",
      chrome: "#000",
      surface: "#0a0a0a",
      border: "#262626",
      text: "#ededed",
      muted: "#a1a1a1",
      accent: "#ededed",
      accent2: "#737373",
      accent3: "#2b2b2b",
      grid: "#1a1a1a",
      up: "#50e3c2",
      down: "#ff4d4f",
      radius: 8,
      gap: 12,
      row: 52,
      navActive: "#1a1a1a",
      mapBg: "#111",
      dark: true,
    },
    panels: [
      base({
        title: "Overview",
        a11y: { alt: "Visitors 38.1 thousand, page views 92.4 thousand, bounce rate 36 percent." },
        layout: {
          col: 12,
          row: 2,
          concat: {
            direction: "horizontal",
            gap: 8,
            views: [
              kpi("Visitors", 38100, 0.12, W(16), compact, "Visitors are 38.1 thousand, up 12 percent."),
              kpi("Page views", 92400, 0.09, L(16), compact, "Page views are 92.4 thousand, up 9 percent."),
              kpi("Bounce rate", 36, -0.04, W(16).toReversed(), "percent-raw", "Bounce rate is 36 percent, down 4 percent.", "down"),
            ],
          },
        },
      }),
      line(
        "Visitors",
        12,
        5,
        days("2026-09-20", 30),
        [{ field: "visitors", title: "Visitors", values: W(30).map((value) => value * 40) }],
        "Visitors from 20 September through mid October wave upward.",
      ),
      ranked(
        "Pages",
        4,
        4,
        [
          { name: "/", value: 14200 },
          { name: "/docs", value: 9800 },
          { name: "/gallery", value: 5100 },
          { name: "/dashboards", value: 3900 },
        ],
        "Home leads pages at 14.2 thousand visitors, then docs, gallery, and dashboards.",
        compact,
      ),
      ranked(
        "Referrers",
        4,
        4,
        [
          { name: "google.com", value: 8100 },
          { name: "news.ycombinator.com", value: 4400 },
          { name: "github.com", value: 3200 },
          { name: "t.co", value: 1100 },
        ],
        "google.com is the top referrer, then Hacker News, GitHub, and t.co.",
        compact,
      ),
      ranked(
        "Countries",
        4,
        4,
        [
          { name: "United States", value: 12400 },
          { name: "Germany", value: 4000 },
          { name: "India", value: 3600 },
          { name: "United Kingdom", value: 2900 },
        ],
        "The United States leads countries, then Germany, India, and the United Kingdom.",
        compact,
      ),
    ],
  },
  {
    order: 9,
    id: "shopify",
    name: "Shopify-style store overview",
    blurb: "Merchant home: sales line with comparison, channel donut, and a top-products table.",
    app: "Storefront",
    user: "Northwind Goods",
    chrome: "sidebar",
    active: 0,
    nav: ["Home", "Orders", "Products", "Customers", "Analytics", "Marketing"],
    title: "Good afternoon, Northwind",
    sub: "Here’s what’s happening with your store today.",
    filters: ["Today", "Last 7 days", "Last 30 days"],
    theme: {
      bg: "#f1f1f1",
      chrome: "#1a1a1a",
      surface: "#fff",
      border: "#e3e3e3",
      text: "#303030",
      muted: "#616161",
      accent: "#008060",
      accent2: "#5cb89c",
      accent3: "#cfe8df",
      grid: "#ededed",
      up: "#008060",
      down: "#d72c0d",
      radius: 12,
      gap: 14,
      row: 52,
      navActive: "rgba(255,255,255,.12)",
      shadow: "0 1px 0 rgba(0,0,0,.05)",
    },
    panels: [
      line(
        "Total sales",
        8,
        5,
        oct,
        [
          { field: "sales", title: "This period", values: L(24).map((value) => value * 12) },
          { field: "prior", title: "Previous", values: L(24).map((value) => Math.round(value * 12 * 0.7)), dash: "dashed" },
        ],
        "Total sales rise through October. The dashed line is the previous period, below the current one.",
        summary("$12,480", "+21%"),
      ),
      ring(
        "Sales by channel",
        4,
        5,
        [
          ["Online store", 62],
          ["POS", 24],
          ["Marketplace", 14],
        ],
        "Online store is 62 percent of sales, POS 24 percent, and marketplace 14 percent.",
      ),
      bars("Orders", 4, 3, W(14), "Orders across fourteen days stay in a narrow band.", { head: summary("184", "+9%") }),
      spark("Conversion rate", 4, 3, W(14), summary("2.8%", "+0.3"), "Conversion rate drifts up across fourteen days."),
      spark(
        "Returning customers",
        4,
        3,
        L(14).toReversed(),
        summary("38%", "−2"),
        "Returning customers ease slightly across fourteen days.",
        "negative",
      ),
      ranked(
        "Top products",
        12,
        4,
        [
          { name: "Oak desk organizer", value: 4240 },
          { name: "Wool throw", value: 3840 },
          { name: "Ceramic mug set", value: 2710 },
          { name: "Brass bookends", value: 1690 },
        ],
        "Oak desk organizer leads net sales at $4,240, then the wool throw, ceramic mug set, and brass bookends.",
        money,
      ),
    ],
  },
  {
    order: 10,
    id: "grafana",
    name: "Grafana-style cluster board",
    blurb: "Tight panels, orange accent, status gauges and host heatmap on near-black.",
    app: "Scope",
    user: "k8s-prod · 42 nodes",
    chrome: "topbar",
    active: 0,
    nav: ["Dashboards", "Explore", "Alerting", "Connections"],
    title: "Cluster overview",
    sub: "Last 6 hours · refreshed 10s ago",
    filters: ["Last 1h", "Last 6h", "Last 24h"],
    theme: {
      bg: "#111217",
      chrome: "#181b1f",
      surface: "#181b1f",
      border: "#2c3235",
      text: "#d8d9da",
      muted: "#8e9297",
      accent: "#ff9830",
      accent2: "#73bf69",
      accent3: "#5794f2",
      grid: "#22252b",
      up: "#73bf69",
      down: "#f2495c",
      radius: 2,
      gap: 8,
      row: 48,
      navActive: "#22252b",
      labelCase: "none",
      dark: true,
    },
    panels: [
      gauge("CPU", 3, 3, 72, "Cluster CPU is 72 percent."),
      gauge("Memory", 3, 3, 58, "Cluster memory is 58 percent."),
      spark("Pods running", 3, 3, L(20), summary("1,204", "+12"), "Pods running climb across the window."),
      spark("Restarts (6h)", 3, 3, W(20), summary("3", "−5"), "Restarts in the last six hours trend down.", "negative"),
      line(
        "Node CPU usage",
        8,
        4,
        days("2026-10-30", 48).map((date, index) => `${date}T${String(index % 24).padStart(2, "0")}:00:00Z`).slice(0, 48),
        [
          { field: "a", title: "az-a", values: W(48) },
          { field: "b", title: "az-b", values: L(48).map((value) => Math.round(value * 0.6)) },
          { field: "c", title: "az-c", values: W(48).map((value) => Math.round(value * 0.4)) },
        ],
        "Node CPU for three zones over forty-eight points. az-a runs highest.",
      ),
      heatmap(
        "Host heatmap",
        4,
        4,
        Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 8 }, (_, column) => ({
            x: `n${column + 1}`,
            y: ["az-a", "az-b", "az-c", "az-d", "az-e"][row] ?? "az",
            value: Math.round((0.15 + ((row * 3 + column * 5) % 9) / 10) * 100),
          })),
        ).flat(),
        "Host load across five zones and eight nodes. Darker cells are busier hosts.",
      ),
      area(
        "Network I/O",
        6,
        3,
        days("2026-10-01", 30),
        W(30),
        "Network I/O over thirty days rises and falls, ending above where it started.",
      ),
      bars("Disk pressure by node", 6, 3, W(21), "Disk pressure varies across twenty-one nodes, higher toward the later nodes."),
    ],
  },
];

function kpi(
  label: string,
  value: number,
  delta: number | undefined,
  sparkline: number[],
  format: unknown,
  alt: string,
  good?: "up" | "down",
): Panel {
  return {
    version: "1",
    type: "kpi",
    metric: {
      label,
      value,
      format,
      ...(delta === undefined ? {} : { delta }),
      ...(good ? { goodDirection: good } : {}),
    },
    data: sparkline,
    legend: false,
    tooltip: false,
    a11y: { alt },
  };
}

function cohort(): { x: string; y: string; value: number }[] {
  const rows = [
    [1, 0.62, 0.44, 0.38, 0.31, 0.28],
    [1, 0.58, 0.41, 0.35, 0.29, 0],
    [1, 0.64, 0.47, 0.4, 0, 0],
    [1, 0.6, 0.45, 0, 0, 0],
    [1, 0.66, 0, 0, 0, 0],
  ];
  const labels = ["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29"];
  const cells: { x: string; y: string; value: number }[] = [];
  rows.forEach((row, rowIndex) => {
    row.forEach((value, column) => {
      if (value <= 0) return;
      cells.push({ x: `W${column}`, y: labels[rowIndex] ?? "", value: Math.round(value * 100) });
    });
  });
  return cells;
}

const issues: string[] = [];
const warnings: string[] = [];
let panels = 0;

mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, ".generated"), { recursive: true });

for (const board of boards) {
  for (let index = 0; index < board.panels.length; index += 1) {
    const panel = board.panels[index] ?? {};
    const title = typeof panel.title === "string" ? panel.title : "panel";
    const drawn = await drawPanel(panel, board.theme, `${board.id}-${index}`);
    panels += 1;
    for (const error of drawn.errors) {
      issues.push(`${board.id} · ${title}: ${error.code} ${error.path} ${error.message}`);
    }
    for (const warning of drawn.warnings) {
      warnings.push(`${board.id} · ${title} [${drawn.type}]: ${warning.code} ${warning.path} ${warning.message}`);
    }
  }
  writeFileSync(join(outDir, `${board.id}.json`), `${JSON.stringify(board, null, 2)}\n`);
}

const report = { panels, errors: issues, warnings };
writeFileSync(join(root, ".generated/dashboard-validate.json"), `${JSON.stringify(report, null, 2)}\n`);

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`seeded ${boards.length} dashboards, ${panels} panels, ${warnings.length} warnings`);
for (const line of warnings) console.log(line);
