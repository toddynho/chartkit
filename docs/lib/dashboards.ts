import { round2 } from "./dashboards-round2.ts";
import { formatValue, isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";

export type DashTheme = "soft" | "midnight";
export type DashPlace = "metric" | "hero" | "side" | "tab" | "list" | "map" | "realtime" | "hbar" | "activity" | "cohort";

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

export interface DashChart {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: "dash-12" | "dash-8" | "dash-6" | "dash-4" | "dash-3" | "dash-2";
  place: DashPlace;
  spec: Record<string, unknown>;
  svg: string;
  themes: DashThemes;
  variants?: DashVariant[];
  svgs?: { soft: string; midnight: string };
  /** Same rows drawn at phone width so the type stays readable. */
  phone?: { soft: string; midnight: string };
  themed?: DashThemes;
  tab?: { label: string; value: string; delta: string; good: boolean };
  cardClass?: string;
}

export interface DashSpark {
  id: string;
  name: string;
  detail: string;
  seen: string;
  age: string;
  events: number;
  users: number;
  tags: string[];
  priority: string;
  assignee: string;
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
  headline?: { label: string; value: string; delta: string; good: boolean };
  charts: DashChart[];
  sparks: DashSpark[];
  notes: { label: string; detail: string }[];
}

export interface Ink {
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

export interface ChartDraft {
  id: string;
  title: string;
  caption: string;
  note: string;
  span: DashChart["span"];
  place: DashPlace;
  spec: Record<string, unknown>;
  themes: DashThemes;
  variants?: { id: string; label: string; spec: Record<string, unknown> }[];
  themed?: DashThemes;
  tab?: DashChart["tab"];
  cardClass?: string;
}

interface SparkDraft {
  id: string;
  name: string;
  detail: string;
  seen: string;
  age: string;
  events: number;
  users: number;
  tags: string[];
  priority: string;
  assignee: string;
  spec: Record<string, unknown>;
  themes: DashThemes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function chart(draft: ChartDraft): DashChart {
  if (draft.spec.type === "choropleth" || draft.spec.type === "map-points") {
    return { ...draft, svg: "", variants: draft.variants?.map((item) => ({ ...item, svg: "" })) };
  }
  const variants = draft.variants?.map((item) => ({ ...item, svg: draw(item.spec) }));
  if (draft.spec.type === "bar-list") {
    const size = isRecord(draft.spec.size) ? draft.spec.size : {};
    const height = typeof size.height === "number" ? size.height : 180;
    const phoneSpec = { ...draft.spec, size: { ...size, width: 340, height } };
    const svgs = {
      soft: draw({ ...draft.spec, theme: draft.themes.soft }),
      midnight: draw({ ...draft.spec, theme: draft.themes.midnight }),
    };
    const phone = {
      soft: draw({ ...phoneSpec, theme: draft.themes.soft }),
      midnight: draw({ ...phoneSpec, theme: draft.themes.midnight }),
    };
    return { ...draft, svg: svgs.soft, svgs, phone, variants };
  }
  return { ...draft, svg: draw(draft.spec), variants };
}

function spark(draft: SparkDraft): DashSpark {
  return { ...draft, svg: draw(draft.spec) };
}

export function themeOf(ink: Ink, series = ink.series, bare = false, family = "Inter, sans-serif"): Record<string, unknown> {
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
      fontFamily: family,
      fontSize: 12,
    },
  };
}

export function themesFor(light: Ink, dark: Ink, series?: { soft: string[]; midnight: string[] }, bare = false, family = "Inter, sans-serif"): DashThemes {
  return {
    soft: themeOf(light, series?.soft ?? light.series, bare, family),
    midnight: themeOf(dark, series?.midnight ?? dark.series, bare, family),
  };
}

export function spec(type: string, themes: DashThemes, mode: DashTheme, body: Record<string, unknown>, alt: string): Record<string, unknown> {
  return { version: "1", type, theme: themes[mode], ...body, a11y: { alt } };
}

export function disclaimer(product: string): string {
  return `Styled after ${product}'s dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by ${product}.`;
}

export function isoDays(start: string, count: number): string[] {
  const origin = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => new Date(origin + index * 86400000).toISOString().slice(0, 10));
}

