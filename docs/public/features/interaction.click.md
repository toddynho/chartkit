# Click events on marks

ChartKit: **native**

Callback with the clicked datum

Matrix status: `native`. Verification: `runtime-probe` (strong).

Host events pointclick, seriesclick, and legendclick carry series, datum, index, x, y, value, and row. Enter or Space on a focused point emits pointclick. These are events, not spec keys.

Source: packages/core/src/interact.ts

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~onClick | dts-grep (weak) | chart.js/dist/types/index.d.ts:1703 options.onClick + getElementsAtEventForMode |
| Recharts | native | Bar.onClick, LineChart.onClick | dts-path (strong) | recharts/types/cartesian/Bar.d.ts:279, recharts/types/chart/types.d.ts:9 |
| Apache ECharts | native | ~on | dts-grep (weak) | echarts/types/src/i18n/langZH.d.ts:1 chart.on('click', handler) |
| Highcharts | native | plotOptions.series.point.events.click | dts-path (strong) | highcharts/highcharts.d.ts:97484 |
| Plotly.js | native | ~plotly_click | dts-grep (weak) | @types/plotly.js/index.d.ts:415 |
| Nivo | native | Bar.onClick | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:133 |
| Victory | native | VictoryBar.events | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:12 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 DOM events on primitives |
| ApexCharts | native | chart.events.dataPointSelection, chart.events.click | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1846, apexcharts/types/apexcharts.d.ts:1841 |
| Tremor (npm) | native | LineChart.onValueChange | dts-path (strong) | @tremor/react/dist/index.d.ts:74 |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 attach listeners to the SVG |
| Vega-Lite | native | ~addEventListener\|signal | dts-grep (weak) | 4271:          "description" vega View API via vega-embed |
| AG Charts | native | ~nodeClick\|seriesNodeClick | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/commonOptions.d.ts:18 |
| amCharts 5 | native | ~events | dts-grep (weak) | @amcharts/amcharts5/map.d.ts:2 sprite.events.on('click') |
| Google Charts | native | ~select\|addListener | dts-grep (weak) | @types/google.visualization/index.d.ts:396 'select' event |
| uPlot | native | Options.hooks | dts-path (strong) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | IChartApi.subscribeClick | dts-path (strong) | lightweight-charts/dist/typings.d.ts:1667 |
| MUI X Charts | native | LineChart.onMarkClick, BarChart.onItemClick | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:66, @mui/x-charts/BarChart/BarPlot.d.mts:23 |
| Mermaid (chart-ish diagrams only) | native | ~click | dts-grep (weak) | mermaid/dist/themes/theme-redux.d.ts:86 Mermaid click directives on flowcharts (not charts) |
| AntV G2 | native | ~on | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against fb308ab4f88e.

https://chartkit.dev/features.json
