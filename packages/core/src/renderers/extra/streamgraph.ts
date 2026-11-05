import { categoryX, chooseTicks, keepClearTicks, labelStep, lockDomain, placedAxisTitles, placedNotes } from "../../chrome";
import type { DataTable } from "../../data";
import { column, fieldOf, readColor } from "../../frame";
import { legendSpace, paintLegend, readLegend, type LegendBox, type LegendItem } from "../../legend";
import { cssVar, paint } from "../../theme";
import { formatZoned, instantOf, zoneOf } from "../../timezone";
import { formatValue } from "../../format";
import { clientIntent, n, readAxis } from "../../svg";
import {
  axisLine,
  clip,
  domainTicks,
  fmt,
  hGrid,
  openMark,
  plotBox,
  scaleOf,
  text,
  valueFormat,
  viewOf,
  type Box,
} from "./plot";

interface Pt {
  x: number;
  y: number;
}

type Curve = "linear" | "monotone" | "step" | "step-before" | "step-after";

interface Layer {
  name: string;
  /** Null is a gap. The stack treats it as zero thickness. */
  values: (number | null)[];
}

interface Built {
  labels: string[];
  rawX: unknown[];
  layers: Layer[];
  temporal: boolean;
  bad: boolean;
}

/** Stacked area around a moving baseline. Wide rows or one value plus a series field. */
export function renderStreamgraph(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "streamgraph", 640, 360);
  if (!view) return null;
  const { frame, parts } = view;
  const built = buildLayers(view.table, frame.encoding);
  if (!built || built.bad || built.labels.length < 2 || built.layers.length < 1) return null;

  const baseline = baselineOf(frame.mark.streamOffset, built.layers.length);
  const orderName = orderOf(frame.mark.order, baseline);
  const stacked = layout(built.layers, baseline, orderName);
  const expand = baseline === "expand";
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const layer of stacked) {
    for (let i = 0; i < layer.y0.length; i++) {
      if (layer.values[i] === null) continue;
      yMin = Math.min(yMin, layer.y0[i], layer.y1[i]);
      yMax = Math.max(yMax, layer.y0[i], layer.y1[i]);
    }
  }
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) return null;
  if (yMin === yMax) yMax = yMin + 1;
  const yFormat = expand ? explicitFormat(spec, "y") ?? "percent" : valueFormat(frame, spec, frame.encoding.y, "y");
  const [locked0, locked1] = lockDomain(yMin, yMax, [frame.encoding.y]);
  const yTicks = chooseTicks(spec, "y", Math.min(locked0, yMin), Math.max(locked1, yMax), domainTicks(Math.min(locked0, yMin), Math.max(locked1, yMax)));
  const y0 = Math.min(locked0, yTicks[0] ?? locked0, yMin);
  const y1 = Math.max(locked1, yTicks[yTicks.length - 1] ?? locked1, yMax);

  const legendOn = frame.legend !== false && stacked.length > 1;
  const hide = legendHide(spec);
  const colorOf = layerColor(frame, spec, stacked.map((layer) => layer.name));
  const items: LegendItem[] = stacked
    .filter((layer) => !hide.includes(layer.name))
    .map((layer) => ({ name: layer.name, color: colorOf(layer.name) }));
  const legend = legendOn && items.length ? legendBox(spec, frame.legend === false ? "bottom" : frame.legend) : null;
  const layoutSpec = { ...spec, legend: false as const };
  const draft = plotBox(frame, layoutSpec, { yTicks });
  const space = legend ? legendSpace(legend, items, Math.max(80, draft.right - draft.left)) : null;
  const box = insetLegend(draft, legend, space);
  const labelInset = tickInset(frame, spec, built);
  if (box.left < labelInset) box.left = labelInset;
  if (frame.width - box.right < labelInset) box.right = frame.width - labelInset;
  const yReverse = isRecord(frame.encoding.y) && isRecord(frame.encoding.y.scale) && frame.encoding.y.scale.reverse === true;
  const yAt = scaleOf(y0, y1, yReverse ? box.top : box.bottom, yReverse ? box.bottom : box.top);
  const xReverse = isRecord(frame.encoding.x) && isRecord(frame.encoding.x.scale) && frame.encoding.x.scale.reverse === true;
  const xNominal = isRecord(frame.encoding.x) && (frame.encoding.x.type === "nominal" || frame.encoding.x.type === "ordinal");
  const xAt = xScale(built, box, xReverse, xNominal);
  const curve = curveOf(frame.mark.curve);
  const opacity = typeof frame.mark.fillOpacity === "number" ? frame.mark.fillOpacity : 0.22;
  const strokeWidth = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : 1.5;
  const connect = frame.mark.connectNulls === true;
  const showLabels = frame.mark.labels === true || frame.mark.labelPosition !== undefined || frame.mark.labelFormat !== undefined;

  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(xGrid(spec, frame, box, built.labels, xAt));
  parts.push(clip(frame, box));
  const notes = placedNotes(spec, frame, box, noteX(built, xAt), yAt, []);
  if (notes.under) parts.push(notes.under);
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  for (const layer of stacked) {
    const segments = segmentsOf(layer, xAt, yAt, connect);
    const color = colorOf(layer.name);
    const label = layerLabel(layer, frame.locale, yFormat);
    for (const segment of segments) {
      const d = areaD(segment.top, segment.bottom, curve);
      if (!d) continue;
      parts.push(
        openMark(
          "path",
          "area",
          label,
          `data-ck-series="${escapeAttr(layer.name)}" tabindex="0" d="${d}" fill="${color}" fill-opacity="${n(opacity)}" stroke="${color}" stroke-width="${n(strokeWidth)}" stroke-linejoin="round"`,
          layer.name,
        ),
      );
      parts.push("</path>");
    }
  }
  parts.push("</g>");
  if (notes.over) parts.push(notes.over);
  parts.push(columns(built, stacked, box, xAt, yAt, frame.locale, expand ? undefined : yFormat));
  const titled = withEncodingTitles(spec, frame.encoding);
  const obstacles = labelObstacles(frame, titled, box, yTicks, yAt, yFormat, legend, items);
  if (showLabels) parts.push(layerLabels(stacked, xAt, yAt, frame, box, obstacles));
  parts.push(axisLine(frame, box));
  parts.push(yLabels(frame, titled, box, yTicks, yAt, yFormat));
  parts.push(xTickLabels(frame, titled, built, xAt, box));
  const bottomBand = legend?.position === "bottom" && space ? space.band : 0;
  parts.push(placedAxisTitles(frame, { ...layoutSpec, ...titled, legend: false }, box, bottomBand));
  if (legend && items.length) {
    parts.push(paintLegend(legend, items, { plot: box, width: frame.width, height: frame.height, preset: frame.preset }));
  }
  const intent = clientIntent(spec);
  if (intent && parts[0]?.startsWith("<svg ")) parts[0] = parts[0].replace("<svg ", `<svg data-ck-intent="${intent}" `);
  return view.done();
}

