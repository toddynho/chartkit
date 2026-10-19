import { cssVar } from "./theme";
import { clientIntent, esc, font, isRecord, longDesc, n, readAxis, readInset } from "./svg";
import {
  formatNumber,
  formatTimeLabel,
  installAxes,
  legendRows,
  tickLabel,
  tickText,
  ticks,
  timeTicks,
  widest,
  type AxisBox,
  type ChartShell,
  type Pad,
  type PlotModel,
  type Series,
  type XScale,
} from "./renderers/cartesian";

type Box = { left: number; top: number; right: number; bottom: number };

function txt(x: number, y: number, anchor: string, body: string, fill: string, family: string, angle = 0, weight = ""): string {
  const spin = angle ? ` transform="rotate(${n(angle)} ${n(x)} ${n(y)})"` : "";
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="11"${weight} font-family="${family}"${spin}>${esc(body)}</text>`;
}

/** Registers position, rotation, explicit ticks, legend values, and the x grid. */
export function mountAxes(): void {
  installAxes({ prepare, ticks: pick, pad, paint, seriesName });
}

function prepare(spec: Record<string, unknown>, shell: ChartShell): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const xObj = isRecord(encoding.x) ? encoding.x : undefined;
  const horizontal = shell.orientation === "horizontal";
  const x = readAxis(spec, "x", horizontal);
  const y = readAxis(spec, "y", horizontal);
  const y2 = readAxis(spec, "y2", horizontal);
  if (!x.title && xObj && typeof xObj.title === "string") x.title = xObj.title;
  const yTitle = shell.channels.find((channel) => channel.axis === "y" && channel.title);
  const y2Title = shell.channels.find((channel) => channel.axis === "y2" && channel.title);
  if (!y.title && yTitle?.title) y.title = yTitle.title;
  if (!y2.title && y2Title?.title) y2.title = y2Title.title;
  shell.xAxis = x;
  shell.yAxis = y;
  shell.y2Axis = y2;
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const raw = axes && isRecord(axes.x) ? axes.x : undefined;
  if (raw && raw.format !== undefined) shell.xFormat = raw.format;
  shell.gx = gridOf(raw?.grid);
  shell.lv = isRecord(spec.legend) && spec.legend.values === true;
  shell.inset = readInset(spec);
  shell.description = longDesc(spec);
  const intent = clientIntent(spec);
  if (intent) shell.intent = intent;
  shell.f = flags(spec);
}

function flags(spec: Record<string, unknown>): number {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const y = encoding.y;
  const list = Array.isArray(y) ? y : y ? [y] : [];
  let yOff = 0;
  let y2Off = 0;
  let yRev = 0;
  let y2Rev = 0;
  let ySet = 0;
  let yOn = 0;
  let y2Set = 0;
  let y2On = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!isRecord(item) || !isRecord(item.scale)) continue;
    const alt = item.axis === "y2";
    const scale = item.scale;
    if (scale.nice === false) alt ? (y2Off = 1) : (yOff = 1);
    if (scale.reverse === true) alt ? (y2Rev = 1) : (yRev = 1);
    if (typeof scale.zero === "boolean") {
      if (alt) {
        y2Set = 1;
        y2On = scale.zero ? 1 : 0;
      } else {
        ySet = 1;
        yOn = scale.zero ? 1 : 0;
      }
    }
  }
  const x = isRecord(encoding.x) && isRecord(encoding.x.scale) ? encoding.x.scale : undefined;
  return (
    (yOff && 1) | (y2Off && 2) | (x?.nice === true ? 4 : 0) | (yRev && 8) | (y2Rev && 16) | (x?.reverse === true ? 32 : 0) |
    (yOn && 64) | (y2On && 128) | (x?.zero === true ? 256 : 0) | (ySet && 512) | (y2Set && 1024)
  );
}

function gridOf(value: unknown): NonNullable<ChartShell["gx"]> {
  if (value === true || value === "solid") return "solid";
  if (value === "dashed" || value === "dotted") return value;
  return false;
}

function pick(model: PlotModel, key: "x" | "y" | "y2", min: number, max: number): number[] | null {
  const axis = key === "y" ? model.yAxis : key === "y2" ? model.y2Axis : model.xAxis;
  return axis.values?.length ? kept(min, max, 0, axis.values) : null;
}

function kept(min: number, max: number, count: number, values?: number[]): number[] {
  if (values?.length) {
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) if (values[i] >= min - 1e-6 && values[i] <= max + 1e-6) out.push(values[i]);
    return out;
  }
  return ticks(min, max, count);
}

function seriesName(model: PlotModel, series: Series): string | null {
  if (!model.lv) return null;
  const values = series.values;
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i];
    if (typeof value === "number" && Number.isFinite(value)) return series.name + " " + formatNumber(value, model.locale);
  }
  return null;
}

function preparePad(model: PlotModel, yLabels: string[], y2Labels: string[], xLabels: string[]): Pad | null {
  if (!chrome(model) && !hasInset(model)) return null;
  if (model.type === "sparkline" || model.type === "mini-area") return { top: 2, right: 2, bottom: 2, left: 2 };
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yEnd = Boolean(model.yAxis.end);
  const xEnd = Boolean(model.xAxis.end);
  const y2End = model.y2Axis.end !== false;
  let left = 12;
  let right = 16;
  let top = 14;
  let bottom = 12;
  if (model.title) top += 20;
  if (model.subtitle) top += 18;
  if (!horizontal && model.showY && model.yAxis.labels) {
    if (yEnd) right = Math.max(right, gap(yLabels));
    else left = gap(yLabels);
  }
  if (horizontal && model.showY) {
    if (yEnd) top += 20;
    else bottom = 32;
  }
  if (model.showY2 && model.y2Axis.labels) {
    const size = gap(y2Labels);
    if (y2End) right = Math.max(right, size);
    else left = Math.max(left, size);
  }
  if (model.showX && model.xAxis.labels) {
    if (!horizontal && xEnd) top += 32;
    else if (!horizontal) bottom = 32;
    else if (xEnd) right = Math.max(right, gap(xLabels));
    else left = Math.max(left, gap(xLabels));
  }
  if (model.showY && model.yAxis.title) {
    if (!horizontal && yEnd) right += 16;
    else if (!horizontal) left += 16;
    else if (yEnd) top += 16;
    else bottom += 16;
  }
  if (model.showX && model.xAxis.title) {
    if (!horizontal && xEnd) top += 22;
    else if (!horizontal) bottom += 16;
    else if (xEnd) right += 16;
    else left += 16;
  }
  if (model.showY2 && model.y2Axis.title) {
    if (y2End) right += 16;
    else left += 16;
  }
  const angle = xAngle(model);
  if (angle && model.showX && !horizontal) {
    const extra = Math.ceil(Math.abs(Math.sin((angle * Math.PI) / 180)) * Math.max(24, widest(model.labels.length ? model.labels : xLabels)));
    if (xEnd) top += extra;
    else bottom += extra;
  }
  if (model.legend) top += 12 + legendRows(model, left, model.width - right) * 18;
  return insetOf({ top, right, bottom, left }, model.inset);
}

const pad = preparePad;

function paint(
  model: PlotModel,
  plot: Box,
  horizontal: boolean,
  count: number,
  yTicks: number[],
  y2Ticks: number[],
  yText: string[],
  y2Text: string[],
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  xScale: XScale,
): { grid: string; labels: string | null } | null {
  const grid = model.gx && model.showX ? xLines(model, plot, horizontal, count, xScale) : "";
  const labels = chrome(model) ? axes(model, plot, horizontal, count, yTicks, y2Ticks, yText, y2Text, yScale, y2Scale, xScale) : null;
  return grid || labels != null ? { grid, labels } : null;
}

function chrome(model: PlotModel): boolean {
  return Boolean(model.xAxis.title || model.yAxis.title || model.y2Axis.title || model.xAxis.end || model.yAxis.end || model.y2Axis.end === false || ySpin(model.yAxis) || ySpin(model.y2Axis) || xAngle(model));
}

function hasInset(model: PlotModel): boolean {
  const inset = model.inset;
  return inset != null && (inset.t != null || inset.r != null || inset.b != null || inset.l != null);
}

function insetOf(box: Pad, inset: PlotModel["inset"]): Pad {
  if (!inset) return box;
  return {
    top: typeof inset.t === "number" ? Math.max(box.top, inset.t) : box.top,
    right: typeof inset.r === "number" ? Math.max(box.right, inset.r) : box.right,
    bottom: typeof inset.b === "number" ? Math.max(box.bottom, inset.b) : box.bottom,
    left: typeof inset.l === "number" ? Math.max(box.left, inset.l) : box.left,
  };
}

function ySpin(axis: AxisBox): number {
  return typeof axis.rotate === "number" && axis.rotate ? axis.rotate : 0;
}

function xAngle(model: PlotModel): number {
  if (typeof model.xAxis.rotate === "number") return model.xAxis.rotate;
  if (!model.showX || !model.xAxis.labels || model.x) return 0;
  if (model.orientation === "horizontal" && model.type === "bar") return 0;
  const labels = model.labels;
  if (labels.length < 2) return 0;
  const slot = Math.max(1, (model.width - 64) / labels.length);
  if (widest(labels) <= slot) return 0;
  return spun(labels, -40) <= slot ? -40 : 0;
}

function spun(labels: string[], angle: number): number {
  const rad = (Math.abs(angle) * Math.PI) / 180;
  return widest(labels) * Math.abs(Math.cos(rad)) + 11 * Math.abs(Math.sin(rad));
}

function gap(labels: string[]): number {
  return Math.max(52, Math.ceil(widest(labels) + 12));
}

/** 0 left, 1 right, 2 top, 3 bottom. One placement for every side. */
function place(side: number, edge: number, at: number, titled: boolean, height: number): [number, number, string] {
  if (side === 0) return [edge - 6, at + 4, "end"];
  if (side === 1) return [edge + 6, at + 4, "start"];
  if (side === 2) return [at, edge - 18, "middle"];
  return [at, titled ? edge + 14 : height - 8, "middle"];
}

function axes(
  model: PlotModel,
  plot: Box,
  horizontal: boolean,
  count: number,
  yTicks: number[],
  y2Ticks: number[],
  yText: string[],
  y2Text: string[],
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  xScale: XScale,
): string {
  let out = "";
  if (model.showY && model.yAxis.labels) {
    const side = horizontal ? (model.yAxis.end ? 2 : 3) : model.yAxis.end ? 1 : 0;
    out += band(yText, yTicks, yScale, model, plot, side, model.yAxis, ySpin(model.yAxis));
  }
  if (model.showY2 && model.y2Axis.labels) {
    const side = model.y2Axis.end !== false ? 1 : 0;
    out += band(y2Text, y2Ticks, y2Scale, model, plot, side, model.y2Axis, ySpin(model.y2Axis));
  }
  if (model.showX && model.xAxis.labels) out += xBand(model, xScale, count, horizontal, plot);
  out += titles(model, plot, horizontal);
  return out;
}

function band(
  labels: string[],
  values: number[],
  scale: (value: number) => number,
  model: PlotModel,
  plot: Box,
  side: number,
  axis: AxisBox,
  angle: number,
): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const edge = side === 0 ? plot.left : side === 1 ? plot.right : side === 2 ? plot.top : plot.bottom;
  let out = "";
  for (let i = 0; i < values.length; i++) {
    const [x, y, anchor] = place(side, edge, scale(values[i]), Boolean(axis.title), model.height);
    out += txt(x, y, anchor, labels[i] ?? "", fill, family, angle);
  }
  return out;
}

function xBand(model: PlotModel, xScale: XScale, count: number, horizontal: boolean, plot: Box): string {
  if (model.xTemporal && model.x && !horizontal) return timeBand(model, xScale, plot);
  if (model.x && !horizontal) return numBand(model, xScale, plot);
  const angle = xAngle(model);
  const step = xStep(model, count, angle);
  if (step === 0) return "";
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const y = model.xAxis.end && !horizontal ? plot.top - 18 : plot.bottom + 16;
  let out = "";
  let last = -Infinity;
  for (let i = 0; i < count; i += step) {
    const label = tickLabel(model, i);
    if (!label) continue;
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      out += txt(right ? plot.right + 8 : plot.left - 6, xScale.center(i) + 4, right ? "start" : "end", label, fill, family);
      continue;
    }
    const x = xScale.center(i);
    if (!angle) {
      const width = label.length * 6.4;
      if (x - width / 2 < last) continue;
      last = x + width / 2 + 8;
    }
    out += txt(x, y, angle < 0 ? "end" : angle > 0 ? "start" : "middle", label, fill, family, angle);
  }
  return out;
}

function numBand(model: PlotModel, xScale: XScale, plot: Box): string {
  const values = kept(xScale.min, xScale.max, model.xAxis.count ?? 6, model.xAxis.values);
  return along(model, values, tickText(values, model, model.xFormat), (value) => xScale.at(value), plot, 8);
}

function timeBand(model: PlotModel, xScale: XScale, plot: Box): string {
  if (!model.x || !xScale.live || !(xScale.max > xScale.min) || model.xAxis.count === 0) return "";
  const min = xScale.min;
  const max = xScale.max;
  const span = max - min;
  const width = Math.max(1, plot.right - plot.left);
  const values =
    model.xAxis.count !== undefined || model.xAxis.values?.length
      ? kept(min, max, model.xAxis.count ?? 6, model.xAxis.values)
      : timeTicks(min, max, Math.max(2, Math.floor(width / 72)));
  const labels = values.map((tick) => formatTimeLabel(tick, span, model.locale, model.xFormat));
  return along(model, values, labels, (value) => xScale.at(value), plot, 4);
}

/** Shared loop for numeric and time labels, including rotation and a top axis. */
function along(
  model: PlotModel,
  values: number[],
  labels: string[],
  at: (value: number) => number,
  plot: Box,
  slack: number,
): string {
  const angle = xAngle(model);
  const y = model.xAxis.end ? plot.top - 18 : plot.bottom + 16;
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  let out = "";
  let last = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const label = labels[i];
    if (!label) continue;
    const x = at(values[i]);
    if (x < plot.left - slack || x > plot.right + slack) continue;
    if (!angle) {
      const width = label.length * 6.4;
      if (x - width / 2 < last) continue;
      last = x + width / 2 + 8;
    }
    out += txt(x, y, angle < 0 ? "end" : angle > 0 ? "start" : "middle", label, fill, family, angle);
  }
  return out;
}

function xStep(model: PlotModel, count: number, angle: number): number {
  const target = model.xAxis.count;
  if (target === 0) return 0;
  if (target !== undefined) return Math.max(1, Math.ceil(count / Math.max(1, target)));
  if (!angle) return count > 8 ? Math.ceil(count / 6) : 1;
  const slot = Math.max(1, (model.width - 64) / Math.max(1, count));
  const footprint = spun(model.labels.length ? model.labels : [], angle);
  return footprint <= slot ? 1 : Math.max(1, Math.ceil(footprint / slot));
}

function titles(model: PlotModel, plot: Box, horizontal: boolean): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const midY = (plot.top + plot.bottom) / 2;
  const midX = (plot.left + plot.right) / 2;
  let out = "";
  if (model.showY && model.yAxis.title) {
    const title = model.yAxis.title;
    const side = horizontal ? (model.yAxis.end ? 2 : 3) : model.yAxis.end ? 1 : 0;
    if (side === 0) out += txt(14, midY, "middle", title, fill, family, -90, ' font-weight="500"');
    else if (side === 1) out += txt(model.width - 14, midY, "middle", title, fill, family, 90, ' font-weight="500"');
    else if (side === 2) out += txt(midX, Math.max(12, plot.top - 18), "middle", title, fill, family, 0, ' font-weight="500"');
    else out += txt(midX, model.height - 6, "middle", title, fill, family, 0, ' font-weight="500"');
  }
  if (model.showY2 && model.y2Axis.title) {
    const right = model.y2Axis.end !== false;
    out += txt(right ? model.width - 14 : 14, midY, "middle", model.y2Axis.title, fill, family, right ? 90 : -90, ' font-weight="500"');
  }
  if (model.showX && model.xAxis.title) {
    const title = model.xAxis.title;
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      out += txt(right ? model.width - 14 : 14, midY, "middle", title, fill, family, right ? 90 : -90, ' font-weight="500"');
    } else if (model.xAxis.end) out += txt(midX, plot.top - 40, "middle", title, fill, family, 0, ' font-weight="500"');
    else out += txt(midX, model.height - 6, "middle", title, fill, family, 0, ' font-weight="500"');
  }
  return out;
}

function xLines(model: PlotModel, plot: Box, horizontal: boolean, count: number, xScale: XScale): string {
  const dash = model.gx === "dashed" ? ' stroke-dasharray="3 3"' : model.gx === "dotted" ? ' stroke-dasharray="1 3"' : "";
  const stroke = cssVar("grid", model.preset.grid);
  let out = "";
  if (!horizontal && model.x) {
    const values = kept(xScale.min, xScale.max, model.xAxis.count ?? 6, model.xAxis.values);
    for (let i = 0; i < values.length; i++) {
      const pos = xScale.at(values[i]);
      out += line(pos, plot.top, pos, plot.bottom, stroke, dash);
    }
    return out;
  }
  for (let i = 0; i < count; i++) {
    const pos = xScale.center(i);
    out += horizontal ? line(plot.left, pos, plot.right, pos, stroke, dash) : line(pos, plot.top, pos, plot.bottom, stroke, dash);
  }
  return out;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, dash: string): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}"${dash} />`;
}
