import { annotationLayers } from "../annotations";
import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import {
  asNumber,
  axisOn,
  axisTitle,
  channelFormat,
  column,
  fieldOf,
  gridStyle,
  readColor,
  readFrame,
  readSizeRange,
  readTable,
  resolveDomain,
  scaleTypeOf,
  wantsZero,
} from "../frame";
import { clipPath, closeChart, domainEnds, esc, font, linear, logNice, logScale, logTicks, n, openChart, ticks } from "../svg";

/** Scatter / bubble. encoding.x and encoding.y are quantitative; size and color are optional. */
export function renderScatter(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 640, height: 360 });
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  const xRaw = column(table, xField);
  const yRaw = column(table, yField);
  const sizeEnc = readSizeRange(frame.encoding.size);
  const colorEnc = readColor(frame.encoding.color);
  const sizeRaw = column(table, sizeEnc?.field);
  const colorRaw = column(table, colorEnc?.field);
  const xLog = scaleTypeOf(frame.encoding.x) === "log";
  const yLog = scaleTypeOf(frame.encoding.y) === "log";

  const categories: string[] = [];
  const points: { x: number; y: number; size: number | null; category?: string }[] = [];
  for (let i = 0; i < table.length; i++) {
    const x = asNumber(xRaw[i]);
    const y = asNumber(yRaw[i]);
    if (x === null || y === null) continue;
    if ((xLog && x <= 0) || (yLog && y <= 0)) continue;
    let category: string | undefined;
    if (colorEnc?.field) {
      category = colorRaw[i] === null || colorRaw[i] === undefined ? "" : String(colorRaw[i]);
      if (!categories.includes(category)) categories.push(category);
    }
    points.push({ x, y, size: sizeEnc ? asNumber(sizeRaw[i]) : null, category });
  }
  if (points.length === 0) return null;

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const xDomain = xLog ? logDomain(xValues, frame.encoding.x) : padDomain(resolveDomain(xValues, frame.encoding.x, wantsZero(frame.encoding.x, false)), frame.encoding.x);
  const yDomain = yLog ? logDomain(yValues, frame.encoding.y) : padDomain(resolveDomain(yValues, frame.encoding.y, wantsZero(frame.encoding.y, false)), frame.encoding.y);
  const sizes = points.map((point) => point.size).filter((value): value is number => value !== null);
  const sizeDomain: [number, number] = sizes.length ? [Math.min(...sizes), Math.max(...sizes)] : [0, 1];
  const radius = sizeEnc?.range ?? [typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : 4, typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : 4];
  const opacity = typeof frame.mark.opacity === "number" ? frame.mark.opacity : 0.75;

  const showLegend = frame.legend !== false && categories.length > 1;
  let top = 16;
  if (frame.title) top = 38;
  if (frame.subtitle) top += 18;
  if (showLegend) top += 22;
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  const xFormat = channelFormat(frame.encoding.x);
  const yFormat = channelFormat(frame.encoding.y);
  const yTicks = yLog ? logTicks(yDomain[0], yDomain[1]) : ticks(yDomain[0], yDomain[1], 5);
  let left = showY ? 56 : 16;
  if (showY) {
    let label = 0;
    for (let i = 0; i < yTicks.length; i++) {
      const size = formatValue(yTicks[i], yFormat, frame.locale).length * 6.7;
      if (size > label) label = size;
    }
    left = Math.max(56, Math.ceil(label + 14));
  }
  const plot = { left, top, right: frame.width - 16, bottom: frame.height - (showX ? 36 : 16) };
  const xScale = xLog ? logScale(xDomain[0], xDomain[1], plot.left, plot.right) : linear(xDomain[0], xDomain[1], plot.left, plot.right);
  const yScale = yLog ? logScale(yDomain[0], yDomain[1], plot.bottom, plot.top) : linear(yDomain[0], yDomain[1], plot.bottom, plot.top);
  const xTicks = xLog ? logTicks(xDomain[0], xDomain[1]) : ticks(xDomain[0], xDomain[1], 5);
  const grid = gridStyle(spec);
  const colorOf = (category: string | undefined, index: number) => {
    if (colorEnc?.constant) return paint(colorEnc.constant, frame.preset, 0);
    if (category === undefined) return paint(undefined, frame.preset, 0);
    const at = Math.max(0, categories.indexOf(category));
    return paint(colorEnc?.range?.[at], frame.preset, at);
  };

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "scatter" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  if (frame.title) parts.push(label(plot.left, 22, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  if (frame.subtitle) parts.push(label(plot.left, frame.title ? 40 : 18, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "400"));
  if (showLegend) {
    let cx = plot.left;
    const bits: string[] = [];
    for (let index = 0; index < categories.length; index++) {
      const category = categories[index] ?? "";
      const width = 28 + category.length * 6.6;
      if (cx > plot.left && cx + width > plot.right) break;
      const color = colorOf(category, index);
      bits.push(`<rect x="${n(cx)}" y="${n(top - 18)}" width="10" height="10" rx="2" fill="${color}" />${label(cx + 16, top - 9, category || " ", cssVar("text", frame.preset.text), 12, "400")}`);
      cx += width;
    }
    parts.push(bits.join(""));
  }

  if (grid && showY) {
    const dash = grid === "dashed" ? ' stroke-dasharray="3 3"' : grid === "dotted" ? ' stroke-dasharray="1 3"' : "";
    for (const tick of yTicks) {
      const y = yScale(tick);
      parts.push(`<line x1="${n(plot.left)}" y1="${n(y)}" x2="${n(plot.right)}" y2="${n(y)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`);
    }
  }

  const finite = (value: number | string): number | null => {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };
  const notes = annotationLayers(spec.annotations, {
    plot,
    preset: frame.preset,
    xAt: (value) => {
      const numeric = finite(value);
      if (numeric === null || (xLog && numeric <= 0)) return null;
      return xScale(numeric);
    },
    yAt: (value, axis) => {
      if (axis === "y2") return null;
      const numeric = finite(value);
      if (numeric === null || (yLog && numeric <= 0)) return null;
      return yScale(numeric);
    },
  });
  parts.push(`<defs>${clipPath(`${frame.id}-clip`, plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top)}</defs>`);
  parts.push(notes.under);
  parts.push(`<g clip-path="url(#${frame.id}-clip)">`);
  points.forEach((point, index) => {
    const raw = point.size === null ? radius[0] : lerp(point.size, sizeDomain[0], sizeDomain[1], radius[0], radius[1]);
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    const room = Math.min(cx - plot.left, plot.right - cx, cy - plot.top, plot.bottom - cy);
    const r = Math.max(0, Math.min(raw, Math.max(0, room)));
    const color = colorOf(point.category, index);
    const name = point.category ? `${point.category}, ` : "";
    const text = `${name}${xField ?? "x"} ${formatValue(point.x, xFormat, frame.locale)}, ${yField ?? "y"} ${formatValue(point.y, yFormat, frame.locale)}`;
    parts.push(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${color}" fill-opacity="${n(opacity)}" aria-label="${esc(text)}"><title>${esc(text)}</title></circle>`,
    );
  });
  parts.push("</g>");
  parts.push(notes.over);

  if (showY) {
    for (const tick of yTicks) {
      parts.push(label(plot.left - 8, yScale(tick) + 4, formatValue(tick, yFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "end"));
    }
    const title = axisTitle(spec, "y");
    if (title) parts.push(label(16, plot.top - 6, title, cssVar("muted", frame.preset.muted), 11, "500"));
  }
  if (showX) {
    for (const tick of xTicks) {
      parts.push(label(xScale(tick), plot.bottom + 16, formatValue(tick, xFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "middle"));
    }
    const title = axisTitle(spec, "x");
    if (title) parts.push(label(plot.right, frame.height - 6, title, cssVar("muted", frame.preset.muted), 11, "500", "end"));
  }
  parts.push(closeChart());
  return parts.join("");
}

function logDomain(values: number[], channel: unknown): [number, number] {
  const explicit = explicitPositiveDomain(channel);
  if (explicit) return explicit;
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (!(value > 0)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [1, 10];
  return logNice(min, max);
}

function explicitPositiveDomain(channel: unknown): [number, number] | null {
  if (typeof channel !== "object" || channel === null || !("scale" in channel)) return null;
  const scale = (channel as { scale?: { domain?: unknown } }).scale;
  const ends = domainEnds(scale?.domain);
  const min = ends?.[0];
  const max = ends?.[1];
  if (typeof min === "number" && typeof max === "number" && min > 0 && max > min) return [min, max];
  return null;
}

function padDomain(domain: [number, number], channel: unknown): [number, number] {
  if (scaleTypeOf(channel) === "log") return domain;
  const explicit = typeof channel === "object" && channel !== null && "scale" in channel;
  const scale = explicit ? (channel as { scale?: { domain?: unknown } }).scale : undefined;
  if (scale && Array.isArray(scale.domain)) return domain;
  const span = domain[1] - domain[0] || 1;
  return [domain[0] - span * 0.06, domain[1] + span * 0.06];
}

function lerp(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return (r0 + r1) / 2;
  const t = Math.min(1, Math.max(0, (value - d0) / (d1 - d0)));
  return r0 + t * (r1 - r0);
}

function label(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
