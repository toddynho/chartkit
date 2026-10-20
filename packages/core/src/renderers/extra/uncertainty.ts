import { annotationLayers } from "../../annotations";
import type { DataTable } from "../../data";
import { fieldOf } from "../../frame";
import { cssVar, paint } from "../../theme";
import { esc, font, isRecord, n } from "../../svg";
import { bandPath } from "../../range-band";
import { axisLine, clip, domainTicks, fmt, gapOf, hGrid, num, openMark, plotBox, scaleOf, str, text, valueFormat, viewOf, xLabels, yLabels } from "./plot";

interface Band {
  name: string;
  color: string;
  lo: (number | null)[];
  hi: (number | null)[];
}

interface Line {
  name: string;
  color: string;
  values: (number | null)[];
}

function titleOf(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.title === "string") return value.title;
  return fallback;
}

function colorOf(value: unknown, preset: Parameters<typeof paint>[1], index: number): string {
  const color = isRecord(value) && typeof value.color === "string" ? value.color : undefined;
  return paint(color, preset, index);
}

function columnNums(table: DataTable, field: string | undefined): (number | null)[] {
  if (!field) return [];
  return num(table, field);
}

/** Bands from y.lo/y.hi, or one band from encoding.low and encoding.high. A y field is the centre line. */
function readBands(encoding: Record<string, unknown>, table: DataTable, preset: Parameters<typeof paint>[1]): { bands: Band[]; line: Line | null } {
  const y = encoding.y;
  const bands: Band[] = [];
  const lines: Line[] = [];
  const take = (item: unknown, index: number) => {
    if (isRecord(item) && typeof item.lo === "string" && typeof item.hi === "string") {
      bands.push({
        name: titleOf(item, item.lo),
        color: colorOf(item, preset, bands.length + lines.length),
        lo: columnNums(table, item.lo),
        hi: columnNums(table, item.hi),
      });
      return;
    }
    const field = fieldOf(item);
    if (!field) return;
    lines.push({
      name: titleOf(item, field),
      color: colorOf(item, preset, bands.length + lines.length),
      values: columnNums(table, field),
    });
    void index;
  };
  if (Array.isArray(y)) y.forEach(take);
  else if (y !== undefined) take(y, 0);
  const low = fieldOf(encoding.low);
  const high = fieldOf(encoding.high);
  if (low && high && bands.length === 0) {
    bands.push({
      name: "Band",
      color: paint(undefined, preset, 0),
      lo: columnNums(table, low),
      hi: columnNums(table, high),
    });
    if (lines[0]) lines[0].color = paint(undefined, preset, 1);
  }
  return { bands, line: lines[0] ?? null };
}

function extent(values: ArrayLike<number | null>[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const column of values) {
    for (let i = 0; i < column.length; i++) {
      const value = column[i];
      if (value === null || !Number.isFinite(value)) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}

function labelsOf(table: DataTable, field: string | undefined): string[] {
  const column = field ? table.columns[field] : undefined;
  return Array.from({ length: table.length }, (_, index) => (column ? str(column[index]) : String(index + 1)));
}

function legendRow(items: { name: string; color: string }[], x: number, y: number, fill: string): string {
  if (items.length < 2) return "";
  let cx = x;
  const out: string[] = [];
  for (const item of items) {
    out.push(`<rect x="${n(cx)}" y="${n(y)}" width="10" height="10" rx="2" fill="${item.color}" /><text x="${n(cx + 14)}" y="${n(y + 9)}" fill="${fill}" font-size="12" font-family="${font()}">${esc(item.name)}</text>`);
    cx += 22 + item.name.length * 6.6;
  }
  return out.join("");
}

function linePath(values: (number | null)[], xAt: (index: number) => number, yAt: (value: number) => number): string {
  let d = "";
  let open = false;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || !Number.isFinite(value)) {
      open = false;
      continue;
    }
    d += `${open ? "L" : "M"} ${n(xAt(i))} ${n(yAt(value))} `;
    open = true;
  }
  return d.trim();
}

