# Rounded bar corners

ChartKit: **native**

Corner radius on bars

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:851

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
    "cornerRadius": 4
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.borderRadius | dts-path (strong) | chart.js/dist/types/index.d.ts:2119 |
| Recharts | native | Bar.radius | dts-path (strong) | recharts/types/cartesian/Bar.d.ts:175 |
| Apache ECharts | native | series.itemStyle.borderRadius | dts-path (strong) | echarts/types/dist/shared.d.ts:11170 |
| Highcharts | native | plotOptions.column.borderRadius | dts-path (strong) | highcharts/options/column.d.ts:612 |
| Plotly.js | native | layout.barcornerradius | dts-path (strong) | plot-schema.json#layout.layoutAttributes.barcornerradius |
| Nivo | native | Bar.borderRadius | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:152 |
| Victory | native | VictoryBar.cornerRadius | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:11 |
| visx | native | BarRounded | dts-path (strong) | @visx/shape/lib/shapes/BarRounded.d.ts:43 |
| ApexCharts | native | plotOptions.bar.borderRadius | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3103 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~rx\|ry | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:15 rx, ry, r on bars |
| Vega-Lite | native | ~cornerRadius | dts-grep (weak) | 259:        "cornerRadius" |
| AG Charts | native | series.cornerRadius | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:48 |
| amCharts 5 | native | ~cornerRadiusTL | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/funnel/FunnelSlice.d.ts:30 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | BarChart.borderRadius | dts-path (strong) | @mui/x-charts/BarChart/BarPlot.d.mts:27 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~radius | dts-grep (weak) | @antv/g2/lib/coordinate/theta.d.ts:8 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3d041a41af6e.

https://chartkit.dev/features.json
