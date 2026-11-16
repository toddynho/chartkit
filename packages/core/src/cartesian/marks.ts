import { bag, marker } from "../glyphs";
import { sampleSeries } from "../sampling";
import { clamp, esc, n } from "../svg";
import { slots } from "../feature-hooks";
import { cssVar, lineStroke } from "../theme";
import type { Lab, Layers, PlotModel, Pt, Series, XScale } from "./types";
import { rangePainter, totalHook } from "./hooks";
import { catKey, numKey } from "./data";
import { layerOn } from "./scales";
import { areaPath, collapseArea, flatY, pairSegments, segments, stroked } from "./paths";
import { queueBarLabel } from "./labels";

function paintOrder(series: Series[], stacked: boolean): number[] {
  const order = series.map((_, index) => index);
  if (stacked || !series.some((item) => typeof item.z === "number")) return order;
  order.sort((a, b) => (series[a]?.z ?? 0) - (series[b]?.z ?? 0) || a - b);
  return order;
}

export function drawLines(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  _horizontal: boolean,
): string {
  const layers = model.layers;
  const stacked = model.stack !== "none" || Boolean(layers?.on.some(Boolean));
  const out: string[] = [];
  out.push(plotBreaks(model, plot));
  const plotWidth = Math.max(1, plot.right - plot.left);
  const shared = sharedSample(model, layers, plotWidth);
  for (const index of paintOrder(model.series, stacked)) {
    const series = model.series[index];
    if (!series || series.mark === "bar") continue;
    appendLineSeries(out, model, series, index, layers, xScale, series.axis === "y2" ? y2Scale : yScale, plotWidth, shared);
  }
  const held = bag();
  let late = "";
  if (layers && totalHook && legacyTotals(model)) late += totalHook(model, layers, xScale, yScale, false, held);
  if (slots.labels) late += slots.labels(model, layers, xScale, yScale, y2Scale, held);
  if (late) model.late += late;
  return out.join("");
}

export function drawBars(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
): string {
  const layers = model.layers;
  const stacked = model.stack !== "none" || Boolean(layers?.on.some(Boolean));
  const out: string[] = [];
  const labs: Lab[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  for (const index of paintOrder(model.series, stacked)) {
    const series = model.series[index];
    if (!series || series.mark !== "bar") continue;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
    out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex, labs));
  }
  const held = bag();
  let late = "";
  if (layers && totalHook && legacyTotals(model)) late += totalHook(model, layers, xScale, yScale, horizontal, held);
  const fill = cssVar("text", model.preset.text);
  for (const lab of labs) late += held.put(lab.text, lab.x, lab.y, lab.anchor, lab.ink || fill);
  if (late) model.late += late;
  return out.join("");
}

/** Range bands paint first, so a band sits under a line even when the series is listed later. */
export function drawCombo(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
): string {
  const layers = model.layers;
  const stacked = model.stack !== "none" || Boolean(layers?.on.some(Boolean));
  const out: string[] = [];
  const labs: Lab[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  const plotWidth = Math.max(1, plot.right - plot.left);
  const shared = sharedSample(model, layers, plotWidth);
  const ordered = paintOrder(model.series, stacked);
  const ranked = ordered.some((index, place) => index !== place);
  if (rangePainter && !ranked) {
    model.series.forEach((series, index) => {
      if (series.mark !== "range") return;
      const scale = series.axis === "y2" ? y2Scale : yScale;
      out.push(rangePainter?.(series, index, (i) => xScale.center(i), scale) ?? "");
    });
  }
  for (const index of ordered) {
    const series = model.series[index];
    if (!series) continue;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    if (series.mark === "range") {
      if (ranked && rangePainter) out.push(rangePainter(series, index, (i) => xScale.center(i), scale) ?? "");
      continue;
    }
    if (series.mark === "bar") {
      const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
      out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex, labs));
      continue;
    }
    appendLineSeries(out, model, series, index, layers, xScale, scale, plotWidth, shared);
  }
  const held = bag();
  const fill = cssVar("text", model.preset.text);
  let late = slots.labels ? slots.labels(model, layers, xScale, yScale, y2Scale, held) : "";
  for (const lab of labs) late += held.put(lab.text, lab.x, lab.y, lab.anchor, lab.ink || fill);
  if (late) model.late += late;
  return out.join("");
}

