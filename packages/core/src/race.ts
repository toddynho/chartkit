/**
 * Line chart race.
 *
 * `frame(t)` is a pure function of the rows and t in [0, 1]. Playback, a scrubber,
 * and export all ask for the same frame, so a frame on the server matches the browser.
 * `motion` is the wrong tool for this: it morphs two settled specs in the DOM, and
 * `render()` ignores it.
 *
 * The x domain grows from a fixed left edge. The y domain rises with the leading
 * value (`scale: "expand"`), which squashes earlier points. Straight segments, flat
 * white field, tip labels that stack instead of colliding, and a month that slides
 * out of the date.
 */
import { clamp, esc, linear, niceNum, ticks } from "./svg";
import type { LineRaceOptions, LineRaceSeries } from "./race-data";

export type { LineRaceOptions, LineRaceSeries } from "./race-data";
export { lineRaceFromCsv, lineRaceFromJson } from "./race-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface RaceTip {
  name: string;
  value: number;
  x: number;
  y: number;
  labelY: number;
}

export interface RaceFrameState {
  t: number;
  xDomain: [number, number];
  yMin: number;
  yMax: number;
  /** 1, 3, 6, or 12 for a monthly axis. 0 when x is numeric. */
  xTickStep: number;
  dateLabel: string;
  /** 0 when the month is settled, otherwise the slide toward the next month. */
  odometer: number;
  odometerMonths: string[];
  plot: { left: number; top: number; right: number; bottom: number };
  tips: RaceTip[];
}

export interface LineRace {
  frame(t: number): string;
  state(t: number): RaceFrameState;
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export interface RacePlayer {
  play(): void;
  pause(): void;
  seek(t: number): void;
  destroy(): void;
  readonly t: number;
  readonly playing: boolean;
}

interface PreparedSeries {
  name: string;
  color: string;
  iconHref: string | null;
  monogram: string;
  values: Array<number | null>;
}

interface Model {
  uid: string;
  title: string;
  subtitle: string;
  unit: string;
  mode: "time" | "number";
  times: number[];
  series: PreparedSeries[];
  width: number;
  height: number;
  duration: number;
  fps: number;
  digits: number;
  connectNulls: boolean;
  scale: "expand" | "follow";
  background: string;
  fontFamily: string;
  plot: { left: number; top: number; right: number; bottom: number };
  titleSize: number;
  subSize: number;
  dateSize: number;
  tickSize: number;
  valueSize: number;
  unitSize: number;
  icon: number;
  stroke: number;
  edge: number;
}

let nextId = 0;

function formatNumber(value: number, digits: number): string {
  const sign = value < 0 ? "-" : "";
  const fixed = Math.abs(value).toFixed(digits);
  const [whole, frac] = fixed.split(".");
  const grouped = (whole ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + grouped + (frac ? `.${frac}` : "");
}

function measure(text: string, size: number): number {
  let width = 0;
  for (const ch of text) {
    if (ch === " ") width += size * 0.33;
    else if (ch === "," || ch === "." || ch === "/" || ch === "#") width += size * 0.34;
    else if (ch >= "0" && ch <= "9") width += size * 0.6;
    else if (ch.toUpperCase() === ch && ch.toLowerCase() !== ch) width += size * 0.68;
    else width += size * 0.54;
  }
  return width;
}

function namedColor(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  const named: Record<string, string> = {
    openai: "#2D3A8C",
    google: "#C77A29",
    anthropic: "#3B824B",
    "hugging face": "#8A3E98",
    huggingface: "#8A3E98",
    xai: "#333333",
    mistral: "#C4A035",
    meta: "#4A90E2",
  };
  return named[key];
}

function hex(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const value = input.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(value) || /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return fallback;
}

function inkOn(color: string): string {
  const full = color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color;
  const n = Number.parseInt(full.slice(1), 16);
  if (!Number.isFinite(n)) return "#ffffff";
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? "#17181a" : "#ffffff";
}

function iconHref(icon: string | undefined): string | null {
  if (!icon) return null;
  const value = icon.trim().replace(/\s/g, "");
  if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  return null;
}

function monograms(names: string[]): string[] {
  const cleaned = names.map((name) => name.replace(/[^A-Za-z0-9]/g, ""));
  const one = cleaned.map((name) => (name.slice(0, 1) || "?").toUpperCase());
  const counts = new Map<string, number>();
  for (const letter of one) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  return one.map((letter, index) => {
    if ((counts.get(letter) ?? 0) < 2) return letter;
    const two = cleaned[index]?.slice(0, 2) ?? letter;
    return two.length > 1 ? two[0]!.toUpperCase() + two.slice(1).toLowerCase() : letter;
  });
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function parseX(value: string | number | null): { kind: "time"; ms: number } | { kind: "number"; n: number } {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (Math.abs(value) > 1e11) return { kind: "time", ms: value };
    return { kind: "number", n: value };
  }
  const text = String(value ?? "").trim();
  const iso = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(text);
  if (iso) return { kind: "time", ms: Date.UTC(Number(iso[1]), Number(iso[2]) - 1, iso[3] ? Number(iso[3]) : 1) };
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const ms = Date.parse(text);
    if (Number.isFinite(ms)) return { kind: "time", ms };
  }
  const named = /^([A-Za-z]+)\s+(\d{4})$/.exec(text);
  const month = named ? MONTH_INDEX[named[1]!.toLowerCase()] : undefined;
  if (named && month !== undefined) return { kind: "time", ms: Date.UTC(Number(named[2]), month, 1) };
  const numeric = Number(text.replace(/,/g, ""));
  if (text !== "" && Number.isFinite(numeric)) return { kind: "number", n: numeric };
  throw new Error(`Could not read "${text}" as a date (YYYY-MM) or a number.`);
}

function asNumber(value: string | number | null | undefined, field: string): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`"${field}" has a value that is not finite.`);
    return value;
  }
  const text = value.trim();
  if (text === "" || text.toLowerCase() === "null" || text.toLowerCase() === "na") return null;
  const numeric = Number(text.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) throw new Error(`"${text}" in ${field} is not a number.`);
  return numeric;
}

