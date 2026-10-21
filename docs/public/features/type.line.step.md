# Step line

ChartKit: **native**

Line drawn as horizontal/vertical steps (before/after/middle)

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:803

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
  "mark": {
    "curve": "step"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.options.elements.line.stepped | dts-path (strong) | chart.js/dist/types/index.d.ts:1949 |
| Recharts | native | Line.type=step | dts-path (strong) | recharts/types/shape/Curve.d.ts:25 |
| Apache ECharts | native | series.step | dts-path (strong) | echarts/types/dist/shared.d.ts:11103 |
| Highcharts | native | plotOptions.line.step | dts-path (strong) | highcharts/options/line.d.ts:1254 |
| Plotly.js | native | trace.line.shape=hv | dts-path (strong) | plot-schema.json#traces.{scatter,scattergl}.attributes.line.shape |
| Nivo | native | Line.curve=step | dts-path (strong) | @nivo/line/dist/types/types.d.ts:135 |
| Victory | native | VictoryLine.interpolation=step | dts-path (strong) | victory-line/lib/victory-line.d.ts:83 |
| visx | native | LinePath.curve | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:43 pass d3 curveStep from @visx/curve |
| ApexCharts | native | stroke.curve=stepline | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2649 |
| Tremor (npm) | native | LineChart.curveType=step | dts-path (strong) | @tremor/react/dist/index.d.ts:127 |
| Observable Plot | native | line, ~curve.*step | dts-path (strong) | @observablehq/plot/src/marks/line.d.ts:113, @observablehq/plot/src/marks/link.d.ts:48 curve: 'step' \| 'step-before' \| 'step-after' |
| Vega-Lite | native | mark.interpolate, ~step-after | dts-path (strong) | vega-lite/build/compositemark/errorband.d.ts:51, 508:              "description" |
| AG Charts | native | series.interpolation | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:34 interpolation.type 'step' |
| amCharts 5 | native | StepLineSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/StepLineSeries.d.ts:35 |
| Google Charts | unknown | — | conflict (unknown) | — no stepped line; SteppedAreaChart exists |
| uPlot | native | ~stepped | dts-grep (weak) | 701:		export interface SteppedPathBuilderOpts { |
| TradingView Lightweight Charts | native | LineSeries, ~LineType | dts-path (strong) | lightweight-charts/dist/typings.d.ts:10, 98:export declare enum LineType { lineType: LineType.WithSteps |
| MUI X Charts | native | LineChart.series.curve=step | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:111 |
| Mermaid (chart-ish diagrams only) | unknown | ~step | conflict (unknown) | — |
| AntV G2 | native | ~step | dts-grep (weak) | @antv/g2/lib/data/wordCloud.d.ts:9 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40b908be291d.

https://chartkit.dev/features.json
