# WebGL / GPU rendering

ChartKit: **none**

GPU rendering for very large data

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | plugin | — | npm (weak) | — |
| Highcharts | plugin | ~boost | dts-grep (weak) | highcharts/highcharts.src.d.ts:680 boost module |
| Plotly.js | native | trace.type=scattergl | dts-path (strong) | plot-schema.json#traces.scattergl |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (premium) | ChartsWebGLLayer | dts-path (strong) | @mui/x-charts-premium/ChartsWebGLLayer/ChartsWebGLLayer.d.mts:2 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | plugin | — | npm (weak) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
