import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";

export type DashTheme = "soft" | "midnight";

export interface DashThemes {
  soft: Record<string, unknown>;
  midnight: Record<string, unknown>;
}

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
  span: "dash-12" | "dash-8" | "dash-6" | "dash-4" | "dash-3" | "dash-2";
  spec: Record<string, unknown>;
  svg: string;
  themes: DashThemes;
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
  themes: DashThemes;
}

export interface Dashboard {
  slug: string;
  product: string;
  title: string;
  lede: string;
  disclaimer: string;
  range: string;
  defaultTheme: DashTheme;
  charts: DashChart[];
  sparks: DashSpark[];
  notes: { label: string; detail: string }[];
}

interface Ink {
  card: string;
  ink: string;
  muted: string;
  grid: string;
  axis: string;
  accent: string;
  positive: string;
  negative: string;
  series: string[];
}

interface ChartDraft {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: DashChart["span"];
  spec: Record<string, unknown>;
  themes: DashThemes;
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
  themes: DashThemes;
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

function themeOf(ink: Ink, series = ink.series, bare = false): Record<string, unknown> {
  return {
    preset: "soft",
    tokens: {
      background: "transparent",
      surface: bare ? "transparent" : ink.card,
      text: ink.ink,
      muted: ink.muted,
      grid: bare ? "transparent" : ink.grid,
      axis: ink.axis,
      accent: ink.accent,
      positive: ink.positive,
      negative: ink.negative,
      series,
    },
  };
}

function themesFor(light: Ink, dark: Ink, series?: { soft: string[]; midnight: string[] }, bare = false): DashThemes {
  return {
    soft: themeOf(light, series?.soft ?? light.series, bare),
    midnight: themeOf(dark, series?.midnight ?? dark.series, bare),
  };
}

function spec(type: string, themes: DashThemes, mode: DashTheme, body: Record<string, unknown>, alt: string): Record<string, unknown> {
  return { version: "1", type, theme: themes[mode], ...body, a11y: { alt } };
}

function disclaimer(product: string): string {
  return `Styled after ${product}'s dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by ${product}.`;
}

const ledgerMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const ledgerGross = [182000, 176000, 201000, 198000, 214000, 248000, 236000, 261000];
const ledgerPrior = [160000, 171000, 188000, 190000, 196000, 205000, 210000, 218000];

const meterDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const meterVisits = [4200, 4600, 4480, 5100, 5340, 3900, 3720];

const waylineWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const waylineNow = [18.2, 19.4, 18.8, 21.1, 22.4, 21.6, 23.8, 24.5];
const waylineThen = [16.4, 17.1, 17.8, 18.2, 18.9, 19.4, 19.1, 20.2];

const keelDays = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
const keelHours = ["00", "03", "06", "09", "12", "15", "18", "21"];

const money = { style: "compact", prefix: "$" };

function score(
  id: string,
  themes: DashThemes,
  mode: DashTheme,
  span: DashChart["span"],
  item: { label: string; value: number; delta: number; format?: unknown; goodDirection?: "down"; data?: number[]; alt: string; note: string },
): ChartDraft {
  return {
    id,
    title: item.label,
    caption: item.label,
    note: item.note,
    span,
    themes,
    spec: spec(
      "kpi",
      themes,
      mode,
      {
        data: item.data,
        metric: {
          label: item.label,
          value: item.value,
          delta: item.delta,
          format: item.format ?? "compact",
          ...(item.goodDirection ? { goodDirection: item.goodDirection } : {}),
        },
        mark: { fillOpacity: 0.16, strokeWidth: 1.5 },
        size: { width: 280, height: 132 },
      },
      item.alt,
    ),
  };
}

function ledger(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#0a2540",
    muted: "#425466",
    grid: "#e6ebf1",
    axis: "#c1c9d2",
    accent: "#635bff",
    positive: "#09825d",
    negative: "#df1b41",
    series: ["#635bff", "#8898aa"],
  };
  const dark: Ink = {
    card: "#0f2942",
    ink: "#f6f9fc",
    muted: "#adbdcc",
    grid: "#1c3f5c",
    axis: "#2c5270",
    accent: "#7a73ff",
    positive: "#0d9263",
    negative: "#ff4d6a",
    series: ["#7a73ff", "#80e9ff"],
  };
  const themes = themesFor(light, dark);
  const kpis = themesFor(light, dark, undefined, true);
  const failed = themesFor(light, dark, { soft: [light.negative], midnight: [dark.negative] });
  const volume = ledgerMonths.map((month, index) => ({ month, gross: ledgerGross[index], prior: ledgerPrior[index] }));
  const series = [
    ledgerGross.map((value) => value / 1000),
    [174, 168, 190, 188, 202, 236, 224, 248],
    [18, 16, 15, 17, 14, 13, 14, 12],
    [620, 640, 710, 690, 760, 800, 790, 840],
  ];
  const cards = [
    { label: "Gross", value: 261000, delta: 0.08, format: money, alt: "Gross volume this month is 261 thousand dollars, up 8 percent.", data: series[0] },
    { label: "Net", value: 248400, delta: 0.07, format: money, alt: "Net of fees is 248 thousand dollars, up 7 percent.", data: series[1] },
    { label: "Refunds", value: 12600, delta: -0.11, format: money, goodDirection: "down" as const, alt: "Refunds are 12.6 thousand dollars, down 11 percent.", data: series[2] },
    { label: "Accounts", value: 840, delta: 0.04, alt: "840 new accounts, up 4 percent.", data: series[3] },
  ].map((item, index) =>
    score(`ledger-kpi-${index}`, kpis, mode, "dash-4", {
      ...item,
      note: "type kpi. theme.tokens.series is the blurple spark. surface and grid are transparent so the shell card is the only card. metric.delta is the chip. goodDirection down flips the refund colour. format compact with a dollar prefix.",
    }),
  );
  return {
    slug: "ledger",
    product: "Stripe",
    title: "Stripe-style payments",
    lede: "Payments for 1–21 October.",
    disclaimer: disclaimer("Stripe"),
    range: "1–21 Oct",
    defaultTheme: mode,
    charts: [
      ...cards.map(chart),
      chart({
        id: "ledger-volume",
        title: "Gross volume",
        caption: "This period against the previous period.",
        note: "type combo. The first y series is a bar in theme.tokens.series[0]. The second is a dashed line in series[1]. axes.y.grid is solid and axes.x.grid is false, so only horizontal gridlines draw. mark.cornerRadius and mark.gap set the bar shape.",
        span: "dash-12",
        themes,
        spec: spec(
          "combo",
          themes,
          mode,
          {
            data: volume,
            encoding: {
              x: "month",
              y: [
                { field: "gross", title: "This period", mark: "bar" },
                { field: "prior", title: "Previous period", mark: "line", dash: "dashed" },
              ],
            },
            axes: { x: { grid: false }, y: { grid: true, format: money } },
            legend: { position: "top" },
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2, cornerRadius: 3, gap: 0.38 },
            size: { width: 1100, height: 280 },
          },
          "Gross volume peaks in October at 261 thousand dollars, above the previous period.",
        ),
      }),
      chart({
        id: "ledger-methods",
        title: "Payments by method",
        caption: "Card, bank, and wallet.",
        note: "type bar-list. The track and the fill use theme.tokens.series[0]. The value format is compact with a dollar prefix.",
        span: "dash-6",
        themes,
        spec: spec(
          "bar-list",
          themes,
          mode,
          {
            data: [
              { method: "Card", amount: 168400 },
              { method: "Bank", amount: 64200 },
              { method: "Wallet", amount: 28400 },
            ],
            encoding: { x: "method", y: { field: "amount", format: money } },
            size: { width: 520, height: 108 },
          },
          "Card is the largest method, then bank, then wallet.",
        ),
      }),
      chart({
        id: "ledger-failed",
        title: "Failed payments",
        caption: "Daily failures this period.",
        note: "type line. This chart's theme.tokens.series is the negative token, so the line is not the volume blurple.",
        span: "dash-6",
        themes: failed,
        spec: spec(
          "line",
          failed,
          mode,
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
            axes: { x: { grid: false }, y: { grid: true } },
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2 },
            size: { width: 520, height: 180 },
          },
          "Failed payments peak at 22 on the 15th and fall to 8 on the 21st.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Scorecards", detail: "type kpi. A number array in data is the sparkline. theme.tokens.surface and theme.tokens.grid are transparent, so the page card is the only card. metric.delta is the chip." },
      { label: "Comparison", detail: "combo puts bars and a dashed line on one x axis. series[0] is the blurple bar. series[1] is the slate or cyan comparison line. Only the y grid is on." },
      { label: "Methods", detail: "bar-list is an on-demand chart. It is not in the line or all bundle. A tinted track runs behind the label and the value sits on the right." },
      { label: "Palette", detail: "Colours are theme.tokens on each spec: blurple #635bff, navy text #0a2540, comparison #8898aa, and the negative #df1b41 for failed payments. Midnight swaps those tokens. The page CSS does not paint the marks." },
    ],
  };
}

