import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";

export type DashTheme = "soft" | "midnight";

export interface DashVariant {
  id: string;
  label: string;
  spec: Record<string, unknown>;
  svg: string;
}

export interface DashTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface DashChart {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: "dash-12" | "dash-8" | "dash-6" | "dash-4" | "dash-3";
  spec: Record<string, unknown>;
  svg: string;
  variants?: DashVariant[];
  mapSpec?: Record<string, unknown>;
  table?: DashTable;
  cardClass?: string;
}

export interface DashSpark {
  id: string;
  name: string;
  detail: string;
  events: number;
  users: number;
  spec: Record<string, unknown>;
  svg: string;
}

export interface Dashboard {
  slug: string;
  product: string;
  title: string;
  lede: string;
  range: string;
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
  variants?: { id: string; label: string; spec: Record<string, unknown> }[];
  mapSpec?: Record<string, unknown>;
  table?: DashTable;
  cardClass?: string;
}

interface SparkDraft {
  id: string;
  name: string;
  detail: string;
  events: number;
  users: number;
  spec: Record<string, unknown>;
}

function draw(spec: Record<string, unknown>): string {
  const type = typeof spec.type === "string" ? spec.type : "";
  const checked = validate(spec);
  if (!checked.ok) {
    throw new Error(`${type} ${checked.errors.map((error) => `${error.code} ${error.path} ${error.message}`).join("; ")}`);
  }
  const svg = type === "bar-list" ? renderBarList(spec) : isExtra(type) ? renderExtra(spec as never) : renderCore(spec as never);
  if (!svg || !svg.includes("<svg") || svg.includes("ck-chart-error")) throw new Error(`${type} did not draw`);
  return svg;
}

