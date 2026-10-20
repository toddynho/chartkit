# Pie chart

ChartKit: **native**

Proportions as circle sectors

Matrix status: `native`. Verification: `runtime-probe` (strong).

type pie draws a solid pie. startAngle, padAngle, cornerRadius, sort, other, and explode. A donut keeps its hole. Probed by rendering.

Source: packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "pie",
  "data": [
    {
      "x": "Oak",
      "y": 8
    },
    {
      "x": "Pine",
      "y": 5
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y"
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
| Chart.js | native | ChartTypeRegistry.pie | dts-path (strong) | chart.js/dist/types/index.d.ts:3739 |
| Recharts | native | PieChart, Pie | dts-path (strong) | recharts/types/chart/PieChart.d.ts:27, recharts/types/polar/Pie.d.ts:337 |
| Apache ECharts | native | series.type=pie | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=pie | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=pie | dts-path (strong) | plot-schema.json#traces.pie |
| Nivo | native | Pie | dts-path (strong) | @nivo/pie/dist/types/Pie.d.ts:4 |
| Victory | native | VictoryPie | dts-path (strong) | victory-pie/lib/victory-pie.d.ts:56 |
| visx | native | Pie | dts-path (strong) | @visx/shape/lib/shapes/Pie.d.ts:33 |
| ApexCharts | native | chart.type=pie | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | DonutChart.variant, ~pie | dts-path (strong) | @tremor/react/dist/index.d.ts:113, @tremor/react/dist/index.d.ts:107 variant="pie" |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 no arc mark; documented workaround with geo/custom |
| Vega-Lite | native | mark=arc | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type=pie | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | PieSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/pie/PieSeries.d.ts:61 |
| Google Charts | native | PieChart | dts-path (strong) | @types/google.visualization/index.d.ts:1038 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | PieChart | dts-path (strong) | @mui/x-charts/PieChart/PieChart.d.mts:56 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.pie | dts-path (strong) | mermaid/dist/config.type.d.ts:223 |
| AntV G2 | native | ~polar | dts-grep (weak) | @antv/g2/lib/index.d.ts:53 interval + theta coordinate |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against fb308ab4f88e.

https://chartkit.dev/features.json
