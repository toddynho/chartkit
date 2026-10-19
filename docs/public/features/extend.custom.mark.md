# Custom marks / series renderers

ChartKit: **none**

Define a new mark type or drawing routine

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is CustomEvent emit

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~DatasetController | dts-grep (weak) | chart.js/dist/types/index.d.ts:156 custom controllers |
| Recharts | native | Bar.shape, Customized | dts-path (strong) | recharts/types/cartesian/Bar.d.ts:137, recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | ~renderItem | dts-grep (weak) | echarts/types/src/extension.d.ts:10 custom series |
| Highcharts | native | ~seriesType | dts-grep (weak) | highcharts/highcharts-autoload.src.d.ts:1143 Highcharts.seriesType() |
| Plotly.js | unknown | — | conflict (unknown) | — |
| Nivo | native | Line.layers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | native | VictoryBar.dataComponent | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | Group | dts-path (strong) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~render | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:166 custom render function on any mark |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | Graphics | dts-path (strong) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.series.paths | dts-path (strong) | uplot/dist/uPlot.d.ts:920 |
| TradingView Lightweight Charts | native | ~ICustomSeriesPaneView\|addCustomSeries | dts-grep (weak) | 1626:	 * const series = chart.addCustomSeries(myCustomPaneView); |
| MUI X Charts | native | ChartsContainer | dts-path (strong) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 compose primitives with hooks |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~register\|shape | dts-grep (weak) | @antv/g2/lib/index.d.ts:84 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
