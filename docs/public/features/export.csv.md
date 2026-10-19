# Data export (CSV/XLSX)

ChartKit: **none**

Download underlying data

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is Mermaid CSV import (parseCsv), not export

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 dataView |
| Highcharts | plugin | ~downloadCSV\|getCSV | dts-grep (weak) | highcharts/highcharts.src.d.ts:10965 export-data module |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | ~exportToCSV | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:284 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | plugin | ~xlsx\|csv | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:67 exporting plugin CSV/XLSX/JSON |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
