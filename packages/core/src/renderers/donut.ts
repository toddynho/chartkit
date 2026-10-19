import { isPaintColumn, matchRule, readRules, resolveColors, withPalette } from "../color";
import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { bag, named } from "../glyphs";
import {
  asNumber,
  channelFormat,
  column,
  fieldOf,
  readColor,
  readFrame,
  readTable,
} from "../frame";
import { closeChart, esc, font, isRecord, n, openChart, polar } from "../svg";

/**
 * Pie and donut share one arc renderer.
 * Pie is the solid chart (hole 0, no pad). Donut keeps the hole and the 2° pad.
 * encoding.x is the slice category, encoding.y is the slice value.
 */
export function renderDonut(spec: Record<string, unknown>): string | null {
  return renderArc(spec, spec.type === "pie" ? "pie" : "donut");
}

export function renderPie(spec: Record<string, unknown>): string | null {
  return renderArc(spec, spec.type === "donut" ? "donut" : "pie");
}

interface Slice {
  label: string;
  value: number;
  color: string;
  other?: boolean;
}

interface Drawn {
  label: string;
  value: number;
  color: string;
  start: number;
  end: number;
  percent: number;
}

function renderArc(spec: Record<string, unknown>, kind: "pie" | "donut"): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 420, height: 280 });
  const preset = withPalette(frame.preset, frame.mark);
  const labelField = fieldOf(frame.encoding.x);
  const valueField = fieldOf(frame.encoding.y);
  const labels = column(table, labelField);
  const values = column(table, valueField).map(asNumber);
  const kept: { label: string; value: number; source: number }[] = [];
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (value === null || value <= 0) continue;
    const label = labels[index] === null || labels[index] === undefined ? `Slice ${index + 1}` : String(labels[index]);
    kept.push({ label, value, source: index });
  }
  if (kept.length === 0) return null;

  const colorEnc = readColor(frame.encoding.color);
  const colorField = colorEnc?.field;
  const colorColumn = colorField ? column(table, colorField) : null;
  const rules = readRules(frame.mark);
  const painted = resolveColors({
    count: kept.length,
    values: kept.map((slice) => slice.value),
    labels: kept.map((slice) => slice.label),
    raw: colorColumn ? kept.map((slice) => colorColumn[slice.source]) : null,
    range: colorEnc?.range,
    domain: colorEnc?.domain,
    constant: colorEnc?.constant,
    rules,
    preset,
    fallback: paint(undefined, preset, 0),
    categorical: Boolean(
      colorEnc?.domain ||
        colorEnc?.range ||
        (colorColumn && !isPaintColumn(colorColumn)) ||
        (colorField && colorField === labelField),
    ),
  });
  let slices: Slice[] = kept.map((slice, index) => ({
    label: slice.label,
    value: slice.value,
    color: painted?.[index] ?? paint(undefined, preset, index),
  }));

  const other = readOther(frame.mark);
  if (other && other.threshold > 0) {
    const sum = slices.reduce((total, slice) => total + slice.value, 0);
    const small = slices.filter((slice) => slice.value / sum < other.threshold);
    const big = slices.filter((slice) => slice.value / sum >= other.threshold);
    if (small.length > 0 && big.length > 0) {
      const value = small.reduce((total, slice) => total + slice.value, 0);
      slices = big.concat({
        label: other.label,
        value,
        color: matchRule(value, rules, preset) ?? paint(undefined, preset, big.length),
        other: true,
      });
    }
  }

  const sort = named(frame.mark.sort, ["none", "asc", "desc"]);
  if (sort === "asc") slices.sort((a, b) => a.value - b.value || a.label.localeCompare(b.label));
  else if (sort === "desc") slices.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  else {
    const index = slices.findIndex((slice) => slice.other);
    if (index >= 0 && index < slices.length - 1) {
      const [bucket] = slices.splice(index, 1);
      if (bucket) slices.push(bucket);
    }
  }

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const innerRatio = typeof frame.mark.innerRadius === "number" ? frame.mark.innerRadius : kind === "pie" ? 0 : 0.6;
  const padAngle = typeof frame.mark.padAngle === "number" ? frame.mark.padAngle : kind === "pie" ? 0 : 2;
  const corner = typeof frame.mark.cornerRadius === "number" ? frame.mark.cornerRadius : 0;
  const startAngle = typeof frame.mark.startAngle === "number" ? frame.mark.startAngle : 0;
  const explode = Array.isArray(frame.mark.explode)
    ? frame.mark.explode.filter((item): item is string => typeof item === "string")
    : null;
  const offset = typeof frame.mark.offset === "number" ? frame.mark.offset : explode && explode.length ? 12 : 0;
  const labelAt = named(frame.mark.labelPosition, ["top", "bottom", "left", "right", "center", "inside", "outside"]);
  const showLabels = frame.mark.labels === true || labelAt !== "" || frame.mark.labelFormat !== undefined;
  const inside = labelAt === "inside" || labelAt === "center";
  const leaders = showLabels && !inside;
  const valueFormat = frame.mark.labelFormat ?? channelFormat(frame.encoding.y);
  const place = legendPlace(spec, frame.width, frame.height, frame.legend !== false && slices.length > 1);
  const showLegend = place !== false;
  const legendRow = 20;
  const longest = slices.reduce((max, slice) => Math.max(max, slice.label.length), 0);
  const sideWidth = Math.min(240, Math.max(148, 36 + longest * 7 + 48));
  const legendBlock = showLegend && (place === "top" || place === "bottom") ? slices.length * legendRow + 8 : 0;
  const sideLegend = showLegend && (place === "right" || place === "left") ? sideWidth : 0;

  let y0 = 8;
  let subtitleY = 0;
  if (frame.title) y0 = 36;
  if (frame.subtitle) {
    subtitleY = y0 + 14;
    y0 += 22;
  }

  const width = frame.width;
  const height = frame.height;
  const availW = width - sideLegend - 16;
  const availH = height - y0 - legendBlock - 12;
  const size = Math.max(48, Math.min(availW, availH));
  const pieX = place === "left" ? width - size - 8 : place === "right" ? 8 : (width - sideLegend - size) / 2;
  const pieY = place === "bottom" ? y0 + 4 : y0 + (place === "top" ? legendBlock : 0) + Math.max(0, (availH - size) / 2);
  const cx = pieX + size / 2;
  const cy = pieY + size / 2;
  const margin = leaders ? 56 : showLabels ? 22 : 8;
  const outer = Math.max(12, size / 2 - margin - (offset > 0 ? Math.min(offset, 24) : 0));
  const inner = outer * innerRatio;

  const totalPad = Math.min(padAngle * slices.length, 40);
  const available = Math.max(1, 360 - totalPad);
  let cursor = startAngle;
  const arcs: Drawn[] = slices.map((slice) => {
    const span = (slice.value / total) * available;
    const start = cursor + (padAngle > 0 ? padAngle / 2 : 0);
    const end = start + span;
    cursor = end + (padAngle > 0 ? padAngle / 2 : 0);
    return { ...slice, start, end, percent: (slice.value / total) * 100 };
  });

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: kind }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  if (frame.title) parts.push(text(pieX, 22, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  if (frame.subtitle) parts.push(text(pieX, subtitleY, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "400"));

  if (showLegend && place === "top") parts.push(legend(arcs, 8, y0, frame, valueFormat, width - 8));
  if (showLegend && place === "left") parts.push(legend(arcs, 12, pieY, frame, valueFormat, 12 + sideWidth - 8));

  const held = bag();
  let labelSvg = "";
  const pending: Leader[] = [];
  for (let index = 0; index < arcs.length; index++) {
    const arc = arcs[index];
    if (!arc) continue;
    const mid = (arc.start + arc.end) / 2;
    const moved = offset > 0 && (!explode || explode.includes(arc.label));
    const origin = moved ? polar(cx, cy, offset, mid) : { x: cx, y: cy };
    const path = slicePath(origin.x, origin.y, outer, inner, arc.start, arc.end);
    const label = `${arc.label}: ${formatValue(arc.value, valueFormat, frame.locale)} (${formatValue(arc.percent / 100, "percent", frame.locale)})`;
    const radius = corner > 0 ? ` stroke="${arc.color}" stroke-width="${n(Math.min(corner, 8))}" stroke-linejoin="round"` : "";
    parts.push(
      `<path d="${path}" fill="${arc.color}" fill-rule="evenodd"${radius} data-ck-name="${esc(arc.label)}" data-ck-i="${index}" aria-label="${esc(label)}"><title>${esc(label)}</title></path>`,
    );
    if (!showLabels) continue;
    const body = frame.mark.labelFormat !== undefined
      ? formatValue(arc.value, valueFormat, frame.locale)
      : formatValue(arc.percent / 100, "percent", frame.locale);
    if (inside) {
      const at = inner > 8 ? (inner + outer) / 2 : outer * 0.55;
      const point = polar(origin.x, origin.y, at, mid);
      const anchor = point.x < cx - 4 ? "end" : point.x > cx + 4 ? "start" : "middle";
      labelSvg += held.put(body, point.x, point.y, anchor, cssVar("text", frame.preset.text));
      continue;
    }
    const tip = polar(origin.x, origin.y, outer, mid);
    pending.push({
      text: body,
      side: tip.x >= cx ? 1 : -1,
      y: tip.y,
      tipX: tip.x,
      tipY: tip.y,
      elbow: polar(origin.x, origin.y, outer + 8, mid),
      color: arc.color,
    });
  }

  if (leaders && pending.length) {
    stackLabels(pending, pieY + 14, pieY + size - 14);
    const rightX = Math.min(width - sideLegend - 6, cx + outer + 18);
    const leftX = Math.max(6, cx - outer - 18);
    for (const item of pending) {
      const labelX = item.side > 0 ? rightX : leftX;
      const joinX = item.side > 0 ? labelX - 8 : labelX + 8;
      labelSvg +=
        `<polyline points="${n(item.tipX)},${n(item.tipY)} ${n(item.elbow.x)},${n(item.elbow.y)} ${n(joinX)},${n(item.y)} ${n(labelX)},${n(item.y)}" fill="none" stroke="${item.color}" stroke-width="1" />` +
        `<text x="${n(labelX)}" y="${n(item.y)}" text-anchor="${item.side > 0 ? "start" : "end"}" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="12" font-weight="400" font-family="${font()}">${esc(item.text)}</text>`;
    }
  }

  if (inner > 8) {
    const totalLabel = formatValue(total, valueFormat, frame.locale);
    parts.push(
      `<text x="${n(cx)}" y="${n(cy + 1)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="20" font-weight="700" font-family="${font()}" aria-label="${esc(`Total ${totalLabel}`)}">${esc(totalLabel)}</text>`,
    );
  }

  if (labelSvg) parts.push(labelSvg);
  if (showLegend && place === "bottom") parts.push(legend(arcs, 8, pieY + size + 8, frame, valueFormat, width - 8));
  if (showLegend && place === "right") parts.push(legend(arcs, pieX + size + 16, pieY, frame, valueFormat, pieX + size + sideWidth - 8));
  parts.push(closeChart());
  return parts.join("");
}

interface Leader {
  text: string;
  side: number;
  y: number;
  tipX: number;
  tipY: number;
  elbow: { x: number; y: number };
  color: string;
}

/** Stack one side so labels keep a 16px gap, then pull the run back into the pie box. */
function stackLabels(items: Leader[], minY: number, maxY: number): void {
  const gap = 16;
  for (const side of [1, -1]) {
    const group = items.filter((item) => item.side === side).sort((a, b) => a.y - b.y);
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const item = group[i];
      if (prev && item && item.y < prev.y + gap) item.y = prev.y + gap;
    }
    const last = group[group.length - 1];
    if (last && last.y > maxY) {
      const shift = last.y - maxY;
      for (const item of group) item.y -= shift;
    }
    const first = group[0];
    if (first && first.y < minY) {
      const shift = minY - first.y;
      for (const item of group) item.y += shift;
    }
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const item = group[i];
      if (prev && item && item.y < prev.y + gap) item.y = prev.y + gap;
    }
  }
}

