# Node/link (graph) data input

ChartKit: **native**

Nodes + links for sankey/network

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:603, chartkit:packages/core/src/generated/schema.ts:621

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | — | conflict (unknown) | — |
| Recharts | native | Sankey.data, ~links | dts-path (strong) | recharts/types/chart/Sankey.d.ts:114, recharts/types/chart/Sankey.d.ts:19 |
| Apache ECharts | native | series.links, series.nodes | dts-path (strong) | echarts/types/dist/shared.d.ts:11633, echarts/types/dist/shared.d.ts:11631 |
| Highcharts | native | ~keys\|nodes | dts-grep (weak) | highcharts/highcharts.src.d.ts:705 series.nodes + data [from,to,weight] |
| Plotly.js | native | trace.link, trace.node | dts-path (strong) | plot-schema.json#traces.{sankey}.attributes.link, plot-schema.json#traces.{sankey}.attributes.node |
| Nivo | native | Sankey.data, ~links | dts-path (strong) | @nivo/sankey/dist/types/types.d.ts:62, @nivo/voronoi/dist/types/types.d.ts:14 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Sankey, ~links | dts-path (strong) | @visx/sankey/lib/Sankey.d.ts:52, @visx/sankey/lib/Sankey.d.ts:39 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~fromKey\|nodes | dts-grep (weak) | ag-charts-enterprise/dist/types/src/charts/hierarchyDataSet.d.ts:37 |
| amCharts 5 | native | ~sourceIdField | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/map/MapSankeySeries.d.ts:183 |
| Google Charts | native | Sankey | dts-path (strong) | @types/google.visualization/index.d.ts:1783 rows [from, to, weight] |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | SankeyChart, ~links | dts-path (strong) | @mui/x-charts-pro/SankeyChart/SankeyChart.d.mts:31, @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4116 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.sankey | dts-path (strong) | mermaid/dist/config.type.d.ts:233 |
| AntV G2 | native | ~links | dts-grep (weak) | @antv/g2/lib/mark/utils.d.ts:56 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
