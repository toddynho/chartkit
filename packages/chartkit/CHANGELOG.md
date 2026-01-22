# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2026-01-22

### Added

#### ScatterChart Log Scale Support
- **Logarithmic Scales** - New `xScaleType` and `yScaleType` props support `'linear'` or `'log'`
- **Log Scale Utilities** - Added `logScale`, `inverseLogScale`, and `logTicks` functions
- Perfect for visualizing data with exponential distributions (revenue vs users, etc.)

```tsx
<ScatterChart
  data={data}
  xKey="revenue"
  yKey="users"
  xScaleType="log"
  yScaleType="log"
  theme="midnight"
/>
```

---

## [0.4.0] - 2026-01-21

### Added

#### CandlestickChart
- **New Component** - Financial OHLC candlestick charts for stock/crypto data
- **Zoom & Pan** - Mouse wheel zoom and drag-to-pan with smooth animations
- **Crosshair** - Precise cursor tracking with crosshair lines
- **Volume Bars** - Optional volume histogram below price chart
- **Custom Formatting** - `formatY` prop for price axis labels

#### Visual Polish
- **Improved Area Gradients** - Smoother fade from 0.4 to 0.05 opacity for LineChart and StackedArea
- **Better Grid Styling** - Solid lines (not dashed) with 0.4 opacity default
- **Enhanced Tooltips** - Softer shadows, backdrop blur, 10px border radius
- **Theme Series Colors** - Added `series` color array to all themes for multi-series charts

### Changed
- Improved default grid appearance across all chart types
- Better tooltip positioning and styling

---

## [0.3.0] - 2026-01-15

### Breaking Changes

- **Renamed `MonitorLine` to `LineChart`** - The component has been renamed to follow standard charting library conventions. `MonitorLine` is still exported as a deprecated alias for backward compatibility.
  ```tsx
  // Before
  import { MonitorLine } from '@derpdaderp/chartkit';
  
  // After
  import { LineChart } from '@derpdaderp/chartkit';
  ```

### Added

#### LineChart Enhancements

- **Dual Y-Axis Support** - Display series with different scales using `yAxisLeft`, `yAxisRight`, and `yAxisId` per series
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

- **Curve Types** - Choose from 5 interpolation methods: `linear`, `monotone`, `step`, `stepBefore`, `stepAfter`
  ```tsx
  <LineChart data={data} series={series} curve="monotone" theme="midnight" />
  ```

- **Area Fill** - Fill the area under lines with `area` and `areaOpacity` per series
  ```tsx
  <LineChart
    data={data}
    series={[{ key: 'value', label: 'Sales', area: true, areaOpacity: 0.2 }]}
    theme="emerald"
  />
  ```

- **Show/Hide Dots** - Control data point visibility with `showDots`, `dotSize`, and `dotsOnHover`

- **Custom Series Styling** - Override colors and stroke patterns per series with `color`, `strokeDasharray`, and `strokeWidth`

- **YAxisConfig Type** - New type for Y-axis configuration with `unit`, `min`, `max`, `tickCount`, and `format`

- **CurveType Export** - Exported for TypeScript users

### Changed

- LineChart now uses `system-ui` font instead of JetBrains Mono for better cross-platform rendering

---

## [0.2.0] - 2026-01-15

### Added

#### Responsive by Default
- **Sparkline** and **MiniArea** now automatically fill their container width when `width` prop is omitted
  ```tsx
  // Just works - fills parent container
  <div style={{ width: '100%' }}>
    <Sparkline data={data} theme="midnight" />
  </div>
  ```

#### Developer Experience Improvements (based on community feedback)
- **Responsive Mode** - Added `responsive` prop to MonitorLine for automatic width sizing
  ```tsx
  <MonitorLine responsive height={200} data={data} series={series} theme="neon" />
  ```
- **useAutoTheme Hook** - Automatic dark/light theme switching based on DOM class or system preference
  ```tsx
  const theme = useAutoTheme({ light: 'sunset', dark: 'neon' });
  ```
- **Simplified Single-Series API** - New `dataKey` and `label` props for single-series charts
  ```tsx
  <MonitorLine data={data} dataKey="connections" label="Active Connections" theme="neon" />
  ```
- **Grid Customization** - New `grid` prop for fine-grained control over grid lines
  ```tsx
  <MonitorLine 
    grid={{ horizontal: true, vertical: false, strokeDasharray: "3 3", color: "rgba(255,255,255,0.1)" }}
  />
  ```
- **GridOptions Type** - Exported for TypeScript users

### Changed
- MonitorLine now uses internal resize observer when `responsive={true}`
- Series prop is now optional when using `dataKey` for single-series charts

---

## [0.1.0] - 2024-01-15

### Added

#### Chart Components
- **Sparkline** - Minimal inline line charts
- **MiniArea** - Area charts with gradient fills
- **MonitorLine** - Multi-series line charts with tooltips, click events, and annotations
- **StackedArea** - Stacked area charts with interactive legend
- **BarChart** - Grouped bar charts with click events and annotations
- **DonutChart** - Donut/pie charts with customizable center content
- **ScatterChart** - Scatter and bubble charts with category support
- **ComboChart** - Combined line, bar, and area charts with dual Y-axis
- **Heatmap** - GitHub-style activity heatmaps
- **SpikeChart** - Event/activity spike visualization
- **KpiCard** - KPI cards with embedded sparklines and delta indicators
- **ProgressRing** - Circular progress indicators
- **GaugeChart** - Semicircular gauges with configurable ranges

#### Utility Components
- **Legend** - Standalone interactive legend component
- **ResponsiveChart** - Auto-resizing container wrapper

#### Theming
- **ThemeProvider** - Context-based theme provider
- **useTheme** - Hook for accessing current theme
- **17 Built-in Themes**:
  - Dark (13): midnight, emerald, mono, slate, arctic, orchid, obsidian, neon, mocha, owl, retro, copper, rose
  - Light (4): sunset, silver, pearl, latte
- Custom theme support via theme objects

#### Features
- Click event handlers (`onBarClick`, `onDataPointClick`)
- Custom tooltip render props (`renderTooltip`)
- Annotations (reference lines and areas)
- Null value handling (`connectNulls`)
- Responsive design with `ResponsiveChart` wrapper

#### Developer Experience
- Full TypeScript support with comprehensive types
- Zero runtime dependencies (pure SVG)
- ESM and CommonJS builds
- React Server Components compatible
