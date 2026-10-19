# Trend / regression line

ChartKit: **none**

Fitted line over scatter data

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

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

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b2aaa2671f30.

https://chartkit.dev/features.json
