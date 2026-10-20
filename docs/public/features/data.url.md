# Load data from URL

ChartKit: **none**

Fetch CSV/JSON from a URL declared in the spec

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is a script-URL helper for the Mermaid bundle, not data loading

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | native | data.csvURL | dts-path (strong) | highcharts/highcharts.d.ts:9908 data module (csvURL, googleSpreadsheetKey, rowsURL) |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes Plotly.d3 removed; fetch yourself |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | native | ~UrlData | dts-grep (weak) | 7948:          "$ref" data.url |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | plugin | ~JsonParser | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Json.d.ts:31 plugins/json + am5.net.load |
| Google Charts | native | Query | dts-path (strong) | @types/google.visualization/index.d.ts:273 Google Visualization query to a data source URL |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~fetch | dts-grep (weak) | @antv/g2/lib/index.d.ts:11 data: {type: 'fetch', value: url} |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against f0e644ec234d.

https://chartkit.dev/features.json
