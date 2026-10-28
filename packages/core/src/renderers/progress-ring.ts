import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { readColor, readFrame, readMetric } from "../frame";
import { arcStroke, closeChart, esc, font, isRecord, n, openChart } from "../svg";

interface Ring {
  value: number;
  max: number;
  color?: string;
  label?: string;
}

/** Circular progress from metric.value, or concentric mark.rings. */
export function renderProgressRing(spec: Record<string, unknown>): string | null {
  const metric = readMetric(spec);
  if (!metric) return null;
  const frame = readFrame(spec, { width: 160, height: 160 });
  const rings = readRings(frame.mark);
  if (rings) return renderRings(frame, metric, rings);
  return renderOne(frame, metric);
}

function renderOne(
  frame: ReturnType<typeof readFrame>,
  metric: NonNullable<ReturnType<typeof readMetric>>,
): string {
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
    `<path d="${arcStroke(cx, cy, radius, start, end)}" fill="none" stroke="${cssVar("track", frame.preset.track)}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
  );
  if (ratio > 0) {
    parts.push(
      `<path d="${arcStroke(cx, cy, radius, start, start + span * ratio)}" fill="none" stroke="${color}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
    );
  }
  parts.push(
    `<text x="${n(cx)}" y="${n(metric.label ? cy - 2 : cy)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="${n(Math.max(14, radius * 0.42))}" font-weight="700">${esc(shown)}</text>`,
  );
  if (metric.label) {
    parts.push(
      `<text x="${n(cx)}" y="${n(cy + radius * 0.38)}" text-anchor="middle" fill="${cssVar("muted", frame.preset.muted)}" font-size="11">${esc(metric.label)}</text>`,
    );
  }
  parts.push(closeChart());
  return parts.join("");
}

function renderRings(
  frame: ReturnType<typeof readFrame>,
  metric: NonNullable<ReturnType<typeof readMetric>>,
  rings: Ring[],
): string {
  const start = typeof frame.mark.startAngle === "number" ? frame.mark.startAngle : 0;
  const end = typeof frame.mark.endAngle === "number" ? frame.mark.endAngle : 360;
  const cap = frame.mark.linecap === "butt" || frame.mark.linecap === "square" ? frame.mark.linecap : "round";
  const span = end - start || 360;
  const labeled = rings.some((ring) => ring.label);
  const legendH = labeled ? 16 + rings.length * 14 : 0;
  const box = Math.max(48, Math.min(frame.width, frame.height - legendH) - 12);
  const gap = 4;
  const fitted = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : Math.min(16, Math.max(7, (box * 0.34) / rings.length));
  const stroke = Math.max(4, fitted);
  const outer = box / 2 - stroke / 2;
  const cx = frame.width / 2;
  const cy = (frame.height - legendH) / 2;
  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "progress-ring" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  rings.forEach((ring, index) => {
    const radius = outer - index * (stroke + gap);
    if (radius < stroke) return;
    const ratio = clamp01(ring.value / ring.max);
    const color = paint(ring.color, frame.preset, index);
    const name = ring.label ? `${ring.label} ${shown(ring)} of ${shown({ value: ring.max })}` : `${shown(ring)} of ${shown({ value: ring.max })}`;
    parts.push(`<g data-ck-mark="ring" data-ck-ring="${index}" data-ck-radius="${n(radius)}" aria-label="${esc(name)}">`);
    parts.push(
      `<path d="${arcStroke(cx, cy, radius, start, end)}" fill="none" stroke="${cssVar("track", frame.preset.track)}" stroke-width="${n(stroke)}" stroke-linecap="${cap}" />`,
    );
    if (ratio > 0) {
      parts.push(
        `<path d="${arcStroke(cx, cy, radius, start, start + span * ratio)}" fill="none" stroke="${color}" stroke-width="${n(stroke)}" stroke-linecap="${cap}"><title>${esc(name)}</title></path>`,
      );
    }
    parts.push(`</g>`);
    if (ring.label) {
      const y = frame.height - legendH + 14 + index * 14;
      parts.push(
        `<text x="${n(cx)}" y="${n(y)}" text-anchor="middle" fill="${color}" font-size="12">${esc(`${ring.label} ${shown(ring)}`)}</text>`,
      );
    }
  });
  if (!labeled && metric.label) {
    parts.push(
      `<text x="${n(cx)}" y="${n(cy)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", frame.preset.text)}" font-size="13" font-weight="650">${esc(metric.label)}</text>`,
    );
  }
  parts.push(closeChart());
  return parts.join("");
}

function readRings(mark: Record<string, unknown>): Ring[] | null {
  if (!Array.isArray(mark.rings) || mark.rings.length < 1 || mark.rings.length > 8) return null;
  const rings: Ring[] = [];
  for (const item of mark.rings) {
    if (!isRecord(item) || typeof item.value !== "number" || !Number.isFinite(item.value) || item.value < 0) return null;
    if (item.max !== undefined && (typeof item.max !== "number" || !Number.isFinite(item.max) || item.max <= 0)) return null;
    if (item.color !== undefined && typeof item.color !== "string") return null;
    if (item.label !== undefined && typeof item.label !== "string") return null;
    rings.push({
      value: item.value,
      max: typeof item.max === "number" ? item.max : 1,
      color: typeof item.color === "string" ? item.color : undefined,
      label: typeof item.label === "string" ? item.label : undefined,
    });
  }
  return rings;
}

function shown(ring: { value: number }): string {
  return Number.isInteger(ring.value) ? String(ring.value) : String(Math.round(ring.value * 10) / 10);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
