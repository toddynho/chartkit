# Stacked bar

ChartKit: **native**

Bars stacked per category

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:843

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
    "stack": "stack"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~stacked | dts-grep (weak) | chart.js/dist/types/index.d.ts:86 scales.x/y.stacked |
| Recharts | native | Bar.stackId | dts-path (strong) | recharts/types/cartesian/Bar.d.ts:71 |
| Apache ECharts | native | series.stack | dts-path (strong) | echarts/types/dist/shared.d.ts:8415 |
| Highcharts | native | plotOptions.column.stacking=normal | dts-path (strong) | highcharts/options/column.d.ts:1274 |
| Plotly.js | native | layout.barmode=stack | dts-path (strong) | plot-schema.json#layout.layoutAttributes.barmode |
| Nivo | native | Bar.groupMode=stacked | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:167 |
| Victory | native | VictoryStack | dts-path (strong) | victory-stack/lib/victory-stack.d.ts:15 |
| visx | native | BarStack, AnimatedBarStack | dts-path (strong) | @visx/shape/lib/shapes/BarStack.d.ts:12, @visx/xychart/lib/components/series/AnimatedBarStack.d.ts:3 |
| ApexCharts | native | chart.stacked | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2162 |
| Tremor (npm) | native | BarChart.stack | dts-path (strong) | @tremor/react/dist/index.d.ts:101 |
| Observable Plot | native | barY, stackY | dts-path (strong) | @observablehq/plot/src/marks/bar.d.ts:203, @observablehq/plot/src/transforms/stack.d.ts:150 implicit stack |
| Vega-Lite | native | ~stack | dts-grep (weak) | 592:          "description" |
| AG Charts | native | series.stacked | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:90 |
| amCharts 5 | native | ~stacked | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:177 |
| Google Charts | native | ColumnChartOptions.isStacked | dts-path (strong) | @types/google.visualization/index.d.ts:731 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | BarChart.series.stack | dts-path (strong) | @mui/x-charts/models/seriesType/common.d.mts:85 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~stackY | dts-grep (weak) | @antv/g2/lib/index.d.ts:27 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a03bfbe111f.

https://chartkit.dev/features.json
