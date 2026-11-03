import { chooseTicks, labelStep, lockDomain, minorTickMarks, placedAxisTitles } from "../../chrome";
import { axisOn, column, fieldOf } from "../../frame";
import { cssVar, paint } from "../../theme";
import { ch, hash, isRecord, n, readAxis } from "../../svg";
import {
  axisLine,
  domainTicks,
  fill,
  fmt,
  num,
  openMark,
  pct,
  scaleOf,
  str,
  text,
  valueFormat,
  viewOf,
} from "./plot";

interface Dot {
  value: number;
  label: string;
  colorKey: string;
  key: string;
}

interface Group {
  name: string;
  dots: Dot[];
}

interface Compare {
  from: string;
  to: string;
  at: "summary" | "min" | "max" | "mean";
  toAt: "summary" | "min" | "max" | "mean";
  label: string;
}

/** One categorical row of observations on a shared numeric axis. */
export function renderStrip(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "strip", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const vertical = frame.mark.orientation === "vertical";
  const groupChannel = vertical ? frame.encoding.x : frame.encoding.y;
  const valueChannel = vertical ? frame.encoding.y : frame.encoding.x;
  const groupField = fieldOf(groupChannel);
  const valueField = fieldOf(valueChannel);
  if (!groupField || !valueField) return null;
  const labelField = fieldOf(frame.encoding.label);
  const color = readColor(frame.encoding.color);
  const groups = new Map<string, Group>();
  const names = column(table, groupField);
  const values = num(table, valueField);
  const labels = column(table, labelField);
  const colors = column(table, color.field);
  for (let i = 0; i < table.length; i++) {
    const value = values[i];
    if (value === null) continue;
    const name = str(names[i]);
    if (!name) continue;
    const label = labelField ? str(labels[i]) : "";
    const colorKey = color.field ? str(colors[i]) : "";
    const dot: Dot = { value, label, colorKey, key: `${name}|${label}|${value}|${i}` };
    const group = groups.get(name);
    if (group) group.dots.push(dot);
    else groups.set(name, { name, dots: [dot] });
  }
  let rows = [...groups.values()];
  if (!rows.length) return null;
  const summary = frame.mark.summary === "none" || frame.mark.summary === "mean" || frame.mark.summary === "median" ? frame.mark.summary : "median";
  const band = frame.mark.band === "range" || frame.mark.band === "iqr" ? frame.mark.band : "none";
  const highlight = typeof frame.mark.highlight === "string" ? frame.mark.highlight : "";
  const degenerate = rows.every((row) => row.dots.length === 1);
  const drawSummary = !degenerate && summary !== "none";
  const drawBand = !degenerate && band !== "none";
  const sort = frame.mark.sort === "asc" || frame.mark.sort === "desc" ? frame.mark.sort : "none";
  if (sort !== "none") {
    rows = [...rows].sort((a, b) => {
      const delta = stat(a, summary === "none" ? "median" : summary) - stat(b, summary === "none" ? "median" : summary);
      return sort === "asc" ? delta : -delta;
    });
  }
  const flat = rows.flatMap((row) => row.dots.map((dot) => dot.value));
  let min = Math.min(...flat);
  let max = Math.max(...flat);
  if (min === max) max = min + 1;
  const pad = (max - min) * 0.06;
  const locked = lockDomain(min - pad, max + pad, [valueChannel]);
  const domain = domainTicks(locked[0], locked[1]);
  const v0 = Math.min(locked[0], domain[0] ?? locked[0]);
  const v1 = Math.max(locked[1], domain[domain.length - 1] ?? locked[1]);
  const valueTicks = chooseTicks(spec, vertical ? "y" : "x", v0, v1, domainTicks(v0, v1));
  const shown = valueFormat(frame, spec, valueChannel, vertical ? "y" : "x");
  const radius = typeof frame.mark.pointSize === "number" ? frame.mark.pointSize : Math.max(3.5, frame.geometry.pointSize);
  const compare = readCompare(spec);
  const nameWidth = Math.max(...rows.map((row) => row.name.length)) * 7.2;
  const left = vertical ? 56 : Math.max(72, Math.ceil(nameWidth) + 18);
  const top = frame.title ? 46 : 20;
  const bottom = 40;
  const box = { left, top, right: frame.width - (vertical ? 20 : 156), bottom: frame.height - bottom };
  const at = vertical ? scaleOf(v0, v1, box.bottom, box.top) : scaleOf(v0, v1, box.left, box.right);
  const extra = compare ? 26 : 0;
  const lane = vertical ? (box.right - box.left - extra) / rows.length : (box.bottom - box.top - extra) / rows.length;
  const centerOf = (index: number) => {
    let cursor = vertical ? box.left : box.top;
    for (let i = 0; i < index; i++) cursor += lane + (compare && rows[i]?.name === compare.from ? extra : 0);
    return cursor + lane / 2;
  };
  const colorNames: string[] = [];
  if (!highlight && color.field) {
    for (const row of rows) {
      for (const dot of row.dots) if (dot.colorKey && !colorNames.includes(dot.colorKey)) colorNames.push(dot.colorKey);
    }
  }
  const dotColor = (row: Group, dot: Dot, index: number) => {
    if (highlight) return paint(row.name === highlight ? "accent" : "muted", frame.preset, 0);
    if (color.constant) return paint(color.constant, frame.preset, index);
    if (color.field) return fill(frame, Math.max(0, colorNames.indexOf(dot.colorKey)));
    return fill(frame, index);
  };
  const jitterOf = (row: Group) => offsets(row, at, radius, frame.mark.jitter);
  parts.push(valueGrid(vertical, box, valueTicks, at, frame.preset.grid));
  rows.forEach((row, index) => {
    const center = centerOf(index);
    const along = vertical
      ? `x1="${n(center)}" y1="${n(box.top)}" x2="${n(center)}" y2="${n(box.bottom)}"`
      : `x1="${n(box.left)}" y1="${n(center)}" x2="${n(box.right)}" y2="${n(center)}"`;
    parts.push(`<line ${along} stroke="${cssVar("grid", frame.preset.grid)}" stroke-width="2" stroke-linecap="round" />`);
    if (drawBand && row.dots.length >= 3) {
      const ends = bandEnds(row, band);
      parts.push(bandMark(vertical, center, at(ends[0]), at(ends[1]), frame, row.name));
    }
  });
  rows.forEach((row, index) => {
    if (!drawSummary) return;
    const center = centerOf(index);
    const value = stat(row, summary);
    const label = `${row.name} ${summary} ${fmt(value, frame.locale, shown)}`;
    const ink = cssVar("text", frame.preset.text);
    if (vertical) {
      parts.push(openMark("line", "summary", label, `x1="${n(center - 11)}" y1="${n(at(value))}" x2="${n(center + 11)}" y2="${n(at(value))}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"`));
    } else {
      parts.push(openMark("line", "summary", label, `x1="${n(at(value))}" y1="${n(center - 11)}" x2="${n(at(value))}" y2="${n(center + 11)}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"`));
    }
    parts.push("</line>");
  });
  const ordered: { row: Group; dot: Dot; index: number }[] = [];
  rows.forEach((row, index) => {
    const ranked = [...row.dots].sort((a, b) => a.value - b.value || a.key.localeCompare(b.key));
    for (const dot of ranked) ordered.push({ row, dot, index });
  });
  const shifts = new Map<string, number>();
  for (const row of rows) {
    const found = jitterOf(row);
    row.dots.forEach((dot, index) => shifts.set(dot.key, found[index] ?? 0));
  }
  for (const item of ordered) {
    const limit = Math.max(0, lane / 2 - radius - 1);
    const rawShift = shifts.get(item.dot.key) ?? 0;
    const shift = Math.max(-limit, Math.min(limit, rawShift));
    const center = centerOf(item.index);
    const pos = at(item.dot.value);
    const cx = vertical ? center + shift : pos;
    const cy = vertical ? pos : center + shift;
    const color = dotColor(item.row, item.dot, item.index);
    const label = tip(item.row.name, item.dot, frame.locale, shown);
    parts.push(
      openMark(
        "circle",
        "point",
        label,
        `tabindex="0" cx="${n(cx)}" cy="${n(cy)}" r="${n(radius)}" fill="${color}" stroke="${cssVar("background", frame.preset.background)}" stroke-width="1.5" data-ck-group="${escapeAttr(item.row.name)}" data-ck-value="${item.dot.value}"`,
        item.dot.label || item.row.name,
        ordered.indexOf(item),
      ),
    );
    parts.push("</circle>");
  }
  if (compare) {
    const from = rows.find((row) => row.name === compare.from);
    const to = rows.find((row) => row.name === compare.to);
    if (from && to) {
      const fromIndex = rows.indexOf(from);
      const y = vertical ? centerOf(fromIndex) + lane / 2 + 4 : centerOf(fromIndex) + lane / 2 + 2;
      const a = at(endStat(from, compare.at, summary));
      const b = at(endStat(to, compare.toAt, summary));
      parts.push(bracket(vertical, a, b, y, compare.label, frame.preset.accent));
    }
  }
  rows.forEach((row, index) => {
    const center = centerOf(index);
    const ink = highlight && row.name === highlight ? cssVar("accent", frame.preset.accent) : cssVar("text", frame.preset.text);
    const weight = highlight && row.name === highlight ? "600" : "500";
    if (vertical) parts.push(text(center, box.bottom + 16, row.name, ink, 12, weight, "middle"));
    else parts.push(text(box.left - 10, center + 4, row.name, ink, 13, weight, "end"));
    if (!vertical) {
      const value = drawSummary ? stat(row, summary) : row.dots[0]?.value;
      if (value !== undefined) {
        const lo = Math.min(...row.dots.map((dot) => dot.value));
        const hi = Math.max(...row.dots.map((dot) => dot.value));
        parts.push(text(box.right + 12, center + 4, fmt(value, frame.locale, shown), ink, 13, weight, "start"));
        if (row.dots.length > 1) {
          parts.push(text(box.right + 58, center + 4, `${fmt(lo, frame.locale, shown)}–${fmt(hi, frame.locale, shown)}`, cssVar("muted", frame.preset.muted), 11, "400", "start"));
        }
      }
    }
  });
  if (axisOn(spec, vertical ? "y" : "x")) {
    const key = vertical ? "y" : "x";
    const axis = readAxis(spec, key);
    const step = labelStep(valueTicks.length, axis.skip, 1);
    const tickInk = cssVar("muted", frame.preset.muted);
    for (let i = 0; i < valueTicks.length; i += step) {
      const value = valueTicks[i] ?? 0;
      const pos = at(value);
      const label = fmt(value, frame.locale, shown);
      if (vertical) parts.push(text(box.left - 8, pos + 4, label, tickInk, 11, "400", "end"));
      else parts.push(text(pos, box.bottom + 16, label, tickInk, 11, "400", "middle"));
    }
    const edge = vertical ? box.left : box.bottom;
    parts.push(minorTickMarks(axis.minor ?? 0, valueTicks, at, edge, !vertical, vertical ? -3 : 3, cssVar("axis", frame.preset.axis)));
  }
  if (!vertical && axisOn(spec, "x")) parts.push(axisLine(frame, { left: box.left, top: box.top, right: box.right, bottom: box.bottom }));
  parts.push(placedAxisTitles(frame, spec, box));
  if (colorNames.length && frame.legend !== false) {
    let x = box.left;
    const y = 14;
    colorNames.forEach((name, index) => {
      const swatch = fill(frame, index);
      parts.push(`<circle cx="${n(x + 4)}" cy="${n(y)}" r="4" fill="${swatch}" />`);
      parts.push(text(x + 12, y + 4, name, cssVar("muted", frame.preset.muted), 11, "400", "start"));
      x += 12 + ch(name.length, 7) + 16;
    });
  }
  return view.done();
}

