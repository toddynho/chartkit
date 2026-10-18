# @chartkitdev/svelte

Svelte component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

The component uses `export let` and `$:`, which Svelte 5 still compiles and Svelte 4 already did. Ship the `.svelte` source. The app's compiler builds it, including SvelteKit SSR.

```bash
npm install @chartkitdev/svelte
```

```svelte
<script>
  import { Chart } from "@chartkitdev/svelte";

  const spec = {
    version: "1",
    type: "line",
    data: [
      { quarter: "Q1", units: 40 },
      { quarter: "Q2", units: 55 },
    ],
    encoding: { x: "quarter", y: "units" },
    a11y: { alt: "Units rose from Q1 to Q2." },
  };
</script>

<Chart {spec} />
```

Replace `spec` and the component updates the SVG in place. Destroying the component removes it. SvelteKit includes the SVG in the server HTML because the markup is in the template, not in `onMount`.

Pass `render` from `createRenderer([...])` to ship one chart type instead of every chart.
