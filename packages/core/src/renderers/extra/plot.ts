import type { DataTable } from "../../data";
import { formatAxisValue, formatValue } from "../../format";
import { asNumber, axisOn, channelFormat, column, fieldOf, gridStyle, readFrame, readTable, type Frame } from "../../frame";
import { cssVar, lineStroke, paint } from "../../theme";
import { bottomLegendBand, heading, labelStep, minorTickMarks } from "../../chrome";
import { explicitGrid, gridLines, majorTicks, spine, turned } from "../../axis-ink";
import { clipPath, closeChart, esc, font, isRecord, linear, n, openChart, readAxis, ticks, ch } from "../../svg";

export interface View {
  frame: Frame;
  spec: Record<string, unknown>;
  table: DataTable;
  parts: string[];
  done(): string;
}

export function viewOf(spec: Record<string, unknown>, renderer: string, width: number, height: number): View | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width, height });
  const parts = [openChart({ ...frame, renderer }), `<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`];
  const head = heading(frame, 16);
  if (head) parts.push(head);
  return { frame, spec, table, parts, done: () => (parts.push(closeChart()), parts.join("")) };
}

export function text(x: number, y: number, value: string, fill: string, size: number, weight = "400", anchor = "start", key = ""): string {
  const id = key ? ` data-ck-key="${esc(key)}" direction="ltr" unicode-bidi="isolate"` : "";
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}"${id}>${esc(value)}</text>`;
}

/** Opens a mark that can hold a `<title>`, so a static SVG still has a tooltip. */
export function openMark(tag: string, kind: string, label: string, attrs: string, name?: string, index?: number): string {
  const named = name ? ` data-ck-name="${esc(name)}" data-ck-i="${index ?? 0}"` : "";
  return `<${tag} ${attrs}${named} data-ck-mark="${kind}" aria-label="${esc(label)}"><title>${esc(label)}</title>`;
}

export function fill(frame: Frame, index: number): string {
  return paint(undefined, frame.preset, index);
}

export function stroke(frame: Frame, index: number, width: number): string {
  return lineStroke(fill(frame, index), width, frame.preset.lines);
}

export function num(table: DataTable, field: string | undefined): (number | null)[] {
  return column(table, field).map(asNumber);
}

export function str(value: unknown): string {
  return value == null ? "" : String(value);
}

export function fieldsOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => fieldOf(item) ?? []);
  const one = fieldOf(value);
  return one ? [one] : [];
}

/** Axis format, or the channel format when the axis does not set one. */
export function axisFormat(spec: Record<string, unknown>, channel: unknown, axis: "x" | "y" = "y"): unknown {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[axis]) ? axes[axis] : undefined;
  if (node && node.format !== undefined) return node.format;
  return channelFormat(channel);
}

/** Mark label format, then the encoding format, then the axis format. */
export function valueFormat(frame: Frame, spec: Record<string, unknown>, channel: unknown, axis: "x" | "y" = "y"): unknown {
  if (frame.mark.labelFormat !== undefined) return frame.mark.labelFormat;
  const encoded = channelFormat(channel);
  if (encoded !== undefined) return encoded;
  return axisFormat(spec, channel, axis);
}

export function fmt(value: number, locale: string, format?: unknown): string {
  if (format !== undefined) return formatValue(value, format, locale);
  const abs = Math.abs(value);
  const style = abs >= 10000 ? "compact" : "number";
  return formatValue(value, style, locale);
}

export function formatPercent(fraction: number, locale: string): string {
  return formatValue(fraction, "percent", locale);
}

export function pct(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lo = index | 0;
  const hi = Math.ceil(index);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (index - lo);
}

