# Touch-friendly tooltip

ChartKit: **unknown**

Tap/press to show tooltips on touch devices

Matrix status: `unknown`. Verification: `unverified` (unknown).

No spec snippet. This ChartKit cell is unknown.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~touchstart\|events | dts-grep (weak) | chart.js/dist/types/index.d.ts:551 default events include touchstart/touchmove |
| Recharts | native | ~touch | dts-grep (weak) | recharts/types/index.d.ts:144 |
| Apache ECharts | native | ~triggerOn | dts-grep (weak) | echarts/types/src/coord/parallel/ParallelModel.d.ts:17 'mousemove\|click' incl. touch |
| Highcharts | native | ~touch\|followTouchMove | dts-grep (weak) | highcharts/highcharts.src.d.ts:2034 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~touch | dts-grep (weak) | @nivo/grid/dist/types/boundingBoxes.d.ts:3 |
| Victory | native | ~touch | dts-grep (weak) | victory-selection-container/lib/victory-selection-container.d.ts:98 |
| visx | native | ~touch | dts-grep (weak) | @visx/event/lib/types.d.ts:1 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~pointer | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:5 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~touch | dts-grep (weak) | ag-charts-community/dist/types/src/core/eventsHub.d.ts:48 |
| amCharts 5 | native | ~touch | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:105 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~touch\|handleScroll | dts-grep (weak) | 197:	 * Tracking Mode will be deactivated on touch end event. |
| MUI X Charts | native | ~touch\|pointer | dts-grep (weak) | @mui/x-charts/hooks/useInteractionItemProps.d.ts:9 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~touch | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 8f00db13813e.

https://chartkit.dev/features.json
