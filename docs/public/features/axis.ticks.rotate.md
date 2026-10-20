# Tick label rotation

ChartKit: **native**

Rotate tick labels by an angle

Matrix status: `native`. Verification: `runtime-probe` (strong).

degrees; auto -40 when crowded labels fit; drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:983

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
      "rotate": -40
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~maxRotation | dts-grep (weak) | chart.js/dist/types/index.d.ts:3146 ticks.minRotation / maxRotation |
| Recharts | native | XAxis.angle | dts-path (strong) | recharts/types/util/types.d.ts:738 |
| Apache ECharts | native | xAxis.axisLabel.rotate | dts-path (strong) | echarts/types/dist/shared.d.ts:2803 |
| Highcharts | native | xAxis.labels.rotation | dts-path (strong) | highcharts/highcharts.d.ts:108025 |
| Plotly.js | native | layout.xaxis.tickangle | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.tickangle |
| Nivo | native | ~tickRotation | dts-grep (weak) | @nivo/polar-axes/dist/types/types.d.ts:28 |
| Victory | native | VictoryAxis.tickLabelComponent | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:56 VictoryLabel angle |
| visx | native | AxisBottom.tickLabelProps | dts-path (strong) | @visx/axis/lib/types.d.ts:69 angle via props |
| ApexCharts | native | xaxis.labels.rotate | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4909 |
| Tremor (npm) | native | LineChart.rotateLabelX | dts-path (strong) | @tremor/react/dist/index.d.ts:81 |
| Observable Plot | native | ~tickRotate | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:577 |
| Vega-Lite | native | ~labelAngle | dts-grep (weak) | 1283:        "labelAngle" |
| AG Charts | native | ~rotation | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/radialGaugeOptions.d.ts:65 |
| amCharts 5 | native | ~rotation | dts-grep (weak) | @amcharts/amcharts5/.internal/core/util/Matrix.d.ts:41 |
| Google Charts | native | ~slantedTextAngle | dts-grep (weak) | @types/google.visualization/index.d.ts:540 |
| uPlot | native | Options.axes.rotate | dts-path (strong) | uplot/dist/uPlot.d.ts:1111 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.xAxis, ~tickLabelStyle | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/constants/index.d.ts:14 angle in tickLabelStyle |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~labelTransform\|rotate | dts-grep (weak) | @antv/g2/lib/index.d.ts:165 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 77c1df48ccc6.

https://chartkit.dev/features.json