function meter(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#111827",
    muted: "#6b7280",
    grid: "#f3f4f6",
    axis: "#e5e7eb",
    accent: "#615fff",
    positive: "#16a34a",
    negative: "#ef4444",
    series: ["#615fff"],
  };
  const dark: Ink = {
    card: "#1f2937",
    ink: "#f9fafb",
    muted: "#9ca3af",
    grid: "#374151",
    axis: "#4b5563",
    accent: "#9d99ff",
    positive: "#4ade80",
    negative: "#f87171",
    series: ["#9d99ff"],
  };
  const themes = themesFor(light, dark);
  const kpis = themesFor(light, dark, undefined, true);
  const days = meterDays.map((day, index) => ({ day, visits: meterVisits[index] }));
  const stats = [
    { label: "Visitors", value: 18420, delta: 0.04, data: [2400, 2620, 2510, 2800, 3010, 2680, 2400], alt: "Visitors are 18.4 thousand, up 4 percent." },
    { label: "Visits", value: 22140, delta: 0.05, data: meterVisits, alt: "Visits are 22.1 thousand, up 5 percent." },
    { label: "Pageviews", value: 61200, delta: 0.06, data: [8200, 9100, 8800, 10200, 10800, 7600, 6500], alt: "Pageviews are 61.2 thousand, up 6 percent." },
    { label: "Views per visit", value: 2.8, delta: 0.02, format: "number", data: [2.4, 2.5, 2.6, 2.7, 2.9, 2.6, 2.8], alt: "Views per visit are 2.8, up 2 percent." },
    { label: "Bounce", value: 0.41, delta: -0.03, format: "percent", goodDirection: "down" as const, data: [0.46, 0.44, 0.45, 0.42, 0.4, 0.41, 0.39], alt: "Bounce is 41 percent, down 3 points." },
    { label: "Duration", value: 144000, delta: 0.02, format: "duration-ms", data: [120000, 128000, 132000, 140000, 150000, 136000, 144000], alt: "Duration is 2.4 minutes, up 2 percent." },
  ].map((item, index) =>
    score(`meter-kpi-${index}`, kpis, mode, "dash-2", {
      ...item,
      note: "type kpi. Six cards share one indigo series token. Bounce uses goodDirection down. Duration uses format duration-ms.",
    }),
  );
  const list = (id: string, title: string, field: string, rows: { name: string; visits: number }[], alt: string): ChartDraft => ({
    id,
    title,
    caption: title,
    note: "type bar-list. The track is a light tint of theme.tokens.series[0]. The label sits on the track and the value is right-aligned.",
    span: "dash-3",
    themes,
    spec: spec(
      "bar-list",
      themes,
      mode,
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
    product: "Plausible",
    title: "Plausible-style analytics",
    lede: "Audience for the last 7 days.",
    disclaimer: disclaimer("Plausible"),
    range: "Last 7 days",
    defaultTheme: mode,
    charts: [
      ...stats.map(chart),
      chart({
        id: "meter-visits",
        title: "Visits",
        caption: "One series.",
        note: "type line. mark.area, mark.curve monotone, and mark.fillOpacity 0.14. legend.show is false. Both grids are off. The only colour is theme.tokens.series[0].",
        span: "dash-12",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: days,
            encoding: { x: "day", y: { field: "visits", title: "Visits" } },
            mark: { area: true, curve: "monotone", fillOpacity: 0.14, strokeWidth: 2 },
            legend: { show: false },
            axes: { x: { grid: false }, y: { grid: false, format: "compact" } },
            tooltip: { mode: "index" },
            size: { width: 1100, height: 280 },
          },
          "Visits peak on Friday at 5,340 and fall over the weekend.",
        ),
      }),
      chart(list("meter-pages", "Top pages", "page", [
        { name: "/pricing", visits: 1840 },
        { name: "/docs", visits: 1420 },
        { name: "/changelog", visits: 980 },
        { name: "/about", visits: 640 },
        { name: "/status", visits: 410 },
      ], "Pricing is the most visited page, then docs.")),
      chart(list("meter-sources", "Top sources", "source", [
        { name: "Direct", visits: 2100 },
        { name: "Search", visits: 1760 },
        { name: "Newsletter", visits: 940 },
        { name: "Referral", visits: 610 },
        { name: "Social", visits: 280 },
      ], "Direct is the largest source, then search.")),
      chart(list("meter-devices", "Devices", "device", [
        { name: "Desktop", visits: 9800 },
        { name: "Mobile", visits: 7420 },
        { name: "Tablet", visits: 1200 },
      ], "Desktop leads, then mobile.")),
    ],
    sparks: [],
    notes: [
      { label: "Stats", detail: "Six kpi specs sit in one row. Each has a delta. Bounce uses goodDirection down and format percent. Duration uses format duration-ms." },
      { label: "One accent", detail: "Every mark uses theme.tokens.series, an indigo #615fff. The area fill is mark.fillOpacity 0.14. Midnight swaps the same tokens to #9d99ff." },
      { label: "Lists", detail: "Top pages, sources, and devices are type bar-list. The chart is on demand from @chartkitdev/core/charts/bar-list and is not part of the line or all bundle." },
    ],
  };
}

