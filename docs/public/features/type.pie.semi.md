# Semi-circle / partial arc pie

ChartKit: **native**

Pie or donut over a partial angle range

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:883, chartkit:packages/core/src/generated/schema.ts:887

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
  },
  "mark": {
    "startAngle": 0
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~circumference | dts-grep (weak) | chart.js/dist/types/index.d.ts:257 circumference + rotation |
| Recharts | native | Pie.startAngle, Pie.endAngle | dts-path (strong) | recharts/types/polar/Pie.d.ts:27, recharts/types/polar/Pie.d.ts:31 |
| Apache ECharts | native | series.startAngle, series.endAngle | dts-path (strong) | echarts/types/dist/shared.d.ts:11626, echarts/types/dist/shared.d.ts:11627 |
| Highcharts | native | plotOptions.pie.startAngle, plotOptions.pie.endAngle | dts-path (strong) | highcharts/options/pie.d.ts:684, highcharts/options/pie.d.ts:443 |
| Plotly.js | partial | trace.rotation | dts-path (strong) | plot-schema.json#traces.{pie,sunburst}.attributes.rotation rotation + transparent slice workaround |
| Nivo | native | Pie.startAngle, Pie.endAngle | dts-path (strong) | @nivo/pie/dist/types/types.d.ts:60, @nivo/pie/dist/types/types.d.ts:61 |
| Victory | native | VictoryPie.startAngle, VictoryPie.endAngle | dts-path (strong) | victory-pie/lib/victory-pie.d.ts:19, victory-pie/lib/victory-pie.d.ts:6 |
| visx | native | Pie.startAngle, Pie.endAngle | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:52, @visx/shape/lib/types/D3ShapeConfig.d.ts:54 |
| ApexCharts | native | plotOptions.pie.startAngle, plotOptions.pie.endAngle | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4089, apexcharts/types/apexcharts.d.ts:4090 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~theta2 | dts-grep (weak) | 850:          "description" theta/theta2 or scale range |
| AG Charts | native | series.sectorSpacing, ~angle | dts-path (strong) | ag-charts-types/dist/types/src/series/polar/donutOptions.d.ts:117, ag-charts-enterprise/dist/types/src/main.d.ts:3 |
| amCharts 5 | native | PieChart.startAngle, PieChart.endAngle | dts-path (strong) | @amcharts/amcharts5/.internal/charts/pie/PieChart.d.ts:30, @amcharts/amcharts5/.internal/charts/pie/PieChart.d.ts:38 |
| Google Charts | native | PieChartOptions.pieStartAngle | dts-path (strong) | @types/google.visualization/index.d.ts:1065 start angle only |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | PieChart.series.startAngle, PieChart.series.endAngle | dts-path (strong) | @mui/x-charts/models/seriesType/pie.d.mts:62, @mui/x-charts/models/seriesType/pie.d.mts:67 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~startAngle | dts-grep (weak) | @antv/g2/lib/utils/angle.d.ts:3 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
