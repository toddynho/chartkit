# Tick marks size / visibility

ChartKit: **none**

Show/hide tick marks and set their length

Matrix status: `none`. Verification: `dts-absence` (absence).

no tick-mark options

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~tickLength\|drawTicks | dts-grep (weak) | chart.js/dist/types/index.d.ts:3039 |
| Recharts | native | XAxis.tickSize, XAxis.tickLine | dts-path (strong) | recharts/types/util/types.d.ts:789, recharts/types/util/types.d.ts:784 |
| Apache ECharts | native | xAxis.axisTick.show, xAxis.axisTick.length | dts-path (strong) | echarts/types/dist/shared.d.ts:2762, echarts/types/dist/shared.d.ts:2764 |
| Highcharts | native | xAxis.tickLength, xAxis.tickWidth | dts-path (strong) | highcharts/highcharts.d.ts:108716, highcharts/highcharts.d.ts:108766 |
| Plotly.js | native | layout.xaxis.ticklen, layout.xaxis.ticks | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.ticklen, plot-schema.json#layout.layoutAttributes.xaxis.ticks |
| Nivo | native | ~tickSize | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:101 |
| Victory | native | VictoryAxis.style | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:46 ticks style |
| visx | native | AxisBottom.tickLength, AxisBottom.hideTicks | dts-path (strong) | @visx/axis/lib/types.d.ts:71, @visx/axis/lib/types.d.ts:32 |
| ApexCharts | native | xaxis.axisTicks.show, xaxis.axisTicks.height | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4956, apexcharts/types/apexcharts.d.ts:4959 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~tickSize | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:563 |
| Vega-Lite | native | ~tickSize\|ticks | dts-grep (weak) | 1064:              "description" |
| AG Charts | native | ~tick | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:59 |
| amCharts 5 | native | ~minorGridEnabled | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-step/config.json:71 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.axes.ticks.size | dts-path (strong) | uplot/dist/uPlot.d.ts:1054 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~disableTicks\|tickSize | dts-grep (weak) | @mui/x-charts/ChartsYAxis/utilities.d.ts:7 |
| Mermaid (chart-ish diagrams only) | native | ~showTick\|tickLength | dts-grep (weak) | mermaid/dist/config.type.d.ts:1125 |
| AntV G2 | native | ~tickLength | dts-grep (weak) | @antv/g2/lib/component/axis.d.ts:16 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
