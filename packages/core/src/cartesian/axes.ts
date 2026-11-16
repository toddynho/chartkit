import { layoutPaint } from "../layout-hook";
import { ch, esc, font, n } from "../svg";
import { cssVar } from "../theme";
import type { AxisBox, PlotBox, PlotModel, XScale } from "./types";
import { catKey, numKey } from "./data";
import { formatTimeLabel, resolveTicks, TICK_PX, tickLabel, tickText, timeTicks, xAngle, xStep } from "./ticks";
import { crossAt } from "./scales";
import { zigPoints } from "./paths";
import { bottomLegendFoot, colorLegendFoot } from "./chrome";

/** Set for one draw when the layout chunk is mounted and the chart is rtl. */
let textDir = "";
/** Tick and axis-title size. 11 unless theme.tokens.fontSize is set. */
let labelPx = 11;

/** Written once per draw by `modelToSvg`, which lives in another module. */
export function setLabelPx(px: number): void {
  labelPx = px;
}

export function setTextDir(dir: string): void {
  textDir = dir;
}

function axText(x: number, y: number, anchor: string, body: string, fill: string, family: string, angle = 0, weight = "", rows?: string[] | null, key = ""): string {
  const spin = angle ? ` transform="rotate(${n(angle)} ${n(x)} ${n(y)})"` : "";
  const id = key ? ` data-ck-key="${esc(key)}"` : "";
  const text = rows ? rows.map((row, i) => `<tspan x="${n(x)}" dy="${i ? 12 : 0}">${esc(row)}</tspan>`).join("") : esc(body);
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${labelPx}"${weight}${textDir}${spin}${id}>${text}</text>`;
}

function wrapWords(text: string, width: number, lines: number): string[] {
  const max = Math.max(1, Math.floor(width / TICK_PX));
  const cap = Math.max(1, lines);
  if (text.length <= max) return [text];
  if (cap === 1) return [text.slice(0, Math.max(1, max - 1)) + "…"];
  const words = text.split(" ");
  const out: string[] = [];
  let cur = "";
  const take = (value: string) => {
    if (out.length < cap) out.push(value);
  };
  for (let w = 0; w < words.length; w++) {
    let word = words[w] ?? "";
    if (word.length > max) {
      if (cur) {
        take(cur);
        cur = "";
      }
      while (word && out.length < cap) {
        if (out.length === cap - 1 && word.length > max) {
          take(word.slice(0, Math.max(1, max - 1)) + "…");
          word = "";
          break;
        }
        take(word.slice(0, max));
        word = word.slice(max);
      }
      if (word && out.length < cap) cur = word;
      continue;
    }
    const next = cur ? cur + " " + word : word;
    if (next.length <= max) cur = next;
    else {
      if (cur) take(cur);
      cur = out.length < cap ? word : "";
    }
  }
  if (cur) take(cur);
  return out.length ? out : [text];
}

/** Null keeps a single text node. An array, even of one line, is the wrap path. */
function linesOf(axis: AxisBox, label: string): string[] | null {
  if (axis.wrapW === undefined && axis.wrapN === undefined) return null;
  const width = axis.wrapW && axis.wrapW > 0 ? axis.wrapW : 72;
  return wrapWords(label, width, axis.wrapN ?? 3);
}

export function lineCount(axis: AxisBox, labels: string[]): number {
  let count = 1;
  for (let i = 0; i < labels.length; i++) {
    const rows = linesOf(axis, labels[i] ?? "");
    if (rows && rows.length > count) count = rows.length;
  }
  return count;
}

export function inkWidth(axis: AxisBox, labels: string[]): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) {
    const rows = linesOf(axis, labels[i] ?? "");
    const text = rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : labels[i] ?? "";
    const size = ch(text.length, TICK_PX);
    if (size > width) width = size;
  }
  return width;
}

export function outsideLen(axis: AxisBox): number {
  if (axis.tick === "inside" || axis.tick === "none") return 0;
  if (axis.tick === "outside" || typeof axis.tickLen === "number") return axis.tickLen || 4;
  return 0;
}

