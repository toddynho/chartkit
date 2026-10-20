# Tree / org chart / dendrogram

ChartKit: **none**

Hierarchical node-link layout

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match marks.ts:93 is the word "treemap"

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — tree/dendrogram controllers |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | series.type=tree | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=organization, series.type=treegraph | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | Tree | dts-path (strong) | @nivo/tree/dist/types/Tree.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Tree, Cluster | dts-path (strong) | @visx/hierarchy/lib/hierarchies/Tree.d.ts:42, @visx/hierarchy/lib/hierarchies/Cluster.d.ts:39 |
| ApexCharts | plugin | — | npm (weak) | — separate ApexTree product |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | tree, cluster | dts-path (strong) | @observablehq/plot/src/marks/tree.d.ts:44, @observablehq/plot/src/marks/tree.d.ts:56 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native (ent) | series.type=organization | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~Tree | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:243 |
| Google Charts | native | OrgChart | dts-path (strong) | @types/google.visualization/index.d.ts:1678 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | MarkTypes=tree | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against f0e644ec234d.

https://chartkit.dev/features.json
