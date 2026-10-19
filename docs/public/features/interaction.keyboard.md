# Keyboard navigation

ChartKit: **native**

Move focus between data points with the keyboard

Matrix status: `native`. Verification: `dts-path` (strong).

ArrowLeft/ArrowRight with aria-live announcements; must be set true

Source: chartkit:packages/core/src/generated/schema.ts:1181

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40
    },
    {
      "quarter": "Q2",
      "units": 55
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": "units"
  },
  "a11y": {
    "alt": "Units rose in Q2.",
    "keyboard": true
  },
  "size": {
    "width": 640,
    "height": 260
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | ~accessibilityLayer | dts-grep (weak) | recharts/types/state/rootPropsSlice.d.ts:9 RechartsChart accessibilityLayer |
| Apache ECharts | native | aria.enabled | dts-path (strong) | echarts/types/dist/shared.d.ts:8470 aria describes chart; no keyboard point navigation |
| Highcharts | native | accessibility.keyboardNavigation.enabled | dts-path (strong) | highcharts/highcharts.d.ts:11867 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | Line.isFocusable, ~keyboard\|focusable | dts-path (strong) | @nivo/line/dist/types/types.d.ts:193, @nivo/stream/dist/types/props.d.ts:44 isFocusable / role props on some charts |
| Victory | native | ~VictoryAccessibleGroup\|tabIndex | dts-grep (weak) | victory-zoom-container/lib/victory-zoom-container.d.ts:70 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~keyboard | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:185 keyboard navigation (accessibility) |
| amCharts 5 | native | ~focusable\|tabindexOrder | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/stock/toolbar/StockToolbar.d.ts:31 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | unverified (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
