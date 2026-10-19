# Hydration / progressive enhancement

ChartKit: **native**

Static SVG on server, interactivity added on client

Matrix status: `native`. Verification: `dts-grep` (weak).

same static SVG; @chartkitdev/core/interact adds tooltip etc.

Source: chartkit:packages/core/schema/chartkit.schema.json:101

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | partial | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 React hydration |
| Apache ECharts | unknown | ~hydrate | unverified (unknown) | — SSR + lightweight client runtime (echarts 5.5+) |
| Highcharts | none | — | dts-absence (absence) | — |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | partial | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | partial | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | partial | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
