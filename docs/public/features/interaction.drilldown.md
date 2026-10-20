# Drilldown

ChartKit: **none**

Click a mark to drill into a child dataset

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | series.nodeClick | dts-path (strong) | echarts/types/dist/shared.d.ts:11442 treemap/sunburst zoomToNode; universal transition for drilldown |
| Highcharts | native | drilldown.series | dts-path (strong) | highcharts/highcharts.d.ts:10666 drilldown module |
| Plotly.js | partial | ~level | dts-grep (weak) | @types/plotly.js/index.d.ts:265 treemap/sunburst/icicle drill by click |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~drilldown\|navigat | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:31 treemap/sunburst click to drill |
| amCharts 5 | native | ~zoomable\|selectedDataItem | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:17 hierarchy zoomable / drill |
| Google Charts | native | ~maxDepth | dts-grep (weak) | @types/google.visualization/index.d.ts:1148 TreeMap drill by click |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~drillDown | dts-grep (weak) | @antv/g2/lib/index.d.ts:156 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ab69724f4cc6.

https://chartkit.dev/features.json
