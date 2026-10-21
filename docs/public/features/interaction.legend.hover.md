# Legend hover highlights series

ChartKit: **native**

Hovering a legend item emphasises its series

Matrix status: `native`. Verification: `runtime-probe` (strong).

Hovering a legend item dims the other series with --ck-dim. It is on whenever a legend is drawn.

Source: packages/core/src/interact.ts

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~onHover | dts-grep (weak) | chart.js/dist/types/index.d.ts:99 plugins.legend.onHover |
| Recharts | native | Legend.onMouseEnter | dts-path (strong) | recharts/types/component/DefaultLegendContent.d.ts:88 |
| Apache ECharts | native | ~legendHoverLink | dts-grep (weak) | echarts/types/dist/shared.d.ts:8343 |
| Highcharts | native | ~legendItemHover\|inactive | dts-grep (weak) | highcharts/highcharts.src.d.ts:883 series inactive state on legend hover |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~onMouseEnter | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:71 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | legend.onItemHover.highlightDataSeries | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4634 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~legend | dts-grep (weak) | 1165:          "description" |
| AG Charts | native | ~legend | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:115 |
| amCharts 5 | native | ~pointerover\|hover | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:506 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~highlight\|ChartsLegend | dts-grep (weak) | @mui/x-charts/index.d.ts:10 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~legendHighlight | dts-grep (weak) | @antv/g2/lib/index.d.ts:144 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against de2c823fa6b2.

https://chartkit.dev/features.json
