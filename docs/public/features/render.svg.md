# SVG output

ChartKit: **native**

Renders to SVG

Matrix status: `native`. Verification: `dts-grep` (weak).

SVG string

Source: chartkit:packages/core/src/axis-extra.ts:2

No spec snippet. This row is not a single option that `validate()` can show.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — canvas only |
| Recharts | native | ~Surface\|svg | dts-grep (weak) | recharts/types/index.d.ts:1 |
| Apache ECharts | native | ~renderer | dts-grep (weak) | echarts/types/src/util/types.d.ts:38 renderer: 'svg' \| 'canvas' |
| Highcharts | native | ~SVGRenderer | dts-grep (weak) | highcharts/highcharts.src.d.ts:340 |
| Plotly.js | native | ~svg | dts-grep (weak) | @types/plotly.js/index.d.ts:1305 SVG for most traces |
| Nivo | native | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 SVG variants (+Canvas variants) |
| Victory | native | ~svg | dts-grep (weak) | victory-selection-container/lib/selection-helpers.d.ts:21 |
| visx | native | ~svg | dts-grep (weak) | @visx/stats/lib/ViolinPlot.d.ts:1 |
| ApexCharts | native | ~svg | dts-grep (weak) | apexcharts/types/unit-shapes.d.ts:199 |
| Tremor (npm) | unknown | ~svg | unverified (unknown) | — Recharts under the hood |
| Observable Plot | native | ~SVGSVGElement\|svg | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:99 |
| Vega-Lite | plugin | — | npm (weak) | — vega renderer 'svg' |
| AG Charts | unknown | — | conflict (unknown) | — canvas |
| amCharts 5 | unknown | — | conflict (unknown) | — canvas |
| Google Charts | unknown | ~svg | unverified (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — canvas |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — canvas |
| MUI X Charts | native | ~ChartsSurface\|svg | dts-grep (weak) | @mui/x-charts-pro/index.d.ts:20 |
| Mermaid (chart-ish diagrams only) | native | ~svg | dts-grep (weak) | mermaid/dist/utils.d.ts:146 |
| AntV G2 | plugin | — | npm (weak) | — G renderer plugin |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
