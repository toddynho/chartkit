# Multiple / dual y axes

ChartKit: **native**

Two or more value axes

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:145

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
      "axis": "y2"
    }
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "axes": {
    "y2": {
      "title": "Other"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~yAxisID | dts-grep (weak) | chart.js/dist/types/index.d.ts:108 dataset.yAxisID + extra scales |
| Recharts | native | YAxis.yAxisId, Line.yAxisId | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:76, recharts/types/cartesian/Line.d.ts:220 |
| Apache ECharts | native | series.yAxisIndex | dts-path (strong) | echarts/types/dist/shared.d.ts:8382 |
| Highcharts | native | series.yAxis, yAxis.opposite | dts-path (strong) | highcharts/highcharts.d.ts:100917, highcharts/highcharts.d.ts:110460 |
| Plotly.js | native | layout.yaxis.overlaying, layout.yaxis.side | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.overlaying, plot-schema.json#layout.layoutAttributes.yaxis.side |
| Nivo | none | — | dts-absence (absence) | — single y scale per chart |
| Victory | partial | VictoryAxis.dependentAxis | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:42 normalised dual-axis recipe |
| visx | partial | ~AxisRight | dts-grep (weak) | @visx/axis/lib/index.d.ts:4 second scale + AxisRight manually |
| ApexCharts | native | yaxis.opposite, yaxis.seriesName | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5036, apexcharts/types/apexcharts.d.ts:5035 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | unknown | — | conflict (unknown) | — one y scale per plot (facets instead) |
| Vega-Lite | native | ~resolve | dts-grep (weak) | 2952:    "AxisResolveMap" layer + resolve.scale.y independent |
| AG Charts | native | ~keys | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:16 axes[].keys binds series to an axis |
| amCharts 5 | native | ValueAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis.d.ts:264 push multiple yAxes |
| Google Charts | native | ~targetAxisIndex\|vAxes | dts-grep (weak) | @types/google.visualization/index.d.ts:741 |
| uPlot | native | Options.axes, ~scale | dts-path (strong) | uplot/dist/uPlot.d.ts:381, 44:	/** scales state & opts */ series.scale names a scale |
| TradingView Lightweight Charts | native | ~priceScaleId | dts-grep (weak) | 967:	 * - the price scale used when adding a series without an explicit `priceScaleId` left/right/overlay price scales |
| MUI X Charts | native | LineChart.yAxis, ~yAxisId | dts-path (strong) | @mui/x-charts/internals/plugins/featurePlugins/useChartCartesianAxis/useChartCartesianAxis.types.d.mts:31, @mui/x-charts/hooks/useAxis.d.ts:29 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~independent | dts-grep (weak) | @antv/g2/lib/runtime/types/common.d.ts:101 scale.y.independent |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 64e07159b6f8.

https://chartkit.dev/features.json