export function fit(value: string, width: number, size: number): string {
  const max = Math.floor(width / (size * 0.52));
  if (max < 2) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(1, max - 1))}…`;
}

export function radiusOf(frame: Frame): number {
  return typeof frame.mark.cornerRadius === "number" ? frame.mark.cornerRadius : frame.geometry.cornerRadius;
}

export function gapOf(frame: Frame, fallback: number): number {
  const gap = typeof frame.mark.gap === "number" ? frame.mark.gap : frame.geometry.gap;
  return Math.min(0.7, Math.max(0, gap || fallback));
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const TICK_PX = 6.7;

/** Left gutter for 11px tick labels. The label is drawn 8px left of the plot. */
export function yTickGutter(labels: string[], floor = 52): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) width = Math.max(width, ch(labels[i].length, TICK_PX));
  return Math.max(floor, Math.ceil(width + 16));
}

function titleGutter(title: string | undefined, spin: number | undefined): number {
  if (!title) return 0;
  const turned = typeof spin === "number" ? ((spin % 360) + 360) % 360 : 90;
  if (turned === 0 || turned === 180) return Math.ceil(ch(title.length, 6.6)) + 12;
  return 16;
}

export function plotBox(frame: Frame, spec: Record<string, unknown>, opts?: { left?: number; bottom?: number; yTicks?: number[] }): Box {
  const showY = axisOn(spec, "y");
  const showX = axisOn(spec, "x");
  const yAxis = readAxis(spec, "y");
  const xAxis = readAxis(spec, "x");
  const yShift = showY ? Math.max(0, yAxis.offset || 0) : 0;
  const xShift = showX ? Math.max(0, xAxis.offset || 0) : 0;
  let gutter = opts?.left ?? (showY ? 52 : 16);
  if (showY && opts?.yTicks && opts.left === undefined) {
    const format = axisFormat(spec, frame.encoding.y);
    const labels: string[] = [];
    for (let i = 0; i < opts.yTicks.length; i++) labels.push(formatAxisValue(opts.yTicks[i], format, frame.locale, opts.yTicks));
    gutter = yTickGutter(labels);
  }
  const yTitle = showY && opts?.left === undefined ? titleGutter(yAxis.title, yAxis.titleSpin) : 0;
  const yEnd = showY && yAxis.end && opts?.left === undefined;
  const left = gutter + (yEnd ? 0 : yShift + yTitle);
  const rightPad = yEnd ? gutter + yShift + yTitle : 16;
  let top = frame.title ? 40 : 16;
  if (frame.subtitle) top += 18;
  if (showX && xAxis.end) top += 36 + xShift;
  let bottom = opts?.bottom ?? (showX && !xAxis.end ? 32 : 16);
  if (showX && xAxis.title && !xAxis.end) bottom += 14;
  if (showX && !xAxis.end) bottom += xShift;
  const inner = Math.max(80, frame.width - rightPad - left);
  bottom += bottomLegendBand(spec, frame.preset, inner);
  return {
    left,
    top,
    right: frame.width - rightPad,
    bottom: frame.height - bottom,
  };
}

export function clip(frame: Frame, box: Box): string {
  return `<defs>${clipPath(`${frame.id}-p`, box.left, box.top, box.right - box.left, box.bottom - box.top)}</defs>`;
}

export function hGrid(spec: Record<string, unknown>, frame: Frame, box: Box, values: number[], yAt: (value: number) => number): string {
  const grid = gridStyle(spec);
  if (!grid || !axisOn(spec, "y")) return "";
  const dash = grid === "dashed" ? ' stroke-dasharray="3 3"' : grid === "dotted" ? ' stroke-dasharray="1 3"' : "";
  return values
    .map((value) => {
      const y = yAt(value);
      return `<line data-ck-grid="1" x1="${n(box.left)}" y1="${n(y)}" x2="${n(box.right)}" y2="${n(y)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`;
    })
    .join("");
}

export function yLabels(frame: Frame, spec: Record<string, unknown>, box: Box, values: number[], yAt: (value: number) => number): string {
  if (!axisOn(spec, "y")) return "";
  const format = axisFormat(spec, frame.encoding.y);
  const axis = readAxis(spec, "y");
  const step = labelStep(values.length, axis.skip, 1);
  const ink = cssVar("muted", frame.preset.muted);
  const axisInk = cssVar("axis", frame.preset.axis);
  const shown = values.filter((_, index) => index % step === 0);
  const rich = Boolean(axis.rotate || axis.offset || axis.end || axis.tick || axis.tickLen !== undefined || axis.rule);
  const edge = axis.end ? box.right : box.left;
  const shift = axis.offset || 0;
  const labels = rich
    ? shown
        .map((value) => {
          const y = yAt(value) + 4;
          const x = (axis.end ? edge + 8 : edge - 8) + (axis.end ? shift : -shift);
          const label = formatAxisValue(value, format, frame.locale, values);
          return turned(x, y, label, ink, 11, axis.end ? "start" : "end", axis.rotate, "400", `y:${label}`);
        })
        .join("")
    : shown.map((value) => {
        const label = formatAxisValue(value, format, frame.locale, values);
        return text(box.left - 8, yAt(value) + 4, label, ink, 11, "400", "end", `y:${label}`);
      }).join("");
  const minors = minorTickMarks(axis.minor ?? 0, values, yAt, edge, false, axis.end ? 3 : -3, axisInk);
  const ticks = majorTicks(axis, false, edge, shown.map(yAt), axis.end ? 1 : -1, axisInk);
  const rule = axis.rule ? spine(edge + (axis.end ? shift : -shift), box.top, edge + (axis.end ? shift : -shift), box.bottom, axis.rule, axisInk) : "";
  return labels + minors + ticks + rule;
}

