import { formatZoned, zonedTimeTicks } from "../timezone";
import { formatAxisValue, formatValue } from "../format";
import { ch, logTicks, symlogTicks, ticks } from "../svg";
import type { PlotModel } from "./types";

/** Explicit rotate, or −40 when every category label fits once tilted. autoSkip replaces the tilt with a skip. */
export function xAngle(model: PlotModel): number {
  if (typeof model.xAxis.rotate === "number") return model.xAxis.rotate;
  if (model.xAxis.skip === true) return 0;
  if (!model.showX || !model.xAxis.labels || model.x) return 0;
  if (model.orientation === "horizontal" && model.type === "bar") return 0;
  const labels = model.labels;
  if (labels.length < 2) return 0;
  const slot = Math.max(1, (model.width - 64) / labels.length);
  if (widest(labels) <= slot) return 0;
  const rad = (40 * Math.PI) / 180;
  const spun = widest(labels) * Math.abs(Math.cos(rad)) + 11 * Math.abs(Math.sin(rad));
  return spun <= slot ? -40 : 0;
}

export function xStep(model: PlotModel, count: number, angle: number): number {
  if (model.xAxis.ends && count > 1) return count - 1;
  const target = model.xAxis.count;
  if (target === 0) return 0;
  if (target !== undefined) return Math.max(1, Math.ceil(count / Math.max(1, target)));
  if (model.xAxis.skip === false) return 1;
  const slot = Math.max(1, (model.width - 64) / Math.max(1, count));
  const labels = model.labels.length ? model.labels : [];
  if (model.xAxis.skip === true) return Math.max(1, Math.ceil(widest(labels) / slot));
  if (!angle) return count > 8 ? Math.ceil(count / 6) : 1;
  const rad = (Math.abs(angle) * Math.PI) / 180;
  const footprint = widest(labels) * Math.abs(Math.cos(rad)) + 11 * Math.abs(Math.sin(rad));
  return footprint <= slot ? 1 : Math.max(1, Math.ceil(footprint / slot));
}

/** 11px tick labels are about 6.7px per character, plus the 6px anchor gap and a little edge. */
export const TICK_PX = 6.7;

export function widest(labels: string[]): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) {
    const size = ch(labels[i].length, TICK_PX);
    if (size > width) width = size;
  }
  return width;
}

export function resolveTicks(model: PlotModel, key: "x" | "y" | "y2", min: number, max: number, count: number, log: boolean): number[] {
  const axis = key === "y" ? model.yAxis : key === "y2" ? model.y2Axis : model.xAxis;
  if (axis.ends) return max - min > 1e-9 ? [min, max] : [min];
  const values = axis.values;
  if (values && values.length) {
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) if (values[i] >= min - 1e-6 && values[i] <= max + 1e-6) out.push(values[i]);
    return out;
  }
  if (count <= 0) return [];
  const sym = key === "y" ? model.ySym : key === "y2" ? model.y2Sym : false;
  const constant = key === "y2" ? model.symC2 : model.symC;
  const raw = sym ? symlogTicks(min, max, constant) : log ? logTicks(min, max) : ticks(min, max, count);
  const gaps = axis.breaks;
  if (!gaps?.length) return raw;
  return raw.filter((value) => gaps.every((gap) => value <= gap.from || value >= gap.to));
}

function labelStep(model: PlotModel, count: number): number {
  if (model.xAxis.ends && count > 1) return count - 1;
  const target = model.xAxis.count;
  if (target === 0) return 0;
  if (target !== undefined) return Math.max(1, Math.ceil(count / Math.max(1, target)));
  return count > 8 ? Math.ceil(count / 6) : 1;
}

const TICK_MIN = [1, 5, 15, 30, 60, 180, 360, 720, 1440, 2880, 10080, 20160, 43200, 129600, 525600];
const MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec";

