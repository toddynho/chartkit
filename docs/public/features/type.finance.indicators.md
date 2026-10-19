# Technical indicators

ChartKit: **none**

SMA, EMA, MACD, RSI, Bollinger etc.

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | series.type=sma, series.type=macd | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | bollingerY, windowY | dts-path (strong) | @observablehq/plot/src/marks/bollinger.d.ts:79, @observablehq/plot/src/transforms/window.d.ts:126 window transforms + bollinger mark |
| Vega-Lite | partial | ~window | dts-grep (weak) | 8748:              "const" window transform for moving averages |
| AG Charts | native | ~ma | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:3 financial charts toolbar with indicators (enterprise) |
| amCharts 5 | native | ~MovingAverage | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:9 StockChart indicators |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | plugin | ~ISeriesPrimitive | dts-grep (weak) | 2589:	 * @param primitive - any implementation of ISeriesPrimitive interface plugins/primitives; indicators are user code |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
