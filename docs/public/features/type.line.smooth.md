# Smoothed / spline line

ChartKit: **native**

Curved interpolation (monotone, cardinal, natural, catmull-rom)

Matrix status: `native`. Verification: `dts-path` (strong).

monotone is monotone-x and stays inside the data. smooth, spline, and basis repair to monotone.

Source: chartkit:packages/core/src/generated/schema.ts:915

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
    "curve": "monotone"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.options.elements.line.tension, ChartConfiguration.options.elements.line.cubicInterpolationMode | dts-path (strong) | chart.js/dist/types/index.d.ts:1944, chart.js/dist/types/index.d.ts:1939 |
| Recharts | native | Line.type=monotone | dts-path (strong) | recharts/types/shape/Curve.d.ts:25 |
| Apache ECharts | native | series.smooth | dts-path (strong) | echarts/types/dist/shared.d.ts:11104 |
| Highcharts | native | series.type=spline | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.line.shape=spline | dts-path (strong) | plot-schema.json#traces.{scatter,scattercarpet,scatterpolar,scattersmith,scatterternary}.attributes.line.shape |
| Nivo | native | Line.curve=monotoneX | dts-path (strong) | @nivo/line/dist/types/types.d.ts:135 |
| Victory | native | VictoryLine.interpolation=monotoneX | dts-path (strong) | victory-line/lib/victory-line.d.ts:83 |
| visx | native | LinePath.curve | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:43 |
| ApexCharts | native | stroke.curve=smooth | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2649 |
| Tremor (npm) | native | LineChart.curveType=monotone | dts-path (strong) | @tremor/react/dist/index.d.ts:127 |
| Observable Plot | native | ~catmull-rom | dts-grep (weak) | @observablehq/plot/src/curve.d.ts:17 curve option |
| Vega-Lite | native | ~monotone | dts-grep (weak) | 508:              "description" |
| AG Charts | native | ~smooth | dts-grep (weak) | ag-charts-types/dist/types/src/series/interpolationOptions.d.ts:2 |
| amCharts 5 | native | SmoothedXLineSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/SmoothedXLineSeries.d.ts:21 |
| Google Charts | native | LineChartOptions.curveType | dts-path (strong) | @types/google.visualization/index.d.ts:788 |
| uPlot | native | ~spline | dts-grep (weak) | 774:		export interface SplinePathBuilderOpts { |
| TradingView Lightweight Charts | native | ~LineType | dts-grep (weak) | 98:export declare enum LineType { LineType.Curved |
| MUI X Charts | native | LineChart.series.curve=catmullRom | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:111 |
| Mermaid (chart-ish diagrams only) | unknown | ~smooth\|spline | conflict (unknown) | — |
| AntV G2 | native | ~smooth | dts-grep (weak) | @antv/g2/lib/shape/index.d.ts:8 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 2e11cdd3e2dc.

https://chartkit.dev/features.json
