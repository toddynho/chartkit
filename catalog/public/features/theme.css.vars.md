# CSS variables / class-based styling

ChartKit: **native**

Style through CSS custom properties or classes

Matrix status: `native`. Verification: `dts-grep` (weak).

--ck-* CSS variables

Source: chartkit:packages/core/schema/chartkit.schema.json:1775

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — canvas, no CSS styling |
| Recharts | partial | ~className | dts-grep (weak) | recharts/types/polar/RadialBar.d.ts:88 |
| Apache ECharts | none | — | dts-absence (absence) | — canvas by default; SVG renderer without CSS vars |
| Highcharts | native | chart.styledMode | dts-path (strong) | highcharts/highcharts.d.ts:6659 styledMode: CSS classes, --highcharts-* variables |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | partial | ~className | dts-grep (weak) | victory-zoom-container/lib/victory-zoom-container.d.ts:57 |
| visx | native | ~className | dts-grep (weak) | @visx/stats/package.json:41 |
| ApexCharts | partial | ~className | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:604 apexcharts-* classes on SVG |
| Tremor (npm) | native | ~className | dts-grep (weak) | @tremor/react/dist/index.d.ts:120 Tailwind classes |
| Observable Plot | native | ~className\|style | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:13 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~--ag-\|cssVariables | dts-grep (weak) | ag-charts-community/dist/types/src/dom/domManager.d.ts:21 theme CSS variables in v11+ |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | native | ~cssClassNames | dts-grep (weak) | @types/google.visualization/index.d.ts:1178 |
| uPlot | native | ~class | dts-grep (weak) | 1:declare class uPlot { uplot.css classes |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~sx\|className\|Classes | dts-grep (weak) | @mui/x-charts/index.d.ts:11 MUI classes + CSS vars |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.themeCSS | dts-path (strong) | mermaid/dist/config.type.d.ts:71 |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
