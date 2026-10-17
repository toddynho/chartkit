import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import type { ChartSpec } from "@chartkitdev/core";
import { attach, render as renderAll } from "@chartkitdev/core/extra";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

/**
 * Thin Vue 3 wrapper over `@chartkitdev/core/all`.
 * The SVG is produced during render, so Vue SSR includes it. A spec change
 * recomputes that string and replaces the element's HTML. Unmount drops the node.
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
    let tip: { destroy(): void } | undefined;
    const svg = computed(() => (props.render ?? renderAll)(props.spec));
    onMounted(() => {
      if (el.value) tip = attach(el.value);
    });
    onBeforeUnmount(() => tip?.destroy());
    return () => h("div", { ...attrs, ref: el, innerHTML: svg.value });
  },
});
