import type { ChartSpec } from "@chartkitdev/core";

/** A v1 chart spec. The same object renders in every ChartKit adapter. */
export interface ChartProps {
  spec: ChartSpec;
  /** Defaults to the core charts. Pass `createRenderer([...])`, or the SSR entry, to draw more. */
  render?: (spec: ChartSpec) => string;
  class?: string;
}

export function paint(spec: ChartSpec, render?: (spec: ChartSpec) => string): string;
