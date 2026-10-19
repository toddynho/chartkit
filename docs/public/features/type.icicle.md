# Icicle / partition

ChartKit: **none**

Rectangular hierarchy partition

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | manual | SVGRenderer | dts-mechanism (weak) | highcharts/highcharts.d.ts:115777 |
| Plotly.js | native | — | doc-cited (weak) | — trace type 'icicle' (missing from @types/plotly.js) |
| Nivo | native | Icicle | dts-path (strong) | @nivo/icicle/dist/types/Icicle.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Partition | dts-path (strong) | @visx/hierarchy/lib/hierarchies/Partition.d.ts:26 |
| ApexCharts | native | chart.type=icicle | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | native | ~Partition | dts-grep (weak) | @amcharts/amcharts5/hierarchy.d.ts:9 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=partition | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
