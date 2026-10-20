# Beeswarm / strip plot

ChartKit: **none**

Jittered or packed 1D points

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~jitter | dts-grep (weak) | echarts/types/src/export/features.d.ts:5 axis jitter (ECharts 6) |
| Highcharts | native | plotOptions.scatter.jitter | dts-path (strong) | highcharts/options/scatter.d.ts:2838 |
| Plotly.js | partial | trace.boxpoints | dts-path (strong) | plot-schema.json#traces.{box}.attributes.boxpoints box with all points + jitter |
| Nivo | native | SwarmPlot | dts-path (strong) | @nivo/swarmplot/dist/types/SwarmPlot.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | ~beeswarm | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:3759 unit chart (apexcharts/unit) beeswarm layout |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | dodgeY, dodgeX | dts-path (strong) | @observablehq/plot/src/transforms/dodge.d.ts:74, @observablehq/plot/src/transforms/dodge.d.ts:62 |
| Vega-Lite | partial | ~xOffset | dts-grep (weak) | 5161:        "xOffset" random offset recipe |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~beeswarm | dts-grep (weak) | @antv/g2/lib/index.d.ts:88 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against f0e644ec234d.

https://chartkit.dev/features.json
