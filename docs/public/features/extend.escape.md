# Raw drawing access

ChartKit: **none**

Draw directly on the canvas/SVG with library coordinates

Matrix status: `none`. Verification: `source-review` (strong).

static string; no coordinate API; probe hit reviewed: match is walker ctx variable

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~getPixelForValue | dts-grep (weak) | chart.js/dist/types/index.d.ts:1336 |
| Recharts | native | ~usePlotArea\|useXAxisScale | dts-grep (weak) | recharts/types/index.d.ts:135 v3 hooks expose scales |
| Apache ECharts | native | ~convertToPixel\|graphic | dts-grep (weak) | echarts/types/src/core/echarts.d.ts:264 |
| Highcharts | native | ~SVGRenderer\|toPixels | dts-grep (weak) | highcharts/highcharts.src.d.ts:340 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | Line.layers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:171 layer receives scales |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | ~scaleLinear | dts-grep (weak) | @visx/scale/lib/index.d.ts:3 you own the scales |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~render | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~valueToPosition\|Graphics | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:18 |
| Google Charts | native | ~getChartLayoutInterface | dts-grep (weak) | @types/google.visualization/index.d.ts:653 |
| uPlot | native | ~valToPos\|posToVal | dts-grep (weak) | 114:	posToVal(leftTop |
| TradingView Lightweight Charts | native | ~priceToCoordinate\|timeToCoordinate | dts-grep (weak) | 1848:	draw(target |
| MUI X Charts | native | ~useXScale\|useYScale\|useDrawingArea | dts-grep (weak) | @mui/x-charts/hooks/useScale.d.ts:10 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~getCoordinate\|getScale | dts-grep (weak) | @antv/g2/lib/api/mark.d.ts:20 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
