# Column / vertical bar

ChartKit: **native**

Vertical bars over categories

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    {
      "lane": "A",
      "stops": 12
    },
    {
      "lane": "C",
      "stops": 15
    }
  ],
  "encoding": {
    "x": "lane",
    "y": "stops"
  },
  "a11y": {
    "alt": "Lane C has more."
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
| Chart.js | native | ChartTypeRegistry.bar | dts-path (strong) | chart.js/dist/types/index.d.ts:3707 |
| Recharts | native | BarChart, Bar | dts-path (strong) | recharts/types/chart/BarChart.d.ts:8, recharts/types/cartesian/Bar.d.ts:352 |
| Apache ECharts | native | series.type=bar | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=column | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=bar | dts-path (strong) | plot-schema.json#traces.bar |
| Nivo | native | Bar | dts-path (strong) | @nivo/bar/dist/types/Bar.d.ts:4 |
| Victory | native | VictoryBar | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:71 |
| visx | native | Bar, BarSeries | dts-path (strong) | @visx/shape/lib/shapes/Bar.d.ts:9, @visx/xychart/lib/components/series/BarSeries.d.ts:3 |
| ApexCharts | native | chart.type=bar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | BarChart | dts-path (strong) | @tremor/react/dist/index.d.ts:105 |
| Observable Plot | native | barY | dts-path (strong) | @observablehq/plot/src/marks/bar.d.ts:203 |
| Vega-Lite | native | mark=bar | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type=bar | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:33 |
| Google Charts | native | ColumnChart | dts-path (strong) | @types/google.visualization/index.d.ts:710 |
| uPlot | native | ~bars\?: | dts-grep (weak) | 788:			bars? |
| TradingView Lightweight Charts | native | HistogramSeries, BarSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:9, lightweight-charts/dist/typings.d.ts:6 HistogramSeries is a column series; BarSeries is OHLC bars |
| MUI X Charts | native | BarChart | dts-path (strong) | @mui/x-charts/BarChart/BarChart.d.mts:72 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 xychart-beta bar |
| AntV G2 | native | MarkTypes=interval | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b2aaa2671f30.

https://chartkit.dev/features.json
