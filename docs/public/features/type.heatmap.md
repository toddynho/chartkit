# Heatmap (matrix)

ChartKit: **native**

Grid of cells coloured by value

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "heatmap",
  "data": [
    {
      "x": "A",
      "y": "L",
      "v": 1
    },
    {
      "x": "B",
      "y": "L",
      "v": 4
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y",
    "color": "v"
  },
  "a11y": {
    "alt": "B is darker."
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
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | series.type=heatmap | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=heatmap | dts-path (strong) | highcharts/options/abands.d.ts:1386 heatmap module |
| Plotly.js | native | trace.type=heatmap | dts-path (strong) | plot-schema.json#traces.heatmap |
| Nivo | native | HeatMap | dts-path (strong) | @nivo/heatmap/dist/types/HeatMap.d.ts:4 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | HeatmapRect, HeatmapCircle | dts-path (strong) | @visx/heatmap/lib/heatmaps/HeatmapRect.d.ts:46, @visx/heatmap/lib/heatmaps/HeatmapCircle.d.ts:41 |
| ApexCharts | native | chart.type=heatmap | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | cell | dts-path (strong) | @observablehq/plot/src/marks/cell.d.ts:47 |
| Vega-Lite | native | mark=rect | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native (ent) | series.type=heatmap | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | partial | ColumnSeries, ~heatRules | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:33, @amcharts/amcharts5/examples/xy-bubble/config.json:549 column series on two category axes + heatRules |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 demo heatmap plugin code |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | Heatmap | dts-path (strong) | @mui/x-charts-pro/Heatmap/Heatmap.d.mts:79 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=cell, MarkTypes=heatmap | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13, @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
