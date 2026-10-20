# OHLC bars

ChartKit: **none**

Open/high/low/close as tick bars

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | series.type=ohlc | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=ohlc | dts-path (strong) | plot-schema.json#traces.ohlc |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | series.type=ohlc | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | OHLCSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/OHLCSeries.d.ts:24 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | BarSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:6 |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
