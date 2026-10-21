# Vector / wind barb

ChartKit: **none**

Direction + magnitude glyphs

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=vector, series.type=windbarb | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.type=cone | dts-path (strong) | plot-schema.json#traces.cone 3D cones |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | vector | dts-path (strong) | @observablehq/plot/src/marks/vector.d.ts:92 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=vector | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
