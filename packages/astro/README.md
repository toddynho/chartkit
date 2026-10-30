# @chartkitdev/astro

Astro component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

`<Chart spec={spec} />` validates the spec while the page is built and prints static SVG. The default render ships no client script. Set `client` when the chart should take pointers: that path calls `mount()` from `@chartkitdev/vanilla` on the server SVG, the same runtime the other adapters use.

Astro's `client:*` directives apply to framework components, not to `.astro` files, so the opt-in is a prop.

```bash
npm install @chartkitdev/core @chartkitdev/astro
```

```astro
---
import { Chart } from "@chartkitdev/astro";

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
---

<Chart spec={spec} />
```

An invalid spec throws `ChartKitSpecError` with the CK codes, so the build fails instead of shipping an empty chart. Warnings still draw.

`client` keeps that SVG in the first response, then hydrates it:

```astro
<Chart spec={spec} client />
```

`mount()` patches the existing SVG. Core charts attach immediately. Histogram through rose load on demand through `@chartkitdev/core/load`. `@chartkitdev/vanilla` is a dependency, so the prop does not need a second install. The page does not download it unless `client` is set.

Pass `render` from `createRenderer([...])` to draw one chart type instead of every chart. That function runs at build time. `client` still hydrates with vanilla's loader.

Maps stay on `@chartkitdev/geo`. `<chart-kit>` stays on `@chartkitdev/element` for a page with no Astro build.

`renderToString(spec)` is the same SVG the component prints, for a route or an endpoint that wants the string.
