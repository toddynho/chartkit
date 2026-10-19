# Responsive rules / breakpoints

ChartKit: **none**

Different options at different container sizes

Matrix status: `none`. Verification: `dts-absence` (absence).

single layout; no breakpoint rules

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~onResize | dts-grep (weak) | chart.js/dist/types/index.d.ts:1677 onResize callback only |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~media | dts-grep (weak) | echarts/types/src/model/OptionManager.d.ts:11 baseOption + media queries |
| Highcharts | native | responsive.rules | dts-path (strong) | highcharts/highcharts.d.ts:98595 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | responsive | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1487 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~ResponsiveTheme | dts-grep (weak) | @amcharts/amcharts5/.internal/themes/ResponsiveTheme.d.ts:27 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67a0c9849a0c.

https://chartkit.dev/features.json
