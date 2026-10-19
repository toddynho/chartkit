import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch, withDirectives, type Directive, type PropType } from "vue";
import type { ChartSpec } from "@chartkitdev/core";
import { open, render as renderAll } from "@chartkitdev/core/all";
import { attach, listen, patchSvg, type ClickDetail, type Controller, type Selection } from "@chartkitdev/core/interact";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
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
 * A core chart renders during setup and patches in place.
 * Histogram through waterfall go through `open`, which loads `@chartkitdev/core/load`.
 */
export const Chart = defineComponent({
  name: "Chart",
  inheritAttrs: false,
  props: {
    spec: { type: Object as PropType<ChartSpec>, required: true },
    render: { type: Function as PropType<(spec: ChartSpec) => string> },
    selection: { type: Object as PropType<Selection | null>, default: undefined },
  },
  emits: ["pointclick", "seriesclick", "legendclick", "selectionchange"],
  setup(props, { attrs, emit }) {
    const svg = computed(() => (props.render ?? renderAll)(props.spec));
    const host = ref<HTMLElement | null>(null);
    let ctl: Controller | undefined;
    let stop = () => {};
    const draw = (spec: ChartSpec) => (props.render ?? renderAll)(spec);
    const relay = (name: "pointclick" | "seriesclick" | "legendclick" | "selectionchange") => (detail: ClickDetail | Selection) => emit(name, detail);

    watch(svg, (markup) => {
      const el = host.value;
      if (!el || !ctl) return;
      ctl.update(props.spec, markup);
    });

    watch(
      () => props.selection,
      (selection) => {
        if (selection !== undefined) ctl?.setSelection(selection);
      },
    );

    watch(
      () => props.spec,
      (spec) => {
        const el = host.value;
        if (el && !props.render && open(el, spec)) ctl?.destroy();
      },
    );

    onMounted(() => {
      const el = host.value;
      if (!el || (!props.render && open(el, props.spec))) return;
      if (!el.querySelector("svg")) patchSvg(el, svg.value);
      ctl = attach(el, props.spec, { render: (next) => draw(next as ChartSpec), selection: props.selection });
      stop = listen(el, {
        pointclick: relay("pointclick"),
        seriesclick: relay("seriesclick"),
        legendclick: relay("legendclick"),
        selectionchange: relay("selectionchange"),
      });
    });

    onBeforeUnmount(() => {
      stop();
      ctl?.destroy();
      ctl = undefined;
    });

    return () => withDirectives(h("div", { ...attrs, ref: host }), [[paint, svg.value]]);
  },
});
