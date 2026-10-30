import { createEffect, on, onCleanup, onMount } from "solid-js";
import { mount, type MountedChart } from "@chartkitdev/vanilla";
import { paint, type ChartProps } from "./paint.js";

export type { ChartProps };

/**
 * Solid component. The server HTML includes the SVG for a core chart.
 * After hydration, `mount()` from `@chartkitdev/vanilla` attaches to that node.
 */
export function Chart(props: ChartProps) {
  let host: HTMLDivElement | undefined;
  let chart: MountedChart | undefined;

  onMount(() => {
    const el = host;
    if (!el) return;
    chart = mount(el, props.spec, props.render ? { render: props.render } : undefined);
    onCleanup(() => {
      chart?.destroy();
      chart = undefined;
    });
  });

  createEffect(
    on(
      () => props.spec,
      (spec, prev) => {
        if (!prev || !chart) return;
        chart.update(spec);
      },
    ),
  );

  return <div ref={host} class={props.class} innerHTML={paint(props.spec, props.render)} />;
}
