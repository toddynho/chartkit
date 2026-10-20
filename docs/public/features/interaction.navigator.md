# Overview navigator / range slider

ChartKit: **none**

Mini-chart or slider to choose the visible window

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | Brush | dts-path (strong) | recharts/types/cartesian/Brush.d.ts:111 Brush with mini chart children |
| Apache ECharts | native | SliderDataZoomComponentOption | dts-path (strong) | echarts/types/dist/shared.d.ts:10769 dataZoom type slider |
| Highcharts | native | navigator.enabled, rangeSelector | dts-path (strong) | highcharts/highcharts.d.ts:90060, highcharts/highcharts.d.ts:93684 |
| Plotly.js | native | layout.xaxis.rangeslider | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.rangeslider |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 VictoryBrushContainer second chart |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | partial | chart.brush | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1917 synced brush chart |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~navigator | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:31 |
| amCharts 5 | native | ~Scrollbar\|XYChartScrollbar | dts-grep (weak) | @amcharts/amcharts5/xy.d.ts:2 |
| Google Charts | native | ~ChartRangeFilter\|ControlWrapper | dts-grep (weak) | @types/google.visualization/index.d.ts:1355 dashboard ChartRangeFilter control |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 demo |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | ~ChartsZoomSlider | dts-grep (weak) | @mui/x-charts-pro/index.d.ts:48 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~slider | dts-grep (weak) | @antv/g2/lib/index.d.ts:116 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 668873d6cd29.

https://chartkit.dev/features.json