function readOther(mark: Record<string, unknown>): { threshold: number; label: string } | null {
  if (typeof mark.other === "number") return { threshold: mark.other, label: "Other" };
  if (isRecord(mark.other) && typeof mark.other.threshold === "number") {
    const label = typeof mark.other.label === "string" && mark.other.label ? mark.other.label : "Other";
    return { threshold: mark.other.threshold, label };
  }
  return null;
}

interface ArcSlice {
  label: string;
  value: number;
  color: string;
  percent: number;
}

function legendPlace(
  spec: Record<string, unknown>,
  width: number,
  height: number,
  show: boolean,
): "top" | "right" | "bottom" | "left" | false {
  if (!show || spec.legend === false) return false;
  if (isRecord(spec.legend)) {
    if (spec.legend.show === false) return false;
    const position = spec.legend.position;
    if (position === "top" || position === "right" || position === "bottom" || position === "left") return position;
  }
  return width >= height * 2 ? "right" : "bottom";
}

function legend(
  slices: ArcSlice[],
  x: number,
  y: number,
  frame: ReturnType<typeof readFrame>,
  valueFormat: unknown,
  valueRight: number,
): string {
  const valueWidth = frame.legendValues ? 112 : 68;
  return slices
    .map((slice, index) => {
      const dy = y + index * 20;
      const pct = formatValue(slice.percent / 100, "percent", frame.locale);
      const extra = frame.legendValues ? ` ${formatValue(slice.value, valueFormat, frame.locale)}` : "";
      const labelX = x + 16;
      const label = fitLabel(slice.label, Math.max(12, valueRight - valueWidth - labelX));
      return (
        `<rect x="${n(x)}" y="${n(dy)}" width="10" height="10" rx="2" fill="${slice.color}" />` +
        text(labelX, dy + 9, label, cssVar("muted", frame.preset.muted), 12, "400", "start") +
        text(valueRight, dy + 9, `${pct}${extra}`, cssVar("text", frame.preset.text), 12, "600", "end")
      );
    })
    .join("");
}

