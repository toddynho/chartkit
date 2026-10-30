# @chartkitdev/solid

Solid component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

`<Chart spec={spec} />` validates the spec and includes the SVG in Solid's server HTML. After hydration, it calls `mount()` from `@chartkitdev/vanilla` on that node.

```bash
npm install @chartkitdev/core @chartkitdev/solid
```

```tsx
import { Chart } from "@chartkitdev/solid";

export function Panel() {
  return <Chart spec={spec} />;
}
```

An invalid spec throws `ChartKitSpecError` with the CK codes. Warnings still draw.

`renderToString` from `@chartkitdev/solid/ssr` is the component HTML, including histogram through rose and bar-list:

```tsx
import { renderToString } from "@chartkitdev/solid/ssr";

const html = renderToString(spec);
```

The default component render draws the core charts during SSR. Pass `render` from `createRenderer([...])` to draw a subset. The SSR entry passes a renderer that already includes the extra charts. `mount()` still hydrates with vanilla: core charts attach immediately, and histogram through rose load on demand.

Maps stay on `@chartkitdev/geo`.
