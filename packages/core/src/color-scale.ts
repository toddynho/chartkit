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
  /** Gradient or binned swatches. `x,y` is the top-left of the block (title, ramp, ticks). */
  legend(x: number, y: number, fill: string): string;
}

/** Title plus ramp plus tick line. Callers keep this much space under the plot. */
export const colorLegendHeight = 46;

const MIN_CONTRAST = 3;

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

function luminance(color: string): number {
  const rgb = hex(color);
  if (!rgb) return 0;
  const lin = (channel: number) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb[0] ?? 0) + 0.7152 * lin(rgb[1] ?? 0) + 0.0722 * lin(rgb[2] ?? 0);
}

function contrast(a: string, b: string): number {
  const left = luminance(a);
  const right = luminance(b);
  const hi = Math.max(left, right);
  const lo = Math.min(left, right);
  return (hi + 0.05) / (lo + 0.05);
}

/** The card the ramp sits on. Soft's plot is transparent, so the light card is the Soft sheet. */
function cardOf(preset: PresetTokens): string {
  if (dark(preset)) return hex(preset.background) ? preset.background : "#0c0c0c";
  return hex(preset.background) ? preset.background : "#f5f5f7";
}

/**
 * Move the low end up the ramp until it clears the card, then resample so the
 * ramp stays in order. The high stop does not move. A custom range is left alone.
 */
