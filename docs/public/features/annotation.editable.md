# Interactive / draggable annotations

ChartKit: **none**

User can draw, drag or edit annotations

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | native | ~draggable\|annotationsOptions | dts-grep (weak) | highcharts/highcharts.src.d.ts:162 annotations draggable + Stock tools |
| Plotly.js | native | config.edits, config.editable | dts-path (strong) | plot-schema.json#config.edits, plot-schema.json#config.editable |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | EditableAnnotation | dts-path (strong) | @visx/annotation/lib/components/EditableAnnotation.d.ts:32 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native (ent) | ~annotations | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:7 financial chart toolbar drawing |
| amCharts 5 | native | DrawingSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/stock/drawing/DrawingSeries.d.ts:87 stock drawing tools |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | plugin | ~ISeriesPrimitive | dts-grep (weak) | 2589:	 * @param primitive - any implementation of ISeriesPrimitive interface drawing tools via plugins |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 2c56df7b4c59.

https://chartkit.dev/features.json
