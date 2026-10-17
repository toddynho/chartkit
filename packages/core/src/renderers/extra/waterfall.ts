import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import {
  axisLine,
  clip,
  domainTicks,
  fmt,
  gapOf,
  hGrid,
  num,
  openMark,
  plotBox,
  scaleOf,
  str,
  text,
  viewOf,
  xLabels,
  yLabels,
} from "./plot";

/** Floating deltas from a running total, with connector lines and a total bar. */
export function renderWaterfall(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "waterfall", 640, 380);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const totalField = typeof frame.mark.total === "string" ? frame.mark.total : "total";
  const totals = column(table, totalField);
  const xs = column(table, xField);
  const ys = num(table, yField);
  const steps: { name: string; start: number; end: number; value: number; total: boolean }[] = [];
  let run = 0;
  ys.forEach((value, index) => {
    if (value === null) return;
    const total = isTotal(totals[index]);
    const start = total ? 0 : run;
    const end = total ? value : run + value;
    steps.push({ name: xField ? str(xs[index]) : String(index + 1), start, end, value: total ? value : value, total });
    run = end;
  });
  if (!steps.length) return null;
  const flat = steps.flatMap((step) => [step.start, step.end, 0]);
  let min = Math.min(...flat);
  let max = Math.max(...flat);
  if (min === max) max = min + 1;
  const pad = (max - min) * 0.12;
  const y0 = min - pad;
  const y1 = max + pad;
  const box = plotBox(frame, spec, { bottom: 36 });
  const yAt = scaleOf(y0, y1, box.bottom, box.top);
  const yTicks = domainTicks(y0, y1);
  const band = (box.right - box.left) / steps.length;
  const barW = Math.max(10, band * (1 - gapOf(frame, 0.34)));
  const up = cssVar("positive", frame.preset.positive);
  const down = cssVar("negative", frame.preset.negative);
  const totalColor = cssVar("accent", frame.preset.accent);
  parts.push(hGrid(spec, frame, box, yTicks, yAt));
  parts.push(clip(frame, box));
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  if (y0 < 0 && y1 > 0) {
    parts.push(`<line x1="${n(box.left)}" y1="${n(yAt(0))}" x2="${n(box.right)}" y2="${n(yAt(0))}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
  }
  steps.forEach((step, index) => {
    const x = box.left + band * index + (band - barW) / 2;
    const y = Math.min(yAt(step.start), yAt(step.end));
    const height = Math.max(2, Math.abs(yAt(step.end) - yAt(step.start)));
    const color = step.total ? totalColor : step.end >= step.start ? up : down;
    const kind = step.total ? "total" : "delta";
    const label = `${step.name}: ${step.total ? "total " : ""}${fmt(step.value, frame.locale)}`;
    if (index > 0) {
      const prev = steps[index - 1];
      const x0 = box.left + band * (index - 1) + (band - barW) / 2 + barW;
      parts.push(`<line data-ck-mark="connector" x1="${n(x0)}" y1="${n(yAt(prev.end))}" x2="${n(x)}" y2="${n(yAt(prev.end))}" stroke="${cssVar("muted", frame.preset.muted)}" stroke-dasharray="3 3" />`);
    }
    parts.push(openMark("rect", kind, label, `x="${n(x)}" y="${n(y)}" width="${n(barW)}" height="${n(height)}" rx="4" fill="${color}"`));
    parts.push("</rect>");
    parts.push(text(x + barW / 2, y - 6, fmt(step.total ? step.end : step.value, frame.locale), cssVar("text", frame.preset.text), 11, "600", "middle"));
  });
  parts.push("</g>");
  parts.push(axisLine(frame, box));
  parts.push(yLabels(frame, spec, box, yTicks, yAt));
  parts.push(xLabels(frame, spec, steps.map((step, index) => ({ x: box.left + band * index + band / 2, text: step.name }))));
  return view.done();
}

function isTotal(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}
