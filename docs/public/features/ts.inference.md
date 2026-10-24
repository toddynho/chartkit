# Type-level per-chart-type option narrowing

ChartKit: **partial**

Options narrowed by chart/series type

Matrix status: `partial`. Verification: `dts-path` (strong).

one shape; per-type rules enforced by validate()

Source: chartkit:packages/core/src/generated/schema.ts:24

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry | dts-path (strong) | chart.js/dist/types/index.d.ts:3706 ChartConfiguration<TType> narrows options per type |
| Recharts | partial | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 |
| Apache ECharts | native | series.type | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 discriminated SeriesOption union |
| Highcharts | native | series.type | dts-path (strong) | highcharts/options/abands.d.ts:1386 discriminated SeriesOptionsType union |
| Plotly.js | native | trace.type | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,carpet,choropleth,…}.attributes.type |
| Nivo | partial | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 |
| ApexCharts | partial | chart.type | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | partial | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 |
| Observable Plot | partial | PlotOptions | dts-path (strong) | @observablehq/plot/src/plot.d.ts:7 |
| Vega-Lite | native | mark=line | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | partial | ILineSeriesSettings | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:13 |
| Google Charts | partial | LineChartOptions | dts-path (strong) | @types/google.visualization/index.d.ts:779 |
| uPlot | partial | Options | dts-path (strong) | uplot/dist/uPlot.d.ts:338 |
| TradingView Lightweight Charts | partial | LineSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:10 |
| MUI X Charts | native | LineChart.series | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:26 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | G2Spec.type | dts-path (strong) | @antv/g2/lib/spec/composition.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
