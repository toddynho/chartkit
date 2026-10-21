# Trend / average / statistic lines

ChartKit: **native**

Auto mean, median or regression lines

Matrix status: `native`. Verification: `dts-path` (strong).

Mean, median, or linear, each with a label.

Source: chartkit:packages/core/src/annotations.ts:19

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
  "annotations": [
    {
      "type": "trendline",
      "method": "mean",
      "label": "Mean"
    }
  ]
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — (manual value) |
| Recharts | partial | Scatter.lineType=fitting | dts-path (strong) | recharts/types/cartesian/Scatter.d.ts:126 |
| Apache ECharts | native | series.markLine | dts-path (strong) | echarts/types/dist/shared.d.ts:12499 type: 'average' \| 'min' \| 'max' \| 'median' |
| Highcharts | native | series.type=trendline | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | linearRegressionY, ~reduce | dts-path (strong) | @observablehq/plot/src/marks/linearRegression.d.ts:111, @observablehq/plot/src/scales.d.ts:519 ruleY(data, groupZ({y:'mean'})) |
| Vega-Lite | native | ~regression\|loess\|aggregate | dts-grep (weak) | 5:    "Aggregate" |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | AverageSeries, RegressionSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/stock/drawing/AverageSeries.d.ts:8, @amcharts/amcharts5/.internal/charts/stock/drawing/RegressionSeries.d.ts:8 |
| Google Charts | native | ~trendlines | dts-grep (weak) | @types/google.visualization/index.d.ts:614 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~mean\|median | dts-grep (weak) | @antv/g2/lib/spec/transform.d.ts:26 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 507c518833a4.

https://chartkit.dev/features.json
