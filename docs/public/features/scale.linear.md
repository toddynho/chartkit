# Linear scale

ChartKit: **native**

Continuous linear axis

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:683

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
    "y": {
      "field": "units",
      "scale": {
        "type": "linear"
      }
    }
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~LinearScale | dts-grep (weak) | chart.js/dist/types/index.d.ts:3307 |
| Recharts | native | YAxis.scale=linear | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:69 |
| Apache ECharts | native | yAxis.type=value | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 |
| Highcharts | native | yAxis.type=linear | dts-path (strong) | highcharts/highcharts.d.ts:110754 |
| Plotly.js | native | layout.yaxis.type=linear | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.type |
| Nivo | native | Line.yScale, ~linear | dts-path (strong) | @nivo/line/dist/types/types.d.ts:132, @nivo/tree/dist/types/types.d.ts:12 |
| Victory | native | VictoryChart.scale, ~linear | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:42, victory-core/lib/victory-animation/victory-animation.d.ts:13 |
| visx | native | ~scaleLinear | dts-grep (weak) | @visx/scale/lib/index.d.ts:3 |
| ApexCharts | native | yaxis | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1497 numeric by default |
| Tremor (npm) | unknown | — | conflict (unknown) | — automatic only |
| Observable Plot | native | ~linear | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:9 |
| Vega-Lite | native | ~linear | dts-grep (weak) | 508:              "description" |
| AG Charts | native | ~number | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:7 axis type 'number' |
| amCharts 5 | native | ValueAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis.d.ts:264 |
| Google Charts | native | ~logScale | dts-grep (weak) | @types/google.visualization/index.d.ts:532 numeric by default |
| uPlot | native | Options.scales | dts-path (strong) | uplot/dist/uPlot.d.ts:379 |
| TradingView Lightweight Charts | native | ~PriceScaleMode | dts-grep (weak) | 145:export declare enum PriceScaleMode { normal mode |
| MUI X Charts | native | LineChart.yAxis.scaleType=linear | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 y-axis min --> max |
| AntV G2 | native | ~linear | dts-grep (weak) | @antv/g2/lib/index.d.ts:91 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