export function xLabels(frame: Frame, spec: Record<string, unknown>, labels: { x: number; text: string }[], plot?: { left: number; right: number; top?: number; bottom?: number }): string {
  if (!axisOn(spec, "x")) return "";
  const axis = readAxis(spec, "x");
  const omitted = labels.length > 8 ? Math.ceil(labels.length / 6) : 1;
  const step = labelStep(labels.length, axis.skip, omitted);
  const inner = plot ? Math.max(80, plot.right - plot.left) : Math.max(80, frame.width - 96);
  const baseY = frame.height - bottomLegendBand(spec, frame.preset, inner) - (axis.title ? 26 : 12);
  const shift = axis.offset || 0;
  const y = axis.end && plot?.top !== undefined ? plot.top - 16 - Math.max(0, shift) : (plot?.bottom ?? baseY) + 16 + shift;
  const shown = labels.filter((label, index) => index % step === 0 && label.text);
  const ink = cssVar("muted", frame.preset.muted);
  const textMarks = shown
    .map((label) => {
      const lx = label.x;
      const drawn = fit(label.text, 72, 11);
      if (!axis.rotate) return text(lx, y, drawn, ink, 11, "400", "middle", `x:${label.text}`);
      return turned(lx, y, drawn, ink, 11, "middle", axis.rotate, "400", `x:${label.text}`);
    })
    .join("");
  const edge = axis.end && plot?.top !== undefined ? plot.top : plot?.bottom;
  const axisInk = cssVar("axis", frame.preset.axis);
  const minors = edge === undefined ? "" : minorTickMarks(axis.minor ?? 0, shown.map((label) => label.x), (value) => value, edge, true, axis.end ? -3 : 3, axisInk);
  const ticks = edge === undefined ? "" : majorTicks(axis, true, edge, shown.map((label) => label.x), axis.end ? -1 : 1, axisInk);
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const grid = explicitGrid(axes && isRecord(axes.x) ? axes.x.grid : undefined);
  const gridMarks = grid && plot?.top !== undefined && plot.bottom !== undefined ? gridLines(false, plot.top, plot.bottom, labels.map((label) => label.x), grid, cssVar("grid", frame.preset.grid)) : "";
  return textMarks + minors + ticks + gridMarks;
}

export function axisLine(frame: Frame, box: Box, spec?: Record<string, unknown>): string {
  const fallback = `<line x1="${n(box.left)}" y1="${n(box.bottom)}" x2="${n(box.right)}" y2="${n(box.bottom)}" stroke="${cssVar("axis", frame.preset.axis)}" />`;
  if (!spec) return fallback;
  const axis = readAxis(spec, "x");
  if (!axis.rule && !axis.offset) return fallback;
  if (axis.rule?.on === false) return "";
  return spine(box.left, box.bottom + (axis.offset || 0), box.right, box.bottom + (axis.offset || 0), axis.rule, cssVar("axis", frame.preset.axis));
}

export function countTicks(max: number): number[] {
  const step = Math.max(1, Math.ceil(max / 4));
  const out: number[] = [];
  for (let value = 0; value <= max + step * 1e-6; value += step) out.push(value);
  return out.length > 0 ? out : [0, max];
}

export function domainTicks(min: number, max: number): number[] {
  return ticks(min, max, 5);
}

export function scaleOf(min: number, max: number, bottom: number, top: number): (value: number) => number {
  return linear(min, max, bottom, top);
}
