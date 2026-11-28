import { extentAndMinmax, noteDense, noteLinear } from "../sampling";
import { CHROME_TOP } from "../chrome";
import { layoutPaint } from "../layout-hook";
import { brokenScale, isRecord, logNice, niceDomain, padExtent, round } from "../svg";
import { slots } from "../feature-hooks";
import { parseTime } from "../timezone";
import type { DomainLock, Layers, PlotModel, Series, XScale, YChannel } from "./types";
import { floatExtent, linearExtent, num } from "./data";

export function layerOn(layers: Layers | null, index: number): boolean {
  return Boolean(layers?.on[index]);
}

export function stackLayers(series: Series[], mode: "stack" | "percent"): Layers {
  const count = series[0]?.values.length ?? 0;
  const top = series.map(() => Array<number>(count).fill(0));
  const bottom = series.map(() => Array<number>(count).fill(0));
  for (let i = 0; i < count; i++) {
    let base = 0;
    let total = 0;
    if (mode === "percent") {
      for (const item of series) total += num(item.values[i]);
      if (total === 0) total = 1;
    }
    for (let s = 0; s < series.length; s++) {
      const raw = num(series[s].values[i]);
      const value = mode === "percent" ? (raw / total) * 100 : raw;
      bottom[s][i] = base;
      base += value;
      top[s][i] = base;
    }
  }
  const many = series.length >= 2;
  return {
    top,
    bottom,
    on: series.map(() => many),
    crest: series.map((_, index) => !many || index === series.length - 1),
    uniform: many,
  };
}

export function idleStacks(series: Series[]): { layers: null; barSlot: number[]; barSlots: number } {
  const barSlot = new Array<number>(series.length);
  for (let i = 0; i < series.length; i++) barSlot[i] = 0;
  return { layers: null, barSlot, barSlots: 1 };
}

/** Named groups stack with each other. A name used once, or omitted when mark.stack is none, stays raw. */
export function planStacks(series: Series[], mode: "none" | "stack" | "percent"): { layers: Layers | null; barSlot: number[]; barSlots: number } {
  const count = series.reduce((max, item) => Math.max(max, item.values.length), 0);
  const keys = series.map((item) => {
    if (item.mark === "range") return "";
    if (item.stackId) return `${item.axis}:${item.stackId}`;
    if (mode !== "none") return `${item.axis}:*`;
    return "";
  });
  const groups = new Map<string, number[]>();
  keys.forEach((key, index) => {
    if (!key) return;
    const list = groups.get(key);
    if (list) list.push(index);
    else groups.set(key, [index]);
  });
  const on = series.map(() => false);
  const crest = series.map(() => true);
  const top = series.map(() => Array<number>(count).fill(0));
  const bottom = series.map(() => Array<number>(count).fill(0));
  let stacking = false;
  const percent = mode === "percent";
  for (const indexes of groups.values()) {
    if (indexes.length < 2) continue;
    stacking = true;
    for (const index of indexes) on[index] = true;
    for (let k = 0; k < indexes.length - 1; k++) crest[indexes[k]] = false;
    for (let i = 0; i < count; i++) {
      let base = 0;
      let total = 0;
      if (percent) {
        for (const index of indexes) total += num(series[index].values[i]);
        if (total === 0) total = 1;
      }
      for (const index of indexes) {
        const raw = num(series[index].values[i]);
        const value = percent ? (raw / total) * 100 : raw;
        bottom[index][i] = base;
        base += value;
        top[index][i] = base;
      }
    }
  }
  const barSlot: number[] = [];
  const seen = new Map<string, number>();
  let slots = 0;
  series.forEach((item, index) => {
    if (item.mark !== "bar") {
      barSlot.push(0);
      return;
    }
    const key = on[index] ? keys[index] : `#${index}`;
    const slot = seen.get(key);
    if (slot !== undefined) {
      barSlot.push(slot);
      return;
    }
    seen.set(key, slots);
    barSlot.push(slots);
    slots += 1;
  });
  const active = series.filter((item) => item.mark !== "range").length;
  const only = groups.size === 1 ? [...groups.values()][0] : undefined;
  return {
    layers: stacking ? { top, bottom, on, crest, uniform: Boolean(only && only.length === active && active >= 2) } : null,
    barSlot,
    barSlots: Math.max(1, slots),
  };
}

