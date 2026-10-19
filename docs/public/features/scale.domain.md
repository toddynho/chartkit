# Explicit domain (min/max)

ChartKit: **native**

Fix axis min and max

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:689

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
        "domain": [
          0,
          80
        ]
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
| Chart.js | native | ~suggestedMin\|min\?: | dts-grep (weak) | chart.js/dist/types/index.d.ts:1210 scales.y.min / max / suggestedMin |
| Recharts | native | YAxis.domain | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:53 |
| Apache ECharts | native | yAxis.min, yAxis.max | dts-path (strong) | echarts/types/dist/shared.d.ts:2630, echarts/types/dist/shared.d.ts:2640 |
| Highcharts | native | yAxis.min, yAxis.max | dts-path (strong) | highcharts/highcharts.d.ts:110317, highcharts/highcharts.d.ts:110268 |
| Plotly.js | native | layout.yaxis.range | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.range |
| Nivo | native | Line.yScale, ~min | dts-path (strong) | @nivo/line/dist/types/types.d.ts:132, @nivo/tree/package.json:36 |
| Victory | native | VictoryChart.domain | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:15 |
| visx | native | ~domain | dts-grep (weak) | @visx/stats/lib/ViolinPlot.d.ts:2 |
| ApexCharts | native | yaxis.min, yaxis.max | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5049, apexcharts/types/apexcharts.d.ts:5051 |
| Tremor (npm) | native | LineChart.minValue, LineChart.maxValue | dts-path (strong) | @tremor/react/dist/index.d.ts:70, @tremor/react/dist/index.d.ts:71 |
| Observable Plot | native | ~domain | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:197 |
| Vega-Lite | native | ~domain | dts-grep (weak) | 524:          "description" |
| AG Charts | native | ~min\?: | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineOptions.d.ts:49 axes[].min / max |
| amCharts 5 | native | ~strictMinMax\|min\?: | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:35 |
| Google Charts | native | ~viewWindow | dts-grep (weak) | @types/google.visualization/index.d.ts:547 |
| uPlot | native | ~range\|min\?: | dts-grep (weak) | 131:	/** re-ranges a given min/max by a multiple of the range's magnitude (used internally to expand/snap/pad numeric y scales) */ scales.y.range / min / max |
| TradingView Lightweight Charts | native | ~autoscaleInfoProvider\|scaleMargins | dts-grep (weak) | 536:export interface AutoScaleMargins { |
| MUI X Charts | native | LineChart.yAxis.min, LineChart.yAxis.max | dts-path (strong) | @mui/x-charts/models/axis.d.mts:467, @mui/x-charts/models/axis.d.mts:472 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 y-axis min --> max |
| AntV G2 | native | ~domain | dts-grep (weak) | @antv/g2/lib/runtime/types/options.d.ts:100 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
