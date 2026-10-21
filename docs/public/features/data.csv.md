# CSV / TSV parsing

ChartKit: **none**

Parse delimited text directly

Matrix status: `none`. Verification: `dts-absence` (absence).

Mermaid sankey CSV only (via mermaid importer)

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | data.csv | dts-path (strong) | highcharts/highcharts.d.ts:9903 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~DsvDataFormat\|csv | dts-grep (weak) | 7846:    "CsvDataFormat" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | plugin | ~CSVParser | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:67 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.sankey | dts-path (strong) | mermaid/dist/config.type.d.ts:233 sankey-beta takes CSV rows |
| AntV G2 | native | ~csv | dts-grep (weak) | @antv/g2/lib/spec/data.d.ts:7 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40b908be291d.

https://chartkit.dev/features.json
