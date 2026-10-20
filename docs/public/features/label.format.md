# Data label formatting

ChartKit: **native**

Format/template for label text

Matrix status: `native`. Verification: `runtime-probe` (strong).

Format preset on the label text. Falls back to the series format. Setting it turns labels on.

Source: packages/core/src/generated/schema.ts:895

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
    "labelFormat": "integer"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — formatter |
| Recharts | native | LabelList.formatter | dts-path (strong) | recharts/types/component/LabelList.d.ts:106 |
| Apache ECharts | native | series.label.formatter | dts-path (strong) | echarts/types/dist/shared.d.ts:7927 |
| Highcharts | native | plotOptions.series.dataLabels.format, plotOptions.series.dataLabels.formatter | dts-path (strong) | highcharts/options/series.d.ts:247, highcharts/options/series.d.ts:253 |
| Plotly.js | native | trace.texttemplate | dts-path (strong) | plot-schema.json#traces.{bar,contour,funnel,funnelarea,heatmap,histogram,…}.attributes.texttemplate |
| Nivo | native | Bar.valueFormat, Bar.label | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:164, @nivo/bar/dist/types/types.d.ts:155 |
| Victory | native | VictoryBar.labels | dts-path (strong) | victory-core/lib/types/prop-types.d.ts:117 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | dataLabels.formatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4799 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~format\|text | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:327 |
| Vega-Lite | native | ~format | dts-grep (weak) | 84:          "description" |
| AG Charts | native | ~formatter\|format | dts-grep (weak) | ag-charts-enterprise/dist/types/src/license/licenseManager.d.ts:2 |
| amCharts 5 | native | ~text\|numberFormat | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:32 |
| Google Charts | native | ~format | dts-grep (weak) | @types/google.visualization/index.d.ts:162 |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | BarChart.series.barLabel | dts-path (strong) | @mui/x-charts/models/seriesType/bar.d.mts:53 function |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~formatter | dts-grep (weak) | @antv/g2/lib/component/legendCategory.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7fd168ebe9c0.

https://chartkit.dev/features.json