function baselineOf(value: unknown, count: number): "wiggle" | "center" | "zero" | "expand" {
  if (count < 2) return "zero";
  if (value === "silhouette" || value === "center") return "center";
  if (value === "zero" || value === "expand" || value === "wiggle") return value;
  return "wiggle";
}

function orderOf(value: unknown, baseline: string): "inside-out" | "none" | "ascending" | "descending" {
  if (value === "inside-out" || value === "none" || value === "ascending" || value === "descending") return value;
  return baseline === "wiggle" ? "inside-out" : "none";
}

function curveOf(value: unknown): Curve {
  if (value === "linear" || value === "step" || value === "step-before" || value === "step-after" || value === "monotone") return value;
  return "monotone";
}

function buildLayers(table: DataTable, encoding: Record<string, unknown>): Built | null {
  const xField = fieldOf(encoding.x);
  if (!xField) return null;
  const yFields = fieldsOf(encoding.y);
  if (!yFields.length) return null;
  const xs = column(table, xField);
  const keys: string[] = [];
  const rawX: unknown[] = [];
  const at = new Map<string, number>();
  const remember = (raw: unknown) => {
    const key = raw == null ? "" : String(raw);
    if (!key) return -1;
    const found = at.get(key);
    if (found !== undefined) return found;
    const index = keys.length;
    at.set(key, index);
    keys.push(key);
    rawX.push(raw);
    return index;
  };
  for (let i = 0; i < table.length; i++) remember(xs[i]);
  if (keys.length < 2) return null;

  let bad = false;
  let layers: Layer[];
  const note = (value: number | null | "bad", slot: number, series: Layer) => {
    if (value === "bad") {
      bad = true;
      series.values[slot] = Number.NaN;
      return;
    }
    if (value === null) return;
    const prev = series.values[slot];
    if (typeof prev === "number" && Number.isNaN(prev)) return;
    series.values[slot] = prev === null ? value : (prev ?? 0) + value;
  };
  if (yFields.length > 1 || (!fieldOf(encoding.series) && !seriesColorField(encoding))) {
    layers = yFields.map((name) => ({ name, values: keys.map(() => null) }));
    const cols = yFields.map((name) => column(table, name));
    for (let i = 0; i < table.length; i++) {
      const slot = remember(xs[i]);
      if (slot < 0) continue;
      yFields.forEach((_name, series) => note(readValue(cols[series][i]), slot, layers[series]));
    }
  } else {
    const yCol = column(table, yFields[0]);
    const seriesField = fieldOf(encoding.series) || seriesColorField(encoding);
    const seriesCol = column(table, seriesField);
    const names: string[] = [];
    const indexOf = new Map<string, number>();
    const blank = () => keys.map(() => null as number | null);
    const ensure = (name: string) => {
      const found = indexOf.get(name);
      if (found !== undefined) return found;
      const index = names.length;
      indexOf.set(name, index);
      names.push(name);
      return index;
    };
    const grid: (number | null)[][] = [];
    for (let i = 0; i < table.length; i++) {
      const slot = at.get(xs[i] == null ? "" : String(xs[i]));
      if (slot === undefined) continue;
      const name = seriesField ? String(seriesCol[i] ?? "") : yFields[0];
      if (!name) continue;
      const series = ensure(name);
      if (!grid[series]) grid[series] = blank();
      const layer = { name, values: grid[series] };
      note(readValue(yCol[i]), slot, layer);
    }
    layers = names.map((name, index) => ({ name, values: grid[index] ?? blank() }));
  }
  if (!layers.length) return null;
  const temporal = rawX.every((value) => instantOf(value) !== null);
  return { labels: keys, rawX, layers, temporal, bad };
}