function chart(draft: ChartDraft): DashChart {
  const variants = draft.variants?.map((item) => ({ ...item, svg: draw(item.spec) }));
  return { ...draft, svg: draw(draft.spec), variants };
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

const keelDays = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const keelHours = ["00", "03", "06", "09", "12", "15", "18", "21"];

function score(
  id: string,
  theme: DashTheme,
  item: { label: string; value: number; delta: number; format?: string; goodDirection?: "down"; data?: number[]; alt: string; note: string },
): ChartDraft {
  return {
    id,
    title: item.label,
    caption: item.label,
    note: item.note,
    span: "dash-4",
    spec: spec(
      "kpi",
      theme,
      {
        data: item.data,
        metric: {
          label: item.label,
          value: item.value,
          delta: item.delta,
          format: item.format ?? "compact",
          ...(item.goodDirection ? { goodDirection: item.goodDirection } : {}),
        },
        mark: { fillOpacity: 0.14, strokeWidth: 1.25 },
        size: { width: 280, height: 132 },
      },
      item.alt,
    ),
  };
}

function ledger(): Dashboard {
  const theme: DashTheme = "soft";
  const volume = ledgerMonths.map((month, index) => ({ month, gross: ledgerGross[index], prior: ledgerPrior[index] }));
  const series = [
    ledgerGross,
    [174, 168, 190, 188, 202, 236, 224, 248],
    [18, 16, 15, 17, 14, 13, 14, 12],
    [620, 640, 710, 690, 760, 800, 790, 840],
  ];
  const kpis = [
    { label: "Gross", value: 261000, delta: 0.08, alt: "Gross volume this month is 261 thousand dollars, up 8 percent.", data: series[0] },
    { label: "Net", value: 248400, delta: 0.07, alt: "Net of fees is 248 thousand dollars, up 7 percent.", data: series[1] },
    { label: "Refunds", value: 12600, delta: -0.11, goodDirection: "down" as const, alt: "Refunds are 12.6 thousand dollars, down 11 percent.", data: series[2] },
    { label: "Accounts", value: 840, delta: 0.04, alt: "840 new accounts, up 4 percent.", data: series[3] },
  ].map((item, index) =>
    score(`ledger-kpi-${index}`, theme, {
      ...item,
      note: "type kpi. data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep it a thin line with a light fill. metric.delta is the chip. goodDirection down flips the refund colour.",
    }),
  );
  return {
    slug: "ledger",
    product: "Harbor Ledger",
    title: "Harbor Ledger",
    lede: "Payments for 1–21 October.",
    range: "1–21 Oct",
    defaultTheme: theme,
    charts: [
      ...kpis.map(chart),
      chart({
        id: "ledger-volume",
        title: "Gross volume",
        caption: "This period against the prior period.",
        note: "type combo. The first y series is mark area with a light fill from --ck-area-opacity. The second is mark line and dash dashed, in a contrasting token. tooltip.mode index.",
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
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2.25 },
            size: { width: 1100, height: 280 },
          },
          "Gross volume peaks in October at 261 thousand, above the prior period.",
        ),
      }),
      chart({
        id: "ledger-methods",
        title: "Payments by method",
        caption: "Card, bank, and wallet.",
        note: "type bar-list, loaded from @chartkitdev/core/charts/bar-list. No axes. A tinted track sits behind the label and the value is right-aligned.",
        span: "dash-6",
        spec: spec(
          "bar-list",
          theme,
          {
            data: [
              { method: "Card", amount: 168400 },
              { method: "Bank", amount: 64200 },
              { method: "Wallet", amount: 28400 },
            ],
            encoding: { x: "method", y: { field: "amount", format: "compact" } },
            size: { width: 520, height: 108 },
          },
          "Card is the largest method, then bank, then wallet.",
        ),
      }),
      chart({
        id: "ledger-failed",
        title: "Failed payments",
        caption: "Daily failures this period.",
        note: "type line. The card overrides --ck-series-1 with a warning colour so failures are not the indigo volume series.",
        span: "dash-6",
        cardClass: "dash-alert",
        spec: spec(
          "line",
          theme,
          {
            data: [
              { day: "14", failed: 18 },
              { day: "15", failed: 22 },
              { day: "16", failed: 16 },
              { day: "17", failed: 14 },
              { day: "18", failed: 19 },
              { day: "19", failed: 11 },
              { day: "20", failed: 9 },
              { day: "21", failed: 8 },
            ],
            encoding: { x: "day", y: { field: "failed", title: "Failed" } },
            legend: { show: false },
            axes: { x: { title: "October" }, y: { title: "Failed" } },
            tooltip: { mode: "index" },
            size: { width: 520, height: 180 },
          },
          "Failed payments peak at 22 on the 15th and fall to 8 on the 21st.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Scorecards", detail: "type kpi. A number array in data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep the line thin and the fill light. metric.delta is the chip." },
      { label: "Comparison", detail: "combo puts an area and a dashed line on one x axis. The prior series uses a warm second token so the dash stays visible on the area." },
      { label: "Methods", detail: "bar-list is an on-demand chart. It is not in the line or all bundle. A tinted track runs behind the label and the value sits on the right." },
      { label: "Tokens", detail: "The page sets --ck-series-1 and --ck-series-2 from --dash-series-*. Soft and Midnight swap those variables. The accent is an indigo chosen for this page." },
    ],
  };
}