function wayline(): Dashboard {
  const mode: DashTheme = "soft";
  const channels = {
    soft: ["#1a73e8", "#12b5cb", "#e8710a", "#e52592", "#9334e6"],
    midnight: ["#8ab4f8", "#78d9ec", "#fcad70", "#f48fb1", "#d7aefb"],
  };
  const light: Ink = {
    card: "#ffffff",
    ink: "#202124",
    muted: "#5f6368",
    grid: "#e8eaed",
    axis: "#dadce0",
    accent: "#1a73e8",
    positive: "#188038",
    negative: "#d93025",
    series: ["#1a73e8", "#9aa0a6"],
  };
  const dark: Ink = {
    card: "#292a2d",
    ink: "#e8eaed",
    muted: "#9aa0a6",
    grid: "#3c4043",
    axis: "#5f6368",
    accent: "#8ab4f8",
    positive: "#81c995",
    negative: "#f28b82",
    series: ["#8ab4f8", "#9aa0a6"],
  };
  const themes = themesFor(light, dark);
  const kpis = themesFor(light, dark, undefined, true);
  const donutThemes = themesFor(light, dark, channels);
  const barThemes = themesFor(light, dark, { soft: [light.accent], midnight: [dark.accent] });
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
  const ramp = ["#aecbfa", "#669df6", "#1a73e8"];
  const scores = [
    { label: "Sessions", value: 24500, delta: 0.06, format: "compact", data: waylineNow, alt: "Sessions this week are 24.5 thousand, up 6 percent." },
    { label: "Engaged", value: 11200, delta: 0.03, format: "compact", data: [8.1, 8.4, 8.2, 9.4, 10.1, 9.8, 10.6, 11.2], alt: "Engaged sessions are 11.2 thousand, up 3 percent." },
    { label: "Bounce rate", value: 0.38, delta: -0.02, format: "percent", goodDirection: "down" as const, data: [0.44, 0.42, 0.43, 0.41, 0.4, 0.39, 0.38, 0.38], alt: "Bounce rate is 38 percent, down 2 points." },
    { label: "Minutes", value: 3.4, delta: 0.05, format: "number", data: [2.8, 2.9, 3.0, 3.1, 3.2, 3.1, 3.3, 3.4], alt: "Average minutes are 3.4, up 5 percent." },
  ].map((item, index) =>
    score(`wayline-kpi-${index}`, kpis, mode, "dash-4", {
      ...item,
      note: "type kpi. The spark uses the blue series token. Bounce rate uses format percent and goodDirection down.",
    }),
  );
  return {
    slug: "wayline",
    product: "Google Analytics",
    title: "Google Analytics-style traffic report",
    lede: "Acquisition for the last 8 weeks.",
    disclaimer: disclaimer("Google Analytics"),
    range: "Last 8 weeks",
    defaultTheme: mode,
    charts: [
      ...scores.map(chart),
      chart({
        id: "wayline-sessions",
        title: "Sessions",
        caption: "This period and the previous period.",
        note: "type line. series[0] is solid blue. series[1] is a dashed gray comparison. axes.y.grid is on and axes.x.grid is off. legend.position is top.",
        span: "dash-8",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: weeks,
            encoding: {
              x: "week",
              y: [
                { field: "now", title: "This period" },
                { field: "then", title: "Previous period", dash: "dashed" },
              ],
            },
            axes: { x: { grid: false }, y: { grid: true } },
            legend: { position: "top" },
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2.25 },
            size: { width: 720, height: 320 },
          },
          "Sessions rise from 18.2 to 24.5 thousand, staying above the previous period.",
        ),
      }),
      chart({
        id: "wayline-channels",
        title: "Channels",
        caption: "Share of sessions.",
        note: "type donut. This chart's theme.tokens.series is the five channel colours, so the slices do not use a page CSS variable. legend.values prints the share and the session count. The y channel is Sessions with format compact, so the centre is the total.",
        span: "dash-3",
        themes: donutThemes,
        spec: spec(
          "donut",
          donutThemes,
          mode,
          {
            data: channelRows,
            encoding: {
              x: "channel",
              y: { field: "sessions", title: "Sessions", format: "compact" },
            },
            legend: { values: true },
            size: { width: 400, height: 430 },
          },
          "Search is 10.3 thousand sessions. The centre total is 24.5 thousand.",
        ),
      }),
      chart({
        id: "wayline-countries",
        title: "Countries",
        caption: "Sessions by country.",
        note: "The list is type bar in the blue series token. The map is type choropleth. encoding.color.range is the blue ramp #aecbfa to #1a73e8. The map theme is the string soft or midnight because a token object does not change water, land, or legend text.",
        span: "dash-12",
        themes: barThemes,
        table: {
          title: "Top countries",
          columns: ["Country", "Sessions"],
          rows: countries.map((row) => [row.country, row.sessions.toLocaleString("en-GB")]),
        },
        mapSpec: {
          version: "1",
          type: "choropleth",
          theme: mode,
          data: countries.map((row) => ({ country: row.code, sessions: row.sessions })),
          encoding: {
            region: "country",
            color: { field: "sessions", title: "Sessions", format: "compact", range: ramp },
          },
          mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
          size: { width: 720, height: 340 },
          a11y: { alt: "Japan has the most sessions, then Portugal. Countries without a row are hatched." },
        },
        spec: spec(
          "bar",
          barThemes,
          mode,
          {
            data: countries.map((row) => ({ country: row.country, sessions: row.sessions })),
            encoding: { x: "country", y: { field: "sessions", format: "compact" } },
            mark: { orientation: "horizontal", cornerRadius: 2 },
            legend: { show: false },
            axes: { x: { grid: false }, y: { grid: true } },
            size: { width: 640, height: 260 },
          },
          "Japan has the most sessions, then Portugal.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Scorecards", detail: "Each kpi includes data, so the sparkline is in the card. The spark colour is the blue series token." },
      { label: "Comparison", detail: "The sessions line uses #1a73e8 for this period and a dashed #9aa0a6 for the previous period. Midnight uses #8ab4f8 for this period." },
      { label: "Donut", detail: "theme.tokens.series is Search blue, Direct teal, Mail orange, Social pink, and Referral purple. legend.values prints the share and the session count under the ring." },
      { label: "Countries", detail: "The bar uses the blue series token. The map toggle renders a choropleth whose sequential ramp is encoding.color.range. Geo loads on demand." },
    ],
  };
}