export function timeTicks(min: number, max: number, count: number, zone = "UTC"): number[] {
  if (zone !== "UTC") return zonedTimeTicks(min, max, count, zone);
  const span = max - min || 1;
  let step = 525600 * 60000;
  for (let i = 0; i < TICK_MIN.length; i++) {
    const candidate = TICK_MIN[i] * 60000;
    if (span / candidate <= count + 1) {
      step = candidate;
      break;
    }
  }
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 0.001; value += step) {
    if (value >= min - step * 0.001) out.push(value);
  }
  // A 12-tick cap used to stop a month of days in the middle. The last instant
  // is a tick when the nice step lands short of it, so the axis reaches the data.
  if (out.length && span >= 2 * 86400000 && max - out[out.length - 1] > 60000) out.push(max);
  return out.length ? out : [min, max];
}

export function formatTimeLabel(ms: number, span: number, locale: string, format: unknown, zone = "UTC"): string {
  if (format !== undefined) return formatValue(ms, format, locale, zone);
  if (zone !== "UTC") return formatZoned(ms, span, locale, zone);
  const date = new Date(ms);
  if (date.getTime() !== date.getTime()) return "";
  if (locale !== "en-US") {
    const opt: Intl.DateTimeFormatOptions =
      span < 1728e5
        ? { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }
        : span < 6048e6
          ? { timeZone: "UTC", month: "short", day: "numeric" }
          : span < 6912e7
            ? { timeZone: "UTC", month: "short", year: "numeric" }
            : { timeZone: "UTC", year: "numeric" };
    return new Intl.DateTimeFormat(locale, opt).format(date);
  }
  if (span < 1728e5) {
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const h12 = hour % 12 || 12;
    return (h12 < 10 ? "0" : "") + h12 + ":" + (minute < 10 ? "0" : "") + minute + (hour < 12 ? " AM" : " PM");
  }
  const mo = date.getUTCMonth() * 3;
  const mon = MONTHS.slice(mo, mo + 3);
  if (span < 6048e6) return mon + " " + date.getUTCDate();
  const year = date.getUTCFullYear();
  return span < 6912e7 ? mon + " " + year : "" + year;
}

export function tickLabel(model: PlotModel, index: number): string {
  if (index < model.labels.length) return model.labels[index] ?? "";
  const value = model.x?.[index];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function categoryTickText(model: PlotModel, count: number): string[] {
  const step = labelStep(model, count);
  if (step === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i += step) {
    const label = tickLabel(model, i);
    if (label) out.push(label);
  }
  return out;
}

export function tickText(values: number[], model: PlotModel, format: unknown): string[] {
  const digits = tickDigits(values);
  const out = new Array<string>(values.length);
  for (let i = 0; i < values.length; i++) {
    out[i] = format === undefined ? formatNumber(values[i], model.locale, digits) : formatAxisValue(values[i], format, model.locale, values);
  }
  return out;
}

function tickDigits(values: number[]): number {
  let gap = Infinity;
  for (let i = 1; i < values.length; i++) {
    const step = Math.abs(values[i] - values[i - 1]);
    if (step > 0 && step < gap) gap = step;
  }
  if (gap === Infinity) return 0;
  const digits = Math.ceil(-Math.log10(gap / 2));
  if (!Number.isFinite(digits) || digits < 0) return 0;
  return digits > 6 ? 6 : digits;
}

export function formatNumber(value: number, locale: string, digits = 2): string {
  if (Object.is(value, -0) || value === 0) value = 0;
  if (locale === "en-US") {
    const text = formatEn(value, digits);
    if (text !== null) return text;
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}

/** en-US, then strip trailing zeros. Null sends huge or non-finite values to Intl. */
function formatEn(value: number, digits: number): string | null {
  if (!Number.isFinite(value)) return null;
  const neg = value < 0;
  const abs = Math.abs(value);
  if (abs >= 1e15) return null;
  const fixed = abs.toFixed(digits);
  if (fixed.includes("e")) return null;
  const dot = fixed.indexOf(".");
  const whole = dot === -1 ? fixed : fixed.slice(0, dot);
  let frac = dot === -1 ? "" : fixed.slice(dot + 1).replace(/0+$/, "");
  let grouped = "";
  for (let i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 === 0) grouped += ",";
    grouped += whole[i];
  }
  const body = frac ? `${grouped}.${frac}` : grouped;
  return neg ? `-${body}` : body;
}