function buildModel(options: LineRaceOptions): Model {
  const title = options.title?.trim();
  if (!title) throw new Error("A line race needs a title.");
  const data = options.data;
  if (!Array.isArray(data) || data.length < 2) throw new Error("A line race needs at least two rows.");
  const xField = options.x || Object.keys(data[0] ?? {})[0];
  if (!xField) throw new Error("A line race needs a date column.");

  const inferred: LineRaceSeries[] =
    options.series && options.series.length > 0
      ? options.series
      : Object.keys(data[0] ?? {})
          .filter((field) => field !== xField)
          .map((field) => ({ name: field, field }));
  if (inferred.length === 0) throw new Error("A line race needs at least one series.");

  const parsed = data.map((row, index) => {
    try {
      return { row, x: parseX(row[xField] ?? null) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unreadable date.";
      throw new Error(`Row ${index + 1}: ${message}`);
    }
  });
  const mode = parsed[0]?.x.kind;
  if (!mode || parsed.some((item) => item.x.kind !== mode)) {
    throw new Error("Keep the date column either all dates or all numbers.");
  }
  const ranked = parsed
    .map((item) => ({
      row: item.row,
      t: item.x.kind === "time" ? item.x.ms : item.x.n,
    }))
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
  if (times.length < 2) throw new Error("A line race needs at least two different dates.");

  const marks = monograms(inferred.map((series) => series.name));
  const series: PreparedSeries[] = inferred.map((item, index) => {
    const field = item.field || item.name;
    const values = rows.map((row) => asNumber(row[field], field));
    return {
      name: item.name || field,
      color: hex(item.color, namedColor(item.name) ?? ["#2D3A8C", "#C77A29", "#3B824B", "#8A3E98", "#333333", "#C4A035", "#4A90E2"][index % 7] ?? "#2D3A8C"),
      iconHref: iconHref(item.icon),
      monogram: item.icon && !iconHref(item.icon) ? item.icon.trim().slice(0, 2) : marks[index] ?? "?",
      values,
    };
  }).filter((item) => item.values.some((value) => value != null));
  if (series.length === 0) throw new Error("Every series is empty.");

  let peak = 0;
  let trough = 0;
  for (const item of series) {
    for (const value of item.values) {
      if (value == null) continue;
      peak = Math.max(peak, value);
      trough = Math.min(trough, value);
    }
  }

  const width = clamp(Math.round(options.width ?? 1280), 480, 1920);
  const height = clamp(Math.round(options.height ?? 720), 270, 1080);
  const digits = clamp(Math.round(options.digits ?? 0), 0, 4);
  const tickSize = clamp(Math.round(height * 0.018), 11, 16);
  const valueSize = clamp(Math.round(height * 0.021), 13, 18);
  const unitSize = clamp(Math.round(height * 0.016), 11, 14);
  const titleSize = clamp(Math.round(height * 0.046), 22, 40);
  const subSize = clamp(Math.round(height * 0.021), 13, 17);
  const dateSize = clamp(Math.round(height * 0.058), 28, 52);
  const icon = clamp(Math.round(height * 0.034), 18, 28);
  const stroke = clamp(height / 300, 1.75, 2.75);
  const edge = Math.round(Math.min(width, height) * 0.055);
  const unit = options.unit?.trim() ?? "";
  const labelSample = formatNumber(Math.max(Math.abs(peak), Math.abs(trough), 1), digits);
  const yLabelW = measure(labelSample, tickSize);
  const valueW = measure(labelSample, valueSize);
  const unitW = unit ? measure(unit, unitSize) + 8 : 0;
  const plotLeft = edge + yLabelW + 14;
  const plotRight = width - edge - (icon + 12 + valueW + unitW + 8);
  const titleY = Math.round(height * 0.078);
  const subY = titleY + Math.round(subSize * 1.45);
  const plotTop = subY + Math.round(height * 0.05);
  const plotBottom = height - Math.round(height * 0.078);
  if (plotRight - plotLeft < 120 || plotBottom - plotTop < 80) {
    throw new Error("The frame is too small for this many labels.");
  }

  nextId += 1;
  return {
    uid: `ckr${nextId.toString(36)}`,
    title,
    subtitle: options.subtitle?.trim() ?? "",
    unit,
    mode,
    times,
    series,
    width,
    height,
    duration: clamp(Math.round(options.duration ?? 9000), 1000, 120_000),
    fps: clamp(Math.round(options.fps ?? 30), 1, 60),
    digits,
    connectNulls: options.connectNulls !== false,
    scale: options.scale === "follow" ? "follow" : "expand",
    background: hex(options.background, "#ffffff"),
    fontFamily: options.fontFamily?.replace(/[<>"]/g, "") || "Geist, Helvetica, Arial, sans-serif",
    plot: { left: plotLeft, top: plotTop, right: plotRight, bottom: plotBottom },
    titleSize,
    subSize,
    dateSize,
    tickSize,
    valueSize,
    unitSize,
    icon,
    stroke,
    edge,
  };
}

function locate(times: number[], ms: number): { index: number; frac: number } {
  const last = times.length - 1;
  if (ms <= times[0]) return { index: 0, frac: 0 };
  if (ms >= times[last]) return { index: Math.max(0, last - 1), frac: 1 };
  let lo = 0;
  let hi = last;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= ms) lo = mid;
    else hi = mid;
  }
  const span = times[lo + 1] - times[lo] || 1;
  return { index: lo, frac: clamp((ms - times[lo]) / span, 0, 1) };
}

function valueAt(values: Array<number | null>, times: number[], ms: number): number | null {
  const { index, frac } = locate(times, ms);
  const left = values[index];
  const right = values[index + 1];
  if (frac <= 0) return left ?? right;
  if (frac >= 1) return right ?? left;
  if (left == null && right == null) return null;
  if (left == null) return right;
  if (right == null) return left;
  return left + (right - left) * frac;
}

function revealed(model: Model, ms: number, follow: boolean): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const consider = (value: number | null) => {
    if (value == null || !Number.isFinite(value)) return;
    min = Math.min(min, value);
    max = Math.max(max, value);
  };
  for (const series of model.series) {
    if (!follow) {
      for (let i = 0; i < series.values.length; i++) {
        if (model.times[i] > ms) break;
        consider(series.values[i] ?? null);
      }
    }
    consider(valueAt(series.values, model.times, ms));
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  return { min, max };
}

function yDomain(model: Model, ms: number): { yMin: number; yMax: number } {
  const span = revealed(model, ms, model.scale === "follow");
  let yMin = span.min >= 0 ? 0 : span.min * 1.12;
  let yMax = span.max <= 0 ? 0 : span.max * 1.12;
  if (!(yMax > yMin)) yMax = yMin + 1;
  return { yMin, yMax };
}

function playhead(model: Model, t: number): number {
  const t0 = model.times[0] ?? 0;
  const t1 = model.times[model.times.length - 1] ?? t0 + 1;
  const span = t1 - t0 || 1;
  const shown = Math.max(span * 0.018, span * clamp(t, 0, 1));
  return Math.min(t1, t0 + shown);
}

function monthStarts(t0: number, t1: number): number[] {
  const origin = new Date(t0);
  let year = origin.getUTCFullYear();
  let month = origin.getUTCMonth();
  const out: number[] = [];
  for (let guard = 0; guard < 600; guard++) {
    const ms = Date.UTC(year, month, 1);
    if (ms > t1 + 1) break;
    if (ms >= t0 - 1) out.push(ms);
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return out;
}

function px(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Object.is(rounded, -0)) return "0";
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function dateParts(ms: number): { month: string; year: string } {
  const date = new Date(ms);
  return { month: MONTHS[date.getUTCMonth()] ?? "", year: String(date.getUTCFullYear()) };
}

interface Odometer {
  from: { month: string; year: string };
  to: { month: string; year: string };
  /** 0 settled, 1 fully on the incoming month. */
  u: number;
  label: string;
}

function odometerAt(model: Model, ms: number): Odometer {
  if (model.mode === "number") {
    const label = formatNumber(ms, Math.abs(ms) >= 100 ? 0 : 1);
    return { from: { month: label, year: "" }, to: { month: label, year: "" }, u: 0, label };
  }
  const { index, frac } = locate(model.times, ms);
  const last = model.times.length - 1;
  const window = 0.22;
  let fromIndex = index;
  let toIndex = index;
  let u = 0;
  if (index < last && frac > 1 - window) {
    const raw = clamp((frac - (1 - window)) / window, 0, 1);
    u = raw * raw * (3 - 2 * raw);
    toIndex = index + 1;
  }
  const from = dateParts(model.times[fromIndex] ?? ms);
  const to = dateParts(model.times[toIndex] ?? ms);
  const settled = u < 0.5 ? from : to;
  return { from, to, u, label: `${settled.month} ${settled.year}` };
}

function placeLabels(
  tips: Array<{ name: string; value: number; x: number; y: number }>,
  plot: Model["plot"],
  icon: number,
): RaceTip[] {
  const sorted = tips
    .map((tip, index) => ({ ...tip, labelY: tip.y, index }))
    .sort((a, b) => a.y - b.y || a.index - b.index);
  const count = sorted.length;
  if (count === 0) return [];
  const pad = icon / 2;
  const top = plot.top + pad;
  const bottom = plot.bottom - pad;
  let gap = icon + 8;
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

function compute(model: Model, t: number): RaceFrameState {
  const clamped = clamp(t, 0, 1);
  const t0 = model.times[0] ?? 0;
  const ms = playhead(model, clamped);
  const domain = yDomain(model, ms);
  const xOf = linear(t0, ms, model.plot.left, model.plot.right);
  const yOf = linear(domain.yMin, domain.yMax, model.plot.bottom, model.plot.top);
  const tips = model.series.map((series) => {
    const value = valueAt(series.values, model.times, ms) ?? 0;
    return { name: series.name, value, x: xOf(ms), y: yOf(value) };
  });
  const placed = placeLabels(tips, model.plot, model.icon);
  const clock = odometerAt(model, ms);
  let xTickStep = 0;
  if (model.mode === "time") {
    const months = monthStarts(t0, ms);
    const minGap = Math.max(72, measure("Sep 2026", model.tickSize) + 16);
    for (const candidate of [1, 3, 6, 12]) {
      xTickStep = candidate;
      let ok = true;
      let prev = -Infinity;
      for (let i = 0; i < months.length; i += candidate) {
        const x = xOf(months[i] ?? t0);
        if (prev > -Infinity && x - prev < minGap) {
          ok = false;
          break;
        }
        prev = x;
      }
      if (ok) break;
    }
  }
  return {
    t: clamped,
    xDomain: [t0, ms],
    yMin: domain.yMin,
    yMax: domain.yMax,
    xTickStep,
    dateLabel: clock.label,
    odometer: clock.u,
    odometerMonths:
      clock.u > 0.001 && clock.u < 0.999
        ? [clock.from.month, clock.to.month]
        : [clock.u >= 0.999 ? clock.to.month : clock.from.month],
    plot: model.plot,
    tips: placed,
  };
}

function pathFor(model: Model, series: PreparedSeries, ms: number, xOf: (v: number) => number, yOf: (v: number) => number): string {
  const { index, frac } = locate(model.times, ms);
  const end = frac >= 1 ? index + 1 : index;
  let d = "";
  let pen = false;
  for (let k = 0; k <= end && k < series.values.length; k++) {
    const value = series.values[k];
    if (value == null) {
      if (!model.connectNulls) pen = false;
      continue;
    }
    const cmd = pen ? "L" : "M";
    d += `${cmd}${px(xOf(model.times[k] ?? 0))} ${px(yOf(value))}`;
    pen = true;
  }
  if (frac > 0 && frac < 1) {
    const left = series.values[index];
    const right = series.values[index + 1];
    const value = left == null ? right : right == null ? left : left + (right - left) * frac;
    if (value != null) d += `${pen ? "L" : "M"}${px(xOf(ms))} ${px(yOf(value))}`;
  }
  return d;
}

function yTicks(yMin: number, yMax: number): number[] {
  const rough = ticks(yMin, yMax, 5).filter((tick) => tick > yMin + (yMax - yMin) * 0.02 && tick < yMax - (yMax - yMin) * 0.04);
  if (rough.length > 0) return rough;
  const step = niceNum((yMax - yMin) / 4, true) || 1;
  const out: number[] = [];
  for (let value = Math.ceil(yMin / step) * step; value < yMax; value += step) out.push(value);
  return out.slice(0, 6);
}

function formatXNumber(value: number): string {
  if (Number.isInteger(value) && value >= 1000 && value <= 2100) return String(value);
  if (Math.abs(value) >= 100) return formatNumber(value, 0);
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

function renderFrame(model: Model, view: RaceFrameState): string {
  const { plot } = view;
  const ms = view.xDomain[1];
  const xOf = linear(view.xDomain[0], ms, plot.left, plot.right);
  const yOf = linear(view.yMin, view.yMax, plot.bottom, plot.top);
  const uid = model.uid;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${model.width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-labelledby="${uid}-title ${uid}-desc" data-ck-race="1" style="font-family:${esc(model.fontFamily)};font-variant-numeric:tabular-nums;background:${model.background}">`,
  );
  parts.push(`<title id="${uid}-title">${esc(model.title)}</title>`);
  const summary = view.tips
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .map((tip) => `${tip.name} ${formatNumber(tip.value, model.digits)}`)
    .join(", ");
  parts.push(`<desc id="${uid}-desc">${esc(`${model.title} at ${view.dateLabel}. ${summary}.`)}</desc>`);
  parts.push(`<rect width="100%" height="100%" fill="${model.background}"/>`);
  parts.push(`<defs><clipPath id="${uid}-plot"><rect x="${px(plot.left)}" y="${px(plot.top)}" width="${px(plot.right - plot.left + model.stroke)}" height="${px(plot.bottom - plot.top)}"/></clipPath></defs>`);

  parts.push(
    `<text x="${model.edge}" y="${px(Math.round(model.height * 0.078))}" fill="#17181a" font-size="${model.titleSize}" font-weight="700" letter-spacing="-0.02em">${esc(model.title)}</text>`,
  );
  if (model.subtitle) {
    const subY = Math.round(model.height * 0.078) + Math.round(model.subSize * 1.45);
    parts.push(`<text x="${model.edge}" y="${subY}" fill="#5e6168" font-size="${model.subSize}" font-weight="400">${esc(model.subtitle)}</text>`);
  }
  parts.push(renderOdometer(model, ms));

  for (const tick of yTicks(view.yMin, view.yMax)) {
    const y = yOf(tick);
    parts.push(`<line x1="${px(plot.left)}" y1="${px(y)}" x2="${px(plot.right)}" y2="${px(y)}" stroke="#eceae6" stroke-width="1" shape-rendering="crispEdges"/>`);
    parts.push(
      `<text x="${px(plot.left - 10)}" y="${px(y)}" text-anchor="end" dominant-baseline="central" fill="#6b6e76" font-size="${model.tickSize}">${esc(formatNumber(tick, tick >= 100 || model.digits === 0 ? 0 : model.digits))}</text>`,
    );
  }
  parts.push(`<line x1="${px(plot.left)}" y1="${px(plot.bottom)}" x2="${px(plot.right)}" y2="${px(plot.bottom)}" stroke="#e1dfdb" stroke-width="1" shape-rendering="crispEdges"/>`);

  if (model.mode === "time") {
    const months = monthStarts(view.xDomain[0], ms);
    const step = view.xTickStep || 1;
    months.forEach((month, index) => {
      if (index % step !== 0) return;
      const x = xOf(month);
      if (x < plot.left - 1 || x > plot.right + 1) return;
      const anchor = x > plot.right - 28 ? "end" : x < plot.left + 28 ? "start" : "middle";
      const labelX = anchor === "end" ? plot.right : anchor === "start" ? plot.left : x;
      const { month: name, year } = dateParts(month);
      parts.push(
        `<text x="${px(labelX)}" y="${px(plot.bottom + model.tickSize + 12)}" text-anchor="${anchor}" fill="#6b6e76" font-size="${model.tickSize}">${esc(`${name} ${year}`)}</text>`,
      );
    });
  } else {
    const span = ms - view.xDomain[0] || 1;
    const count = clamp(Math.floor((plot.right - plot.left) / Math.max(72, measure("000000", model.tickSize))), 2, 8);
    for (const tick of ticks(view.xDomain[0], ms, count)) {
      if (tick < view.xDomain[0] || tick > ms) continue;
      const x = plot.left + ((tick - view.xDomain[0]) / span) * (plot.right - plot.left);
      parts.push(
        `<text x="${px(x)}" y="${px(plot.bottom + model.tickSize + 12)}" text-anchor="middle" fill="#6b6e76" font-size="${model.tickSize}">${esc(formatXNumber(tick))}</text>`,
      );
    }
  }

  const byName = new Map(view.tips.map((tip) => [tip.name, tip]));
  const paintOrder = model.series.slice().sort((a, b) => (byName.get(a.name)?.value ?? 0) - (byName.get(b.name)?.value ?? 0));
  parts.push(`<g clip-path="url(#${uid}-plot)">`);
  for (const series of paintOrder) {
    const d = pathFor(model, series, ms, xOf, yOf);
    if (!d) continue;
    parts.push(
      `<path data-ck-series="${esc(series.name)}" d="${d}" fill="none" stroke="${series.color}" stroke-width="${px(model.stroke)}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  parts.push(`</g>`);

  for (const series of model.series) {
    const tip = byName.get(series.name);
    if (!tip) continue;
    parts.push(
      `<circle data-ck-dot="${esc(series.name)}" cx="${px(tip.x)}" cy="${px(tip.y)}" r="${px(model.stroke + 2.1)}" fill="${series.color}" stroke="#ffffff" stroke-width="1.25"/>`,
    );
  }

  for (const series of model.series) {
    const tip = byName.get(series.name);
    if (!tip || Math.abs(tip.labelY - tip.y) <= model.icon * 0.35) continue;
    const x2 = plot.right + 14;
    parts.push(
      `<line data-ck-leader="1" x1="${px(tip.x + model.stroke + 2)}" y1="${px(tip.y)}" x2="${px(x2)}" y2="${px(tip.labelY)}" stroke="#c5c3be" stroke-width="1"/>`,
    );
  }

  for (const series of model.series) {
    const tip = byName.get(series.name);
    if (!tip) continue;
    const cx = plot.right + 16 + model.icon / 2;
    const value = formatNumber(tip.value, model.digits);
    const valueX = cx + model.icon / 2 + 8;
    const unitX = valueX + measure(value, model.valueSize) + 7;
    const letter = series.iconHref ? "" : esc(series.monogram);
    const iconId = `${uid}-i${model.series.indexOf(series)}`;
    const glyph = series.iconHref
      ? `<clipPath id="${iconId}"><circle cx="${px(cx)}" cy="${px(tip.labelY)}" r="${px(model.icon / 2)}"/></clipPath><image href="${esc(series.iconHref)}" x="${px(cx - model.icon / 2)}" y="${px(tip.labelY - model.icon / 2)}" width="${px(model.icon)}" height="${px(model.icon)}" clip-path="url(#${iconId})" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${px(cx)}" cy="${px(tip.labelY)}" r="${px(model.icon / 2)}" fill="${series.color}"/><text x="${px(cx)}" y="${px(tip.labelY)}" text-anchor="middle" dominant-baseline="central" fill="${inkOn(series.color)}" font-size="${series.monogram.length > 1 ? Math.round(model.icon * 0.38) : Math.round(model.icon * 0.48)}" font-weight="700">${letter}</text>`;
    parts.push(`<g data-ck-tip="${esc(series.name)}">`);
    parts.push(glyph);
    parts.push(
      `<text x="${px(valueX)}" y="${px(tip.labelY)}" dominant-baseline="central" fill="#17181a" font-size="${model.valueSize}" font-weight="700">${esc(value)}</text>`,
    );
    if (model.unit) {
      parts.push(
        `<text x="${px(unitX)}" y="${px(tip.labelY)}" dominant-baseline="central" fill="#8b8d93" font-size="${model.unitSize}" font-weight="400">${esc(model.unit)}</text>`,
      );
    }
    parts.push(`</g>`);
  }

  parts.push(`</svg>`);
  return parts.join("");
}

function renderOdometer(model: Model, ms: number): string {
  const clock = odometerAt(model, ms);
  const size = model.dateSize;
  const baseline = Math.round(model.height * 0.078);
  if (model.mode === "number" || clock.from.year === "" ) {
    return `<text data-ck-odometer="1" x="${px(model.width - model.edge)}" y="${baseline}" text-anchor="end" fill="#17181a" font-size="${size}" font-weight="700" letter-spacing="-0.03em">${esc(clock.label)}</text>`;
  }
  const monthW = measure("Sep", size) + 2;
  const yearW = measure("2026", size) + 2;
  const gap = size * 0.28;
  const right = model.width - model.edge;
  const yearX = right - yearW;
  const monthX = yearX - gap - monthW;
  const clipH = size * 1.2;
  const clipY = baseline - size * 0.78;
  const textY = size * 0.78;
  const slide = size * 0.95;
  const monthText = (label: string, dy: number, opacity: number) =>
    `<text x="0" y="${px(textY + dy)}" fill="#17181a" font-size="${size}" font-weight="700" letter-spacing="-0.03em" opacity="${opacity.toFixed(3)}">${esc(label)}</text>`;
  const yearText = (label: string, dy: number, opacity: number) =>
    `<text x="0" y="${px(textY + dy)}" fill="#17181a" font-size="${size}" font-weight="700" letter-spacing="-0.03em" opacity="${opacity.toFixed(3)}">${esc(label)}</text>`;
  let months = monthText(clock.from.month, 0, 1);
  if (clock.u > 0.001 && clock.u < 0.999 && clock.from.month !== clock.to.month) {
    months = monthText(clock.from.month, -clock.u * slide, 1 - clock.u) + monthText(clock.to.month, (1 - clock.u) * slide, clock.u);
  } else if (clock.u >= 0.999) {
    months = monthText(clock.to.month, 0, 1);
  }
  let years = yearText(clock.from.year, 0, 1);
  if (clock.from.year !== clock.to.year && clock.u > 0.001 && clock.u < 0.999) {
    years = yearText(clock.from.year, -clock.u * slide, 1 - clock.u) + yearText(clock.to.year, (1 - clock.u) * slide, clock.u);
  } else if (clock.u >= 0.999) {
    years = yearText(clock.to.year, 0, 1);
  }
  return `<g data-ck-odometer="1">
    <clipPath id="${model.uid}-m"><rect x="0" y="0" width="${px(monthW)}" height="${px(clipH)}"/></clipPath>
    <clipPath id="${model.uid}-y"><rect x="0" y="0" width="${px(yearW)}" height="${px(clipH)}"/></clipPath>
    <g transform="translate(${px(monthX)} ${px(clipY)})" clip-path="url(#${model.uid}-m)">${months}</g>
    <g transform="translate(${px(yearX)} ${px(clipY)})" clip-path="url(#${model.uid}-y)">${years}</g>
  </g>`;
}

export function createLineRace(options: LineRaceOptions): LineRace {
  const model = buildModel(options);
  return {
    duration: model.duration,
    width: model.width,
    height: model.height,
    fps: model.fps,
    state(t: number) {
      return compute(model, t);
    },
    frame(t: number) {
      return renderFrame(model, compute(model, t));
    },
  };
}

export function mountLineRace(
  host: HTMLElement,
  race: { frame(t: number): string; duration: number },
  options?: { from?: number; loop?: boolean; autoplay?: boolean; onFrame?: (t: number, playing: boolean) => void },
): RacePlayer {
  let t = clamp(options?.from ?? 0, 0, 1);
  let playing = false;
  let raf = 0;
  let last = 0;
  const draw = () => {
    host.innerHTML = race.frame(t);
    options?.onFrame?.(t, playing);
  };
  const tick = (now: number) => {
    if (!playing) return;
    if (!last) last = now;
    const delta = Math.min(80, now - last);
    last = now;
    t += delta / race.duration;
    if (t >= 1) {
      if (options?.loop) t = t % 1;
      else {
        t = 1;
        playing = false;
        draw();
        return;
      }
    }
    draw();
    raf = requestAnimationFrame(tick);
  };
  draw();
  const reduced =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const player: RacePlayer = {
    play() {
      if (t >= 1 && !options?.loop) t = 0;
      playing = true;
      last = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
      options?.onFrame?.(t, playing);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
      options?.onFrame?.(t, playing);
    },
    seek(next: number) {
      t = clamp(next, 0, 1);
      draw();
    },
    destroy() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    get t() {
      return t;
    },
    get playing() {
      return playing;
    },
  };
  if (options?.autoplay && !reduced) player.play();
  return player;
}
