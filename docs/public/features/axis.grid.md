# Grid lines

ChartKit: **native**

Major grid lines from an axis

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:1023

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
  "axes": {
    "y": {
      "grid": true
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~grid | dts-grep (weak) | chart.js/dist/types/index.d.ts:1296 scales.y.grid.display |
| Recharts | native | CartesianGrid | dts-path (strong) | recharts/types/cartesian/CartesianGrid.d.ts:201 |
| Apache ECharts | native | yAxis.splitLine.show | dts-path (strong) | echarts/types/dist/shared.d.ts:2830 |
| Highcharts | native | yAxis.gridLineWidth, yAxis.gridLineColor | dts-path (strong) | highcharts/highcharts.d.ts:110189, highcharts/highcharts.d.ts:110165 |
| Plotly.js | native | layout.yaxis.showgrid, layout.yaxis.gridcolor | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.showgrid, plot-schema.json#layout.layoutAttributes.yaxis.gridcolor |
| Nivo | native | Line.enableGridX, Line.enableGridY | dts-path (strong) | @nivo/line/dist/types/types.d.ts:148, @nivo/line/dist/types/types.d.ts:150 |
| Victory | native | VictoryAxis.style | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:46 grid style |
| visx | native | GridRows, GridColumns | dts-path (strong) | @visx/grid/lib/grids/GridRows.d.ts:17, @visx/grid/lib/grids/GridColumns.d.ts:17 |
| ApexCharts | native | grid.show, grid.yaxis.lines.show | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5267, apexcharts/types/apexcharts.d.ts:5280 |
| Tremor (npm) | native | LineChart.showGridLines | dts-path (strong) | @tremor/react/dist/index.d.ts:68 |
| Observable Plot | native | ~grid | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:317 grid: true / gridX / gridY marks |
| Vega-Lite | native | ~grid | dts-grep (weak) | 786:              "description" |
| AG Charts | native | ~gridLine | dts-grep (weak) | ag-charts-enterprise/dist/types/src/axes/radius/radiusAxis.d.ts:4 |
| amCharts 5 | native | ~grid | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:111 renderer.grid.template |
| Google Charts | native | ~gridlines | dts-grep (weak) | @types/google.visualization/index.d.ts:530 |
| uPlot | native | Options.axes.grid | dts-path (strong) | uplot/dist/uPlot.d.ts:1120 |
| TradingView Lightweight Charts | native | ~grid | dts-grep (weak) | 374: * - Whitespace is ignored for the crosshair and grid lines vertLines / horzLines |
| MUI X Charts | native | LineChart.grid | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:30 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~grid | dts-grep (weak) | @antv/g2/lib/component/axis.d.ts:17 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
