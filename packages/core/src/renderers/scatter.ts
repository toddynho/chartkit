import { annotationLayers } from "../annotations";
import { readColorScale, scaleLabel } from "../color-scale";
import { readRules, resolveColors, withPalette } from "../color";
import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { bag, glyphOf, marker, named, nudge } from "../glyphs";
import {
  asNumber,
  axisOn,
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
import { boxId, clipPath, closeChart, domainEnds, esc, font, isRecord, linear, logNice, logScale, logTicks, n, openChart, pickTicks, readAxis, readInset } from "../svg";

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

  const preset = withPalette(frame.preset, spec.mark);
  const colorNums: number[] = [];
  for (let i = 0; i < colorRaw.length; i++) {
    const value = asNumber(colorRaw[i]);
    if (value !== null) colorNums.push(value);
  }
  const ramp = colorNums.length ? readColorScale(frame.encoding.color, preset, colorNums, false) : null;
  const categories: string[] = [];
  const points: { x: number; y: number; size: number | null; category?: string; tone?: number; index: number }[] = [];
  for (let i = 0; i < table.length; i++) {
    const x = asNumber(xRaw[i]);
    const y = asNumber(yRaw[i]);
    if (x === null || y === null) continue;
    if ((xLog && x <= 0) || (yLog && y <= 0)) continue;
    let category: string | undefined;
    let tone: number | undefined;
    if (ramp) tone = asNumber(colorRaw[i]) ?? undefined;
    else if (colorEnc?.field) {
      category = colorRaw[i] === null || colorRaw[i] === undefined ? "" : String(colorRaw[i]);
      if (!categories.includes(category)) categories.push(category);
    }
    points.push({ x, y, size: sizeEnc ? asNumber(sizeRaw[i]) : null, category, tone, index: i });
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
  const yMark = isRecord(frame.encoding.y) ? frame.encoding.y : undefined;
  const shape = glyphOf(yMark?.pointShape) || glyphOf(frame.mark.pointShape) || "circle";
  const hollow = yMark?.pointFill === "hollow" || frame.mark.pointFill === "hollow";
  const labelAt = named(frame.mark.labelPosition, ["top", "bottom", "left", "right", "center", "inside", "outside"]);
  const showLabels = frame.mark.labels === true || labelAt !== "" || frame.mark.labelFormat !== undefined;

  const showLegend = !ramp && frame.legend !== false && categories.length > 1;
  let top = 16;
  if (frame.title) top = 38;
  if (frame.subtitle) top += 18;
  if (showLegend) top += 22;
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  const xFormat = channelFormat(frame.encoding.x);
  const yFormat = channelFormat(frame.encoding.y);
  const yAxis = readAxis(spec, "y");
  const xAxis = readAxis(spec, "x");
  const yTicks = pickTicks(yDomain[0], yDomain[1], yAxis.count ?? 5, yAxis.values, yLog);
  let left = showY ? 56 : 16;
  if (showY) {
    let label = 0;
    for (let i = 0; i < yTicks.length; i++) {
      const size = formatValue(yTicks[i], yFormat, frame.locale).length * 6.7;
      if (size > label) label = size;
    }
    left = Math.max(56, Math.ceil(label + 14));
  }
  const inset = readInset(spec);
  const yRight = yAxis.end;
  let plotLeft = showY && yAxis.labels && !yRight ? left : 16;
  let plotRight = frame.width - (showY && yAxis.labels && yRight ? left : 16);
  let plotTop = top;
  let plotBottom = frame.height - (showX && xAxis.labels ? (xAxis.end ? 16 : 36) : 16);
  if (xAxis.end && showX && xAxis.labels) plotTop += 28;
  if (yAxis.title) {
    if (yRight) plotRight -= 16;
    else plotLeft += 16;
  }
  if (xAxis.title) {
    if (xAxis.end) plotTop += 22;
    else plotBottom -= 16;
  }
  if (inset.l !== undefined) plotLeft = Math.max(plotLeft, inset.l);
  if (inset.r !== undefined) plotRight = Math.min(plotRight, frame.width - inset.r);
  if (inset.t !== undefined) plotTop = Math.max(plotTop, inset.t);
  if (inset.b !== undefined) plotBottom = Math.min(plotBottom, frame.height - inset.b);
  if (showLabels) {
    const pos = labelAt || "top";
    if (pos === "top" || pos === "outside") plotTop += 16;
    if (pos === "bottom") plotBottom -= 14;
    if (pos === "left") plotLeft += 28;
    if (pos === "right") plotRight -= 28;
  }
  if (ramp) plotBottom -= 24;
  const plot = { left: plotLeft, top: plotTop, right: Math.max(plotLeft + 1, plotRight), bottom: Math.max(plotTop + 1, plotBottom) };
  const xRev = scaleReverse(frame.encoding.x);
  const yRev = scaleReverse(frame.encoding.y);
  const xScale = xLog
    ? logScale(xDomain[0], xDomain[1], xRev ? plot.right : plot.left, xRev ? plot.left : plot.right)
    : linear(xDomain[0], xDomain[1], xRev ? plot.right : plot.left, xRev ? plot.left : plot.right);
  const yScale = yLog
    ? logScale(yDomain[0], yDomain[1], yRev ? plot.top : plot.bottom, yRev ? plot.bottom : plot.top)
    : linear(yDomain[0], yDomain[1], yRev ? plot.top : plot.bottom, yRev ? plot.bottom : plot.top);
  const xTicks = pickTicks(xDomain[0], xDomain[1], xAxis.count ?? 5, xAxis.values, xLog);
  const grid = gridStyle(spec);
  const rules = readRules(spec.mark);
  const resolved = resolveColors({
    count: points.length,
    values: points.map((point) => point.y),
    labels: points.map((point) => point.category ?? ""),
    raw: colorEnc?.field ? points.map((point) => point.category ?? "") : null,
    range: colorEnc?.range,
    domain: colorEnc?.domain,
    constant: colorEnc?.constant,
    rules,
    preset,
    fallback: paint(undefined, preset, 0),
    categorical: Boolean(colorEnc?.field || colorEnc?.domain || colorEnc?.range),
  });
  const pointColor = (index: number) => {
    const tone = points[index]?.tone;
    if (ramp && typeof tone === "number") return ramp.paint(tone);
    return resolved?.[index] ?? paint(undefined, preset, 0);
  };
  const colorOf = (category: string | undefined) => {
    const found = points.findIndex((point) => point.category === category);
    return pointColor(found >= 0 ? found : 0);
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
      const color = colorOf(category);
      const swatch = shape === "circle" && !hollow
        ? `<rect x="${n(cx)}" y="${n(top - 18)}" width="10" height="10" rx="2" fill="${color}" />`
        : marker(cx + 5, top - 13, 4.5, shape, color, hollow);
      bits.push(`${swatch}${label(cx + 16, top - 9, category || " ", cssVar("text", frame.preset.text), 12, "400")}`);
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
  const clip = boxId(frame.id, plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
  parts.push(`<defs>${clipPath(clip, plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top)}</defs>`);
  parts.push(notes.under);
  parts.push(`<g clip-path="url(#${clip})">`);
  const labels = bag();
  let labelSvg = "";
  const labelFill = cssVar("text", frame.preset.text);
  points.forEach((point, index) => {
    const raw = point.size === null ? radius[0] : lerp(point.size, sizeDomain[0], sizeDomain[1], radius[0], radius[1]);
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    const room = Math.min(cx - plot.left, plot.right - cx, cy - plot.top, plot.bottom - cy);
    const r = Math.max(0, Math.min(raw, Math.max(0, room)));
    const color = pointColor(index);
    const name = point.category ? `${point.category}, ` : "";
    const text = `${name}${xField ?? "x"} ${formatValue(point.x, xFormat, frame.locale)}, ${yField ?? "y"} ${formatValue(point.y, yFormat, frame.locale)}`;
    const called = point.category || yField || "value";
    const extra = ` fill-opacity="${n(opacity)}" data-ck-name="${esc(called)}" data-ck-i="${point.index}" aria-label="${esc(text)}"`;
    const drawn = shape === "none" ? "" : marker(cx, cy, r, shape, color, hollow, extra);
    if (drawn) {
      const tag = drawn.startsWith("<rect") ? "rect" : drawn.startsWith("<path") ? "path" : "circle";
      parts.push(drawn.replace(/\s*\/>$/, `><title>${esc(text)}</title></${tag}>`));
    }
    if (showLabels) {
      const shift = nudge(labelAt || "top", r);
      const format = frame.mark.labelFormat ?? yFormat;
      labelSvg += labels.put(formatValue(point.y, format, frame.locale), cx + shift[0], cy + shift[1], shift[2], labelFill);
    }
  });
  parts.push("</g>");
  if (labelSvg) parts.push(labelSvg);
  parts.push(notes.over);

  if (showY && yAxis.labels) {
    for (const tick of yTicks) {
      const y = yScale(tick) + 4;
      parts.push(
        yRight
          ? label(plot.right + 8, y, formatValue(tick, yFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "start")
          : label(plot.left - 8, y, formatValue(tick, yFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "end"),
      );
    }
  }
  if (showY && yAxis.title) {
    const x = yRight ? frame.width - 12 : 12;
    parts.push(rotated(x, (plot.top + plot.bottom) / 2, yAxis.title, cssVar("muted", frame.preset.muted), yRight ? 90 : -90));
  }
  if (showX && xAxis.labels) {
    const angle = xAxis.rotate ?? 0;
    for (const tick of xTicks) {
      const x = xScale(tick);
      const y = xAxis.end ? plot.top - 18 : plot.bottom + 16;
      parts.push(angle ? rotated(x, y, formatValue(tick, xFormat, frame.locale), cssVar("muted", frame.preset.muted), angle) : label(x, y, formatValue(tick, xFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "middle"));
    }
  }
  if (showX && xAxis.title) {
    parts.push(label((plot.left + plot.right) / 2, xAxis.end ? plot.top - 40 : frame.height - 6, xAxis.title, cssVar("muted", frame.preset.muted), 11, "500", "middle"));
  }
  if (ramp && frame.legend !== false) parts.push(ramp.legend(plot.left, frame.height - 22, scaleLabel(preset)));
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
  const scale = explicit ? (channel as { scale?: { domain?: unknown; nice?: unknown } }).scale : undefined;
  if (scale && (Array.isArray(scale.domain) || scale.nice === false)) return domain;
  const span = domain[1] - domain[0] || 1;
  return [domain[0] - span * 0.06, domain[1] + span * 0.06];
}

function lerp(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return (r0 + r1) / 2;
  const t = Math.min(1, Math.max(0, (value - d0) / (d1 - d0)));
  return r0 + t * (r1 - r0);
}

function scaleReverse(channel: unknown): boolean {
  return typeof channel === "object" && channel !== null && "scale" in channel && (channel as { scale?: { reverse?: unknown } }).scale?.reverse === true;
}

function rotated(x: number, y: number, value: string, fill: string, angle: number): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" fill="${fill}" font-size="11" font-weight="500" font-family="${font()}" transform="rotate(${n(angle)} ${n(x)} ${n(y)})">${esc(value)}</text>`;
}

function label(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
