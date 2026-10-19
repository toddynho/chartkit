# Range / floating bar

ChartKit: **none**

Bars from a low to a high value

Matrix status: `none`. Verification: `dts-absence` (absence).

waterfall only

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ChartTypeRegistry.bar | dts-path (strong) | chart.js/dist/types/index.d.ts:3707 data as [low, high] tuples (floating bars) |
| Recharts | partial | Bar.dataKey | dts-path (strong) | recharts/types/util/types.d.ts:1208 dataKey returning [low, high] |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 stacked transparent series or custom |
| Highcharts | native | series.type=columnrange | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.base | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,waterfall}.attributes.base |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | native | VictoryBar, ~y0 | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:71, victory-histogram/lib/victory-histogram.d.ts:4 |
| visx | native | Bar | dts-path (strong) | @visx/shape/lib/shapes/Bar.d.ts:9 manual geometry |
| ApexCharts | native | chart.type=rangeBar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | barY, ~y1 | dts-path (strong) | @observablehq/plot/src/marks/bar.d.ts:203, @observablehq/plot/src/scales.d.ts:29 barY({y1, y2}) |
| Vega-Lite | native | mark=bar, ~y2 | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19, 971:          "description" |
| AG Charts | native | series.type=range-bar | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~openValueYField | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:292 |
| Google Charts | partial | ~interval | dts-grep (weak) | @types/google.visualization/index.d.ts:46 interval roles or Timeline |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=interval, ~y1 | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13, @antv/g2/lib/index.d.ts:89 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67a0c9849a0c.

https://chartkit.dev/features.json
