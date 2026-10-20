# Caption / footnote / source

ChartKit: **none**

Text under the chart (source attribution)

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is quadrant captions

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 graphic text |
| Highcharts | native | caption.text, credits.text | dts-path (strong) | highcharts/highcharts.d.ts:5739, highcharts/highcharts.d.ts:9115 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes layout.annotations in paper coords |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~caption | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:141 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | AgChartOptions.footnote | dts-path (strong) | ag-charts-types/dist/types/src/chart/chartOptions.d.ts:254 |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ab69724f4cc6.

https://chartkit.dev/features.json
