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

export interface PaintScale {
  kind: ColorScaleName;
  fill: (value: number) => string;
  stops: { offset: number; color: string; label: string }[];
  swatches: { color: string; label: string }[] | null;
}

function fmt(value: number): string {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  if (abs >= 100 || Number.isInteger(value)) return value.toFixed(0);
  if (abs >= 10) return value.toFixed(1);
  return value.toFixed(1).replace(/\.0$/, "");
}

export function paintScale(kind: ColorScaleName, values: number[], thresholds: number[] | undefined): PaintScale {
  const finite = values.filter((value) => Number.isFinite(value));
  const lo = finite.length ? Math.min(...finite) : 0;
  const hi = finite.length ? Math.max(...finite) : 1;
  if (kind === "threshold") {
    const cuts = (thresholds ?? []).filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
    const breaks = cuts.length ? cuts : [lo + (hi - lo) / 3, lo + (2 * (hi - lo)) / 3];
    const colors = breaks.length + 1 <= THRESHOLD.length ? THRESHOLD.slice(0, breaks.length + 1) : Array.from({ length: breaks.length + 1 }, (_, i) => ramp(SEQUENTIAL, i / breaks.length));
    const swatches = colors.map((color, index) => {
      const a = index === 0 ? null : breaks[index - 1];
      const b = breaks[index];
      const label = a == null ? `< ${fmt(b ?? hi)}` : b == null ? `≥ ${fmt(a)}` : `${fmt(a)}–${fmt(b)}`;
      return { color, label };
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
    };
  }
  const stops = kind === "diverging" ? DIVERGING : SEQUENTIAL;
  const pivot = kind === "diverging" && lo < 0 && hi > 0 ? 0 : (lo + hi) / 2;
  const span = Math.max(hi - lo, 1e-9);
  const fill = (value: number) => {
    if (kind === "diverging") {
      if (value <= pivot) {
        const t = pivot === lo ? 1 : (value - lo) / (pivot - lo);
        return ramp([stops[0] ?? "#b2182b", stops[1] ?? "#f7f7f7"], t);
      }
      const t = hi === pivot ? 1 : (value - pivot) / (hi - pivot);
      return ramp([stops[1] ?? "#f7f7f7", stops[2] ?? "#2166ac"], t);
    }
    return ramp(stops, (value - lo) / span);
  };
  const legend = kind === "diverging"
    ? [
        { offset: 0, color: stops[0] ?? "#b2182b", label: fmt(lo) },
        { offset: 0.5, color: stops[1] ?? "#f7f7f7", label: fmt(pivot) },
        { offset: 1, color: stops[2] ?? "#2166ac", label: fmt(hi) },
      ]
    : [
        { offset: 0, color: stops[0] ?? "#edf8e9", label: fmt(lo) },
        { offset: 0.5, color: stops[1] ?? "#74c476", label: fmt((lo + hi) / 2) },
        { offset: 1, color: stops[2] ?? "#006d2c", label: fmt(hi) },
      ];
  return { kind, fill, stops: legend, swatches: null };
}

export const POINT_PALETTE = ["#2b6cb0", "#2f855a", "#c05621", "#6b46c1", "#b83280", "#2c7a7b", "#b7791f", "#c53030"];
