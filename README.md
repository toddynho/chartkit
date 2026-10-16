# ChartKit

One JSON spec, a framework-free core, and optional React components. The spec is the agent interface. React props are a different API and are not keys in the spec.

**[Documentation](https://chartkit.dev)** | **[Demo](https://chartkit.dev/demo)** | **[Components](https://chartkit.dev/components)** | **[Schema](https://chartkit.dev/schema/v1.json)** | **[llms.txt](docs/public/llms.txt)**

---

`@chartkitdev/core` has zero runtime dependencies and renders SVG from the spec. `@chartkitdev/react` depends on that core and on React. One minimal valid spec for each of the 14 chart types is in [packages/core/README.md](packages/core/README.md) and [docs/public/llms.txt](docs/public/llms.txt).

## Installation

```bash
npm install @chartkitdev/core
npm install @chartkitdev/react
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

## React components (not the JSON spec)

```tsx
import { Chart } from "@chartkitdev/react";

function Panel({ spec }) {
  return <Chart spec={spec} />;
}
```

Dashboard components (`LineChart`, `KpiCard`, and the rest) take their own props. `dataKey`, `leftAxis`, and a top-level `value` on `GaugeChart` are not spec keys.

## Features

- **14 Chart Components** - Lines, bars, areas, donuts, gauges, heatmaps, and more
- **17 Curated Themes** - Dark and light themes that look great out of the box
- **No third-party runtime dependencies** - Pure SVG. The core package depends on nothing; the React package depends on the core.
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

17 built-in themes:

**Dark:** `midnight`, `emerald`, `mono`, `slate`, `arctic`, `orchid`, `obsidian`, `neon`, `mocha`, `owl`, `retro`, `copper`, `rose`

**Light:** `sunset`, `silver`, `pearl`, `latte`

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
