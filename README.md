# ChartKit

One JSON spec, a framework-free core, and thin adapters for React, Vue, Svelte, and plain DOM. The spec is the agent interface. Component props on the older React charts are a different API and are not keys in the spec.

**[Documentation](https://chartkit.dev)** | **[Demo](https://chartkit.dev/demo)** | **[Components](https://chartkit.dev/components)** | **[Schema](https://chartkit.dev/schema/v1.json)** | **[llms.txt](docs/public/llms.txt)**

---

`@chartkitdev/core` has zero runtime dependencies and renders SVG from the spec. The adapters depend on that core and on their framework. One minimal valid spec for each of the 14 chart types is in [packages/core/README.md](packages/core/README.md) and [docs/public/llms.txt](docs/public/llms.txt).

## Installation

```bash
npm install @chartkitdev/core
npm install @chartkitdev/react
npm install @chartkitdev/vue
npm install @chartkitdev/svelte
npm install @chartkitdev/vanilla
```

`@derpdaderp/chartkit` remains as a compatibility shim (not published from this branch). See [docs/migrate.md](docs/migrate.md).

## JSON spec

```ts
import { render } from "@chartkitdev/core/all";
import { validate } from "@chartkitdev/core/validate";
```

Rules:

- `version` is `"1"`. `a11y.alt` is one sentence and is required.
- `data` is a plain array of row objects, not `{ "values": [...] }`. Sparkline, mini-area, and spike may use a plain number array.
- The chart type goes in `type`. `mark` is an options object, not a string.
- Gauge, kpi, and progress-ring put the number in `metric`. A `data` object of those fields moves into `metric`.
- Donut uses `encoding.x` (slice label) and `encoding.y` (slice value).
- `encoding.*.axis` is `"y"` or `"y2"`. Titles go in `axes.y.title` or `axes.y2.title`.
- Field types are `quantitative`, `temporal`, `ordinal`, or `nominal`.
- A list of fields goes on `encoding.y`, not on `field`. On a combo, `bar`, `line`, and `area` go in `mark`, not in `type`.
- A heatmap with `encoding.y` is a grid. Calendar is a date `x` plus `color`, or `mark.layout: "calendar"`.

```json
{
  "version": "1",
  "type": "line",
  "data": [
    { "quarter": "Q1", "units": 40 },
    { "quarter": "Q2", "units": 55 }
  ],
  "encoding": { "x": "quarter", "y": "units" },
  "a11y": { "alt": "Units rose from Q1 to Q2." }
}
```

## Adapters

Each adapter draws the spec above. None of them add chart logic. Pass `render` from `createRenderer([...])` when a page should ship one chart instead of every chart.

```tsx
import { Chart } from "@chartkitdev/react";

function Panel({ spec }) {
  return <Chart spec={spec} />;
}
```

```vue
<script setup>
import { Chart } from "@chartkitdev/vue";
</script>

<template>
  <Chart :spec="spec" />
</template>
```

Vue SSR (`renderToString` from `@chartkitdev/vue/ssr`, which uses `vue/server-renderer`) includes the SVG.

```svelte
<script>
  import { Chart } from "@chartkitdev/svelte";
  export let spec;
</script>

<Chart {spec} />
```

The Svelte component uses `export let`, so Svelte 4 and Svelte 5 both compile it. SvelteKit SSR includes the SVG.

```js
import { mount, renderToString } from "@chartkitdev/vanilla";

const chart = mount(document.querySelector("#chart"), spec);
chart.update(nextSpec);
chart.destroy();
```

`renderToString(spec)` is the SVG string core returns. `mount` writes that string into an element you already have. `update` keeps the element and skips the DOM write when the SVG is unchanged. `destroy` clears it.

Dashboard components in `@chartkitdev/react` (`LineChart`, `KpiCard`, and the rest) take their own props. `dataKey`, `leftAxis`, and a top-level `value` on `GaugeChart` are not spec keys.

## Features

- **14 Chart Components** - Lines, bars, areas, donuts, gauges, heatmaps, and more
- **Soft by default** - An omitted theme uses the Soft look, light or dark with the page. `refined`, `editorial`, and `midnight` are built in. More presets are opt-in imports.
- **No third-party runtime dependencies in core** - Pure SVG. The core package depends on nothing. Each adapter depends on the core and its framework.
- **TypeScript First** - Full type safety with autocomplete for every prop
- **Dual Y-Axis** - Display multiple scales in LineChart
- **Responsive** - Charts automatically resize to fit their container
- **Interactive** - Tooltips, click handlers, and hover states

## Components

| Component | Description |
|-----------|-------------|
| `LineChart` | Multi-series lines with dual Y-axis, curves, and area fills |
| `BarChart` | Vertical and horizontal bar charts |
| `DonutChart` | Donut/pie charts with center content |
| `StackedArea` | Stacked area charts with legend |
| `ScatterChart` | Scatter and bubble charts |
| `ComboChart` | Combined line, bar, and area |
| `Heatmap` | GitHub-style activity heatmaps |
| `GaugeChart` | Semicircular gauges with ranges |
| `KpiCard` | Metric cards with sparklines and deltas |
| `Sparkline` | Minimal inline trend charts |
| `MiniArea` | Small area charts with gradients |
| `ProgressRing` | Circular progress indicators |
| `SpikeChart` | Event/activity spike visualization |
| `CandlestickChart` | Financial OHLC charts with zoom/pan |

## Themes

The JSON spec default is Soft. Omit `theme`, or set `"auto"` or `"soft"`. Colours follow the page scheme (`light-dark()`). The plot is transparent, so it sits on a white page or any other background. The gray card is optional:

```css
.ck-card { background: light-dark(#f5f5f7, #1c1c1e); }
```

Or set `--ck-background` to that pair. `"refined"` and `"editorial"` are built-in names. `"midnight"` is the opt-in dark card. A name that has not been imported still renders as midnight.

Other presets, imported from `@chartkitdev/core/themes/<name>`:

**Dark:** `emerald`, `mono`, `slate`, `arctic`, `orchid`, `obsidian`, `neon`, `mocha`, `owl`, `retro`, `copper`, `rose`

**Light:** `sunset`, `silver`, `pearl`, `latte`

A brand palette is `@chartkitdev/core/themes/brand`: `paletteFromBrand("#635bff")`, then `theme: { tokens: { series } }`. It stays out of the default bundle.

```tsx
import { useAutoTheme } from '@chartkitdev/react';

// Auto-switch based on system preference
const theme = useAutoTheme({ light: 'sunset', dark: 'midnight' });
```

## Documentation

Full documentation and examples at **[chartkit.dev](https://chartkit.dev)**

- [Getting Started](https://chartkit.dev/getting-started)
- [Components](https://chartkit.dev/components)
- [Themes](https://chartkit.dev/themes)
- [Live Demo](https://chartkit.dev/demo)

## Author

Created by [@toddo](https://x.com/toddo), founder of [BuySellAds](https://buysellads.com).

## License

MIT
