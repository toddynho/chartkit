# Imperative / builder API

ChartKit: **none**

Charts built by calling methods

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Chart | dts-path (strong) | chart.js/dist/types/index.d.ts:494 new Chart + update() |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | ~setOption | dts-grep (weak) | echarts/types/dist/core.d.ts:1 |
| Highcharts | native | ~addSeries\|addAxis | dts-grep (weak) | highcharts/modules/drilldown.src.d.ts:40 |
| Plotly.js | native | ~newPlot\|restyle\|relayout | dts-grep (weak) | @types/plotly.js/index.d.ts:39 |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | native | ~updateSeries\|appendSeries | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:134 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | plot | dts-path (strong) | @observablehq/plot/src/plot.d.ts:427 function composition |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~update\|updateDelta | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:23 |
| amCharts 5 | native | ~new\|push | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/sliceGrouper/SliceGrouper.d.ts:72 Class.new(root, settings); children.push |
| Google Charts | native | ~draw | dts-grep (weak) | @types/google.visualization/index.d.ts:61 |
| uPlot | native | ~uPlot | dts-grep (weak) | 1:declare class uPlot { |
| TradingView Lightweight Charts | native | ~createChart\|addSeries | dts-grep (weak) | 212:export declare function createChart(container |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~interval\|encode | dts-grep (weak) | @antv/g2/lib/index.d.ts:61 chainable API chart.interval().encode() |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