function sharedSample(model: PlotModel, layers: Layers | null, plotWidth: number): ReturnType<typeof sampleSeries> | null {
  if (!layers?.uniform || model.series.length === 0) return null;
  let top = layers.top[layers.top.length - 1];
  for (let i = layers.crest.length - 1; i >= 0; i--) {
    if (layers.on[i] && layers.crest[i]) {
      top = layers.top[i];
      break;
    }
  }
  return sampleSeries(model.sampling, model.x, top, top.length, plotWidth, true);
}

/** Stack totals stay the whole-chart sum. A named stack group does not invent that sum. */
function legacyTotals(model: PlotModel): boolean {
  return model.stack !== "none" && model.series.every((item) => !item.stackId);
}

function appendLineSeries(
  out: string[],
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plotWidth: number,
  shared: ReturnType<typeof sampleSeries> | null,
): void {
  const stacked = layerOn(layers, index);
  const ys = stacked ? layers!.top[index] : series.values;
  const sampled = shared ?? sampleSeries(model.sampling, model.x, ys, series.values.length, plotWidth, model.connectNulls);
  if (!sampled.reduced) {
    appendFullLine(out, model, series, index, layers, xScale, yScale);
    return;
  }
  const area = series.area || model.type === "stacked-area";
  for (const run of sampled.runs) {
    const points: Pt[] = [];
    const bottoms: Pt[] = [];
    const kept: number[] = [];
    for (let k = 0; k < run.length; k++) {
      const i = run[k];
      const raw = stacked ? layers!.top[index][i] : series.values[i];
      if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
      const x = xScale.center(i);
      const y = yScale(raw);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      points.push({ x, y });
      kept.push(i);
      if (area) {
        const base = stacked ? layers!.bottom[index][i] : 0;
        bottoms.push({ x, y: yScale(typeof base === "number" && Number.isFinite(base) ? base : 0) });
      }
    }
    if (points.length === 0) continue;
    if (area && points.length > 48 && flatY(bottoms)) collapseArea(points, bottoms);
    const v0 = ys[kept[0]];
    const v1 = ys[kept[kept.length - 1]];
    const log = series.axis === "y2" ? model.y2Log : model.yLog;
    const scaleAttr =
      !stacked && !log && typeof v0 === "number" && typeof v1 === "number" && v0 !== v1
        ? ` data-ck-ys="${n(points[0].y)},${n(points[points.length - 1].y)},${n(v0)},${n(v1)},${index}"`
        : "";
    const indexAttr = ` data-ck-sample="${sampled.mode}" data-ck-i="${kept.join(" ")}"${scaleAttr}`;
    if (area) {
      const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
    paintAreas(out, gapTops(points, model, index, layers), bottoms, model, series, fill, indexAttr);
    }
    paintStroke(out, points, model, series, indexAttr);
    // Hidden circles exist so --ck-line-dots can reveal them. A downsampled line
    // already has a vertex per pixel, and those circles dominate the SVG, so
    // interact draws the hover dot from the path instead.
    paintPoints(out, points, model, series, kept);
  }
}

function appendFullLine(
  out: string[],
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
): void {
  if (!layerOn(layers, index) && model.curve === "linear" && !series.area && model.type !== "stacked-area" && model.dots === "off" && !markerShape(model, series) && !model.partial) {
    appendLinear(out, model, series, xScale, yScale);
    return;
  }
  const points = pointsFor(series, index, layers, xScale, yScale, model);
  if (series.area || model.type === "stacked-area") {
    const bottoms = bottomPoints(series, index, layers, xScale, yScale, model);
    const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
    paintAreas(out, gapTops(points, model, index, layers), bottoms, model, series, fill, "");
  }
  for (const segment of segments(points, model.connectNulls)) {
    paintStroke(out, segment, model, series, "");
  }
  paintPoints(out, points, model, series);
}

/** Linear stroke with no area and no markers. Same commands as linePath, without a point object per row. */
function appendLinear(
  out: string[],
  model: PlotModel,
  series: Series,
  xScale: XScale,
  yScale: (value: number) => number,
): void {
  const values = series.values;
  let parts: string[] = [];
  const flush = () => {
    if (parts.length === 0) return;
    pushStroke(out, parts.join(" "), model, series, "");
    parts = [];
  };
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      if (!model.connectNulls) flush();
      continue;
    }
    parts.push((parts.length === 0 ? "M " : "L ") + n(xScale.center(i)) + " " + n(yScale(value)));
  }
  flush();
}

export function strokeOf(series: Series, model: PlotModel): string {
  return lineStroke(series.color, model.strokeWidth, model.preset.lines);
}

