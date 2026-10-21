# Tick count / interval

ChartKit: **native**

Approximate or fixed number of ticks

Matrix status: `native`. Verification: `runtime-probe` (strong).

count 0-50; drawn on createRenderer([line]) since PR #17 (main 116d0af)

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
      "ticks": 3
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~maxTicksLimit\|stepSize | dts-grep (weak) | chart.js/dist/types/index.d.ts:3199 |
| Recharts | native | YAxis.tickCount, XAxis.interval | dts-path (strong) | recharts/types/util/types.d.ts:767, recharts/types/cartesian/XAxis.d.ts:125 |
| Apache ECharts | native | yAxis.splitNumber, yAxis.interval | dts-path (strong) | echarts/types/dist/shared.d.ts:2683, echarts/types/dist/shared.d.ts:2687 |
| Highcharts | native | yAxis.tickAmount, yAxis.tickInterval | dts-path (strong) | highcharts/highcharts.d.ts:110637, highcharts/highcharts.d.ts:110664 |
| Plotly.js | native | layout.yaxis.nticks, layout.yaxis.dtick | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.nticks, plot-schema.json#layout.layoutAttributes.yaxis.dtick |
| Nivo | native | ~tickValues | dts-grep (weak) | @nivo/axes/dist/types/types.d.ts:15 axisLeft.tickValues number or array |
| Victory | native | VictoryAxis.tickCount | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:55 |
| visx | native | AxisLeft.numTicks | dts-path (strong) | @visx/axis/lib/types.d.ts:44 |
| ApexCharts | native | yaxis.tickAmount, xaxis.tickAmount | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5040, apexcharts/types/apexcharts.d.ts:4964 |
| Tremor (npm) | native | LineChart.tickGap | dts-path (strong) | @tremor/react/dist/index.d.ts:86 |
| Observable Plot | native | ~ticks | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:317 ticks: number \| interval |
| Vega-Lite | native | ~tickCount | dts-grep (weak) | 1630:        "tickCount" |
| AG Charts | native | ~interval | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:13 axes[].interval.step / minSpacing |
| amCharts 5 | native | ~minGridDistance | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-step/config.json:83 |
| Google Charts | native | ~gridlines\|count | dts-grep (weak) | @types/google.visualization/index.d.ts:119 gridlines.count |
| uPlot | native | Options.axes.space, Options.axes.incrs | dts-path (strong) | uplot/dist/uPlot.d.ts:1096, uplot/dist/uPlot.d.ts:1099 |
| TradingView Lightweight Charts | native | ~tickMarkMaxCharacterLength\|minBarSpacing | dts-grep (weak) | 1373:	minBarSpacing |
| MUI X Charts | native | LineChart.xAxis, ~tickNumber\|tickInterval | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/hooks/useTicksGrouped.d.ts:28 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~tickCount | dts-grep (weak) | @antv/g2/lib/component/axis.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 07234d1c8099.

https://chartkit.dev/features.json
