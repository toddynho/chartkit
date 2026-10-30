import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /**
   * Opt in to pointer interaction.
   * Default false: static SVG, no client script.
   * True hydrates that SVG with `mount()` from `@chartkitdev/vanilla`.
   */
  client?: boolean;
  /** Defaults to core, extra, and bar-list. Pass `createRenderer([...])` to draw a subset at build time. */
  render?: (spec: ChartSpec) => string;
  class?: string;
}

/**
 * Astro component. The default render is static SVG.
 * Astro's `client:*` directives do not apply to `.astro` components, so interactivity is the `client` prop.
 */
export const Chart: (props: ChartProps) => unknown;

export { renderToString, ChartKitSpecError } from "./render.js";
export type { RenderChart } from "./render.js";

export type { Diagnostic };