function seriesColorField(encoding: Record<string, unknown>): string | undefined {
  const color = readColor(encoding.color);
  return color?.field;
}

function fieldsOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => fieldOf(item) ?? []);
  const one = fieldOf(value);
  return one ? [one] : [];
}

function readValue(value: unknown): number | null | "bad" {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : "bad";
  return "bad";
}

interface Stacked extends Layer {
  y0: number[];
  y1: number[];
}

function layout(layers: Layer[], baseline: "wiggle" | "center" | "zero" | "expand", orderName: string): Stacked[] {
  const m = layers[0]?.values.length ?? 0;
  const sums = layers.map((layer) => layer.values.reduce<number>((sum, value) => sum + (typeof value === "number" ? value : 0), 0));
  const input = layers.map((_, index) => index);
  let order = input;
  if (orderName === "ascending") order = [...input].sort((a, b) => sums[a] - sums[b] || a - b);
  else if (orderName === "descending") order = [...input].sort((a, b) => sums[b] - sums[a] || a - b);
  else if (orderName === "inside-out") order = insideOut(sums);
  const series = layers.map((layer) =>
    layer.values.map((value) => {
      const thick = typeof value === "number" && Number.isFinite(value) ? value : 0;
      return [0, thick];
    }),
  );
  if (baseline === "expand") {
    for (let column = 0; column < m; column++) {
      let total = 0;
      for (const row of series) total += row[column][1];
      for (const row of series) row[column][1] = total ? row[column][1] / total : 0;
    }
  }
  if (baseline === "center") offsetCenter(series, order);
  else if (baseline === "wiggle") offsetWiggle(series, order);
  else offsetNone(series, order);
  if (baseline === "wiggle") shiftMinToZero(series);
  return order.map((index) => ({
    name: layers[index].name,
    values: layers[index].values,
    y0: series[index].map((point) => point[0]),
    y1: series[index].map((point) => point[1]),
  }));
}

