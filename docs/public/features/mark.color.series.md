# Per-series colour

ChartKit: **native**

Set the colour of a series explicitly

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:146

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.borderColor, ChartConfiguration.data.datasets.backgroundColor | dts-path (strong) | chart.js/dist/types/index.d.ts:1827, chart.js/dist/types/index.d.ts:1828 |
| Recharts | native | Line.stroke, Bar.fill | dts-path (strong) | @types/react/index.d.ts:3922, @types/react/index.d.ts:3798 |
| Apache ECharts | native | series.itemStyle.color, series.lineStyle.color | dts-path (strong) | echarts/types/dist/shared.d.ts:7768, echarts/types/dist/shared.d.ts:7780 |
| Highcharts | native | series.color | dts-path (strong) | highcharts/options/abands.d.ts:645 |
| Plotly.js | native | trace.marker.color, trace.line.color | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,funnel,histogram,histogram2d,…}.attributes.marker.color, plot-schema.json#traces.{box,contour,contourcarpet,histogram2dcontour,parcats,parcoords,…}.attributes.line.color |
| Nivo | native | Line.colors | dts-path (strong) | @nivo/line/dist/types/types.d.ts:137 |
| Victory | native | VictoryLine.style | dts-path (strong) | victory-line/lib/victory-line.d.ts:84 |
| visx | native | LinePath.stroke | dts-path (strong) | @types/react/index.d.ts:3922 |
| ApexCharts | native | colors | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1457 |
| Tremor (npm) | native | LineChart.colors | dts-path (strong) | @tremor/react/dist/index.d.ts:59 |
| Observable Plot | native | ~stroke\|fill | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:5 channel or constant |
| Vega-Lite | native | ~color | dts-grep (weak) | 238:              "description" |
| AG Charts | native | series.stroke, series.fill | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/commonOptions.d.ts:148, ag-charts-types/dist/types/src/series/cartesian/commonOptions.d.ts:36 |
| amCharts 5 | native | ~stroke\|fill | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/ChartSerializer.d.ts:42 |
| Google Charts | native | LineChartOptions.colors, ~series | dts-path (strong) | @types/google.visualization/index.d.ts:786, @types/google.visualization/index.d.ts:610 |
| uPlot | native | Options.series.stroke | dts-path (strong) | uplot/dist/uPlot.d.ts:932 |
| TradingView Lightweight Charts | native | ~LineStyleOptions\|color | dts-grep (weak) | 24: * Represents a type of color. |
| MUI X Charts | native | LineChart.series.color | dts-path (strong) | @mui/x-charts/models/seriesType/common.d.mts:26 |
| Mermaid (chart-ish diagrams only) | native | ~plotColorPalette | dts-grep (weak) | mermaid/dist/diagrams/xychart/chartBuilder/interfaces.d.ts:20 xyChart themeVariables palette only |
| AntV G2 | native | ~color | dts-grep (weak) | @antv/g2/lib/index.d.ts:43 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against aad14577fd95.

https://chartkit.dev/features.json
