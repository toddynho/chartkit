# Polar area / rose / nightingale

ChartKit: **none**

Sectors of equal angle with radius as value

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry.polarArea | dts-path (strong) | chart.js/dist/types/index.d.ts:3755 |
| Recharts | partial | RadialBarChart | dts-path (strong) | recharts/types/chart/RadialBarChart.d.ts:27 |
| Apache ECharts | native | series.roseType | dts-path (strong) | echarts/types/dist/shared.d.ts:11256 |
| Highcharts | native | chart.polar | dts-path (strong) | highcharts/highcharts.d.ts:6526 column series in polar chart |
| Plotly.js | native | trace.type=barpolar | dts-path (strong) | plot-schema.json#traces.barpolar |
| Nivo | native | PolarBar | dts-path (strong) | @nivo/polar-bar/dist/types/PolarBar.d.ts:3 |
| Victory | partial | VictoryChart.polar | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:40 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=polarArea | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | native | mark=arc, ~radius | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19, 259:        "cornerRadius" |
| AG Charts | native | series.type=nightingale | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | RadarColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/radar/RadarColumnSeries.d.ts:43 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~polar | dts-grep (weak) | @antv/g2/lib/index.d.ts:53 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
