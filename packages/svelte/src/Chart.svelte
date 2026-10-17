<script>
  import { onMount } from "svelte";
  import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";

  /** @type {import("@chartkitdev/core").ChartSpec} */
  export let spec;

  /**
   * Defaults to the core charts. Pass `createRenderer([...])` to ship a subset.
   * The SSR entry passes a renderer that already includes histogram through waterfall.
   * @type {((spec: import("@chartkitdev/core").ChartSpec) => string) | undefined}
   */
  export let render = undefined;

  let host;
  let svg = "";
  let tip;
  const tickets = { n: 0 };

  function paint(current, custom) {
    svg = (custom ?? renderAll)(current);
  }

  async function ensure(type) {
    if (!isExtra(type)) return;
    const chart = await (await import("@chartkitdev/core/load")).load(type);
    if (chart) adopt(chart);
  }

  $: if (render || !isExtra(spec.type)) paint(spec, render);
  else {
    const current = (tickets.n += 1);
    const next = spec;
    void ensure(next.type).then(() => {
      if (current === tickets.n) paint(next, render);
    });
  }

  onMount(() => {
    if (render || !isExtra(spec.type)) return undefined;
    let alive = true;
    void import("@chartkitdev/core/extra-tip").then(({ attach }) => {
      if (alive && host) tip = attach(host);
    });
    return () => {
      alive = false;
      tip?.destroy();
    };
  });
</script>

<div bind:this={host} class={$$props.class} style={$$props.style}>{@html svg}</div>
