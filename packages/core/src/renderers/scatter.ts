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
import { closeChart, esc, font, linear, n, openChart, ticks } from "../svg";

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

  const xDomain = padDomain(resolveDomain(points.map((point) => point.x), frame.encoding.x, wantsZero(frame.encoding.x, false)), frame.encoding.x);
  const yDomain = padDomain(resolveDomain(points.map((point) => point.y), frame.encoding.y, wantsZero(frame.encoding.y, false)), frame.encoding.y);
  const sizes = points.map((point) => point.size).filter((value): value is number => value !== null);
  const sizeDomain: [number, number] = sizes.length ? [Math.min(...sizes), Math.max(...sizes)] : [0, 1];
  const radius = sizeEnc?.range ?? [typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : 4, typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : 4];
  const opacity = typeof frame.mark.opacity === "number" ? frame.mark.opacity : 0.75;

  const showLegend = frame.legend !== false && categories.length > 1;
  let top = 16;
  const heads: string[] = [];
  if (frame.title) {
    heads.push(label(16, 20, frame.title, cssVar("text", frame.preset.text), 14, "600"));
    top = 36;
  }
  if (frame.subtitle) {
    heads.push(label(16, top, frame.subtitle, cssVar("muted", frame.preset.muted), 12, "400"));
    top += 16;
  }
  if (showLegend) top += 22;
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  const plot = { left: showY ? 56 : 16, top, right: frame.width - 16, bottom: frame.height - (showX ? 36 : 16) };
  const xScale = scaler(xDomain, plot.left, plot.right, xLog);
  const yScale = scaler(yDomain, plot.bottom, plot.top, yLog);
  const xTicks = xLog ? logTicks(xDomain[0], xDomain[1]) : ticks(xDomain[0], xDomain[1], 5);
  const yTicks = yLog ? logTicks(yDomain[0], yDomain[1]) : ticks(yDomain[0], yDomain[1], 5);
  const grid = gridStyle(spec);
  const xFormat = channelFormat(frame.encoding.x);
  const yFormat = channelFormat(frame.encoding.y);
  const colorOf = (category: string | undefined, index: number) => {
    if (colorEnc?.constant) return paint(colorEnc.constant, frame.preset, 0);
    if (category === undefined) return paint(undefined, frame.preset, 0);
    const at = Math.max(0, categories.indexOf(category));
    return paint(colorEnc?.range?.[at], frame.preset, at);
  };

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "scatter" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  parts.push(heads.join(""));
  if (showLegend) {
    parts.push(
      categories
        .map((category, index) => {
          const dx = 16 + index * 110;
          const color = colorOf(category, index);
          return `<rect x="${n(dx)}" y="${n(top - 18)}" width="10" height="10" rx="2" fill="${color}" />${label(dx + 16, top - 9, category || " ", cssVar("text", frame.preset.text), 12, "400")}`;
        })
        .join(""),
    );
  }

  if (grid && showY) {
    const dash = grid === "dashed" ? ' stroke-dasharray="3 3"' : grid === "dotted" ? ' stroke-dasharray="1 3"' : "";
    for (const tick of yTicks) {
      const y = yScale(tick);
      parts.push(`<line x1="${n(plot.left)}" y1="${n(y)}" x2="${n(plot.right)}" y2="${n(y)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`);
    }
  }

  points.forEach((point, index) => {
    const r = point.size === null ? radius[0] : lerp(point.size, sizeDomain[0], sizeDomain[1], radius[0], radius[1]);
    const color = colorOf(point.category, index);
    const name = point.category ? `${point.category}, ` : "";
    const text = `${name}${xField ?? "x"} ${formatValue(point.x, xFormat, frame.locale)}, ${yField ?? "y"} ${formatValue(point.y, yFormat, frame.locale)}`;
    parts.push(
      `<circle cx="${n(xScale(point.x))}" cy="${n(yScale(point.y))}" r="${n(Math.max(0, r))}" fill="${color}" fill-opacity="${n(opacity)}" aria-label="${esc(text)}"><title>${esc(text)}</title></circle>`,
    );
  });

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

function padDomain(domain: [number, number], channel: unknown): [number, number] {
  if (scaleTypeOf(channel) === "log") return domain;
  const explicit = typeof channel === "object" && channel !== null && "scale" in channel;
  const scale = explicit ? (channel as { scale?: { domain?: unknown } }).scale : undefined;
  if (scale && Array.isArray(scale.domain)) return domain;
  const span = domain[1] - domain[0] || 1;
  return [domain[0] - span * 0.06, domain[1] + span * 0.06];
}

function scaler(domain: [number, number], from: number, to: number, log: boolean): (value: number) => number {
  if (!log) return linear(domain[0], domain[1], from, to);
  const a = Math.log(Math.max(domain[0], Number.MIN_VALUE));
  const b = Math.log(Math.max(domain[1], a + 1e-9));
  return (value) => from + ((Math.log(value) - a) / (b - a || 1)) * (to - from);
}

function logTicks(min: number, max: number): number[] {
  const start = Math.floor(Math.log10(Math.max(min, Number.MIN_VALUE)));
  const end = Math.ceil(Math.log10(Math.max(max, min)));
  const out: number[] = [];
  for (let exp = start; exp <= end && out.length < 8; exp++) out.push(10 ** exp);
  return out.length ? out : [min, max];
}

function lerp(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return (r0 + r1) / 2;
  const t = Math.min(1, Math.max(0, (value - d0) / (d1 - d0)));
  return r0 + t * (r1 - r0);
}

function label(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
