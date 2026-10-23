# Custom HTML / component tooltip

ChartKit: **native**

Render arbitrary markup in the tooltip

Matrix status: `native`. Verification: `runtime-probe` (strong).

Adapter slot on React, Vue, Svelte, vanilla, and the element. The callback returns HTML, a node, or null. The JSON spec stays data.

Source: packages/core/src/tooltip-slot.ts:19

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~external | dts-grep (weak) | chart.js/dist/types/index.d.ts:2757 tooltip.external callback for HTML |
| Recharts | native | Tooltip.content | dts-path (strong) | recharts/types/component/Tooltip.d.ts:65 |
| Apache ECharts | native | tooltip.formatter | dts-path (strong) | echarts/types/dist/shared.d.ts:8072 HTML string |
| Highcharts | native | tooltip.useHTML, tooltip.formatter | dts-path (strong) | highcharts/highcharts.d.ts:107585, highcharts/highcharts.d.ts:107387 |
| Plotly.js | none | — | dts-absence (absence) | — hovertemplate only |
| Nivo | native | Line.tooltip, Line.sliceTooltip | dts-path (strong) | @nivo/line/dist/types/types.d.ts:165, @nivo/line/dist/types/types.d.ts:166 |
| Victory | native | VictoryTooltip.flyoutComponent | dts-path (strong) | victory-tooltip/lib/victory-tooltip.d.ts:21 |
| visx | native | Tooltip | dts-path (strong) | @visx/tooltip/lib/tooltips/Tooltip.d.ts:32 |
| ApexCharts | native | tooltip.custom | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4852 |
| Tremor (npm) | native | LineChart.customTooltip | dts-path (strong) | @tremor/react/dist/index.d.ts:80 |
| Observable Plot | native | ~render | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:166 custom render |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | native | ~renderer | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineOptions.d.ts:1 |
| amCharts 5 | native | ~html\|labelHTML | dts-grep (weak) | @amcharts/amcharts5/element.d.ts:4 |
| Google Charts | native | ~isHtml | dts-grep (weak) | @types/google.visualization/index.d.ts:562 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 hooks |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | native | ChartsTooltip, ~slots | dts-path (strong) | @mui/x-charts/ChartsTooltip/ChartsTooltip.d.mts:21, @mui/x-charts/index.d.ts:29 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~render\|css | dts-grep (weak) | @antv/g2/lib/exports.d.ts:1 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against e79729672133.

https://chartkit.dev/features.json
