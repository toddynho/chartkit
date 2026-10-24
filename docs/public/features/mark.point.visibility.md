# Show markers always / on hover / never

ChartKit: **native**

Marker display policy on line series

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:811

## ChartKit spec

```json
{
  "version": "1",
  "type": "scatter",
  "data": [
    {
      "x": 16,
      "y": 3
    },
    {
      "x": 22,
      "y": 5
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y"
  },
  "a11y": {
    "alt": "Y peaks at 22."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "points": "hover"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.pointRadius, ChartConfiguration.data.datasets.pointHoverRadius | dts-path (strong) | chart.js/dist/types/index.d.ts:2066, chart.js/dist/types/index.d.ts:2093 |
| Recharts | native | Line.dot, Line.activeDot | dts-path (strong) | recharts/types/cartesian/Line.d.ts:120, recharts/types/cartesian/Line.d.ts:43 |
| Apache ECharts | native | series.showSymbol | dts-path (strong) | echarts/types/dist/shared.d.ts:11107 |
| Highcharts | native | plotOptions.series.marker.enabled | dts-path (strong) | highcharts/highcharts.d.ts:97613 |
| Plotly.js | native | trace.mode | dts-path (strong) | plot-schema.json#traces.{indicator,scatter,scatter3d,scattercarpet,scattergeo,scattergl,…}.attributes.mode |
| Nivo | native | Line.enablePoints | dts-path (strong) | @nivo/line/dist/types/types.d.ts:139 |
| Victory | partial | VictoryScatter | dts-path (strong) | victory-scatter/lib/victory-scatter.d.ts:38 add/omit scatter layer |
| visx | partial | GlyphSeries | dts-path (strong) | @visx/xychart/lib/components/series/GlyphSeries.d.ts:5 |
| ApexCharts | native | markers.size, markers.hover.size | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4652, apexcharts/types/apexcharts.d.ts:4667 |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | native | ~marker | dts-grep (weak) | @observablehq/plot/src/marker.d.ts:2 line marker option |
| Vega-Lite | native | ~point | dts-grep (weak) | 350:              "description" mark.point: true \| 'transparent' |
| AG Charts | native | series.marker.enabled | dts-path (strong) | ag-charts-types/dist/types/src/series/markerOptions.d.ts:13 |
| amCharts 5 | native | ~bullets | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:8 |
| Google Charts | native | LineChartOptions.pointsVisible | dts-path (strong) | @types/google.visualization/index.d.ts:809 |
| uPlot | native | Options.series.points.show | dts-path (strong) | uplot/dist/uPlot.d.ts:822 |
| TradingView Lightweight Charts | native | ~pointMarkersVisible | dts-grep (weak) | 489:	pointMarkersVisible |
| MUI X Charts | native | LineChart.series.showMark | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:70 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~point | dts-grep (weak) | @antv/g2/lib/index.d.ts:68 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
