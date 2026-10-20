/**
 * Whether a spec should paint marks on canvas.
 * The painter itself lives in `./canvas/hydrate` and is loaded on demand.
 */

export const CANVAS_TYPES = new Set(["line", "stacked-area", "scatter", "bar", "heatmap", "candlestick"]);

/** `render: "auto"` uses canvas once a covered chart has at least this many rows. */
export const CANVAS_AT = 8000;

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
