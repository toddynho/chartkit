# Custom tooltip fields

ChartKit: **warns**

Add extra data fields or reorder tooltip rows

Matrix status: `none`. Verification: `runtime-probe` (strong).

accepted but not applied; validate() warns CK3012 since PR #16

No spec snippet. The option is accepted and `validate()` warns. It is not drawn.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~callbacks | dts-grep (weak) | chart.js/dist/types/index.d.ts:2681 |
| Recharts | partial | Tooltip.content | dts-path (strong) | recharts/types/component/Tooltip.d.ts:65 |
| Apache ECharts | native | tooltip.formatter, series.encode | dts-path (strong) | echarts/types/dist/shared.d.ts:8072, echarts/types/dist/shared.d.ts:8429 |
| Highcharts | native | tooltip.pointFormat | dts-path (strong) | highcharts/highcharts.d.ts:107468 {point.custom} |
| Plotly.js | native | trace.customdata, trace.hovertemplate | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,carpet,choropleth,…}.attributes.customdata, plot-schema.json#traces.{bar,barpolar,box,candlestick,choropleth,choroplethmap,…}.attributes.hovertemplate |
| Nivo | partial | Line.tooltip | dts-path (strong) | @nivo/line/dist/types/types.d.ts:165 |
| Victory | partial | VictoryTooltip | dts-path (strong) | victory-tooltip/lib/victory-tooltip.d.ts:66 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | tooltip.custom | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4852 |
| Tremor (npm) | partial | LineChart.customTooltip | dts-path (strong) | @tremor/react/dist/index.d.ts:80 |
| Observable Plot | native | ~channels | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:370 extra channels shown in tip |
| Vega-Lite | native | ~tooltip | dts-grep (weak) | 630:          "description" array of field defs |
| AG Charts | native | ~renderer | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineOptions.d.ts:1 |
| amCharts 5 | native | ~labelText | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:490 |
| Google Charts | native | ~tooltip | dts-grep (weak) | @types/google.visualization/index.d.ts:386 tooltip role column |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~valueFormatter | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:43 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~items | dts-grep (weak) | @antv/g2/lib/component/utils.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
