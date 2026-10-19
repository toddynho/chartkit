# Show / hide axis

ChartKit: **native**

Toggle an axis entirely

Matrix status: `native`. Verification: `dts-path` (strong).

axes.x:false hides

Source: chartkit:packages/core/src/generated/schema.ts:936

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
      "title": "Quarter"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~display | dts-grep (weak) | chart.js/dist/types/index.d.ts:1103 scales.x.display |
| Recharts | native | XAxis.hide | dts-path (strong) | recharts/types/util/types.d.ts:744 |
| Apache ECharts | native | xAxis.show | dts-path (strong) | echarts/types/dist/shared.d.ts:2573 |
| Highcharts | native | xAxis.visible | dts-path (strong) | highcharts/highcharts.d.ts:108812 |
| Plotly.js | native | layout.xaxis.visible | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.visible |
| Nivo | native | Line.axisBottom | dts-path (strong) | @nivo/line/dist/types/types.d.ts:178 null hides |
| Victory | native | VictoryAxis | dts-path (strong) | victory-axis/lib/victory-axis.d.ts:239 omit or style |
| visx | native | AxisBottom | dts-path (strong) | @visx/axis/lib/axis/AxisBottom.d.ts:9 compose or omit |
| ApexCharts | native | xaxis.labels.show, yaxis.show | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4908, apexcharts/types/apexcharts.d.ts:5032 |
| Tremor (npm) | native | LineChart.showXAxis, LineChart.showYAxis | dts-path (strong) | @tremor/react/dist/index.d.ts:62, @tremor/react/dist/index.d.ts:63 |
| Observable Plot | native | ~axis | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:4 axis: null |
| Vega-Lite | native | ~axis | dts-grep (weak) | 1047:    "Axis" axis: null |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | native | ~visible | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/Annotator.d.ts:97 |
| Google Charts | native | ~textPosition | dts-grep (weak) | @types/google.visualization/index.d.ts:533 hAxis.textPosition:'none' |
| uPlot | native | Options.axes.show | dts-path (strong) | uplot/dist/uPlot.d.ts:1060 |
| TradingView Lightweight Charts | native | ~visible | dts-grep (weak) | 138:	 * Use the last visible data of the chart viewport. priceScale/timeScale visible |
| MUI X Charts | native | LineChart.xAxis, ~disableLine\|position | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/ChartsDataProvider/ChartsDataProvider.d.ts:27 position:'none' |
| Mermaid (chart-ish diagrams only) | native | ~showAxisLine\|xAxis | dts-grep (weak) | mermaid/dist/themes/theme-redux.d.ts:149 xyChart.xAxis.showLabel etc. |
| AntV G2 | native | ~axis | dts-grep (weak) | @antv/g2/lib/index.d.ts:110 axis: false |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
