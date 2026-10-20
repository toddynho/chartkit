# Axis pointer label

ChartKit: **native**

Value label on the axis following the cursor

Matrix status: `native`. Verification: `runtime-probe` (strong).

tooltip.crosshairLabel prints the hovered x value on the guide, at the axis edge.

Source: packages/core/src/interact.ts

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
    "crosshairLabel": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | axisPointer.label, xAxis.axisPointer | dts-path (strong) | echarts/types/dist/shared.d.ts:8181, echarts/types/dist/shared.d.ts:2617 |
| Highcharts | native | xAxis.crosshair.label | dts-path (strong) | highcharts/highcharts.d.ts:5279 |
| Plotly.js | native | layout.xaxis.showspikes | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.showspikes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryCursorContainer.cursorLabel | dts-path (strong) | victory-cursor-container/lib/victory-cursor-container.d.ts:7 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | xaxis.crosshairs, xaxis.tooltip | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4992, apexcharts/types/apexcharts.d.ts:5015 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | crosshairX | dts-path (strong) | @observablehq/plot/src/marks/crosshair.d.ts:74 crosshair mark shows axis values |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~crosshair | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:17 |
| amCharts 5 | native | ~XYCursor\|tooltip | dts-grep (weak) | @amcharts/amcharts5/xy.d.ts:3 axis.tooltip shows value on axis |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.cursor | dts-path (strong) | uplot/dist/uPlot.d.ts:390 |
| TradingView Lightweight Charts | native | ~crosshair\|labelVisible | dts-grep (weak) | 33: * Represents the crosshair mode. |
| MUI X Charts | native | ChartsAxisHighlight, ~ChartsAxisHighlightValue | dts-path (strong) | @mui/x-charts/ChartsAxisHighlight/ChartsAxisHighlight.d.mts:12, @mui/x-charts-pro/package.json:150 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~crosshairs | dts-grep (weak) | @antv/g2/lib/runtime/types/mark.d.ts:30 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against f0e644ec234d.

https://chartkit.dev/features.json
