# Server-side rendering (no DOM)

ChartKit: **native**

Render on the server without a browser

Matrix status: `native`. Verification: `dts-grep` (weak).

pure string render; 0.85 ms for 1k-point line (project benchmark)

Source: chartkit:packages/vanilla/src/ssr.ts:5

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | x:pkg:chartjs-node-canvas | unverified (unknown) | — needs node-canvas |
| Recharts | partial | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 React SSR emits SVG when sized explicitly (ResponsiveContainer needs DOM) |
| Apache ECharts | native | ~ssr\|renderToSVGString | dts-grep (weak) | echarts/types/src/model/Global.d.ts:59 init(null, null, {renderer:'svg', ssr:true}) |
| Highcharts | plugin | — | npm (weak) | — headless export server |
| Plotly.js | none | — | dts-absence (absence) | — needs a browser (Kaleido/Puppeteer) |
| Nivo | plugin | — | npm (weak) | — server-side static images |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 React SSR SVG |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 React SSR SVG |
| ApexCharts | native | ~renderToString\|ssr | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:583 keyword match only; SSR helper semantics not reviewed |
| Tremor (npm) | partial | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 React SSR via Recharts |
| Observable Plot | partial | ~document | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:181 plot({document}) with jsdom/linkedom |
| Vega-Lite | plugin | — | npm (weak) | — vega View.toSVG() in Node |
| AG Charts | native | ~serverSideRendering | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:105 serverSideRenderingOptions |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | partial | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 React SSR (with explicit size) |
| Mermaid (chart-ish diagrams only) | plugin | — | npm (weak) | — needs headless browser |
| AntV G2 | plugin | — | npm (weak) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