/** 12px labels are about 6.6px per character. Keep the value column clear of the name. */
function fitLabel(label: string, maxPx: number): string {
  const maxChars = Math.max(1, Math.floor(maxPx / 6.6));
  if (label.length <= maxChars) return label;
  if (maxChars <= 1) return "…";
  return `${label.slice(0, maxChars - 1)}…`;
}

function slicePath(cx: number, cy: number, outer: number, inner: number, start: number, end: number): string {
  const span = end - start;
  if (span >= 359.9) {
    const outerRing = `M ${n(cx)} ${n(cy - outer)} A ${n(outer)} ${n(outer)} 0 1 1 ${n(cx)} ${n(cy + outer)} A ${n(outer)} ${n(outer)} 0 1 1 ${n(cx)} ${n(cy - outer)}`;
    if (inner <= 0.5) return `${outerRing} Z`;
    const hole = `M ${n(cx)} ${n(cy - inner)} A ${n(inner)} ${n(inner)} 0 1 0 ${n(cx)} ${n(cy + inner)} A ${n(inner)} ${n(inner)} 0 1 0 ${n(cx)} ${n(cy - inner)}`;
    return `${outerRing} ${hole} Z`;
  }
  const outerStart = polar(cx, cy, outer, start);
  const outerEnd = polar(cx, cy, outer, end);
  const large = span > 180 ? 1 : 0;
  if (inner <= 0.5) {
    return `M ${n(cx)} ${n(cy)} L ${n(outerStart.x)} ${n(outerStart.y)} A ${n(outer)} ${n(outer)} 0 ${large} 1 ${n(outerEnd.x)} ${n(outerEnd.y)} Z`;
  }
  const innerEnd = polar(cx, cy, inner, end);
  const innerStart = polar(cx, cy, inner, start);
  return `M ${n(outerStart.x)} ${n(outerStart.y)} A ${n(outer)} ${n(outer)} 0 ${large} 1 ${n(outerEnd.x)} ${n(outerEnd.y)} L ${n(innerEnd.x)} ${n(innerEnd.y)} A ${n(inner)} ${n(inner)} 0 ${large} 0 ${n(innerStart.x)} ${n(innerStart.y)} Z`;
}

function text(
  x: number,
  y: number,
  value: string,
  fill: string,
  size: number,
  weight: string,
  anchor = "start",
): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