function tickInk(side: number, edge: number, at: number, axis: AxisBox, stroke: string): string {
  const mode = axis.tick === "inside" || axis.tick === "outside" ? axis.tick : typeof axis.tickLen === "number" ? "outside" : "";
  if (!mode) return "";
  const len = axis.tickLen ?? 4;
  if (!(len > 0)) return "";
  const dir = mode === "outside" ? 1 : -1;
  const x2 = side === 0 ? edge - dir * len : side === 1 ? edge + dir * len : at;
  const y2 = side === 2 ? edge - dir * len : side === 3 ? edge + dir * len : at;
  const x1 = side < 2 ? edge : at;
  const y1 = side < 2 ? at : edge;
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" />`;
}

function shifted(side: number, base: number, axis: AxisBox): number {
  const shift = axis.offset || 0;
  if (side === 0 || side === 2) return base - shift;
  return base + shift;
}

function outerEdge(side: number, plot: PlotBox, axis: AxisBox): number {
  const base = side === 0 ? plot.left : side === 1 ? plot.right : side === 2 ? plot.top : plot.bottom;
  return shifted(side, base, axis);
}

function spineEdge(side: number, plot: PlotBox, axis: AxisBox, crossAt?: number): number {
  if (typeof crossAt === "number" && Number.isFinite(crossAt)) return shifted(side, crossAt, axis);
  return outerEdge(side, plot, axis);
}

function wantSpine(axis: AxisBox): boolean {
  if (axis.rule && axis.rule.on === false && !axis.breaks?.length) return false;
  return Boolean(axis.rule?.on || axis.crosses !== undefined || axis.offset || axis.breaks?.length);
}

function zigzag(x1: number, y1: number, x2: number, y2: number, stroke: string): string {
  return `<path data-ck-break="1" d="M ${n(x1)} ${n(y1)} ${zigPoints(x1, y1, x2, y2, 4)}" fill="none" stroke="${stroke}" stroke-width="1.25" />`;
}

function spineSegment(vertical: boolean, edge: number, from: number, to: number, stroke: string, width: string, dash: string): string {
  if (!(to > from + 0.5)) return "";
  if (vertical) return `<line data-ck-axis="line" x1="${n(edge)}" y1="${n(from)}" x2="${n(edge)}" y2="${n(to)}" stroke="${stroke}"${width}${dash} />`;
  return `<line data-ck-axis="line" x1="${n(from)}" y1="${n(edge)}" x2="${n(to)}" y2="${n(edge)}" stroke="${stroke}"${width}${dash} />`;
}

function ruleLine(side: number, plot: PlotBox, model: PlotModel, axis: AxisBox, crossAt?: number, spans?: Array<[number, number]>, ticks?: number[]): string {
  if (!wantSpine(axis)) return "";
  const rule = axis.rule;
  const dash = rule?.dash === "dashed" ? ' stroke-dasharray="4 3"' : rule?.dash === "dotted" ? ' stroke-dasharray="1 3"' : "";
  const width = rule?.width ? ` stroke-width="${n(rule.width)}"` : "";
  const stroke = rule?.color || cssVar("axis", model.preset.axis);
  const edge = spineEdge(side, plot, axis, crossAt);
  const vertical = side < 2;
  let from = vertical ? plot.top : plot.left;
  let to = vertical ? plot.bottom : plot.right;
  if (vertical && ticks && ticks.length) {
    let top = Infinity;
    for (let i = 0; i < ticks.length; i++) if (ticks[i] < top) top = ticks[i];
    if (top > from && top < to) from = top;
  }
  const cuts = (spans ?? [])
    .map((span) => [Math.min(span[0], span[1]), Math.max(span[0], span[1])] as [number, number])
    .filter((span) => span[1] > span[0])
    .sort((a, b) => a[0] - b[0]);
  if (!cuts.length) return spineSegment(vertical, edge, from, to, stroke, width, dash);
  let out = "";
  let cursor = from;
  for (const [lo, hi] of cuts) {
    const start = Math.max(lo, from);
    const end = Math.min(hi, to);
    if (!(end > start)) continue;
    if (start > cursor) out += spineSegment(vertical, edge, cursor, start, stroke, width, dash);
    out += vertical ? zigzag(edge, start, edge, end, stroke) : zigzag(start, edge, end, edge, stroke);
    cursor = end;
  }
  if (cursor < to) out += spineSegment(vertical, edge, cursor, to, stroke, width, dash);
  return out;
}

