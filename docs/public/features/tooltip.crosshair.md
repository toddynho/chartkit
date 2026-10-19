# Crosshair / guide line

ChartKit: **native**

Vertical (and horizontal) guide line following the cursor

Matrix status: `native`. Verification: `dts-path` (strong).

tooltip.crosshair draws the guide. tooltip.crosshairLabel prints the x value on it.

Source: chartkit:packages/core/src/generated/schema.ts:200

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40
    },
    {
      "quarter": "Q2",
      "units": 55
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": "units"
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "tooltip": {
    "crosshair": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | Tooltip.cursor | dts-path (strong) | recharts/types/component/Tooltip.d.ts:77 |
| Apache ECharts | native | tooltip.axisPointer.type | dts-path (strong) | echarts/types/dist/shared.d.ts:6795 'line' \| 'cross' \| 'shadow' |
| Highcharts | native | xAxis.crosshair, yAxis.crosshair | dts-path (strong) | highcharts/highcharts.d.ts:108188, highcharts/highcharts.d.ts:110109 |
| Plotly.js | native | layout.xaxis.showspikes, layout.spikedistance | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.showspikes, plot-schema.json#layout.layoutAttributes.spikedistance |
| Nivo | native | Line.enableCrosshair, Line.crosshairType | dts-path (strong) | @nivo/line/dist/types/types.d.ts:183, @nivo/line/dist/types/types.d.ts:184 |
| Victory | native | VictoryCursorContainer | dts-path (strong) | victory-cursor-container/lib/victory-cursor-container.d.ts:73 |
| visx | native | ~showVerticalCrosshair\|showHorizontalCrosshair | dts-grep (weak) | @visx/xychart/lib/components/Tooltip.d.ts:26 |
| ApexCharts | native | xaxis.crosshairs.show | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4993 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | crosshair, crosshairX | dts-path (strong) | @observablehq/plot/src/marks/crosshair.d.ts:65, @observablehq/plot/src/marks/crosshair.d.ts:74 |
| Vega-Lite | partial | ~rule | dts-grep (weak) | 164:          "description" rule + selection recipe |
| AG Charts | native | ~crosshair | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:17 |
| amCharts 5 | native | XYCursor | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/XYCursor.d.ts:166 |
| Google Charts | native | ~crosshair | dts-grep (weak) | @types/google.visualization/index.d.ts:452 |
| uPlot | native | Options.cursor | dts-path (strong) | uplot/dist/uPlot.d.ts:390 |
| TradingView Lightweight Charts | native | ~crosshair | dts-grep (weak) | 33: * Represents the crosshair mode. CrosshairMode |
| MUI X Charts | native | ChartsAxisHighlight | dts-path (strong) | @mui/x-charts/ChartsAxisHighlight/ChartsAxisHighlight.d.mts:12 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~crosshairs | dts-grep (weak) | @antv/g2/lib/runtime/types/mark.d.ts:30 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