/** Deterministic unit interval. Same seed, same sequence, on every machine. */
function unit(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export interface Shape {
  seed: number;
  start: number;
  end: number;
  season: number;
  noise: number;
  /** Weekly phase in radians, so a comparison series does not copy the current one. */
  phase?: number;
  spike?: { at: number; height: number };
}

/**
 * Trend, weekly seasonality, noise, and an optional spike.
 * Nothing is clamped to a ceiling, so peaks are not flat copies of each other.
 */
export function organic(count: number, shape: Shape): number[] {
  const rand = unit(shape.seed);
  const out: number[] = [];
  for (let index = 0; index < count; index++) {
    const t = count <= 1 ? 0 : index / (count - 1);
    const trend = shape.start + (shape.end - shape.start) * t;
    const season = Math.sin((index / 7) * Math.PI * 2 + (shape.phase ?? 0)) * shape.season;
    const noise = (rand() - 0.5) * 2 * shape.noise;
    let value = trend + season + noise;
    if (shape.spike) {
      const distance = Math.abs(index - shape.spike.at);
      if (distance === 0) value += shape.spike.height;
      else if (distance === 1) value += shape.spike.height * 0.42;
      else if (distance === 2) value += shape.spike.height * 0.12;
    }
    out.push(value);
  }
  return out;
}

/** Round a continuous series without pulling different days onto one value. */
export function rounds(values: number[], step = 1): number[] {
  return values.map((value) => Math.round(value / step) * step);
}

/** Scale a comparison down, keeping its own shape, until most points sit under the current series. */
export function sitBelow(current: number[], earlier: number[]): number[] {
  const ratios = earlier.map((value, index) => value / Math.max(current[index] ?? 1, 1e-9)).sort((a, b) => a - b);
  const pivot = ratios[Math.min(ratios.length - 1, Math.ceil(ratios.length * 0.85) - 1)] ?? 1;
  const factor = pivot > 0.98 ? 0.98 / pivot : 1;
  return earlier.map((value) => Math.round(value * factor));
}

/** A round axis max that leaves the highest point between 80% and 90% of a zero baseline. */
function headroom(values: number[]): number {
  const finite = values.filter((value) => Number.isFinite(value));
  const max = Math.max(...finite);
  const raw = max / 0.85;
  const power = 10 ** Math.floor(Math.log10(Math.max(raw, 1e-6)));
  const steps = [power / 10, power / 5, power / 4, power / 2, power];
  let best = Math.ceil(raw);
  let bestGap = Infinity;
  for (const step of steps) {
    if (!(step > 0)) continue;
    const top = Math.ceil((raw - step * 1e-9) / step) * step;
    const ratio = max / top;
    if (ratio >= 0.8 && ratio <= 0.9) return top;
    const gap = Math.abs(ratio - 0.85);
    if (gap < bestGap) {
      best = top;
      bestGap = gap;
    }
  }
  return best;
}

function scaleTo(values: number[], total: number): number[] {
  const sum = values.reduce((totalSoFar, value) => totalSoFar + value, 0) || 1;
  const scaled = values.map((value) => Math.round((value * total) / sum));
  const drift = total - scaled.reduce((totalSoFar, value) => totalSoFar + value, 0);
  const last = scaled.length - 1;
  scaled[last] = (scaled[last] ?? 0) + drift;
  return scaled;
}

const money = { style: "compact", prefix: "$" };
const quietY = { title: "", labels: false, grid: false };
const openY = { title: "", grid: true };

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
  const volumeThemes = themesFor(light, dark, { soft: ["#5469d4", "#a3acb9"], midnight: ["#8ea2ff", "#9aa8b8"] });
  const kpis = themesFor(light, dark, undefined, true);
  const failed = themesFor(light, dark, { soft: [light.negative], midnight: [dark.negative] });
  const days = isoDays("2025-10-01", 21);
  const gross = scaleTo(organic(21, { seed: 11, start: 6800, end: 15600, season: 900, noise: 750, phase: 0.4, spike: { at: 15, height: 1400 } }), 261000);
  const prior = sitBelow(gross, scaleTo(organic(21, { seed: 47, start: 5900, end: 11200, season: 650, noise: 380, phase: 2.2 }), 241000));
  const volume = days.map((date, index) => ({ date, gross: gross[index], prior: prior[index] }));
  const series = [
    gross.map((value) => value / 1000),
    gross.map((value) => value / 1080),
    [18, 16, 15, 17, 14, 13, 14, 12],
    [6.2, 6.4, 7.1, 6.9, 7.6, 8.0, 7.9, 8.4],
    [620, 640, 710, 690, 760, 800, 790, 840],
    [210, 220, 240, 230, 250, 260, 255, 248],
  ];
  const cards = [
    { label: "Gross", value: 261000, delta: 0.14, format: money, alt: "Gross volume this month is 261 thousand dollars, up 14 percent." },
    { label: "Net", value: 248400, delta: 0.07, format: money, alt: "Net of fees is 248 thousand dollars, up 7 percent." },
    { label: "Refunds", value: 12600, delta: -0.11, format: money, goodDirection: "down" as const, alt: "Refunds are 12.6 thousand dollars, down 11 percent." },
    { label: "Fees", value: 8400, delta: 0.02, format: money, alt: "Fees are 8.4 thousand dollars, up 2 percent." },
    { label: "Accounts", value: 840, delta: 0.04, alt: "840 new accounts, up 4 percent." },
    { label: "Payouts", value: 240000, delta: 0.06, format: money, alt: "Payouts are 240 thousand dollars, up 6 percent." },
  ].map((item, index) =>
    chart({
      id: `ledger-kpi-${index}`,
      title: item.label,
      caption: item.label,
      note: "type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.",
      span: "dash-3",
      place: "metric",
      themes: kpis,
      spec: spec(
        "kpi",
        kpis,
        mode,
        {
          data: series[index],
          metric: {
            label: item.label,
            value: item.value,
            delta: item.delta,
            format: item.format ?? "compact",
            ...(item.goodDirection ? { goodDirection: item.goodDirection } : {}),
          },
          mark: { fillOpacity: 0.16, strokeWidth: 1.5 },
          size: { width: 400, height: 108 },
        },
        item.alt,
      ),
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
      chart({
        id: "ledger-volume",
        title: "Gross volume",
        caption: "Daily gross against the previous period. The total sits above the chart.",
        note: "type combo. The gross series is a solid #5469d4 line with no gradient. headline draws Gross volume, a large $261K, and $228K with the delta pill on the right. The prior series is a dashed line. legend.show is false. axes.y.title is empty, y labels and grids are off. axes.x.ticks is ends.",
        span: "dash-12",
        place: "hero",
        themes: volumeThemes,
        spec: spec(
          "combo",
          volumeThemes,
          mode,
          {
            data: volume,
            encoding: {
              x: { field: "date", type: "temporal" },
              y: [
                { field: "gross", mark: "line" },
                { field: "prior", mark: "line", dash: "dashed" },
              ],
            },
            axes: { x: { grid: false, ticks: "ends" }, y: quietY },
            legend: { show: false },
            tooltip: { mode: "index", background: "light-dark(#ffffff,#0f2942)", radius: 6, shadow: "0 2px 5px rgba(50,50,93,.18)", crosshairColor: "#5469d4" },
            headline: { label: "Gross volume", value: "$261K", compare: "$228K", delta: "+14%", tone: "positive" },
            mark: { strokeWidth: 4, fillOpacity: 0, curve: "linear", points: "none", gradient: false },
            size: { width: 1100, height: 400 },
          },
          "Gross volume for 1–21 October totals 261 thousand dollars, above the previous period.",
        ),
      }),
      ...cards,
      chart({
        id: "ledger-methods",
        title: "Payments by method",
        caption: "Card, bank, and wallet.",
        note: "type bar-list with mark.track row. The wash uses series[0]. The amount uses the text token, so Midnight stays readable. The page swaps the soft and midnight SVGs.",
        span: "dash-6",
        place: "side",
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
            mark: { track: "row" },
            size: { width: 520, height: 96 },
          },
          "Card is the largest method, then bank, then wallet.",
        ),
      }),
      chart({
        id: "ledger-failed",
        title: "Failed payments",
        caption: "Daily failures this period.",
        note: "type line. This chart's series token is the negative colour. axes.y.title is empty so the series name is not an axis title.",
        span: "dash-6",
        place: "side",
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
            encoding: { x: "day", y: { field: "failed" } },
            legend: { show: false },
            axes: { x: { grid: false }, y: { title: "", grid: true } },
            tooltip: { mode: "index" },
            mark: { strokeWidth: 1.75, curve: "linear", points: "none" },
            size: { width: 520, height: 180 },
          },
          "Failed payments peak at 22 on the 15th and fall to 8 on the 21st.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Gross volume", detail: "The top card is a solid #5469d4 line and a grey dashed prior-period line, with no gradient. headline draws Gross volume, a large total, and the comparison with its delta pill on the right. axes.x.ticks is ends. theme.tokens.fontFamily is Inter." },
      { label: "Home", detail: "Under the card, six kpi specs and the method and failed-payment charts use the same navy, blurple, and card chrome. No current public Home screenshot was available, so this section follows that visual language." },
      { label: "Palette", detail: "theme.tokens: blurple #635bff, navy text #0a2540, comparison #8898aa, negative #df1b41. Midnight swaps those tokens. The page CSS does not paint the marks." },
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
    series: ["#615fff", "#615fff"],
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
    series: ["#9d99ff", "#9d99ff"],
  };
  const themes = themesFor(light, dark);
  const days = isoDays("2025-09-22", 30);
  const tabLine = (
    id: string,
    label: string,
    value: string,
    delta: string,
    good: boolean,
    numbers: number[],
    alt: string,
  ): ChartDraft => {
    const data = days.map((date, index) => ({ date, value: numbers[index] }));
    return {
      id,
      title: label,
      caption: "Daily series. The last segment is dotted.",
      note: "type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.",
      span: "dash-12",
      place: "tab",
      themes,
      tab: { label, value, delta, good },
      spec: spec(
        "combo",
        themes,
        mode,
        {
          data,
          encoding: {
            x: { field: "date", type: "temporal" },
            y: [{ field: "value", mark: "area", scale: { domain: [0, headroom(numbers)] } }],
          },
          mark: { curve: "linear", points: "always", pointSize: 2.5, fillOpacity: 0.16, partial: "dotted", partialOpacity: 0.06, strokeWidth: 1.75, gradient: false },
          legend: { show: false },
          axes: { x: { grid: false }, y: openY },
          tooltip: { mode: "index", background: "light-dark(#ffffff,#1f2937)", radius: 8, shadow: "0 4px 16px rgba(17,24,39,.12)", crosshairColor: "#615fff" },
          size: { width: 1100, height: 280 },
        },
        alt,
      ),
    };
  };
  const list = (id: string, title: string, field: string, rows: { name: string; visits: number }[], alt: string, wash: string): ChartDraft => ({
    id,
    title,
    caption: title,
    note: "type bar-list, mark.track row. A full-height wash in series[0] sits behind the label. The count uses the text token and sits on the right. The page draws a Visitors column header.",
    span: "dash-12",
    place: "list",
    themes: themesFor(light, dark, { soft: [wash], midnight: [wash] }),
    spec: spec(
      "bar-list",
      themes,
      mode,
      {
        data: rows.map((row) => ({ [field]: row.name, visits: row.visits })),
        encoding: { x: field, y: { field: "visits", format: "compact" } },
        mark: { track: "row" },
        size: { width: 1080, height: rows.length * 28 + 12 },
      },
      alt,
    ),
  });
  return {
    slug: "meter",
    product: "Plausible",
    title: "Plausible-style analytics",
    lede: "Audience for the last 30 days.",
    disclaimer: disclaimer("Plausible"),
    range: "Last 30 days",
    defaultTheme: mode,
    charts: [
      chart(tabLine("meter-visitors", "Visitors", "18.4K", "+4%", true, rounds(organic(30, { seed: 5, start: 1420, end: 1680, season: 380, noise: 140, phase: 0.2, spike: { at: 13, height: 920 } })), "Visitors over 30 days, with one tall day in the middle and the last day still open.")),
      chart(tabLine("meter-visits", "Visits", "22.1K", "+5%", true, rounds(organic(30, { seed: 19, start: 1680, end: 2100, season: 460, noise: 180, phase: 1.1, spike: { at: 16, height: 1100 } })), "Visits over 30 days, with the last day still open.")),
      chart(tabLine("meter-pageviews", "Pageviews", "61.2K", "+6%", true, rounds(organic(30, { seed: 23, start: 4200, end: 5600, season: 900, noise: 320, phase: 0.8, spike: { at: 12, height: 1800 } })), "Pageviews over 30 days, with the last day still open.")),
      chart(tabLine("meter-views", "Views per visit", "2.8", "+2%", true, rounds(organic(30, { seed: 31, start: 2.35, end: 2.95, season: 0.28, noise: 0.16, phase: 2.4 }), 0.01), "Views per visit over 30 days.")),
      chart(tabLine("meter-bounce", "Bounce", "41%", "−3%", true, rounds(organic(30, { seed: 37, start: 0.48, end: 0.39, season: 0.04, noise: 0.02, phase: 1.7 }), 0.01), "Bounce rate over 30 days. Down is the better direction.")),
      chart(tabLine("meter-duration", "Duration", formatValue(144000, "duration-hm", "en-US"), "+2%", true, rounds(organic(30, { seed: 41, start: 118000, end: 146000, season: 12000, noise: 6000, phase: 0.5, spike: { at: 18, height: 28000 } }), 1000), "Visit duration over 30 days.")),
      chart(list("meter-sources", "Sources", "source", [
        { name: "Direct", visits: 2100 },
        { name: "Search", visits: 1760 },
        { name: "Newsletter", visits: 940 },
        { name: "Referral", visits: 610 },
        { name: "Social", visits: 280 },
      ], "Direct is the largest source, then search.", "#fb923c")),
      chart(list("meter-pages", "Pages", "page", [
        { name: "/pricing", visits: 1840 },
        { name: "/docs", visits: 1420 },
        { name: "/changelog", visits: 980 },
        { name: "/about", visits: 640 },
        { name: "/status", visits: 410 },
      ], "Pricing is the most visited page, then docs.", "#818cf8")),
      chart(list("meter-devices", "Devices", "device", [
        { name: "Desktop", visits: 9800 },
        { name: "Mobile", visits: 7420 },
        { name: "Tablet", visits: 1200 },
      ], "Desktop leads, then mobile.", "#6366f1")),
    ],
    sparks: [],
    notes: [
      { label: "Metric tabs", detail: "The strip is page state: label, number, and delta, with an underline on the selected tab. Choosing a tab shows that tab's spec. There is no sparkline in the strip." },
      { label: "Daily line", detail: "30 points, curve linear, points always, a light y grid, and a soft area. mark.partial dots the last segment and mark.partialOpacity paints that segment at 0.06. The series token is #615fff. Midnight uses #9d99ff." },
      { label: "Lists", detail: "Sources, Pages, and Devices are one bar-list at a time. mark.track row paints a pale orange or indigo wash. The page adds a Visitors column header. The chart is on demand and is not in the line or all bundle." },
      { label: "Duration", detail: "The Duration tab is formatValue(144000, \"duration-hm\"), which prints 2m 24s." },
    ],
  };
}

