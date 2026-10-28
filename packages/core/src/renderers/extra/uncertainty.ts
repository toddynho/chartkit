import { seriesPoints } from "../../annotations";
import { CHROME_TOP, axisTitleMarks, categoryX, chooseTicks, lockDomain, placedNotes } from "../../chrome";
import type { DataTable } from "../../data";
import { fieldOf } from "../../frame";
import { cssVar, paint } from "../../theme";
import { esc, font, isRecord, n } from "../../svg";
import { dataSampling, readSamplingMode, samplingThreshold } from "../../sampling";
import { bandPath, denseBand, denseLine, intervalLabel, nestedOpacity } from "../../range-band";
import { axisLine, clip, domainTicks, fmt, gapOf, hGrid, num, openMark, plotBox, scaleOf, str, text, valueFormat, viewOf, xLabels, yLabels } from "./plot";

interface Band {
  name: string;
  color: string;
  explicit: boolean;
  lo: ArrayLike<number | null>;
  hi: ArrayLike<number | null>;
  opacity: number;
}

interface Line {
  name: string;
  color: string;
  values: ArrayLike<number | null>;
}

function titleOf(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.title === "string") return value.title;
  return fallback;
}

/** A band is the range, not the lower field. An explicit title stays as written. */
function rangeName(item: unknown, lo: string, hi: string): string {
  if (isRecord(item) && typeof item.title === "string" && item.title) return item.title;
  if (lo && hi) return `${lo}–${hi}`;
  return lo || hi || "range";
}

function colorOf(value: unknown, preset: Parameters<typeof paint>[1], index: number): string {
  const color = isRecord(value) && typeof value.color === "string" ? value.color : undefined;
  return paint(color, preset, index);
}

function columnNums(table: DataTable, field: string | undefined): ArrayLike<number | null> {
  if (!field) return [];
  const values = table.columns[field];
  if (!values) return [];
  if (ArrayBuffer.isView(values) && !(values instanceof DataView)) return values as ArrayLike<number>;
  return num(table, field);
}

function bandWidth(band: Band): number {
  let sum = 0;
  let count = 0;
  const length = Math.min(band.lo.length, band.hi.length);
  for (let i = 0; i < length; i++) {
    const lo = band.lo[i];
    const hi = band.hi[i];
    if (lo === null || hi === null || !Number.isFinite(lo) || !Number.isFinite(hi)) continue;
    sum += Math.abs(hi - lo);
    count += 1;
  }
  return count ? sum / count : 0;
}

/** Widest first, so the lighter outer band is painted under the inner one. */
function byWidth(bands: Band[]): Band[] {
  return [...bands].sort((a, b) => bandWidth(b) - bandWidth(a));
}

function shade(bands: Band[]): void {
  const ranked = byWidth(bands);
  ranked.forEach((band, rank) => {
    band.opacity = nestedOpacity(rank, ranked.length);
  });
}

/** Bands from y.lo/y.hi, or one band from encoding.low and encoding.high. A y field is the centre line. */
function readBands(encoding: Record<string, unknown>, table: DataTable, preset: Parameters<typeof paint>[1]): { bands: Band[]; line: Line | null } {
  const y = encoding.y;
  const bands: Band[] = [];
  const lines: Line[] = [];
  let palette = 0;
  const take = (item: unknown) => {
    if (isRecord(item) && typeof item.lo === "string" && typeof item.hi === "string") {
      const explicit = typeof item.color === "string";
      bands.push({
        name: rangeName(item, item.lo, item.hi),
        color: colorOf(item, preset, palette),
        explicit,
        lo: columnNums(table, item.lo),
        hi: columnNums(table, item.hi),
        opacity: 0.22,
      });
      if (explicit) palette += 1;
      return;
    }
    const field = fieldOf(item);
    if (!field) return;
    lines.push({
      name: titleOf(item, field),
      color: colorOf(item, preset, palette),
      values: columnNums(table, field),
    });
    palette += 1;
  };
  if (Array.isArray(y)) y.forEach(take);
  else if (y !== undefined) take(y);
  const line = lines[0] ?? null;
  const low = fieldOf(encoding.low);
  const high = fieldOf(encoding.high);
  if (low && high && bands.length === 0) {
    bands.push({
      name: low && high ? `${low}–${high}` : "range",
      color: line ? line.color : paint(undefined, preset, palette),
      explicit: false,
      lo: columnNums(table, low),
      hi: columnNums(table, high),
      opacity: 0.22,
    });
  }
  if (line) {
    for (const band of bands) {
      if (band.explicit) continue;
      band.color = line.color;
      band.name = intervalLabel(band.name);
    }
  }
  shade(bands);
  return { bands, line };
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

/** Six ticks, the same indexes `xLabels` would keep from a full category list. */
function xTickLabels(
  table: DataTable,
  field: string | undefined,
  count: number,
  xAt: (index: number) => number,
): { x: number; text: string }[] {
  if (count < 1) return [];
  const step = count > 8 ? Math.ceil(count / 6) : 1;
  const column = field ? table.columns[field] : undefined;
  const out: { x: number; text: string }[] = [];
  for (let i = 0; i < count; i += step) out.push({ x: xAt(i), text: column ? str(column[i]) : String(i + 1) });
  return out;
}

function notesWanted(spec: Record<string, unknown>): boolean {
  if (Array.isArray(spec.annotations) && spec.annotations.length > 0) return true;
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes) return false;
  for (const key of ["x", "y", "y2"]) {
    const node = axes[key];
    if (isRecord(node) && node.bands != null && node.bands !== false) return true;
  }
  return false;
}

