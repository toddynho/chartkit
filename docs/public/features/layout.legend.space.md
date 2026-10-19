# Auto layout around legend/labels

ChartKit: **unknown**

Plot area shrinks to fit axes labels and legend

Matrix status: `unknown`. Verification: `unverified` (unknown).

No spec snippet. This ChartKit cell is unknown.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~layout | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 automatic layout of boxes |
| Recharts | partial | YAxis.width | dts-path (strong) | @types/react/index.d.ts:3710 fixed by default; 'auto' in v3 |
| Apache ECharts | native | grid.containLabel | dts-path (strong) | echarts/types/dist/shared.d.ts:2945 |
| Highcharts | native | chart.margin | dts-path (strong) | highcharts/highcharts.d.ts:6391 auto margins when unset |
| Plotly.js | native | layout.xaxis.automargin | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.automargin |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~marginLeft | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:42 auto margins from tick labels |
| Vega-Lite | native | ~autosize | dts-grep (weak) | 1015:    "AutoSizeParams" |
| AG Charts | native | ~padding | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:15 automatic layout |
| amCharts 5 | native | ~layout | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:112 |
| Google Charts | native | ~chartArea | dts-grep (weak) | @types/google.visualization/index.d.ts:493 |
| uPlot | partial | Options.axes.size | dts-path (strong) | uplot/dist/uPlot.d.ts:1069 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~margin | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:13 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~autoFit | dts-grep (weak) | @antv/g2/lib/component/slider.d.ts:7 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67a0c9849a0c.

https://chartkit.dev/features.json
