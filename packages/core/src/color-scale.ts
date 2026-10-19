import type { PresetTokens } from "./theme";
import { cssVar } from "./theme";
import { esc, font, hash, isRecord, n } from "./svg";

/** Continuous colour. Position scales stay on `$defs/scale`; these types are colour-only. */
export type ScaleKind = "sequential" | "diverging" | "quantize" | "threshold";

export interface ColorScale {
  kind: ScaleKind;
  domain: [number, number];
  midpoint: number;
  binned: boolean;
  paint(value: number): string;
  /** Gradient or binned swatches. `x,y` is the top-left of the bar. */
  legend(x: number, y: number, fill: string): string;
}

const KINDS = new Set<string>(["sequential", "diverging", "quantize", "threshold"]);
const SCHEMES = new Set(["blue", "teal", "orange", "violet"]);

function dark(preset: PresetTokens): boolean {
  return preset.background === "#0c0c0c" || preset.text === "#ffffff";
}

/** Soft ramps stay in the blue/orange family. Midnight uses brighter stops on the same scheme names. */
function schemeStops(name: string, preset: PresetTokens, diverging: boolean): string[] {
  const night = dark(preset);
  if (diverging) return night ? ["#38bdf8", "#a1a1aa", "#fb923c"] : ["#007aff", "#f5f5f7", "#ff9500"];
  const scheme = SCHEMES.has(name) ? name : "blue";
  if (night) {
    if (scheme === "teal") return ["#134e4a", "#2dd4bf", "#ccfbf1"];
    if (scheme === "orange") return ["#7c2d12", "#fb923c", "#ffedd5"];
    if (scheme === "violet") return ["#4c1d95", "#a78bfa", "#ede9fe"];
    return ["#0c4a6e", "#38bdf8", "#e0f2fe"];
  }
  if (scheme === "teal") return ["#ccfbf1", "#0d9488", "#134e4a"];
  if (scheme === "orange") return ["#ffedd5", "#ff9500", "#9a3412"];
  if (scheme === "violet") return ["#ede9fe", "#7c3aed", "#4c1d95"];
  return ["#dbeafe", "#007aff", "#1e3a8a"];
}