function midPoints(lo: ArrayLike<number | null>, hi: ArrayLike<number | null>): (number | null)[] {
  const count = Math.min(lo.length, hi.length);
  const out = new Array<number | null>(count);
  for (let i = 0; i < count; i++) {
    const a = lo[i];
    const b = hi[i];
    out[i] = a == null || b == null ? null : (a + b) / 2;
  }
  return out;
}

function maskValues(values: ArrayLike<number | null>, from: number, keepBefore: boolean): (number | null)[] {
  const out = new Array<number | null>(values.length);
  for (let i = 0; i < values.length; i++) {
    const keep = keepBefore ? i <= from : i >= from;
    out[i] = keep ? (values[i] ?? null) : null;
  }
  return out;
}

function legendRow(items: { name: string; color: string; opacity: number }[], x: number, y: number, fill: string): string {
  if (items.length < 2) return "";
  let cx = x;
  const out: string[] = [];
  for (const item of items) {
    const soft = item.opacity < 1 ? ` fill-opacity="${n(Math.min(0.85, item.opacity + 0.28))}"` : "";
    out.push(`<rect x="${n(cx)}" y="${n(y)}" width="10" height="10" rx="2" fill="${item.color}"${soft} /><text x="${n(cx + 14)}" y="${n(y + 9)}" fill="${fill}" font-size="12" font-family="${font()}">${esc(item.name)}</text>`);
    cx += 22 + item.name.length * 6.6;
  }
  return out.join("");
}

function bandOnset(bands: Band[]): number {
  let start = Infinity;
  for (const band of bands) {
    const length = Math.min(band.lo.length, band.hi.length);
    for (let i = 0; i < length; i++) {
      const lo = band.lo[i];
      const hi = band.hi[i];
      if (lo === null || hi === null || !Number.isFinite(lo) || !Number.isFinite(hi)) continue;
      if (i < start) start = i;
      break;
    }
  }
  return start;
}

function linePath(values: ArrayLike<number | null>, xAt: (index: number) => number, yAt: (value: number) => number): string {
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
  const xField = fieldOf(frame.encoding.x);
  const count = table.length;
  const annotated = notesWanted(spec);
  const labels = annotated ? labelsOf(table, xField) : [];
  const columns: ArrayLike<number | null>[] = [];
  for (const band of bands) {
    columns.push(band.lo, band.hi);
  }
  if (showLine && line) columns.push(line.values);
  const [y0, y1] = lockDomain(extent(columns)[0], extent(columns)[1], [frame.encoding.y, frame.encoding.low, frame.encoding.high]);
  const yTicks = chooseTicks(spec, "y", y0, y1, domainTicks(y0, y1));
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const legend = byWidth(bands).map((band) => ({ name: band.name, color: band.color, opacity: band.opacity }));
  if (showLine && line) legend.push({ name: line.name, color: line.color, opacity: 1 });
  const legendBelow = frame.legend === "bottom";
  if (legend.length > 1 && !legendBelow) box.top = Math.max(box.top, frame.title ? (frame.subtitle ? 72 : 58) : frame.subtitle ? 52 : 36 + (CHROME_TOP - 14));
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, count);
  const xAt = (index: number) => box.left + slot * index + slot / 2;
  const notes = annotated
    ? placedNotes(spec, frame, box, categoryX(labels, xAt), yAt, [
        {
          name: line?.name ?? bands[0]?.name ?? "band",
          axis: "y",
          pts: seriesPoints(null, showLine && line ? line.values : bands[0] ? midPoints(bands[0].lo, bands[0].hi) : []),
        },
      ], labels)
    : { under: "", over: "" };
  const mode = dataSampling(spec) ?? readSamplingMode(frame.mark.sampling);
  const decimate = mode !== "none" && count > samplingThreshold(box.right - box.left) && frame.mark.strokeDash !== true;
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, xTickLabels(table, xField, count, xAt), box));
  parts.push(axisLine(frame, box));
  if (legend.length > 1 && !legendBelow) parts.push(legendRow(legend, box.left, frame.title ? (frame.subtitle ? 56 : 40) : frame.subtitle ? 32 : CHROME_TOP, cssVar("text", frame.preset.text)));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  parts.push(notes.under);
  for (const band of byWidth(bands)) {
    const d = (decimate ? denseBand(band.lo, band.hi, xAt, yAt) : null) ?? bandPath(band.lo, band.hi, xAt, yAt);
    if (!d) continue;
    const outline = frame.mark.stroke === true ? ` stroke="${band.color}" stroke-width="1.25" stroke-linejoin="round"` : ` stroke="none"`;
    parts.push(`<path d="${d}" fill="${band.color}" fill-opacity="${n(band.opacity)}"${outline} data-ck-mark="band" data-ck-series="${esc(band.name)}" aria-label="${esc(band.name)}"><title>${esc(band.name)}</title></path>`);
  }
  if (showLine && line) {
    const dash = frame.mark.strokeDash === true;
    const from = bandOnset(bands);
    const segments = dash && from > 0 && from < line.values.length
      ? [
          { values: maskValues(line.values, from, true), dashed: false },
          { values: maskValues(line.values, from, false), dashed: true },
        ]
      : [{ values: line.values, dashed: dash }];
    for (const segment of segments) {
      const d = (decimate && !segment.dashed ? denseLine(segment.values, xAt, yAt) : null) ?? linePath(segment.values, xAt, yAt);
      if (!d) continue;
      const pattern = segment.dashed ? ' stroke-dasharray="6 4"' : "";
      parts.push(`<path d="${d}" fill="none" stroke="${line.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${pattern} data-ck-mark="line" data-ck-series="${esc(line.name)}" />`);
    }
  }
  parts.push(`</g>`);
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, box));
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
  const [y0, y1] = lockDomain(extent([lo, hi])[0], extent([lo, hi])[1], [frame.encoding.y, frame.encoding.low, frame.encoding.high]);
  const yTicks = chooseTicks(spec, "y", y0, y1, domainTicks(y0, y1));
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, labels.length);
  const xAt = (index: number) => box.left + slot * index + slot / 2;
  const barW = Math.max(8, slot * (1 - gapOf(frame, 0.28)));
  const color = paint(undefined, frame.preset, 0);
  const format = valueFormat(frame, spec, frame.encoding.high ?? frame.encoding.y);
  const mids = lo.map((value, index) => (value === null || hi[index] === null ? null : ((value as number) + (hi[index] as number)) / 2));
  const notes = placedNotes(spec, frame, box, categoryX(labels, xAt), yAt, [{ name: "range", axis: "y", pts: seriesPoints(null, mids) }], labels);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, labels.map((label, index) => ({ x: xAt(index), text: label })), box));
  parts.push(axisLine(frame, box));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  parts.push(notes.under);
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
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, box));
  return view.done();
}

