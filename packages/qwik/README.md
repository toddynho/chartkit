# @chartkitdev/qwik

Qwik component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

`<Chart spec={spec} />` validates the spec and prints static SVG in the server HTML. A visible task then calls `mount()` from `@chartkitdev/vanilla` on that node. The task waits until the chart is on screen, which is the resumable boundary Qwik already uses.

```bash
npm install @chartkitdev/core @chartkitdev/qwik
```

```tsx
import { component$ } from "@builder.io/qwik";
import { Chart } from "@chartkitdev/qwik";

export const Panel = component$(() => {
  return <Chart spec={spec} />;
});
```

An invalid spec throws `ChartKitSpecError` with the CK codes. Warnings still draw. Histogram through rose, the planning charts, and bar-list are in the server SVG.

`renderToString` from `@chartkitdev/qwik/ssr` is that SVG string, for a route that wants the markup without the component:

```ts
import { renderToString } from "@chartkitdev/qwik/ssr";

const svg = renderToString(spec);
```

`mount()` hydrates the same node. Core charts attach immediately. Histogram through rose load on demand. A `render` function is not a component prop: Qwik has to serialize props, and a renderer is not serializable. Pass it to `renderToString` when a route should draw one chart type.

Maps stay on `@chartkitdev/geo`.
