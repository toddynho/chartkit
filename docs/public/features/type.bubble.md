# Bubble chart

ChartKit: **native**

Scatter with a size encoding

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:488

## ChartKit spec

```json
{
  "version": "1",
  "type": "scatter",
  "data": [
    {
      "x": 16,
      "y": 3,
      "size": 4
    },
    {
      "x": 22,
      "y": 5,
      "size": 10
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y",
    "size": "size"
  },
  "a11y": {
    "alt": "Y peaks at 22."
  },
  "size": {
    "width": 640,
    "height": 260
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry.bubble | dts-path (strong) | chart.js/dist/types/index.d.ts:3731 |
| Recharts | native | ZAxis.range | dts-path (strong) | recharts/types/cartesian/ZAxis.d.ts:31 |
| Apache ECharts | native | series.symbolSize | dts-path (strong) | echarts/types/dist/shared.d.ts:7758 callback |
| Highcharts | native | series.type=bubble | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.marker.size | dts-path (strong) | plot-schema.json#traces.{box,scatter,scatter3d,scattercarpet,scattergeo,scattergl,…}.attributes.marker.size |
| Nivo | native | ScatterPlot.nodeSize | dts-path (strong) | @nivo/scatterplot/dist/types/types.d.ts:97 |
| Victory | native | VictoryScatter.bubbleProperty | dts-path (strong) | victory-scatter/lib/victory-scatter.d.ts:5 |
| visx | native | GlyphSeries | dts-path (strong) | @visx/xychart/lib/components/series/GlyphSeries.d.ts:5 size accessor |
| ApexCharts | native | chart.type=bubble | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | ScatterChart.size | dts-path (strong) | @tremor/react/dist/index.d.ts:142 |
| Observable Plot | native | dot, ~r | dts-path (strong) | @observablehq/plot/src/marks/dot.d.ts:112, @observablehq/plot/src/symbol.d.ts:1 r channel |
| Vega-Lite | native | ~size | dts-grep (weak) | 232:          "description" |
| AG Charts | native | series.type=bubble | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~heatRules | dts-grep (weak) | @amcharts/amcharts5/examples/xy-bubble/config.json:549 bullet radius via heatRules |
| Google Charts | native | BubbleChart | dts-path (strong) | @types/google.visualization/index.d.ts:1081 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 demo with custom points path |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~markerSize | dts-grep (weak) | @mui/x-charts/models/seriesType/scatter.d.ts:31 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~size | dts-grep (weak) | @antv/g2/lib/api/utils.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 2c56df7b4c59.

https://chartkit.dev/features.json
