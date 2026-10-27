import { CHROME_TOP } from "../../chrome";
import { column, fieldOf, type Frame } from "../../frame";
import { cssVar } from "../../theme";
import { isRecord, n } from "../../svg";
import { fill, fit, fmt, formatPercent, num, openMark, str, text, valueFormat, viewOf } from "./plot";

/**
 * Stages in data order. The default is one tapering funnel: each stage is a
 * trapezoid whose bottom edge is the next stage's top. `mark.shape` `"bar"`
 * keeps centered rounded bars.
 */
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
  const legendLift = pos === "top" && !frame.title ? CHROME_TOP - 8 : 0;
  const top = (frame.title ? 44 : 20) + (frame.subtitle ? 18 : 0) + (pos === "top" ? legendBand : 0) + legendLift;
  const bottomPad = 16 + (pos === "bottom" ? legendBand : 0);
  const plotLeft = 156 + (pos === "left" ? legendSide : 0);
  const plotRight = 28 + (pos === "right" ? legendSide : 0);
  const band = (frame.height - top - bottomPad) / stages.length;
  const plotW = Math.max(0, frame.width - plotLeft - plotRight);
  const cx = plotLeft + plotW / 2;
  const labelX = pos === "left" ? 8 + legendSide : 16;
  const bars = frame.mark.shape === "bar";
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const colorEach = Boolean(legend) || Boolean(fieldOf(frame.encoding.color));
  const widths = stages.map((stage) => funnelSpan(stage[1], max, plotW));
  const mouth = funnelMouth(widths);
  stages.forEach(([label, value], index) => {
    const prev = index === 0 ? value : stages[index - 1][1];
    const conversion = prev > 0 ? value / prev : 0;
    const y0 = top + index * band;
    const valueText = fmt(value, frame.locale, shown);
    const pct = formatPercent(conversion, frame.locale);
    const tip = index === 0 ? `${label}: ${valueText} (start)` : `${label}: ${valueText} · ${pct} of previous`;
    const color = colorEach ? fill(frame, index) : fill(frame, 0);
    const valueLine = index === 0 ? valueText : `${valueText} · ${pct}`;
    let mid = y0 + band / 2;
    if (bars) {
      const barH = Math.max(22, band * 0.7);
      const y = y0 + (band - barH) / 2;
      const w0 = Math.max(barH, (value / max) * plotW);
      const radius = Math.min(10, barH / 2);
      parts.push(openMark("rect", "stage", tip, `x="${n(cx - w0 / 2)}" y="${n(y)}" width="${n(w0)}" height="${n(barH)}" rx="${n(radius)}" fill="${color}"`));
      parts.push("</rect>");
      mid = y + barH / 2;
    } else {
      const y1 = top + (index + 1) * band;
      const gap = funnelGap(frame);
      const inset = ((y1 - y0) * gap) / 2;
      const topY = y0 + inset;
      const botY = y1 - inset;
      const wTop = funnelLerp(widths[index], index + 1 < widths.length ? widths[index + 1] : mouth, y0, y1, topY);
      const wBot = funnelLerp(widths[index], index + 1 < widths.length ? widths[index + 1] : mouth, y0, y1, botY);
      const d = `M${n(cx - wTop / 2)} ${n(topY)} L${n(cx + wTop / 2)} ${n(topY)} L${n(cx + wBot / 2)} ${n(botY)} L${n(cx - wBot / 2)} ${n(botY)} Z`;
      parts.push(openMark("path", "stage", tip, `d="${d}" fill="${color}" stroke="${color}" stroke-width="0.6" stroke-linejoin="bevel"`));
      parts.push("</path>");
      mid = (topY + botY) / 2;
    }
    pushStageLabel(parts, frame, labelX, mid, band, plotLeft, label, valueLine);
  });
  if (legend && items.length) {
    const ink = cssVar("text", frame.preset.text);
    let x = pos === "right" ? frame.width - legendSide : 16;
    let y = pos === "bottom" ? frame.height - 20 : pos === "top" ? (frame.title ? 28 : CHROME_TOP) + (frame.subtitle ? 18 : 0) : top;
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

/** Width at a stage boundary. A small floor keeps a zero from collapsing the hit target. */
function funnelSpan(value: number, max: number, plotW: number): number {
  const floor = plotW <= 0 ? 0 : Math.min(8, Math.max(2, plotW * 0.04));
  return Math.max(floor, (value / max) * plotW);
}

/**
 * Bottom of the last stage. A drop continues partway so the mouth is not a
 * rectangle; a rise or a flat run keeps the last value's width.
 */
function funnelMouth(widths: number[]): number {
  const last = widths[widths.length - 1] ?? 0;
  if (widths.length < 2) return last * 0.62;
  const prev = widths[widths.length - 2];
  if (prev <= last) return last;
  const floor = Math.min(8, last);
  return Math.max(floor, last - (prev - last) * 0.55);
}

/** Explicit `mark.gap` opens a slit. The theme gap stays off so the body stays one piece. */
function funnelGap(frame: Frame): number {
  const gap = frame.mark.gap;
  return typeof gap === "number" && gap > 0 ? Math.min(0.7, gap) : 0;
}

function funnelLerp(from: number, to: number, y0: number, y1: number, y: number): number {
  const span = y1 - y0;
  const t = span ? (y - y0) / span : 0;
  return from + (to - from) * t;
}

function pushStageLabel(parts: string[], frame: Frame, x: number, mid: number, band: number, plotLeft: number, label: string, valueLine: string): void {
  const ink = cssVar("text", frame.preset.text);
  const muted = cssVar("muted", frame.preset.muted);
  if (band >= 32) {
    parts.push(text(x, mid - 6, label, ink, 14, "650"));
    parts.push(text(x, mid + 12, valueLine, muted, 12, "500"));
    return;
  }
  if (band >= 22) {
    parts.push(text(x, mid - 4, label, ink, 12, "650"));
    parts.push(text(x, mid + 9, valueLine, muted, 11, "500"));
    return;
  }
  parts.push(text(x, mid + 4, fit(`${label}  ${valueLine}`, Math.max(24, plotLeft - x - 8), 11), ink, 11, "600"));
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
