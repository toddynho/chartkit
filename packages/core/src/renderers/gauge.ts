import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { readFrame, readMetric } from "../frame";
import { arcStroke, closeChart, esc, font, n, openChart, polar } from "../svg";

/**
 * Semicircular gauge. Scale ticks, the value arc, and the needle share one angle.
 * A target stays in the data and on `data-ck-target`; it is not drawn as a dot.
 */
export function renderGauge(spec: Record<string, unknown>): string | null {
  const metric = readMetric(spec);
  if (!metric) return null;
  const frame = readFrame(spec, { width: 240, height: 180 });
  const start = typeof frame.mark.startAngle === "number" ? frame.mark.startAngle : -135;
  let span = (typeof frame.mark.endAngle === "number" ? frame.mark.endAngle : 135) - start;
  if (!Number.isFinite(span) || span === 0) span = 270;
  if (span < 0) span += 360;
  if (span > 360) span = 360;

  const cap = frame.mark.linecap === "round" || frame.mark.linecap === "square" ? frame.mark.linecap : "butt";
  const ratio = clamp01((metric.value - metric.min) / (metric.max - metric.min || 1));
  const valueAngle = start + ratio * span;
  const fitted = fitArc(frame.width, frame.height, frame.title ? 26 : 0, start, span, frame.mark.strokeWidth);
  const { cx, cy, radius, stroke } = fitted;
  const overhang = cap === "butt" ? 0 : (Math.atan2(stroke / 2, radius) * 180) / Math.PI;
  const usable = overhang * 2 < span - 1 ? overhang : 0;
  const trackStart = start + usable;
  const trackEnd = start + span - usable;
  const valueColor = bandColor(metric, frame.preset) ?? cssVar("accent", frame.preset.accent);
  const valueText = formatValue(metric.value, metric.format, frame.locale);
  const readout = placeReadout(cy, radius, stroke, frame.height, Boolean(metric.label));
  const targetAttr = metric.target !== undefined ? ` data-ck-target="${n(metric.target)}"` : "";

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "gauge" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  if (frame.title) {
    parts.push(text(16, 20, frame.title, cssVar("text", frame.preset.text), 15, "650"));
  }

  parts.push(
    `<path data-ck-mark="gauge-track"${targetAttr} d="${arcStroke(cx, cy, radius, trackStart, trackEnd)}" fill="none" stroke="${cssVar("track", frame.preset.track)}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
  );

  const bandStroke = Math.max(2.5, Math.min(4, stroke * 0.16));
  const bandRadius = radius - stroke / 2 - bandStroke / 2 - 4;
  if (bandRadius > Math.max(18, readout.valueSize * 0.9)) {
    for (const band of metric.bands) {
      const from = start + clamp01((band.from - metric.min) / (metric.max - metric.min || 1)) * span;
      const to = start + clamp01((band.to - metric.min) / (metric.max - metric.min || 1)) * span;
      if (to - from < 0.4) continue;
      const color = paint(band.color, frame.preset, 0);
      const name = band.label ? `${band.label} ${band.from}–${band.to}` : `${band.from}–${band.to}`;
      parts.push(
        `<path data-ck-mark="gauge-band" d="${arcStroke(cx, cy, bandRadius, from, to)}" fill="none" stroke="${color}" stroke-width="${n(bandStroke)}" stroke-linecap="butt" stroke-opacity="0.55" aria-label="${esc(name)}"><title>${esc(name)}</title></path>`,
      );
    }
  }

  const valueEnd = valueAngle - usable;
  if (valueEnd - trackStart > 0.4) {
    parts.push(
      `<path data-ck-mark="gauge-value" d="${arcStroke(cx, cy, radius, trackStart, valueEnd)}" fill="none" stroke="${valueColor}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
    );
  } else if (usable > 0 && valueAngle - start > 0.4) {
    parts.push(
      `<path data-ck-mark="gauge-value" d="${arcStroke(cx, cy, radius, start, valueAngle)}" fill="none" stroke="${valueColor}" stroke-width="${n(stroke)}" stroke-linecap="butt" />`,
    );
  }

  const tickCount = 5;
  const tickInner = radius + stroke / 2 + TICK_GAP;
  const tickOuter = tickInner + TICK_LEN;
  const labelR = tickOuter + LABEL_GAP;
  for (let i = 0; i < tickCount; i++) {
    const t = i / (tickCount - 1);
    const angle = start + t * span;
    const inner = polar(cx, cy, tickInner, angle);
    const outer = polar(cx, cy, tickOuter, angle);
    const at = polar(cx, cy, labelR, angle);
    const tickValue = metric.min + t * (metric.max - metric.min);
    parts.push(
      `<line data-ck-mark="gauge-tick" x1="${n(inner.x)}" y1="${n(inner.y)}" x2="${n(outer.x)}" y2="${n(outer.y)}" stroke="${cssVar("muted", frame.preset.muted)}" stroke-width="1.25" />`,
    );
    parts.push(
      text(at.x, at.y, formatValue(tickValue, metric.format, frame.locale), cssVar("muted", frame.preset.muted), 11, "500", "middle", "gauge-tick-label"),
    );
  }

  const tip = polar(cx, cy, radius - stroke / 2, valueAngle);
  parts.push(
    `<line data-ck-mark="gauge-needle" x1="${n(cx)}" y1="${n(cy)}" x2="${n(tip.x)}" y2="${n(tip.y)}" stroke="${valueColor}" stroke-width="${n(Math.max(2, Math.min(3, stroke * 0.12)))}" stroke-linecap="round" />`,
  );
  parts.push(
    `<circle data-ck-mark="gauge-hub" cx="${n(cx)}" cy="${n(cy)}" r="${n(readout.hubR)}" fill="${cssVar("surface", frame.preset.surface)}" stroke="${valueColor}" stroke-width="2" />`,
  );
  parts.push(
    text(cx, readout.valueY, valueText, valueColor, readout.valueSize, "650", "middle", "gauge-readout"),
  );
  if (metric.label) {
    parts.push(
      text(cx, readout.labelY, metric.label, cssVar("muted", frame.preset.muted), readout.labelSize, "500", "middle", "gauge-caption"),
    );
  }
  parts.push(closeChart());
  return parts.join("");
}

