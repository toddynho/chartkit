# Coordinate systems (polar, transpose, geo)

ChartKit: **none**

Switch coordinate system of the same marks

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~RadialLinearScale | dts-grep (weak) | chart.js/dist/types/index.d.ts:3514 radial scale for radar/polarArea only |
| Recharts | native | PolarAngleAxis, PolarRadiusAxis | dts-path (strong) | recharts/types/polar/PolarAngleAxis.d.ts:182, recharts/types/polar/PolarRadiusAxis.d.ts:176 |
| Apache ECharts | native | polar, angleAxis | dts-path (strong) | echarts/types/dist/shared.d.ts:12572, echarts/types/dist/shared.d.ts:12574 |
| Highcharts | native | chart.polar | dts-path (strong) | highcharts/highcharts.d.ts:6526 |
| Plotly.js | native | layout.polar | dts-path (strong) | plot-schema.json#layout.layoutAttributes.polar |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictoryChart.polar | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:40 |
| visx | native | GridPolar, LineRadial | dts-path (strong) | @visx/grid/lib/grids/GridPolar.d.ts:113, @visx/shape/lib/shapes/LineRadial.d.ts:11 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~projection | dts-grep (weak) | @observablehq/plot/src/projection.d.ts:5 |
| Vega-Lite | native | ~projection\|theta | dts-grep (weak) | 841:        "theta" |
| AG Charts | native | ~angle-category\|radius-number | dts-grep (weak) | ag-charts-types/dist/types/src/chart/radiusAxisOptions.d.ts:11 polar axes |
| amCharts 5 | native | RadarChart | dts-path (strong) | @amcharts/amcharts5/.internal/charts/radar/RadarChart.d.ts:72 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~rotationAxis\|radiusAxis | dts-grep (weak) | @mui/x-charts/index.d.ts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~coordinate | dts-grep (weak) | @antv/g2/lib/index.d.ts:52 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
