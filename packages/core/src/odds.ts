/**
 * Prediction-market odds, replayed.
 *
 * Same contract as the line race: `frame(t)` is a pure function of the rows and
 * `t` in [0, 1], and `exportLineRace` records those frames. The line is a step:
 * a price holds until the next trade. The x axis stays on the full history, so
 * the replay finishes on the same frame as the settled chart. The y axis is
 * fitted to that history (`scale: "fit"`), which is how these charts are drawn,
 * rather than locked to 0–100.
 */
import { clamp, esc, linear } from "./svg";
import { parseCsv } from "./race-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface OddsSeries {
  name: string;
  field?: string;
  color?: string;
}

export interface OddsReplayOptions {
  title: string;
  subtitle?: string;
  /** Light is a white field. Dark is a navy field. Default light. */
  theme?: "light" | "dark";
  x?: string;
  /**
   * `fit` sizes y to the whole series and keeps it still while replaying.
   * `expand` grows y to the prices revealed so far.
   * `unit` is 0 to 100.
   * Default `fit`.
   */
  scale?: "fit" | "expand" | "unit";
  /** A swatch row with the current percent. End labels stay either way. */
  legend?: boolean;
  series?: OddsSeries[];
  data: Array<Record<string, string | number | null>>;
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
  fontFamily?: string;
}

export interface OddsTip {
  name: string;
  /** Percent points, 0–100. */
  value: number;
  x: number;
  y: number;
  labelY: number;
}

export interface OddsFrameState {
  t: number;
  xDomain: [number, number];
  yMin: number;
  yMax: number;
  playhead: number;
  theme: "light" | "dark";
  plot: { left: number; top: number; right: number; bottom: number };
  tips: OddsTip[];
}

export interface OddsReplay {
  frame(t: number): string;
  state(t: number): OddsFrameState;
  duration: number;
  width: number;
  height: number;
  fps: number;
  background: string;
}

interface Theme {
  bg: string;
  ink: string;
  muted: string;
  grid: string;
  axis: string;
  leader: string;
  dot: string;
}

const THEMES: Record<"light" | "dark", Theme> = {
  light: {
    bg: "#ffffff",
    ink: "#17181a",
    muted: "#5e6168",
    grid: "#e4e1dc",
    axis: "#6b6e76",
    leader: "#c5c3be",
    dot: "#ffffff",
  },
  dark: {
    bg: "#17202b",
    ink: "#f4f6f8",
    muted: "#a8b0ba",
    grid: "rgba(255,255,255,0.16)",
    axis: "#c5cdd6",
    leader: "rgba(255,255,255,0.4)",
    dot: "#17202b",
  },
};

const LIGHT_COLORS = ["#1c1e21", "#1aa36a", "#c47b2b", "#3b6fd6"];
const DARK_COLORS = ["#f07167", "#5aa2ff", "#f0c14a", "#3dbe8b"];

interface Prepared {
  name: string;
  color: string;
  values: number[];
}

interface Model {
  uid: string;
  title: string;
  subtitle: string;
  themeName: "light" | "dark";
  theme: Theme;
  legend: boolean;
  scale: "fit" | "expand" | "unit";
  times: number[];
  series: Prepared[];
  width: number;
  height: number;
  duration: number;
  fps: number;
  fontFamily: string;
  plot: { left: number; top: number; right: number; bottom: number };
  labelW: number;
  titleSize: number;
  subSize: number;
  tickSize: number;
  nameSize: number;
  pctSize: number;
  stroke: number;
  edge: number;
  span: number;
}

let nextId = 0;

function measure(text: string, size: number): number {
  let width = 0;
  for (const ch of text) {
    if (ch === " ") width += size * 0.33;
    else if (ch === "," || ch === "." || ch === "/" || ch === "%" || ch === ":") width += size * 0.36;
    else if (ch >= "0" && ch <= "9") width += size * 0.6;
    else if (ch.toUpperCase() === ch && ch.toLowerCase() !== ch) width += size * 0.66;
    else width += size * 0.54;
  }
  return width;
}