/** Quietest series toward the middle, then alternating sides. */
function insideOut(sums: number[]): number[] {
  const appearance = sums.map((_, index) => index).sort((a, b) => sums[a] - sums[b] || a - b);
  let top = 0;
  let bottom = 0;
  const tops: number[] = [];
  const bottoms: number[] = [];
  for (const index of appearance) {
    if (top < bottom) {
      top += sums[index];
      tops.push(index);
    } else {
      bottom += sums[index];
      bottoms.push(index);
    }
  }
  return bottoms.reverse().concat(tops);
}

function offsetNone(series: number[][][], order: number[]): void {
  if (series.length < 2) return;
  let previous = series[order[0]];
  for (let i = 1; i < order.length; i++) {
    const next = series[order[i]];
    for (let column = 0; column < next.length; column++) {
      const base = Number.isNaN(previous[column][1]) ? previous[column][0] : previous[column][1];
      next[column][1] += next[column][0] = base;
    }
    previous = next;
  }
}

function offsetCenter(series: number[][][], order: number[]): void {
  const first = series[order[0]];
  if (!first) return;
  for (let column = 0; column < first.length; column++) {
    let total = 0;
    for (const row of series) total += row[column][1] || 0;
    first[column][1] += first[column][0] = -total / 2;
  }
  offsetNone(series, order);
}

/** Byron and Wattenberg, via the d3-shape wiggle offset. */
function offsetWiggle(series: number[][][], order: number[]): void {
  const n = order.length;
  const first = series[order[0]];
  if (!first?.length) return;
  const m = first.length;
  let y = 0;
  let column = 1;
  for (; column < m; column++) {
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < n; i++) {
      const row = series[order[i]];
      const here = row[column][1] || 0;
      const prev = row[column - 1][1] || 0;
      let s3 = (here - prev) / 2;
      for (let k = 0; k < i; k++) {
        const earlier = series[order[k]];
        s3 += (earlier[column][1] || 0) - (earlier[column - 1][1] || 0);
      }
      s1 += here;
      s2 += s3 * here;
    }
    first[column - 1][1] += first[column - 1][0] = y;
    if (s1) y -= s2 / s1;
  }
  first[column - 1][1] += first[column - 1][0] = y;
  offsetNone(series, order);
}

function shiftMinToZero(series: number[][][]): void {
  let min = Infinity;
  for (const row of series) {
    for (const point of row) min = Math.min(min, point[0], point[1]);
  }
  if (!Number.isFinite(min) || min === 0) return;
  for (const row of series) {
    for (const point of row) {
      point[0] -= min;
      point[1] -= min;
    }
  }
}

function xScale(built: Built, box: Box, reverse: boolean, nominal: boolean): (index: number) => number {
  const width = Math.max(1, box.right - box.left);
  const flip = (px: number) => (reverse ? box.left + box.right - px : px);
  if (built.temporal && !nominal) {
    const ms = built.rawX.map((value) => instantOf(value) ?? 0);
    const min = Math.min(...ms);
    const max = Math.max(...ms);
    const span = max - min || 1;
    return (index) => flip(box.left + ((ms[index] - min) / span) * width);
  }
  const numeric = !nominal && built.rawX.every((value) => typeof value === "number" && Number.isFinite(value));
  if (numeric) {
    const values = built.rawX as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return (index) => flip(box.left + ((values[index] - min) / span) * width);
  }
  const step = width / Math.max(1, built.labels.length - 1);
  return (index) => flip(box.left + index * step);
}