function fitArc(
  width: number,
  height: number,
  titleH: number,
  start: number,
  span: number,
  strokeWidth: unknown,
): { cx: number; cy: number; radius: number; stroke: number } {
  const bounds = arcBounds(start, span);
  const spanX = Math.max(0.001, bounds.maxX - bounds.minX);
  const spanY = Math.max(0.001, bounds.maxY - bounds.minY);
  const margin = 6;
  const top = titleH > 0 ? titleH : margin;
  const availW = Math.max(32, width - margin * 2);
  const availH = Math.max(32, height - top - margin);
  const rout = Math.min(availW / spanX, availH / spanY);
  const explicit = typeof strokeWidth === "number" && Number.isFinite(strokeWidth) ? Math.max(2, strokeWidth) : undefined;
  let stroke = explicit ?? 20;
  let radius = rout - outside(stroke);
  if (explicit === undefined) {
    stroke = clampStroke(radius * 0.3);
    radius = rout - outside(stroke);
    stroke = clampStroke(radius * 0.3);
    radius = rout - outside(stroke);
  }
  radius = Math.max(20, radius);
  const boxW = spanX * rout;
  const boxH = spanY * rout;
  const boxLeft = margin + (availW - boxW) / 2;
  const boxTop = top + (availH - boxH) / 2;
  return {
    cx: boxLeft - bounds.minX * rout,
    cy: boxTop - bounds.minY * rout,
    radius,
    stroke,
  };
}

const TICK_GAP = 2;
const TICK_LEN = 7;
const LABEL_GAP = 12;
const LABEL_PAD = 8;

/** Room outside the centerline for the stroke, tick, and label. */
function outside(stroke: number): number {
  return stroke / 2 + TICK_GAP + TICK_LEN + LABEL_GAP + LABEL_PAD;
}

function clampStroke(value: number): number {
  if (!Number.isFinite(value)) return 18;
  return Math.min(32, Math.max(18, value));
}

function arcBounds(start: number, span: number): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const rad = ((start + (span * i) / steps - 90) * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

function placeReadout(
  cy: number,
  radius: number,
  stroke: number,
  height: number,
  hasLabel: boolean,
): { valueY: number; labelY: number; valueSize: number; labelSize: number; hubR: number } {
  const hubR = Math.min(6.5, Math.max(4.5, stroke * 0.24));
  const labelSize = 12;
  const gap = 10;
  let valueSize = Math.round(Math.min(52, Math.max(28, radius * 0.48)));
  let valueY = cy;
  let labelY = cy;
  for (let attempt = 0; attempt < 8; attempt++) {
    const valueHalf = valueSize / 2;
    const labelHalf = hasLabel ? labelSize / 2 : 0;
    valueY = cy + hubR + gap + valueHalf;
    labelY = valueY + valueHalf + gap + labelHalf;
    const bottom = hasLabel ? labelY + labelHalf : valueY + valueHalf;
    if (bottom > height - 4) {
      const shift = bottom - (height - 4);
      valueY -= shift;
      labelY -= shift;
    }
    if (valueY - valueHalf >= cy + hubR + 6) break;
    valueSize = Math.max(18, valueSize - 2);
  }
  return { valueY, labelY, valueSize, labelSize, hubR };
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

function text(
  x: number,
  y: number,
  value: string,
  fill: string,
  size: number,
  weight: string,
  anchor = "start",
  mark?: string,
): string {
  const tagged = mark ? ` data-ck-mark="${mark}"` : "";
  return `<text${tagged} x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" dominant-baseline="middle" fill="${fill}" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
}
