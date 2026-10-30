import type { ChartSpec } from "@chartkitdev/core";
import type { Component } from "@builder.io/qwik";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  class?: string;
}

/** Static SVG, then `mount()` from `@chartkitdev/vanilla` in a visible task. */
export const Chart: Component<ChartProps>;

export { ChartKitSpecError, renderToSvg } from "./render.js";
export type { RenderChart } from "./render.js";