function clampLow(stops: string[], card: string): string[] {
  const low = stops[0];
  if (!low || stops.length < 2 || contrast(low, card) >= MIN_CONTRAST) return stops;
  let lo = 0;
  let hi = 1;
  let floor = 1;
  for (let i = 0; i < 16; i++) {
    const t = (lo + hi) / 2;
    if (contrast(sample(stops, t), card) >= MIN_CONTRAST) {
      floor = t;
      hi = t;
    } else lo = t;
  }
  return stops.map((_, index) => sample(stops, floor + (1 - floor) * (index / (stops.length - 1))));
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
  const schemeColors = schemeStops(scheme, preset, kind === "diverging");
  const stops = custom.length >= 2 ? custom : clampLow(schemeColors, cardOf(preset));
  const title =
    record && typeof record.title === "string" && record.title
      ? record.title
      : typeof channel === "string"
        ? channel
        : record && typeof record.field === "string"
          ? record.field
          : "";
  const bins = scale && typeof scale.bins === "number" && scale.bins >= 2 ? Math.min(12, Math.round(scale.bins)) : 5;
  const edges = numbers(scale, "thresholds").sort((a, b) => a - b);
  const cuts = kind === "threshold" ? (edges.length ? edges : [min + (max - min) / 3, min + (2 * (max - min)) / 3]) : [];

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
    swatches = binSwatches(bins, preset, coolBins(min, max, bins, []));
    paint = (value) => swatches[Math.min(bins - 1, Math.floor(unit(value) * bins))] ?? swatches[0] ?? "#007aff";
  } else if (kind === "threshold") {
    swatches = binSwatches(cuts.length + 1, preset, coolBins(min, max, cuts.length + 1, cuts));
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
      const size = 11;
      const barY = y + (title ? 16 : 0);
      const barH = 8;
      const swatch = 16;
      const barW = binned ? Math.max(48, swatches.length * swatch - 4) : 148;
      const labelY = barY + barH + 16;
      const tick = (text: string, at: number, anchor: string) =>
        `<text x="${n(at)}" y="${n(labelY)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-family="${font()}">${esc(text)}</text>`;
      const heading = title
        ? `<text x="${n(x)}" y="${n(y + 11)}" fill="${fill}" font-size="${size}" font-weight="650" font-family="${font()}" data-ck-scale-title="${esc(title)}">${esc(title)}</text>`
        : "";
      const lo = formatTick(min);
      const hi = formatTick(max);
      if (kind === "threshold" || kind === "quantize") {
        const labels = kind === "threshold" ? swatches.map((_, index) => thresholdLabel(index, cuts)) : quantizeLabels(min, max, swatches.length);
        const slot = Math.max(36, ...labels.map((label) => Math.ceil(label.length * 6.6 + 12)));
        const cells = swatches
          .map(
            (color, index) =>
              `<rect x="${n(x + index * slot)}" y="${n(barY)}" width="${n(slot - 4)}" height="${barH}" rx="1" fill="${color}" data-ck-scale="bin" />`,
          )
          .join("");
        const names = labels.map((label, index) => tick(label, x + index * slot + slot / 2, "middle")).join("");
        return `<g data-ck-scale="${kind}">${heading}${cells}${names}</g>`;
      }
      const gradient =
        `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
        stops.map((color, index) => `<stop offset="${n((index / Math.max(1, stops.length - 1)) * 100)}%" stop-color="${color}" />`).join("") +
        `</linearGradient>`;
      const mid =
        kind === "diverging"
          ? `<line x1="${n(x + barW / 2)}" y1="${n(barY + barH)}" x2="${n(x + barW / 2)}" y2="${n(barY + barH + 5)}" stroke="${fill}" stroke-width="1" data-ck-scale="mid" />${tick(formatTick(midpoint), x + barW / 2, "middle")}`
          : "";
      return `<g data-ck-scale="${kind}"><defs>${gradient}</defs>${heading}<rect x="${n(x)}" y="${n(barY)}" width="${barW}" height="${barH}" rx="2" fill="url(#${id})" data-ck-scale="gradient" />${tick(lo, x, "start")}${mid}${tick(hi, x + barW, "end")}</g>`;
    },
  };
}

/** Light to dark. Steps are far enough apart that neighbouring bins do not collapse. */
const SOFT_SEQ = ["#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a", "#172554"];
const NIGHT_SEQ = ["#e0f2fe", "#7dd3fc", "#38bdf8", "#0284c7", "#0369a1"];
const SOFT_COOL = ["#93c5fd", "#2563eb", "#1e3a8a"];
const NIGHT_COOL = ["#e0f2fe", "#38bdf8", "#0369a1"];
const SOFT_WARM = ["#fdba74", "#fb923c", "#ea580c", "#c2410c", "#7c2d12"];
const NIGHT_WARM = ["#fdba74", "#fb923c", "#ea580c", "#c2410c", "#9a3412"];

/** Bins that sit entirely below zero, plus the bin that contains zero when the domain crosses it. */
function coolBins(min: number, max: number, count: number, cuts: number[]): number {
  if (!(min < 0 && max > 0) || count < 2) return 0;
  if (cuts.length) {
    let below = 0;
    for (const cut of cuts) {
      if (cut <= 0) below += 1;
      else break;
    }
    return Math.min(count - 1, Math.max(1, below));
  }
  const step = (max - min) / count;
  let below = 0;
  for (let i = 0; i < count; i++) {
    if (min + step * (i + 1) <= 0) below += 1;
    else break;
  }
  return Math.min(count - 1, Math.max(1, below));
}

function pickStops(palette: string[], count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [palette[Math.min(palette.length - 1, 1)] ?? palette[0] ?? "#1d4ed8"];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round((i / (count - 1)) * (palette.length - 1));
    out.push(palette[index] ?? palette[palette.length - 1] ?? "#1d4ed8");
  }
  return out;
}

/**
 * Ordered bins. A domain that crosses zero diverges: cool on the negative side,
 * warm light-to-dark on the positive side. Otherwise one sequential ramp.
 */
function binSwatches(count: number, preset: PresetTokens, coolCount: number): string[] {
  const night = dark(preset);
  if (coolCount > 0 && coolCount < count) {
    const cool = pickStops(night ? NIGHT_COOL : SOFT_COOL, coolCount).reverse();
    const warm = pickStops(night ? NIGHT_WARM : SOFT_WARM, count - coolCount);
    return [...cool, ...warm];
  }
  return pickStops(night ? NIGHT_SEQ : SOFT_SEQ, count);
}

/** `<6`, `6–12`, `≥12` — the cuts, not the data ends. */
function thresholdLabel(index: number, cuts: number[]): string {
  const last = cuts.length - 1;
  if (index <= 0) return `<${formatTick(cuts[0] ?? 0)}`;
  if (index >= cuts.length) return `≥${formatTick(cuts[last] ?? 0)}`;
  return `${formatTick(cuts[index - 1] ?? 0)}–${formatTick(cuts[index] ?? 0)}`;
}

/** Every quantize edge, in the same slot size as a threshold label. */
function quantizeLabels(min: number, max: number, bins: number): string[] {
  const step = (max - min) / Math.max(1, bins);
  const out: string[] = [];
  for (let i = 0; i < bins; i++) out.push(`${formatTick(min + step * i)}–${formatTick(min + step * (i + 1))}`);
  return out;
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