function px(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Object.is(rounded, -0)) return "0";
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function parseTime(value: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value)) return value > 1e11 ? value : value;
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
  }
  const named = /^([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?$/.exec(text);
  if (named) {
    const month = MONTHS.findIndex((item) => item.toLowerCase() === named[1]!.slice(0, 3).toLowerCase());
    if (month >= 0) return Date.UTC(named[3] ? Number(named[3]) : 2026, month, Number(named[2]));
  }
  const parsed = Date.parse(text);
  if (Number.isFinite(parsed)) return parsed;
  throw new Error(`Could not read "${text}" as a time.`);
}

function asPercent(raw: string | number | null | undefined, field: string, fraction: boolean): number | null {
  if (raw == null || raw === "") return null;
  const numeric = typeof raw === "number" ? raw : Number(String(raw).trim().replace(/[%$,]/g, ""));
  if (!Number.isFinite(numeric)) throw new Error(`"${raw}" in ${field} is not a number.`);
  return fraction ? numeric * 100 : numeric;
}

function build(options: OddsReplayOptions): Model {
  const title = options.title?.trim();
  if (!title) throw new Error("An odds replay needs a title.");
  if (!Array.isArray(options.data) || options.data.length < 2) throw new Error("An odds replay needs at least two rows.");
  const xField = options.x || Object.keys(options.data[0] ?? {})[0];
  if (!xField) throw new Error("An odds replay needs a time column.");
  const themeName = options.theme === "dark" ? "dark" : "light";
  const palette = themeName === "dark" ? DARK_COLORS : LIGHT_COLORS;
  const inferred: OddsSeries[] =
    options.series && options.series.length > 0
      ? options.series
      : Object.keys(options.data[0] ?? {})
          .filter((field) => field !== xField)
          .map((field) => ({ name: field, field }));
  if (inferred.length === 0) throw new Error("An odds replay needs at least one outcome.");

  const ranked = options.data
    .map((row, index) => {
      try {
        return { row, t: parseTime(row[xField] ?? null) };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unreadable time.";
        throw new Error(`Row ${index + 1}: ${message}`);
      }
    })
    .sort((a, b) => a.t - b.t);
  const times: number[] = [];
  const rows: Array<Record<string, string | number | null>> = [];
  for (const item of ranked) {
    if (times.length > 0 && item.t === times[times.length - 1]) {
      rows[rows.length - 1] = item.row;
      continue;
    }
    times.push(item.t);
    rows.push(item.row);
  }
  if (times.length < 2) throw new Error("An odds replay needs at least two different times.");

  const sampleValues = inferred.flatMap((series) =>
    rows.map((row) => {
      const raw = row[series.field || series.name];
      if (raw == null || raw === "") return null;
      const numeric = typeof raw === "number" ? raw : Number(String(raw).replace(/[%$,]/g, ""));
      return Number.isFinite(numeric) ? numeric : null;
    }),
  );
  const finite = sampleValues.filter((value): value is number => value != null);
  const fraction = finite.length > 0 && finite.every((value) => value >= 0 && value <= 1.5);
  const series: Prepared[] = inferred.map((item, index) => {
    const field = item.field || item.name;
    let held = 50;
    const values = rows.map((row) => {
      const next = asPercent(row[field], field, fraction);
      if (next == null) return held;
      held = next;
      return next;
    });
    return {
      name: item.name || field,
      color: item.color && /^#[0-9a-fA-F]{3,8}$/.test(item.color) ? item.color : palette[index % palette.length] ?? "#1c1e21",
      values,
    };
  });

  const width = clamp(Math.round(options.width ?? 1280), 480, 1920);
  const height = clamp(Math.round(options.height ?? 720), 270, 1080);
  const tickSize = clamp(Math.round(height * 0.02), 12, 16);
  const nameSize = clamp(Math.round(height * 0.022), 13, 16);
  const pctSize = clamp(Math.round(height * 0.04), 20, 28);
  const titleSize = clamp(Math.round(height * 0.046), 22, 36);
  const subSize = clamp(Math.round(height * 0.022), 13, 16);
  const stroke = clamp(height / 280, 2, 3);
  const edge = Math.round(Math.min(width, height) * 0.05);
  const labelW = Math.max(
    ...series.map((item) => measure(item.name, nameSize)),
    measure("100%", pctSize),
  ) + 4;
  const axisW = measure("100%", tickSize) + 16;
  const legend = options.legend === true;
  const titleY = Math.round(height * 0.09);
  const subY = options.subtitle?.trim() ? titleY + Math.round(subSize * 1.5) : titleY;
  const legendH = legend ? Math.round(height * 0.06) : 0;
  const plotTop = subY + legendH + Math.round(height * 0.06);
  const plotBottom = height - Math.round(height * 0.09);
  const plotLeft = edge + 8;
  const plotRight = width - edge - axisW - labelW - 18;
  if (plotRight - plotLeft < 160 || plotBottom - plotTop < 80) throw new Error("The frame is too small for these labels.");

  nextId += 1;
  return {
    uid: `cko${nextId.toString(36)}`,
    title,
    subtitle: options.subtitle?.trim() ?? "",
    themeName,
    theme: THEMES[themeName],
    legend,
    scale: options.scale === "expand" || options.scale === "unit" ? options.scale : "fit",
    times,
    series,
    width,
    height,
    duration: clamp(Math.round(options.duration ?? 8000), 1000, 120_000),
    fps: clamp(Math.round(options.fps ?? 30), 1, 60),
    fontFamily: options.fontFamily?.replace(/[<>"]/g, "") || "Geist, Helvetica, Arial, sans-serif",
    plot: { left: plotLeft, top: plotTop, right: plotRight, bottom: plotBottom },
    labelW,
    titleSize,
    subSize,
    tickSize,
    nameSize,
    pctSize,
    stroke,
    edge,
    span: (times[times.length - 1] ?? 0) - (times[0] ?? 0) || 1,
  };
}

function heldIndex(times: number[], ms: number): number {
  let index = 0;
  for (let i = 1; i < times.length; i++) {
    if ((times[i] ?? 0) <= ms) index = i;
    else break;
  }
  return index;
}

function extremes(model: Model, ms: number): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const consider = (value: number) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  };
  for (const series of model.series) {
    const end = model.scale === "fit" ? series.values.length - 1 : heldIndex(model.times, ms);
    for (let i = 0; i <= end; i++) consider(series.values[i] ?? 0);
  }
  if (!Number.isFinite(min)) return { min: 0, max: 100 };
  return { min, max };
}

function yDomain(model: Model, ms: number): { yMin: number; yMax: number } {
  if (model.scale === "unit") return { yMin: 0, yMax: 100 };
  const span = extremes(model, ms);
  const pad = Math.max(2, (span.max - span.min) * 0.22);
  let yMin = span.min - pad;
  let yMax = span.max + pad;
  if (yMax - yMin < 8) {
    const mid = (yMin + yMax) / 2;
    yMin = mid - 4;
    yMax = mid + 4;
  }
  return { yMin, yMax };
}

function percentTicks(min: number, max: number): number[] {
  const rough = (max - min) / 5;
  const choices = [1, 2, 5, 10, 20, 25];
  let step = choices[choices.length - 1] ?? 10;
  for (const choice of choices) {
    if (choice >= rough * 0.7) {
      step = choice;
      break;
    }
  }
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 0.01; value += step) {
    if (value <= min + (max - min) * 0.03) continue;
    if (value >= max - (max - min) * 0.03) continue;
    out.push(value);
    if (out.length > 7) break;
  }
  return out.length > 0 ? out : [Math.round((min + max) / 2)];
}

