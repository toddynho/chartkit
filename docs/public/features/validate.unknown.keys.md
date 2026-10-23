# Unknown-option detection

ChartKit: **native**

Warn on misspelled/unknown keys

Matrix status: `native`. Verification: `dts-grep` (weak).

Source: chartkit:packages/core/src/validate-phase4.ts:37

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | unknown | — | conflict (unknown) | — |
| Plotly.js | native | ~validate | dts-grep (weak) | @types/plotly.js/index.d.ts:551 Plotly.validate reports unused attributes |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | native | ~additionalProperties | dts-grep (weak) | 49:      "additionalProperties" schema has additionalProperties:false |
| AG Charts | native | ~unknown\|warn | dts-grep (weak) | ag-charts-types/dist/types/src/main-scene.d.ts:16 AG Charts warns on unexpected properties |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ddab4856d750.

https://chartkit.dev/features.json
