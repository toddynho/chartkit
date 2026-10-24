# Typed arrays (Float64Array etc.)

ChartKit: **native**

Accepts typed arrays for large numeric series

Matrix status: `native`. Verification: `dts-grep` (weak).

Source: chartkit:packages/core/schema/chartkit.schema.json:850

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | ~TypedArray\|Float32Array | unverified (unknown) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~ArrayLike\|Float32Array\|TypedArray | dts-grep (weak) | echarts/types/src/model/Series.d.ts:95 |
| Highcharts | native | ~TypedArray\|Float32Array | dts-grep (weak) | highcharts/highcharts.src.d.ts:443 boost module |
| Plotly.js | native | ~TypedArray\|Float32Array | dts-grep (weak) | @types/plotly.js/index.d.ts:1418 |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~Float64Array\|TypedArray | dts-grep (weak) | @observablehq/plot/src/options.d.ts:11 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | ~TypedArray | dts-grep (weak) | 218:	export type TypedArray = Int8Array \| Uint8Array \| Int16Array \| Uint16Array \| Int32Array \| Uint32Array \| Uint8ClampedArray \| Float32Array \| Float64Array; |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
