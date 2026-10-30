import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { ChartSpec } from "@chartkitdev/core";
import { hydrate } from "./client";
import { renderToSvg } from "./render.js";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  class?: string;
}

/**
 * Qwik component. The server render prints static SVG.
 * A visible task then calls `mount()` from `@chartkitdev/vanilla` on that node.
 */
export const Chart = component$<ChartProps>((props) => {
  const host = useSignal<HTMLElement>();
  const svg = renderToSvg(props.spec);

  // The chart has to take pointers after it is on screen. useVisibleTask$ is that boundary.
  useVisibleTask$(({ cleanup, track }) => {
    const spec = track(() => props.spec);
    const el = host.value;
    if (!el) return;
    const chart = hydrate(el, spec);
    cleanup(() => chart.destroy());
  });

  return <div ref={host} class={props.class} dangerouslySetInnerHTML={svg} />;
});
