# Violin plot

ChartKit: **none**

Mirrored density per group

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — includes violin |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | manual | SVGRenderer | dts-mechanism (weak) | highcharts/highcharts.d.ts:115777 |
| Plotly.js | native | trace.type=violin | dts-path (strong) | plot-schema.json#traces.violin |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ViolinPlot | dts-path (strong) | @visx/stats/lib/ViolinPlot.d.ts:20 |
| ApexCharts | native | chart.type=violin | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 areaX with density transform (documented) |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 density transform + area |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 density mark + polygon |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 1eae17b953e2.

https://chartkit.dev/features.json
