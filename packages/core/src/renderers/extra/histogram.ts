import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n, niceDomain } from "../../svg";
import { asNumber } from "../../frame";
import {
  axisLine,
  clip,
  countTicks,
  domainTicks,
  fill,
  fmt,
  hGrid,
  num,
  openMark,
  plotBox,
  scaleOf,
  valueFormat,
  viewOf,
  xLabels,
  yLabels,
} from "./plot";

/** Bin a quantitative field, or draw counts that are already binned. */
export function renderHistogram(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "histogram", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  const xs = column(table, xField);
  const box = plotBox(frame, spec);
  const color = fill(frame, 0);
  const bars: { x0: number; x1: number; count: number; label: string }[] = [];

  if (yField) {
    const counts = num(table, yField);
    counts.forEach((count, index) => {
      if (count === null) return;
      const label = xField ? String(xs[index] ?? index + 1) : String(index + 1);
      bars.push({ x0: index, x1: index + 1, count, label });
    });
  } else {
    const values = xs.map(asNumber).filter((value): value is number => value !== null);
    if (!values.length) return null;
    const binned = binValues(values, frame.mark);
    const edgeFormat = valueFormat(frame, spec, frame.encoding.x, "x");
    binned.counts.forEach((count, index) => {
      const lo = binned.edges[index];
      const hi = binned.edges[index + 1];
      bars.push({ x0: lo, x1: hi, count, label: `${fmt(lo, frame.locale, edgeFormat)}–${fmt(hi, frame.locale, edgeFormat)}` });
    });
  }
  if (!bars.length) return null;

  const countFormat = yField ? valueFormat(frame, spec, frame.encoding.y) : undefined;
  const peak = Math.max(...bars.map((bar) => bar.count), 1);
  const yTicks = countTicks(peak);
  const yTop = Math.max(peak, yTicks[yTicks.length - 1] ?? peak);
  const yAt = scaleOf(0, yTop, box.bottom, box.top);
  const dataMin = bars[0].x0;
  const dataMax = bars[bars.length - 1].x1;
  const [axisMin, axisMax] = yField ? [dataMin, dataMax] : niceDomain(dataMin, dataMax);
  const span = axisMax - axisMin || 1;
  const xAt = (value: number) => box.left + ((value - axisMin) / span) * (box.right - box.left);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  for (const bar of bars) {
    const x = xAt(bar.x0);
    const width = Math.max(1, xAt(bar.x1) - x - 1);
    const y = yAt(bar.count);
    const height = Math.max(0, box.bottom - y);
    if (height <= 0) continue;
    const countText = countFormat !== undefined ? fmt(bar.count, frame.locale, countFormat) : String(bar.count);
    const label = `${bar.label}: ${countText}`;
    parts.push(openMark("rect", "bar", label, `data-ck-count="${bar.count}" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" fill="${color}"`));
    parts.push("</rect>");
  }
  parts.push("</g>");
  parts.push(axisLine(frame, box));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  const edges = yField
    ? bars.map((bar) => ({ x: xAt(bar.x0 + (bar.x1 - bar.x0) / 2), text: bar.label }))
    : domainTicks(axisMin, axisMax).map((value) => ({ x: xAt(value), text: edgeText(value, frame.locale, valueFormat(frame, spec, frame.encoding.x, "x")) }));
  parts.push(xLabels(frame, spec, edges));
  if (!yField && bars.length <= 8) {
    parts.push(`<text x="${n(box.left)}" y="${n(box.top - 4)}" fill="${cssVar("muted", frame.preset.muted)}" font-size="11">${bars.length} bins</text>`);
  }
  return view.done();
}

function edgeText(value: number, locale: string, format: unknown): string {
  if (format !== undefined) return fmt(value, locale, format);
  return trimNum(value);
}

function trimNum(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return String(Math.round(rounded));
  return String(rounded);
}

function binValues(values: number[], mark: Record<string, unknown>): { edges: number[]; counts: number[] } {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }
  const rule = typeof mark.bin === "string" ? mark.bin : undefined;
  const width = typeof mark.binWidth === "number" && mark.binWidth > 0 ? mark.binWidth : undefined;
  const asked = typeof mark.bins === "number" ? Math.min(60, Math.max(1, Math.round(mark.bins))) : undefined;
  let count: number;
  if (rule === "width" || (width !== undefined && rule !== "count" && rule !== "sturges" && rule !== "sqrt" && rule !== "fd" && asked === undefined)) {
    count = Math.min(60, Math.max(1, Math.ceil((max - min) / (width ?? 1) - 1e-9)));
  } else if (rule === "sturges") count = Math.min(60, Math.max(1, Math.ceil(Math.log2(values.length) + 1)));
  else if (rule === "sqrt") count = Math.min(60, Math.max(1, Math.ceil(Math.sqrt(values.length))));
  else if (rule === "fd") count = freedman(values, min, max);
  else count = asked ?? 8;
  const step = (max - min) / count;
  const counts = Array.from({ length: count }, () => 0);
  const edges = Array.from({ length: count + 1 }, (_, index) => min + index * step);
  for (const value of values) {
    let index = Math.floor((value - min) / step);
    if (index >= count) index = count - 1;
    if (index < 0) index = 0;
    counts[index] += 1;
  }
  return { edges, counts };
}

function freedman(values: number[], min: number, max: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)];
  const q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
  const iqr = q3 - q1 || max - min || 1;
  const width = 2 * iqr * values.length ** (-1 / 3);
  return Math.min(60, Math.max(1, Math.ceil((max - min) / (width || 1))));
}