function noteX(built: Built, xAt: (index: number) => number): (value: number | string) => number | null {
  if (built.temporal) {
    return (value) => {
      const ms = instantOf(value);
      if (ms === null) return categoryX(built.labels, xAt)(value);
      const start = instantOf(built.rawX[0]);
      const end = instantOf(built.rawX[built.rawX.length - 1]);
      if (start === null || end === null || end === start) return xAt(0);
      const t = (ms - start) / (end - start);
      return xAt(0) + t * (xAt(built.labels.length - 1) - xAt(0));
    };
  }
  return categoryX(built.labels, xAt);
}

function segmentsOf(layer: Stacked, xAt: (index: number) => number, yAt: (value: number) => number, connect: boolean): { top: Pt[]; bottom: Pt[] }[] {
  const runs: { top: Pt[]; bottom: Pt[] }[] = [];
  let top: Pt[] = [];
  let bottom: Pt[] = [];
  const flush = () => {
    if (top.length > 1) runs.push({ top, bottom });
    top = [];
    bottom = [];
  };
  for (let i = 0; i < layer.values.length; i++) {
    if (layer.values[i] === null && !connect) {
      flush();
      continue;
    }
    if (layer.values[i] === null) continue;
    top.push({ x: xAt(i), y: yAt(layer.y1[i]) });
    bottom.push({ x: xAt(i), y: yAt(layer.y0[i]) });
  }
  flush();
  return runs;
}

function areaD(top: Pt[], bottom: Pt[], curve: Curve): string {
  if (top.length < 2) return "";
  const forward = linePath(top, curve);
  const back = linePath([...bottom].reverse(), curve).replace(/^M/, "L");
  return `${forward} ${back} Z`;
}