function formatWhen(ms: number, span: number): string {
  const date = new Date(ms);
  if (span < 36 * 3_600_000) {
    let hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const suffix = hour >= 12 ? "pm" : "am";
    hour = hour % 12 || 12;
    return minute === 0 ? `${hour}${suffix}` : `${hour}:${String(minute).padStart(2, "0")}${suffix}`;
  }
  if (span < 400 * 86_400_000) return `${MONTHS[date.getUTCMonth()] ?? ""} ${date.getUTCDate()}`;
  return `${MONTHS[date.getUTCMonth()] ?? ""} ${date.getUTCFullYear()}`;
}

function xTicks(model: Model, xOf: (ms: number) => number): number[] {
  const t0 = model.times[0] ?? 0;
  const t1 = model.times[model.times.length - 1] ?? t0 + 1;
  const span = t1 - t0;
  const steps =
    span < 3 * 3_600_000
      ? [15, 30, 60].map((minutes) => minutes * 60_000)
      : span < 36 * 3_600_000
        ? [30, 60, 120, 180].map((minutes) => minutes * 60_000)
        : span < 21 * 86_400_000
          ? [1, 2, 7].map((days) => days * 86_400_000)
          : [7, 30, 90].map((days) => days * 86_400_000);
  const minGap = Math.max(68, measure("Oct 00", model.tickSize) + 18);
  let chosen = steps[steps.length - 1] ?? span;
  for (const step of steps) {
    const ticks: number[] = [];
    for (let t = t0; t <= t1 + step * 0.01; t += step) ticks.push(Math.min(t, t1));
    const unique = ticks.filter((value, index) => index === 0 || value - (ticks[index - 1] ?? 0) > step * 0.2);
    let ok = true;
    let prev = -Infinity;
    for (const tick of unique) {
      const x = xOf(tick);
      if (prev > -Infinity && x - prev < minGap) {
        ok = false;
        break;
      }
      prev = x;
    }
    if (ok && unique.length >= 2) {
      chosen = step;
      break;
    }
  }
  const ticks: number[] = [];
  for (let t = t0; t <= t1 + chosen * 0.01; t += chosen) ticks.push(Math.min(t, t1));
  return ticks.filter((value, index) => index === 0 || value - (ticks[index - 1] ?? 0) > chosen * 0.2);
}

