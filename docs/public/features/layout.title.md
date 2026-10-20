# Chart title and subtitle

ChartKit: **native**

Built-in title text

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:54, chartkit:packages/core/src/generated/schema.ts:58

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
  "title": "Units"
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~title\|subtitle | dts-grep (weak) | chart.js/dist/types/index.d.ts:791 plugins.title / plugins.subtitle |
| Recharts | unknown | — | conflict (unknown) | — render your own heading |
| Apache ECharts | native | title.text, title.subtext | dts-path (strong) | echarts/types/dist/shared.d.ts:10516, echarts/types/dist/shared.d.ts:10522 |
| Highcharts | native | title.text, subtitle.text | dts-path (strong) | highcharts/highcharts.d.ts:107099, highcharts/highcharts.d.ts:106360 |
| Plotly.js | native | layout.title.text, layout.title.subtitle | dts-path (strong) | plot-schema.json#layout.layoutAttributes.title.text, plot-schema.json#layout.layoutAttributes.title.subtitle |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | partial | VictoryLabel | dts-path (strong) | victory-core/lib/victory-label/victory-label.d.ts:54 add a VictoryLabel |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | native | title.text, subtitle.text | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2450, apexcharts/types/apexcharts.d.ts:2450 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~title\|subtitle\|caption | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:105 |
| Vega-Lite | native | ~title\|subtitle | dts-grep (weak) | 1400:              "description" |
| AG Charts | native | AgChartOptions.title, AgChartOptions.subtitle | dts-path (strong) | ag-charts-types/dist/types/src/chart/chartOptions.d.ts:250, ag-charts-types/dist/types/src/chart/chartOptions.d.ts:252 |
| amCharts 5 | native | ~Label | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:55 root.container Label |
| Google Charts | native | ~title | dts-grep (weak) | @types/google.visualization/index.d.ts:504 |
| uPlot | native | Options.title | dts-path (strong) | uplot/dist/uPlot.d.ts:343 |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | native | ~title | dts-grep (weak) | mermaid/dist/utils.d.ts:223 'title' in diagram text |
| AntV G2 | native | ~title\|subtitle | dts-grep (weak) | @antv/g2/lib/index.d.ts:115 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 77c1df48ccc6.

https://chartkit.dev/features.json
