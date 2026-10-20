# Minor ticks / minor grid

ChartKit: **none**

Secondary tick level

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | ~minor | unverified (unknown) | — ticks.minor (Chart.js 4) |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | xAxis.minorTick, xAxis.minorSplitLine | dts-path (strong) | echarts/types/dist/shared.d.ts:2620, echarts/types/dist/shared.d.ts:2622 |
| Highcharts | native | xAxis.minorTicks, xAxis.minorGridLineWidth | dts-path (strong) | highcharts/highcharts.d.ts:108444, highcharts/highcharts.d.ts:108402 |
| Plotly.js | native | layout.xaxis.minor | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.minor |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~minor | dts-grep (weak) | ag-charts-community/dist/types/src/chart/series/cartesian/cartesianSeriesTypes.d.ts:87 |
| amCharts 5 | native | ~minorGridEnabled | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-step/config.json:71 |
| Google Charts | native | ~minorGridlines | dts-grep (weak) | @types/google.visualization/index.d.ts:531 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