export function renderAreaRange(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "area-range", 640, 320);
  if (!view) return null;
  const { frame, parts, table } = view;
  const { bands, line } = readBands(frame.encoding, table, frame.preset);
  if (!bands.length) return null;
  const showLine = frame.mark.line !== false && line !== null;
  const labels = labelsOf(table, fieldOf(frame.encoding.x));
  const columns: ArrayLike<number | null>[] = [];
  for (const band of bands) {
    columns.push(band.lo, band.hi);
  }
  if (showLine && line) columns.push(line.values);
  const [y0, y1] = extent(columns);
  const yTicks = domainTicks(y0, y1);
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const legend = bands.map((band) => ({ name: band.name, color: band.color }));
  if (showLine && line) legend.push({ name: line.name, color: line.color });
  if (legend.length > 1) box.top = Math.max(box.top, frame.title ? 58 : 36);
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, labels.length);
  const xAt = (index: number) => box.left + slot * index + slot / 2;
  const notes = annotationLayers(spec.annotations, {
    plot: box,
    preset: frame.preset,
    xAt: (value) => {
      if (typeof value === "number" && value >= 0 && value < labels.length) return xAt(value);
      const index = labels.indexOf(String(value));
      return index >= 0 ? xAt(index) : null;
    },
    yAt: (value) => {
      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numeric) ? yAt(numeric) : null;
    },
  });
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, labels.map((label, index) => ({ x: xAt(index), text: label }))));
  parts.push(axisLine(frame, box));
  if (legend.length > 1) parts.push(legendRow(legend, box.left, frame.title ? 40 : 14, cssVar("text", frame.preset.text)));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  parts.push(notes.under);
  bands.forEach((band, index) => {
    const d = bandPath(band.lo, band.hi, xAt, yAt);
    if (!d) return;
    const opacity = n(0.16 + (index % 4) * 0.06);
    parts.push(`<path d="${d}" fill="${band.color}" fill-opacity="${opacity}" stroke="${band.color}" stroke-width="1.25" stroke-linejoin="round" data-ck-mark="band" data-ck-series="${esc(band.name)}" aria-label="${esc(band.name)}"><title>${esc(band.name)}</title></path>`);
  });
  if (showLine && line) {
    const d = linePath(line.values, xAt, yAt);
    if (d) parts.push(`<path d="${d}" fill="none" stroke="${line.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" data-ck-mark="line" data-ck-series="${esc(line.name)}" />`);
  }
  parts.push(`</g>`);
  parts.push(notes.over);
  return view.done();
}

export function renderBarRange(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "bar-range", 640, 320);
  if (!view) return null;
  const { frame, parts, table } = view;
  const low = fieldOf(frame.encoding.low);
  const high = fieldOf(frame.encoding.high);
  const y = frame.encoding.y;
  const loField = low || (isRecord(y) && typeof y.lo === "string" ? y.lo : undefined);
  const hiField = high || (isRecord(y) && typeof y.hi === "string" ? y.hi : undefined);
  if (!loField || !hiField) return null;
  const lo = num(table, loField);
  const hi = num(table, hiField);
  const labels = labelsOf(table, fieldOf(frame.encoding.x));
  const [y0, y1] = extent([lo, hi]);
  const yTicks = domainTicks(y0, y1);
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, labels.length);
  const barW = Math.max(8, slot * (1 - gapOf(frame, 0.28)));
  const color = paint(undefined, frame.preset, 0);
  const format = valueFormat(frame, spec, frame.encoding.high ?? frame.encoding.y);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, labels.map((label, index) => ({ x: box.left + slot * index + slot / 2, text: label }))));
  parts.push(axisLine(frame, box));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  for (let i = 0; i < labels.length; i++) {
    const a = lo[i];
    const b = hi[i];
    if (a === null || b === null) continue;
    const top = yAt(Math.max(a, b));
    const bottom = yAt(Math.min(a, b));
    const x = box.left + slot * i + (slot - barW) / 2;
    const label = `${labels[i]}: ${fmt(Math.min(a, b), frame.locale, format)}–${fmt(Math.max(a, b), frame.locale, format)}`;
    parts.push(openMark("rect", "range", label, `x="${n(x)}" y="${n(top)}" width="${n(barW)}" height="${n(Math.max(2, bottom - top))}" rx="3" fill="${color}"`, labels[i], i));
    parts.push(`</rect>`);
  }
  parts.push(`</g>`);
  return view.done();
}

