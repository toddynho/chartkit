# Density (KDE)

ChartKit: **none**

Kernel density estimate curve

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | partial | series.type=bellcurve | dts-path (strong) | highcharts/options/abands.d.ts:1386 normal fit, not KDE |
| Plotly.js | partial | trace.type=violin | dts-path (strong) | plot-schema.json#traces.violin |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | density | dts-path (strong) | @observablehq/plot/src/marks/density.d.ts:51 2D contours; 1D via d3 / areaY |
| Vega-Lite | native | ~density | dts-grep (weak) | 8083:    "DensityTransform" density transform |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=density | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
