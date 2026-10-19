# Streaming / realtime append

ChartKit: **partial**

Append points and shift window efficiently

Matrix status: `partial`. Verification: `dts-grep` (weak).

mount().update(spec) re-render; no append API

Source: chartkit:packages/core/schema/chartkit.schema.json:1947

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | partial | LineChart.data | dts-path (strong) | recharts/types/util/types.d.ts:1185 re-render with new data |
| Apache ECharts | native | ~appendData | dts-grep (weak) | echarts/types/src/data/SeriesData.d.ts:207 |
| Highcharts | native | Series.addPoint | dts-path (strong) | highcharts/highcharts.d.ts:115165 addPoint(point, redraw, shift) |
| Plotly.js | native | ~extendTraces | dts-grep (weak) | @types/plotly.js/index.d.ts:523 |
| Nivo | partial | Line.data | dts-path (strong) | @nivo/line/dist/types/types.d.ts:85 |
| Victory | partial | VictoryLine.data | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:8 |
| visx | partial | LinePath.data | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:6 |
| ApexCharts | native | ~appendData | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:154 |
| Tremor (npm) | partial | LineChart.data | dts-path (strong) | @tremor/react/dist/index.d.ts:56 |
| Observable Plot | none | — | dts-absence (absence) | — static render; re-render plot() |
| Vega-Lite | plugin | — | npm (weak) | — vega View changeset streaming |
| AG Charts | partial | ~update | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:3 chart.update / updateDelta |
| amCharts 5 | native | ~pushAll\|push | dts-grep (weak) | @amcharts/amcharts5/.internal/core/util/Array.d.ts:109 data.push |
| Google Charts | partial | ~draw | dts-grep (weak) | @types/google.visualization/index.d.ts:61 redraw with new DataTable |
| uPlot | native | ~setData | dts-grep (weak) | 74:	setData(data |
| TradingView Lightweight Charts | native | ISeriesApi.update | dts-path (strong) | lightweight-charts/dist/typings.d.ts:2464 update(bar) appends or replaces last bar |
| MUI X Charts | partial | LineChart.series | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:26 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | partial | ~changeData | dts-grep (weak) | @antv/g2/lib/api/mark.d.ts:12 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7eff21f18449.

https://chartkit.dev/features.json
