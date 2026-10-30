import type { ChartSpec } from "@chartkitdev/core";
import type { RenderChart } from "./render.js";

export { ChartKitSpecError } from "./render.js";

/** Validate `spec` and return the SVG string. Histogram through rose and bar-list are included. */
export function renderToString(spec: ChartSpec, render?: RenderChart): string;
