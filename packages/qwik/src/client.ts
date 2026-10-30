import type { ChartSpec } from "@chartkitdev/core";
import { mount, type MountedChart } from "@chartkitdev/vanilla";

/**
 * Attach `mount()` from `@chartkitdev/vanilla` to a host that already contains the server SVG.
 * The Qwik component calls this from a visible task.
 */
export function hydrate(el: HTMLElement, spec: ChartSpec): MountedChart {
  return mount(el, spec);
}
