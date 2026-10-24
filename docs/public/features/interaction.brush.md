# Brush / range selection

ChartKit: **native**

Drag to select a range and emit it

Matrix status: `native`. Verification: `dts-path` (strong).

emits 'rangechange'

Source: chartkit:packages/core/src/generated/schema.ts:1157

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
  "interaction": {
    "brush": "x"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | Brush | dts-path (strong) | recharts/types/cartesian/Brush.d.ts:111 |
| Apache ECharts | native | brush | dts-path (strong) | echarts/types/dist/shared.d.ts:12586 |
| Highcharts | native | chart.zooming | dts-path (strong) | highcharts/highcharts.d.ts:6692 zoom selection; navigator/rangeSelector in Stock |
| Plotly.js | native | layout.dragmode=select | dts-path (strong) | plot-schema.json#layout.layoutAttributes.dragmode |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryBrushContainer | dts-path (strong) | victory-brush-container/lib/victory-brush-container.d.ts:131 |
| visx | native | Brush | dts-path (strong) | @visx/brush/lib/Brush.d.ts:59 |
| ApexCharts | native | chart.brush | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1917 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~interval | dts-grep (weak) | 1586:              "description" params select: interval |
| AG Charts | native | ~navigator | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:31 |
| amCharts 5 | native | ~behavior\|selectX | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/sliceGrouper/SliceGrouper.d.ts:42 XYCursor behavior: 'selectX' |
| Google Charts | native | ~explorer | dts-grep (weak) | @types/google.visualization/index.d.ts:467 |
| uPlot | native | Options.cursor.drag, Options.select | dts-path (strong) | uplot/dist/uPlot.d.ts:589, uplot/dist/uPlot.d.ts:386 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ChartsBrushOverlay, ~brush | dts-path (strong) | @mui/x-charts/ChartsBrushOverlay/ChartsBrushOverlay.d.mts:11, @mui/x-charts-pro/index.d.ts:25 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~brushXHighlight\|brushFilter | dts-grep (weak) | @antv/g2/lib/index.d.ts:146 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
