import { annotationLayers, notesNeedSamples, seriesPoints } from "../annotations";
import { formatValue } from "../format";
import { nudge, type Bag } from "../glyphs";
import { ch } from "../svg";
import { labelInk } from "../ink";
import { cssVar } from "../theme";
import type { Lab, Layers, PlotBox, PlotModel, Series, XScale } from "./types";
import { formatNumber } from "./ticks";
import { dataNumber, layerOn, locateX } from "./scales";

export function wantLabels(model: PlotModel): boolean {
  return model.labelsOn || model.labelAt !== "" || model.labelEnds !== "" || model.labelFormat !== undefined;
}

export function labelText(model: PlotModel, series: Series | undefined, value: number): string {
  const format = model.labelFormat ?? series?.format;
  if (format !== undefined) return formatValue(value, format, model.locale);
  return formatNumber(value, model.locale);
}

function endsOf(values: ArrayLike<number | null>): [number, number] {
  let first = -1;
  let last = -1;
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== "number") continue;
    if (first < 0) first = i;
    last = i;
  }
  return [first, last];
}

function labelIndex(mode: string, index: number, first: number, last: number): boolean {
  if (mode === "last") return index === last;
  if (mode === "ends") return index === first || index === last;
  return true;
}

export function queueBarLabel(
  model: PlotModel,
  series: Series,
  value: number | null,
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
  labs: Lab[],
  tipLeft = false,
  gutter = 0,
  viewWidth = 0,
): void {
  if (!wantLabels(model) || typeof value !== "number") return;
  let pos = model.labelAt || (model.stackTotal ? "inside" : horizontal ? "right" : "top");
  if ((pos === "inside" || pos === "center") && Math.min(w, h) < 16) pos = horizontal ? "right" : "top";
  const text = labelText(model, series, value);
  const textW = Math.max(8, ch(text.length, 6.8));
  let lx = x + w / 2;
  let ly = y - 4;
  let anchor = "middle";
  if (horizontal) {
    ly = y + h / 2 + 3;
    const tipSide = model.labelAt === "" || model.labelAt === "outside";
    if (tipSide && tipLeft) {
      const outside = x - 4 - textW;
      if (outside >= gutter + 2) {
        lx = x - 4;
        anchor = "end";
      } else {
        lx = Math.max(gutter + textW + 2, Math.min(x + w - 2, x + textW + 2));
        anchor = "end";
      }
    } else if (pos === "left" || pos === "bottom") {
      lx = x + 4;
      anchor = "start";
    } else if (pos === "center" || pos === "inside") anchor = "middle";
    else {
      lx = x + w + 4;
      anchor = "start";
      const limit = viewWidth > 0 ? viewWidth - 4 : lx + textW;
      if (lx + textW > limit) lx = Math.max(x + 2, limit - textW);
    }
  } else if (pos === "bottom") ly = y + h - 2;
  else if (pos === "center" || pos === "inside") ly = y + Math.min(h - 2, Math.max(12, h / 2)) ;
  else if (pos === "left") {
    lx = x - 4;
    ly = y + h / 2 + 3;
    anchor = "end";
  } else if (pos === "right") {
    lx = x + w + 4;
    ly = y + h / 2 + 3;
    anchor = "start";
  }
  const onBar = pos === "inside" || pos === "center" || pos === "bottom" || (horizontal && (pos === "left" || pos === "inside"));
  labs.push({ x: lx, y: ly, anchor, text, ink: onBar ? labelInk(series.color) : undefined });
}

export function placeLineLabels(
  model: PlotModel,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  held: Bag,
): string {
  if (!wantLabels(model)) return "";
  const pos = model.labelAt || "top";
  const pageInk = cssVar("text", model.preset.text);
  const onMark = pos === "center" || pos === "inside";
  let out = "";
  model.series.forEach((series, index) => {
    if (series.mark === "bar") return;
    const [first, last] = endsOf(series.values);
    if (first < 0) return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const shift = nudge(pos, series.radius ?? model.pointSize);
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number" || !labelIndex(model.labelEnds, i, first, last)) continue;
      const plotted = layerOn(layers, index) ? layers!.top[index]?.[i] : value;
      if (typeof plotted !== "number") continue;
      const ink = onMark ? labelInk(series.color) : pageInk;
      out += held.put(labelText(model, series, value), xScale.center(i) + shift[0], scale(plotted) + shift[1], shift[2], ink);
    }
  });
  return out;
}

function seriesLabelBoxes(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  horizontal: boolean,
): { x: number; y: number; w: number; h: number }[] {
  if (!wantLabels(model) || horizontal) return [];
  const pos = model.labelAt || "top";
  const layers = model.layers;
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  model.series.forEach((series, index) => {
    if (series.mark === "bar") return;
    const [first, last] = endsOf(series.values);
    if (first < 0) return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const shift = nudge(pos, series.radius ?? model.pointSize);
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number" || !labelIndex(model.labelEnds, i, first, last)) continue;
      const plotted = layerOn(layers, index) ? layers!.top[index]?.[i] : value;
      if (typeof plotted !== "number") continue;
      const text = labelText(model, series, value);
      const x = xScale.center(i) + shift[0];
      const y = scale(plotted) + shift[1];
      const w = Math.max(8, ch(text.length, 6));
      const left = shift[2] === "middle" ? x - w / 2 : shift[2] === "end" ? x - w : x;
      boxes.push({ x: left, y: y - 9, w, h: 11 });
    }
  });
  return boxes;
}

export function paintNotes(
  model: PlotModel,
  plot: PlotBox,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  horizontal: boolean,
  count: number,
): { under: string; over: string } {
  return annotationLayers(model.notes, {
    plot,
    taken: seriesLabelBoxes(model, xScale, yScale, y2Scale, horizontal),
    preset: model.preset,
    xAt: (value) => locateX(model, xScale, value, count),
    yAt: (value, axis) => {
      const numeric = dataNumber(value);
      if (numeric === null) return null;
      return (axis === "y2" ? y2Scale : yScale)(numeric);
    },
    samples: notesNeedSamples(model.notes)
      ? model.series.map((series) => ({ name: series.name, axis: series.axis, pts: seriesPoints(model.x, series.values) }))
      : undefined,
    labels: model.labels,
    temporal: model.xTemporal,
    xEnd: Boolean(model.xAxis.end) && horizontal !== true,
    xNum: model.x,
    slot: (index) => xScale.band(index),
    count,
    flip: horizontal,
    bands: model.bands,
  });
}
