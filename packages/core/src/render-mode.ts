/**
 * Whether a spec should paint marks on canvas.
 * The painter itself lives in `./canvas/hydrate` and is loaded on demand.
 */

export const CANVAS_TYPES = new Set(["line", "stacked-area", "scatter", "bar", "heatmap", "candlestick"]);

/**
 * `render: "auto"` uses canvas once a covered chart has at least this many rows.
 * Measured on a sampled line, fresh Chromium page, median of 5.
 * SVG is faster on first paint at 10k (17.7 vs 29.3), 100k (15.7 vs 25.4), and 1M (20.2 vs 31.3).
 * Canvas is faster on the update at 10k (27.7 vs 33.2) and 100k (25.9 vs 28.7), and slower at 1M (26.3 vs 23.5).
 * There is no first-paint crossover in that range. 100_000 keeps 10k on SVG and switches where the update is faster.
 */
export const CANVAS_AT = 100_000;

export type RenderMode = "svg" | "canvas" | "auto";

export function readRender(value: unknown): RenderMode {
  if (value === "canvas" || value === "auto" || value === "svg") return value;
  return "svg";
}

/** Row count of an array or a columnar table. Typed arrays count by `.length`. */
export function pointCount(data: unknown): number {
  if (Array.isArray(data) || ArrayBuffer.isView(data)) return (data as ArrayLike<unknown>).length;
  if (!data || typeof data !== "object") return 0;
  const columns = (data as { columns?: unknown }).columns;
  if (!columns || typeof columns !== "object") return 0;
  let n = 0;
  for (const value of Object.values(columns as Record<string, unknown>)) {
    if (value && typeof (value as ArrayLike<unknown>).length === "number") n = Math.max(n, (value as ArrayLike<unknown>).length);
  }
  return n;
}

export function canvasWanted(spec: { type?: unknown; render?: unknown; data?: unknown }): boolean {
  const mode = readRender(spec.render);
  if (mode === "svg") return false;
  const type = typeof spec.type === "string" ? spec.type : "";
  if (!CANVAS_TYPES.has(type)) return false;
  if (mode === "canvas") return true;
  return pointCount(spec.data) >= CANVAS_AT;
}