function keelLevels(days: string[], counts: number[][]): Record<string, string | number>[] {
  const levels = ["Error", "Warning", "Info"];
  return days.flatMap((day, index) => levels.map((level, levelIndex) => ({ day, level, events: counts[index]?.[levelIndex] ?? 0 })));
}

function keel(): Dashboard {
  const mode: DashTheme = "midnight";
  const levels = {
    soft: ["#f55459", "#ff9838", "#8d95a3"],
    midnight: ["#fa6769", "#ff9838", "#a4a8b4"],
  };
  const response = {
    soft: ["#7553ff", "#ff9838"],
    midnight: ["#7b52ff", "#ffb15a"],
  };
  const light: Ink = {
    card: "#ffffff",
    ink: "#1f1633",
    muted: "#6a6275",
    grid: "#eeeaf2",
    axis: "#ddd6e6",
    accent: "#7553ff",
    positive: "#1b7c4d",
    negative: "#f55459",
    series: levels.soft,
  };
  const dark: Ink = {
    card: "#241f33",
    ink: "#eeeaf6",
    muted: "#a39bb0",
    grid: "#322b42",
    axis: "#3d3550",
    accent: "#7b52ff",
    positive: "#6dcea0",
    negative: "#fa6769",
    series: levels.midnight,
  };
  const themes = themesFor(light, dark, levels);
  const calm = themesFor(light, dark, response);
  const bars = themesFor(light, dark, { soft: ["#7553ff"], midnight: ["#7b52ff"] });
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
    Error: counts14[index]?.[0] ?? 0,
    Warning: counts14[index]?.[1] ?? 0,
    Info: counts14[index]?.[2] ?? 0,
  }));
  const band = [
    { type: "band", axis: "x", from: "15", to: "16", label: "2.4", opacity: 0.16, color: "text" },
    { type: "rule", axis: "x", value: "16", label: "Ship", labelPosition: "end", dash: "solid", color: "muted" },
  ];
  const bars14 = spec(
    "bar",
    themes,
    mode,
    {
      data: keelLevels(keelDays, counts14),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack", cornerRadius: 2, gap: 0.28 },
      axes: { x: { grid: false }, y: { grid: true } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      annotations: band,
      size: { width: 1100, height: 280 },
    },
    "Errors peak on the 16th, inside the 2.4 window.",
  );
  const bars24 = spec(
    "bar",
    themes,
    mode,
    {
      data: keelLevels(keelHours, counts24),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack", cornerRadius: 2, gap: 0.28 },
      axes: { x: { grid: false }, y: { grid: true } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 1100, height: 280 },
    },
    "Errors peak at noon in the last 24 hours.",
  );
  const area = spec(
    "stacked-area",
    themes,
    mode,
    {
      data: areaRows,
      encoding: {
        x: "day",
        y: [
          { field: "Error", title: "Error" },
          { field: "Warning", title: "Warning" },
          { field: "Info", title: "Info" },
        ],
      },
      mark: { fillOpacity: 0.85 },
      axes: { x: { grid: false }, y: { grid: true } },
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
    { name: "Checkout timeout", level: "Error", users: 6 },
    { name: "Map tile retry", level: "Warning", users: 4 },
    { name: "Queue lag", level: "Info", users: 11 },
    { name: "Auth clock skew", level: "Error", users: 3 },
  ];
  return {
    slug: "keel",
    product: "Sentry",
    title: "Sentry-style issues",
    lede: "Issues for the last 14 days.",
    disclaimer: disclaimer("Sentry"),
    range: "14 days",
    defaultTheme: mode,
    charts: [
      chart({
        id: "keel-volume",
        title: "Event volume",
        caption: "Error, warning, and info.",
        note: "type bar with encoding.series and mark.stack stack. theme.tokens.series is error #fa6769, warning #ff9838, and info #a4a8b4 in the dark tokens. The 24h variant is the same bar. The area variant is type stacked-area. Ship uses labelPosition end, so the label sits above the plot.",
        span: "dash-12",
        themes,
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
        note: "type line. This chart's theme.tokens.series is purple for p50 and the warning colour for p95, separate from the error series.",
        span: "dash-12",
        themes: calm,
        spec: spec(
          "line",
          calm,
          mode,
          {
            data: hours.map((hour, index) => ({ hour, p50: latency[0]?.[index], p95: latency[1]?.[index] })),
            encoding: {
              x: "hour",
              y: [
                { field: "p50", title: "p50" },
                { field: "p95", title: "p95" },
              ],
            },
            axes: { x: { grid: false }, y: { grid: true } },
            legend: { position: "top" },
            tooltip: { mode: "index" },
            mark: { strokeWidth: 2 },
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
        themes: bars,
        spec: spec(
          "bar",
          bars,
          mode,
          {
            data: series.map((value, day) => ({ day: String(day + 1), events: value })),
            encoding: { x: "day", y: "events" },
            mark: { cornerRadius: 1, gap: 0.2 },
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
      { label: "Dark first", detail: "The spec theme defaults to the dark token object: page-adjacent card #241f33, ink #eeeaf6, error #fa6769, warning #ff9838, info #a4a8b4, accent #7b52ff. Soft swaps those tokens." },
      { label: "Release band", detail: "The band colour is the text token, so the 2.4 label is not the error red. Ship uses labelPosition end and the muted token, above the plot." },
      { label: "Response", detail: "p50 uses the purple accent and p95 the warning colour, on that chart's theme.tokens.series." },
      { label: "Issues", detail: "Each row is a bar spec with both axes off and the purple series token, so the seven days read as a histogram. The event count and the user count sit on the right." },
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
    board.disclaimer,
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
