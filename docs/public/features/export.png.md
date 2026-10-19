# PNG export

ChartKit: **none**

Export the chart as a PNG

Matrix status: `none`. Verification: `dts-absence` (absence).

SVG string only; no PNG helper in packages (the docs playground exports PNG in the browser)

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Chart.toBase64Image | dts-path (strong) | chart.js/dist/types/index.d.ts:550 |
| Recharts | none | — | dts-absence (absence) | — SVG; use a third-party rasteriser |
| Apache ECharts | native | ~getDataURL | dts-grep (weak) | echarts/types/src/core/echarts.d.ts:249 |
| Highcharts | plugin | ~exportChart | dts-grep (weak) | highcharts/highcharts.src.d.ts:11337 exporting module |
| Plotly.js | native | ~toImage\|downloadImage | dts-grep (weak) | @types/plotly.js/index.d.ts:452 |
| Nivo | plugin | — | npm (weak) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | ~dataURI | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:272 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | plugin | — | npm (weak) | — actions export PNG |
| AG Charts | native | ~download | dts-grep (weak) | ag-charts-types/dist/types/src/chartBuilderOptions.d.ts:108 AgCharts download / getImageDataURL |
| amCharts 5 | plugin | ~Exporting | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:8 |
| Google Charts | native | ~getImageURI | dts-grep (weak) | @types/google.visualization/index.d.ts:646 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~takeScreenshot | dts-grep (weak) | 1767:	takeScreenshot(addTopLayer? |
| MUI X Charts | native (pro) | ~exportAsImage | dts-grep (weak) | @mui/x-charts-pro/internals/plugins/useChartProExport/useChartProExport.types.d.ts:95 |
| Mermaid (chart-ish diagrams only) | plugin | — | npm (weak) | — |
| AntV G2 | unknown | ~toDataURL\|downloadImage | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