/** Crisp stroke, and a blurred copy under it when mark.glow is set. */
function gapTops(points: (Pt | null)[], model: PlotModel, index: number, layers: Layers | null): (Pt | null)[] {
  if (!layers || model.stackGap <= 0 || index >= layers.top.length - 1) return points;
  const gap = model.stackGap;
  const out: (Pt | null)[] = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    out[i] = point ? { x: point.x, y: point.y + gap } : null;
  }
  return out;
}

function paintAreas(
  out: string[],
  tops: (Pt | null)[],
  bottoms: (Pt | null)[],
  model: PlotModel,
  series: Series,
  fill: string,
  extra: string,
): void {
  const emit = (top: (Pt | null)[], bottom: (Pt | null)[], opacity: string) => {
    for (const [above, below] of pairSegments(top, bottom, model.connectNulls)) {
      if (above.length < 2) continue;
      out.push(`<path d="${areaPath(above, below, model.curve)}" fill="${fill}" fill-opacity="${opacity}" stroke="none"${extra} data-ck-key="${esc(`a:${series.name}`)}" />`);
    }
  };
  const fade = areaFade(model, series);
  if (model.partialOpacity === undefined || tops.length < 2) {
    emit(tops, bottoms, fade);
    return;
  }
  emit(tops.slice(0, -1), bottoms.slice(0, -1), fade);
  emit(tops.slice(-2), bottoms.slice(-2), n(model.partialOpacity));
}

/** Solid stroke, then a dashed or dotted last segment when mark.partial is set. */
function paintStroke(out: string[], points: Pt[], model: PlotModel, series: Series, extra: string): void {
  const spans = series.axis === "y2" ? model.y2Spans : model.ySpans;
  if (model.partial && points.length >= 2) {
    const head = points.slice(0, -1);
    if (head.length >= 2) pushStroke(out, stroked(head, model.curve, spans), model, series, extra);
    pushStroke(out, stroked(points.slice(-2), model.curve, spans), model, series, extra, model.partial);
    return;
  }
  pushStroke(out, stroked(points, model.curve, spans), model, series, extra);
}

function pushStroke(out: string[], d: string, model: PlotModel, series: Series, extra: string, dash = series.dash): void {
  const stroke = strokeOf(series, model);
  const base = `fill="none" stroke="${stroke}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(dash)}`;
  if (model.glow) out.push(`<path d="${d}" ${base} stroke-width="${n(model.strokeWidth + 2.5)}" filter="url(#${model.id}glow)" pointer-events="none" />`);
  out.push(`<path d="${d}" ${base} stroke-width="${model.strokePaint}"${extra}${seriesMotion(model, series)} />`);
}

export function areaMid(model: PlotModel): string {
  if (model.fillPaint.startsWith("var(")) return `calc(${model.fillPaint} * 0.35)`;
  return n(model.fillOpacity * 0.35);
}

export function markerShape(model: PlotModel, series: Series): string | null {
  const shape = series.shape || model.pointShape;
  if (shape === "none") return null;
  if (shape) return shape;
  if (series.radius !== undefined || series.hollow || model.pointHollow) return "circle";
  if (model.dots === "off") return null;
  return "circle";
}

export function explicitMark(model: PlotModel, series: Series): boolean {
  return Boolean(series.shape || model.pointShape || series.radius !== undefined || series.hollow || model.pointHollow);
}

function paintPoints(out: string[], points: (Pt | null)[], model: PlotModel, series: Series, indexes?: number[]): void {
  const colored = Boolean(series.colors && series.colors.length);
  const shape = markerShape(model, series) || (colored ? "circle" : null);
  if (!shape) return;
  const explicit = explicitMark(model, series) || colored;
  if (!explicit && model.dots === "off") return;
  if (!explicit && indexes && model.dots !== "shown") return;
  const radius = series.radius ?? model.pointSize;
  const hidden = !explicit && model.dots !== "shown" ? ` style="display:var(--ck-line-dots, none)"` : "";
  for (let k = 0; k < points.length; k++) {
    const point = points[k];
    if (!point) continue;
    const at = indexes ? indexes[k] : k;
    const override = series.colors?.[at];
    const ruled = Boolean(override && override !== series.color);
    const outlined = Boolean(series.ruleHollow?.[at]);
    const hollow = outlined || series.hollow || model.pointHollow;
    const color = ruled && override ? override : series.mark === "line" ? strokeOf(series, model) : series.color;
    const caption = series.ruleLabels?.[at] ?? "";
    const named = colored ? ` data-ck-name="${esc(series.name)}" data-ck-i="${at}"` : indexes ? ` data-ck-i="${indexes[k]}"` : "";
    const pointKey = ` data-ck-key="${esc(`p:${series.name}:${catKey(model, at)}`)}"`;
    const pointValue = typeof series.values[at] === "number" && Number.isFinite(series.values[at]) ? ` data-ck-value="${numKey(series.values[at] as number)}"` : "";
    const rule = caption ? ` data-ck-rule="${esc(caption)}"` : "";
    if (outlined) {
      const hole = cssVar("surface", model.preset.surface);
      const title = caption ? `><title>${esc(caption)}</title></circle>` : " />";
      out.push(
        `<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(radius + 1.25)}" fill="${hole}" stroke="${color}" stroke-width="2"${hidden}${named}${pointKey}${pointValue}${rule}${title}`,
      );
      continue;
    }
    const ring = ruled ? ` stroke="${cssVar("background", model.preset.background)}" stroke-width="2"` : "";
    out.push(marker(point.x, point.y, radius + (ruled ? 1.25 : 0), shape, color, hollow, hidden + ring + named + pointKey + pointValue + rule, caption));
  }
}

