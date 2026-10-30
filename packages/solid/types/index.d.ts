import type { ChartSpec, Diagnostic } from "@chartkitdev/core";
import type { JSX } from "solid-js";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to the core charts. Pass `createRenderer([...])` to draw a subset. The SSR entry draws the rest. */
  render?: (spec: ChartSpec) => string;
  class?: string;
}

/** Solid component. Server HTML includes the SVG. Hydration calls `mount()` from `@chartkitdev/vanilla`. */
export function Chart(props: ChartProps): JSX.Element;

export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

export type RenderChart = (spec: ChartSpec) => string;
