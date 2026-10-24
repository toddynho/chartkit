# Lifecycle hooks / events

ChartKit: **native**

beforeDraw, afterRender etc.

Matrix status: `native`. Verification: `dts-grep` (weak).

DOM CustomEvents only

Source: chartkit:packages/core/schema/chartkit.schema.json:1900

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Plugin.beforeDraw, Plugin.afterDraw | dts-path (strong) | chart.js/dist/types/index.d.ts:1026, chart.js/dist/types/index.d.ts:1034 |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~rendered\|finished | dts-grep (weak) | echarts/types/src/util/animation.d.ts:18 chart.on('finished') |
| Highcharts | native | chart.events.render, chart.events.load | dts-path (strong) | highcharts/highcharts.d.ts:6185, highcharts/highcharts.d.ts:6154 |
| Plotly.js | native | ~plotly_afterplot | dts-grep (weak) | @types/plotly.js/index.d.ts:432 |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryChart.events | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:18 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | chart.events.mounted, chart.events.updated | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1837, apexcharts/types/apexcharts.d.ts:1838 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~seriesNodeClick\|listeners | dts-grep (weak) | ag-charts-community/dist/types/src/core/eventsHub.d.ts:168 |
| amCharts 5 | native | ~events\|framestarted | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:1 |
| Google Charts | unknown | ~ready | unverified (unknown) | — |
| uPlot | native | Options.hooks.draw, Options.hooks.ready | dts-path (strong) | uplot/dist/uPlot.d.ts:1171, uplot/dist/uPlot.d.ts:1174 |
| TradingView Lightweight Charts | native | ~subscribeCrosshairMove | dts-grep (weak) | 1720:	 * chart.subscribeCrosshairMove(myCrosshairMoveHandler); |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | ~postRenderCallback | dts-grep (weak) | mermaid/dist/mermaid.d.ts:34 |
| AntV G2 | native | ~afterrender\|on | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
