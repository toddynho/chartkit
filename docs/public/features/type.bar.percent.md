# 100% stacked bar

ChartKit: **native**

Stacked bars normalised to 100%

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
    "stack": "percent"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | native | BarChart.stackOffset=expand | dts-path (strong) | recharts/types/util/types.d.ts:1396 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | plotOptions.column.stacking=percent | dts-path (strong) | highcharts/options/column.d.ts:1274 |
| Plotly.js | native | layout.barnorm=percent | dts-path (strong) | plot-schema.json#layout.layoutAttributes.barnorm |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | BarStack.offset | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:78 |
| ApexCharts | native | chart.stackType=100% | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2163 |
| Tremor (npm) | native | BarChart.stack, ~percent | dts-path (strong) | @tremor/react/dist/index.d.ts:101 |
| Observable Plot | native | ~offset | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:435 stackY offset normalize |
| Vega-Lite | native | ~normalize | dts-grep (weak) | 7741:        "normalizedNumberFormat" |
| AG Charts | native | series.normalizedTo | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:88 |
| amCharts 5 | native | ~valueYTotalPercent | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:236 |
| Google Charts | native | ColumnChartOptions.isStacked, ~percent | dts-path (strong) | @types/google.visualization/index.d.ts:731, @types/google.visualization/index.d.ts:731 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | BarChart.series.stackOffset=expand | dts-path (strong) | @mui/x-charts/models/seriesType/bar.d.mts:68 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~normalizeY | dts-grep (weak) | @antv/g2/lib/index.d.ts:37 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against cfb64fb8d1fe.

https://chartkit.dev/features.json
