# Network / force graph

ChartKit: **none**

Nodes and edges laid out by force or other algorithm

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.type=graph | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=networkgraph | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | Network | dts-path (strong) | @nivo/network/dist/types/Network.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Graph | dts-path (strong) | @visx/network/lib/Graph.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 d3-force + dot/link (documented) |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~networkOptions | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:80 standalone network series |
| amCharts 5 | native | ~ForceDirected | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:97 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=forceGraph | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
