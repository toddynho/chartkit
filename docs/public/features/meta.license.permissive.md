# Permissive OSS licence for the charting core

ChartKit: **native**

MIT/Apache/BSD/ISC with no revenue cap or branding condition. partial = permissive core, some features paid.

Matrix status: `native`. Verification: `pkg-license` (strong).

MIT — package.json says MIT, but the GitHub repo has no LICENSE file (GitHub API license=null).

Source: packages/*/package.json

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | — | pkg-license (strong) | chart.js/package.json MIT |
| Recharts | native | — | pkg-license (strong) | recharts/package.json MIT |
| Apache ECharts | native | — | pkg-license (strong) | echarts/package.json Apache-2.0 |
| Highcharts | none | — | pkg-license (strong) | highcharts/package.json Commercial (free for non-commercial) — package.json license = https://www.highcharts.com/license; LICENSE.txt: commercial use under Highsoft Standard License, non-commercial under EULA. |
| Plotly.js | native | — | pkg-license (strong) | plotly.js-dist-min/package.json MIT |
| Nivo | native | — | pkg-license (strong) | @nivo/core/package.json MIT |
| Victory | native | — | pkg-license (strong) | victory/package.json MIT |
| visx | native | — | pkg-license (strong) | @visx/visx/package.json MIT |
| ApexCharts | none | — | pkg-license (strong) | apexcharts/package.json Dual: Community (free under $2M revenue) / Commercial — LICENSE.md: free only for orgs under $2M annual revenue/funding; disallows use in competing charting products; OEM licence needed for embedding in platforms used by others. |
| Tremor (npm) | native | — | pkg-license (strong) | @tremor/react/package.json Apache-2.0 — npm package repo tremorlabs/tremor-npm last pushed 2025-01-13; Tremor now focuses on copy-paste components (tremorlabs/tremor). |
| Observable Plot | native | — | pkg-license (strong) | @observablehq/plot/package.json ISC |
| Vega-Lite | native | — | pkg-license (strong) | vega-lite/package.json BSD-3-Clause |
| AG Charts | partial | — | pkg-license (strong) | ag-charts-community/package.json MIT (community) + Commercial (enterprise) — ag-charts-enterprise package.json license = "Commercial". Cells tagged tier=ent need it. |
| amCharts 5 | none | — | pkg-license (strong) | @amcharts/amcharts5/package.json Linkware (free with branding) / Commercial — LICENSE: free incl. commercial use if the amCharts branding link is not removed; paid licence removes it. |
| Google Charts | unknown | — | unverified (unknown) | — Proprietary hosted service (not verified from package) — Only @types are on npm; library is loaded from Google's loader. Licence terms not verified from a package file. |
| uPlot | native | — | pkg-license (strong) | uplot/package.json MIT |
| TradingView Lightweight Charts | native | — | pkg-license (strong) | lightweight-charts/package.json Apache-2.0 + attribution requirement — README: must show TradingView attribution notice and a link to tradingview.com (attributionLogo option satisfies the link). |
| MUI X Charts | partial | — | pkg-license (strong) | @mui/x-charts/package.json MIT (community) + Commercial (Pro, Premium) — @mui/x-charts-pro and -premium LICENSE: commercial EULA. Cells tagged tier=pro/premium need it. |
| Mermaid (chart-ish diagrams only) | native | — | pkg-license (strong) | mermaid/package.json MIT |
| AntV G2 | native | — | pkg-license (strong) | @antv/g2/package.json MIT |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
