import { seriesPoints } from "../../annotations";
import { axisTitleMarks, categoryX, chooseTicks, lockDomain, placedNotes } from "../../chrome";
import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import {
  axisLine,
  clip,
  domainTicks,
  fill,
  fmt,
  valueFormat,
  gapOf,
  hGrid,
  num,
  openMark,
  pct,
  plotBox,
  scaleOf,
  str,
  stroke,
  viewOf,
  xLabels,
  yLabels,
} from "./plot";

/** Quartile box, whiskers to the Tukey fence, median, and outlier dots. */
export function renderBoxplot(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "boxplot", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const groups = new Map<string, number[]>();
  const xs = column(table, xField);
  const ys = num(table, yField);
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
  const stats = rows.map(([name, values]) => summarize(name, values));
  const flat = stats.flatMap((row) => [row.low, row.high, ...row.outliers]);
  let min = Math.min(...flat);
  let max = Math.max(...flat);
  if (min === max) max = min + 1;
  const pad = (max - min) * 0.08;
  const locked = lockDomain(min - pad, max + pad, [frame.encoding.y]);
  const domain = domainTicks(locked[0], locked[1]);
  const y0 = Math.min(locked[0], domain[0] ?? locked[0]);
  const y1 = Math.max(locked[1], domain[domain.length - 1] ?? locked[1]);
  const yTicks = chooseTicks(spec, "y", y0, y1, domainTicks(y0, y1));
  const box = plotBox(frame, spec, { yTicks });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const band = (box.right - box.left) / rows.length;
  const boxW = Math.max(12, band * (1 - gapOf(frame, 0.34)));
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const names = stats.map((row) => row.name);
  const xAt = (index: number) => box.left + band * index + band / 2;
  const notes = placedNotes(spec, frame, box, categoryX(names, xAt), yAt, [{ name: yField, axis: "y", pts: seriesPoints(null, stats.map((row) => row.median)) }], names);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  parts.push(notes.under);
  stats.forEach((row, index) => {
    const cx = xAt(index);
    const color = fill(frame, index);
    const ink = stroke(frame, index, 1.5);
    const cap = boxW * 0.45;
    const label = `${row.name}: min ${fmt(row.whiskerLow, frame.locale, shown)}, q1 ${fmt(row.q1, frame.locale, shown)}, median ${fmt(row.median, frame.locale, shown)}, q3 ${fmt(row.q3, frame.locale, shown)}, max ${fmt(row.whiskerHigh, frame.locale, shown)}`;
    parts.push(openMark("line", "whisker", label, `x1="${n(cx)}" y1="${n(yAt(row.whiskerLow))}" x2="${n(cx)}" y2="${n(yAt(row.whiskerHigh))}" stroke="${ink}" stroke-width="1.5"`));
    parts.push("</line>");
    parts.push(`<line x1="${n(cx - cap)}" y1="${n(yAt(row.whiskerLow))}" x2="${n(cx + cap)}" y2="${n(yAt(row.whiskerLow))}" stroke="${ink}" stroke-width="1.5" />`);
    parts.push(`<line x1="${n(cx - cap)}" y1="${n(yAt(row.whiskerHigh))}" x2="${n(cx + cap)}" y2="${n(yAt(row.whiskerHigh))}" stroke="${ink}" stroke-width="1.5" />`);
    const top = Math.min(yAt(row.q1), yAt(row.q3));
    const height = Math.max(2, Math.abs(yAt(row.q1) - yAt(row.q3)));
    parts.push(openMark("rect", "box", label, `x="${n(cx - boxW / 2)}" y="${n(top)}" width="${n(boxW)}" height="${n(height)}" rx="4" fill="${color}" fill-opacity="${n(Math.max(frame.geometry.fillOpacity, 0.35))}" stroke="${ink}" stroke-width="1.5"`));
    parts.push("</rect>");
    parts.push(openMark("line", "median", label, `data-ck-median="${row.median}" x1="${n(cx - boxW / 2)}" y1="${n(yAt(row.median))}" x2="${n(cx + boxW / 2)}" y2="${n(yAt(row.median))}" stroke="${cssVar("text", frame.preset.text)}" stroke-width="2"`));
    parts.push("</line>");
    for (const value of row.outliers) {
      parts.push(openMark("circle", "outlier", `${row.name} outlier ${fmt(value, frame.locale, shown)}`, `cx="${n(cx)}" cy="${n(yAt(value))}" r="${n(frame.geometry.pointSize)}" fill="${color}"`));
      parts.push("</circle>");
    }
  });
  parts.push("</g>");
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, box));
  parts.push(axisLine(frame, box));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, stats.map((row, index) => ({ x: xAt(index), text: row.name })), box));
  return view.done();
}

function summarize(name: string, values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = pct(sorted, 0.25);
  const median = pct(sorted, 0.5);
  const q3 = pct(sorted, 0.75);
  const iqr = q3 - q1;
  const low = q1 - 1.5 * iqr;
  const high = q3 + 1.5 * iqr;
  const inside = sorted.filter((value) => value >= low && value <= high);
  return {
    name,
    q1,
    median,
    q3,
    low,
    high,
    whiskerLow: inside[0] ?? sorted[0],
    whiskerHigh: inside[inside.length - 1] ?? sorted[sorted.length - 1],
    outliers: sorted.filter((value) => value < low || value > high),
  };
}
