# Scale padding / clamp / grace

ChartKit: **none**

Extra space beyond data extent or clamp out-of-range

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is size.padding (chart padding around the plot, not scale padding)

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~grace | dts-grep (weak) | chart.js/dist/types/index.d.ts:3325 |
| Recharts | native | YAxis.padding | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:123 |
| Apache ECharts | native | yAxis.boundaryGap | dts-path (strong) | echarts/types/dist/shared.d.ts:2679 |
| Highcharts | native | yAxis.maxPadding, yAxis.minPadding | dts-path (strong) | highcharts/highcharts.d.ts:110291, highcharts/highcharts.d.ts:110415 |
| Plotly.js | unknown | — | conflict (unknown) | — |
| Nivo | native | ~clamp | dts-grep (weak) | @nivo/generators/dist/types/helpers.d.ts:1 |
| Victory | native | VictoryChart.domainPadding | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:24 |
| visx | native | ~clamp | dts-grep (weak) | @visx/drag/lib/util/clampNumber.d.ts:1 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~clamp\|inset | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:1 |
| Vega-Lite | native | ~clamp\|padding | dts-grep (weak) | 609:              "description" |
| AG Charts | native | ~padding | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:15 |
| amCharts 5 | native | ~extraMax\|extraMin | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis.d.ts:28 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | native | ~scaleMargins | dts-grep (weak) | 536:export interface AutoScaleMargins { |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~clamp | dts-grep (weak) | @antv/g2/lib/utils/number.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