function wayline(): Dashboard {
  const mode: DashTheme = "soft";
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
  const face = "Roboto, sans-serif";
  const themes = themesFor(light, dark, undefined, false, face);
  const heat = themesFor(light, dark, { soft: ["#1a73e8"], midnight: ["#8ab4f8"] }, false, face);
  const days = isoDays("2025-09-24", 28);
  const tabLine = (id: string, label: string, value: string, delta: string, good: boolean, now: number[], then: number[], alt: string): ChartDraft => {
    const earlier = sitBelow(now, then);
    return {
    id,
    title: label,
    caption: "This period and the previous period.",
    note: "type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6. The previous period is its own series, not a copy of this one.",
    span: "dash-12",
    place: "tab",
    themes,
    tab: { label, value, delta, good },
    spec: spec(
      "line",
      themes,
      mode,
      {
        data: days.map((date, index) => ({ date, now: now[index], then: earlier[index] })),
        encoding: {
          x: { field: "date", type: "temporal" },
          y: [{ field: "now" }, { field: "then", dash: "dashed" }],
        },
        mark: { curve: "linear", strokeWidth: 2, points: "none" },
        legend: { show: false },
        axes: { x: { grid: false }, y: { title: "", grid: true, position: "right" } },
        tooltip: { mode: "index" },
        size: { width: 320, height: 140 },
      },
      alt,
    ),
    };
  };
  const cohorts = ["Sep 22 - Sep 28", "Sep 29 - Oct 5", "Oct 6 - Oct 12", "Oct 13 - Oct 19", "Oct 20 - Oct 26"];
  const periods = ["Week 0", "Week 1", "Week 2", "Week 3", "Week 4"];
  const cohortRand = unit(17);
  const cohortRows = cohorts.flatMap((cohort, cohortIndex) =>
    periods.map((period, periodIndex) => {
      const open = periodIndex <= periods.length - 1 - cohortIndex;
      return {
        cohort,
        period,
        users: open ? Math.max(8, Math.round(92 - periodIndex * (10 + cohortIndex) + cohortRand() * 6)) : null,
      };
    }),
  );
  const countries = [
    ["USA", 9200], ["JPN", 7100], ["GBR", 5400], ["DEU", 4800], ["BRA", 4300], ["IND", 3900], ["FRA", 3600], ["AUS", 2800],
    ["CAN", 2600], ["MEX", 2100], ["ESP", 1900], ["ITA", 1800], ["KOR", 1700], ["IDN", 1600], ["NLD", 1400], ["POL", 1300],
    ["TUR", 1250], ["ARG", 1200], ["ZAF", 1100], ["SWE", 980], ["CHE", 940], ["BEL", 900], ["PRT", 860], ["NOR", 820],
    ["AUT", 780], ["DNK", 740], ["FIN", 700], ["IRL", 680], ["CZE", 640], ["GRC", 610], ["ROU", 580], ["UKR", 540],
    ["COL", 720], ["CHL", 690], ["PER", 640], ["EGY", 600], ["MAR", 560], ["NGA", 530], ["KEN", 490], ["SAU", 760],
    ["ARE", 710], ["THA", 670], ["VNM", 640], ["MYS", 600], ["PHL", 570], ["NZL", 520], ["CHN", 2400], ["KAZ", 430],
    ["UZB", 380], ["FJI", 140], ["TZA", 360], ["PNG", 180],
  ].map(([country, sessions]) => ({ country, sessions }));
  const mapOf = (theme: DashTheme): Record<string, unknown> => ({
    version: "1",
    type: "choropleth",
    theme,
    data: countries,
    encoding: {
      region: "country",
      color: { field: "sessions", title: "Users", format: "compact", range: ["#aecbfa", "#669df6", "#1a73e8"] },
    },
    mark: {
      atlas: "world",
      projection: "equalEarth",
      scale: "sequential",
      nodata: "fill",
      land: theme === "midnight" ? "#3c4043" : "#e8eaed",
      water: theme === "midnight" ? "#202124" : "#ffffff",
    },
    legend: { show: true, position: "bottom" },
    size: { width: 280, height: 180 },
    a11y: { alt: "Users across more than forty countries. Countries without a row are plain grey." },
  });
  const channelRows = [
    { channel: "Search", sessions: 10290 },
    { channel: "Direct", sessions: 5880 },
    { channel: "Mail", sessions: 3920 },
    { channel: "Social", sessions: 2695 },
    { channel: "Referral", sessions: 1715 },
  ];
  return {
    slug: "wayline",
    product: "Google Analytics",
    title: "Google Analytics-style traffic report",
    lede: "Acquisition for the last 28 days.",
    disclaimer: disclaimer("Google Analytics"),
    range: "Last 28 days",
    defaultTheme: mode,
    charts: [
      chart(tabLine("wayline-users", "Users", "24.5K", "+6%", true, rounds(organic(28, { seed: 8, start: 620, end: 910, season: 70, noise: 45, phase: 0.5, spike: { at: 17, height: 160 } })), rounds(organic(28, { seed: 53, start: 540, end: 760, season: 90, noise: 55, phase: 2.6 })), "Users rise across 28 days and stay mostly above the previous period.")),
      chart(tabLine("wayline-new", "New users", "11.2K", "+3%", true, rounds(organic(28, { seed: 14, start: 280, end: 410, season: 36, noise: 22, phase: 1.2 })), rounds(organic(28, { seed: 61, start: 250, end: 340, season: 42, noise: 28, phase: 3.4 })), "New users over 28 days, with a dashed previous period.")),
      chart(tabLine("wayline-engage", "Avg. engagement\ntime", formatValue(204000, "duration-hm", "en-US"), "+5%", true, rounds(organic(28, { seed: 22, start: 150, end: 190, season: 12, noise: 8, phase: 0.9 })), rounds(organic(28, { seed: 71, start: 140, end: 168, season: 16, noise: 10, phase: 2.1 })), "Average engagement over 28 days.")),
      chart(tabLine("wayline-revenue", "Revenue", "$48.2K", "+4%", true, rounds(organic(28, { seed: 29, start: 1100, end: 1680, season: 120, noise: 80, phase: 0.3, spike: { at: 11, height: 280 } })), rounds(organic(28, { seed: 83, start: 980, end: 1400, season: 150, noise: 90, phase: 2.8 })), "Revenue over 28 days, with a dashed previous period.")),
      chart({
        id: "wayline-live",
        title: "Last 30 minutes",
        caption: "Users in the last half hour.",
        note: "type bar. A small realtime card. axes are off so the bars fill the card. The series token is #1a73e8.",
        span: "dash-4",
        place: "realtime",
        themes,
        spec: spec(
          "bar",
          themes,
          mode,
          {
            data: Array.from({ length: 30 }, (_, index) => ({ minute: String(index + 1), users: Math.round(8 + ((index * 17) % 11) + (index > 22 ? 6 : 0)) })),
            encoding: { x: "minute", y: "users" },
            axes: { x: false, y: false },
            legend: { show: false },
            mark: { gap: 0.2, cornerRadius: 1 },
            size: { width: 280, height: 72 },
          },
          "Users in each of the last 30 minutes.",
        ),
      }),
      chart({
        id: "wayline-channels",
        title: "New users by channel",
        caption: "Horizontal bars for the five channels.",
        note: "type bar with mark.orientation horizontal. The series token is #1a73e8. legend.show is false.",
        span: "dash-3",
        place: "hbar",
        themes,
        spec: spec(
          "bar",
          themes,
          mode,
          {
            data: channelRows.map((row) => ({ channel: row.channel, users: Math.round(row.sessions * 0.62) })),
            encoding: { x: "channel", y: { field: "users", title: "New users", format: "compact" } },
            mark: { orientation: "horizontal", gap: 0.32, cornerRadius: 2 },
            axes: { x: { title: "", grid: false }, y: { title: "", grid: false } },
            legend: { show: false },
            size: { width: 300, height: 180 },
          },
          "Search brings the most new users. Referral brings the fewest.",
        ),
      }),
      chart({
        id: "wayline-activity",
        title: "User activity over time",
        caption: "30 days, 7 days, or 1 day.",
        note: "type line. The card switches 30 days, 7 days, and 1 day. The series token is #1a73e8. legend.show is false.",
        span: "dash-3",
        place: "activity",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: days.map((date, index) => ({ date, users: rounds(organic(28, { seed: 8, start: 620, end: 910, season: 70, noise: 45, phase: 0.5 }))[index] })),
            encoding: { x: { field: "date", type: "temporal" }, y: "users" },
            mark: { curve: "linear", strokeWidth: 2, points: "none" },
            axes: { x: { grid: false, ticks: "ends" }, y: openY },
            legend: { show: false },
            size: { width: 300, height: 150 },
          },
          "User activity across 30 days.",
        ),
        variants: [
          {
            id: "30",
            label: "30 days",
            spec: spec(
              "line",
              themes,
              mode,
              {
                data: days.map((date, index) => ({ date, users: rounds(organic(28, { seed: 8, start: 620, end: 910, season: 70, noise: 45, phase: 0.5 }))[index] })),
                encoding: { x: { field: "date", type: "temporal" }, y: "users" },
                mark: { curve: "linear", strokeWidth: 2, points: "none" },
                axes: { x: { grid: false, ticks: "ends" }, y: openY },
                legend: { show: false },
                size: { width: 300, height: 150 },
              },
              "User activity across 30 days.",
            ),
          },
          {
            id: "7",
            label: "7 days",
            spec: spec(
              "line",
              themes,
              mode,
              {
                data: days.slice(-7).map((date, index) => ({ date, users: rounds(organic(7, { seed: 19, start: 740, end: 910, season: 40, noise: 30, phase: 1.1 }))[index] })),
                encoding: { x: { field: "date", type: "temporal" }, y: "users" },
                mark: { curve: "linear", strokeWidth: 2, points: "none" },
                axes: { x: { grid: false, ticks: "ends" }, y: openY },
                legend: { show: false },
                size: { width: 300, height: 150 },
              },
              "User activity across 7 days.",
            ),
          },
          {
            id: "1",
            label: "1 day",
            spec: spec(
              "line",
              themes,
              mode,
              {
                data: ["00", "04", "08", "12", "16", "20"].map((hour, index) => ({ hour, users: [120, 80, 210, 340, 290, 160][index] })),
                encoding: { x: "hour", y: "users" },
                mark: { curve: "linear", strokeWidth: 2, points: "none" },
                axes: { x: { grid: false }, y: openY },
                legend: { show: false },
                size: { width: 300, height: 150 },
              },
              "User activity across one day.",
            ),
          },
        ],
      }),
      chart({
        id: "wayline-cohort",
        title: "Cohort",
        caption: "Users remaining by period.",
        note: "type heatmap. Rows are week ranges. Columns are Week 0 through Week 4 across the top of the grid. Later cohorts leave the unfinished periods null, so the grid is a triangle. color.range is #e8f0fe, #aecbfa, #1a73e8.",
        span: "dash-3",
        place: "cohort",
        themes: heat,
        spec: spec(
          "heatmap",
          heat,
          mode,
          {
            data: cohortRows,
            encoding: {
              x: "period",
              y: "cohort",
              color: { field: "users", title: "Users", range: ["#e8f0fe", "#aecbfa", "#1a73e8"] },
            },
            mark: { gap: 0.18, cornerRadius: 2 },
            size: { width: 340, height: 210 },
          },
          "Each cohort is a triangle: later weeks are null once the cohort has not reached them.",
        ),
      }),
      chart({
        id: "wayline-map",
        title: "Countries",
        caption: "Users by country.",
        note: "type choropleth. encoding.color.range is the blue ramp. mark.nodata is fill, mark.land is #e8eaed, and mark.water is #ffffff, so missing countries are plain grey. Midnight uses land #3c4043 and water #202124. Fifty-two countries have a value.",
        span: "dash-12",
        place: "map",
        themes,
        spec: mapOf("soft"),
        themed: { soft: mapOf("soft"), midnight: mapOf("midnight") },
      }),
    ],
    sparks: [],
    notes: [
      { label: "Snapshot grid", detail: "Eight cards in two rows of four: users with a metric strip, last 30 minutes, insights, new users by channel, a sessions table, a map with a country table, user activity over time, and a cohort heatmap. There is no donut." },
      { label: "Comparison", detail: "curve linear keeps the segments straight. The previous period is dash dashed in #9aa0a6. axes.y.title is empty. Midnight uses #8ab4f8 for this period." },
      { label: "Map", detail: "Fifty-two countries use encoding.color.range #aecbfa, #669df6, #1a73e8. mark.nodata fill paints missing countries with mark.land. There is no hatch." },
      { label: "Cohort", detail: "Rows are week ranges such as Sep 22 - Sep 28. Week 0 through Week 4 sit across the top. Later cohorts leave unfinished weeks null, so the cells form a triangle. color.range is #e8f0fe, #aecbfa, #1a73e8." },
    ],
  };
}

