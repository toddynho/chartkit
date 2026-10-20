# Axis position (top/bottom/left/right)

ChartKit: **native**

Place the axis on any side

Matrix status: `native`. Verification: `runtime-probe` (strong).

drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:979

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
    "x": {
      "position": "top"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~position | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 scales.x.position |
| Recharts | native | XAxis.orientation | dts-path (strong) | @types/react/index.d.ts:3869 |
| Apache ECharts | native | xAxis.position | dts-path (strong) | echarts/types/dist/shared.d.ts:2992 |
| Highcharts | native | xAxis.opposite | dts-path (strong) | highcharts/highcharts.d.ts:108511 |
| Plotly.js | native | layout.xaxis.side | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.side |
| Nivo | native | Line.axisTop, Line.axisRight | dts-path (strong) | @nivo/line/dist/types/types.d.ts:176, @nivo/line/dist/types/types.d.ts:177 |
| Victory | native | VictoryAxis.orientation | dts-path (strong) | victory-axis/lib/victory-axis.d.ts:10 |
| visx | native | AxisTop, AxisRight | dts-path (strong) | @visx/axis/lib/axis/AxisTop.d.ts:10, @visx/axis/lib/axis/AxisRight.d.ts:11 |
| ApexCharts | native | yaxis.opposite | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5036 x axis top: xaxis.position |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~axis | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:4 'top' \| 'bottom' \| 'both' |
| Vega-Lite | native | ~orient | dts-grep (weak) | 590:        "orient" |
| AG Charts | native | ~position | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:42 |
| amCharts 5 | native | ~opposite | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY.d.ts:18 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | native | Options.axes.side | dts-path (strong) | uplot/dist/uPlot.d.ts:1066 |
| TradingView Lightweight Charts | native | ~leftPriceScale\|rightPriceScale | dts-grep (weak) | 956:	leftPriceScale |
| MUI X Charts | native | LineChart.xAxis, ~position | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/hooks/useTicks.d.ts:27 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~position | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against cfb64fb8d1fe.

https://chartkit.dev/features.json