function meter(): Dashboard {
  const theme: DashTheme = "soft";
  const days = meterDays.map((day, index) => ({ day, visits: meterVisits[index] }));
  const stats = [
    { label: "Visitors", value: 18420, delta: 0.04, data: [2400, 2620, 2510, 2800, 3010, 2680, 2400], alt: "Visitors are 18.4 thousand, up 4 percent." },
    { label: "Pageviews", value: 61200, delta: 0.06, data: meterVisits, alt: "Pageviews are 61.2 thousand, up 6 percent." },
    { label: "Bounce", value: 0.41, delta: -0.03, format: "percent", goodDirection: "down" as const, data: [0.46, 0.44, 0.45, 0.42, 0.4, 0.41, 0.39], alt: "Bounce is 41 percent, down 3 points." },
    { label: "Duration", value: 2.4, delta: 0.02, format: "number", data: [2.1, 2.2, 2.0, 2.4, 2.6, 2.3, 2.4], alt: "Duration is 2.4 minutes, up 2 percent." },
  ].map((item, index) =>
    score(`meter-kpi-${index}`, theme, {
      ...item,
      note: "type kpi above the chart. metric.delta is the change. Bounce uses goodDirection down.",
    }),
  );
  const list = (id: string, title: string, field: string, rows: { name: string; visits: number }[], alt: string): ChartDraft => ({
    id,
    title,
    caption: title,
    note: "type bar-list. No axes. The track is a light tint of the series token, the label sits on it, and the value is right-aligned.",
    span: "dash-3",
    spec: spec(
      "bar-list",
      theme,
      {
        data: rows.map((row) => ({ [field]: row.name, visits: row.visits })),
        encoding: { x: field, y: { field: "visits", format: "compact" } },
        size: { width: 360, height: rows.length * 28 + 12 },
      },
      alt,
    ),
  });
  return {
    slug: "meter",
    product: "Quiet Meter",
    title: "Quiet Meter",
    lede: "Audience for the last 7 days.",
    range: "Last 7 days",
    defaultTheme: theme,
    charts: [
      ...stats.map(chart),
      chart({
        id: "meter-visits",
        title: "Visits",
        caption: "One series.",
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
            tooltip: { mode: "index" },
            size: { width: 1100, height: 280 },
          },
          "Visits peak on Friday at 5,340 and fall over the weekend.",
        ),
      }),
      list("meter-pages", "Top pages", "page", [
        { name: "/pricing", visits: 1840 },
        { name: "/docs", visits: 1420 },
        { name: "/changelog", visits: 980 },
        { name: "/about", visits: 640 },
        { name: "/status", visits: 410 },
      ], "Pricing is the most visited page, then docs."),
      list("meter-sources", "Top sources", "source", [
        { name: "Direct", visits: 2100 },
        { name: "Search", visits: 1760 },
        { name: "Newsletter", visits: 940 },
        { name: "Referral", visits: 610 },
        { name: "Social", visits: 280 },
      ], "Direct is the largest source, then search."),
      list("meter-devices", "Devices", "device", [
        { name: "Desktop", visits: 9800 },
        { name: "Mobile", visits: 7420 },
        { name: "Tablet", visits: 1200 },
      ], "Desktop leads, then mobile."),
    ],
    sparks: [],
    notes: [
      { label: "Stats", detail: "Four kpi specs sit above the chart. Each has a delta. Bounce uses goodDirection down and format percent." },
      { label: "One accent", detail: "Every mark uses --ck-series-1. The page does not set a range." },
      { label: "Lists", detail: "Top pages, sources, and devices are type bar-list. The chart is on demand from @chartkitdev/core/charts/bar-list and is not part of the line or all bundle." },
    ],
  };
}

