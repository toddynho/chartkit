# Line chart

ChartKit: **native**

Series of points joined by straight segments

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

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
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry.line | dts-path (strong) | chart.js/dist/types/index.d.ts:3715 |
| Recharts | native | LineChart, Line | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8, recharts/types/cartesian/Line.d.ts:296 |
| Apache ECharts | native | series.type=line | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=line | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=scatter, trace.mode | dts-path (strong) | plot-schema.json#traces.scatter, plot-schema.json#traces.{indicator,scatter,scatter3d,scattercarpet,scattergeo,scattergl,…}.attributes.mode type:'scatter' with mode:'lines' |
| Nivo | native | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 |
| Victory | native | VictoryLine | dts-path (strong) | victory-line/lib/victory-line.d.ts:21 |
| visx | native | LinePath, LineSeries | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18, @visx/xychart/lib/components/series/LineSeries.d.ts:3 |
| ApexCharts | native | chart.type=line | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 |
| Observable Plot | native | line | dts-path (strong) | @observablehq/plot/src/marks/line.d.ts:113 |
| Vega-Lite | native | mark=line | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type=line | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | LineSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:70 |
| Google Charts | native | LineChart | dts-path (strong) | @types/google.visualization/index.d.ts:750 |
| uPlot | native | Options.series | dts-path (strong) | uplot/dist/uPlot.d.ts:375 default series path is a line |
| TradingView Lightweight Charts | native | LineSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:10 |
| MUI X Charts | native | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 xychart-beta 'line' series |
| AntV G2 | native | MarkTypes=line | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
