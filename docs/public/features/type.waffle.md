# Waffle / unit chart

ChartKit: **none**

Proportions as a grid of squares or icons

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=item | dts-path (strong) | highcharts/options/abands.d.ts:1386 item chart |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Waffle | dts-path (strong) | @nivo/waffle/dist/types/Waffle.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=waffle | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | waffleY, waffleX | dts-path (strong) | @observablehq/plot/src/marks/waffle.d.ts:53, @observablehq/plot/src/marks/waffle.d.ts:86 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
