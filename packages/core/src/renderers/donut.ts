import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import {
  asNumber,
  channelFormat,
  column,
  fieldOf,
  readFrame,
  readTable,
} from "../frame";
import { closeChart, esc, font, n, openChart, polar } from "../svg";

/**
 * Donut (or pie when mark.innerRadius is 0).
 * encoding.x is the slice category, encoding.y is the slice value.
 */
export function renderDonut(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 420, height: 280 });
  const labelField = fieldOf(frame.encoding.x);
  const valueField = fieldOf(frame.encoding.y);
  const labels = column(table, labelField);
  const values = column(table, valueField).map(asNumber);
  const slices = values.flatMap((value, index) => {
    if (value === null || value <= 0) return [];
    const label = labels[index] === null || labels[index] === undefined ? `Slice ${index + 1}` : String(labels[index]);
    return [{ label, value, color: paint(undefined, frame.preset, index) }];
  });
  if (slices.length === 0) return null;

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const innerRatio = typeof frame.mark.innerRadius === "number" ? frame.mark.innerRadius : 0.6;
  const padAngle = typeof frame.mark.padAngle === "number" ? frame.mark.padAngle : 2;
  const corner = typeof frame.mark.cornerRadius === "number" ? frame.mark.cornerRadius : 0;
  const showLabels = frame.mark.labels === true;
  const valueFormat = channelFormat(frame.encoding.y);
  const showLegend = frame.legend !== false && slices.length > 1;
  const place = showLegend ? frame.legend : "top";
  const legendRow = 20;
  const legendBlock = showLegend && (place === "top" || place === "bottom") ? slices.length * legendRow + 8 : 0;
  const sideLegend = showLegend && (place === "right" || place === "left") ? 168 : 0;

  let y0 = 8;
  const heads: string[] = [];
  if (frame.title) {
    heads.push(text(16, 22, frame.title, cssVar("text", frame.preset.text), 14, "600"));
    y0 = 32;
  }
  if (frame.subtitle) {
    heads.push(text(16, y0 + 12, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "400"));
    y0 += 20;
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
  const outer = size / 2 - (showLabels ? 22 : 8);
  const inner = outer * innerRatio;

  const totalPad = Math.min(padAngle * slices.length, 40);
  const available = Math.max(1, 360 - totalPad);
  let cursor = 0;
  const arcs = slices.map((slice) => {
    const span = (slice.value / total) * available;
    const start = cursor + (padAngle > 0 ? padAngle / 2 : 0);
    const end = start + span;
    cursor = end + (padAngle > 0 ? padAngle / 2 : 0);
    return { ...slice, start, end, percent: (slice.value / total) * 100 };
  });

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "donut" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  parts.push(heads.join(""));

  if (showLegend && place === "top") parts.push(legend(arcs, 16, y0, frame, valueFormat));
  if (showLegend && place === "left") parts.push(legend(arcs, 12, pieY, frame, valueFormat));

  for (const arc of arcs) {
    const path = slicePath(cx, cy, outer, inner, arc.start, arc.end);
    const label = `${arc.label}: ${formatValue(arc.value, valueFormat, frame.locale)} (${formatValue(arc.percent / 100, "percent", frame.locale)})`;
    const radius = corner > 0 ? ` stroke="${arc.color}" stroke-width="${n(Math.min(corner, 8))}" stroke-linejoin="round"` : "";
    parts.push(
      `<path d="${path}" fill="${arc.color}" fill-rule="evenodd"${radius} aria-label="${esc(label)}"><title>${esc(label)}</title></path>`,
    );
    if (showLabels) {
      const mid = (arc.start + arc.end) / 2;
      const point = polar(cx, cy, outer + 12, mid);
      const anchor = point.x < cx - 4 ? "end" : point.x > cx + 4 ? "start" : "middle";
      parts.push(text(point.x, point.y, formatValue(arc.percent / 100, "percent", frame.locale), cssVar("text", frame.preset.text), 11, "500", anchor));
    }
  }

  if (inner > 8) {
    const totalLabel = formatValue(total, valueFormat, frame.locale);
    parts.push(
      `<text x="${n(cx)}" y="${n(cy + 1)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="20" font-weight="700" font-family="${font()}" aria-label="${esc(`Total ${totalLabel}`)}">${esc(totalLabel)}</text>`,
    );
  }

  if (showLegend && place === "bottom") parts.push(legend(arcs, 16, pieY + size + 8, frame, valueFormat));
  if (showLegend && place === "right") parts.push(legend(arcs, pieX + size + 16, pieY, frame, valueFormat));
  parts.push(closeChart());
  return parts.join("");
}

interface ArcSlice {
  label: string;
  value: number;
  color: string;
  percent: number;
}

function legend(slices: ArcSlice[], x: number, y: number, frame: ReturnType<typeof readFrame>, valueFormat: unknown): string {
  return slices
    .map((slice, index) => {
      const dy = y + index * 20;
      const pct = formatValue(slice.percent / 100, "percent", frame.locale);
      const extra = frame.legendValues ? ` ${formatValue(slice.value, valueFormat, frame.locale)}` : "";
      return (
        `<rect x="${n(x)}" y="${n(dy)}" width="10" height="10" rx="2" fill="${slice.color}" />` +
        text(x + 16, dy + 9, slice.label, cssVar("muted", frame.preset.muted), 12, "400", "start") +
        text(x + 108, dy + 9, `${pct}${extra}`, cssVar("text", frame.preset.text), 12, "600", "start")
      );
    })
    .join("");
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
