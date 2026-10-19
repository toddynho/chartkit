# Point marker size

ChartKit: **native**

Marker radius / size

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:815

## ChartKit spec

```json
{
  "version": "1",
  "type": "scatter",
  "data": [
    {
      "temp": 16,
      "yieldKg": 3
    },
    {
      "temp": 22,
      "yieldKg": 5
    }
  ],
  "encoding": {
    "x": "temp",
    "y": "yieldKg"
  },
  "a11y": {
    "alt": "Yield peaks at 22."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "pointSize": 4
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.pointRadius | dts-path (strong) | chart.js/dist/types/index.d.ts:2066 |
| Recharts | native | Line.dot | dts-path (strong) | recharts/types/cartesian/Line.d.ts:120 dot props r |
| Apache ECharts | native | series.symbolSize | dts-path (strong) | echarts/types/dist/shared.d.ts:7758 |
| Highcharts | native | plotOptions.series.marker.radius | dts-path (strong) | highcharts/highcharts.d.ts:97649 |
| Plotly.js | native | trace.marker.size | dts-path (strong) | plot-schema.json#traces.{box,scatter,scatter3d,scattercarpet,scattergeo,scattergl,…}.attributes.marker.size |
| Nivo | native | Line.pointSize | dts-path (strong) | @nivo/line/dist/types/types.d.ts:141 |
| Victory | native | VictoryScatter.size | dts-path (strong) | victory-scatter/lib/victory-scatter.d.ts:11 |
| visx | native | GlyphSeries, ~size | dts-path (strong) | @visx/xychart/lib/components/series/GlyphSeries.d.ts:5, @visx/marker/lib/markers/Marker.d.ts:5 |
| ApexCharts | native | markers.size | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4652 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~r | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:1 |
| Vega-Lite | native | ~size | dts-grep (weak) | 232:          "description" |
| AG Charts | native | series.marker.size | dts-path (strong) | ag-charts-types/dist/types/src/series/markerOptions.d.ts:7 |
| amCharts 5 | native | ~radius | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/timeline/SpiralChart.d.ts:6 |
| Google Charts | native | LineChartOptions.pointSize | dts-path (strong) | @types/google.visualization/index.d.ts:808 |
| uPlot | native | Options.series.points.size | dts-path (strong) | uplot/dist/uPlot.d.ts:830 |
| TradingView Lightweight Charts | native | ~pointMarkersRadius | dts-grep (weak) | 495:	pointMarkersRadius? |
| MUI X Charts | native | ~markerSize | dts-grep (weak) | @mui/x-charts/models/seriesType/scatter.d.ts:31 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~size | dts-grep (weak) | @antv/g2/lib/api/utils.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against bdf969b7d123.

https://chartkit.dev/features.json
