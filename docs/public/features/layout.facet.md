# Small multiples / faceting

ChartKit: **none**

Repeat a chart per category in a grid

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | grid | dts-path (strong) | echarts/types/dist/shared.d.ts:12570 multiple grids + series per grid |
| Highcharts | manual | SVGRenderer | dts-mechanism (weak) | highcharts/highcharts.d.ts:115777 |
| Plotly.js | native | layout.grid | dts-path (strong) | plot-schema.json#layout.layoutAttributes.grid subplots |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~fx\|fy | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:151 facet channels |
| Vega-Lite | native | ~facet\|repeat | dts-grep (weak) | 1545:          "description" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | unknown | — | unverified (unknown) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~facetRect | dts-grep (weak) | @antv/g2/lib/index.d.ts:161 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
