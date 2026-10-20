# Row objects (array of records)

ChartKit: **native**

Data as an array of objects keyed by field

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:59

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.parsing | dts-path (strong) | chart.js/dist/types/index.d.ts:54 objects with parsing.xAxisKey/yAxisKey |
| Recharts | native | LineChart.data, Line.dataKey | dts-path (strong) | recharts/types/util/types.d.ts:1185, recharts/types/util/types.d.ts:1208 |
| Apache ECharts | native | dataset.source | dts-path (strong) | echarts/types/dist/shared.d.ts:5301 dataset + encode |
| Highcharts | native | series.keys | dts-path (strong) | highcharts/options/arcdiagram.d.ts:572 pointArrayMap / keys; objects with x/y/name |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes traces take column arrays; rows must be pivoted |
| Nivo | native | Line.data | dts-path (strong) | @nivo/line/dist/types/types.d.ts:85 series[].data[] {x,y} |
| Victory | native | VictoryLine.data, VictoryLine.x | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:8, victory-core/lib/victory-util/common-props.d.ts:15 |
| visx | native | LinePath.data, LinePath.x | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:6, @visx/shape/lib/types/D3ShapeConfig.d.ts:45 |
| ApexCharts | native | series.data | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2563 [{x,y}] objects |
| Tremor (npm) | native | LineChart.data, LineChart.index | dts-path (strong) | @tremor/react/dist/index.d.ts:56, @tremor/react/dist/index.d.ts:58 |
| Observable Plot | native | line | dts-path (strong) | @observablehq/plot/src/marks/line.d.ts:113 Plot.line(data, {x: 'field'}) |
| Vega-Lite | native | TopLevelSpec.data | dts-path (strong) | vega-lite/build/spec/base.d.ts:30 |
| AG Charts | native | AgChartOptions.data, series.xKey | dts-path (strong) | ag-charts-types/dist/types/src/chart/chartOptions.d.ts:324, ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:50 |
| amCharts 5 | native | ~valueYField | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:234 settings valueYField / categoryXField on series; data.setAll(rows) |
| Google Charts | native | DataTable | dts-path (strong) | @types/google.visualization/index.d.ts:141 google.visualization.arrayToDataTable / DataTable rows |
| uPlot | unknown | — | conflict (unknown) | — column arrays only |
| TradingView Lightweight Charts | partial | ISeriesApi.setData | dts-path (strong) | lightweight-charts/dist/typings.d.ts:2438 {time, value} objects only |
| MUI X Charts | native | LineChart.dataset, ~dataKey | dts-path (strong) | @mui/x-charts/internals/plugins/corePlugins/useChartSeries/useChartSeries.types.d.mts:12, @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:40 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — text DSL only |
| AntV G2 | native | G2Spec.data, ~encode | dts-path (strong) | @antv/g2/lib/spec/composition.d.ts:21, @antv/g2/lib/index.d.ts:61 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a59d27e1bde.

https://chartkit.dev/features.json
