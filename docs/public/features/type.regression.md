# Trend / regression line

ChartKit: **native**

Fitted line over scatter data

Matrix status: `native`. Verification: `dts-path` (strong).

Regression overlay on scatter or a cartesian series: linear or loess, with an optional confidence band. Not a separate chart type.

Source: chartkit:packages/core/src/annotations.ts:19

## ChartKit spec

```json
{
  "version": "1",
  "type": "scatter",
  "data": [
    {
      "temp": 16,
      "yieldKg": 3
    },
    {
      "temp": 22,
      "yieldKg": 5
    }
  ],
  "encoding": {
    "x": "temp",
    "y": "yieldKg"
  },
  "a11y": {
    "alt": "Yield peaks at 22."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "annotations": [
    {
      "type": "regression",
      "method": "linear",
      "band": true,
      "label": "Fit"
    }
  ]
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | partial | Scatter.lineType=fitting | dts-path (strong) | recharts/types/cartesian/Scatter.d.ts:126 linear fit only, scatter series |
| Apache ECharts | plugin | — | npm (weak) | — |
| Highcharts | native | series.type=linearregression | dts-path (strong) | highcharts/options/abands.d.ts:1386 stock indicators module; or trendline |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | linearRegressionY, linearRegressionX | dts-path (strong) | @observablehq/plot/src/marks/linearRegression.d.ts:111, @observablehq/plot/src/marks/linearRegression.d.ts:87 |
| Vega-Lite | native | ~regression | dts-grep (weak) | 21349:    "RegressionTransform" regression transform |
| AG Charts | native | ~trendLine | dts-grep (weak) | ag-charts-enterprise/dist/types/src/features/annotations/scenes/fibonacciScene.d.ts:10 |
| amCharts 5 | native | RegressionSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/stock/drawing/RegressionSeries.d.ts:8 |
| Google Charts | native | ~trendlines | dts-grep (weak) | @types/google.visualization/index.d.ts:614 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against da8da9d595d9.

https://chartkit.dev/features.json
