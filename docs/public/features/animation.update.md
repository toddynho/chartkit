# Animated data updates

ChartKit: **native**

Smooth transitions when data changes

Matrix status: `native`. Verification: `dts-grep` (weak).

interact enter/update motion

Source: chartkit:packages/core/src/generated/schema.ts:399

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~transitions | dts-grep (weak) | chart.js/dist/types/index.d.ts:1758 transitions.active / resize / show / hide |
| Recharts | native | Line.animateNewValues | dts-path (strong) | recharts/types/cartesian/Line.d.ts:47 |
| Apache ECharts | native | ~universalTransition | dts-grep (weak) | echarts/types/dist/shared.d.ts:4627 |
| Highcharts | native | ~update\|redraw | dts-grep (weak) | highcharts/highcharts.src.d.ts:126 series.setData animates |
| Plotly.js | native | ~animate | dts-grep (weak) | @types/plotly.js/index.d.ts:433 Plotly.animate |
| Nivo | native | Line.motionConfig | dts-path (strong) | @nivo/line/dist/types/types.d.ts:189 |
| Victory | native | VictoryChart.animate | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:20 onLoad / onExit / onEnter |
| visx | native | ~animat | dts-grep (weak) | @visx/sankey/node_modules/@types/d3-shape/index.d.ts:275 |
| ApexCharts | native | chart.animations.dynamicAnimation | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2347 |
| Tremor (npm) | partial | LineChart.showAnimation | dts-path (strong) | @tremor/react/dist/index.d.ts:38 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~animation | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:3 |
| amCharts 5 | native | ~interpolationDuration\|animate | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:147 |
| Google Charts | native | ~animation | dts-grep (weak) | @types/google.visualization/index.d.ts:518 |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | partial | LineChart.skipAnimation | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:71 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~update | dts-grep (weak) | @antv/g2/lib/api/utils.d.ts:20 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
