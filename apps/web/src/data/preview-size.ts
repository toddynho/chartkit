/**
 * Playground preview size for each chart type.
 * Card is the default stage. Dashboard and Full scale it.
 * A numeric size.width, size.height, or size.aspectRatio on the spec wins.
 * Chart docs pages mount the spec and let each renderer pick its own fallback,
 * then the column CSS scales the SVG. The donut teaching page is the exception:
 * withPreviewSize applies this card default when the spec sets no size.
 */

export type PreviewPreset = "card" | "dashboard" | "full";

export type PreviewDefault = {
  width: number;
  /** Omit when the renderer should keep its natural height (rows, tasks, events). */
  height?: number;
  minHeight?: number;
};

export const PREVIEW_PRESET_SCALE: Record<PreviewPreset, number> = {
  card: 1,
  dashboard: 1.2,
  full: 1.45,
};

/** Sized so a 1440px playground can show the plot without crushing labels. */
export const PREVIEW_SIZE: Record<string, PreviewDefault> = {
  line: { width: 680, height: 320 },
  bar: { width: 680, height: 360 },
  pie: { width: 480, height: 420 },
  donut: { width: 480, height: 420 },
  "stacked-area": { width: 680, height: 340 },
  streamgraph: { width: 720, height: 380 },
  scatter: { width: 720, height: 480 },
  combo: { width: 700, height: 360 },
  heatmap: { width: 720, height: 440 },
  gauge: { width: 280, height: 200 },
  kpi: { width: 320, height: 160 },
  sparkline: { width: 280, height: 56 },
  "mini-area": { width: 280, height: 72 },
  "progress-ring": { width: 220, height: 220 },
  spike: { width: 680, height: 220 },
  candlestick: { width: 720, height: 400 },
  histogram: { width: 680, height: 380 },
  density: { width: 680, height: 380 },
  boxplot: { width: 680, height: 400 },
  strip: { width: 700, height: 380 },
  radar: { width: 560, height: 520 },
  funnel: { width: 520, height: 440 },
  treemap: { width: 720, height: 520 },
  tree: { width: 720, height: 480 },
  sankey: { width: 720, height: 460 },
  bullet: { width: 680, height: 200 },
  waterfall: { width: 700, height: 400 },
  "area-range": { width: 680, height: 340 },
  "bar-range": { width: 680, height: 360 },
  errorbar: { width: 680, height: 360 },
  gantt: { width: 720, minHeight: 280 },
  timeline: { width: 720, minHeight: 280 },
  quadrant: { width: 720, height: 600 },
  venn: { width: 640, height: 480 },
  journey: { width: 720, minHeight: 320 },
  "radial-bar": { width: 560, height: 520 },
  rose: { width: 560, height: 520 },
  sunburst: { width: 640, height: 560 },
  "bar-list": { width: 480, minHeight: 160 },
  choropleth: { width: 720, height: 460 },
  "map-points": { width: 720, height: 460 },
};

const FALLBACK: PreviewDefault = { width: 640, height: 360 };

export type ExplicitSize = {
  width?: number;
  height?: number;
  aspectRatio?: number;
  minHeight?: number;
};

export function readExplicitSize(spec: { size?: unknown }): ExplicitSize {
  const size = spec.size;
  if (!size || typeof size !== "object" || Array.isArray(size)) return {};
  const record = size as Record<string, unknown>;
  return {
    width: typeof record.width === "number" ? record.width : undefined,
    height: typeof record.height === "number" ? record.height : undefined,
    aspectRatio: typeof record.aspectRatio === "number" && record.aspectRatio > 0 ? record.aspectRatio : undefined,
    minHeight: typeof record.minHeight === "number" ? record.minHeight : undefined,
  };
}

export type PreviewBox = { width: number; height?: number; minHeight?: number };

/** Pixel size for the preview render. Zoom is applied by the caller, on top. */
export function previewSize(type: string, preset: PreviewPreset, spec: { size?: unknown }): PreviewBox {
  const base = PREVIEW_SIZE[type] ?? FALLBACK;
  const scale = PREVIEW_PRESET_SCALE[preset];
  const explicit = readExplicitSize(spec);
  const width = explicit.width ?? Math.round(base.width * scale);
  let height = explicit.height;
  if (height == null && explicit.aspectRatio) height = Math.max(1, Math.round(width / explicit.aspectRatio));
  if (height == null && base.height != null) height = Math.round(base.height * scale);
  const minHeight = explicit.minHeight ?? (explicit.height == null ? base.minHeight : undefined);
  if (height != null && minHeight != null && minHeight > height) height = Math.round(minHeight);
  return minHeight != null ? { width, height, minHeight } : { width, height };
}

/**
 * Copy a spec for a docs preview.
 * A numeric size on the spec wins. Otherwise the card default for that type is written
 * onto the copy. The caller's spec is left unchanged.
 */
export function withPreviewSize(spec: Record<string, unknown>): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  const box = previewSize(type, "card", spec);
  const next = structuredClone(spec);
  const current = next.size;
  const size: Record<string, unknown> =
    current && typeof current === "object" && !Array.isArray(current) ? { ...(current as Record<string, unknown>) } : {};
  size.width = box.width;
  if (box.height != null) size.height = box.height;
  if (box.minHeight != null) size.minHeight = box.minHeight;
  next.size = size;
  return next;
}

/** Drop inherited width, height, and aspect so a type change can use the new default. */
export function stripPreviewSize(spec: Record<string, unknown>): void {
  const size = spec.size;
  if (!size || typeof size !== "object" || Array.isArray(size)) return;
  const record = size as Record<string, unknown>;
  delete record.width;
  delete record.height;
  delete record.aspectRatio;
  if (!Object.keys(record).length) delete spec.size;
}