function readColor(value: unknown): { field?: string; constant?: string } {
  if (typeof value === "string") return { field: value };
  if (!isRecord(value)) return {};
  if (typeof value.field === "string") return { field: value.field };
  if (typeof value.value === "string") return { constant: value.value };
  return {};
}

function readCompare(spec: Record<string, unknown>): Compare | null {
  if (!Array.isArray(spec.annotations)) return null;
  for (const item of spec.annotations) {
    if (!isRecord(item) || item.type !== "compare") continue;
    const from = endOf(item.from);
    const to = endOf(item.to);
    if (!from || !to || typeof item.label !== "string") continue;
    return { from: from.group, to: to.group, at: from.at, toAt: to.at, label: item.label };
  }
  return null;
}

function endOf(value: unknown): { group: string; at: Compare["at"] } | null {
  if (!isRecord(value) || typeof value.group !== "string") return null;
  const at = value.at === "min" || value.at === "max" || value.at === "mean" || value.at === "summary" ? value.at : null;
  if (!at) return null;
  return { group: value.group, at };
}

function valuesOf(row: Group): number[] {
  return row.dots.map((dot) => dot.value).sort((a, b) => a - b);
}

function stat(row: Group, kind: "median" | "mean"): number {
  const values = valuesOf(row);
  if (kind === "mean") return values.reduce((sum, value) => sum + value, 0) / values.length;
  return pct(values, 0.5);
}

