<script>
  import { onMount } from "svelte";
  import { render as renderAll } from "@chartkitdev/core/extra";
  import { attach, patchSvg } from "@chartkitdev/core/interact";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset.
   * @type {(spec: import("@chartkitdev/core").ChartSpec) => string}
   */
  export let render = renderAll;

  /** @type {HTMLDivElement} */
  let host;
  let shown = "";
  let ready = false;
  /** @type {import("@chartkitdev/core/interact").Controller | undefined} */
  let ctl;

  $: markup = render(spec);
  $: if (!ready) shown = markup;
  $: if (ready && host && ctl) ctl.update(spec, markup);

  onMount(() => {
    if (!host.querySelector("svg")) patchSvg(host, markup);
    ctl = attach(host, spec, { render: (next) => render(/** @type {import("@chartkitdev/core").ChartSpec} */ (next)) });
    ready = true;
    return () => ctl?.destroy();
  });
</script>

<div bind:this={host} class={$$props.class} style={$$props.style}>{@html shown}</div>
