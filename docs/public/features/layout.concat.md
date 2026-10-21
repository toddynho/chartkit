# Composed dashboards / concatenation

ChartKit: **none**

Multiple views in one spec

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | grid | dts-path (strong) | echarts/types/dist/shared.d.ts:12570 multiple coordinate systems in one option |
| Highcharts | none | — | dts-absence (absence) | — |
| Plotly.js | native | layout.grid | dts-path (strong) | plot-schema.json#layout.layoutAttributes.grid |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~hconcat\|vconcat | dts-grep (weak) | 5232:          "description" |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | native | Dashboard | dts-path (strong) | @types/google.visualization/index.d.ts:1352 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | IChartApi.panes | dts-path (strong) | lightweight-charts/dist/typings.d.ts:1779 |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~spaceFlex\|spaceLayer | dts-grep (weak) | @antv/g2/lib/index.d.ts:159 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