function wayline(): Dashboard {
  const theme: DashTheme = "soft";
  const weeks = waylineWeeks.map((week, index) => ({ week, now: waylineNow[index], then: waylineThen[index] }));
  const channelRows = [
    { channel: "Search", sessions: 10290 },
    { channel: "Direct", sessions: 5880 },
    { channel: "Mail", sessions: 3920 },
    { channel: "Social", sessions: 2695 },
    { channel: "Referral", sessions: 1715 },
  ];
  const countries = [
    { code: "JPN", country: "Japan", sessions: 6200 },
    { code: "PRT", country: "Portugal", sessions: 4100 },
    { code: "CHL", country: "Chile", sessions: 2800 },
    { code: "KEN", country: "Kenya", sessions: 1900 },
    { code: "CAN", country: "Canada", sessions: 1600 },
  ];
  const scores = [
    { label: "Sessions", value: 24500, delta: 0.06, format: "compact", data: waylineNow, alt: "Sessions this week are 24.5 thousand, up 6 percent." },
    { label: "Engaged", value: 11200, delta: 0.03, format: "compact", data: [8.1, 8.4, 8.2, 9.4, 10.1, 9.8, 10.6, 11.2], alt: "Engaged sessions are 11.2 thousand, up 3 percent." },
    { label: "Bounce rate", value: 0.38, delta: -0.02, format: "percent", goodDirection: "down" as const, data: [0.44, 0.42, 0.43, 0.41, 0.4, 0.39, 0.38, 0.38], alt: "Bounce rate is 38 percent, down 2 points." },
    { label: "Minutes", value: 3.4, delta: 0.05, format: "number", data: [2.8, 2.9, 3.0, 3.1, 3.2, 3.1, 3.3, 3.4], alt: "Average minutes are 3.4, up 5 percent." },
  ].map((item, index) =>
    score(`wayline-kpi-${index}`, theme, {
      ...item,
      note: "type kpi with data for the sparkline. Bounce rate uses format percent and goodDirection down.",
    }),
  );
  return {
    slug: "wayline",
    product: "Wayline",
    title: "Wayline",
    lede: "Acquisition for the last 8 weeks.",
    range: "Last 8 weeks",
    defaultTheme: theme,
    charts: [
      ...scores.map(chart),
      chart({
        id: "wayline-sessions",
        title: "Sessions",
        caption: "This period and the prior period.",
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
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2.25 },
            size: { width: 720, height: 320 },
          },
          "Sessions rise from 18.2 to 24.5 thousand, staying above the prior period.",
        ),
      }),
      chart({
        id: "wayline-channels",
        title: "Channels",
        caption: "Share of sessions.",
        note: "type donut. encoding.y is titled Sessions and formatted compact, so the centre is the total sessions. legend.values prints the share and the session count under the ring. color.range is var(--ck-wayline-1) through var(--ck-wayline-5).",
        span: "dash-3",
        spec: spec(
          "donut",
          theme,
          {
            data: channelRows,
            encoding: {
              x: "channel",
              y: { field: "sessions", title: "Sessions", format: "compact" },
              color: {
                field: "channel",
                range: ["var(--ck-wayline-1)", "var(--ck-wayline-2)", "var(--ck-wayline-3)", "var(--ck-wayline-4)", "var(--ck-wayline-5)"],
              },
            },
            legend: { values: true },
            size: { width: 420, height: 400 },
          },
          "Search is 10.3 thousand sessions. The centre total is 24.5 thousand.",
        ),
      }),
      chart({
        id: "wayline-countries",
        title: "Countries",
        caption: "Sessions by country.",
        note: "The list is type bar. The map toggle is type choropleth from @chartkitdev/geo, mark.atlas world, encoding.region set to the ISO code. Geo is on demand and is not in the line or all bundle.",
        span: "dash-12",
        table: {
          title: "Top countries",
          columns: ["Country", "Sessions"],
          rows: countries.map((row) => [row.country, row.sessions.toLocaleString("en-GB")]),
        },
        mapSpec: spec(
          "choropleth",
          theme,
          {
            data: countries.map((row) => ({ country: row.code, sessions: row.sessions })),
            encoding: { region: "country", color: { field: "sessions", title: "Sessions", format: "compact" } },
            mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
            legend: { position: "bottom" },
            size: { width: 720, height: 340 },
          },
          "Japan has the most sessions, then Portugal. Countries without a row are hatched.",
        ),
        spec: spec(
          "bar",
          theme,
          {
            data: countries.map((row) => ({ country: row.country, sessions: row.sessions })),
            encoding: { x: "country", y: { field: "sessions", format: "compact" } },
            mark: { orientation: "horizontal" },
            legend: { show: false },
            axes: { x: { title: "Country" }, y: { title: "Sessions" } },
            size: { width: 640, height: 260 },
          },
          "Japan has the most sessions, then Portugal.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Scorecards", detail: "Each kpi includes data, so the sparkline is in the card. Bounce rate replaces the old Brief label." },
      { label: "Donut", detail: "The y channel is Sessions with format compact. The hole shows that total. legend.values prints the share and the session count under the ring." },
      { label: "Countries", detail: "The bar sits beside a table. The map toggle renders a choropleth with @chartkitdev/geo, which loads on demand." },
    ],
  };
}

