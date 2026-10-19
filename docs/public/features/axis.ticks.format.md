# Tick label formatting

ChartKit: **native**

Number/date format or formatter function for tick labels

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:998

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
      "format": "compact"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~callback | dts-grep (weak) | chart.js/dist/types/index.d.ts:1216 ticks.callback |
| Recharts | native | YAxis.tickFormatter | dts-path (strong) | recharts/types/util/types.d.ts:793 |
| Apache ECharts | native | yAxis.axisLabel.formatter | dts-path (strong) | echarts/types/dist/shared.d.ts:2820 |
| Highcharts | native | yAxis.labels.format, yAxis.labels.formatter | dts-path (strong) | highcharts/highcharts.d.ts:109837, highcharts/highcharts.d.ts:109849 |
| Plotly.js | native | layout.yaxis.tickformat, layout.yaxis.tickprefix | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.tickformat, plot-schema.json#layout.layoutAttributes.yaxis.tickprefix |
| Nivo | native | ~format | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:3 axisLeft.format |
| Victory | native | VictoryAxis.tickFormat | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:57 |
| visx | native | AxisLeft.tickFormat | dts-path (strong) | @visx/axis/lib/types.d.ts:67 |
| ApexCharts | native | yaxis.labels.formatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5071 |
| Tremor (npm) | native | LineChart.valueFormatter | dts-path (strong) | @tremor/react/dist/index.d.ts:60 |
| Observable Plot | native | ~tickFormat | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:591 |
| Vega-Lite | native | ~format | dts-grep (weak) | 84:          "description" |
| AG Charts | native | ~formatter\|format | dts-grep (weak) | ag-charts-enterprise/dist/types/src/license/licenseManager.d.ts:2 |
| amCharts 5 | native | ~numberFormat\|dateFormats | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:159 |
| Google Charts | native | ~format | dts-grep (weak) | @types/google.visualization/index.d.ts:162 vAxis.format |
| uPlot | native | Options.axes.values | dts-path (strong) | uplot/dist/uPlot.d.ts:1108 values: (u, splits) => labels |
| TradingView Lightweight Charts | native | ~priceFormatter\|tickMarkFormatter | dts-grep (weak) | 2211:export interface IPriceFormatter { |
| MUI X Charts | native | LineChart.xAxis, ~valueFormatter | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:43 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~labelFormatter | dts-grep (weak) | @antv/g2/lib/component/legendCategory.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c09b89c6d9f1.

https://chartkit.dev/features.json
