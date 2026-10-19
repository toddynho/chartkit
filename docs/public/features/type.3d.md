# 3D charts

ChartKit: **none**

3D scatter, surface, bars or pies

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | plugin | — | npm (weak) | — |
| Highcharts | native | chart.options3d | dts-path (strong) | highcharts/highcharts.d.ts:6433 highcharts-3d module |
| Plotly.js | native | trace.type=surface, trace.type=scatter3d | dts-path (strong) | plot-schema.json#traces.surface, plot-schema.json#traces.scatter3d |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | partial | PieChartOptions.is3D | dts-path (strong) | @types/google.visualization/index.d.ts:1059 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | plugin | — | npm (weak) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
