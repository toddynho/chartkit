<script>
  import { onMount } from "svelte";
  import { open, render as renderAll } from "@chartkitdev/core/all";
  import { attach, patchSvg } from "@chartkitdev/core/interact";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to the core charts. Pass `createRenderer([...])` to ship a subset.
   * The SSR entry passes a renderer that already includes histogram through waterfall.
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
  $: if (host && render === renderAll) open(host, spec);

  onMount(() => {
    if (render === renderAll && open(host, spec)) return;
    if (!host.querySelector("svg")) patchSvg(host, markup);
    ctl = attach(host, spec, { render: (next) => render(/** @type {import("@chartkitdev/core").ChartSpec} */ (next)) });
    ready = true;
    return () => ctl?.destroy();
  });
</script>

<div bind:this={host} class={$$props.class} style={$$props.style}>{@html shown}</div>
