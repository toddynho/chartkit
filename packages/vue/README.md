# @chartkitdev/vue

Vue 3 component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

```bash
npm install @chartkitdev/vue
```

```vue
<script setup>
import { Chart } from "@chartkitdev/vue";

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

<template>
  <Chart :spec="spec" />
</template>
```

Replace `spec` and the component updates the SVG in place. Unmount removes it.

Server render:

```ts
import { renderToString } from "@chartkitdev/vue/ssr";

const html = await renderToString(spec);
```

That uses `vue/server-renderer` (an optional peer). The SVG in `html` is the string core returns.

Pass `render` from `createRenderer([...])` to ship one chart type instead of every chart.