function endStat(row: Group, at: Compare["at"], summary: "none" | "median" | "mean"): number {
  const values = valuesOf(row);
  if (at === "min") return values[0] ?? 0;
  if (at === "max") return values[values.length - 1] ?? 0;
  if (at === "mean") return stat(row, "mean");
  return stat(row, summary === "mean" ? "mean" : "median");
}

function bandEnds(row: Group, band: "range" | "iqr"): [number, number] {
  const values = valuesOf(row);
  if (band === "iqr") return [pct(values, 0.25), pct(values, 0.75)];
  return [values[0] ?? 0, values[values.length - 1] ?? 0];
}

function offsets(row: Group, at: (value: number) => number, radius: number, jitter: unknown): number[] {
  const out = row.dots.map(() => 0);
  if (jitter === "none") return out;
  if (typeof jitter === "number") {
    row.dots.forEach((dot, index) => {
      const unit = (parseInt(hash(dot.key), 36) % 1000) / 999;
      out[index] = (unit * 2 - 1) * jitter;
    });
    return out;
  }
  const diameter = Math.max(1, radius * 2);
  const order = row.dots.map((dot, index) => ({ index, x: at(dot.value) })).sort((a, b) => a.x - b.x || a.index - b.index);
  let cluster: { index: number; x: number }[] = [];
  const flush = () => {
    if (cluster.length > 1) {
      const mid = (cluster.length - 1) / 2;
      cluster.forEach((item, index) => {
        out[item.index] = (index - mid) * diameter;
      });
    }
    cluster = [];
  };
  for (const item of order) {
    const prev = cluster[cluster.length - 1];
    if (prev && item.x - prev.x > diameter) flush();
    cluster.push(item);
  }
  flush();
  return out;
}

