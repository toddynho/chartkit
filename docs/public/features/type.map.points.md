# Point / bubble map

ChartKit: **none**

Markers or bubbles at coordinates

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match themes/candidates.ts:12 unrelated

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — bubbleMap controller |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | geo | dts-path (strong) | echarts/types/dist/shared.d.ts:12573 scatter series on geo coordinate system |
| Highcharts | native | series.type=mappoint, series.type=mapbubble | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=scattergeo | dts-path (strong) | plot-schema.json#traces.scattergeo |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | dot | dts-path (strong) | @observablehq/plot/src/marks/dot.d.ts:112 with projection |
| Vega-Lite | native | ~longitude | dts-grep (weak) | 5021:        "longitude" |
| AG Charts | native (ent) | series.type=map-marker | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | MapPointSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/map/MapPointSeries.d.ts:194 |
| Google Charts | native | GeoChart | dts-path (strong) | @types/google.visualization/index.d.ts:366 displayMode markers |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~geoView | dts-grep (weak) | @antv/g2/lib/index.d.ts:184 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 668873d6cd29.

https://chartkit.dev/features.json
