# Vanilla JS / framework-agnostic core

ChartKit: **native**

Usable without any UI framework

Matrix status: `native`. Verification: `dts-grep` (weak).

@chartkitdev/vanilla mount(el, spec)

Source: chartkit:packages/vanilla/src/global-charts.ts:4

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Chart | dts-path (strong) | chart.js/dist/types/index.d.ts:494 new Chart(canvas, config) |
| Recharts | none | — | dts-absence (absence) | — React only |
| Apache ECharts | native | ~init | dts-grep (weak) | echarts/types/src/core/lifecycle.d.ts:27 echarts.init(el) |
| Highcharts | native | ~chart | dts-grep (weak) | highcharts/highstock.src.d.ts:6 Highcharts.chart(el, options) |
| Plotly.js | native | ~newPlot | dts-grep (weak) | @types/plotly.js/index.d.ts:39 |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | ~class ApexCharts | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:109 new ApexCharts(el, options) |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | plot | dts-path (strong) | @observablehq/plot/src/plot.d.ts:427 |
| Vega-Lite | plugin | — | npm (weak) | — |
| AG Charts | native | ~create | dts-grep (weak) | ag-charts-types/dist/types/src/integratedCharts.d.ts:96 AgCharts.create(options) |
| amCharts 5 | native | ~Root | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:1 am5.Root.new(el) |
| Google Charts | native | LineChart | dts-path (strong) | @types/google.visualization/index.d.ts:750 new google.visualization.LineChart(el) |
| uPlot | native | ~uPlot | dts-grep (weak) | 1:declare class uPlot { new uPlot(opts, data, el) |
| TradingView Lightweight Charts | native | ~createChart | dts-grep (weak) | 212:export declare function createChart(container |
| MUI X Charts | none | — | dts-absence (absence) | — React only |
| Mermaid (chart-ish diagrams only) | native | ~render\|run | dts-grep (weak) | mermaid/dist/utils.d.ts:94 |
| AntV G2 | native | ~Chart | dts-grep (weak) | @antv/g2/lib/index.d.ts:141 new Chart({container}) |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a03bfbe111f.

https://chartkit.dev/features.json
