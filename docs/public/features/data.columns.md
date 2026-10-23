# Columnar arrays

ChartKit: **native**

Data as one array per field (structure of arrays)

Matrix status: `native`. Verification: `dts-path` (strong).

data.columns for 10k+ points

Source: chartkit:packages/core/src/generated/schema.ts:59

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.labels, ChartConfiguration.data.datasets.data | dts-path (strong) | chart.js/dist/types/index.d.ts:3848, chart.js/dist/types/index.d.ts:3812 |
| Recharts | none | — | dts-absence (absence) | — rows only |
| Apache ECharts | native | dataset.source | dts-path (strong) | echarts/types/dist/shared.d.ts:5301 2D array or column object |
| Highcharts | native | series.data | dts-path (strong) | highcharts/options/arcdiagram.d.ts:1025 number arrays per series |
| Plotly.js | native | trace.x, trace.y | dts-path (strong) | plot-schema.json#traces.{bar,box,candlestick,carpet,cone,contour,…}.attributes.x, plot-schema.json#traces.{bar,box,carpet,cone,contour,funnel,…}.attributes.y |
| Nivo | unknown | — | conflict (unknown) | — rows only |
| Victory | none | — | dts-absence (absence) | — rows only |
| visx | unknown | — | conflict (unknown) | — accessors over any array |
| ApexCharts | native | series.data, xaxis.categories | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2563, apexcharts/types/apexcharts.d.ts:4902 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~ColumnarData\|Arrayish | dts-grep (weak) | @observablehq/plot/src/options.d.ts:5 columnar via {length} + typed arrays |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | partial | DataTable | dts-path (strong) | @types/google.visualization/index.d.ts:141 column-defined table |
| uPlot | native | ~AlignedData | dts-grep (weak) | 5:		data? [xs, ys1, ys2] typed arrays |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.series.data, LineChart.xAxis.data | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:36, @mui/x-charts/models/axis.d.mts:498 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 x-axis [..] and line [..] arrays |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against e79729672133.

https://chartkit.dev/features.json