function linePath(points: Pt[], curve: Curve): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;
  if (curve === "monotone") return monotone(points);
  if (curve === "step" || curve === "step-before" || curve === "step-after") return stepPath(points, curve);
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${n(point.x)} ${n(point.y)}`).join(" ");
}

function stepPath(points: Pt[], mode: "step" | "step-before" | "step-after"): string {
  let d = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    if (mode === "step-before") d += ` L ${n(prev.x)} ${n(next.y)} L ${n(next.x)} ${n(next.y)}`;
    else if (mode === "step-after") d += ` L ${n(next.x)} ${n(prev.y)} L ${n(next.x)} ${n(next.y)}`;
    else {
      const mid = (prev.x + next.x) / 2;
      d += ` L ${n(mid)} ${n(prev.y)} L ${n(mid)} ${n(next.y)} L ${n(next.x)} ${n(next.y)}`;
    }
  }
  return d;
}

function monotone(points: Pt[]): string {
  const count = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    const span = points[i + 1].x - points[i].x;
    dx.push(span);
    slope.push(span === 0 ? 0 : (points[i + 1].y - points[i].y) / span);
  }
  const tangent = new Array<number>(count);
  tangent[0] = slope[0] ?? 0;
  tangent[count - 1] = slope[count - 2] ?? 0;
  for (let i = 1; i < count - 1; i++) {
    const left = slope[i - 1] ?? 0;
    const right = slope[i] ?? 0;
    tangent[i] = left * right <= 0 ? 0 : (left + right) / 2;
  }
  for (let i = 0; i < count - 1; i++) {
    const delta = slope[i] ?? 0;
    if (delta === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const alpha = tangent[i] / delta;
    const beta = tangent[i + 1] / delta;
    const sum = alpha * alpha + beta * beta;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangent[i] = scale * alpha * delta;
      tangent[i + 1] = scale * beta * delta;
    }
  }
  const parts = new Array<string>(count);
  parts[0] = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 0; i < count - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const span = dx[i] ?? 0;
    parts[i + 1] = `C ${n(from.x + span / 3)} ${n(from.y + ((tangent[i] ?? 0) * span) / 3)}, ${n(to.x - span / 3)} ${n(to.y - ((tangent[i + 1] ?? 0) * span) / 3)}, ${n(to.x)} ${n(to.y)}`;
  }
  return parts.join(" ");
}

function layerColor(frame: { preset: Parameters<typeof paint>[1] }, spec: Record<string, unknown>, names: string[]): (name: string) => string {
  const color = readColor(isRecord(spec.encoding) ? spec.encoding.color : undefined);
  return (name) => paint(color?.constant, frame.preset, Math.max(0, names.indexOf(name)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function legendHide(spec: Record<string, unknown>): string[] {
  return isRecord(spec.legend) && Array.isArray(spec.legend.hide) ? spec.legend.hide.filter((item): item is string => typeof item === "string") : [];
}

function legendBox(spec: Record<string, unknown>, position: "top" | "right" | "bottom" | "left"): LegendBox {
  const rich = readLegend(spec);
  if (rich) return rich;
  const side = position === "left" || position === "right";
  return {
    position,
    anchor: "top-left",
    align: "start",
    orient: side ? "vertical" : "horizontal",
    title: isRecord(spec.legend) && typeof spec.legend.title === "string" ? spec.legend.title : "",
    hide: legendHide(spec),
    symbol: "",
    symbols: {},
  };
}

function insetLegend(box: Box, legend: LegendBox | null, space: { band: number; side: number } | null): Box {
  if (!legend || !space) return box;
  const next = { ...box };
  if (legend.position === "right") next.right -= space.side;
  else if (legend.position === "left") next.left += space.side;
  else if (legend.position === "top") next.top += space.band;
  else next.bottom -= space.band;
  if (next.right - next.left < 40) next.right = next.left + 40;
  if (next.bottom - next.top < 40) next.bottom = next.top + 40;
  return next;
}

function withEncodingTitles(spec: Record<string, unknown>, encoding: Record<string, unknown>): Record<string, unknown> {
  const axes = isRecord(spec.axes) ? { ...spec.axes } : {};
  for (const key of ["x", "y"] as const) {
    const channel = encoding[key];
    const title = isRecord(channel) && typeof channel.title === "string" ? channel.title : "";
    if (!title || axes[key] === false || (isRecord(axes[key]) && axes[key].show === false)) continue;
    const node = isRecord(axes[key]) ? { ...axes[key] } : {};
    if (typeof node.title !== "string" || node.title === "") node.title = title;
    axes[key] = node;
  }
  return { ...spec, axes };
}

function explicitFormat(spec: Record<string, unknown>, axis: "x" | "y"): unknown {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[axis]) ? axes[axis] : undefined;
  return node && node.format !== undefined ? node.format : undefined;
}

function yLabels(frame: { locale: string; preset: { muted: string } }, spec: Record<string, unknown>, box: Box, values: number[], yAt: (value: number) => number, format: unknown): string {
  if (!axisOnSafe(spec, "y")) return "";
  const axis = readAxis(spec, "y");
  if (axis.labels === false) return "";
  const step = labelStep(values.length, axis.skip, 1);
  const ink = cssVar("muted", frame.preset.muted);
  return values
    .filter((_, index) => index % step === 0)
    .map((value) => text(box.left - 8, yAt(value) + 4, formatValue(value, format, frame.locale), ink, 11, "400", "end"))
    .join("");
}

function axisOnSafe(spec: Record<string, unknown>, key: "x" | "y"): boolean {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes || axes[key] === undefined) return true;
  if (axes[key] === false) return false;
  return !(isRecord(axes[key]) && axes[key].show === false);
}

function xTickLabels(frame: { locale: string; preset: { muted: string }; width: number; height: number }, spec: Record<string, unknown>, built: Built, xAt: (index: number) => number, box: Box): string {
  if (!axisOnSafe(spec, "x")) return "";
  const axis = readAxis(spec, "x");
  if (axis.labels === false) return "";
  const zone = zoneOf(spec);
  const span = built.temporal ? Math.abs((instantOf(built.rawX[built.rawX.length - 1]) ?? 0) - (instantOf(built.rawX[0]) ?? 0)) : 0;
  const encodedX = isRecord(spec.encoding) && isRecord(spec.encoding.x) ? spec.encoding.x.format : undefined;
  const xFormat = explicitFormat(spec, "x") ?? encodedX;
  const labels = built.labels.map((label, index) => {
    const ms = instantOf(built.rawX[index]);
    const shown = built.temporal && ms !== null
      ? xFormat !== undefined
        ? formatValue(ms, xFormat, frame.locale)
        : formatZoned(ms, span || 1, frame.locale, zone)
      : label;
    return { x: xAt(index), text: shown };
  });
  const omitted = labels.length > 8 ? Math.ceil(labels.length / 6) : 1;
  const step = labelStep(labels.length, axis.skip, omitted);
  const y = box.bottom + 16;
  const ink = cssVar("muted", frame.preset.muted);
  const shown = keepClearTicks(labels.filter((label, index) => index % step === 0 && label.text));
  return shown
    .map((label) => {
      const body = text(label.x, y, label.text, ink, 11, "400", "middle");
      if (!axis.rotate) return body;
      return body.replace("<text ", `<text transform="rotate(${n(axis.rotate)} ${n(label.x)} ${n(y)})" `);
    })
    .join("");
}

function tickInset(frame: { locale: string }, spec: Record<string, unknown>, built: Built): number {
  const zone = zoneOf(spec);
  const span = built.temporal ? Math.abs((instantOf(built.rawX[built.rawX.length - 1]) ?? 0) - (instantOf(built.rawX[0]) ?? 0)) : 0;
  const encodedX = isRecord(spec.encoding) && isRecord(spec.encoding.x) ? spec.encoding.x.format : undefined;
  const xFormat = explicitFormat(spec, "x") ?? encodedX;
  let widest = 24;
  for (let index = 0; index < built.labels.length; index++) {
    const ms = instantOf(built.rawX[index]);
    const shown = built.temporal && ms !== null
      ? xFormat !== undefined
        ? formatValue(ms, xFormat, frame.locale)
        : formatZoned(ms, span || 1, frame.locale, zone)
      : built.labels[index];
    widest = Math.max(widest, (shown || "").length * 7);
  }
  return Math.ceil(widest / 2) + 4;
}

function xGrid(spec: Record<string, unknown>, frame: { preset: { grid: string } }, box: Box, labels: string[], xAt: (index: number) => number): string {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes.x) ? axes.x : undefined;
  const grid = node?.grid;
  if (grid !== true && grid !== "solid" && grid !== "dashed" && grid !== "dotted") return "";
  const dash = grid === "dashed" ? ' stroke-dasharray="3 3"' : grid === "dotted" ? ' stroke-dasharray="1 3"' : "";
  return labels
    .map((_, index) => `<line data-ck-grid="1" x1="${n(xAt(index))}" y1="${n(box.top)}" x2="${n(xAt(index))}" y2="${n(box.bottom)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`)
    .join("");
}

