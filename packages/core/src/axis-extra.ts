import { cssVar } from "./theme";
import { clientIntent, isRecord, longDesc, n, readAxis, readInset } from "./svg";
import {
  formatNumber,
  installAxes,
  resolveTicks,
  type ChartShell,
  type PlotModel,
  type Series,
  type XScale,
} from "./renderers/cartesian";

type Box = { left: number; top: number; right: number; bottom: number };

/** Registers position, rotation, explicit ticks, legend values, and the x grid. */
export function mountAxes(): void {
  installAxes({ prepare, grid, seriesName });
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
  let bits = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!isRecord(item) || !isRecord(item.scale)) continue;
    const scale = item.scale;
    const shift = item.axis === "y2" ? 1 : 0;
    if (scale.nice === false) bits |= 1 << shift;
    if (scale.reverse === true) bits |= 8 << shift;
    if (typeof scale.zero === "boolean") {
      bits |= 512 << shift;
      const on = 64 << shift;
      bits = scale.zero ? bits | on : bits & ~on;
    }
  }
  const x = isRecord(encoding.x) && isRecord(encoding.x.scale) ? encoding.x.scale : undefined;
  if (x?.nice === true) bits |= 4;
  if (x?.reverse === true) bits |= 32;
  if (x?.zero === true) bits |= 256;
  return bits;
}

function gridOf(value: unknown): NonNullable<ChartShell["gx"]> {
  if (value === true || value === "solid") return "solid";
  if (value === "dashed" || value === "dotted") return value;
  return false;
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

function grid(model: PlotModel, plot: Box, horizontal: boolean, count: number, xScale: XScale): string | null {
  if (!model.gx || !model.showX) return null;
  const dash = model.gx === "dashed" ? ' stroke-dasharray="3 3"' : model.gx === "dotted" ? ' stroke-dasharray="1 3"' : "";
  const stroke = cssVar("grid", model.preset.grid);
  let out = "";
  if (!horizontal && model.x) {
    const values = resolveTicks(model, "x", xScale.min, xScale.max, model.xAxis.count ?? 6, false);
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
