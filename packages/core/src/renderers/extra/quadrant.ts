import type { Frame } from "../../frame";
import { cssVar } from "../../theme";
import { clamp, domainEnds, isRecord, linear, n } from "../../svg";
import { cells, channel, rowAt, tableOf, textAt } from "./fields";
import { fill, fit, openMark, text, viewOf } from "./plot";

export interface QuadrantPoint {
  index: number;
  name: string;
  x: number | null;
  y: number | null;
  size: number | null;
  color: string;
  fields: { x: string; y: string };
}

export interface QuadrantModel {
  points: QuadrantPoint[];
  xDomain: [number, number];
  yDomain: [number, number];
  xEnds: [string, string];
  yEnds: [string, string];
  names: [string, string, string, string];
}

export function readQuadrant(spec: Record<string, unknown>): QuadrantModel | null {
  const read = tableOf(spec);
  if (!read) return null;
  const { table, encoding } = read;
  const fields = table.fields;
  const xField = channel(encoding, "x", "x", fields);
  const yField = channel(encoding, "y", "y", fields);
  if (!xField || !yField) return null;
  const nameField = fields.includes("name") ? "name" : fields.includes("label") ? "label" : undefined;
  const sizeField = channel(encoding, "size", "size", fields);
  const colorField = channel(encoding, "color", "color", fields);
  const xs = cells(table, xField);
  const ys = cells(table, yField);
  const names = cells(table, nameField);
  const sizes = cells(table, sizeField);
  const colors = cells(table, colorField);
  const points: QuadrantPoint[] = [];
  for (let index = 0; index < table.length; index++) {
    points.push({
      index,
      name: textAt(names[index]) || `Point ${index + 1}`,
      x: numberAt(xs[index]),
      y: numberAt(ys[index]),
      size: numberAt(sizes[index]),
      color: textAt(colors[index]),
      fields: { x: xField, y: yField },
    });
  }
  return {
    points,
    xDomain: domainOf(encoding.x),
    yDomain: domainOf(encoding.y),
    xEnds: endsOf(encoding.x, ["Low", "High"]),
    yEnds: endsOf(encoding.y, ["Low", "High"]),
    names: quadNames(spec.quadrants),
  };
}

