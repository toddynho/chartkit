<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { open, render as renderAll } from "@chartkitdev/core/all";
  import { attach, listen, patchSvg } from "@chartkitdev/core/interact";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to the core charts. Pass `createRenderer([...])` to ship a subset.
   * The SSR entry passes a renderer that already includes histogram through waterfall.
   * @type {(spec: import("@chartkitdev/core").ChartSpec) => string}
   */
  export let render = renderAll;

  /** Controlled selection. Omit it and the chart keeps its own. */
  export let selection = undefined;

  /** Svelte 5 callback props. Svelte 4 still listens with `on:pointclick` and the other event names. */
  export let onpointclick = undefined;
  export let onseriesclick = undefined;
  export let onlegendclick = undefined;
  export let onselectionchange = undefined;

  const dispatch = createEventDispatcher();

  /** @type {HTMLDivElement} */
  let host;
  let shown = "";
  let ready = false;
  /** @type {import("@chartkitdev/core/interact").Controller | undefined} */
  let ctl;
  /** @type {Element | null} */
  let bound = null;
  let unlist = () => {};
  let listening = false;

  function arm(next) {
    if (!host) return;
    const svg = host.querySelector("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    if (ctl && svg === bound) {
      ctl.update(next, render(next));
      return;
    }
    ctl?.destroy();
    ctl = attach(host, next, { render: (value) => render(/** @type {import("@chartkitdev/core").ChartSpec} */ (value)), selection });
    bound = svg;
    if (!listening) {
      unlist = listen(host, {
        pointclick: (detail) => {
          onpointclick?.(detail);
          dispatch("pointclick", detail);
        },
        seriesclick: (detail) => {
          onseriesclick?.(detail);
          dispatch("seriesclick", detail);
        },
        legendclick: (detail) => {
          onlegendclick?.(detail);
          dispatch("legendclick", detail);
        },
        selectionchange: (detail) => {
          onselectionchange?.(detail);
          dispatch("selectionchange", detail);
        },
      });
      listening = true;
    }
  }

  $: markup = render(spec);
  $: if (!ready) shown = markup;
  $: if (ready && host && ctl) ctl.update(spec, markup);
  $: if (ready && ctl && selection !== undefined) ctl.setSelection(selection);
  $: if (host && render === renderAll) open(host, spec, () => arm(spec));

  onMount(() => {
    if (!(render === renderAll && open(host, spec, () => arm(spec)))) {
      if (!host.querySelector("svg")) patchSvg(host, markup);
      arm(spec);
      ready = true;
    }
    return () => {
      unlist();
      ctl?.destroy();
    };
  });
</script>

<div bind:this={host} class={$$props.class} style={$$props.style}>{@html shown}</div>
