# Text DSL input

ChartKit: **native**

Charts written in a text syntax

Matrix status: `native`. Verification: `dts-grep` (weak).

Mermaid -> ChartKit spec converter (pie, xychart, sankey, quadrant, gantt, timeline, venn, journey ...)

Source: chartkit:packages/core/src/mermaid-phase4.ts:1

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | unknown | — | conflict (unknown) | — |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | native | ~parse\|render | dts-grep (weak) | mermaid/dist/utils.d.ts:232 |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 07234d1c8099.

https://chartkit.dev/features.json