function columns(built: Built, layers: Stacked[], box: Box, xAt: (index: number) => number, yAt: (value: number) => number, locale: string, format: unknown): string {
  const parts: string[] = [];
  for (let i = 0; i < built.labels.length; i++) {
    let low = Infinity;
    let high = -Infinity;
    let total = 0;
    const rows: string[] = [];
    for (const layer of layers) {
      const value = layer.values[i];
      if (typeof value !== "number") continue;
      total += value;
      low = Math.min(low, layer.y0[i], layer.y1[i]);
      high = Math.max(high, layer.y0[i], layer.y1[i]);
    }
    for (const layer of layers) {
      const value = layer.values[i];
      if (typeof value !== "number") continue;
      const share = total ? value / total : 0;
      const shown = fmt(value, locale, format);
      rows.push(`${layer.name} ${shown} (${formatValue(share, "percent", locale)})`);
    }
    if (!Number.isFinite(low)) continue;
    const prev = i > 0 ? xAt(i - 1) : box.left;
    const next = i + 1 < built.labels.length ? xAt(i + 1) : box.right;
    const x = i === 0 ? box.left : (prev + xAt(i)) / 2;
    const right = i === built.labels.length - 1 ? box.right : (xAt(i) + next) / 2;
    const label = `${built.labels[i]}. ${rows.join(". ")}`;
    parts.push(
      openMark(
        "rect",
        "column",
        label,
        `data-ck-i="${i}" tabindex="0" x="${n(x)}" y="${n(yAt(high))}" width="${n(Math.max(1, right - x))}" height="${n(Math.max(1, yAt(low) - yAt(high)))}" fill="transparent"`,
      ),
    );
    parts.push("</rect>");
  }
  return parts.join("");
}

