# Quantize / threshold / quantile scales

ChartKit: **none**

Binned colour scales

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | visualMap | dts-path (strong) | echarts/types/dist/shared.d.ts:12590 piecewise splitNumber/pieces |
| Highcharts | native | colorAxis.dataClasses | dts-path (strong) | highcharts/highcharts.d.ts:8389 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~quantize | dts-grep (weak) | @nivo/heatmap/dist/types/hooks.d.ts:30 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ~scaleQuantize\|scaleThreshold\|scaleQuantile | dts-grep (weak) | @visx/scale/lib/index.d.ts:10 |
| ApexCharts | native | plotOptions.heatmap.colorScale.ranges | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3434 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~quantize\|quantile\|threshold | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:195 |
| Vega-Lite | native | ~quantize\|quantile\|threshold | dts-grep (weak) | 20073:              "description" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | partial | ~heatRules | dts-grep (weak) | @amcharts/amcharts5/examples/xy-bubble/config.json:549 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~piecewise | dts-grep (weak) | @mui/x-charts/ChartsLegend/piecewiseColorLegendClasses.d.ts:1 piecewise color map thresholds |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~quantize\|quantile\|threshold | dts-grep (weak) | @antv/g2/lib/index.d.ts:100 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against cfb64fb8d1fe.

https://chartkit.dev/features.json
