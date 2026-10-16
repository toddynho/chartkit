# ChartKit

Charts for dashboards and for agents. One JSON spec, a framework-free core, and React components with the same API as 0.4.

**[Documentation](https://chartkit.dev)** | **[Demo](https://chartkit.dev/demo)** | **[Components](https://chartkit.dev/components)** | **[Schema](https://chartkit.dev/schema/v1.json)**

---

ChartKit is a React charting library for dashboards: 14 components and 17 themes. `@chartkitdev/core` has zero runtime dependencies. `@chartkitdev/react` depends on that core and on React.

## Installation

```bash
npm install @chartkitdev/react
npm install @chartkitdev/core
```

`@derpdaderp/chartkit` remains as a compatibility shim (not published from this branch). See [docs/migrate.md](docs/migrate.md).

## Quick Start

```tsx
import { LineChart, KpiCard } from '@chartkitdev/react';

function Dashboard({ data }) {
  return (
    <div>
      <KpiCard
        label="Revenue"
        value={284500}
        delta={12.5}
        data={data}
        theme="midnight"
        format={(v) => `$${(v / 1000).toFixed(0)}K`}
      />
      
      <LineChart
        data={data}
        series={[{ key: 'value', label: 'Sales', area: true }]}
        theme="midnight"
        curve="monotone"
        responsive
      />
    </div>
  );
}
```

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
