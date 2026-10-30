import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

/** Build-time renderer. Pass one from `createRenderer` to draw a subset. */
export type RenderChart = (spec: ChartSpec) => string;

/** Thrown when `validate()` reports errors. The build should fail. */
export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

/**
 * Validate `spec` and return the SVG string.
 * Histogram through rose, the planning charts, and bar-list are included.
 * Warnings do not throw.
 */
export function renderToString(spec: ChartSpec, render?: RenderChart): string;
