# Point / bubble map

ChartKit: **native**

Markers or bubbles at coordinates

Matrix status: `native`. Verification: `source-review` (strong).

`@chartkitdev/geo` draws `type: "map-points"`. Latitude, longitude, size, and colour are fields. The largest points can be labelled. The same atlas chunks as the choropleth are the basemap. Unpublished, and not in the line or `all` bundles.

This ties libraries whose point maps are native. Nivo and visx are manual, so those rows rank as a ChartKit win. There is still no tile layer (`type.map.tiles` stays none) and no pan or zoom.

## ChartKit spec

```json
{
  "version": "1",
  "type": "map-points",
  "data": [{ "name": "Tokyo", "lat": 35.7, "lon": 139.7, "pop": 37 }],
  "encoding": { "latitude": "lat", "longitude": "lon", "size": "pop", "color": "pop", "label": "name" },
  "mark": { "atlas": "world", "labelCount": 5 },
  "a11y": { "alt": "Tokyo is the largest bubble." }
}
```

Rendered by `@chartkitdev/geo`, not by core `validate()` / `render()`.

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

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40b908be291d.

https://chartkit.dev/features.json