/** 0 left, 1 right, 2 top, 3 bottom. */
function place(side: number, edge: number, at: number, titled: boolean, height: number): [number, number, string] {
  if (side === 0) return [edge - 6, at + 4, "end"];
  if (side === 1) return [edge + 6, at + 4, "start"];
  if (side === 2) return [at, edge - 18, "middle"];
  // Bottom labels follow the plot edge. height-8 sat on a bottom legend.
  return [at, edge + (titled ? 14 : 16), "middle"];
}

function ySide(model: PlotModel, horizontal: boolean): number {
  return horizontal ? (model.yAxis.end ? 2 : 3) : model.yAxis.end ? 1 : 0;
}

function xSide(model: PlotModel, horizontal: boolean): number {
  return horizontal ? (model.xAxis.end ? 1 : 0) : model.xAxis.end ? 2 : 3;
}

export function drawAxes(
  model: PlotModel,
  plot: PlotBox,
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
  const yCross = crossAt(model, "y", horizontal, xScale);
  const y2Cross = crossAt(model, "y2", horizontal, xScale);
  const xCross = crossAt(model, "x", horizontal, xScale, yScale);
  if (model.showY) {
    const side = ySide(model, horizontal);
    out += ruleLine(side, plot, model, model.yAxis, yCross, model.ySpans, yTicks.map(yScale));
    if (model.yAxis.labels !== false) out += band(yText, yTicks, yScale, model, plot, side, model.yAxis, "y:");
    out += minors(yTicks, yScale, side, spineEdge(side, plot, model.yAxis, yCross), model.yAxis, cssVar("axis", model.preset.axis));
  }
  if (model.showY2) {
    const side = model.y2Axis.end !== false ? 1 : 0;
    out += ruleLine(side, plot, model, model.y2Axis, y2Cross, model.y2Spans, y2Ticks.map(y2Scale));
    if (model.y2Axis.labels !== false) out += band(y2Text, y2Ticks, y2Scale, model, plot, side, model.y2Axis, "y2:");
    out += minors(y2Ticks, y2Scale, side, spineEdge(side, plot, model.y2Axis, y2Cross), model.y2Axis, cssVar("axis", model.preset.axis));
  }
  if (model.showX) {
    const side = xSide(model, horizontal);
    out += ruleLine(side, plot, model, model.xAxis, xCross, model.xSpans);
    if (model.xAxis.labels !== false) out += xBand(model, xScale, count, horizontal, plot);
    const xValues = model.x && !horizontal ? resolveTicks(model, "x", xScale.min, xScale.max, model.xAxis.count ?? 6, false) : null;
    if (xValues) out += minors(xValues, (value) => xScale.at(value), side, spineEdge(side, plot, model.xAxis, xCross), model.xAxis, cssVar("axis", model.preset.axis));
  }
  out += axisTitles(model, plot, horizontal);
  return out;
}

function minors(values: number[], at: (value: number) => number, side: number, edge: number, axis: AxisBox, stroke: string): string {
  const count = axis.minor || 0;
  if (count < 1 || values.length < 2) return "";
  let marks = "";
  for (let i = 0; i < values.length - 1; i++) {
    const from = values[i];
    const to = values[i + 1];
    if (typeof from !== "number" || typeof to !== "number" || from === to) continue;
    for (let k = 1; k <= count; k++) {
      const pos = at(from + ((to - from) * k) / (count + 1));
      if (!Number.isFinite(pos)) continue;
      const dir = 1;
      const len = 3;
      const x2 = side === 0 ? edge - dir * len : side === 1 ? edge + dir * len : pos;
      const y2 = side === 2 ? edge - dir * len : side === 3 ? edge + dir * len : pos;
      const x1 = side < 2 ? edge : pos;
      const y1 = side < 2 ? pos : edge;
      marks += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" />`;
    }
  }
  return marks ? `<g data-ck-minor="${count}">${marks}</g>` : "";
}

