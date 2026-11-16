import { CHROME_TOP } from "../chrome";
import { legendSpace } from "../legend";
import { ch } from "../svg";
import { slots } from "../feature-hooks";
import type { Pad, PlotModel } from "./types";
import { widest, xAngle } from "./ticks";
import { labelText, wantLabels } from "./labels";
import { legendItems, legendRows } from "./chrome";
import { flatTitle, inkWidth, lineCount, outsideLen } from "./axes";

export function markPadding(model: PlotModel, horizontal: boolean): { top: number; right: number; bottom: number; left: number; gutter: number } {
  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;
  if (wantLabels(model)) {
    const pos = model.labelAt || "top";
    if (pos === "top" || pos === "outside" || pos === "") top += 16;
    if (pos === "bottom") bottom += 14;
    if (pos === "left") left += 28;
    if (pos === "right" || (horizontal && (pos === "outside" || pos === ""))) right = Math.max(right, 36);
    if (horizontal && (model.labelAt === "" || model.labelAt === "right" || model.labelAt === "outside")) {
      right = Math.max(right, Math.ceil(valueLabelWidth(model) + 16));
    }
  }
  return { top, right, bottom, left, gutter: horizontal && diverges(model) ? 8 : 0 };
}

export function padding(model: PlotModel, yLabels: string[], y2Labels: string[], xLabels: string[]): Pad {
  if (model.type === "sparkline" || model.type === "mini-area") {
    const inset = model.inset;
    return {
      top: typeof inset.t === "number" ? Math.max(2, inset.t) : 2,
      right: typeof inset.r === "number" ? Math.max(2, inset.r) : 2,
      bottom: typeof inset.b === "number" ? Math.max(2, inset.b) : 2,
      left: typeof inset.l === "number" ? Math.max(2, inset.l) : 2,
    };
  }
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yEnd = Boolean(model.yAxis.end);
  const xEnd = Boolean(model.xAxis.end);
  const y2End = model.y2Axis.end !== false;
  const yGap = Math.max(52, Math.ceil(inkWidth(model.yAxis, yLabels) + 12));
  const y2Gap = Math.max(52, Math.ceil(inkWidth(model.y2Axis, y2Labels) + 12));
  const xGap = Math.max(52, Math.ceil(inkWidth(model.xAxis, xLabels) + 12));
  let left = 12;
  let right = 16;
  let top = 14;
  let bottom = 12;
  const extra = slots.markPad?.(model, horizontal);
  if (extra) {
    top += extra.top;
    right = Math.max(right, extra.right);
    bottom += extra.bottom;
    left += extra.left;
  }
  if (model.title) top += 20;
  if (model.subtitle) top += 18;
  if (model.headline) top += (model.headline.label ? 26 : 0) + 56;
  if (model.stackTotal) {
    if (horizontal) right = Math.max(right, 48);
    else top += 16;
  }
  if (!horizontal && model.showY && model.yAxis.labels !== false) {
    if (yEnd) right = Math.max(right, yGap);
    else left = yGap;
  }
  if (horizontal && model.showY) {
    if (yEnd) top += 20;
    else bottom = 32;
  }
  if (model.showY2 && model.y2Axis.labels !== false) {
    if (y2End) right = Math.max(right, y2Gap);
    else left = Math.max(left, y2Gap);
  }
  if (model.showX && model.xAxis.labels !== false) {
    const lines = lineCount(model.xAxis, xLabels);
    const wrapped = (lines - 1) * 12;
    if (!horizontal && xEnd) top += 32 + wrapped;
    else if (!horizontal) bottom = 32 + wrapped;
    else if (xEnd) right = Math.max(right, xGap);
    else left = Math.max(left, xGap + (extra?.gutter ?? 0));
  }
  const yTick = model.showY ? outsideLen(model.yAxis) : 0;
  const y2Tick = model.showY2 ? outsideLen(model.y2Axis) : 0;
  const xTick = model.showX ? outsideLen(model.xAxis) : 0;
  if (yTick) {
    if (!horizontal && yEnd) right += yTick;
    else if (!horizontal) left += yTick;
    else if (yEnd) top += yTick;
    else bottom += yTick;
  }
  if (y2Tick) {
    if (y2End) right += y2Tick;
    else left += y2Tick;
  }
  if (xTick) {
    if (!horizontal && xEnd) top += xTick;
    else if (!horizontal) bottom += xTick;
    else if (xEnd) right += xTick;
    else left += xTick;
  }
  if (model.showY && model.yAxis.title) {
    const flat = flatTitle(model.yAxis.titleSpin);
    const extra = flat ? Math.ceil(ch(model.yAxis.title.length, 6.6)) + 12 : 16;
    if (!horizontal && yEnd) right += extra;
    else if (!horizontal) left += extra;
    else if (yEnd) top += extra;
    else bottom += extra;
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
    const rad = (Math.abs(angle) * Math.PI) / 180;
    const extra = Math.ceil(Math.abs(Math.sin(rad)) * Math.max(24, widest(model.labels.length ? model.labels : xLabels)));
    if (xEnd) top += extra;
    else bottom += extra;
  }
  if (model.legend && model.legendBox) {
    const space = legendSpace(model.legendBox, legendItems(model), Math.max(80, model.width - left - right));
    const pos = model.legendBox.position;
    if (pos === "top") top += space.band;
    else if (pos === "bottom") bottom += space.band + 10;
    else if (pos === "left") left += space.side + 8;
    else if (pos === "right") right += space.side + 10;
  } else if (model.legend) {
    top += 12 + legendRows(model, left, model.width - right) * 18;
    // The swatch used to start at y=8. Drop the plot by the same amount the legend moved.
    if (!model.title && !model.subtitle) top += CHROME_TOP - 8;
  }
  const outward = (offset: number | undefined) => (typeof offset === "number" && offset > 0 ? offset : 0);
  if (model.showX) {
    if (!horizontal && xEnd) top += outward(model.xAxis.offset);
    else if (!horizontal) bottom += outward(model.xAxis.offset);
    else if (xEnd) right += outward(model.xAxis.offset);
    else left += outward(model.xAxis.offset);
  }
  if (model.showY) {
    if (!horizontal && yEnd) right += outward(model.yAxis.offset);
    else if (!horizontal) left += outward(model.yAxis.offset);
    else if (yEnd) top += outward(model.yAxis.offset);
    else bottom += outward(model.yAxis.offset);
  }
  if (model.showY2) {
    if (y2End) right += outward(model.y2Axis.offset);
    else left += outward(model.y2Axis.offset);
  }
  if (model.colorScale && model.legendOn) bottom += 46;
  const inset = model.inset;
  return {
    top: typeof inset.t === "number" ? Math.max(top, inset.t) : top,
    right: typeof inset.r === "number" ? Math.max(right, inset.r) : right,
    bottom: typeof inset.b === "number" ? Math.max(bottom, inset.b) : bottom,
    left: typeof inset.l === "number" ? Math.max(left, inset.l) : left,
  };
}

/** True when a bar crosses or sits left of zero, so the category gutter stays clear of the tip. */
function diverges(model: PlotModel): boolean {
  for (const series of model.series) {
    if (series.mark !== "bar") continue;
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value === "number" && value < 0) return true;
    }
  }
  return false;
}

/** Widest outside bar label, so the right margin can hold “+7.2%”. */
function valueLabelWidth(model: PlotModel): number {
  let width = 0;
  for (const series of model.series) {
    if (series.mark !== "bar") continue;
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number") continue;
      const size = ch(labelText(model, series, value).length, 6.8);
      if (size > width) width = size;
    }
  }
  return width;
}