function stepPath(model: Model, values: number[], ms: number, xOf: (v: number) => number, yOf: (v: number) => number): string {
  const times = model.times;
  const end = heldIndex(times, ms);
  let held = values[0] ?? 0;
  let d = `M${px(xOf(times[0] ?? 0))} ${px(yOf(held))}`;
  for (let i = 1; i <= end; i++) {
    const x = xOf(times[i] ?? 0);
    d += `L${px(x)} ${px(yOf(held))}`;
    held = values[i] ?? held;
    d += `L${px(x)} ${px(yOf(held))}`;
  }
  const tip = times[end] ?? 0;
  if (ms > tip + 1) d += `L${px(xOf(ms))} ${px(yOf(held))}`;
  return d;
}

function place(tips: Array<{ name: string; value: number; x: number; y: number }>, plot: Model["plot"], block: number): OddsTip[] {
  const sorted = tips
    .map((tip, index) => ({ ...tip, labelY: tip.y, index }))
    .sort((a, b) => a.y - b.y || a.index - b.index);
  const count = sorted.length;
  if (count === 0) return [];
  const top = plot.top + block / 2;
  const bottom = plot.bottom - block / 2;
  let gap = block + 6;
  if (count > 1) gap = Math.min(gap, (bottom - top) / (count - 1));
  for (let i = 0; i < count; i++) {
    const minY = i === 0 ? top : sorted[i - 1]!.labelY + gap;
    sorted[i]!.labelY = Math.max(sorted[i]!.y, minY);
  }
  for (let i = count - 1; i >= 0; i--) {
    const maxY = i === count - 1 ? bottom : sorted[i + 1]!.labelY - gap;
    if (sorted[i]!.labelY > maxY) sorted[i]!.labelY = maxY;
  }
  for (let i = 0; i < count; i++) {
    const minY = i === 0 ? top : sorted[i - 1]!.labelY + gap;
    if (sorted[i]!.labelY < minY) sorted[i]!.labelY = minY;
  }
  return sorted.map(({ name, value, x, y, labelY }) => ({ name, value, x, y, labelY }));
}

function compute(model: Model, t: number): OddsFrameState {
  const clamped = clamp(t, 0, 1);
  const t0 = model.times[0] ?? 0;
  const t1 = model.times[model.times.length - 1] ?? t0 + 1;
  const ms = t0 + clamped * (t1 - t0);
  const domain = yDomain(model, ms);
  const xOf = linear(t0, t1, model.plot.left, model.plot.right);
  const yOf = linear(domain.yMin, domain.yMax, model.plot.bottom, model.plot.top);
  const index = heldIndex(model.times, ms);
  const tips = model.series.map((series) => {
    const value = series.values[index] ?? 0;
    return { name: series.name, value, x: xOf(ms), y: yOf(value) };
  });
  return {
    t: clamped,
    xDomain: [t0, t1],
    yMin: domain.yMin,
    yMax: domain.yMax,
    playhead: ms,
    theme: model.themeName,
    plot: model.plot,
    tips: place(tips, model.plot, model.pctSize + model.nameSize + 8),
  };
}