export function xPosition(
  model: PlotModel,
  count: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  horizontal: boolean,
): XScale {
  let spanStart = horizontal ? top : left;
  let spanEnd = horizontal ? bottom : right;
  if (model.f & 32) {
    const swap = spanStart;
    spanStart = spanEnd;
    spanEnd = swap;
  }
  if (!model.x) {
    const placed = layoutPaint()?.cats(spanStart, spanEnd, count, Boolean(model.xEdge), model.type === "bar" || model.type === "combo");
    if (placed) return placed;
    const size = count > 0 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
    return {
      center: (index) => spanStart + size * index + size / 2,
      band: (index) => ({ start: spanStart + size * index, size }),
      at: (value) => spanStart + size * value + size / 2,
      min: 0,
      max: Math.max(0, count - 1),
      live: false,
    };
  }
  let min = Infinity;
  let max = -Infinity;
  let seen = false;
  if (model.x instanceof Float64Array) {
    const extent = linearExtent(model.x);
    if (extent) {
      min = extent.min;
      max = extent.max;
      seen = true;
      if (extent.linear) noteLinear(model.x);
    }
  }
  if (!seen) {
    for (let i = 0; i < model.x.length; i++) {
      const value = model.x[i];
      if (value === null || !Number.isFinite(value)) continue;
      seen = true;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!seen) {
    min = 0;
    max = 1;
  } else {
    if (model.f & 256) {
      if (min > 0) min = 0;
      if (max < 0) max = 0;
    }
    if (model.f & 4 && max > min) {
      const nice = niceDomain(min, max);
      min = nice[0];
      max = nice[1];
    }
    const padded = padExtent(min, max, model.xPad ?? null, null);
    min = padded[0];
    max = padded[1];
  }
  if (typeof model.yAxis.crosses === "number") {
    if (model.yAxis.crosses < min) min = model.yAxis.crosses;
    if (model.yAxis.crosses > max) max = model.yAxis.crosses;
  }
  const mapped = brokenScale(min, max, spanStart, spanEnd, model.xAxis.breaks, "linear", 1);
  model.xSpans = mapped.spans;
  const scale = mapped.at;
  return {
    center: (index) => scale(model.x?.[index] ?? min),
    band: (index) => {
      const step = count > 1 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
      return { start: spanStart + step * index, size: step };
    },
    at: (value) => scale(value),
    min,
    max,
    live: seen,
  };
}

export function crossAt(model: PlotModel, key: "x" | "y" | "y2", horizontal: boolean, xScale: XScale, yScale?: (value: number) => number): number | undefined {
  if (horizontal) return undefined;
  const axis = key === "x" ? model.xAxis : key === "y2" ? model.y2Axis : model.yAxis;
  if (typeof axis.crosses !== "number") return undefined;
  if (key === "x") return yScale?.(axis.crosses);
  if (!model.x) return undefined;
  return xScale.at(axis.crosses);
}

export function xEdgeOf(channel: unknown): boolean {
  return isRecord(channel) && isRecord(channel.scale) && channel.scale.padding === 0;
}

function pinDomain(pair: [number, number], lock: DomainLock): [number, number] {
  if (!lock) return pair;
  const lo = lock[0] ?? pair[0];
  const hi = lock[1] ?? pair[1];
  return hi > lo ? [lo, hi] : pair;
}

export function domain(model: PlotModel, axis: "y" | "y2"): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  let seen = false;
  const consider = (value: number) => {
    if (!Number.isFinite(value)) return;
    seen = true;
    if (value < min) min = value;
    if (value > max) max = value;
  };
  const grouped = model.layers?.on.some((flag, index) => flag && model.series[index]?.axis === axis) ?? false;
  if (grouped && model.layers) {
    for (let s = 0; s < model.series.length; s++) {
      if (model.series[s].axis !== axis) continue;
      if (model.layers.on[s]) {
        for (const value of model.layers.top[s]) consider(value);
        for (const value of model.layers.bottom[s]) consider(value);
      } else considerRaw(model.series[s]);
    }
  } else if (slots.stackFold && model.stack !== "none" && axis === "y" && model.series.every((item) => !item.stackId)) {
    const layers = slots.stackFold(model.series, model.stack === "percent" ? "percent" : "stack");
    for (let s = 0; s < model.series.length; s++) {
      if (model.series[s].axis !== "y") continue;
      for (const value of layers.top[s]) consider(value);
      for (const value of layers.bottom[s]) consider(value);
    }
  } else {
    for (const series of model.series) {
      if (series.axis !== axis) continue;
      const values = series.values;
      if (values instanceof Float64Array) {
        if (model.type === "line" && values.length > 2048) {
          const xs = model.x instanceof Float64Array && model.x.length === values.length ? model.x : null;
          const scanned = extentAndMinmax(values, Math.max(2, (model.width - 68) * 2), xs);
          if (Number.isFinite(scanned.min) && Number.isFinite(scanned.max)) {
            consider(scanned.min);
            consider(scanned.max);
            if (scanned.dense) noteDense(values);
            continue;
          }
        }
        const extent = floatExtent(values);
        if (extent) {
          consider(extent.min);
          consider(extent.max);
          if (extent.dense) noteDense(values);
          continue;
        }
      }
      let finite = 0;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value === null || !Number.isFinite(value)) continue;
        finite += 1;
        consider(value);
      }
      if (values.length > 0 && finite === values.length) noteDense(values);
    }
  }
  function considerRaw(series: Series): void {
    const values = series.values;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (typeof value === "number") consider(value);
    }
  }
  const lock = axisLock(model, axis);
  const log = axis === "y2" ? model.y2Log : model.yLog;
  const sym = axis === "y2" ? model.y2Sym : model.ySym;
  if ((axis === "y" || axis === "y2") && typeof model.xAxis.crosses === "number") consider(model.xAxis.crosses);
  if (log && !sym) {
    if (!seen || !(max > 0)) return pinDomain([1, 10], lock);
    const lo = min > 0 ? min : max / 10;
    return pinDomain(logNice(lo, max), lock);
  }
  if (axisIncludesZero(model, axis)) consider(0);
  if (!seen) return pinDomain([0, 1], lock);
  if (min === max) {
    min -= Math.abs(min) || 1;
    max += Math.abs(max) || 1;
  }
  if (model.f & (axis === "y2" ? 2 : 1)) return pinDomain(padExtent(min, max, axisPad(model, axis), lock), lock);
  const [niceMin, niceMax] = niceDomain(min, max);
  let lo = niceMin;
  let hi = niceMax;
  const pinnedAtZero = axisIncludesZero(model, axis) && niceMin <= 0 && min >= 0;
  const span = hi > lo ? hi - lo : Math.abs(max) || 1;
  const gutter = strokeGutter(model, axis, span);
  if (gutter > 0 && max + gutter > hi) hi = round(max + gutter);
  if (!pinnedAtZero && gutter > 0 && min - gutter * 0.5 < lo) lo = round(min - gutter * 0.5);
  return pinDomain(padExtent(lo, hi, axisPad(model, axis), lock), lock);
}