function hex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const value = parseInt(match[1] ?? "", 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(a: string, b: string, t: number): string {
  const from = hex(a);
  const to = hex(b);
  if (!from || !to) return t < 0.5 ? a : b;
  const u = Math.min(1, Math.max(0, t));
  const channel = (index: number) => Math.round((from[index] ?? 0) + ((to[index] ?? 0) - (from[index] ?? 0)) * u);
  return `#${[0, 1, 2].map((index) => channel(index).toString(16).padStart(2, "0")).join("")}`;
}

function sample(stops: string[], t: number): string {
  if (stops.length === 0) return "#007aff";
  if (stops.length === 1) return stops[0] ?? "#007aff";
  const u = Math.min(1, Math.max(0, t));
  const scaled = u * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return mix(stops[index] ?? stops[0] ?? "#007aff", stops[index + 1] ?? stops[index] ?? "#007aff", scaled - index);
}

function numbers(scale: Record<string, unknown> | undefined, key: string): number[] {
  const raw = scale?.[key];
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

/**
 * A colour scale when the channel asks for one.
 * `fallback` is the heatmap/calendar path: a numeric field with no constant uses sequential.
 * A custom `range` of two or more colours replaces the named scheme.
 */
export function readColorScale(channel: unknown, preset: PresetTokens, values: ArrayLike<number>, fallback: boolean): ColorScale | null {
  const record = isRecord(channel) ? channel : undefined;
  const scale = record && isRecord(record.scale) ? record.scale : undefined;
  const named = scale && typeof scale.type === "string" && KINDS.has(scale.type) ? (scale.type as ScaleKind) : null;
  const quantitative = record?.type === "quantitative";
  if (!named && !quantitative && !fallback) return null;
  const kind: ScaleKind = named ?? "sequential";
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) max = min + 1;
  const domain = numbers(scale, "domain");
  if (typeof domain[0] === "number") min = domain[0];
  if (typeof domain[1] === "number") max = domain[1];
  if (!(max > min)) max = min + 1;
  const midpoint = scale && typeof scale.midpoint === "number" ? scale.midpoint : (min + max) / 2;
  const scheme = scale && typeof scale.scheme === "string" ? scale.scheme : "blue";
  const custom = record && Array.isArray(record.range) ? record.range.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
  const stops = custom.length >= 2 ? custom : schemeStops(scheme, preset, kind === "diverging");
  const bins = scale && typeof scale.bins === "number" && scale.bins >= 2 ? Math.min(12, Math.round(scale.bins)) : 5;
  const edges = numbers(scale, "thresholds").sort((a, b) => a - b);

  const unit = (value: number) => {
    if (kind === "diverging") {
      if (value <= midpoint) return 0.5 * Math.min(1, Math.max(0, (value - min) / (midpoint - min || 1)));
      return 0.5 + 0.5 * Math.min(1, Math.max(0, (value - midpoint) / (max - midpoint || 1)));
    }
    return Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  };

  let paint: (value: number) => string;
  let swatches: string[] = [];
  if (kind === "quantize") {
    swatches = Array.from({ length: bins }, (_, index) => sample(stops, bins === 1 ? 0 : index / (bins - 1)));
    paint = (value) => swatches[Math.min(bins - 1, Math.floor(unit(value) * bins))] ?? swatches[0] ?? "#007aff";
  } else if (kind === "threshold") {
    const cuts = edges.length ? edges : [min + (max - min) / 3, min + (2 * (max - min)) / 3];
    swatches = Array.from({ length: cuts.length + 1 }, (_, index) => sample(stops, cuts.length === 0 ? 0 : index / cuts.length));
    paint = (value) => {
      const index = cuts.findIndex((edge) => value < edge);
      return swatches[index < 0 ? cuts.length : index] ?? swatches[0] ?? "#007aff";
    };
  } else {
    paint = (value) => sample(stops, unit(value));
  }

  const id = `cks${hash(`${kind}|${min}|${max}|${midpoint}|${stops.join("|")}|${swatches.join("|")}`)}`;
  const binned = kind === "quantize" || kind === "threshold";
  return {
    kind,
    domain: [min, max],
    midpoint,
    binned,
    paint,
    legend(x, y, fill) {
      const label = (text: string, at: number, anchor: string) =>
        `<text x="${n(at)}" y="${n(y + 22)}" text-anchor="${anchor}" fill="${fill}" font-size="10" font-family="${font()}">${esc(text)}</text>`;
      const lo = formatTick(min);
      const hi = formatTick(max);
      if (binned) {
        const cells = swatches
          .map((color, index) => `<rect x="${n(x + 28 + index * 14)}" y="${n(y)}" width="12" height="10" rx="1" fill="${color}" data-ck-scale="bin" />`)
          .join("");
        return `<g data-ck-scale="${kind}">${label(lo, x, "start")}${cells}${label(hi, x + 28 + swatches.length * 14 + 4, "start")}</g>`;
      }
      const gradient =
        `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
        stops.map((color, index) => `<stop offset="${n((index / Math.max(1, stops.length - 1)) * 100)}%" stop-color="${color}" />`).join("") +
        `</linearGradient>`;
      return `<g data-ck-scale="${kind}"><defs>${gradient}</defs>${label(lo, x, "start")}<rect x="${n(x + 28)}" y="${n(y)}" width="88" height="10" rx="2" fill="url(#${id})" data-ck-scale="gradient" />${label(hi, x + 122, "start")}</g>`;
    },
  };
}

function formatTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 10000 || abs < 0.01)) return value.toExponential(0);
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

/** Muted label colour for a scale legend sitting on the preset. */
export function scaleLabel(preset: PresetTokens): string {
  return cssVar("muted", preset.muted);
}
