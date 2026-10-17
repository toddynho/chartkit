import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import { fill, fmt, formatPercent, num, openMark, str, text, viewOf } from "./plot";

/** Stages in data order, with the value and the conversion from the previous stage. */
export function renderFunnel(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "funnel", 640, 380);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const xs = column(table, xField);
  const ys = num(table, yField);
  const stages = ys.flatMap((value, index) => (value === null ? [] : [[xField ? str(xs[index]) : String(index + 1), Math.max(0, value)] as [string, number]]));
  if (!stages.length) return null;
  const max = Math.max(...stages.map((stage) => stage[1]), 1);
  const top = frame.title ? 44 : 16;
  const band = (frame.height - top - 12) / stages.length;
  const plotLeft = 168;
  const plotW = frame.width - plotLeft - 20;
  stages.forEach(([label, value], index) => {
    const prev = index === 0 ? value : stages[index - 1][1];
    const conversion = prev > 0 ? value / prev : 0;
    const y0 = top + index * band + 6;
    const y1 = top + (index + 1) * band - 6;
    const next = stages[index + 1]?.[1] ?? value;
    const w0 = Math.max(12, (value / max) * plotW);
    const w1 = Math.max(12, (next / max) * plotW);
    const cx = plotLeft + plotW / 2;
    const tip = `${label}: ${fmt(value, frame.locale)} · ${formatPercent(conversion, frame.locale)} of previous`;
    const d = `M${n(cx - w0 / 2)} ${n(y0)} L${n(cx + w0 / 2)} ${n(y0)} L${n(cx + w1 / 2)} ${n(y1)} L${n(cx - w1 / 2)} ${n(y1)} Z`;
    parts.push(openMark("path", "stage", tip, `d="${d}" fill="${fill(frame, index)}"`));
    parts.push("</path>");
    parts.push(text(20, y0 + (y1 - y0) / 2 - 4, label, cssVar("text", frame.preset.text), 14, "650"));
    parts.push(text(20, y0 + (y1 - y0) / 2 + 14, `${fmt(value, frame.locale)} · ${formatPercent(conversion, frame.locale)}`, cssVar("muted", frame.preset.muted), 12, "500"));
  });
  return view.done();
}