function bandMark(vertical: boolean, center: number, a: number, b: number, frame: { preset: { accent: string } }, name: string): string {
  const start = Math.min(a, b);
  const size = Math.max(2, Math.abs(b - a));
  const thick = 14;
  const x = vertical ? center - thick / 2 : start;
  const y = vertical ? start : center - thick / 2;
  const width = vertical ? thick : size;
  const height = vertical ? size : thick;
  const fill = cssVar("accent", frame.preset.accent);
  return `<rect data-ck-mark="band" data-ck-group="${escapeAttr(name)}" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="6" fill="${fill}" fill-opacity="0.12" />`;
}

function valueGrid(vertical: boolean, box: { left: number; top: number; right: number; bottom: number }, ticks: number[], at: (value: number) => number, grid: string): string {
  return ticks
    .map((value) => {
      const pos = at(value);
      if (vertical) return `<line x1="${n(box.left)}" y1="${n(pos)}" x2="${n(box.right)}" y2="${n(pos)}" stroke="${cssVar("grid", grid)}" stroke-dasharray="2 4" />`;
      return `<line x1="${n(pos)}" y1="${n(box.top)}" x2="${n(pos)}" y2="${n(box.bottom)}" stroke="${cssVar("grid", grid)}" stroke-dasharray="2 4" />`;
    })
    .join("");
}

function bracket(vertical: boolean, a: number, b: number, at: number, label: string, accent: string): string {
  const ink = cssVar("accent", accent);
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  if (vertical) {
    return `<g data-ck-mark="compare" aria-label="${escapeAttr(label)}"><line x1="${n(at)}" y1="${n(start)}" x2="${n(at)}" y2="${n(end)}" stroke="${ink}" stroke-dasharray="3 3" /><line x1="${n(at)}" y1="${n(start)}" x2="${n(at + 8)}" y2="${n(start)}" stroke="${ink}" /><line x1="${n(at)}" y1="${n(end)}" x2="${n(at + 8)}" y2="${n(end)}" stroke="${ink}" />${text(at + 12, (start + end) / 2 + 4, label, ink, 11, "500", "start")}</g>`;
  }
  const y = at;
  return `<g data-ck-mark="compare" aria-label="${escapeAttr(label)}"><line x1="${n(start)}" y1="${n(y)}" x2="${n(start)}" y2="${n(y + 10)}" stroke="${ink}" /><line x1="${n(end)}" y1="${n(y)}" x2="${n(end)}" y2="${n(y + 10)}" stroke="${ink}" /><line x1="${n(start)}" y1="${n(y + 10)}" x2="${n(end)}" y2="${n(y + 10)}" stroke="${ink}" stroke-dasharray="3 3" />${text(end + 8, y + 14, label, ink, 11, "500", "start")}</g>`;
}

function tip(group: string, dot: Dot, locale: string, format: unknown): string {
  const value = fmt(dot.value, locale, format);
  return dot.label ? `${dot.label}, ${group}, ${value}` : `${group}, ${value}`;
}

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
