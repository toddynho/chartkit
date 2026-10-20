import type { ChartSpec } from "@chartkitdev/core";
import type { ClickDetail, Selection, TooltipRender } from "@chartkitdev/core/interact";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
  class?: string;
  style?: string;
  /** Controlled selection. Omit it and the chart keeps its own. */
  selection?: Selection | null;
  /** Svelte 5 callbacks. Svelte 4 listens with `on:pointclick`, `on:seriesclick`, `on:legendclick`, and `on:selectionchange`. */
  onpointclick?: (detail: ClickDetail) => void;
  onseriesclick?: (detail: ClickDetail) => void;
  onlegendclick?: (detail: ClickDetail) => void;
  onselectionchange?: (detail: Selection) => void;
  /** Replaces the tooltip card. Return HTML, a node, or null to hide it. The spec stays JSON. */
  tooltip?: TooltipRender;
}

/**
 * Legacy Svelte component (`export let`, `$:`) so Svelte 4 and Svelte 5 both compile it.
 * SvelteKit SSR includes the SVG because it is rendered in the template, not in `onMount`.
 */
export class Chart {
  constructor(options: { target: Element; props: ChartProps });
  $set(props: Partial<ChartProps>): void;
  $destroy(): void;
}
