# Axis title

ChartKit: **native**

Label describing the axis

Matrix status: `native`. Verification: `runtime-probe` (strong).

falls back to the channel title; drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:994

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
      "title": "Units"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~title | dts-grep (weak) | chart.js/dist/types/index.d.ts:791 scales.x.title.text |
| Recharts | native | XAxis.label | dts-path (strong) | recharts/types/util/types.d.ts:843 |
| Apache ECharts | native | xAxis.name | dts-path (strong) | echarts/types/dist/shared.d.ts:2575 |
| Highcharts | native | xAxis.title.text | dts-path (strong) | highcharts/highcharts.d.ts:109385 |
| Plotly.js | native | layout.xaxis.title.text | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.title.text |
| Nivo | native | Line.axisBottom, ~legend | dts-path (strong) | @nivo/line/dist/types/types.d.ts:178, @nivo/stream/package.json:42 axisBottom.legend is the axis title |
| Victory | native | VictoryAxis.label | dts-path (strong) | victory-core/lib/types/prop-types.d.ts:122 |
| visx | native | AxisBottom.label | dts-path (strong) | @visx/axis/lib/types.d.ts:36 |
| ApexCharts | native | xaxis.title.text | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4981 |
| Tremor (npm) | native | LineChart.xAxisLabel, LineChart.yAxisLabel | dts-path (strong) | @tremor/react/dist/index.d.ts:87, @tremor/react/dist/index.d.ts:88 |
| Observable Plot | native | ~label | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:327 x: {label} |
| Vega-Lite | native | ~title | dts-grep (weak) | 1400:              "description" |
| AG Charts | native | ~title | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:14 |
| amCharts 5 | native | ~Label | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:55 axis.children.push(Label) |
| Google Charts | native | ~title | dts-grep (weak) | @types/google.visualization/index.d.ts:504 hAxis.title |
| uPlot | native | Options.axes.label | dts-path (strong) | uplot/dist/uPlot.d.ts:1084 |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — no axis titles |
| MUI X Charts | native | LineChart.xAxis, ~label | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/index.d.ts:16 |
| Mermaid (chart-ish diagrams only) | native | ~xAxis\|title | dts-grep (weak) | mermaid/dist/utils.d.ts:223 x-axis "title" |
| AntV G2 | native | ~title | dts-grep (weak) | @antv/g2/lib/index.d.ts:115 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
