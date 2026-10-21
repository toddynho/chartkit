# Axis offset / origin crossing

ChartKit: **none**

Move axis to cross at zero or offset it from the plot

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match in React animation hook

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~offset\|position | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 position: {y: 0} |
| Recharts | native | YAxis.mirror, XAxis.y | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:112, @types/react/index.d.ts:3984 |
| Apache ECharts | native | xAxis.axisLine.onZero, xAxis.offset | dts-path (strong) | echarts/types/dist/shared.d.ts:2753, echarts/types/dist/shared.d.ts:2993 |
| Highcharts | native | xAxis.offset, ~crossing | dts-path (strong) | highcharts/highcharts.d.ts:108503, highcharts/highcharts.src.d.ts:7095 |
| Plotly.js | native | layout.xaxis.anchor, layout.xaxis.position | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.anchor, plot-schema.json#layout.layoutAttributes.xaxis.position |
| Nivo | native | ~tickPadding\|offset | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:194 |
| Victory | native | VictoryAxis.offsetX, VictoryAxis.crossAxis | dts-path (strong) | victory-axis/lib/victory-axis.d.ts:8, victory-axis/lib/victory-axis.d.ts:5 |
| visx | native | AxisBottom.top | dts-path (strong) | @visx/axis/lib/types.d.ts:116 |
| ApexCharts | native | xaxis.offsetY | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4905 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~insetTop\|anchor | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:314 |
| Vega-Lite | native | ~offset\|translate | dts-grep (weak) | 350:              "description" |
| AG Charts | native | ~crossAt | dts-grep (weak) | ag-charts-types/dist/types/src/presets/quadrant/quadrantOptions.d.ts:2 |
| amCharts 5 | partial | ~x\?:\|y\?: | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/ExportingCSS.d.ts:6 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~offset\|position | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:106 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~position | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40b908be291d.

https://chartkit.dev/features.json