/**
 * Round only the end away from the baseline. clip-path reads --ck-bar-radius
 * when the spec omitted mark.cornerRadius. A path would bake the radius.
 */
function barMark(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  useVar: boolean,
  edge: "top" | "bottom" | "left" | "right",
  fill: string,
  extra = "",
  ends: "outer" | "all" = "outer",
): string {
  const rect = `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" fill="${fill}"${extra}`;
  if (width <= 0 || height <= 0 || (!useVar && radius < 0.5)) return `${rect} />`;
  const cap = useVar
    ? `min(var(--ck-bar-radius, ${n(radius)}) * 1px, ${n(width / 2)}px, ${n(height / 2)}px)`
    : `min(${n(radius)}px, ${n(width / 2)}px, ${n(height / 2)}px)`;
  const round = ends === "all" ? `${cap}` : edge === "top" ? `${cap} ${cap} 0 0` : edge === "bottom" ? `0 0 ${cap} ${cap}` : edge === "right" ? `0 ${cap} ${cap} 0` : `${cap} 0 0 ${cap}`;
  return `${rect} style="clip-path:inset(0 round ${round})" />`;
}

function bars(
  model: PlotModel,
  series: Series,
  index: number,
  barCount: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plot: { left: number; right: number; top: number; bottom: number },
  horizontal: boolean,
  barIndex: number,
  labs: Lab[] = [],
): string {
  const gap = clamp(model.gap, 0, 0.9);
  const out: string[] = [];
  const stacked = layerOn(layers, index);
  const slot = model.barSlot[index] ?? (stacked ? 0 : barIndex);
  const slots = model.barSlots || (stacked ? 1 : Math.max(1, barCount));
  for (let i = 0; i < series.values.length; i++) {
    const raw = series.values[i];
    if (raw === null) continue;
    const value = stacked ? layers!.top[index][i] : raw;
    const baseline = stacked ? layers!.bottom[index][i] : 0;
    const band = xScale.band(i);
    const inner = band.size * (1 - gap);
    const barSize = inner / slots;
    const start = band.start + (band.size - inner) / 2 + slot * barSize;
    const a = yScale(baseline);
    const b = yScale(value ?? baseline);
    const inset = slots > 1 ? 2 : 0;
    const fill = series.colors?.[i] ?? series.color;
    const caption = series.ruleLabels?.[i] ?? "";
    const fade = series.fillOpacity === undefined ? "" : ` fill-opacity="${n(series.fillOpacity)}"`;
    const valueAttr = typeof raw === "number" && Number.isFinite(raw) ? ` data-ck-value="${numKey(raw)}"` : "";
    const orient = horizontal ? ` data-ck-orient="h"` : "";
    const extra =
      fade +
      ` data-ck-key="${esc(`b:${series.name}:${catKey(model, i)}`)}" data-ck-base="${n(a)}"${orient}${valueAttr}` +
      (series.colors ? ` data-ck-name="${esc(series.name)}" data-ck-i="${i}"` : "") +
      (caption ? ` data-ck-rule="${esc(caption)}"` : "");
    const outer = !stacked || Boolean(layers?.crest[index]);
    const roundEnds = model.radiusEnds === "all" || (stacked && model.stackGap > 0) ? "all" : "outer";
    const radius = outer || roundEnds === "all" ? model.cornerRadius : 0;
    const useVar = (outer || roundEnds === "all") && model.radiusVar;
    const split = stacked && model.stackGap > 0 && !outer ? model.stackGap : 0;
    if (horizontal) {
      let y = start;
      let x = Math.min(a, b);
      let width = Math.max(0, Math.abs(b - a));
      const height = Math.max(0, barSize - inset);
      if (split) {
        if (b >= a) width = Math.max(0, width - split);
        else {
          x += split;
          width = Math.max(0, width - split);
        }
      }
      if (stacked && width === 0) continue;
      const edge = b >= a ? "right" : "left";
      out.push(withTitle(barMark(x, y, width, height, radius, useVar, edge, fill, extra, roundEnds), caption));
      queueBarLabel(model, series, series.values[i], x, y, width, height, true, labs, b < a, plot.left, model.width);
    } else {
      const x = start;
      let y = Math.min(a, b);
      let height = Math.max(0, Math.abs(b - a));
      const width = Math.max(0, barSize - inset);
      if (split) {
        if (b <= a) y += split;
        height = Math.max(0, height - split);
      }
      if (stacked && height === 0) continue;
      const edge = b <= a ? "top" : "bottom";
      out.push(withTitle(barMark(x, y, width, height, radius, useVar, edge, fill, extra, roundEnds), caption));
      queueBarLabel(model, series, series.values[i], x, y, width, height, false, labs, false, plot.left, model.width);
    }
  }
  return out.join("");
}

