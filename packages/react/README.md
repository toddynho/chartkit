# @chartkitdev/react

Beautiful charts for React. Zero config.

**[Documentation](https://chartkit.dev)** | **[Demo](https://chartkit.dev/demo)** | **[GitHub](https://github.com/toddynho/chartkit)** | **[Schema](https://chartkit.dev/schema/v1.json)**

---

React components for ChartKit. 14 chart components and 17 themes. Depends on `@chartkitdev/core` and on React (peer). No other runtime dependencies.

## Installation

```bash
npm install @chartkitdev/react
```

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

- **14 Chart Components** - Lines, bars, areas, donuts, gauges, heatmaps, candlesticks, and more
- **17 Curated Themes** - Dark and light themes that look great out of the box
- **Pure SVG** - Depends on `@chartkitdev/core`, not on a third-party chart library
- **TypeScript First** - Full type safety with autocomplete
- **Dual Y-Axis** - Display multiple scales in LineChart
- **Responsive** - Charts automatically resize to fit their container

## Components

### Charts
- **LineChart** - Multi-series with dual Y-axis, curves, area fills
- **BarChart** - Vertical and horizontal bars
- **DonutChart** - Donut/pie with center content
- **StackedArea** - Stacked areas with legend
- **ScatterChart** - Scatter and bubble charts
- **ComboChart** - Combined line, bar, and area
- **Heatmap** - GitHub-style activity heatmaps
- **CandlestickChart** - Financial OHLC with zoom/pan

### Indicators
- **KpiCard** - Metric cards with sparklines
- **Sparkline** - Minimal inline trends
- **MiniArea** - Small area charts
- **GaugeChart** - Semicircular gauges
- **ProgressRing** - Circular progress
- **SpikeChart** - Event visualization

## Themes

**Dark:** `midnight`, `emerald`, `mono`, `slate`, `arctic`, `orchid`, `obsidian`, `neon`, `mocha`, `owl`, `retro`, `copper`, `rose`

**Light:** `sunset`, `silver`, `pearl`, `latte`

```tsx
import { useAutoTheme } from '@chartkitdev/react';

// Auto dark/light switching
const theme = useAutoTheme({ light: 'sunset', dark: 'midnight' });
```

## Examples

### Multi-Series Line Chart

```tsx
<LineChart
  data={data}
  series={[
    { key: 'p50', label: 'p50' },
    { key: 'p95', label: 'p95', strokeDasharray: '4,2' },
  ]}
  theme="midnight"
  curve="monotone"
  unit="ms"
  responsive
/>
```

### Dual Y-Axis

```tsx
<LineChart
  data={data}
  series={[
    { key: 'requests', label: 'Requests', yAxisId: 'left' },
    { key: 'latency', label: 'Latency', yAxisId: 'right' },
  ]}
  yAxisLeft={{ unit: 'req/s' }}
  yAxisRight={{ unit: 'ms' }}
  theme="midnight"
/>
```

### Area Chart

```tsx
<LineChart
  data={data}
  series={[{ key: 'value', label: 'Sales', area: true, areaOpacity: 0.3 }]}
  curve="monotone"
  theme="emerald"
/>
```

## Documentation

Full docs at **[chartkit.dev](https://chartkit.dev)**

## Author

Created by [@toddo](https://x.com/toddo)

## License

MIT
