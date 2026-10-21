# Incremental update API

ChartKit: **native**

Update an existing chart with a new spec/options

Matrix status: `native`. Verification: `dts-grep` (weak).

mount(el, spec).update(spec)

Source: chartkit:packages/core/schema/chartkit.schema.json:1947

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Chart.update | dts-path (strong) | chart.js/dist/types/index.d.ts:529 |
| Recharts | partial | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 React re-render |
| Apache ECharts | native | ~setOption | dts-grep (weak) | echarts/types/dist/core.d.ts:1 notMerge / replaceMerge |
| Highcharts | native | ~update | dts-grep (weak) | highcharts/highcharts.src.d.ts:126 chart.update(options) |
| Plotly.js | native | ~react\|restyle | dts-grep (weak) | @types/plotly.js/index.d.ts:108 Plotly.react |
| Nivo | partial | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 |
| ApexCharts | native | ~updateOptions | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:122 |
| Tremor (npm) | partial | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 |
| Observable Plot | none | — | dts-absence (absence) | — re-render whole plot |
| Vega-Lite | plugin | — | npm (weak) | — re-embed or changesets via vega View |
| AG Charts | native | ~update\|updateDelta | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:23 |
| amCharts 5 | native | ~set\|setAll | dts-grep (weak) | @amcharts/amcharts5/flow.d.ts:1 |
| Google Charts | native | ~draw | dts-grep (weak) | @types/google.visualization/index.d.ts:61 |
| uPlot | native | ~setData\|setScale | dts-grep (weak) | 67:	/** manual batching of multiple ops (aka immediate mode that skips implicit microtask queue), ops, e.g. setScale('x', ...) && setScale('y', ...) */ |
| TradingView Lightweight Charts | native | ~applyOptions\|setData | dts-grep (weak) | 245: * imageWatermark.applyOptions({ padding |
| MUI X Charts | partial | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~changeData\|render | dts-grep (weak) | @antv/g2/lib/exports.d.ts:1 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