function whisker(x: number, yLo: number, yHi: number, color: string, label: string): string {
  const cap = 5;
  const top = Math.min(yLo, yHi);
  const bottom = Math.max(yLo, yHi);
  return `<g data-ck-mark="whisker" aria-label="${esc(label)}"><title>${esc(label)}</title><line x1="${n(x)}" y1="${n(top)}" x2="${n(x)}" y2="${n(bottom)}" stroke="${color}" stroke-width="1.5" /><line x1="${n(x - cap)}" y1="${n(top)}" x2="${n(x + cap)}" y2="${n(top)}" stroke="${color}" stroke-width="1.5" /><line x1="${n(x - cap)}" y1="${n(bottom)}" x2="${n(x + cap)}" y2="${n(bottom)}" stroke="${color}" stroke-width="1.5" /></g>`;
}

export function renderErrorbar(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "errorbar", 640, 320);
  if (!view) return null;
  const { frame, parts, table } = view;
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const y = num(table, yField);
  const low = fieldOf(frame.encoding.low);
  const high = fieldOf(frame.encoding.high);
  const yObj = frame.encoding.y;
  const errField = fieldOf(frame.encoding.error) || (isRecord(yObj) && typeof yObj.error === "string" ? yObj.error : undefined);
  let lo: (number | null)[];
  let hi: (number | null)[];
  if (low && high) {
    lo = num(table, low);
    hi = num(table, high);
  } else if (errField) {
    const delta = num(table, errField);
    lo = y.map((value, index) => (value === null || delta[index] == null ? null : value - (delta[index] as number)));
    hi = y.map((value, index) => (value === null || delta[index] == null ? null : value + (delta[index] as number)));
  } else return null;
  const asBar = frame.mark.error === "bar";
  const labels = labelsOf(table, fieldOf(frame.encoding.x));
  const columns: ArrayLike<number | null>[] = [y, lo, hi];
  if (asBar) columns.push(y.map(() => 0));
  const [y0, y1] = extent(columns);
  const yTicks = domainTicks(y0, y1);
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, labels.length);
  const barW = Math.max(8, slot * (1 - gapOf(frame, 0.34)));
  const color = paint(undefined, frame.preset, 0);
  const format = valueFormat(frame, spec, frame.encoding.y);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, labels.map((label, index) => ({ x: box.left + slot * index + slot / 2, text: label }))));
  parts.push(axisLine(frame, box));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  for (let i = 0; i < labels.length; i++) {
    const value = y[i];
    if (value === null) continue;
    const x = box.left + slot * i + slot / 2;
    const span = lo[i] !== null && hi[i] !== null ? `${fmt(Math.min(lo[i] as number, hi[i] as number), frame.locale, format)}–${fmt(Math.max(lo[i] as number, hi[i] as number), frame.locale, format)}` : fmt(value, frame.locale, format);
    const label = `${labels[i]}: ${span}`;
    if (asBar) {
      const top = Math.min(yAt(value), yAt(0));
      const height = Math.max(2, Math.abs(yAt(value) - yAt(0)));
      parts.push(openMark("rect", "bar", label, `x="${n(x - barW / 2)}" y="${n(top)}" width="${n(barW)}" height="${n(height)}" rx="3" fill="${color}"`, labels[i], i));
      parts.push(`</rect>`);
    } else {
      parts.push(`<circle data-ck-mark="point" cx="${n(x)}" cy="${n(yAt(value))}" r="4" fill="${color}" aria-label="${esc(label)}"><title>${esc(label)}</title></circle>`);
    }
    if (lo[i] !== null && hi[i] !== null) parts.push(whisker(x, yAt(lo[i] as number), yAt(hi[i] as number), color, label));
  }
  parts.push(`</g>`);
  return view.done();
}
