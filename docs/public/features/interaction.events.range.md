# Range / zoom change events

ChartKit: **native**

Callback when the visible range changes

Matrix status: `native`. Verification: `dts-grep` (weak).

CustomEvent 'rangechange' from interact

Source: chartkit:packages/core/schema/chartkit.schema.json:1900

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — onZoomComplete |
| Recharts | native | Brush.onChange | dts-path (strong) | recharts/types/cartesian/Brush.d.ts:64 |
| Apache ECharts | native | ~datazoom | dts-grep (weak) | echarts/types/src/i18n/langZH.d.ts:29 |
| Highcharts | native | xAxis.events.afterSetExtremes | dts-path (strong) | highcharts/highcharts.d.ts:107826 |
| Plotly.js | native | ~plotly_relayout | dts-grep (weak) | @types/plotly.js/index.d.ts:419 |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryZoomContainer.onZoomDomainChange | dts-path (strong) | victory-zoom-container/lib/victory-zoom-container.d.ts:18 |
| visx | unknown | ~onTransform | unverified (unknown) | — |
| ApexCharts | native | chart.events.zoomed | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1851 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~addSignalListener\|signal | dts-grep (weak) | 4271:          "description" |
| AG Charts | native | ~zoom | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:43 |
| amCharts 5 | native | ~rangechanged | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/Scrollbar.d.ts:73 |
| Google Charts | unknown | ~rangechange\|statechange | unverified (unknown) | — |
| uPlot | native | Options.hooks.setScale | dts-path (strong) | uplot/dist/uPlot.d.ts:1141 |
| TradingView Lightweight Charts | native | ITimeScaleApi.subscribeVisibleTimeRangeChange | dts-path (strong) | lightweight-charts/dist/typings.d.ts:2981 |
| MUI X Charts | native (pro) | ~onZoomChange | dts-grep (weak) | @mui/x-charts-pro/FunnelChart/FunnelChart.d.ts:12 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~sliderX:filter\|on | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
