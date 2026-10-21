# Slope chart

ChartKit: **partial**

Two-point lines comparing before/after

Matrix status: `partial`. Verification: `dts-path` (strong).

two-category line

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
| Chart.js | partial | ChartTypeRegistry.line | dts-path (strong) | chart.js/dist/types/index.d.ts:3715 |
| Recharts | partial | LineChart | dts-path (strong) | recharts/types/chart/LineChart.d.ts:8 |
| Apache ECharts | partial | series.type=line | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | partial | series.type=line | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.type=scatter | dts-path (strong) | plot-schema.json#traces.scatter |
| Nivo | partial | Line | dts-path (strong) | @nivo/line/dist/types/Line.d.ts:4 |
| Victory | partial | VictoryLine | dts-path (strong) | victory-line/lib/victory-line.d.ts:21 |
| visx | partial | LinePath | dts-path (strong) | @visx/shape/lib/shapes/LinePath.d.ts:18 |
| ApexCharts | partial | chart.type=line | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | partial | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 |
| Observable Plot | partial | line | dts-path (strong) | @observablehq/plot/src/marks/line.d.ts:113 |
| Vega-Lite | partial | mark=line | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | partial | series.type=line | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | partial | LineSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:70 |
| Google Charts | partial | LineChart | dts-path (strong) | @types/google.visualization/index.d.ts:750 |
| uPlot | partial | Options.series | dts-path (strong) | uplot/dist/uPlot.d.ts:375 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | partial | LineChart | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:88 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | partial | MarkTypes=line | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 1eae17b953e2.

https://chartkit.dev/features.json
