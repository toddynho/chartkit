import { headingInset } from "../../chrome";
import { asNumber, column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { domainEnds, n, polar } from "../../svg";
import { fill, fmt, openMark, str, text, valueFormat, viewOf } from "./plot";

/**
 * Radial bar and rose on one polar frame.
 * The chart entries import this module. The line bundle does not.
 */

type Kind = "radial-bar" | "rose";
type Stack = "none" | "stack" | "percent";

interface Series {
  name: string;
  values: number[];
}

export function renderPolar(spec: Record<string, unknown>, kind: Kind): string | null {
  const view = viewOf(spec, kind, 520, 460);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yChannels = yList(frame.encoding.y);
  const yFields = yChannels.map((channel) => fieldOf(channel)).filter((field): field is string => Boolean(field));
  const seriesField = fieldOf(frame.encoding.series);
  if (!xField || !yFields.length) return null;

  const labels = column(table, xField).map(str);
  const categories: string[] = [];
  const at = new Map<string, number>();
  for (const label of labels) {
    if (!label || at.has(label)) continue;
    at.set(label, categories.length);
    categories.push(label);
  }
  if (!categories.length) return null;

  const series: Series[] = [];
  if (seriesField && yFields.length === 1) {
    const names = column(table, seriesField).map(str);
    const measure = column(table, yFields[0]).map(asNumber);
    const order: string[] = [];
    const seen = new Set<string>();
    for (const name of names) {
      if (!name || seen.has(name)) continue;
      seen.add(name);
      order.push(name);
    }
    for (const name of order) {
      const values = categories.map(() => 0);
      for (let i = 0; i < table.length; i++) {
        if (names[i] !== name) continue;
        const slot = at.get(labels[i] ?? "");
        if (slot === undefined) continue;
        values[slot] = measure[i] ?? values[slot];
      }
      series.push({ name, values });
    }
  } else {
    yFields.forEach((field, index) => {
      const measure = column(table, field).map(asNumber);
      const values = categories.map(() => 0);
      for (let i = 0; i < table.length; i++) {
        const slot = at.get(labels[i] ?? "");
        if (slot === undefined) continue;
        values[slot] = measure[i] ?? values[slot];
      }
      series.push({ name: seriesTitle(yChannels[index], field), values });
    });
  }
  if (!series.length) return null;

  const mode = stackMode(frame.mark.stack);
  const scaleMax = radiusMax(frame.encoding.y, series, mode);
  const showLegend = frame.legend !== false && series.length > 1;
  const inset = headingInset(frame);
  const legendH = showLegend ? 28 : 8;
  const top = 8 + inset;
  const bottom = frame.height - legendH;
  const cx = frame.width / 2;
  const cy = top + (bottom - top) / 2;
  const outer = Math.max(40, Math.min(cx - 52, (bottom - top) / 2 - 6));
  const innerFrac = fraction(frame.mark.innerRadius, kind === "radial-bar" ? 0.34 : 0);
  const inner = Math.min(outer * innerFrac, outer - 8);
  const start = numberOf(frame.mark.startAngle, 0);
  const pad = Math.min(8, Math.max(0, numberOf(frame.mark.padAngle, kind === "rose" ? 1.2 : 2)));
  const gap = Math.min(0.9, Math.max(0, numberOf(frame.mark.gap, series.length > 1 && mode === "none" ? 0.16 : 0)));
  const corner = Math.max(0, numberOf(frame.mark.cornerRadius, kind === "radial-bar" ? 3 : 0));
  const labelsOn = frame.mark.labels === true;
  const format = valueFormat(frame, spec, yChannels[0], "y");
  const grid = cssVar("grid", frame.preset.grid);
  const ink = cssVar("text", frame.preset.text);
  const muted = cssVar("muted", frame.preset.muted);

  parts.push(`<g data-ck-coordinate="polar">`);
  for (let ring = 1; ring <= 4; ring++) {
    const radius = inner + ((outer - inner) * ring) / 4;
    parts.push(`<circle data-ck-grid="polar" cx="${n(cx)}" cy="${n(cy)}" r="${n(radius)}" fill="none" stroke="${grid}" />`);
  }

  const slot = 360 / categories.length;
  const gutter = Math.min(pad, slot * 0.46);
  const usable = Math.max(0.8, slot - gutter);
  categories.forEach((category, index) => {
    const origin = start + index * slot + gutter / 2;
    const sums = categorySum(series, index);
    if (kind === "radial-bar") {
      const track = sector(cx, cy, inner, outer, origin, origin + usable, 0);
      if (track) parts.push(`<path data-ck-track="1" d="${track}" fill="${grid}" fill-opacity="0.45" />`);
    }
    const grouped = mode === "none" && series.length > 1;
    const innerGap = grouped ? usable * gap : 0;
    const span = grouped ? (usable - innerGap) / series.length : usable;
    const step = grouped ? span + innerGap / series.length : span;
    series.forEach((item, seriesIndex) => {
      const raw = item.values[index] ?? 0;
      const value = raw > 0 ? raw : 0;
      const angle = grouped ? origin + seriesIndex * step : origin;
      const color = fill(frame, series.length === 1 ? index : seriesIndex);
      let r0 = inner;
      let r1 = inner;
      if (mode === "percent") {
        const below = sumBefore(series, index, seriesIndex);
        const total = sums || 1;
        r0 = inner + (outer - inner) * (below / total);
        r1 = inner + (outer - inner) * ((below + value) / total);
      } else if (mode === "stack") {
        const below = sumBefore(series, index, seriesIndex);
        r0 = inner + (outer - inner) * (below / scaleMax);
        r1 = inner + (outer - inner) * ((below + value) / scaleMax);
      } else {
        r1 = inner + (outer - inner) * Math.min(1, value / scaleMax);
      }
      const path = sector(cx, cy, r0, r1, angle, angle + span, corner);
      if (!path) return;
      const shown = fmt(raw, frame.locale, format);
      const label = series.length > 1 ? `${category}, ${item.name}: ${shown}` : `${category}: ${shown}`;
      parts.push(openMark("path", kind, label, `d="${path}" fill="${color}"`, item.name, index));
      parts.push("</path>");
      if (labelsOn && r1 - r0 > 16) {
        const mid = polar(cx, cy, (r0 + r1) / 2, angle + span / 2);
        parts.push(text(mid.x, mid.y + 4, shown, ink, 11, "650", "middle"));
      }
    });
    const mid = polar(cx, cy, outer + 16, origin + usable / 2);
    const anchor = mid.x < cx - 10 ? "end" : mid.x > cx + 10 ? "start" : "middle";
    parts.push(text(mid.x, mid.y, clip(category, 16), muted, 12, "560", anchor));
  });
  parts.push("</g>");

  if (showLegend) {
    let x = 16;
    const y = frame.height - 16;
    series.forEach((item, index) => {
      const name = clip(item.name, 18);
      parts.push(`<rect x="${n(x)}" y="${n(y - 9)}" width="10" height="10" rx="2" fill="${fill(frame, index)}" />`);
      parts.push(text(x + 14, y, name, ink, 12, "500"));
      x += 14 + name.length * 7 + 16;
    });
  }
  return view.done();
}

function yList(channel: unknown): unknown[] {
  return Array.isArray(channel) ? channel : channel === undefined ? [] : [channel];
}

function seriesTitle(channel: unknown, field: string): string {
  if (channel && typeof channel === "object" && "title" in channel) {
    const title = (channel as { title?: unknown }).title;
    if (typeof title === "string" && title) return title;
  }
  return field;
}

function stackMode(value: unknown): Stack {
  return value === "stack" || value === "percent" || value === "none" ? value : "none";
}

function numberOf(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function fraction(value: unknown, fallback: number): number {
  const next = numberOf(value, fallback);
  return Math.min(0.85, Math.max(0, next));
}

function radiusMax(channel: unknown, series: Series[], mode: Stack): number {
  if (mode === "percent") return 1;
  const ends = yList(channel)
    .map((item) => (item && typeof item === "object" && "scale" in item ? domainEnds((item as { scale?: { domain?: unknown } }).scale?.domain)?.[1] : undefined))
    .find((end) => typeof end === "number" && end > 0);
  if (typeof ends === "number") return ends;
  let max = 0;
  if (mode === "stack") {
    const count = series[0]?.values.length ?? 0;
    for (let i = 0; i < count; i++) max = Math.max(max, categorySum(series, i));
  } else {
    for (const item of series) for (const value of item.values) if (value > max) max = value;
  }
  return max > 0 ? max : 1;
}

function categorySum(series: Series[], index: number): number {
  let sum = 0;
  for (const item of series) sum += Math.max(0, item.values[index] ?? 0);
  return sum;
}

function sumBefore(series: Series[], category: number, until: number): number {
  let sum = 0;
  for (let i = 0; i < until; i++) sum += Math.max(0, series[i]?.values[category] ?? 0);
  return sum;
}

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(1, max - 1))}…`;
}

function spanOf(start: number, end: number): number {
  const span = end - start;
  return span < 0 ? span + 360 : span;
}

function sector(cx: number, cy: number, inner: number, outer: number, start: number, end: number, corner: number): string {
  const span = spanOf(start, end);
  if (span < 0.3 || outer - inner < 0.8) return "";
  const rad = Math.min(Math.max(0, corner), (outer - inner) / 2, (outer * span * Math.PI) / 180 / 2.4);
  if (rad < 0.75 || inner <= 0.5) return plain(cx, cy, inner, outer, start, end, span);
  const inset = (rad / outer) * (180 / Math.PI);
  if (inset * 2 >= span - 0.2) return plain(cx, cy, inner, outer, start, end, span);
  const a0 = start + inset;
  const a1 = end - inset;
  const large = spanOf(a0, a1) > 180 ? 1 : 0;
  const outerStart = polar(cx, cy, outer, a0);
  const outerEnd = polar(cx, cy, outer, a1);
  const sideEnd = polar(cx, cy, outer - rad, end);
  const sideStart = polar(cx, cy, outer - rad, start);
  const innerEnd = polar(cx, cy, inner, end);
  const innerStart = polar(cx, cy, inner, start);
  const innerLarge = span > 180 ? 1 : 0;
  return `M ${n(outerStart.x)} ${n(outerStart.y)} A ${n(outer)} ${n(outer)} 0 ${large} 1 ${n(outerEnd.x)} ${n(outerEnd.y)} A ${n(rad)} ${n(rad)} 0 0 1 ${n(sideEnd.x)} ${n(sideEnd.y)} L ${n(innerEnd.x)} ${n(innerEnd.y)} A ${n(inner)} ${n(inner)} 0 ${innerLarge} 0 ${n(innerStart.x)} ${n(innerStart.y)} L ${n(sideStart.x)} ${n(sideStart.y)} A ${n(rad)} ${n(rad)} 0 0 1 ${n(outerStart.x)} ${n(outerStart.y)} Z`;
}

function plain(cx: number, cy: number, inner: number, outer: number, start: number, end: number, span: number): string {
  const large = span > 180 ? 1 : 0;
  const outerStart = polar(cx, cy, outer, start);
  const outerEnd = polar(cx, cy, outer, end);
  if (inner <= 0.5) {
    return `M ${n(cx)} ${n(cy)} L ${n(outerStart.x)} ${n(outerStart.y)} A ${n(outer)} ${n(outer)} 0 ${large} 1 ${n(outerEnd.x)} ${n(outerEnd.y)} Z`;
  }
  const innerEnd = polar(cx, cy, inner, end);
  const innerStart = polar(cx, cy, inner, start);
  return `M ${n(outerStart.x)} ${n(outerStart.y)} A ${n(outer)} ${n(outer)} 0 ${large} 1 ${n(outerEnd.x)} ${n(outerEnd.y)} L ${n(innerEnd.x)} ${n(innerEnd.y)} A ${n(inner)} ${n(inner)} 0 ${large} 0 ${n(innerStart.x)} ${n(innerStart.y)} Z`;
}
