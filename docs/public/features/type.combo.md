# Combined bar + line

ChartKit: **native**

Mixed mark types sharing an x axis

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "combo",
  "data": [
    {
      "week": "W1",
      "orders": 30,
      "rate": 0.4
    },
    {
      "week": "W2",
      "orders": 36,
      "rate": 0.55
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "orders",
        "mark": "bar"
      },
      {
        "field": "rate",
        "mark": "line",
        "axis": "y2"
      }
    ]
  },
  "axes": {
    "y2": {
      "title": "Rate"
    }
  },
  "a11y": {
    "alt": "Both rose."
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
| Chart.js | native | ChartConfiguration.data.datasets.type | dts-path (strong) | chart.js/dist/types/index.d.ts:3824 per-dataset type |
| Recharts | native | ComposedChart | dts-path (strong) | recharts/types/chart/ComposedChart.d.ts:8 |
| Apache ECharts | native | series.type=bar | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 mix series types freely |
| Highcharts | native | series.type=line | dts-path (strong) | highcharts/options/abands.d.ts:1386 mix series types freely |
| Plotly.js | native | trace.type=bar | dts-path (strong) | plot-schema.json#traces.bar mix trace types |
| Nivo | partial | Bar.layers | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:187 custom layer for line |
| Victory | native | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 compose children |
| visx | native | XYChart | dts-path (strong) | @visx/xychart/lib/components/XYChart.d.ts:46 compose series |
| ApexCharts | native | series.type | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2544 per-series type |
| Tremor (npm) | none | — | dts-absence (absence) | — one mark type per chart |
| Observable Plot | native | marks | dts-path (strong) | @observablehq/plot/src/mark.d.ts:496 layer marks freely |
| Vega-Lite | native | ~layer | dts-grep (weak) | 579:          "description" |
| AG Charts | native | series.type=line | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 mix series in one cartesian chart |
| amCharts 5 | native | LineSeries, ColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:70, @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:33 mix series |
| Google Charts | native | ComboChart | dts-path (strong) | @types/google.visualization/index.d.ts:1299 |
| uPlot | partial | ~bars\?: | dts-grep (weak) | 788:			bars? per-series paths |
| TradingView Lightweight Charts | partial | HistogramSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:9 add different series types to one chart |
| MUI X Charts | native | BarChart, ~ChartContainer | dts-path (strong) | @mui/x-charts/BarChart/BarChart.d.mts:72 compose BarPlot + LinePlot in ChartsContainer |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 xychart-beta allows bar + line |
| AntV G2 | native | ~children | dts-grep (weak) | @antv/g2/lib/composition/view.d.ts:5 view with child marks |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a59d27e1bde.

https://chartkit.dev/features.json
