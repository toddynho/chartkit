# Selection (point / multi / series)

ChartKit: **native**

Persisted selection of points or series

Matrix status: `native`. Verification: `runtime-probe` (strong).

point or series. Shift, Ctrl, or Meta adds. Escape or a background click clears. --ck-dim fades the rest and --ck-selected strokes the chosen mark.

Source: packages/core/src/interact.ts

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
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "interaction": {
    "select": "point"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | series.selectedMode | dts-path (strong) | echarts/types/dist/shared.d.ts:8378 |
| Highcharts | native | plotOptions.series.allowPointSelect | dts-path (strong) | highcharts/options/series.d.ts:568 |
| Plotly.js | native | layout.clickmode, ~selectedpoints | dts-path (strong) | plot-schema.json#layout.layoutAttributes.clickmode, @types/plotly.js/lib/ohlc.d.ts:80 |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictorySelectionContainer | dts-path (strong) | victory-selection-container/lib/victory-selection-container.d.ts:91 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | states.active.allowMultipleDataPointsSelection | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2432 |
| Tremor (npm) | partial | BarChart.onValueChange | dts-path (strong) | @tremor/react/dist/index.d.ts:74 single active category |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | native | ~SelectionParameter\|point | dts-grep (weak) | 350:              "description" params select: point \| interval |
| AG Charts | native | ~selection | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:11 |
| amCharts 5 | native | ~active\|toggleKey | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/ExportingMenu.d.ts:138 |
| Google Charts | native | ~selectionMode | dts-grep (weak) | @types/google.visualization/index.d.ts:506 |
| uPlot | native | Options.select | dts-path (strong) | uplot/dist/uPlot.d.ts:386 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~highlightedItem\|onHighlightChange | dts-grep (weak) | @mui/x-charts-pro/Heatmap/seriesConfig/highlight.d.ts:6 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~elementSelect | dts-grep (weak) | @antv/g2/lib/index.d.ts:137 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
