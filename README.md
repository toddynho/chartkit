# ChartKit

One JSON spec, a framework-free core, and thin adapters for React, Vue, Svelte, plain DOM, and a `<chart-kit>` element. The spec is the agent interface. Component props on the older React charts are a different API and are not keys in the spec.

Round 13, measured 2026-10-18 on phase 2 `d8dcc5a`. These are the harness numbers, including the losses. Method: [chartkit.dev/benchmarks](https://chartkit.dev/benchmarks) and [benchmarks.json](https://chartkit.dev/benchmarks.json).

| | ChartKit | Next or note |
| --- | ---: | --- |
| Line chart, gzip | **14,858 B** | uPlot 23,109 B. `scripts/size.mjs` on that commit. Harness minimal line is 14,987 B |
| Server render, 1k line | **0.85 ms** | ECharts 6.65 ms mean. uPlot, Chart.js, and Recharts produced no chart without a DOM |
| Agent, no docs, then repair() | **20/42 → 42/42** | Not re-run for round 13. Recharts, ECharts, and Chart.js were already 42/42 with no docs |
| Initial, 12 cells | wins all | Even 1M is 23.6 ms vs uPlot 26.5 ms |
| Aligned update | wins 6 of 12 | Losses: even 1k 1.5 vs 1.2, even 10k 1.9 vs 1.7, jitter 1k 1.6 vs 1.4, gapped 1k 1.6 vs 1.4, gapped 10k 1.9 vs 1.6, gapped 100k 3.5 vs 3.4 |
| First hover, painted | 20.8 / 15.9 / 16.5 ms | uPlot 4 / 4.6 / 4.9 ms, at about 50 / 200 / 500 ms after mount |
| Steady hover, 100k | 16.5 ms | uPlot 16.2 ms |

The aligned update starts at the top of a requestAnimationFrame, awaits the library’s own completion, and reads time from a MessageChannel after paint. ChartKit is `mount().update()`, the same shape as uPlot `setData`. Sampling defaults to auto. With sampling off, 1M is 471.8 ms to draw and 462.4 ms to update.

Canvas line, measured 2026-10-20, median of 5, Playwright Chromium, 640×360, sampling auto (minmax above twice the plot width). Canvas paints the sampled points and builds SVG for the axes only. `render` is that synchronous work. First paint includes the same two frames as the other libraries. uPlot does not split a synchronous render time out of that paint. Nivo threw `Maximum call stack size exceeded` at 1M. Sampling none is a different path: 100k updates in 1,224.8 ms, and 1M takes 332.5 ms to build and 21,773.5 ms to update.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10k | 6.8 | 10.1 | 17.7 | 29.3 | 15.8 | 33.2 | 27.7 | 33.1 |
| 100k | 8.2 | 11.1 | 15.7 | 25.4 | 14.5 | 28.7 | 25.9 | 26.2 |
| 1M | 15.8 | 19.2 | 20.2 | 31.3 | 25.4 | 23.5 | 26.3 | 23.3 |

Canvas losses: render is slower than SVG at 10k (10.1 vs 6.8), 100k (11.1 vs 8.2), and 1M (19.2 vs 15.8). First paint is slower than SVG at those sizes (29.3 vs 17.7, 25.4 vs 15.7, 31.3 vs 20.2) and slower than uPlot (15.8, 14.5, 25.4). The 1M update is slower than uPlot (26.3 vs 23.3) and slower than SVG (26.3 vs 23.5). Canvas wins the 10k and 100k updates against both SVG and uPlot. `auto` stays on SVG at 10k and switches at 100,000 rows. `scripts/size.mjs` line is 36,009 bytes gzip. The canvas painter is a separate chunk, 54,050 bytes gzip, and is not in that line bundle.

**[Documentation](https://chartkit.dev)** | **[When to use](https://chartkit.dev/when-to-use)** | **[Benchmarks](https://chartkit.dev/benchmarks)** | **[Schema](https://chartkit.dev/schema/v1.json)** | **[Roadmap](ROADMAP.md)** | **[llms.txt](docs/public/llms.txt)**

---

`@chartkitdev/core` has zero runtime dependencies and renders SVG from the spec. The adapters depend on that core and on their framework. One minimal valid spec for each chart type is in [packages/core/README.md](packages/core/README.md) and [docs/public/llms.txt](docs/public/llms.txt).

## Installation

```bash
npm install @chartkitdev/core
npm install @chartkitdev/react
npm install @chartkitdev/vue
npm install @chartkitdev/svelte
npm install @chartkitdev/vanilla
```

`@chartkitdev/element` (`<chart-kit>`) is in this repo and is not on npm yet.

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
- **Client interaction** - Tooltip, zoom, pan, brush, and animation run in the interaction runtime. Keyboard, the data table, and legend clicks stay off unless set. `tooltip.fields` chooses the rows and their order, with a label and a format preset. `tooltip.position` is `auto`, `top`, `bottom`, `left`, or `right`. `tooltip.crosshairLabel` prints the x value on the guide. `interaction.select` is `point` or `series` (Shift, Ctrl, or Meta adds; Escape or a background click clears) and emits `pointclick`, `seriesclick`, `legendclick`, and `selectionchange`. React and Next pass `onPointClick`, `onSeriesClick`, `onLegendClick`, `selection`, and `onSelectionChange`. Vue emits those names. Svelte dispatches them. Vanilla takes the same callbacks on `mount`. Legend hover highlights the series. `--ck-dim` and `--ck-selected` style the marks. `animation.easing` and `theme.tokens.fontFamily` warn CK3012.

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
| `CandlestickChart` | Financial OHLC charts. Zoom and pan are not drawn. |

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

- [Getting started](https://chartkit.dev/docs)
- [Roadmap](ROADMAP.md)
- [When to use ChartKit](https://chartkit.dev/when-to-use)
- [Benchmarks](https://chartkit.dev/benchmarks.json)
- [Themes](https://chartkit.dev/docs/theming)
- [Live demo](https://chartkit.dev/demo)

## Author

Created by [@toddo](https://x.com/toddo), founder of [BuySellAds](https://buysellads.com).

## License

MIT
