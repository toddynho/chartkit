import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { readFrame, readMetric } from "../frame";
import { arcStroke, closeChart, esc, font, n, openChart, polar } from "../svg";

/** Semicircular gauge for metric.value, with optional bands and a target marker. */
export function renderGauge(spec: Record<string, unknown>): string | null {
  const metric = readMetric(spec);
  if (!metric) return null;
  const frame = readFrame(spec, { width: 240, height: 180 });
  const start = typeof frame.mark.startAngle === "number" ? frame.mark.startAngle : -135;
  const end = typeof frame.mark.endAngle === "number" ? frame.mark.endAngle : 135;
  const stroke = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : 14;
  const cap = frame.mark.linecap === "butt" || frame.mark.linecap === "square" ? frame.mark.linecap : "round";
  const span = end - start || 1;
  const ratio = clamp01((metric.value - metric.min) / (metric.max - metric.min || 1));
  const valueAngle = start + ratio * span;
  const cx = frame.width / 2;
  const cy = frame.height * 0.58;
  const radius = Math.max(24, Math.min(frame.width, frame.height) * 0.36);
  const valueColor = bandColor(metric, frame.preset) ?? paint(undefined, frame.preset, 0);
  const track = cssVar("track", frame.preset.track);
  const valueText = formatValue(metric.value, metric.format, frame.locale);

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "gauge" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  if (frame.title) {
    parts.push(text(16, 20, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  }
  parts.push(
    `<path d="${arcStroke(cx, cy, radius, start, end)}" fill="none" stroke="${track}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
  );
  for (const band of metric.bands) {
    const from = start + clamp01((band.from - metric.min) / (metric.max - metric.min || 1)) * span;
    const to = start + clamp01((band.to - metric.min) / (metric.max - metric.min || 1)) * span;
    if (to <= from) continue;
    const color = paint(band.color, frame.preset, 0);
    const name = band.label ? `${band.label} ${band.from}–${band.to}` : `${band.from}–${band.to}`;
    parts.push(
      `<path d="${arcStroke(cx, cy, radius, from, to)}" fill="none" stroke="${color}" stroke-width="${n(stroke)}" stroke-linecap="butt" stroke-opacity="0.35" aria-label="${esc(name)}"><title>${esc(name)}</title></path>`,
    );
  }
  if (valueAngle > start) {
    parts.push(
      `<path d="${arcStroke(cx, cy, radius, start, valueAngle)}" fill="none" stroke="${valueColor}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
    );
  }

  const tickCount = 5;
  for (let i = 0; i < tickCount; i++) {
    const t = i / (tickCount - 1);
    const angle = start + t * span;
    const inner = polar(cx, cy, radius - stroke / 2 - 4, angle);
    const outer = polar(cx, cy, radius + stroke / 2 + 2, angle);
    const at = polar(cx, cy, radius + stroke / 2 + 14, angle);
    const tickValue = metric.min + t * (metric.max - metric.min);
    parts.push(
      `<line x1="${n(inner.x)}" y1="${n(inner.y)}" x2="${n(outer.x)}" y2="${n(outer.y)}" stroke="${cssVar("muted", frame.preset.muted)}" stroke-width="1.5" />`,
    );
    parts.push(text(at.x, at.y + 3, formatValue(tickValue, metric.format, frame.locale), cssVar("muted", frame.preset.muted), 10, "400", "middle"));
  }

  if (metric.target !== undefined) {
    const t = clamp01((metric.target - metric.min) / (metric.max - metric.min || 1));
    const at = polar(cx, cy, radius, start + t * span);
    const name = `Target ${formatValue(metric.target, metric.format, frame.locale)}`;
    parts.push(
      `<circle cx="${n(at.x)}" cy="${n(at.y)}" r="5" fill="${cssVar("surface", frame.preset.surface)}" stroke="${cssVar("accent", frame.preset.accent)}" stroke-width="2" aria-label="${esc(name)}"><title>${esc(name)}</title></circle>`,
    );
  }

  const needle = polar(cx, cy, radius - stroke / 2 - 8, valueAngle);
  parts.push(
    `<line x1="${n(cx)}" y1="${n(cy)}" x2="${n(needle.x)}" y2="${n(needle.y)}" stroke="${valueColor}" stroke-width="3" stroke-linecap="round" />`,
  );
  parts.push(
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="6" fill="${cssVar("surface", frame.preset.surface)}" stroke="${valueColor}" stroke-width="3" />`,
  );
  parts.push(text(cx, cy + radius * 0.42, valueText, valueColor, Math.max(16, Math.round(frame.width * 0.09)), "700", "middle"));
  if (metric.label) {
    parts.push(text(cx, cy + radius * 0.42 + 16, metric.label, cssVar("muted", frame.preset.muted), 12, "500", "middle"));
  }
  parts.push(closeChart());
  return parts.join("");
}

function bandColor(
  metric: NonNullable<ReturnType<typeof readMetric>>,
  preset: ReturnType<typeof readFrame>["preset"],
): string | undefined {
  const band = metric.bands.find((item) => metric.value >= item.from && metric.value <= item.to);
  return band ? paint(band.color, preset, 0) : undefined;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" dominant-baseline="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
