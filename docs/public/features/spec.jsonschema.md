# Published JSON Schema

ChartKit: **native**

Machine-readable schema for the config

Matrix status: `native`. Verification: `dts-grep` (weak).

schema.json export + https://chartkit.dev/schema/v1.json

Source: chartkit:packages/core/src/generated/schema.ts:3

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | none | — | dts-absence (absence) | — TS d.ts + API docs (tree JSON on api.highcharts.com) |
| Plotly.js | native | config | dts-path (strong) | plot-schema.json#config. plot-schema.json via Plotly.PlotSchema.get() |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | — | doc-cited (weak) | — vega-lite-schema.json ships in the package |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | ~config.schema\|json schema | dts-grep (weak) | mermaid/dist/defaultConfig.d.ts:6 config schema (config.schema.yaml) for MermaidConfig |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 64e07159b6f8.

https://chartkit.dev/features.json
