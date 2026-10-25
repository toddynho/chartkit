# Streamgraph

ChartKit: **none**

Stacked areas around a central baseline

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | native | AreaChart.stackOffset=silhouette | dts-path (strong) | recharts/types/util/types.d.ts:1396 |
| Apache ECharts | native | series.type=themeRiver | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=streamgraph | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Stream | dts-path (strong) | @nivo/stream/dist/types/Stream.d.ts:4 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | AreaStack.offset | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:78 stackOffsetWiggle / silhouette |
| ApexCharts | native | chart.type=streamgraph | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~wiggle | dts-grep (weak) | @observablehq/plot/src/transforms/stack.d.ts:9 stackY offset 'wiggle' |
| Vega-Lite | native | ~center | dts-grep (weak) | 96:        "center", stack: 'center' |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.series.stackOffset=silhouette | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:105 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~stackY | dts-grep (weak) | @antv/g2/lib/index.d.ts:27 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