function layerLabel(layer: Stacked, locale: string, format: unknown): string {
  const values = layer.values.filter((value): value is number => typeof value === "number");
  if (!values.length) return layer.name;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `${layer.name}, ${fmt(min, locale, format)} to ${fmt(max, locale, format)}`;
}

interface Obstacle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Tick labels and an inside legend. A layer name that cannot clear them is omitted; the area keeps the full name. */
function labelObstacles(
  frame: { locale: string },
  spec: Record<string, unknown>,
  box: Box,
  values: number[],
  yAt: (value: number) => number,
  format: unknown,
  legend: LegendBox | null,
  items: LegendItem[],
): Obstacle[] {
  const taken: Obstacle[] = [];
  if (axisOnSafe(spec, "y") && readAxis(spec, "y").labels !== false) {
    for (const value of values) {
      const label = formatValue(value, format, frame.locale);
      const wide = Math.max(12, label.length * 7);
      const y = yAt(value) + 4;
      taken.push({ left: box.left - 12 - wide, right: box.left - 2, top: y - 12, bottom: y + 3 });
    }
  }
  if (legend?.position === "inside" && items.length) {
    const space = legendSpace({ ...legend, orient: "vertical" }, items, 140);
    const blockW = Math.min(space.side, Math.max(72, (box.right - box.left) * 0.46));
    const anchor = legend.anchor;
    const left = anchor.endsWith("left") || anchor === "left" ? box.left + 6 : anchor.endsWith("right") || anchor === "right" ? box.right - blockW - 22 : (box.left + box.right - blockW) / 2 - 8;
    const top = anchor.startsWith("top") || anchor === "top" ? box.top + 6 : anchor.startsWith("bottom") || anchor === "bottom" ? box.bottom - space.band - 22 : (box.top + box.bottom - space.band) / 2 - 8;
    taken.push({ left, right: left + blockW + 28, top, bottom: top + space.band + 16 });
  }
  return taken;
}

function hits(a: Obstacle, b: Obstacle): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function layerLabels(layers: Stacked[], xAt: (index: number) => number, yAt: (value: number) => number, frame: { preset: { text: string } }, box: Box, obstacles: Obstacle[]): string {
  const taken = obstacles.slice();
  const parts: string[] = [];
  for (const layer of layers) {
    const order = layer.values
      .map((value, index) => ({ index, thick: typeof value === "number" ? Math.abs(layer.y1[index] - layer.y0[index]) : -1 }))
      .filter((item) => item.thick >= 0)
      .sort((a, b) => b.thick - a.thick);
    const wide = Math.max(12, layer.name.length * 7);
    const minX = box.left + wide / 2 + 4;
    const maxX = box.right - wide / 2 - 4;
    if (maxX <= minX) continue;
    for (const spot of order) {
      const x = Math.max(minX, Math.min(maxX, xAt(spot.index)));
      const y = (yAt(layer.y0[spot.index]) + yAt(layer.y1[spot.index])) / 2 + 4;
      const rect = { left: x - wide / 2 - 3, right: x + wide / 2 + 3, top: y - 13, bottom: y + 3 };
      if (rect.top < box.top || rect.bottom > box.bottom) continue;
      if (taken.some((item) => hits(item, rect))) continue;
      taken.push(rect);
      parts.push(text(x, y, layer.name, cssVar("text", frame.preset.text), 11, "600", "middle"));
      break;
    }
  }
  return parts.join("");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
