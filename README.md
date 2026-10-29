# ChartKit

One JSON spec, a framework-free core, and thin adapters for React, Vue, Svelte, plain DOM, and a `<chart-kit>` element. The spec is the agent interface. Component props on the older React charts are a different API and are not keys in the spec.

Round 13, measured 2026-10-18 on phase 2 `d8dcc5a`. These are the harness numbers, including the losses. Method: [chartkit.dev/benchmarks](https://chartkit.dev/benchmarks) and [benchmarks.json](https://chartkit.dev/benchmarks.json).

| | ChartKit | Next or note |
| --- | ---: | --- |
| Line chart, gzip | **34,554 B** | Loss to uPlot at 23,276 B (JS). Stylesheet is 762 B more, summed 24,038. `scripts/size.mjs` on `038cf5d`. Harness minimal line is 34,767 B |
| Server render, 1k line | **0.85 ms** | ECharts 6.65 ms mean. uPlot, Chart.js, and Recharts produced no chart without a DOM |
| Agent, no docs, then repair() | **21/42 → 42/42** | Round 6, 2026-10-16. Not re-run for round 13. Recharts, ECharts, and Chart.js were already 42/42 with no docs |
| Initial, 12 cells | wins all | Even 1M is 23.6 ms vs uPlot 26.5 ms |
| Aligned update | wins 6 of 12 | Losses: even 1k 1.5 vs 1.2, even 10k 1.9 vs 1.7, jitter 1k 1.6 vs 1.4, gapped 1k 1.6 vs 1.4, gapped 10k 1.9 vs 1.6, gapped 100k 3.5 vs 3.4 |
| First hover, painted | 20.8 / 15.9 / 16.5 ms | uPlot 4 / 4.6 / 4.9 ms, at about 50 / 200 / 500 ms after mount |
| Steady hover, 100k | 16.5 ms | uPlot 16.2 ms |

The aligned update starts at the top of a requestAnimationFrame, awaits the library’s own completion, and reads time from a MessageChannel after paint. ChartKit is `mount().update()`, the same shape as uPlot `setData`. Sampling defaults to auto. With sampling off, 1M is 471.8 ms to draw and 462.4 ms to update.

Canvas line, measured 2026-10-21, median of 5, Playwright Chromium, 640×360, sampling auto (minmax above twice the plot width). Canvas paints the sampled points and builds SVG for the axes only. `render` is that synchronous work. First paint includes the same two frames as the other libraries. uPlot does not split a synchronous render time out of that paint. Sampling none was not re-timed in this run.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10k | 7.3 | 7.8 | 13.1 | 21.8 | 14.5 | 25.6 | 19.1 | 33.2 |
| 100k | 8.2 | 9.1 | 13.1 | 20.1 | 17.6 | 29.0 | 18.1 | 23.0 |
| 1M | 16.5 | 17.1 | 20.8 | 27.7 | 25.1 | 20.6 | 21.8 | 20.9 |

Canvas losses: render is slower than SVG at 10k (7.8 vs 7.3), 100k (9.1 vs 8.2), and 1M (17.1 vs 16.5). First paint is slower than SVG at those sizes (21.8 vs 13.1, 20.1 vs 13.1, 27.7 vs 20.8) and slower than uPlot (14.5, 17.6, 25.1). The 1M update is slower than SVG (21.8 vs 20.6) and slower than uPlot (21.8 vs 20.9). Canvas wins the 10k and 100k updates against both SVG and uPlot. There is no first-paint crossover, so `auto` stays on SVG at 10k and switches at 100,000 rows, where the update win is large. 1M first paint is 27.7 ms and the update is 21.8 ms. `scripts/size.mjs` line is 34,554 bytes gzip, 539 bytes over main `9c1dbdc` (34,015). Facets, concatenation, breakpoints, and right-to-left layout load with `all` and `extra`, not with `createRenderer([line])`. The typed canvas sampler and the painter stay out of the line bundle. `@chartkitdev/core/all` is 64,372 bytes gzip (main 57,650). The canvas painter is a separate chunk, 57,127 bytes gzip (main 56,817). `interact` is 17,641 (main 16,637). `validate` is 32,206 (main 31,177). extra is 88,495 (main 82,076).

**[Documentation](https://chartkit.dev)** | **[When to use](https://chartkit.dev/when-to-use)** | **[Benchmarks](https://chartkit.dev/benchmarks)** | **[Schema](https://chartkit.dev/schema/v1.json)** | **[Roadmap](ROADMAP.md)** | **[llms.txt](catalog/public/llms.txt)**

---

`@chartkitdev/core` has zero runtime dependencies and renders SVG from the spec. The adapters depend on that core and on their framework. One minimal valid spec for each chart type is in [packages/core/README.md](packages/core/README.md) and [catalog/public/llms.txt](catalog/public/llms.txt).

## Installation

```bash
npm install @chartkitdev/core
npm install @chartkitdev/react
npm install @chartkitdev/vue
npm install @chartkitdev/svelte
npm install @chartkitdev/vanilla
npm install @chartkitdev/element
npm install @chartkitdev/markdown
npm install @chartkitdev/geo
npm install @chartkitdev/mcp
```

`@chartkitdev/element` is the `<chart-kit>` element. `@chartkitdev/markdown` turns `chartkit` fences into SVG. `@chartkitdev/mcp` is the stdio server (`npx -y @chartkitdev/mcp`).

`@chartkitdev/geo` is choropleth and point maps. It is not part of the line or `all` bundles. Each atlas is its own chunk. There is no tile layer.

`@derpdaderp/chartkit` is a compatibility shim that re-exports `@chartkitdev/react`. It is not the package for a new app. The manual publish workflow can publish it after `@chartkitdev/react`. See [catalog/migrate.md](catalog/migrate.md).

`@chartkitdev/convert` stays private. It turns Chart.js, Recharts, and ECharts configs into a spec for the website, and it is not an install target.

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

- **JSON spec** — `version`, `type`, `data`, `encoding`, and a required `a11y.alt`. Adapters do not add chart keys.
- **Soft by default** — Omit `theme`, or set `"auto"` or `"soft"`. `refined`, `editorial`, and `midnight` are built in. Other presets are opt-in imports.
- **Core has no runtime dependencies** — SVG from the spec. Each adapter depends on core and its framework.
- **TypeScript** — The spec and the adapter props are typed.
- **Second axis** — `encoding.*.axis: "y2"`, with the title in `axes.y2.title`.
- **Responsive** — Charts resize to fit their container.
- **Client interaction** — Tooltip, zoom, pan, brush, and animation run in `@chartkitdev/core/interact`. Keyboard, the data table, and legend clicks stay off unless set. The server SVG records the options and does not include the controls.
- **Tooltip** — `tooltip.fields` chooses the rows, their order, a label, and a format preset. `tooltip.position` is `auto`, `top`, `bottom`, `left`, or `right`. `tooltip.crosshairLabel` prints the x value on the guide.
- **Select** — `interaction.select` is `point` or `series`. Shift, Ctrl, or Meta adds. Escape or a background click clears. Events: `pointclick`, `seriesclick`, `legendclick`, `selectionchange`. React and Next pass `onPointClick`, `onSeriesClick`, `onLegendClick`, `selection`, and `onSelectionChange`. Vue emits those names. Svelte dispatches them. Vanilla takes the same callbacks on `mount`. Legend hover highlights the series. `--ck-dim` and `--ck-selected` style the marks.
- **Navigator, sync, drilldown** — `interaction.navigator` is an overview and a keyboard range. `interaction.sync` shares the crosshair, tooltip, and x window. `interaction.drilldown.children` maps a category to a child spec. Click, Enter, or Space drills. Back or Escape returns. CK3034–CK3039 warn, with a JSON Patch, when the config cannot be drawn. `animation.easing` and `theme.tokens.fontFamily` warn CK3012.

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

## Public site

[`apps/web`](apps/web) (`chartkit-web`) is the only public site. `npm run dev` and `npm run dev:web` start it at http://localhost:4321. Astro 7 needs Node 22.23.4 or newer. The library packages still allow Node 20.

`llms.txt`, the feature matrix, measured sizes, and benchmarks live in [`catalog/`](catalog). That folder is source data, not a second site.

Merging this repo does not deploy chartkit.dev. The manual steps are in [apps/web/README.md](apps/web/README.md).

People coming from `@derpdaderp/chartkit` and the prop-based dashboard components use one docs page: [Upgrading from v0](https://chartkit.dev/docs/migrate).

## Author

Created by [@toddo](https://x.com/toddo), founder of [BuySellAds](https://buysellads.com).

## License

MIT
