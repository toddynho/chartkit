# Explicit tick values

ChartKit: **native**

Specify exact tick positions

Matrix status: `native`. Verification: `runtime-probe` (strong).

explicit list; drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:1019

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
      "ticks": [
        20,
        50
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ~afterBuildTicks | dts-grep (weak) | chart.js/dist/types/index.d.ts:992 callback to replace ticks |
| Recharts | native | XAxis.ticks | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:108 |
| Apache ECharts | partial | xAxis.axisLabel.interval | dts-path (strong) | echarts/types/dist/shared.d.ts:2821 via interval/customValues |
| Highcharts | native | xAxis.tickPositions, xAxis.tickPositioner | dts-path (strong) | highcharts/highcharts.d.ts:108757, highcharts/highcharts.d.ts:108748 |
| Plotly.js | native | layout.xaxis.tickvals | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.tickvals |
| Nivo | native | ~tickValues | dts-grep (weak) | @nivo/axes/dist/types/types.d.ts:15 |
| Victory | native | VictoryAxis.tickValues | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:60 |
| visx | native | AxisBottom.tickValues | dts-path (strong) | @visx/axis/lib/types.d.ts:114 |
| ApexCharts | partial | xaxis.tickPlacement | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4963 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~ticks | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:317 ticks: array |
| Vega-Lite | native | ~values | dts-grep (weak) | 40:        "values", axis.values |
| AG Charts | native | ~values | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:15 |
| amCharts 5 | native | ~AxisRangeDataItem\|createAxisRange | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:740 axis ranges as custom ticks |
| Google Charts | native | ~ticks | dts-grep (weak) | @types/google.visualization/index.d.ts:535 hAxis.ticks |
| uPlot | native | Options.axes.splits | dts-path (strong) | uplot/dist/uPlot.d.ts:1102 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.xAxis, ~tickInterval | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/hooks/useTicksGrouped.d.ts:28 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~tickMethod\|tickFilter | dts-grep (weak) | @antv/g2/lib/spec/component.d.ts:30 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 507c518833a4.

https://chartkit.dev/features.json
