# Respects prefers-reduced-motion

ChartKit: **native**

Auto-disable animation for users who prefer reduced motion

Matrix status: `native`. Verification: `dts-grep` (weak).

Source: chartkit:packages/core/src/interact.ts:222

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | ~prefers-reduced-motion\|reduced | dts-grep (weak) | highcharts/highcharts.src.d.ts:13194 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | ~reduceMotion\|reducedMotion | unverified (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | ~reducedMotion\|prefers-reduced-motion | unverified (unknown) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~prefers-reduced-motion\|reduced | dts-grep (weak) | @mui/x-charts-premium/ScatterChartPremium/ScatterChartPremium.d.ts:18 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 77c1df48ccc6.

https://chartkit.dev/features.json
