# Scatter plot

ChartKit: **native**

Points by two quantitative values

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

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
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry.scatter | dts-path (strong) | chart.js/dist/types/index.d.ts:3723 |
| Recharts | native | ScatterChart, Scatter | dts-path (strong) | recharts/types/chart/ScatterChart.d.ts:8, recharts/types/cartesian/Scatter.d.ts:309 |
| Apache ECharts | native | series.type=scatter | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=scatter | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.mode=markers | dts-path (strong) | plot-schema.json#traces.{scatter,scatter3d,scattercarpet,scattergeo,scattergl,scattermap,…}.attributes.mode |
| Nivo | native | ScatterPlot | dts-path (strong) | @nivo/scatterplot/dist/types/ScatterPlot.d.ts:4 |
| Victory | native | VictoryScatter | dts-path (strong) | victory-scatter/lib/victory-scatter.d.ts:38 |
| visx | native | GlyphSeries, GlyphCircle | dts-path (strong) | @visx/xychart/lib/components/series/GlyphSeries.d.ts:5, @visx/glyph/lib/glyphs/GlyphCircle.d.ts:17 |
| ApexCharts | native | chart.type=scatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | ScatterChart | dts-path (strong) | @tremor/react/dist/index.d.ts:175 |
| Observable Plot | native | dot | dts-path (strong) | @observablehq/plot/src/marks/dot.d.ts:112 |
| Vega-Lite | native | mark=point | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type=scatter | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | LineSeries, ~strokeOpacity | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:70, @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:55 documented: line series with bullets and hidden stroke |
| Google Charts | native | ScatterChart | dts-path (strong) | @types/google.visualization/index.d.ts:666 |
| uPlot | partial | Options.mode | dts-path (strong) | uplot/dist/uPlot.d.ts:340 mode:2 / points path demo |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ScatterChart | dts-path (strong) | @mui/x-charts/ScatterChart/ScatterChart.d.mts:97 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.quadrantChart | dts-path (strong) | mermaid/dist/config.type.d.ts:224 quadrant points only |
| AntV G2 | native | MarkTypes=point | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
