# React

ChartKit: **native**

Official React components or wrapper

Matrix status: `native`. Verification: `dts-grep` (weak).

@chartkitdev/react

Source: chartkit:packages/core/schema/chartkit.schema.json:5

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — community wrapper (most used) |
| Recharts | native | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 React-only library |
| Apache ECharts | plugin | — | npm (weak) | — community wrapper |
| Highcharts | plugin | — | npm (weak) | — |
| Plotly.js | plugin | — | npm (weak) | — |
| Nivo | native | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 React-only |
| Victory | native | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 React-only |
| visx | native | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 React-only |
| ApexCharts | plugin | — | npm (weak) | — |
| Tremor (npm) | native | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 React-only |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 call plot() in an effect |
| Vega-Lite | plugin | — | npm (weak) | — |
| AG Charts | plugin | — | npm (weak) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 documented React integration (no wrapper) |
| Google Charts | plugin | — | npm (weak) | — |
| uPlot | plugin | — | npm (weak) | — |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView documented React tutorial |
| MUI X Charts | native | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 React-only |
| Mermaid (chart-ish diagrams only) | unknown | — | unverified (unknown) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 19ec852446f0.

https://chartkit.dev/features.json
