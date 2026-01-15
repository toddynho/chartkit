# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-15

### Added

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
