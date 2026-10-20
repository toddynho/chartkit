# Horizontal bar

ChartKit: **native**

Bars along the y axis

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:847

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
  },
  "mark": {
    "orientation": "horizontal"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.options.indexAxis=y | dts-path (strong) | chart.js/dist/types/index.d.ts:1609 |
| Recharts | native | BarChart.layout=vertical | dts-path (strong) | recharts/types/util/types.d.ts:1367 layout="vertical" + swapped axes |
| Apache ECharts | native | yAxis.type=category | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 swap axis types |
| Highcharts | native | series.type=bar | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.orientation=h | dts-path (strong) | plot-schema.json#traces.{bar,box,funnel,histogram,sankey,scatter,…}.attributes.orientation |
| Nivo | native | Bar.layout=horizontal | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:168 |
| Victory | native | VictoryBar.horizontal | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:28 |
| visx | native | BarGroupHorizontal, BarStackHorizontal | dts-path (strong) | @visx/shape/lib/shapes/BarGroupHorizontal.d.ts:20, @visx/shape/lib/shapes/BarStackHorizontal.d.ts:12 |
| ApexCharts | native | plotOptions.bar.horizontal | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3099 |
| Tremor (npm) | native | BarChart.layout, ~vertical | dts-path (strong) | @tremor/react/dist/index.d.ts:100, @tremor/react/dist/index.d.ts:6 layout="vertical" |
| Observable Plot | native | barX | dts-path (strong) | @observablehq/plot/src/marks/bar.d.ts:162 |
| Vega-Lite | native | mark=bar | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 put the quantitative field on x |
| AG Charts | native | series.direction=horizontal | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:60 |
| amCharts 5 | native | ColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:33 category axis on y |
| Google Charts | native | BarChart | dts-path (strong) | @types/google.visualization/index.d.ts:858 |
| uPlot | partial | ~bars\?: | dts-grep (weak) | 788:			bars? bars({ ori: 1 }) with rotated scales |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | BarChart.layout=horizontal | dts-path (strong) | @mui/x-charts/BarChart/BarChart.d.mts:54 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart.chartOrientation=horizontal | dts-path (strong) | mermaid/dist/config.type.d.ts:1085 |
| AntV G2 | native | ~transpose | dts-grep (weak) | @antv/g2/lib/index.d.ts:54 coordinate.transform transpose |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 2e11cdd3e2dc.

https://chartkit.dev/features.json
