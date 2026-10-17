import { computed, defineComponent, h, type PropType } from "vue";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";

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
    const svg = computed(() => (props.render ?? renderAll)(props.spec));
    return () => h("div", { ...attrs, innerHTML: svg.value });
  },
});
