import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";

export type DashTheme = "soft" | "midnight";

export interface DashChart {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: "dash-12" | "dash-8" | "dash-6" | "dash-4" | "dash-3";
  spec: Record<string, unknown>;
  svg: string;
}

export interface DashSpark {
  id: string;
  name: string;
  detail: string;
  spec: Record<string, unknown>;
  svg: string;
}

export interface Dashboard {
  slug: string;
  product: string;
  title: string;
  lede: string;
  defaultTheme: DashTheme;
  charts: DashChart[];
  sparks: DashSpark[];
  notes: { label: string; detail: string }[];
}

interface ChartDraft {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: DashChart["span"];
  spec: Record<string, unknown>;
}

interface SparkDraft {
  id: string;
  name: string;
  detail: string;
  spec: Record<string, unknown>;
}

function draw(spec: Record<string, unknown>): string {
  const type = typeof spec.type === "string" ? spec.type : "";
  const checked = validate(spec);
  if (!checked.ok) {
    throw new Error(`${type} ${checked.errors.map((error) => `${error.code} ${error.path} ${error.message}`).join("; ")}`);
  }
  const svg = isExtra(type) ? renderExtra(spec as never) : renderCore(spec as never);
  if (!svg.includes("<svg") || svg.includes("ck-chart-error")) throw new Error(`${type} did not draw`);
  return svg;
}

function chart(draft: ChartDraft): DashChart {
  return { ...draft, svg: draw(draft.spec) };
}

function spark(draft: SparkDraft): DashSpark {
  return { ...draft, svg: draw(draft.spec) };
}

function spec(type: string, theme: DashTheme, body: Record<string, unknown>, alt: string): Record<string, unknown> {
  return { version: "1", type, theme, ...body, a11y: { alt } };
}

const ledgerMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const ledgerGross = [182, 176, 201, 198, 214, 248, 236, 261];
const ledgerPrior = [160, 171, 188, 190, 196, 205, 210, 218];

const meterDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const meterVisits = [4200, 4600, 4480, 5100, 5340, 3900, 3720];

const waylineWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const waylineNow = [18.2, 19.4, 18.8, 21.1, 22.4, 21.6, 23.8, 24.5];
const waylineThen = [16.4, 17.1, 17.8, 18.2, 18.9, 19.4, 19.1, 20.2];

const keelDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ledger(): Dashboard {
  const theme: DashTheme = "soft";
  const volume = ledgerMonths.map((month, index) => ({
    month,
    gross: ledgerGross[index],
    prior: ledgerPrior[index],
  }));
  const series = [
    ledgerGross,
    [174, 168, 190, 188, 202, 236, 224, 248],
    [18, 16, 15, 17, 14, 13, 14, 12],
    [620, 640, 710, 690, 760, 800, 790, 840],
  ];
  const kpis: ChartDraft[] = [
    { label: "Gross", value: 261000, delta: 0.08, alt: "Gross volume this month is 261 thousand dollars, up 8 percent." },
    { label: "Net", value: 248400, delta: 0.07, alt: "Net of fees is 248 thousand dollars, up 7 percent." },
    { label: "Refunds", value: 12600, delta: -0.11, goodDirection: "down" as const, alt: "Refunds are 12.6 thousand dollars, down 11 percent." },
    { label: "Accounts", value: 840, delta: 0.04, alt: "840 new accounts, up 4 percent." },
  ].map((item, index) => ({
    id: `ledger-kpi-${index}`,
    title: item.label,
    caption: "Scorecard with the eight-month series drawn under the value.",
    note: "type kpi. data draws the sparkline. metric.format is compact, metric.delta is the chip, and goodDirection down flips the refund colour.",
    span: "dash-4" as const,
    spec: spec(
      "kpi",
      theme,
      {
        data: series[index],
        metric: {
          label: item.label,
          value: item.value,
          delta: item.delta,
          format: "compact",
          ...(item.goodDirection ? { goodDirection: item.goodDirection } : {}),
        },
        size: { width: 240, height: 148 },
      },
      item.alt,
    ),
  }));
  return {
    slug: "ledger",
    product: "Harbor Ledger",
    title: "Harbor Ledger",
    lede: "A payments overview: four scorecards, a sparkline on each, and gross volume against the prior period.",
    defaultTheme: theme,
    charts: [
      ...kpis.map(chart),
      chart({
        id: "ledger-volume",
        title: "Gross volume",
        caption: "This period is an area. The prior period is a dashed line on the same axis.",
        note: "type combo. The first y series is mark area. The second is mark line and dash dashed. axes.y.format is compact. Theme tokens recolor both series.",
        span: "dash-12",
        spec: spec(
          "combo",
          theme,
          {
            data: volume,
            encoding: {
              x: "month",
              y: [
                { field: "gross", title: "This period", mark: "area" },
                { field: "prior", title: "Prior period", mark: "line", dash: "dashed" },
              ],
            },
            axes: { x: { title: "Month" }, y: { title: "Thousand USD", format: "compact" } },
            legend: { position: "top" },
            size: { width: 760, height: 300 },
          },
          "Gross volume peaks in October at 261 thousand, above the prior period.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Scorecards", detail: "type kpi. A number array in data is the sparkline under the value. metric.delta is the chip." },
      { label: "Comparison", detail: "combo puts an area and a dashed line on one x axis. dash dashed is the prior period." },
      { label: "Tokens", detail: "The page sets --ck-series-1, --ck-series-2, and --ck-area-opacity. Soft and Midnight swap those variables. No preset is added to the bundle." },
    ],
  };
}

function meter(): Dashboard {
  const theme: DashTheme = "soft";
  const days = meterDays.map((day, index) => ({ day, visits: meterVisits[index] }));
  return {
    slug: "meter",
    product: "Quiet Meter",
    title: "Quiet Meter",
    lede: "A minimal visits view: one accent, a large area, and two horizontal lists.",
    defaultTheme: theme,
    charts: [
      chart({
        id: "meter-visits",
        title: "Visits",
        caption: "One series, area on, legend off, monotone curve.",
        note: "type line, mark.area and mark.curve monotone, legend.show false. A single --ck-series-1 token is the only colour.",
        span: "dash-12",
        spec: spec(
          "line",
          theme,
          {
            data: days,
            encoding: { x: "day", y: { field: "visits", title: "Visits" } },
            mark: { area: true, curve: "monotone" },
            legend: { show: false },
            axes: { x: { title: "Day" }, y: { title: "Visits", format: "compact" } },
            size: { width: 760, height: 320 },
          },
          "Visits peak on Friday at 5,340 and fall over the weekend.",
        ),
      }),
      chart({
        id: "meter-pages",
        title: "Top pages",
        caption: "Horizontal bars, one colour, no legend.",
        note: "type bar, mark.orientation horizontal, legend.show false. The same series token paints every bar.",
        span: "dash-6",
        spec: spec(
          "bar",
          theme,
          {
            data: [
              { page: "/pricing", visits: 1840 },
              { page: "/docs", visits: 1420 },
              { page: "/changelog", visits: 980 },
              { page: "/about", visits: 640 },
              { page: "/status", visits: 410 },
            ],
            encoding: { x: "page", y: "visits" },
            mark: { orientation: "horizontal" },
            legend: { show: false },
            axes: { x: { title: "Page" }, y: { title: "Visits" } },
            size: { width: 420, height: 260 },
          },
          "Pricing is the most visited page, then docs.",
        ),
      }),
      chart({
        id: "meter-sources",
        title: "Top sources",
        caption: "The same bar spec, with a different category field.",
        note: "Same horizontal bar options as the page list. No second palette.",
        span: "dash-6",
        spec: spec(
          "bar",
          theme,
          {
            data: [
              { source: "Direct", visits: 2100 },
              { source: "Search", visits: 1760 },
              { source: "Newsletter", visits: 940 },
              { source: "Referral", visits: 610 },
              { source: "Social", visits: 280 },
            ],
            encoding: { x: "source", y: "visits" },
            mark: { orientation: "horizontal" },
            legend: { show: false },
            axes: { x: { title: "Source" }, y: { title: "Visits" } },
            size: { width: 420, height: 260 },
          },
          "Direct is the largest source, then search.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "One accent", detail: "Every mark uses --ck-series-1. The page does not set a range." },
      { label: "Lists", detail: "Horizontal bars are mark.orientation horizontal. Categories stay on x in the spec; the chart draws them down the side." },
    ],
  };
}

function wayline(): Dashboard {
  const theme: DashTheme = "soft";
  const weeks = waylineWeeks.map((week, index) => ({ week, now: waylineNow[index], then: waylineThen[index] }));
  const scores: ChartDraft[] = [
    { label: "Sessions", value: 24500, delta: 0.06, format: "compact", alt: "Sessions this week are 24.5 thousand, up 6 percent." },
    { label: "Engaged", value: 11200, delta: 0.03, format: "compact", alt: "Engaged sessions are 11.2 thousand, up 3 percent." },
    { label: "Brief", value: 0.38, delta: -0.02, format: "percent", alt: "Brief sessions are 38 percent, down 2 points." },
    { label: "Minutes", value: 3.4, delta: 0.05, format: "number", alt: "Average minutes are 3.4, up 5 percent." },
  ].map((item, index) => ({
    id: `wayline-kpi-${index}`,
    title: item.label,
    caption: "Scorecard.",
    note: "type kpi. metric.delta is the comparison chip. metric.format is compact, percent, or number.",
    span: "dash-4" as const,
    spec: spec(
      "kpi",
      theme,
      { metric: { label: item.label, value: item.value, delta: item.delta, format: item.format }, size: { width: 220, height: 96 } },
      item.alt,
    ),
  }));
  return {
    slug: "wayline",
    product: "Wayline",
    title: "Wayline",
    lede: "Sessions over time, a channel donut, a country bar, and four scorecards.",
    defaultTheme: theme,
    charts: [
      ...scores.map(chart),
      chart({
        id: "wayline-sessions",
        title: "Sessions",
        caption: "This period is solid. The comparison period is dashed.",
        note: "type line. The second y series sets dash dashed. Both share encoding.x.",
        span: "dash-8",
        spec: spec(
          "line",
          theme,
          {
            data: weeks,
            encoding: {
              x: "week",
              y: [
                { field: "now", title: "This period" },
                { field: "then", title: "Prior period", dash: "dashed" },
              ],
            },
            axes: { x: { title: "Week" }, y: { title: "Thousand sessions" } },
            legend: { position: "top" },
            size: { width: 520, height: 280 },
          },
          "Sessions rise from 18.2 to 24.5 thousand, staying above the prior period.",
        ),
      }),
      chart({
        id: "wayline-channels",
        title: "Channels",
        caption: "Five slices, coloured from one sequential range.",
        note: "type donut. encoding.color.range is five var(--ck-wayline-N) steps, so Soft and Midnight recolour the slices.",
        span: "dash-3",
        spec: spec(
          "donut",
          theme,
          {
            data: [
              { channel: "Search", share: 42 },
              { channel: "Direct", share: 24 },
              { channel: "Mail", share: 16 },
              { channel: "Social", share: 11 },
              { channel: "Referral", share: 7 },
            ],
            encoding: {
              x: "channel",
              y: "share",
              color: {
                field: "channel",
                range: ["var(--ck-wayline-1)", "var(--ck-wayline-2)", "var(--ck-wayline-3)", "var(--ck-wayline-4)", "var(--ck-wayline-5)"],
              },
            },
            size: { width: 320, height: 280 },
          },
          "Search is 42 percent of sessions. Referral is 7 percent.",
        ),
      }),
      chart({
        id: "wayline-countries",
        title: "Countries",
        caption: "A bar stands in for a map. The same rows can feed a choropleth.",
        note: "type bar, mark.orientation horizontal. A choropleth would use type choropleth, encoding.region, and mark.atlas world from @chartkitdev/geo.",
        span: "dash-12",
        spec: spec(
          "bar",
          theme,
          {
            data: [
              { country: "Japan", sessions: 6200 },
              { country: "Portugal", sessions: 4100 },
              { country: "Chile", sessions: 2800 },
              { country: "Kenya", sessions: 1900 },
              { country: "Canada", sessions: 1600 },
            ],
            encoding: { x: "country", y: "sessions" },
            mark: { orientation: "horizontal" },
            legend: { show: false },
            axes: { x: { title: "Country" }, y: { title: "Sessions" } },
            size: { width: 760, height: 240 },
          },
          "Japan has the most sessions, then Portugal.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Dashed comparison", detail: "The prior series is a y object with dash dashed. It is the same chart, not an overlay image." },
      { label: "Donut", detail: "color.range points at --ck-wayline-1 through --ck-wayline-5. The page defines a lighter set in Midnight." },
      { label: "Country", detail: "This page uses a bar. The note on the chart is the choropleth alternative." },
    ],
  };
}

function keel(): Dashboard {
  const theme: DashTheme = "midnight";
  const levels = ["Fault", "Warn", "Note"];
  const counts = [
    [40, 22, 18],
    [36, 24, 20],
    [52, 30, 16],
    [44, 28, 22],
    [33, 20, 24],
    [18, 12, 14],
    [16, 11, 13],
  ];
  const events = keelDays.flatMap((day, index) =>
    levels.map((level, levelIndex) => ({ day, level, events: counts[index]?.[levelIndex] ?? 0 })),
  );
  const hours = ["00", "04", "08", "12", "16", "20"];
  const latency = [
    [80, 90, 110, 140, 120, 95],
    [210, 240, 320, 410, 360, 250],
  ];
  const latencyRows = hours.map((hour, index) => ({ hour, p50: latency[0]?.[index], p95: latency[1]?.[index] }));
  const issueSeries = [
    [2, 4, 9, 6, 3, 2, 1],
    [1, 1, 2, 5, 4, 2, 2],
    [6, 5, 4, 4, 3, 3, 2],
    [0, 1, 1, 8, 3, 1, 0],
  ];
  const issueNames = [
    ["Checkout timeout", "14 events"],
    ["Map tile retry", "11 events"],
    ["Queue lag", "27 events"],
    ["Auth clock skew", "8 events"],
  ];
  return {
    slug: "keel",
    product: "Keel",
    title: "Keel",
    lede: "Event volume, a release band, a sparkline on each issue, and p50 against p95. Dark first.",
    defaultTheme: theme,
    charts: [
      chart({
        id: "keel-volume",
        title: "Event volume",
        caption: "Stacked bars. The shaded band is the 2.4 release window.",
        note: "type bar, encoding.series, mark.stack stack. annotations band on x from Wed to Thu, plus a rule at Thu.",
        span: "dash-12",
        spec: spec(
          "bar",
          theme,
          {
            data: events,
            encoding: { x: "day", y: "events", series: "level" },
            mark: { stack: "stack" },
            axes: { x: { title: "Day" }, y: { title: "Events" } },
            legend: { position: "top" },
            annotations: [
              { type: "band", axis: "x", from: "Wed", to: "Thu", label: "Keel 2.4", opacity: 0.18 },
              { type: "rule", axis: "x", value: "Thu", label: "Ship", dash: "solid" },
            ],
            size: { width: 760, height: 300 },
          },
          "Faults peak on Wednesday, inside the Keel 2.4 window, and fall through the weekend.",
        ),
      }),
      chart({
        id: "keel-latency",
        title: "Latency",
        caption: "p50 and p95, two lines, one axis.",
        note: "type line. Two y fields. The page tokens paint p50 and p95 as different series.",
        span: "dash-12",
        spec: spec(
          "line",
          theme,
          {
            data: latencyRows,
            encoding: {
              x: "hour",
              y: [
                { field: "p50", title: "p50" },
                { field: "p95", title: "p95" },
              ],
            },
            axes: { x: { title: "Hour" }, y: { title: "Milliseconds" } },
            legend: { position: "top" },
            size: { width: 760, height: 260 },
          },
          "p95 peaks at 410 milliseconds at noon. p50 stays under 140.",
        ),
      }),
    ],
    sparks: issueNames.map(([name, detail], index) =>
      spark({
        id: `keel-issue-${index}`,
        name: name ?? "",
        detail: detail ?? "",
        spec: spec(
          "sparkline",
          theme,
          { data: issueSeries[index], size: { width: 148, height: 36 } },
          `${name} is busiest midweek.`,
        ),
      }),
    ),
    notes: [
      { label: "Dark first", detail: "The spec theme defaults to midnight. Soft still renders; the page tokens shift with the toggle." },
      { label: "Release band", detail: "annotations band shades Wed to Thu. A rule annotation marks the ship." },
      { label: "Issue rows", detail: "Each row is a sparkline spec. The label is page text, not a chart title." },
    ],
  };
}

const built = [ledger(), meter(), wayline(), keel()];

export function dashboards(): Dashboard[] {
  return built;
}

export function dashboardBySlug(slug: string): Dashboard | undefined {
  return built.find((board) => board.slug === slug);
}

export function dashboardMarkdown(board: Dashboard): string {
  const lines = [
    `# ${board.title}`,
    "",
    board.lede,
    "",
    "Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.",
    "",
    `Default theme: ${board.defaultTheme}.`,
    "",
  ];
  for (const item of board.charts) {
    lines.push(`## ${item.title}`, "", item.caption, "", item.note, "", "```json", JSON.stringify(item.spec, null, 2), "```", "");
  }
  for (const item of board.sparks) {
    lines.push(`## ${item.name}`, "", item.detail, "", "```json", JSON.stringify(item.spec, null, 2), "```", "");
  }
  lines.push("## Options", "");
  for (const note of board.notes) lines.push(`- **${note.label}.** ${note.detail}`);
  lines.push("", `https://chartkit.dev/dashboards/${board.slug}`, "");
  return lines.join("\n");
}
