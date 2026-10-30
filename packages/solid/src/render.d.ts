import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

export type RenderChart = (spec: ChartSpec) => string;

export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

/** Validate `spec` and return the SVG string. Warnings do not throw. */
export function renderToSvg(spec: ChartSpec, render?: RenderChart): string;
