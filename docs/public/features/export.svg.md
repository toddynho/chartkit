# SVG export

ChartKit: **native**

Get the chart as an SVG string/file

Matrix status: `native`. Verification: `dts-grep` (weak).

the render output is SVG

Source: chartkit:packages/vanilla/src/ssr.ts:5

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — canvas |
| Recharts | partial | ~Surface | dts-grep (weak) | recharts/types/container/Surface.d.ts:4 serialise the DOM SVG yourself |
| Apache ECharts | native | ~renderToSVGString\|getSvgDataURL | dts-grep (weak) | echarts/types/dist/shared.d.ts:9106 |
| Highcharts | unknown | exporting.type=image/svg+xml | unverified (unknown) | — exporting module |
| Plotly.js | native | ~toImage | dts-grep (weak) | @types/plotly.js/index.d.ts:452 format: 'svg' |
| Nivo | partial | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 serialise DOM SVG |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 |
| ApexCharts | native | ~dataURI\|exportToSVG | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:272 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | partial | plot | dts-path (strong) | @observablehq/plot/src/plot.d.ts:427 returns an SVG element |
| Vega-Lite | plugin | — | npm (weak) | — View.toSVG |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | unknown | — | unverified (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | native | ~render | dts-grep (weak) | mermaid/dist/internals.d.ts:1 mermaid.render returns SVG string |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
