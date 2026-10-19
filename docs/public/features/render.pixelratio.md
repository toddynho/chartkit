# High-DPI rendering

ChartKit: **partial**

Device pixel ratio handling for crisp canvas

Matrix status: `partial`. Verification: `dts-grep` (weak).

vector output; resolution independent

Source: chartkit:packages/core/src/axis-extra.ts:2

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~devicePixelRatio | dts-grep (weak) | chart.js/dist/types/index.d.ts:508 |
| Recharts | partial | ~svg | dts-grep (weak) | recharts/types/chart/types.d.ts:9 |
| Apache ECharts | native | ~devicePixelRatio | dts-grep (weak) | echarts/types/src/core/echarts.d.ts:155 |
| Highcharts | partial | ~svg | dts-grep (weak) | highcharts/highcharts.src.d.ts:151 |
| Plotly.js | native | config.plotGlPixelRatio | dts-path (strong) | plot-schema.json#config.plotGlPixelRatio |
| Nivo | native | ~pixelRatio | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:239 |
| Victory | partial | ~svg | dts-grep (weak) | victory-selection-container/lib/selection-helpers.d.ts:21 |
| visx | partial | ~svg | dts-grep (weak) | @visx/stats/lib/ViolinPlot.d.ts:1 |
| ApexCharts | partial | ~svg | dts-grep (weak) | apexcharts/types/unit-shapes.d.ts:199 |
| Tremor (npm) | unknown | ~svg | unverified (unknown) | — |
| Observable Plot | partial | ~svg | dts-grep (weak) | @observablehq/plot/src/context.d.ts:12 |
| Vega-Lite | plugin | — | npm (weak) | — scaleFactor |
| AG Charts | native | ~pixelRatio\|devicePixelRatio | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:13 |
| amCharts 5 | native | ~pixelRatio | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/Exporting.d.ts:271 |
| Google Charts | unknown | ~svg | unverified (unknown) | — |
| uPlot | native | ~pxRatio\|devicePixelRatio | dts-grep (weak) | 163:	/** cached devicePixelRatio (faster than reading it from window.devicePixelRatio) */ |
| TradingView Lightweight Charts | unknown | ~devicePixelRatio | unverified (unknown) | — |
| MUI X Charts | partial | ~svg | dts-grep (weak) | @mui/x-charts/index.d.ts:41 |
| Mermaid (chart-ish diagrams only) | partial | ~svg | dts-grep (weak) | mermaid/dist/utils.d.ts:146 |
| AntV G2 | unknown | ~devicePixelRatio | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