function band(
  labels: string[],
  values: number[],
  scale: (value: number) => number,
  model: PlotModel,
  plot: PlotBox,
  side: number,
  axis: AxisBox,
  idPrefix = "",
): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const edge = outerEdge(side, plot, axis);
  const angle = axis.rotate || 0;
  const skip = axis.skip !== false;
  let out = "";
  let last = side < 2 ? Infinity : -Infinity;
  for (let i = 0; i < values.length; i++) {
    const label = labels[i] ?? "";
    const at = place(side, edge, scale(values[i]), Boolean(axis.title), model.height);
    const rows = linesOf(axis, label);
    if (skip && !angle) {
      if (side < 2) {
        if (Math.abs(last - at[1]) < 13) continue;
        last = at[1];
      } else {
        const width = ch((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length || 1, 6.4);
        if (at[0] - width / 2 < last) continue;
        last = at[0] + width / 2 + 8;
      }
    }
    out += tickInk(side, edge, scale(values[i]), axis, ink);
    out += axText(at[0], at[1], at[2], label, fill, family, angle, "", rows, idPrefix ? idPrefix + numKey(values[i] ?? 0) : "");
  }
  return out;
}

function xBand(model: PlotModel, xScale: XScale, count: number, horizontal: boolean, plot: PlotBox): string {
  if (model.xTemporal && model.x && !horizontal) return timeBand(model, xScale, plot);
  if (model.x && !horizontal) return numBand(model, xScale, plot);
  const angle = xAngle(model);
  const step = xStep(model, count, angle);
  if (step === 0) return "";
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const side = xSide(model, horizontal);
  const edge = outerEdge(side, plot, model.xAxis);
  const y = (model.xAxis.end && !horizontal ? plot.top - 18 : plot.bottom + 16) + (model.xAxis.end && !horizontal ? -(model.xAxis.offset || 0) : model.xAxis.offset || 0);
  const keep = model.xAxis.skip === false;
  const seq = horizontal
    ? null
    : layoutPaint()?.order(
        count,
        step,
        (index) => xScale.center(index),
        (model.f & 32) !== 0,
        keep ? undefined : (index) => ch(tickLabel(model, index)?.length || 1, 6.4),
      );
  let out = "";
  let last = -Infinity;
  const total = seq ? seq.length : count;
  for (let k = 0; k < total; k += seq ? 1 : step) {
    const i = seq ? (seq[k] ?? 0) : k;
    const label = tickLabel(model, i);
    if (!label) continue;
    const rows = linesOf(model.xAxis, label);
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      const at = xScale.center(i);
      out += tickInk(side, edge, at, model.xAxis, ink);
      out += axText(right ? plot.right + 8 : plot.left - 6, at + 4, right ? "start" : "end", label, fill, family, 0, "", rows, `x:${catKey(model, i)}`);
      continue;
    }
    const x = xScale.center(i);
    const drawn = alongOne(label, x, y, angle, plot, 0, fill, family, seq || keep ? -Infinity : last, rows, model.width, `x:${catKey(model, i)}`);
    if (!drawn) continue;
    out += tickInk(side, edge, x, model.xAxis, ink);
    out += drawn;
    if (!angle && !keep) {
      const width = ch((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length, 6.4);
      if (x - width / 2 >= last) last = x + width / 2 + 8;
    }
  }
  return out;
}

function numBand(model: PlotModel, xScale: XScale, plot: PlotBox): string {
  const values = resolveTicks(model, "x", xScale.min, xScale.max, model.xAxis.count ?? 6, false);
  return along(model, values, tickText(values, model, model.xFormat), (value) => xScale.at(value), plot, 8);
}

