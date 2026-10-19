import { cssVar } from "./theme";
import { clientIntent, isRecord, longDesc, n, readAxis, readInset } from "./svg";
import {
  formatNumber,
  installAxes,
  ticks,
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

function kept(min: number, max: number, count: number, values?: number[]): number[] {
  if (values?.length) {
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) if (values[i] >= min - 1e-6 && values[i] <= max + 1e-6) out.push(values[i]);
    return out;
  }
  return ticks(min, max, count);
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, dash: string): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}"${dash} />`;
}
