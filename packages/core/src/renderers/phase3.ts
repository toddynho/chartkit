import type { DataTable } from "../data";
import { readColor, readFrame, readTable, asNumber, column, fieldOf, type Frame } from "../frame";
import { cssVar, paint } from "../theme";
import { closeChart, n, openChart, polar } from "../svg";

/** Histogram, box plot, radar, funnel, treemap, and sankey. */

function viewOf(spec: Record<string, unknown>, renderer: string, width: number, height: number) {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width, height });
  const parts = [openChart({ ...frame, renderer }), `<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`];
  return { frame, parts, table, done: () => (parts.push(closeChart()), parts.join("")) };
}

function fill(frame: Frame, index: number): string {
  return paint(undefined, frame.preset, index);
}

function str(value: unknown): string {
  return value == null ? "" : String(value);
}

function nums(table: DataTable, field: string | undefined): (number | null)[] {
  return column(table, field).map(asNumber);
}

export function renderHistogram(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "histogram", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const yField = fieldOf(frame.encoding.y);
  const xs = column(table, fieldOf(frame.encoding.x));
  let bins: number[];
  if (yField) bins = nums(table, yField).filter((value): value is number => value !== null);
  else {
    const values = xs.map(asNumber).filter((value): value is number => value !== null);
    if (!values.length) return null;
    const count = Math.min(60, Math.max(1, Math.round(typeof frame.mark.bins === "number" ? frame.mark.bins : 8)));
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) min -= 0.5, max += 0.5;
    const width = (max - min) / count;
    bins = Array.from({ length: count }, () => 0);
    for (const value of values) bins[Math.min(count - 1, Math.max(0, ((value - min) / width) | 0))] += 1;
  }
  if (!bins.length) return null;
  const band = (frame.width - 70) / bins.length;
  const barW = Math.max(1, band * (1 - Math.min(0.7, frame.geometry.gap)));
  const peak = Math.max(...bins, 1);
  const base = frame.height - 36;
  bins.forEach((binCount, index) => {
    const height = (binCount / peak) * (base - 24);
    const x = 48 + index * band;
    if (height > 0) parts.push(`<rect data-ck-mark="bar" data-ck-count="${binCount}" x="${n(x)}" y="${n(base - height)}" width="${n(barW)}" height="${n(height)}" fill="${fill(frame, 0)}" />`);
  });
  return view.done();
}

function pct(sorted: number[], p: number): number {
  const index = (sorted.length - 1) * p;
  const lo = index | 0;
  const hi = Math.ceil(index);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (index - lo);
}

export function renderBoxplot(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "boxplot", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const groups = new Map<string, number[]>();
  const xs = column(table, xField);
  const ys = nums(table, yField);
  for (let i = 0; i < table.length; i++) {
    const value = ys[i];
    if (value === null) continue;
    const key = xField ? str(xs[i]) : "All";
    const list = groups.get(key);
    if (list) list.push(value);
    else groups.set(key, [value]);
  }
  const rows = [...groups];
  if (!rows.length) return null;
  const flat = rows.flatMap(([, values]) => values);
  let min = Math.min(...flat);
  let max = Math.max(...flat);
  if (min === max) max = min + 1;
  const base = frame.height - 32;
  const yAt = (value: number) => base - ((value - min) / (max - min)) * (base - 24);
  const band = (frame.width - 70) / rows.length;
  const boxW = Math.max(8, band * (1 - Math.min(0.6, frame.geometry.gap)));
  rows.forEach(([name, values], index) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = pct(sorted, 0.25);
    const q3 = pct(sorted, 0.75);
    const low = q1 - 1.5 * (q3 - q1);
    const high = q3 + 1.5 * (q3 - q1);
    const cx = 48 + index * band + band / 2;
    const color = fill(frame, index);
    const top = Math.min(yAt(q1), yAt(q3));
    parts.push(`<rect data-ck-mark="box" x="${n(cx - boxW / 2)}" y="${n(top)}" width="${n(boxW)}" height="${n(Math.max(1, Math.abs(yAt(q1) - yAt(q3))))}" fill="${color}" />`);
    for (const value of sorted) if (value < low || value > high) parts.push(`<circle data-ck-mark="outlier" cx="${n(cx)}" cy="${n(yAt(value))}" r="3" fill="${color}" />`);
  });
  return view.done();
}

export function renderRadar(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "radar", 480, 420);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yFields = (Array.isArray(frame.encoding.y) ? frame.encoding.y : [frame.encoding.y]).flatMap((item) => fieldOf(item) ?? []);
  if (!xField || !yFields.length) return null;
  const xs = column(table, xField);
  const axes = [...new Set(xs.map(str))];
  if (axes.length < 3) return null;
  const series = yFields.map((field) => {
    const measure = column(table, field);
    const values = axes.map(() => 0);
    for (let i = 0; i < table.length; i++) {
      const axis = axes.indexOf(str(xs[i]));
      if (axis >= 0) values[axis] = asNumber(measure[i]) ?? values[axis];
    }
    return values;
  });
  const max = Math.max(1, ...series.flat());
  const cx = frame.width / 2;
  const cy = frame.height / 2;
  const radius = Math.min(frame.width, frame.height) * 0.32;
  const pt = (index: number, value: number) => polar(cx, cy, (radius * Math.max(0, value)) / max, (360 / axes.length) * index);
  series.forEach((values, index) => {
    const color = fill(frame, index);
    parts.push(`<polygon data-ck-mark="polygon" points="${values.map((value, axis) => pt(axis, value)).map((point) => `${n(point.x)},${n(point.y)}`).join(" ")}" fill="${color}" fill-opacity="${n(frame.geometry.fillOpacity)}" />`);
  });
  return view.done();
}

