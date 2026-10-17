import { cssVar, paint, type PresetTokens } from "./theme";
import { esc, font, isRecord, n } from "./svg";

export interface PlotBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface AnnotationGeom {
  plot: PlotBox;
  preset: PresetTokens;
  xAt: (value: number | string) => number | null;
  yAt: (value: number | string, axis: "y" | "y2") => number | null;
}

/** Bands sit under the marks. Rules and labels sit above, outside the plot clip. */
export function annotationLayers(notes: unknown, geom: AnnotationGeom): { under: string; over: string } {
  if (!Array.isArray(notes)) return { under: "", over: "" };
  const under: string[] = [];
  const over: string[] = [];
  for (const item of notes) {
    if (!isRecord(item)) continue;
    if (item.type === "band") band(item, geom, under, over);
    else if (item.type === "rule") rule(item, geom, over);
    else if (item.type === "text") textNote(item, geom, over);
  }
  return { under: under.join(""), over: over.join("") };
}

function band(item: Record<string, unknown>, geom: AnnotationGeom, under: string[], over: string[]): void {
  const axis = axisOf(item);
  const from = pos(geom, axis, item.from);
  const to = pos(geom, axis, item.to);
  if (from === null || to === null) return;
  const opacity = typeof item.opacity === "number" ? item.opacity : 0.12;
  const color = markColor(item.color, geom.preset);
  const { plot } = geom;
  if (axis === "x") {
    const x = Math.min(from, to);
    const width = Math.abs(to - from);
    under.push(`<rect data-ck-annotation="band" x="${n(x)}" y="${n(plot.top)}" width="${n(width)}" height="${n(plot.bottom - plot.top)}" fill="${color}" fill-opacity="${n(opacity)}" stroke="none" />`);
  } else {
    const y = Math.min(from, to);
    const height = Math.abs(to - from);
    under.push(`<rect data-ck-annotation="band" x="${n(plot.left)}" y="${n(y)}" width="${n(plot.right - plot.left)}" height="${n(height)}" fill="${color}" fill-opacity="${n(opacity)}" stroke="none" />`);
  }
  if (typeof item.label === "string") {
    const at = axis === "x" ? Math.min(from, to) : Math.min(from, to);
    over.push(label(item.label, axis === "x" ? at + 4 : plot.left + 4, axis === "x" ? plot.top + 14 : at + 14, "start", color));
  }
}

function rule(item: Record<string, unknown>, geom: AnnotationGeom, over: string[]): void {
  const axis = axisOf(item);
  const at = pos(geom, axis, item.value);
  if (at === null) return;
  const color = markColor(item.color, geom.preset);
  const dash = item.dash === "solid" || item.dash === "dotted" ? item.dash : "dashed";
  const dashAttr = dash === "dashed" ? ' stroke-dasharray="4 3"' : dash === "dotted" ? ' stroke-dasharray="1.5 3"' : "";
  const { plot } = geom;
  const where = item.labelPosition === "start" || item.labelPosition === "center" ? item.labelPosition : "end";
  if (axis === "x") {
    over.push(`<line data-ck-annotation="rule" x1="${n(at)}" y1="${n(plot.top)}" x2="${n(at)}" y2="${n(plot.bottom)}" stroke="${color}" stroke-width="1"${dashAttr} />`);
    if (typeof item.label === "string") {
      const y = where === "start" ? plot.bottom - 4 : where === "center" ? (plot.top + plot.bottom) / 2 : plot.top + 12;
      over.push(label(item.label, at + 4, y, "start", color));
    }
    return;
  }
  over.push(`<line data-ck-annotation="rule" x1="${n(plot.left)}" y1="${n(at)}" x2="${n(plot.right)}" y2="${n(at)}" stroke="${color}" stroke-width="1"${dashAttr} />`);
  if (typeof item.label === "string") {
    const x = where === "start" ? plot.left + 4 : where === "center" ? (plot.left + plot.right) / 2 : plot.right - 4;
    const anchor = where === "start" ? "start" : where === "center" ? "middle" : "end";
    over.push(label(item.label, x, at - 4, anchor, color));
  }
}

function textNote(item: Record<string, unknown>, geom: AnnotationGeom, over: string[]): void {
  if (typeof item.label !== "string") return;
  const xValue = typeof item.x === "number" || typeof item.x === "string" ? item.x : null;
  if (xValue === null) return;
  const x = geom.xAt(xValue);
  if (x === null) return;
  const y = typeof item.y === "number" || typeof item.y === "string" ? pos(geom, "y", item.y) : geom.plot.top + 14;
  if (y === null) return;
  over.push(label(item.label, x, y, "start", markColor(item.color, geom.preset), "text"));
}

function label(text: string, x: number, y: number, anchor: string, color: string, kind = "rule"): string {
  return `<text data-ck-annotation="${kind}" x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${color}" font-size="11" font-weight="600" font-family="${font()}">${esc(text)}</text>`;
}

function axisOf(item: Record<string, unknown>): "x" | "y" | "y2" {
  return item.axis === "x" || item.axis === "y2" ? item.axis : "y";
}

function pos(geom: AnnotationGeom, axis: "x" | "y" | "y2", value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  return axis === "x" ? geom.xAt(value) : geom.yAt(value, axis === "y2" ? "y2" : "y");
}

function markColor(color: unknown, preset: PresetTokens): string {
  if (typeof color === "string" && color.length > 0) return paint(color, preset, 0);
  return cssVar("accent", preset.accent);
}
