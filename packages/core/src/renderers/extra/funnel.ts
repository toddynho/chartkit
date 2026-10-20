import { column, fieldOf, type Frame } from "../../frame";
import { cssVar } from "../../theme";
import { isRecord, n } from "../../svg";
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
  const legend = funnelLegend(spec, frame);
  const items = legend ? stages.flatMap(([label], index) => (legend.hide.includes(label) ? [] : [[label, fill(frame, index)] as [string, string]])) : [];
  const pos = legend?.position;
  const vertical = pos === "left" || pos === "right";
  const legendBand = legend && !vertical ? 22 : 0;
  const legendSide = legend && vertical ? Math.min(168, 28 + Math.max(...items.map(([label]) => label.length), 1) * 7) : 0;
  const top = (frame.title ? 44 : 20) + (pos === "top" ? legendBand : 0);
  const bottomPad = 16 + (pos === "bottom" ? legendBand : 0);
  const plotLeft = 156 + (pos === "left" ? legendSide : 0);
  const plotRight = 28 + (pos === "right" ? legendSide : 0);
  const band = (frame.height - top - bottomPad) / stages.length;
  const plotW = frame.width - plotLeft - plotRight;
  const cx = plotLeft + plotW / 2;
  const labelX = pos === "left" ? 8 + legendSide : 16;
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
    const color = legend ? fill(frame, index) : fill(frame, 0);
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
    parts.push(text(labelX, mid - 6, label, cssVar("text", frame.preset.text), 14, "650"));
    parts.push(text(labelX, mid + 12, index === 0 ? valueText : `${valueText} · ${pct}`, cssVar("muted", frame.preset.muted), 12, "500"));
  });
  if (legend && items.length) {
    const ink = cssVar("text", frame.preset.text);
    let x = pos === "right" ? frame.width - legendSide : 16;
    let y = pos === "bottom" ? frame.height - 20 : pos === "top" ? (frame.title ? 28 : 8) : top;
    const marks = items.map(([label, color]) => {
      const bit = `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}" />${text(x + 14, y + 9, label, ink, 12, "500")}`;
      if (vertical) y += 18;
      else x += 14 + label.length * 7 + 16;
      return bit;
    });
    parts.push(`<g data-ck-legend="${pos}">${marks.join("")}</g>`);
  }
  return view.done();
}

/** A legend object or `legend: true`. Omitted stays unlabeled, since each stage already has a caption. */
function funnelLegend(spec: Record<string, unknown>, frame: Frame): { position: "top" | "right" | "bottom" | "left"; hide: string[] } | null {
  const asked = spec.legend === true || (isRecord(spec.legend) && spec.legend.show !== false);
  if (!asked || frame.legend === false) return null;
  const source = isRecord(spec.legend) ? spec.legend : {};
  const hide = Array.isArray(source.hide) ? source.hide.filter((item): item is string => typeof item === "string") : [];
  const position = frame.legend === "right" || frame.legend === "bottom" || frame.legend === "left" ? frame.legend : "top";
  return { position, hide };
}
