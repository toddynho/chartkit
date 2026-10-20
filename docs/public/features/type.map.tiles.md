# Tile / slippy map base layer

ChartKit: **none**

Raster or vector tile backgrounds

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is treemap "tile" layout

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | plugin | — | npm (weak) | — via extensions |
| Highcharts | native | series.type=tiledwebmap | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=scattermap, trace.type=choroplethmap | dts-path (strong) | plot-schema.json#traces.scattermap, plot-schema.json#traces.choroplethmap |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | MapRasterSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/map/MapRasterSeries.d.ts:101 |
| Google Charts | native | Map | dts-path (strong) | @types/google.visualization/index.d.ts:1441 Google Maps based |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 668873d6cd29.

https://chartkit.dev/features.json
