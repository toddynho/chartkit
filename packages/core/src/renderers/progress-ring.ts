import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { readColor, readFrame, readMetric } from "../frame";
import { arcStroke, closeChart, esc, font, n, openChart } from "../svg";

/** Circular progress from metric.value between metric.min and metric.max. */
export function renderProgressRing(spec: Record<string, unknown>): string | null {
  const metric = readMetric(spec);
  if (!metric) return null;
  const frame = readFrame(spec, { width: 160, height: 160 });
  const start = typeof frame.mark.startAngle === "number" ? frame.mark.startAngle : 0;
  const end = typeof frame.mark.endAngle === "number" ? frame.mark.endAngle : 360;
  const stroke = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : 8;
  const cap = frame.mark.linecap === "butt" || frame.mark.linecap === "square" ? frame.mark.linecap : "round";
  const span = end - start || 360;
  const ratio = clamp01((metric.value - metric.min) / (metric.max - metric.min || 1));
  const colorEnc = readColor(frame.encoding.color);
  const color = paint(colorEnc?.constant ?? colorEnc?.range?.[0], frame.preset, 0);
  const cx = frame.width / 2;
  const cy = frame.height / 2;
  const radius = Math.max(12, Math.min(frame.width, frame.height) / 2 - stroke - 4);
  const shown = metric.format
    ? formatValue(metric.value, metric.format, frame.locale)
    : formatValue(ratio, "percent", frame.locale);

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "progress-ring" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  parts.push(
    `<path d="${arcStroke(cx, cy, radius, start, end)}" fill="none" stroke="${cssVar("track", frame.preset.grid)}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
  );
  if (ratio > 0) {
    parts.push(
      `<path d="${arcStroke(cx, cy, radius, start, start + span * ratio)}" fill="none" stroke="${color}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
    );
  }
  parts.push(
    `<text x="${n(cx)}" y="${n(metric.label ? cy - 2 : cy)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="${n(Math.max(14, radius * 0.42))}" font-weight="700" font-family="${font()}">${esc(shown)}</text>`,
  );
  if (metric.label) {
    parts.push(
      `<text x="${n(cx)}" y="${n(cy + radius * 0.38)}" text-anchor="middle" fill="${cssVar("muted", frame.preset.muted)}" font-size="11" font-family="${font()}">${esc(metric.label)}</text>`,
    );
  }
  parts.push(closeChart());
  return parts.join("");
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
