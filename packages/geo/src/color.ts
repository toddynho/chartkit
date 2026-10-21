import type { ColorScaleName } from "./types";

const SEQUENTIAL = ["#edf8e9", "#74c476", "#006d2c"];
const DIVERGING = ["#b2182b", "#f7f7f7", "#2166ac"];
const THRESHOLD = ["#f7f7f7", "#c7e9c0", "#74c476", "#238b45", "#00441b"];

function channel(hex: string, index: number): number {
  return Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
}

function lerp(a: string, b: string, t: number): string {
  const mix = (index: number) => Math.round(channel(a, index) + (channel(b, index) - channel(a, index)) * t);
  const hex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${hex(mix(0))}${hex(mix(1))}${hex(mix(2))}`;
}

export function ramp(stops: readonly string[], t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(x));
  const from = stops[index] ?? stops[0] ?? "#999999";
  const to = stops[index + 1] ?? from;
  return lerp(from, to, x - index);
}

export interface ScaleFormat {
  /** Data is already in percent points: 50 formats as 50%. */
  percent?: boolean;
  suffix?: string;
  decimals?: number;
}

export interface SizeStop {
  value: number;
  label: string;
}

export interface PaintScale {
  kind: ColorScaleName;
  fill: (value: number) => string;
  stops: { offset: number; color: string; label: string }[];
  swatches: { color: string; label: string }[] | null;
  title: string;
  domain: [number, number];
  /** Bubble legend when size, not colour, is the key. */
  sizes: SizeStop[] | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** `%` and `percent-raw` both mean the number is already a percent. */
export function parseFormat(format: unknown): ScaleFormat {
  if (format === "%" || format === "percent" || format === "percent-raw") return { percent: true };
  if (typeof format === "string") return format ? { suffix: format.startsWith(" ") || format.startsWith("%") ? format : ` ${format}` } : {};
  if (!isRecord(format)) return {};
  const style = typeof format.style === "string" ? format.style : "";
  const decimals = typeof format.decimals === "number" ? format.decimals : undefined;
  if (style === "%" || style === "percent" || style === "percent-raw") return { percent: true, decimals };
  const suffix = typeof format.suffix === "string" ? format.suffix : "";
  return suffix || decimals != null ? { suffix, decimals } : {};
}

export function formatNumber(value: number, format: ScaleFormat): string {
  if (!Number.isFinite(value)) return "";
  const cleaned = Object.is(value, -0) ? 0 : value;
  const decimals = format.decimals ?? (Number.isInteger(cleaned) ? 0 : Math.abs(cleaned) >= 10 ? 0 : 1);
  const text = cleaned.toFixed(decimals).replace(/\.0+$/, "");
  if (format.percent) return `${text}%`;
  return `${text}${format.suffix ?? ""}`;
}

function roundStep(value: number, step: number): number {
  const next = Math.round((value / step) * 1e8) / 1e8;
  const out = Math.round(next) * step;
  const snapped = Math.round(out * 1e8) / 1e8;
  return Object.is(snapped, -0) ? 0 : snapped;
}

/** 1-2-2.5-5 steps. Picks a count near `count` without stretching the domain. */
export function niceTicks(min: number, max: number, count = 5): { lo: number; hi: number; step: number; ticks: number[] } {
  if (!(max > min) || !Number.isFinite(min) || !Number.isFinite(max)) {
    const origin = Number.isFinite(min) ? min : 0;
    return { lo: origin, hi: origin + 1, step: 1, ticks: [origin, origin + 1] };
  }
  const span = max - min;
  const exp = Math.floor(Math.log10(span / Math.max(1, count - 1)));
  let best: { lo: number; hi: number; step: number; ticks: number[]; score: number } | null = null;
  for (let e = exp - 1; e <= exp + 2; e++) {
    for (const factor of [1, 2, 2.5, 5]) {
      const step = factor * 10 ** e;
      if (!(step > 0) || (factor === 2.5 && step < 10)) continue;
      const lo = Math.floor(min / step + 1e-9) * step;
      const hi = Math.ceil(max / step - 1e-9) * step;
      const n = Math.round((hi - lo) / step) + 1;
      if (n < 3 || n > 7) continue;
      const ticks: number[] = [];
      for (let i = 0; i < n; i++) ticks.push(roundStep(lo + i * step, step));
      const extension = (min - ticks[0]!) + (ticks[ticks.length - 1]! - max);
      const score = Math.abs(n - count) + (extension / span) * 8;
      if (!best || score < best.score) best = { lo: ticks[0]!, hi: ticks[ticks.length - 1]!, step, ticks, score };
    }
  }
  if (!best) return { lo: min, hi: max, step: span, ticks: [min, max] };
  return { lo: best.lo, hi: best.hi, step: best.step, ticks: best.ticks };
}

export function sizeStops(values: number[], format: ScaleFormat): SizeStop[] {
  const finite = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!finite.length) return [];
  const lo = Math.min(...finite);
  const hi = Math.max(...finite);
  const ticks = niceTicks(lo, hi, 4).ticks.filter((value) => value >= lo * 0.8 && value <= hi * 1.08 && value > 0);
  const picked = ticks.length >= 2 ? ticks.slice(0, 4) : [lo, hi];
  return picked.map((value) => ({ value, label: formatNumber(value, format) }));
}

export function paintScale(
  kind: ColorScaleName,
  values: number[],
  thresholds: number[] | undefined,
  format: ScaleFormat = {},
  title = "",
): PaintScale {
  const finite = values.filter((value) => Number.isFinite(value));
  const dataLo = finite.length ? Math.min(...finite) : 0;
  const dataHi = finite.length ? Math.max(...finite) : 1;
  const label = (value: number) => formatNumber(value, format);
  if (kind === "threshold") {
    const cuts = (thresholds ?? []).filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
    const breaks = cuts.length ? cuts : [dataLo + (dataHi - dataLo) / 3, dataLo + (2 * (dataHi - dataLo)) / 3];
    const colors = breaks.length + 1 <= THRESHOLD.length ? THRESHOLD.slice(0, breaks.length + 1) : Array.from({ length: breaks.length + 1 }, (_, i) => ramp(SEQUENTIAL, i / breaks.length));
    const swatches = colors.map((color, index) => {
      const a = index === 0 ? null : breaks[index - 1];
      const b = breaks[index];
      const text = a == null ? `< ${label(b ?? dataHi)}` : b == null ? `≥ ${label(a)}` : `${label(a)}–${label(b)}`;
      return { color, label: text };
    });
    return {
      kind,
      fill: (value) => {
        let index = breaks.findIndex((cut) => value < cut);
        if (index < 0) index = colors.length - 1;
        return colors[index] ?? colors[colors.length - 1] ?? "#999999";
      },
      stops: [],
      swatches,
      title,
      domain: [dataLo, dataHi],
      sizes: null,
    };
  }
  const nice = niceTicks(dataLo, dataHi, 5);
  const lo = nice.lo;
  const hi = nice.hi;
  const rampStops = kind === "diverging" ? DIVERGING : SEQUENTIAL;
  const pivot = kind === "diverging" && lo < 0 && hi > 0 ? 0 : (lo + hi) / 2;
  const span = Math.max(hi - lo, 1e-9);
  const fill = (value: number) => {
    if (kind === "diverging") {
      if (value <= pivot) {
        const t = pivot === lo ? 1 : (value - lo) / (pivot - lo);
        return ramp([rampStops[0] ?? "#b2182b", rampStops[1] ?? "#f7f7f7"], t);
      }
      const t = hi === pivot ? 1 : (value - pivot) / (hi - pivot);
      return ramp([rampStops[1] ?? "#f7f7f7", rampStops[2] ?? "#2166ac"], t);
    }
    return ramp(rampStops, (value - lo) / span);
  };
  const stops = nice.ticks.map((value) => ({
    offset: (value - lo) / span,
    color: fill(value),
    label: label(value),
  }));
  return { kind, fill, stops, swatches: null, title, domain: [lo, hi], sizes: null };
}

export const POINT_PALETTE = ["#2b6cb0", "#2f855a", "#c05621", "#6b46c1", "#b83280", "#2c7a7b", "#b7791f", "#c53030"];
