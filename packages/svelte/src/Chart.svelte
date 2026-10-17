<script>
  import { render as renderAll } from "@chartkitdev/core/all";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset.
   * @type {(spec: import("@chartkitdev/core").ChartSpec) => string}
   */
  export let render = renderAll;

  $: svg = render(spec);
</script>

<div class={$$props.class} style={$$props.style}>{@html svg}</div>
