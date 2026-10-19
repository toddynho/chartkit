# Data label position

ChartKit: **native**

Inside/outside/top/center placement

Matrix status: `native`. Verification: `runtime-probe` (strong).

top, bottom, left, right, center, inside, or outside. inside and outside suit bar and donut. Setting it turns labels on.

Source: packages/core/src/generated/schema.ts:891

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
    "y": "units"
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "labelPosition": "top"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — anchor / align |
| Recharts | native | LabelList.position | dts-path (strong) | recharts/types/component/LabelList.d.ts:86 |
| Apache ECharts | native | series.label.position | dts-path (strong) | echarts/types/dist/shared.d.ts:7876 |
| Highcharts | native | plotOptions.series.dataLabels.align, plotOptions.series.dataLabels.inside | dts-path (strong) | highcharts/options/series.d.ts:127, highcharts/options/series.d.ts:260 |
| Plotly.js | native | trace.textposition | dts-path (strong) | plot-schema.json#traces.{bar,funnel,funnelarea,histogram,icicle,pie,…}.attributes.textposition |
| Nivo | native | Bar.labelPosition | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:156 |
| Victory | native | VictoryBar.labelComponent | dts-path (strong) | victory-core/lib/types/prop-types.d.ts:114 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | plotOptions.bar.dataLabels.position | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3138 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~dy\|dx\|textAnchor | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:45 |
| Vega-Lite | native | ~align\|dy | dts-grep (weak) | 93:    "Align" |
| AG Charts | native | ~placement | dts-grep (weak) | ag-charts-types/dist/types/src/presets/quadrant/quadrantOptions.d.ts:2 |
| amCharts 5 | native | ~locationY\|centerY | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:141 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~barLabelPlacement\|barLabel | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:14 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.pie.textPosition | dts-path (strong) | mermaid/dist/config.type.d.ts:938 |
| AntV G2 | native | ~position | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 85c6caf6e04b.

https://chartkit.dev/features.json