function timeBand(model: PlotModel, xScale: XScale, plot: PlotBox): string {
  if (!model.x || !xScale.live || !(xScale.max > xScale.min) || model.xAxis.count === 0) return "";
  const min = xScale.min;
  const max = xScale.max;
  const width = Math.max(1, plot.right - plot.left);
  const explicit = model.xAxis.ends || model.xAxis.count !== undefined || Boolean(model.xAxis.values?.length);
  const at = (value: number) => xScale.at(value);
  if (explicit || model.zone === "UTC") {
    const values = explicit
      ? resolveTicks(model, "x", min, max, model.xAxis.count ?? 6, false)
      : timeTicks(min, max, Math.max(2, Math.floor(width / 72)));
    const labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
    return along(model, values, labels, at, plot, 4);
  }
  let count = Math.max(2, Math.floor(width / 84));
  let values = timeTicks(min, max, count, model.zone);
  let labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
  while (count > 2 && model.xAxis.skip !== false && timeLabelsCollide(values, labels, at, plot.left, plot.right)) {
    count -= 1;
    values = timeTicks(min, max, count, model.zone);
    labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
  }
  return along(model, values, labels, at, plot, 4);
}

function timeLabelsCollide(
  values: number[],
  labels: string[],
  at: (value: number) => number,
  left: number,
  right: number,
): boolean {
  let last = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const x = at(values[i]);
    if (x < left - 8 || x > right + 8) continue;
    const half = ch(labels[i]?.length || 1, 6.4) / 2;
    if (x - half < last) return true;
    last = x + half + 8;
  }
  return false;
}

function along(
  model: PlotModel,
  values: number[],
  labels: string[],
  at: (value: number) => number,
  plot: PlotBox,
  slack: number,
): string {
  const angle = xAngle(model);
  const y = (model.xAxis.end ? plot.top - 18 : plot.bottom + 16) + (model.xAxis.end ? -(model.xAxis.offset || 0) : model.xAxis.offset || 0);
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const side = model.xAxis.end ? 2 : 3;
  const edge = outerEdge(side, plot, model.xAxis);
  const keep = model.xAxis.skip === false;
  // The domain end stays. An earlier label that would cover it is the one that drops.
  let endAt = -1;
  if (!angle && !keep) {
    for (let i = values.length - 1; i >= 0; i--) {
      const label = labels[i];
      if (!label) continue;
      const x = at(values[i]);
      if (x < plot.left - slack || x > plot.right + slack) continue;
      endAt = i;
      break;
    }
  }
  const endLabel = endAt >= 0 ? labels[endAt] : "";
  const reserved = endAt >= 0 ? at(values[endAt]) - ch(endLabel.length || 1, 6.4) / 2 : Infinity;
  let out = "";
  let last = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const label = labels[i];
    if (!label) continue;
    const x = at(values[i]);
    const rows = linesOf(model.xAxis, label);
    if (!angle && !keep && i !== endAt) {
      const text = rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label;
      if (x + ch(text.length || 1, 6.4) / 2 + 8 > reserved) continue;
    }
    const drawn = alongOne(label, x, y, angle, plot, slack, fill, family, keep ? -Infinity : last, rows, model.width);
    if (!drawn) continue;
    out += tickInk(side, edge, x, model.xAxis, ink);
    out += drawn;
    if (!angle && !keep && x >= plot.left - slack && x <= plot.right + slack) {
      const width = ch((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length, 6.4);
      if (x - width / 2 >= last) last = x + width / 2 + 8;
    }
  }
  return out;
}

