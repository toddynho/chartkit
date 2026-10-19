# Donut chart

ChartKit: **native**

Pie with an inner radius

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "donut",
  "data": [
    {
      "wood": "Oak",
      "boards": 8
    },
    {
      "wood": "Pine",
      "boards": 5
    }
  ],
  "encoding": {
    "x": "wood",
    "y": "boards"
  },
  "a11y": {
    "alt": "Oak is larger."
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
| Chart.js | native | ChartTypeRegistry.doughnut | dts-path (strong) | chart.js/dist/types/index.d.ts:3747 |
| Recharts | native | Pie.innerRadius | dts-path (strong) | recharts/types/polar/Pie.d.ts:43 |
| Apache ECharts | native | series.radius | dts-path (strong) | echarts/types/dist/shared.d.ts:7620 [inner, outer] |
| Highcharts | native | plotOptions.pie.innerSize | dts-path (strong) | highcharts/options/pie.d.ts:521 |
| Plotly.js | native | trace.hole | dts-path (strong) | plot-schema.json#traces.{pie}.attributes.hole |
| Nivo | native | Pie.innerRadius | dts-path (strong) | @nivo/pie/dist/types/types.d.ts:57 |
| Victory | native | VictoryPie.innerRadius | dts-path (strong) | victory-pie/lib/victory-pie.d.ts:9 |
| visx | native | Pie.innerRadius | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:7 |
| ApexCharts | native | chart.type=donut | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | DonutChart | dts-path (strong) | @tremor/react/dist/index.d.ts:124 |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | native | ~innerRadius | dts-grep (weak) | 492:        "innerRadius" |
| AG Charts | native | series.type=donut | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | PieChart.innerRadius | dts-path (strong) | @amcharts/amcharts5/.internal/charts/pie/PieChart.d.ts:77 |
| Google Charts | native | PieChartOptions.pieHole | dts-path (strong) | @types/google.visualization/index.d.ts:1061 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | PieChart.series.innerRadius | dts-path (strong) | @mui/x-charts/models/seriesType/pie.d.mts:38 |
| Mermaid (chart-ish diagrams only) | unknown | ~innerRadius\|donut | conflict (unknown) | — |
| AntV G2 | native | ~innerRadius | dts-grep (weak) | @antv/g2/lib/coordinate/theta.d.ts:8 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c09b89c6d9f1.

https://chartkit.dev/features.json