/** Pixel air above a line, converted to data units, so the stroke does not sit on the plot edge. */
function strokeGutter(model: PlotModel, axis: "y" | "y2", span: number): number {
  let stroked = false;
  for (const series of model.series) {
    if (series.axis === axis && series.mark !== "bar") stroked = true;
  }
  if (!stroked) return 0;
  const compact = model.type === "sparkline" || model.type === "mini-area";
  const air = Math.max(model.strokeWidth, 2) * 0.5 + (compact ? 3 : 14);
  let top = compact ? 2 : 14;
  if (!compact && model.title) top += 20;
  if (!compact && model.subtitle) top += 18;
  if (!compact && model.legend && (!model.legendBox || model.legendBox.position === "top")) {
    top += 30;
    if (!model.title && !model.subtitle && !model.legendBox) top += CHROME_TOP - 8;
  }
  const bottom = compact ? 2 : model.showX ? 32 : 12;
  const plotH = Math.max(24, model.height - top - bottom);
  return Math.max((air / plotH) * span, compact ? 0 : span * 0.06);
}

/** Bar and area marks include 0 on the axis they use. A combo line on the other axis does not. */
function axisIncludesZero(model: PlotModel, axis: "y" | "y2"): boolean {
  if (model.f & (axis === "y2" ? 1024 : 512)) return Boolean(model.f & (axis === "y2" ? 128 : 64));
  if (model.type === "bar" || model.type === "stacked-area" || model.type === "mini-area") return true;
  if (model.stack !== "none" && axis === "y" && model.series.every((item) => !item.stackId)) return true;
  if (model.layers?.on.some((flag, index) => flag && model.series[index]?.axis === axis)) return true;
  for (let i = 0; i < model.series.length; i++) {
    const item = model.series[i];
    if (item.axis !== axis) continue;
    if (item.mark === "bar" || item.mark === "area" || item.area) return true;
  }
  return model.zero && model.series.every((item) => item.axis === axis);
}

function axisChannels(model: PlotModel): YChannel[] | undefined {
  return (model as unknown as { channels?: YChannel[] }).channels;
}

function axisLock(model: PlotModel, axis: "y" | "y2"): DomainLock {
  const channels = axisChannels(model);
  if (!channels) return null;
  for (const channel of channels) if (channel.axis === axis && channel.lock) return channel.lock;
  return null;
}

function axisPad(model: PlotModel, axis: "y" | "y2"): { min: number; max: number } | null {
  const channels = axisChannels(model);
  if (!channels) return null;
  for (const channel of channels) if (channel.axis === axis && channel.pad) return channel.pad;
  return null;
}

export function axisClamps(model: PlotModel, axis: "y" | "y2"): boolean {
  const channels = axisChannels(model);
  return Boolean(channels?.some((channel) => channel.axis === axis && channel.clamp));
}

export function modelClamp(scale: (value: number) => number, domain: [number, number], on: boolean): (value: number) => number {
  if (!on) return scale;
  const lo = Math.min(domain[0], domain[1]);
  const hi = Math.max(domain[0], domain[1]);
  return (value) => scale(value < lo ? lo : value > hi ? hi : value);
}

export function locateX(model: PlotModel, xScale: XScale, value: number | string, count: number): number | null {
  if (typeof value === "number") {
    if (model.x) return xScale.at(value);
    if (value >= 0 && value < count) return xScale.center(value);
    return null;
  }
  if (model.xTemporal && model.x) {
    const parsed = parseTime(value, model.zone);
    if (Number.isFinite(parsed)) return xScale.at(parsed);
  }
  const index = model.labels.indexOf(value);
  if (index >= 0) return xScale.center(index);
  const numeric = Number(value);
  if (model.x && Number.isFinite(numeric)) return xScale.at(numeric);
  return null;
}

export function dataNumber(value: number | string): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