function alongOne(
  label: string,
  x: number,
  y: number,
  angle: number,
  plot: PlotBox,
  slack: number,
  fill: string,
  family: string,
  last: number,
  rows?: string[] | null,
  viewWidth = 0,
  key = "",
): string {
  if (slack && (x < plot.left - slack || x > plot.right + slack)) return "";
  const text = rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label;
  const glyphs = text.length || 1;
  const width = ch(glyphs, 6.4);
  if (!angle && x - width / 2 < last) return "";
  let anchor = angle < 0 ? "end" : angle > 0 ? "start" : "middle";
  let at = x;
  // 11px tabular digits run wider than the collision estimate. Measure the edge with
  // that wider box so "100,000" is end-anchored before the view box clips it.
  const edgeWidth = ch(glyphs, 8);
  if (!angle && viewWidth > 0) {
    if (x + edgeWidth / 2 > viewWidth - 4) {
      at = viewWidth - 4;
      anchor = "end";
    } else if (x - edgeWidth / 2 < 4) {
      at = 4;
      anchor = "start";
    }
  }
  return axText(at, y, anchor, label, fill, family, angle, "", rows, key);
}

export function flatTitle(angle: number | undefined): boolean {
  if (typeof angle !== "number") return false;
  const turned = ((angle % 360) + 360) % 360;
  return turned === 0 || turned === 180;
}

function titleSpin(axis: AxisBox, vertical: boolean, end: boolean): number {
  if (typeof axis.titleSpin === "number") return axis.titleSpin;
  if (!vertical) return 0;
  return end ? 90 : -90;
}

function titleAlong(at: string | undefined, mid: number, start: number, end: number): number {
  if (at === "start") return start;
  if (at === "end") return end;
  return mid;
}

function axisTitles(model: PlotModel, plot: PlotBox, horizontal: boolean): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const midY = (plot.top + plot.bottom) / 2;
  const midX = (plot.left + plot.right) / 2;
  const weight = ' font-weight="500"';
  const lo = Math.min(plot.top + 28, midY);
  const hi = Math.max(plot.bottom - 28, midY);
  let out = "";
  if (model.showY && model.yAxis.title) {
    const title = model.yAxis.title;
    const side = ySide(model, horizontal);
    const vertical = side < 2;
    const angle = titleSpin(model.yAxis, vertical, side === 1);
    if (vertical && flatTitle(angle)) {
      const wide = Math.ceil(ch(title.length, 6.6));
      out += axText(side === 0 ? 8 : model.width - 8 - wide, titleAlong(model.yAxis.titleAt, midY, hi, lo), "start", title, fill, family, 0, weight);
    } else if (vertical) out += axText(side === 0 ? 14 : model.width - 14, titleAlong(model.yAxis.titleAt, midY, hi, lo), "middle", title, fill, family, angle, weight);
    else {
      const anchor = model.yAxis.titleAt === "start" ? "start" : model.yAxis.titleAt === "end" ? "end" : "middle";
      const x = titleAlong(model.yAxis.titleAt, midX, plot.left, plot.right);
      out += axText(x, side === 2 ? Math.max(12, plot.top - 18) : model.height - 6 - colorLegendFoot(model) - bottomLegendFoot(model, plot), anchor, title, fill, family, angle, weight);
    }
  }
  if (model.showY2 && model.y2Axis.title) {
    const right = model.y2Axis.end !== false;
    const angle = titleSpin(model.y2Axis, true, right);
    out += axText(right ? model.width - 14 : 14, titleAlong(model.y2Axis.titleAt, midY, hi, lo), "middle", model.y2Axis.title, fill, family, angle, weight);
  }
  if (model.showX && model.xAxis.title) {
    const title = model.xAxis.title;
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      const angle = titleSpin(model.xAxis, true, right);
      out += axText(right ? model.width - 14 : 14, titleAlong(model.xAxis.titleAt, midY, hi, lo), "middle", title, fill, family, angle, weight);
    } else {
      const anchor = model.xAxis.titleAt === "start" ? "start" : model.xAxis.titleAt === "end" ? "end" : "middle";
      const x = titleAlong(model.xAxis.titleAt, midX, plot.left, plot.right);
      const angle = titleSpin(model.xAxis, false, false);
      out += axText(x, model.xAxis.end ? plot.top - 40 : model.height - 6 - colorLegendFoot(model) - bottomLegendFoot(model, plot), anchor, title, fill, family, angle, weight);
    }
  }
  return out;
}