function pointsFor(
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  model: PlotModel,
): (Pt | null)[] {
  const out: (Pt | null)[] = new Array(series.values.length);
  for (let i = 0; i < series.values.length; i++) {
    const value = series.values[i];
    const plotted = layerOn(layers, index) ? layers!.top[index][i] : value;
    if (plotted === null || typeof plotted !== "number" || !Number.isFinite(plotted) || (value === null && !model.connectNulls && !layerOn(layers, index))) out[i] = null;
    else out[i] = { x: xScale.center(i), y: yScale(plotted) };
  }
  return out;
}

function bottomPoints(
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  model: PlotModel,
): (Pt | null)[] {
  const out: (Pt | null)[] = new Array(series.values.length);
  for (let i = 0; i < series.values.length; i++) {
    const value = series.values[i];
    if (value === null && !layerOn(layers, index) && !model.connectNulls) out[i] = null;
    else {
      const baseline = layerOn(layers, index) ? layers!.bottom[index][i] : 0;
      out[i] = { x: xScale.center(i), y: yScale(baseline) };
    }
  }
  return out;
}

/**
 * A faint gap band across the plot. The break mark itself is the axis zigzag;
 * a second mark inside the plot reads as a stray glyph.
 */
function plotBreaks(model: PlotModel, plot: { left: number; top: number; right: number; bottom: number }): string {
  const spans = [...(model.ySpans ?? []), ...(model.y2Spans ?? [])];
  if (!spans.length) return "";
  const fill = cssVar("muted", model.preset.muted);
  let out = "";
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    if (!span) continue;
    const y1 = Math.min(span[0], span[1]);
    const y2 = Math.max(span[0], span[1]);
    const height = Math.max(1, y2 - y1);
    out += `<rect data-ck-break="1" x="${n(plot.left)}" y="${n(y1)}" width="${n(plot.right - plot.left)}" height="${n(height)}" fill="${fill}" fill-opacity="0.16" />`;
  }
  return out;
}

/** Native tooltip on a bar, naming the colour rule that painted it. */
function withTitle(mark: string, title: string): string {
  if (!title) return mark;
  return mark.replace(/ \/>$/, `><title>${esc(title)}</title></rect>`);
}

function seriesMotion(model: PlotModel, series: Series): string {
  let out = ` data-ck-key="${esc(`l:${series.name}`)}"`;
  const count = series.values.length;
  if (count < 2 || count > 48) return out;
  const nums: string[] = [];
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const value = series.values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) return out;
    nums.push(numKey(value));
    ids.push(catKey(model, i));
  }
  return `${out} data-ck-samples="${nums.join(" ")}" data-ck-xk="${esc(ids.join("\t"))}"`;
}

/** Series opacity wins. A gradient still owns the stop alphas, so the path stays at 1. */
function areaFade(model: PlotModel, series: Series): string {
  if (model.gradient) return "1";
  return series.fillOpacity === undefined ? model.fillPaint : n(series.fillOpacity);
}

function dashAttr(dash: string): string {
  if (dash === "dashed") return ' stroke-dasharray="6 4"';
  if (dash === "dotted") return ' stroke-dasharray="1.5 3"';
  return "";
}
