# Time zone handling

ChartKit: **none**

UTC vs local display and explicit time zones

Matrix status: `none`. Verification: `source-review` (strong).

temporal parsed and formatted without a time-zone option; probe hit reviewed: dates are always formatted with timeZone:"UTC" (format.ts:56); no option

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — zone via adapter options |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~useUTC | dts-grep (weak) | echarts/types/src/model/globalDefault.d.ts:66 |
| Highcharts | native | time.timezone, time.useUTC | dts-path (strong) | highcharts/highcharts.d.ts:106988, highcharts/highcharts.d.ts:107015 |
| Plotly.js | none | — | dts-absence (absence) | — dates are treated as naive (no tz conversion) |
| Nivo | partial | ~useUTC | dts-grep (weak) | @nivo/scales/dist/types/types.d.ts:90 xScale.useUTC |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ~scaleUtc | dts-grep (weak) | @visx/scale/lib/index.d.ts:6 |
| ApexCharts | native | xaxis.labels.datetimeUTC | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4927 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~utc | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:181 utc vs time scales |
| Vega-Lite | native | ~utc | dts-grep (weak) | 1645:          "description" timeUnit utc*, scale type utc |
| AG Charts | native | ~timezone\|utc | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:21 |
| amCharts 5 | native | ~timezone | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:48 root.timezone |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | native | Options.tzDate | dts-path (strong) | uplot/dist/uPlot.d.ts:361 |
| TradingView Lightweight Charts | native | ~localization\|timeFormatter | dts-grep (weak) | 1006:	 * Basic localization options timestamps are UTC; format via localization |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~utc | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 8f00db13813e.

https://chartkit.dev/features.json
