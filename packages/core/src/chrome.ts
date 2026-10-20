import { annotationLayers, type NoteSeries, type PlotBox } from "./annotations";
import type { Frame } from "./frame";
import { cssVar } from "./theme";
import { esc, font, isRecord, n, padExtent, pickTicks, readAxis, scalePad } from "./svg";

export interface PlotRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Title, then the subtitle under it. Empty when neither is set. */
export function heading(frame: Frame, x = 16): string {
  const bits: string[] = [];
  if (frame.title) bits.push(ink(x, 22, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  if (frame.subtitle) bits.push(ink(x, frame.title ? 40 : 18, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "400"));
  return bits.join("");
}

/** Extra plot inset so a title and subtitle sit above the marks. */
export function headingInset(frame: Frame): number {
  return (frame.title ? 24 : 0) + (frame.subtitle ? 18 : 0);
}

function channelsOf(channels: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const item of channels) {
    if (Array.isArray(item)) out.push(...item);
    else out.push(item);
  }
  return out;
}

/**
 * Keeps the computed extent unless a channel sets `scale.domain`.
 * A set end replaces that side. Both ends replace the extent.
 */
export function lockDomain(min: number, max: number, channels: unknown[]): [number, number] {
  const list = channelsOf(channels);
  let pad = null as ReturnType<typeof scalePad>;
  for (const item of list) {
    const next = scalePad(item);
    if (next) pad = next;
  }
  for (const item of list) {
    if (!isRecord(item) || !isRecord(item.scale) || !Array.isArray(item.scale.domain)) continue;
    const domain = item.scale.domain;
    let lo = min;
    let hi = max;
    const lock: [number | null, number | null] = [null, null];
    if (typeof domain[0] === "number" && Number.isFinite(domain[0])) {
      lo = domain[0];
      lock[0] = domain[0];
    }
    if (typeof domain[1] === "number" && Number.isFinite(domain[1])) {
      hi = domain[1];
      lock[1] = domain[1];
    }
    if (!(hi > lo)) hi = lo + 1;
    return padExtent(lo, hi, pad, lock);
  }
  return padExtent(min, max, pad, null);
}

/**
 * `axes.*.ticks` as exact values, or as a count. Exact values outside the
 * domain are dropped. When none remain, the automatic ticks stay.
 */
export function chooseTicks(spec: Record<string, unknown>, key: "x" | "y" | "y2", min: number, max: number, auto: number[]): number[] {
  const axis = readAxis(spec, key);
  if (axis.values && axis.values.length) {
    const kept = axis.values.filter((value) => value >= min - 1e-9 && value <= max + 1e-9);
    return kept.length ? kept : auto;
  }
  if (typeof axis.count === "number") return pickTicks(min, max, axis.count);
  return auto;
}

/** Rotated y title and a centred x title. Omitted when the axis is hidden or untitled. */
export function axisTitleMarks(frame: Frame, spec: Record<string, unknown>, box: PlotRect): string {
  const y = readAxis(spec, "y");
  const x = readAxis(spec, "x");
  const fill = cssVar("muted", frame.preset.muted);
  let out = "";
  if (y.on && y.title) {
    const mid = (box.top + box.bottom) / 2;
    const angle = y.end ? 90 : -90;
    const xPos = y.end ? frame.width - 14 : 14;
    out += rotated(xPos, mid, y.title, fill, angle);
  }
  if (x.on && x.title) {
    const mid = (box.left + box.right) / 2;
    out += ink(mid, frame.height - 8, x.title, fill, 11, "500", "middle");
  }
  return out;
}

export function categoryX(labels: string[], xAt: (index: number) => number): (value: number | string) => number | null {
  return (value) => {
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < labels.length) return xAt(value);
    const index = labels.indexOf(String(value));
    return index >= 0 ? xAt(index) : null;
  };
}

/** Bands under the clip, rules and trendlines above it. Samples let a trendline fit. */
export function placedNotes(
  spec: Record<string, unknown>,
  frame: Frame,
  box: PlotRect,
  xAt: (value: number | string) => number | null,
  yAt: (value: number) => number,
  samples: NoteSeries[],
  labels?: string[],
): { under: string; over: string } {
  return annotationLayers(spec.annotations, {
    plot: box as PlotBox,
    preset: frame.preset,
    xAt,
    yAt: (value, axis) => {
      if (axis === "y2") return null;
      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numeric) ? yAt(numeric) : null;
    },
    samples,
    labels,
  });
}

function ink(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}

function rotated(x: number, y: number, value: string, fill: string, angle: number): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" fill="${fill}" font-size="11" font-weight="500" font-family="${font()}" transform="rotate(${n(angle)} ${n(x)} ${n(y)})">${esc(value)}</text>`;
}
