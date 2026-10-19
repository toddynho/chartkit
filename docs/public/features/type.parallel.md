# Parallel coordinates

ChartKit: **none**

Multivariate lines across parallel axes

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.type=parallel | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | chart.parallelCoordinates | dts-path (strong) | highcharts/highcharts.d.ts:6469 |
| Plotly.js | native | trace.type=parcoords | dts-path (strong) | plot-schema.json#traces.parcoords |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 @nivo/parallel-coordinates exists but ships no types in 0.99 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 documented fold/window recipe |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~parallel | dts-grep (weak) | @antv/g2/lib/index.d.ts:56 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