function render(model: Model, view: OddsFrameState): string {
  const { plot, theme } = { plot: view.plot, theme: model.theme };
  const t0 = view.xDomain[0];
  const t1 = view.xDomain[1];
  const ms = view.playhead;
  const xOf = linear(t0, t1, plot.left, plot.right);
  const yOf = linear(view.yMin, view.yMax, plot.bottom, plot.top);
  const uid = model.uid;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${model.width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-labelledby="${uid}-title ${uid}-desc" data-ck-odds="1" style="font-family:${esc(model.fontFamily)};font-variant-numeric:tabular-nums;background:${theme.bg}">`,
  );
  const summary = view.tips.map((tip) => `${tip.name} ${Math.round(tip.value)}%`).join(", ");
  parts.push(`<title id="${uid}-title">${esc(model.title)}</title>`);
  parts.push(`<desc id="${uid}-desc">${esc(`${model.title}. ${summary}.`)}</desc>`);
  parts.push(`<rect width="100%" height="100%" fill="${theme.bg}"/>`);
  parts.push(
    `<defs><clipPath id="${uid}-plot"><rect x="${px(plot.left)}" y="${px(plot.top)}" width="${px(plot.right - plot.left + model.stroke)}" height="${px(plot.bottom - plot.top)}"/></clipPath></defs>`,
  );
  parts.push(
    `<text x="${model.edge}" y="${px(Math.round(model.height * 0.09))}" fill="${theme.ink}" font-size="${model.titleSize}" font-weight="700" letter-spacing="-0.02em">${esc(model.title)}</text>`,
  );
  if (model.subtitle) {
    const subY = Math.round(model.height * 0.09) + Math.round(model.subSize * 1.5);
    parts.push(`<text x="${model.edge}" y="${subY}" fill="${theme.muted}" font-size="${model.subSize}">${esc(model.subtitle)}</text>`);
  }
  if (model.legend) {
    let x = model.edge;
    const y = plot.top - Math.round(model.height * 0.034);
    parts.push(`<g data-ck-legend="1">`);
    for (const series of model.series) {
      const tip = view.tips.find((item) => item.name === series.name);
      const pct = `${Math.round(tip?.value ?? 0)}%`;
      parts.push(`<circle cx="${px(x + 5)}" cy="${px(y)}" r="5" fill="${series.color}"/>`);
      parts.push(
        `<text x="${px(x + 16)}" y="${px(y)}" dominant-baseline="central" fill="${theme.ink}" font-size="${model.nameSize}">${esc(series.name)}</text>`,
      );
      const nameW = measure(series.name, model.nameSize);
      parts.push(
        `<text x="${px(x + 16 + nameW + 8)}" y="${px(y)}" dominant-baseline="central" fill="${series.color}" font-size="${model.nameSize}" font-weight="700">${pct}</text>`,
      );
      x += 16 + nameW + 8 + measure(pct, model.nameSize) + 22;
    }
    parts.push(`</g>`);
  }

  for (const tick of percentTicks(view.yMin, view.yMax)) {
    const y = yOf(tick);
    parts.push(
      `<line x1="${px(plot.left)}" y1="${px(y)}" x2="${px(plot.right)}" y2="${px(y)}" stroke="${theme.grid}" stroke-width="1" stroke-dasharray="1.5 6" shape-rendering="crispEdges"/>`,
    );
    parts.push(
      `<text x="${px(model.width - model.edge)}" y="${px(y)}" text-anchor="end" dominant-baseline="central" fill="${theme.axis}" font-size="${model.tickSize}">${Math.round(tick)}%</text>`,
    );
  }
  for (const tick of xTicks(model, xOf)) {
    const x = xOf(tick);
    const anchor = x > plot.right - 28 ? "end" : x < plot.left + 36 ? "start" : "middle";
    const labelX = anchor === "end" ? plot.right : anchor === "start" ? plot.left : x;
    parts.push(
      `<text x="${px(labelX)}" y="${px(plot.bottom + model.tickSize + 14)}" text-anchor="${anchor}" fill="${theme.axis}" font-size="${model.tickSize}">${esc(formatWhen(tick, model.span))}</text>`,
    );
  }

  const byName = new Map(view.tips.map((tip) => [tip.name, tip]));
  const paintOrder = model.series.slice().sort((a, b) => (byName.get(a.name)?.value ?? 0) - (byName.get(b.name)?.value ?? 0));
  parts.push(`<g clip-path="url(#${uid}-plot)">`);
  for (const series of paintOrder) {
    const d = stepPath(model, series.values, ms, xOf, yOf);
    parts.push(
      `<path data-ck-series="${esc(series.name)}" d="${d}" fill="none" stroke="${series.color}" stroke-width="${px(model.stroke)}" stroke-linejoin="round" stroke-linecap="round"/>`,
    );
  }
  parts.push(`</g>`);

  const labelCeiling = model.width - model.edge - measure("100%", model.tickSize) - 12 - model.labelW;
  for (const series of model.series) {
    const tip = byName.get(series.name);
    if (!tip) continue;
    const labelX = Math.min(tip.x + 14, labelCeiling);
    const shifted = Math.abs(tip.labelY - tip.y) > model.nameSize * 0.6 || labelX - tip.x > 28;
    if (shifted) {
      parts.push(
        `<line data-ck-leader="1" x1="${px(tip.x + model.stroke + 2)}" y1="${px(tip.y)}" x2="${px(labelX - 2)}" y2="${px(tip.labelY)}" stroke="${theme.leader}" stroke-width="1"/>`,
      );
    }
    parts.push(
      `<circle data-ck-dot="${esc(series.name)}" cx="${px(tip.x)}" cy="${px(tip.y)}" r="${px(model.stroke + 2.4)}" fill="${series.color}" stroke="${theme.dot}" stroke-width="1.5"/>`,
    );
    parts.push(`<g data-ck-tip="${esc(series.name)}">`);
    parts.push(
      `<text x="${px(labelX)}" y="${px(tip.labelY - model.pctSize * 0.34)}" fill="${series.color}" font-size="${model.nameSize}" font-weight="600">${esc(series.name)}</text>`,
    );
    parts.push(
      `<text x="${px(labelX)}" y="${px(tip.labelY + model.nameSize * 0.85)}" fill="${series.color}" font-size="${model.pctSize}" font-weight="700">${Math.round(tip.value)}%</text>`,
    );
    parts.push(`</g>`);
  }

  parts.push(`</svg>`);
  return parts.join("");
}

export function createOddsReplay(options: OddsReplayOptions): OddsReplay {
  const model = build(options);
  return {
    duration: model.duration,
    width: model.width,
    height: model.height,
    fps: model.fps,
    background: model.theme.bg,
    state(t: number) {
      return compute(model, t);
    },
    frame(t: number) {
      return render(model, compute(model, t));
    },
  };
}

export function oddsFromCsv(csv: string, override?: Partial<OddsReplayOptions>): OddsReplayOptions {
  const matrix = parseCsv(csv);
  const header = matrix[0]?.map((cell) => cell.trim()) ?? [];
  if (header.length < 2) throw new Error("The table needs a time column and at least one outcome.");
  const x = header[0] ?? "time";
  const fields = header.slice(1).filter((field) => field !== "");
  const data: Array<Record<string, string | number | null>> = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r] ?? [];
    const rawX = (cells[0] ?? "").trim();
    if (rawX === "") continue;
    const row: Record<string, string | number | null> = { [x]: rawX };
    header.forEach((field, index) => {
      if (index === 0 || field === "") return;
      const raw = (cells[index] ?? "").trim();
      if (raw === "") {
        row[field] = null;
        return;
      }
      const value = Number(raw.replace(/[%$,]/g, ""));
      if (!Number.isFinite(value)) throw new Error(`"${raw}" in ${field} is not a number.`);
      row[field] = value;
    });
    data.push(row);
  }
  if (data.length < 2) throw new Error("An odds replay needs at least two rows.");
  const palette = override?.theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
  const series = fields.map((field, index) => {
    const match = override?.series?.find((item) => (item.field ?? item.name) === field || item.name === field);
    return { name: match?.name || field, field, color: match?.color || palette[index % palette.length] };
  });
  return {
    title: override?.title || "Odds replay",
    subtitle: override?.subtitle,
    theme: override?.theme,
    legend: override?.legend,
    scale: override?.scale,
    x,
    duration: override?.duration,
    fps: override?.fps,
    width: override?.width,
    height: override?.height,
    fontFamily: override?.fontFamily,
    series,
    data,
  };
}
