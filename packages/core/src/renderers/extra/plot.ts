import type { DataTable } from "../../data";
import { formatValue } from "../../format";
import { asNumber, axisOn, column, fieldOf, gridStyle, readFrame, readTable, type Frame } from "../../frame";
import { cssVar, lineStroke, paint } from "../../theme";
import { clipPath, closeChart, esc, font, linear, n, openChart, ticks } from "../../svg";

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
  if (frame.title) parts.push(text(16, 22, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  return { frame, spec, table, parts, done: () => (parts.push(closeChart()), parts.join("")) };
}

export function text(x: number, y: number, value: string, fill: string, size: number, weight = "400", anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
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

export function fmt(value: number, locale: string): string {
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

export function plotBox(frame: Frame, spec: Record<string, unknown>, opts?: { left?: number; bottom?: number }): Box {
  const showY = axisOn(spec, "y");
  const showX = axisOn(spec, "x");
  return {
    left: opts?.left ?? (showY ? 52 : 16),
    top: frame.title ? 40 : 16,
    right: frame.width - 16,
    bottom: frame.height - (opts?.bottom ?? (showX ? 32 : 16)),
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
      return `<line x1="${n(box.left)}" y1="${n(y)}" x2="${n(box.right)}" y2="${n(y)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`;
    })
    .join("");
}

export function yLabels(frame: Frame, spec: Record<string, unknown>, box: Box, values: number[], yAt: (value: number) => number): string {
  if (!axisOn(spec, "y")) return "";
  return values.map((value) => text(box.left - 8, yAt(value) + 4, fmt(value, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "end")).join("");
}

export function xLabels(frame: Frame, spec: Record<string, unknown>, labels: { x: number; text: string }[]): string {
  if (!axisOn(spec, "x")) return "";
  const step = labels.length > 8 ? Math.ceil(labels.length / 6) : 1;
  return labels
    .filter((label, index) => index % step === 0 && label.text)
    .map((label) => text(label.x, frame.height - 12, fit(label.text, 72, 11), cssVar("muted", frame.preset.muted), 11, "400", "middle"))
    .join("");
}

export function axisLine(frame: Frame, box: Box): string {
  return `<line x1="${n(box.left)}" y1="${n(box.bottom)}" x2="${n(box.right)}" y2="${n(box.bottom)}" stroke="${cssVar("axis", frame.preset.axis)}" />`;
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
