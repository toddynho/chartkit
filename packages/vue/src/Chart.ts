import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from "vue";
import type { ChartRenderer, ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

async function ensure(type: string): Promise<void> {
  if (!isExtra(type)) return;
  const mod = (await import("@chartkitdev/core/load")) as { load(type: string): Promise<ChartRenderer | undefined> };
  const chart = await mod.load(type);
  if (chart) adopt(chart);
}

/**
 * Thin Vue 3 wrapper over `@chartkitdev/core/all`.
 * A line, bar, or other core chart renders during setup, including on the server.
 * Histogram through waterfall load `@chartkitdev/core/charts/<type>` when the spec asks for one.
 * The SSR entry imports those charts up front and passes `render`.
 */
export const Chart = defineComponent({
  name: "Chart",
  inheritAttrs: false,
  props: {
    spec: { type: Object as PropType<ChartSpec>, required: true },
    render: { type: Function as PropType<(spec: ChartSpec) => string> },
  },
  setup(props, { attrs }) {
    const el = ref<HTMLElement>();
    const extraSvg = ref("");
    let tip: { destroy(): void } | undefined;
    let token = 0;
    const svg = computed(() => {
      if (props.render) return props.render(props.spec);
      if (isExtra(props.spec.type)) return extraSvg.value;
      return renderAll(props.spec);
    });
    watch(
      () => props.spec,
      (spec) => {
        if (props.render || !isExtra(spec.type)) return;
        const current = ++token;
        void (async () => {
          await ensure(spec.type);
          if (current !== token) return;
          extraSvg.value = renderAll(spec);
          if (!tip && el.value) {
            const { attach } = await import("@chartkitdev/core/extra-tip");
            if (current === token && el.value) tip = attach(el.value);
          }
        })();
      },
      { immediate: true },
    );
    onBeforeUnmount(() => {
      token += 1;
      tip?.destroy();
    });
    return () => h("div", { ...attrs, ref: el, innerHTML: svg.value });
  },
});
