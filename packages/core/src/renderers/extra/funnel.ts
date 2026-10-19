import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import { fill, fmt, formatPercent, num, openMark, str, text, valueFormat, viewOf } from "./plot";

/** Stages in data order. Centered rounded bars are the default; `mark.shape` `"trapezoid"` connects them. */
export function renderFunnel(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "funnel", 640, 400);
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
  const top = frame.title ? 44 : 20;
  const band = (frame.height - top - 16) / stages.length;
  const plotLeft = 156;
  const plotW = frame.width - plotLeft - 28;
  const cx = plotLeft + plotW / 2;
  const trapezoid = frame.mark.shape === "trapezoid";
  const shown = valueFormat(frame, spec, frame.encoding.y);
  stages.forEach(([label, value], index) => {
    const prev = index === 0 ? value : stages[index - 1][1];
    const conversion = prev > 0 ? value / prev : 0;
    const y0 = top + index * band;
    const barH = Math.max(22, band * 0.7);
    const y = y0 + (band - barH) / 2;
    const w0 = Math.max(barH, (value / max) * plotW);
    const next = stages[index + 1]?.[1] ?? value;
    const w1 = Math.max(barH, (next / max) * plotW);
    const valueText = fmt(value, frame.locale, shown);
    const pct = formatPercent(conversion, frame.locale);
    const tip = index === 0 ? `${label}: ${valueText} (start)` : `${label}: ${valueText} · ${pct} of previous`;
    const color = fill(frame, 0);
    if (trapezoid) {
      const y1 = y + barH;
      const d = `M${n(cx - w0 / 2)} ${n(y)} L${n(cx + w0 / 2)} ${n(y)} L${n(cx + w1 / 2)} ${n(y1)} L${n(cx - w1 / 2)} ${n(y1)} Z`;
      parts.push(openMark("path", "stage", tip, `d="${d}" fill="${color}"`));
      parts.push("</path>");
    } else {
      const radius = Math.min(10, barH / 2);
      parts.push(openMark("rect", "stage", tip, `x="${n(cx - w0 / 2)}" y="${n(y)}" width="${n(w0)}" height="${n(barH)}" rx="${n(radius)}" fill="${color}"`));
      parts.push("</rect>");
    }
    const mid = y + barH / 2;
    parts.push(text(16, mid - 6, label, cssVar("text", frame.preset.text), 14, "650"));
    parts.push(text(16, mid + 12, index === 0 ? valueText : `${valueText} · ${pct}`, cssVar("muted", frame.preset.muted), 12, "500"));
  });
  return view.done();
}
