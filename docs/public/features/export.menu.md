# Built-in export menu / toolbar

ChartKit: **none**

UI button for download/print

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | toolbox.feature.saveAsImage | dts-path (strong) | echarts/types/dist/shared.d.ts:12480 |
| Highcharts | plugin | ~contextButton | dts-grep (weak) | highcharts/highcharts.src.d.ts:10748 exporting module menu |
| Plotly.js | native | config.displayModeBar | dts-path (strong) | plot-schema.json#config.displayModeBar |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | chart.toolbar.show, chart.toolbar.tools.download | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2178, apexcharts/types/apexcharts.d.ts:2182 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | plugin | — | npm (weak) | — actions menu |
| AG Charts | native | ~contextMenu\|toolbar | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:21 |
| amCharts 5 | plugin | ~ExportingMenu | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:90 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | ChartsToolbarPro | dts-path (strong) | @mui/x-charts-pro/ChartsToolbarPro/ChartsToolbarPro.d.mts:40 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
