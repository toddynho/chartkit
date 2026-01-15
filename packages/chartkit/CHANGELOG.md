# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
