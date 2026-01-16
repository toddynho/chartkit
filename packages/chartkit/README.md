# @derpdaderp/chartkit

A lightweight, zero-dependency charting library for React and Next.js. Built with pure SVG for minimal bundle size and maximum performance.

## Features

- **14 Chart Components** - Lines, bars, areas, scatter, gauges, and more
- **17 Beautiful Themes** - Dark and light themes for any design system
- **Dual Y-Axis** - Display multiple scales in LineChart
- **5 Curve Types** - Linear, smooth (monotone), step, and more
- **Area Fills** - Gradient fills under line charts
- **Zero Dependencies** - Pure SVG, no D3 or heavy libraries
- **TypeScript First** - Full type safety with comprehensive types
- **~15KB gzipped** - Tiny bundle for the entire library

## Installation

```bash
npm install @derpdaderp/chartkit
```

## Quick Start

```tsx
import { Sparkline, LineChart, KpiCard, useAutoTheme } from '@derpdaderp/chartkit';

// Sparkline - responsive by default
<Sparkline data={[10, 25, 15, 30, 22]} theme="midnight" />

// LineChart with smooth curves
<LineChart
  data={data}
  dataKey="revenue"
  label="Revenue"
  theme="emerald"
  curve="monotone"
  responsive
/>

// Auto dark/light theme switching
function Chart({ data }) {
  const theme = useAutoTheme({ light: 'sunset', dark: 'neon' });
  return <LineChart data={data} dataKey="value" theme={theme} responsive />;
}
```

## Components

### Line & Area Charts
- **LineChart** - Multi-series with dual Y-axis, curve types, area fills
- **Sparkline** - Minimal inline trend charts
- **MiniArea** - Small area charts with gradient fills
- **StackedArea** - Stacked area charts with legend

### Bar Charts
- **BarChart** - Grouped and stacked bar charts

### Circular Charts
- **DonutChart** - Donut/pie charts with center content
- **ProgressRing** - Circular progress indicators
- **GaugeChart** - Semicircular gauges with ranges

### Specialized Charts
- **ScatterChart** - Scatter and bubble charts
- **ComboChart** - Combined line, bar, and area
- **Heatmap** - GitHub-style activity heatmaps
- **SpikeChart** - Event/activity spike visualization
- **KpiCard** - Metric cards with sparklines and deltas

## LineChart Examples

### Basic Line Chart

```tsx
<LineChart
  data={data}
  dataKey="value"
  label="Revenue"
  theme="midnight"
  responsive
/>
```

### Multi-Series with Smooth Curves

```tsx
<LineChart
  data={data}
  series={[
    { key: 'p50', label: 'p50' },
    { key: 'p95', label: 'p95' },
    { key: 'p99', label: 'p99' },
  ]}
  theme="neon"
  curve="monotone"
  unit="ms"
/>
```

### Dual Y-Axis

```tsx
<LineChart
  data={data}
  series={[
    { key: 'requests', label: 'Requests', yAxisId: 'left' },
    { key: 'latency', label: 'Latency', yAxisId: 'right', strokeDasharray: '5,5' },
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
  series={[
    { key: 'value', label: 'Sales', area: true, areaOpacity: 0.2 },
  ]}
  curve="monotone"
  theme="emerald"
/>
```

### Curve Types

```tsx
// Smooth curves (Catmull-Rom spline)
<LineChart data={data} series={series} curve="monotone" theme="midnight" />

// Step function
<LineChart data={data} series={series} curve="step" theme="midnight" />

// Available: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter'
```

## Themes

17 built-in themes:

**Dark (13):** `midnight`, `emerald`, `mono`, `slate`, `arctic`, `orchid`, `obsidian`, `neon`, `mocha`, `owl`, `retro`, `copper`, `rose`

**Light (4):** `sunset`, `silver`, `pearl`, `latte`

```tsx
// Use any theme
<LineChart data={data} series={series} theme="neon" />

// Auto-switch based on dark mode
const theme = useAutoTheme({ light: 'sunset', dark: 'neon' });
```

## Annotations

Add reference lines and areas:

```tsx
<LineChart
  data={data}
  series={series}
  theme="midnight"
  annotations={[
    { type: 'line', axis: 'y', value: 80, label: 'Warning', color: '#f59e0b' },
    { type: 'area', axis: 'y', start: 0, end: 50, color: '#22c55e', opacity: 0.1 },
  ]}
/>
```

## TypeScript

All components are fully typed:

```tsx
import type {
  LineChartProps,
  SeriesConfig,
  YAxisConfig,
  CurveType,
  ThemeName,
  Annotation,
} from '@derpdaderp/chartkit';
```

## Links

- [Documentation](https://chartkit.dev)
- [GitHub](https://github.com/toddynho/chartkit)
- [AI/LLM Reference](https://chartkit.dev/llms.txt)

## License

MIT