function keelLevels(days: string[], counts: number[][]): Record<string, string | number>[] {
  const levels = ["Error", "Warning", "Info"];
  return days.flatMap((day, index) => levels.map((level, levelIndex) => ({ day, level, events: counts[index]?.[levelIndex] ?? 0 })));
}

function keel(): Dashboard {
  const mode: DashTheme = "soft";
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
  const sparkTone = themesFor(light, dark, { soft: ["#c7c2cc"], midnight: ["#9a93a6"] });
  const keelDays = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"];
  const keelHours = ["00", "03", "06", "09", "12", "15", "18", "21"];
  const counts14 = [
    [22, 14, 12], [28, 16, 14], [24, 18, 11], [30, 15, 13], [26, 17, 16], [18, 12, 10], [16, 9, 8],
    [40, 22, 18], [52, 30, 16], [44, 28, 22], [33, 20, 24], [21, 14, 15], [18, 12, 14], [16, 11, 13],
  ];
  const counts24 = [
    [6, 3, 2], [4, 2, 2], [5, 3, 1], [8, 4, 3], [14, 7, 4], [11, 6, 3], [7, 4, 2], [4, 2, 2],
  ];
  const areaRows = keelDays.map((day, index) => ({
    day,
    Error: counts14[index]?.[0] ?? 0,
    Warning: counts14[index]?.[1] ?? 0,
    Info: counts14[index]?.[2] ?? 0,
  }));
  const bars14 = spec(
    "bar",
    themes,
    mode,
    {
      data: keelLevels(keelDays, counts14),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack", cornerRadius: 2, radiusEnds: "all", stackGap: 2, gap: 0.28 },
      axes: { x: { grid: false }, y: { title: "", grid: true } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 620, height: 260 },
    },
    "Errors are the largest share of events across the 14 days.",
  );
  const bars24 = spec(
    "bar",
    themes,
    mode,
    {
      data: keelLevels(keelHours, counts24),
      encoding: { x: "day", y: "events", series: "level" },
      mark: { stack: "stack", cornerRadius: 2, radiusEnds: "all", stackGap: 2, gap: 0.28 },
      axes: { x: { grid: false }, y: { title: "", grid: true } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 620, height: 260 },
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
      mark: { fillOpacity: 0.85, stackGap: 2, gradient: true },
      axes: { x: { grid: false }, y: { title: "", grid: true } },
      legend: { position: "top" },
      tooltip: { mode: "index" },
      size: { width: 620, height: 260 },
    },
    "The stacked area shows the same 14 days as the bars.",
  );
  const hours = ["00", "04", "08", "12", "16", "20"];
  const latency = [
    [80, 90, 110, 140, 120, 95],
    [210, 240, 320, 410, 360, 250],
  ];
  const issues: { name: string; culprit: string; seen: string; age: string; users: number; series: number[]; tags: string[]; priority: string; assignee: string }[] = [
    { name: "Checkout timeout", culprit: "checkout.pay", seen: "2 min ago", age: "4d", users: 6, series: [2, 4, 9, 6, 3, 2, 1], tags: ["browser", "checkout"], priority: "High", assignee: "Unassigned" },
    { name: "Map tile retry", culprit: "maps.load", seen: "18 min ago", age: "12d", users: 4, series: [1, 1, 2, 5, 4, 2, 2], tags: ["network"], priority: "Medium", assignee: "Unassigned" },
    { name: "Queue lag", culprit: "worker.tick", seen: "1 hr ago", age: "9d", users: 11, series: [6, 5, 4, 4, 3, 3, 2], tags: ["worker"], priority: "High", assignee: "Unassigned" },
    { name: "Auth clock skew", culprit: "auth.verify", seen: "3 hr ago", age: "2d", users: 3, series: [0, 1, 1, 8, 3, 1, 0], tags: ["auth"], priority: "Low", assignee: "Unassigned" },
    { name: "Null price", culprit: "cart.total", seen: "5 hr ago", age: "6d", users: 2, series: [1, 0, 2, 1, 3, 1, 1], tags: ["cart"], priority: "Medium", assignee: "Unassigned" },
    { name: "Webhook 409", culprit: "hooks.deliver", seen: "1 day ago", age: "15d", users: 8, series: [3, 2, 4, 3, 4, 3, 2], tags: ["api"], priority: "Low", assignee: "Unassigned" },
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
        note: "type bar with encoding.series and mark.stack stack. theme.tokens.series is error, warning, and info. axes.y.title is empty. There is no band and no release rule. The 24h variant is the same bar. The area variant is type stacked-area.",
        span: "dash-6",
        place: "side",
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
        note: "type line. This chart's series tokens are the purple accent for p50 and the warning colour for p95. axes.y.title is empty.",
        span: "dash-6",
        place: "side",
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
            axes: { x: { grid: false }, y: { title: "", grid: true } },
            legend: { position: "top" },
            tooltip: { mode: "index" },
            mark: { curve: "linear", strokeWidth: 2, points: "none" },
            size: { width: 620, height: 260 },
          },
          "p95 peaks at 410 milliseconds at noon. p50 stays under 140.",
        ),
      }),
    ],
    sparks: issues.map((item, index) => {
      const events = item.series.reduce((sum, value) => sum + value, 0);
      return spark({
        id: `keel-issue-${index}`,
        name: item.name,
        detail: item.culprit,
        seen: item.seen,
        age: item.age,
        events,
        users: item.users,
        tags: item.tags,
        priority: item.priority,
        assignee: item.assignee,
        themes: sparkTone,
        spec: spec(
          "bar",
          sparkTone,
          mode,
          {
            data: item.series.map((value, day) => ({ day: String(day + 1), events: value })),
            encoding: { x: "day", y: "events" },
            mark: { cornerRadius: 1, gap: 0.15 },
            axes: { x: false, y: false },
            legend: { show: false },
            tooltip: { mode: "index" },
            size: { width: 120, height: 36 },
          },
          `${item.name} over seven days.`,
        ),
      });
    }),
    notes: [
      { label: "Issues", detail: "Each row has a checkbox, a title, a culprit, tags, last seen, age, a grey trend spark with its count, events, users, priority, and an assignee placeholder. The spark series token is #c7c2cc." },
      { label: "Light first", detail: "The default tokens are the light set: card #ffffff, ink #1f1633, accent #7553ff, error #f55459, warning #ff9838, info #8d95a3. Midnight swaps them." },
      { label: "Volume", detail: "The stacked bar is a secondary card. It has no highlighted band and no release label. 14d, 24h, and Area are variants of that card." },
    ],
  };
}

const built = [ledger(), meter(), wayline(), keel(), ...round2()];

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
    if (item.themed) lines.push("### Midnight", "", "```json", JSON.stringify(item.themed.midnight, null, 2), "```", "");
  }
  for (const item of board.sparks) {
    lines.push(`## ${item.name}`, "", `${item.detail}. Last seen ${item.seen}. Age ${item.age}. ${item.events} events, ${item.users} users.`, "", "```json", JSON.stringify(item.spec, null, 2), "```", "");
  }
  lines.push("## What produces this look", "");
  for (const note of board.notes) lines.push(`- **${note.label}.** ${note.detail}`);
  lines.push("", `https://chartkit.dev/dashboards/${board.slug}`, "");
  return lines.join("\n");
}
