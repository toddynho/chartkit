import { annotationLayers, type NoteSeries, type PlotBox } from "./annotations";
import type { Frame } from "./frame";
import { cssVar, paint } from "./theme";
import { esc, font, isRecord, n, padExtent, pickTicks, readAxis, scalePad } from "./svg";

export interface PlotRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Title baseline. Untitled top chrome (legends, calendar month labels) uses the
 * same inset. A legend swatch or month label near y=8 sits flush on a card.
 */
export const CHROME_TOP = 22;

/** Title, then the subtitle under it. Empty when neither is set. */
export function heading(frame: Frame, x = 16): string {
  const bits: string[] = [];
  if (frame.title) bits.push(ink(x, CHROME_TOP, frame.title, cssVar("text", frame.preset.text), 15, "650"));
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

interface FooterLegend {
  title: string;
  items: { name: string; color: string }[];
}

const LEGEND_ROW = 18;

function channelName(channel: unknown): string {
  if (typeof channel === "string" && channel) return channel;
  if (!isRecord(channel)) return "";
  if (typeof channel.title === "string" && channel.title) return channel.title;
  if (typeof channel.lo === "string" && typeof channel.hi === "string") return `${channel.lo}–${channel.hi}`;
  if (typeof channel.field === "string" && channel.field) return channel.field;
  return "";
}

/** An explicit bottom legend. Null keeps the chart's own legend where it already sits. */
function footerLegend(spec: Record<string, unknown>, preset: Frame["preset"]): FooterLegend | null {
  if (!isRecord(spec.legend) || spec.legend.show === false || spec.legend.position !== "bottom") return null;
  const hide = Array.isArray(spec.legend.hide) ? spec.legend.hide.filter((item): item is string => typeof item === "string") : [];
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const names: string[] = [];
  const take = (channel: unknown) => {
    const name = channelName(channel);
    if (name && !names.includes(name) && !hide.includes(name)) names.push(name);
  };
  const y = encoding?.y;
  if (Array.isArray(y)) y.forEach(take);
  else if (y !== undefined) take(y);
  if (!names.length && encoding) {
    const low = channelName(encoding.low);
    const high = channelName(encoding.high);
    if (low && high && !hide.includes(`${low}–${high}`)) names.push(`${low}–${high}`);
  }
  if (!names.length && encoding) {
    for (const key of ["close", "high", "low", "open"]) {
      const name = channelName(encoding[key]);
      if (name && !hide.includes(name)) {
        names.push(name);
        break;
      }
    }
  }
  if (!names.length && !hide.includes("Series")) names.push("Series");
  if (!names.length) return null;
  const title = typeof spec.legend.title === "string" ? spec.legend.title : "";
  return { title, items: names.map((name, index) => ({ name, color: paint(undefined, preset, index) })) };
}

function legendItemWidth(name: string): number {
  return 26 + name.length * 6.6;
}

function legendRows(items: FooterLegend["items"], width: number): FooterLegend["items"][] {
  const rows: FooterLegend["items"][] = [];
  let row: FooterLegend["items"] = [];
  let used = 0;
  for (const item of items) {
    const span = legendItemWidth(item.name);
    if (row.length && used + span > width) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(item);
    used += span;
  }
  if (row.length) rows.push(row);
  return rows;
}

/** Pixels under the x title for a bottom legend. Zero when the legend sits somewhere else. */
export function bottomLegendBand(spec: Record<string, unknown>, preset: Frame["preset"], innerWidth: number): number {
  const legend = footerLegend(spec, preset);
  if (!legend) return 0;
  const rows = legendRows(legend.items, Math.max(80, innerWidth));
  return 8 + (legend.title ? 16 : 0) + Math.max(1, rows.length) * LEGEND_ROW;
}

function bottomLegendMarkup(frame: Frame, legend: FooterLegend, box: PlotRect): string {
  const width = Math.max(80, box.right - box.left);
  const rows = legendRows(legend.items, width);
  const band = 8 + (legend.title ? 16 : 0) + Math.max(1, rows.length) * LEGEND_ROW;
  const y = frame.height - band + 2;
  const fill = cssVar("text", frame.preset.text);
  const parts: string[] = [];
  if (legend.title) {
    parts.push(ink(box.left, y + 11, legend.title, fill, 11, "650"));
  }
  const body = y + (legend.title ? 16 : 0);
  rows.forEach((row, index) => {
    const rowY = body + index * LEGEND_ROW;
    let cx = box.left;
    const bits = row.map((item) => {
      const swatch = `<rect x="${n(cx)}" y="${n(rowY)}" width="10" height="10" rx="2" fill="${item.color}" />`;
      const text = ink(cx + 16, rowY + 9, item.name, fill, 12, "400");
      cx += legendItemWidth(item.name);
      return swatch + text;
    });
    parts.push(`<g data-ck-legend-row="${index}">${bits.join("")}</g>`);
  });
  return `<g data-ck-legend="bottom" data-ck-legend-align="start" data-ck-legend-orient="horizontal" data-ck-legend-at="0">${parts.join("")}</g>`;
}

/** Rotated y title and a centred x title. A bottom legend sits under the x title, in its own band. */
export function axisTitleMarks(frame: Frame, spec: Record<string, unknown>, box: PlotRect): string {
  const y = readAxis(spec, "y");
  const x = readAxis(spec, "x");
  const fill = cssVar("muted", frame.preset.muted);
  const legend = footerLegend(spec, frame.preset);
  const band = legend ? bottomLegendBand(spec, frame.preset, box.right - box.left) : 0;
  let out = "";
  if (y.on && y.title) {
    const mid = (box.top + box.bottom) / 2;
    const angle = y.end ? 90 : -90;
    const xPos = y.end ? frame.width - 14 : 14;
    out += rotated(xPos, mid, y.title, fill, angle);
  }
  if (x.on && x.title) {
    const mid = (box.left + box.right) / 2;
    out += ink(mid, frame.height - 8 - band, x.title, fill, 11, "500", "middle");
  }
  if (legend && band) out += bottomLegendMarkup(frame, legend, box);
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
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
}

function rotated(x: number, y: number, value: string, fill: string, angle: number): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" fill="${fill}" font-size="11" font-weight="500" transform="rotate(${n(angle)} ${n(x)} ${n(y)})">${esc(value)}</text>`;
}
