# @derpdaderp/chartkit

A lightweight, zero-dependency charting library for React and Next.js. Built with pure SVG for minimal bundle size and maximum performance.

## Features

- **14 Chart Components** - Lines, bars, areas, scatter, gauges, and more
- **17 Beautiful Themes** - Dark and light themes inspired by popular tools
- **Zero Dependencies** - Pure SVG, no D3 or heavy charting libraries
- **TypeScript First** - Full type safety with comprehensive types
- **Server Component Ready** - Works with React Server Components
- **Tiny Bundle** - ~15KB gzipped for the entire library

## Installation

```bash
npm install @derpdaderp/chartkit
# or
yarn add @derpdaderp/chartkit
# or
pnpm add @derpdaderp/chartkit
```

## Quick Start

```tsx
import { MonitorLine, ThemeProvider } from '@derpdaderp/chartkit'

const data = [
  { timestamp: '2024-01-01', cpu: 45, memory: 62 },
  { timestamp: '2024-01-02', cpu: 52, memory: 58 },
  { timestamp: '2024-01-03', cpu: 48, memory: 65 },
  // ...
]

function Dashboard() {
  return (
    <ThemeProvider theme="midnight">
      <MonitorLine
        data={data}
        xKey="timestamp"
        series={[
          { key: 'cpu', name: 'CPU %', color: 'primary' },
          { key: 'memory', name: 'Memory %', color: 'secondary' },
        ]}
        height={300}
      />
    </ThemeProvider>
  )
}
```

## Components

### Line & Area Charts
- **Sparkline** - Minimal inline charts
- **MiniArea** - Area charts with gradient fills
- **MonitorLine** - Multi-series line charts with tooltips
- **StackedArea** - Stacked area charts with legend

### Bar Charts
- **BarChart** - Grouped and stacked bar charts

### Circular Charts
- **DonutChart** - Donut/pie charts with center content
- **ProgressRing** - Circular progress indicators
- **GaugeChart** - Semicircular gauges with ranges

### Specialized Charts
- **ScatterChart** - Scatter and bubble charts
- **ComboChart** - Combined line, bar, and area with dual Y-axis
- **Heatmap** - GitHub-style activity heatmaps
- **SpikeChart** - Event/activity spike visualization
- **KpiCard** - KPI cards with sparklines and deltas

### Utilities
- **Legend** - Standalone interactive legend
- **ResponsiveChart** - Auto-resizing container

## Themes

ChartKit includes 17 built-in themes:

**Dark Themes (13):**
`midnight`, `emerald`, `mono`, `slate`, `arctic`, `orchid`, `obsidian`, `neon`, `mocha`, `owl`, `retro`, `copper`, `rose`

**Light Themes (4):**
`sunset`, `silver`, `pearl`, `latte`

```tsx
import { ThemeProvider } from '@derpdaderp/chartkit'

<ThemeProvider theme="neon">
  {/* Your charts */}
</ThemeProvider>
```

### Custom Themes

```tsx
import { ThemeProvider } from '@derpdaderp/chartkit'

const customTheme = {
  name: 'custom',
  background: '#1a1a2e',
  foreground: '#eaeaea',
  muted: '#4a4a6a',
  primary: '#00d9ff',
  secondary: '#ff6b6b',
  tertiary: '#4ecdc4',
  quaternary: '#ffe66d',
  success: '#00c853',
  warning: '#ffab00',
  danger: '#ff5252',
  gridColor: 'rgba(255,255,255,0.1)',
  gridDasharray: '2,2',
}

<ThemeProvider theme={customTheme}>
  {/* Your charts */}
</ThemeProvider>
```

## Advanced Features

### Annotations

Add reference lines and areas to highlight thresholds:

```tsx
<MonitorLine
  data={data}
  xKey="timestamp"
  series={[{ key: 'value', name: 'Value' }]}
  annotations={[
    { type: 'line', axis: 'y', value: 80, label: 'Warning', color: 'warning' },
    { type: 'area', axis: 'y', start: 90, end: 100, label: 'Critical', color: 'danger' },
  ]}
/>
```

### Click Events

Handle clicks on data points:

```tsx
<BarChart
  data={data}
  xKey="category"
  series={[{ key: 'value', name: 'Value' }]}
  onBarClick={(event) => {
    console.log(event.dataKey, event.dataPoint, event.index)
  }}
/>
```

### Custom Tooltips

```tsx
<MonitorLine
  data={data}
  xKey="timestamp"
  series={[{ key: 'value', name: 'Value' }]}
  renderTooltip={({ dataPoint, seriesConfig }) => (
    <div className="custom-tooltip">
      <strong>{dataPoint.timestamp}</strong>
      <span>{dataPoint.value}ms</span>
    </div>
  )}
/>
```

### Dual Y-Axis (ComboChart)

```tsx
<ComboChart
  data={data}
  xKey="month"
  leftAxis={{
    series: [{ key: 'revenue', name: 'Revenue', type: 'bar' }],
    label: 'Revenue ($)',
  }}
  rightAxis={{
    series: [{ key: 'growth', name: 'Growth %', type: 'line' }],
    label: 'Growth (%)',
  }}
/>
```

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type {
  ChartTheme,
  ThemeName,
  Annotation,
  ChartClickEvent,
  TooltipRenderProps,
} from '@derpdaderp/chartkit'
```

## Browser Support

ChartKit supports all modern browsers (Chrome, Firefox, Safari, Edge). IE11 is not supported.

## License

MIT

## Links

- [Documentation](https://chartkit.dev)
- [GitHub](https://github.com/toddynho/chartkit)
- [NPM](https://www.npmjs.com/package/@derpdaderp/chartkit)
