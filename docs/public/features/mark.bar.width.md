# Bar width / gap / padding

ChartKit: **native**

Control bar thickness and spacing

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:855

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
    "gap": 0.35
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.barPercentage, ChartConfiguration.data.datasets.categoryPercentage | dts-path (strong) | chart.js/dist/types/index.d.ts:114, chart.js/dist/types/index.d.ts:119 |
| Recharts | native | BarChart.barCategoryGap, BarChart.barGap | dts-path (strong) | recharts/types/util/types.d.ts:1323, recharts/types/util/types.d.ts:1331 |
| Apache ECharts | native | series.barWidth, series.barGap | dts-path (strong) | echarts/types/dist/shared.d.ts:11141, echarts/types/dist/shared.d.ts:11145 |
| Highcharts | native | plotOptions.column.pointPadding, plotOptions.column.groupPadding | dts-path (strong) | highcharts/options/column.d.ts:1124, highcharts/options/column.d.ts:940 |
| Plotly.js | native | layout.bargap, layout.bargroupgap | dts-path (strong) | plot-schema.json#layout.layoutAttributes.bargap, plot-schema.json#layout.layoutAttributes.bargroupgap |
| Nivo | native | Bar.padding, Bar.innerPadding | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:144, @nivo/bar/dist/types/types.d.ts:143 |
| Victory | native | VictoryBar.barWidth, VictoryBar.barRatio | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:10, victory-bar/lib/victory-bar.d.ts:9 |
| visx | native | ~paddingInner | dts-grep (weak) | @visx/scale/lib/types/ScaleConfig.d.ts:31 band scale padding |
| ApexCharts | native | plotOptions.bar.columnWidth, plotOptions.bar.barHeight | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3100, apexcharts/types/apexcharts.d.ts:3101 |
| Tremor (npm) | native | BarChart.barCategoryGap | dts-path (strong) | @tremor/react/dist/index.d.ts:103 |
| Observable Plot | native | ~inset\|insetLeft | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:1 inset + band padding |
| Vega-Lite | native | ~binSpacing\|discreteBandSize | dts-grep (weak) | 3067:        "binSpacing" mark.width / scale.paddingInner |
| AG Charts | native | series.width, ~paddingInner | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:80, ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:15 |
| amCharts 5 | native | ~width | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/Exporting.d.ts:48 columns.template width % |
| Google Charts | native | ColumnChartOptions.bar | dts-path (strong) | @types/google.visualization/index.d.ts:721 |
| uPlot | partial | ~size | dts-grep (weak) | 70:	/** destroys DOM, removes resize & scroll listeners, etc. */ bars({size:[factor, max]}) |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | BarChart.xAxis, ~categoryGapRatio\|barGapRatio | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:25, @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:3233 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~padding | dts-grep (weak) | @antv/g2/lib/runtime/component.d.ts:14 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against aad14577fd95.

https://chartkit.dev/features.json