function whisker(x: number, yLo: number, yHi: number, color: string, label: string, cap: number): string {
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
  const [y0, y1] = lockDomain(extent(columns)[0], extent(columns)[1], [frame.encoding.y, frame.encoding.low, frame.encoding.high, frame.encoding.error]);
  const yTicks = chooseTicks(spec, "y", y0, y1, domainTicks(y0, y1));
  const box = plotBox(frame, spec, { bottom: 36, yTicks });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const slot = (box.right - box.left) / Math.max(1, labels.length);
  const xAtIndex = (index: number) => box.left + slot * index + slot / 2;
  const barW = Math.max(8, slot * (1 - gapOf(frame, 0.34)));
  const color = paint(isRecord(frame.encoding.y) && typeof frame.encoding.y.color === "string" ? frame.encoding.y.color : undefined, frame.preset, 0);
  const radius = typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : 4.5;
  const cap = Math.max(8, radius + 3.5);
  const format = valueFormat(frame, spec, frame.encoding.y);
  const notes = placedNotes(spec, frame, box, categoryX(labels, xAtIndex), yAt, [{ name: yField, axis: "y", pts: seriesPoints(null, y) }], labels);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, labels.map((label, index) => ({ x: xAtIndex(index), text: label })), box));
  parts.push(axisLine(frame, box));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  parts.push(notes.under);
  for (let i = 0; i < labels.length; i++) {
    const value = y[i];
    if (value === null) continue;
    const x = xAtIndex(i);
    const span = lo[i] !== null && hi[i] !== null ? `${fmt(Math.min(lo[i] as number, hi[i] as number), frame.locale, format)}–${fmt(Math.max(lo[i] as number, hi[i] as number), frame.locale, format)}` : fmt(value, frame.locale, format);
    const label = `${labels[i]}: ${span}`;
    if (asBar) {
      const top = Math.min(yAt(value), yAt(0));
      const height = Math.max(2, Math.abs(yAt(value) - yAt(0)));
      parts.push(openMark("rect", "bar", label, `x="${n(x - barW / 2)}" y="${n(top)}" width="${n(barW)}" height="${n(height)}" rx="3" fill="${color}"`, labels[i], i));
      parts.push(`</rect>`);
    } else {
      parts.push(`<circle data-ck-mark="point" cx="${n(x)}" cy="${n(yAt(value))}" r="${n(radius)}" fill="${color}" aria-label="${esc(label)}"><title>${esc(label)}</title></circle>`);
    }
    if (lo[i] !== null && hi[i] !== null) parts.push(whisker(x, yAt(lo[i] as number), yAt(hi[i] as number), color, label, cap));
  }
  parts.push(`</g>`);
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, box));
  return view.done();
}