function keelLevels(days: string[], counts: number[][]): Record<string, string | number>[] {
  const levels = ["Fault", "Warn", "Note"];
  return days.flatMap((day, index) => levels.map((level, levelIndex) => ({ day, level, events: counts[index]?.[levelIndex] ?? 0 })));
}

function keel(): Dashboard {
  const theme: DashTheme = "midnight";
  const counts14 = [
    [22, 14, 12],
    [28, 16, 14],
    [24, 18, 11],
    [30, 15, 13],
    [26, 17, 16],
    [18, 12, 10],
    [16, 9, 8],
    [40, 22, 18],
    [52, 30, 16],
    [44, 28, 22],
    [33, 20, 24],
    [21, 14, 15],
    [18, 12, 14],
    [16, 11, 13],
  ];
  const counts24 = [
    [6, 3, 2],
    [4, 2, 2],
    [5, 3, 1],
    [8, 4, 3],
    [14, 7, 4],
    [11, 6, 3],
    [7, 4, 2],
    [4, 2, 2],
  ];
  const areaRows = keelDays.map((day, index) => ({
    day,
    Fault: counts14[index]?.[0] ?? 0,
    Warn: counts14[index]?.[1] ?? 0,
    Note: counts14[index]?.[2] ?? 0,
  }));
  const band = [
    { type: "band", axis: "x", from: "15", to: "16", label: "Keel 2.4", opacity: 0.16, color: "text" },
    { type: "rule", axis: "x", value: "16", label: "Ship", labelPosition: "start", dash: "solid", color: "muted" },
  ];
  const bars14 = spec(
    "bar",
    theme,
    {
      data: keelLevels(keelDays, counts14),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack" },
      axes: { x: { title: "October" }, y: { title: "Events" } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      annotations: band,
      size: { width: 1100, height: 280 },
    },
    "Faults peak on the 16th, inside the Keel 2.4 window.",
  );
  const bars24 = spec(
    "bar",
    theme,
    {
      data: keelLevels(keelHours, counts24),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack" },
      axes: { x: { title: "Hour" }, y: { title: "Events" } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 1100, height: 280 },
    },
    "Faults peak at noon in the last 24 hours.",
  );
  const area = spec(
    "stacked-area",
    theme,
    {
      data: areaRows,
      encoding: {
        x: "day",
        y: [
          { field: "Fault", title: "Fault" },
          { field: "Warn", title: "Warn" },
          { field: "Note", title: "Note" },
        ],
      },
      axes: { x: { title: "October" }, y: { title: "Events" } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 1100, height: 280 },
    },
    "The stacked area shows the same 14 days as the bars.",
  );
  const hours = ["00", "04", "08", "12", "16", "20"];
  const latency = [
    [80, 90, 110, 140, 120, 95],
    [210, 240, 320, 410, 360, 250],
  ];
  const issueSeries = [
    [2, 4, 9, 6, 3, 2, 1],
    [1, 1, 2, 5, 4, 2, 2],
    [6, 5, 4, 4, 3, 3, 2],
    [0, 1, 1, 8, 3, 1, 0],
  ];
  const issueNames: { name: string; level: string; users: number }[] = [
    { name: "Checkout timeout", level: "Fault", users: 6 },
    { name: "Map tile retry", level: "Warn", users: 4 },
    { name: "Queue lag", level: "Note", users: 11 },
    { name: "Auth clock skew", level: "Fault", users: 3 },
  ];
  return {
    slug: "keel",
    product: "Keel",
    title: "Keel",
    lede: "Issues for the last 14 days.",
    range: "14 days",
    defaultTheme: theme,
    charts: [
      chart({
        id: "keel-volume",
        title: "Event volume",
        caption: "Fault, warn, and note.",
        note: "type bar with encoding.series and mark.stack stack. The 24h variant is the same bar over eight hours. The area variant is type stacked-area. The release band uses color text so the label is not the fault red, and the Ship rule uses labelPosition start so it sits at the bottom of the line.",
        span: "dash-12",
        spec: bars14,
        variants: [
          { id: "14d", label: "14d", spec: bars14 },
          { id: "24h", label: "24h", spec: bars24 },
          { id: "area", label: "Area", spec: area },
        ],
      }),
      chart({
        id: "keel-latency",
        title: "Response",
        caption: "p50 and p95.",
        note: "type line. The card sets --ck-series-1 to a calm colour and --ck-series-2 to a warning colour, so p50 does not use the fault red.",
        span: "dash-12",
        cardClass: "dash-calm",
        spec: spec(
          "line",
          theme,
          {
            data: hours.map((hour, index) => ({ hour, p50: latency[0]?.[index], p95: latency[1]?.[index] })),
            encoding: {
              x: "hour",
              y: [
                { field: "p50", title: "p50" },
                { field: "p95", title: "p95" },
              ],
            },
            axes: { x: { title: "Hour" }, y: { title: "Milliseconds" } },
            legend: { position: "top" },
            tooltip: { mode: "index" },
            size: { width: 1100, height: 240 },
          },
          "p95 peaks at 410 milliseconds at noon. p50 stays under 140.",
        ),
      }),
    ],
    sparks: issueNames.map((item, index) => {
      const series = issueSeries[index] ?? [];
      const events = series.reduce((sum, value) => sum + value, 0);
      return spark({
        id: `keel-issue-${index}`,
        name: item.name,
        detail: item.level,
        events,
        users: item.users,
        spec: spec(
          "bar",
          theme,
          {
            data: series.map((value, day) => ({ day: String(day + 1), events: value })),
            encoding: { x: "day", y: "events" },
            axes: { x: false, y: false },
            legend: { show: false },
            tooltip: { mode: "index" },
            size: { width: 220, height: 72 },
          },
          `${item.name} over seven days.`,
        ),
      });
    }),
    notes: [
      { label: "Dark first", detail: "The spec theme defaults to midnight, and the page shell, header, and footer follow that theme. Soft still renders from the toggle." },
      { label: "Release band", detail: "The band colour is the text token, so the Keel 2.4 label is not red on the fault series. Ship uses labelPosition start and the muted token, at the bottom of the line." },
      { label: "Response", detail: "p50 uses a calm colour and p95 a warning colour, set on that card's tokens rather than the fault series." },
      { label: "Issues", detail: "Each row is a bar spec with both axes off, so the seven days read as a histogram. The event count and the user count sit on the right." },
      { label: "Window", detail: "14d is the stacked bar. 24h is the same bar over eight hours. Area is a stacked-area of the 14 days." },
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
    `Range: ${board.range}.`,
    "",
    "Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.",
    "",
    `Default theme: ${board.defaultTheme}.`,
    "",
  ];
  for (const item of board.charts) {
    lines.push(`## ${item.title}`, "", item.caption, "", item.note, "", "```json", JSON.stringify(item.spec, null, 2), "```", "");
    for (const variant of item.variants ?? []) {
      if (variant.spec === item.spec) continue;
      lines.push(`### ${variant.label}`, "", "```json", JSON.stringify(variant.spec, null, 2), "```", "");
    }
    if (item.mapSpec) lines.push("### Map", "", "```json", JSON.stringify(item.mapSpec, null, 2), "```", "");
  }
  for (const item of board.sparks) {
    lines.push(`## ${item.name}`, "", `${item.detail}. ${item.events} events, ${item.users} users.`, "", "```json", JSON.stringify(item.spec, null, 2), "```", "");
  }
  lines.push("## What produces this look", "");
  for (const note of board.notes) lines.push(`- **${note.label}.** ${note.detail}`);
  lines.push("", `https://chartkit.dev/dashboards/${board.slug}`, "");
  return lines.join("\n");
}
