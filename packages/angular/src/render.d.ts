import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

export type RenderChart = (spec: ChartSpec) => string;

export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

export function renderToSvg(spec: ChartSpec, render?: RenderChart): string;