/** Four labeled quadrants, axis-end captions, and points in a shared domain. */
export function renderQuadrant(spec: Record<string, unknown>): string | null {
  const model = readQuadrant(spec);
  if (!model || model.points.length === 0) return null;
  const view = viewOf(spec, "quadrant", 680, 520);
  if (!view) return null;
  const { frame, parts } = view;
  if (frame.subtitle) parts.push(text(16, frame.title ? 40 : 22, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "500"));
  const box = { left: 116, top: (frame.title ? 56 : 36) + (frame.subtitle ? 16 : 0), right: frame.width - 28, bottom: frame.height - 48 };
  const xAt = linear(model.xDomain[0], model.xDomain[1], box.left, box.right);
  const yAt = linear(model.yDomain[0], model.yDomain[1], box.bottom, box.top);
  const midX = (model.xDomain[0] + model.xDomain[1]) / 2;
  const midY = (model.yDomain[0] + model.yDomain[1]) / 2;
  const splitX = xAt(midX);
  const splitY = yAt(midY);
  const quads = [
    { name: model.names[0], x: box.left, y: box.top, w: splitX - box.left, h: splitY - box.top, fill: cssVar("positive", frame.preset.positive) },
    { name: model.names[1], x: splitX, y: box.top, w: box.right - splitX, h: splitY - box.top, fill: cssVar("accent", frame.preset.accent) },
    { name: model.names[2], x: box.left, y: splitY, w: splitX - box.left, h: box.bottom - splitY, fill: cssVar("track", frame.preset.track) },
    { name: model.names[3], x: splitX, y: splitY, w: box.right - splitX, h: box.bottom - splitY, fill: cssVar("negative", frame.preset.negative) },
  ];
  quads.forEach((quad, index) => {
    const label = quad.name || `Quadrant ${index + 1}`;
    parts.push(openMark("rect", "quadrant", label, `x="${n(quad.x)}" y="${n(quad.y)}" width="${n(quad.w)}" height="${n(quad.h)}" fill="${quad.fill}" fill-opacity="0.14"`));
    parts.push("</rect>");
  });
  const captions = [
    { text: quads[0].name, x: box.left + 14, y: box.top + 22, anchor: "start" },
    { text: quads[1].name, x: box.right - 14, y: box.top + 22, anchor: "end" },
    { text: quads[2].name, x: box.left + 14, y: box.bottom - 14, anchor: "start" },
    { text: quads[3].name, x: box.right - 14, y: box.bottom - 14, anchor: "end" },
  ];
  for (const caption of captions) {
    if (!caption.text) continue;
    parts.push(text(caption.x, caption.y, fit(caption.text, 180, 13), cssVar("muted", frame.preset.muted), 13, "650", caption.anchor));
  }
  parts.push(`<line x1="${n(splitX)}" y1="${n(box.top)}" x2="${n(splitX)}" y2="${n(box.bottom)}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
  parts.push(`<line x1="${n(box.left)}" y1="${n(splitY)}" x2="${n(box.right)}" y2="${n(splitY)}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
  parts.push(text(box.left, box.bottom + 22, model.xEnds[0], cssVar("muted", frame.preset.muted), 11, "500"));
  parts.push(text(box.right, box.bottom + 22, model.xEnds[1], cssVar("muted", frame.preset.muted), 11, "500", "end"));
  parts.push(text(box.left - 12, box.bottom - 2, model.yEnds[0], cssVar("muted", frame.preset.muted), 11, "500", "end"));
  parts.push(text(box.left - 12, box.top + 12, model.yEnds[1], cssVar("muted", frame.preset.muted), 11, "500", "end"));

  model.points.forEach((point, index) => {
    if (point.x == null || point.y == null) return;
    const cx = xAt(point.x);
    const cy = yAt(point.y);
    const radius = clamp(point.size ?? 8, 4, 18);
    const color = pointPaint(frame, point.color, index);
    const label = `${point.name}: ${trim(point.x)}, ${trim(point.y)}`;
    parts.push(openMark("circle", "point", label, `cx="${n(cx)}" cy="${n(cy)}" r="${n(radius)}" fill="${color}" stroke="${cssVar("surface", frame.preset.surface)}" stroke-width="2"`));
    parts.push("</circle>");
    const labelWidth = Math.min(140, point.name.length * 6.8 + 8);
    const nearRight = cx + radius + labelWidth > box.right - 8;
    parts.push(text(cx + (nearRight ? -radius - 6 : radius + 6), cy + 4, fit(point.name, labelWidth, 12), cssVar("text", frame.preset.text), 12, "600", nearRight ? "end" : "start"));
  });
  return view.done();
}

function domainOf(channelValue: unknown): [number, number] {
  const ends = isRecord(channelValue) && isRecord(channelValue.scale) ? domainEnds(channelValue.scale.domain) : undefined;
  const min = ends?.[0];
  const max = ends?.[1];
  if (typeof min === "number" && typeof max === "number" && max > min) return [min, max];
  return [0, 1];
}

function endsOf(channelValue: unknown, fallback: [string, string]): [string, string] {
  if (!isRecord(channelValue) || typeof channelValue.title !== "string") return fallback;
  const parts = channelValue.title.split("|").map((part) => part.trim());
  return [parts[0] || fallback[0], parts[1] || fallback[1]];
}

function quadNames(quadrants: unknown): [string, string, string, string] {
  if (!Array.isArray(quadrants)) return ["", "", "", ""];
  const parts = quadrants.map((item) => (typeof item === "string" ? item.trim() : ""));
  return [parts[0] ?? "", parts[1] ?? "", parts[2] ?? "", parts[3] ?? ""];
}

function numberAt(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pointPaint(frame: Frame, color: string, index: number): string {
  if (color === "positive" || color === "done") return cssVar("positive", frame.preset.positive);
  if (color === "negative" || color === "crit") return cssVar("negative", frame.preset.negative);
  if (color === "accent" || color === "active") return cssVar("accent", frame.preset.accent);
  if (color === "muted") return cssVar("muted", frame.preset.muted);
  return color ? fill(frame, index) : cssVar("accent", frame.preset.accent);
}

function trim(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function quadrantRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}
