<script>
  import { onMount } from "svelte";
  import { attach, render as renderAll } from "@chartkitdev/core/extra";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset.
   * @type {(spec: import("@chartkitdev/core").ChartSpec) => string}
   */
  export let render = renderAll;

  let host;
  onMount(() => {
    const tip = attach(host);
    return () => tip.destroy();
  });

  $: svg = render(spec);
</script>

<div bind:this={host} class={$$props.class} style={$$props.style}>{@html svg}</div>
