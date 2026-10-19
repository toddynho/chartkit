# Point marker shapes

ChartKit: **none**

Circle, square, triangle, custom symbols

Matrix status: `none`. Verification: `dts-absence` (absence).

circles only

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.pointStyle | dts-path (strong) | chart.js/dist/types/index.d.ts:2074 |
| Recharts | native | Line.dot, Scatter.shape | dts-path (strong) | recharts/types/cartesian/Line.d.ts:120, recharts/types/cartesian/Scatter.d.ts:179 |
| Apache ECharts | native | series.symbol | dts-path (strong) | echarts/types/dist/shared.d.ts:7754 |
| Highcharts | native | plotOptions.series.marker.symbol | dts-path (strong) | highcharts/highcharts.d.ts:97668 |
| Plotly.js | native | trace.marker.symbol | dts-path (strong) | plot-schema.json#traces.{box,scatter,scatter3d,scattercarpet,scattergeo,scattergl,…}.attributes.marker.symbol |
| Nivo | native | Line.pointSymbol | dts-path (strong) | @nivo/line/dist/types/types.d.ts:140 |
| Victory | native | VictoryScatter.symbol | dts-path (strong) | victory-scatter/lib/victory-scatter.d.ts:15 |
| visx | native | GlyphSquare, GlyphTriangle | dts-path (strong) | @visx/glyph/lib/glyphs/GlyphSquare.d.ts:17, @visx/glyph/lib/glyphs/GlyphTriangle.d.ts:17 |
| ApexCharts | native | markers.shape | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4660 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~symbol | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:1 symbol channel |
| Vega-Lite | native | ~shape | dts-grep (weak) | 422:          "description" |
| AG Charts | native | series.marker.shape | dts-path (strong) | ag-charts-types/dist/types/src/series/markerOptions.d.ts:9 |
| amCharts 5 | native | ~Star\|Triangle | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:40 bullets with any sprite |
| Google Charts | native | LineChartOptions.pointShape | dts-path (strong) | @types/google.visualization/index.d.ts:807 |
| uPlot | partial | Options.series.points | dts-path (strong) | uplot/dist/uPlot.d.ts:923 custom points path |
| TradingView Lightweight Charts | native | ~SeriesMarkerShape | dts-grep (weak) | 3959:	shape series markers circle/square/arrowUp/arrowDown |
| MUI X Charts | native | ~shape | dts-grep (weak) | @mui/x-charts/ChartsXAxis/useAxisTicksProps.d.ts:4128 scatter/line marker shape |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~shape | dts-grep (weak) | @antv/g2/lib/component/utils.d.ts:27 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
