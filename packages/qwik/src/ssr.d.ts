import type { ChartSpec } from "@chartkitdev/core";
import type { RenderChart } from "./render.js";

export { ChartKitSpecError } from "./render.js";

/** Validate `spec` and return the SVG string the component prints. */
export function renderToString(spec: ChartSpec, render?: RenderChart): string;
