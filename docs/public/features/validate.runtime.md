# Runtime spec validation API

ChartKit: **native**

Validate a config and get structured errors

Matrix status: `native`. Verification: `dts-grep` (weak).

validate() returns CK codes with JSON Pointer paths

Source: chartkit:packages/core/schema/chartkit.schema.json:17

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — console warnings only |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — console warnings in dev builds |
| Highcharts | native | ~error | dts-grep (weak) | highcharts/highcharts.src.d.ts:41 Highcharts.error codes (#13 etc.) with URLs |
| Plotly.js | native | ~validate | dts-grep (weak) | @types/plotly.js/index.d.ts:551 Plotly.validate(data, layout) |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | plugin | — | npm (weak) | — compile() logs warnings; JSON Schema validation via ajv |
| AG Charts | native | ~warn\|validat | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:40 options validation warnings in console |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | ~parse | dts-grep (weak) | mermaid/dist/Diagram.d.ts:3 mermaid.parse() throws on syntax errors |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 1eae17b953e2.

https://chartkit.dev/features.json
