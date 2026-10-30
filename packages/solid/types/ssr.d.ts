import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

export type RenderChart = (spec: ChartSpec) => string;

export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

/** Solid SSR HTML. Histogram through rose and bar-list are in the string. */
export function renderToString(spec: ChartSpec, render?: RenderChart): string;

/** Validate `spec` and return the SVG string. */
export function renderToSvg(spec: ChartSpec, render?: RenderChart): string;
