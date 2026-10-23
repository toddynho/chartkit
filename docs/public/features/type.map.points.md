# Point / bubble map

ChartKit: **native**

Markers or bubbles at coordinates

Matrix status: `native`. Verification: `source-review` (strong).

@chartkitdev/geo, unpublished, not in the line or all bundles. No tiles, no pan/zoom, no US counties, no NUTS-2. Small states missing from Natural Earth 110m, including Malta, are points.

Source: packages/geo/src/render.ts

No spec snippet from core `validate()`. `@chartkitdev/geo` renders this type. The package is unpublished and is not in the line or all bundles. Its own `validate()` reports CK3050–CK3056.

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

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
