import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch, withDirectives, type Directive, type PropType } from "vue";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";
import { attach, patchSvg, type Controller } from "@chartkitdev/core/interact";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

/** SSR prints the SVG. The client patches later specs into that same node. */
const paint: Directive<HTMLElement, string> = {
  getSSRProps(binding) {
    return { innerHTML: binding.value };
  },
  mounted(el, binding) {
    if (!el.querySelector("svg")) el.innerHTML = binding.value;
  },
};

/**
 * Thin Vue 3 wrapper over `@chartkitdev/core/all`.
 * The SVG is produced during render, so Vue SSR includes it. A spec change
 * patches the existing SVG. Unmount drops the node and the interaction listeners.
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
    const host = ref<HTMLElement | null>(null);
    let ctl: Controller | undefined;
    const draw = (spec: ChartSpec) => (props.render ?? renderAll)(spec);

    watch(svg, (markup) => {
      const el = host.value;
      if (!el || !ctl) return;
      ctl.update(props.spec, markup);
    });

    onMounted(() => {
      const el = host.value;
      if (!el) return;
      if (!el.querySelector("svg")) patchSvg(el, svg.value);
      ctl = attach(el, props.spec, { render: (next) => draw(next as ChartSpec) });
    });

    onBeforeUnmount(() => {
      ctl?.destroy();
      ctl = undefined;
    });

    return () => withDirectives(h("div", { ...attrs, ref: host }), [[paint, svg.value]]);
  },
});
