# Choropleth map

ChartKit: **none**

Regions coloured by value

Matrix status: `none`. Verification: `dts-absence` (absence).

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.type=map | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=map | dts-path (strong) | highcharts/options/abands.d.ts:1386 Highcharts Maps |
| Plotly.js | native | trace.type=choropleth | dts-path (strong) | plot-schema.json#traces.choropleth |
| Nivo | native | Choropleth | dts-path (strong) | @nivo/geo/index.d.ts:133 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Mercator, AlbersUsa | dts-path (strong) | @visx/geo/lib/projections/Mercator.d.ts:6, @visx/geo/lib/projections/AlbersUsa.d.ts:6 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | geo | dts-path (strong) | @observablehq/plot/src/marks/geo.d.ts:57 |
| Vega-Lite | native | mark=geoshape | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native (ent) | series.type=map-shape | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | MapPolygonSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/map/MapPolygonSeries.d.ts:52 |
| Google Charts | native | GeoChart | dts-path (strong) | @types/google.visualization/index.d.ts:366 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (premium) | ~Map | dts-grep (weak) | @mui/x-charts-premium/index.d.ts:28 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~geoPath | dts-grep (weak) | @antv/g2/lib/index.d.ts:185 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 07234d1c8099.

https://chartkit.dev/features.json
