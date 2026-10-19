# Continuous colour legend / colour bar

ChartKit: **none**

Gradient legend for colour scales

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is colorBarsByX (bar colouring)

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | visualMap.type | dts-path (strong) | echarts/types/dist/shared.d.ts:8225 continuous visualMap |
| Highcharts | native | colorAxis | dts-path (strong) | highcharts/highcharts.d.ts:93483 |
| Plotly.js | native | trace.colorbar | dts-path (strong) | plot-schema.json#traces.{choropleth,choroplethmap,cone,contour,contourcarpet,densitymap,…}.attributes.colorbar |
| Nivo | native | ~ContinuousColorsLegend\|continuous | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:92 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | LegendLinear, LegendThreshold | dts-path (strong) | @visx/legend/lib/legends/Linear.d.ts:9, @visx/legend/lib/legends/Threshold.d.ts:21 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~ramp | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:539 legend type ramp |
| Vega-Lite | native | ~gradient | dts-grep (weak) | 251:              "$ref" legend type gradient |
| AG Charts | native | ~gradientLegend | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:26 |
| amCharts 5 | native | HeatLegend | dts-path (strong) | @amcharts/amcharts5/.internal/core/render/HeatLegend.d.ts:77 |
| Google Charts | native | ~colorAxis | dts-grep (weak) | @types/google.visualization/index.d.ts:373 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~ContinuousColorLegend\|PiecewiseColorLegend | dts-grep (weak) | @mui/x-charts/ChartsLegend/piecewiseColorLegendClasses.d.ts:1 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~legendContinuous | dts-grep (weak) | @antv/g2/lib/index.d.ts:113 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