export function renderFunnel(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "funnel", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const xs = column(table, xField);
  const ys = nums(table, yField);
  const stages = ys.flatMap((value, index) => (value === null ? [] : [[xField ? str(xs[index]) : String(index + 1), Math.max(0, value)] as [string, number]]));
  if (!stages.length) return null;
  const max = Math.max(...stages.map((stage) => stage[1]), 1);
  const band = (frame.height - 36) / stages.length;
  const gutter = Math.max(4, Math.round(18 * frame.geometry.gap));
  const plotW = frame.width - 120;
  stages.forEach(([label, value], index) => {
    const next = stages[index + 1]?.[1] ?? value;
    const y0 = 20 + index * band + gutter / 2;
    const y1 = 20 + (index + 1) * band - gutter / 2;
    const w0 = Math.max(8, (value / max) * plotW);
    const w1 = Math.max(8, (next / max) * plotW);
    const cx = 96 + plotW / 2;
    parts.push(`<path data-ck-mark="stage" d="M${n(cx - w0 / 2)} ${n(y0)}L${n(cx + w0 / 2)} ${n(y0)}L${n(cx + w1 / 2)} ${n(y1)}L${n(cx - w1 / 2)} ${n(y1)}Z" fill="${fill(frame, index)}" />`);
  });
  return view.done();
}

export function renderTreemap(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "treemap", 640, 400);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const color = readColor(frame.encoding.color);
  const xs = column(table, xField);
  const groups = column(table, color?.field);
  const leaves: { label: string; value: number; fill: string; group: string }[] = [];
  const colors = new Map<string, string>();
  nums(table, yField).forEach((value, index) => {
    if (value === null || value <= 0) return;
    const group = color?.field ? str(groups[index]) || "Group" : String(index);
    if (!colors.has(group)) colors.set(group, fill(frame, colors.size));
    leaves.push({ label: xField ? str(xs[index]) : group, value, fill: colors.get(group) ?? "", group });
  });
  if (!leaves.length) return null;
  const total = leaves.reduce((sum, leaf) => sum + leaf.value, 0);
  let x = 8;
  for (const leaf of leaves) {
    const w = (leaf.value / total) * (frame.width - 16);
    parts.push(`<rect data-ck-mark="tile" x="${n(x)}" y="12" width="${n(w)}" height="${n(frame.height - 24)}" fill="${leaf.fill}" />`);
    x += w;
  }
  return view.done();
}

export function renderSankey(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "sankey", 720, 400);
  if (!view) return null;
  const { frame, parts, table } = view;
  const fields = [fieldOf(frame.encoding.source) ?? fieldOf(frame.encoding.x), fieldOf(frame.encoding.target) ?? fieldOf(frame.encoding.color), fieldOf(frame.encoding.y)];
  if (fields.some((field) => !field)) return null;
  const cols = fields.map((field) => column(table, field));
  const ids: string[] = [];
  const links: [number, number, number][] = [];
  const idOf = (name: string) => (ids.indexOf(name) + 1 || ids.push(name)) - 1;
  for (let i = 0; i < table.length; i++) {
    const value = asNumber(cols[2][i]);
    const source = str(cols[0][i]);
    const target = str(cols[1][i]);
    if (value && value > 0 && source && target && source !== target) links.push([idOf(source), idOf(target), value]);
  }
  if (!links.length) return null;
  const layer = ids.map(() => 0);
  for (let pass = 0; pass < ids.length; pass++) for (const [source, target] of links) if (layer[target] <= layer[source]) layer[target] = Math.min(ids.length - 1, layer[source] + 1);
  const depth = Math.max(1, ...layer);
  const maxValue = Math.max(...links.map((link) => link[2]), 1);
  const xOf = (index: number) => 16 + (layer[index] / depth) * (frame.width - 140);
  const yOf = (index: number) => 24 + ids.filter((_, other) => other < index && layer[other] === layer[index]).length * 56;
  for (const [source, target, value] of links) {
    const h = 8 + (value / maxValue) * 28;
    const x0 = xOf(source) + 16;
    const x1 = xOf(target);
    const y0 = yOf(source);
    const y1 = yOf(target);
    parts.push(`<path data-ck-mark="link" d="M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}L${n(x1)} ${n(y1 + h)}L${n(x0)} ${n(y0 + h)}Z" fill="${fill(frame, source)}" fill-opacity="0.45" />`);
  }
  ids.forEach((_, index) => parts.push(`<rect data-ck-mark="node" x="${n(xOf(index))}" y="${n(yOf(index))}" width="16" height="36" fill="${fill(frame, index)}" />`));
  return view.done();
}
