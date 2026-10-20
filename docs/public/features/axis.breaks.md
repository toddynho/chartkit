# Axis breaks

ChartKit: **none**

Skip a range of an axis (gaps, weekends)

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | xAxis.breaks | dts-path (strong) | echarts/types/dist/shared.d.ts:2658 ECharts 6 axis breaks |
| Highcharts | native | xAxis.breaks | dts-path (strong) | highcharts/highcharts.d.ts:108155 broken-axis module |
| Plotly.js | native | layout.xaxis.rangebreaks | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.rangebreaks |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | unverified (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~ignoreWhitespaceIndices\|business | dts-grep (weak) | 391: * Check if a time value is a business day object. business-day time scale skips gaps |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~breaks | dts-grep (weak) | @antv/g2/lib/runtime/constant.d.ts:10 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against fb308ab4f88e.

https://chartkit.dev/features.json
