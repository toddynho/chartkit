# Chart and plot background

ChartKit: **native**

Background colour/transparency of chart and plot area

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:348, chartkit:packages/core/src/generated/schema.ts:352

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
  "theme": {
    "tokens": {
      "background": "#5c6b7a"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 plugin |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | backgroundColor | dts-path (strong) | echarts/types/dist/shared.d.ts:7435 |
| Highcharts | native | chart.backgroundColor, chart.plotBackgroundColor | dts-path (strong) | highcharts/highcharts.d.ts:6301, highcharts/highcharts.d.ts:6489 |
| Plotly.js | native | layout.paper_bgcolor, layout.plot_bgcolor | dts-path (strong) | plot-schema.json#layout.layoutAttributes.paper_bgcolor, plot-schema.json#layout.layoutAttributes.plot_bgcolor |
| Nivo | native | ~background | dts-grep (weak) | @nivo/core/index.d.ts:149 |
| Victory | partial | VictoryChart.style | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:22 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.background | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1827 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~style | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:13 |
| Vega-Lite | native | ~background | dts-grep (weak) | 238:              "description" |
| AG Charts | native | AgChartOptions.background | dts-path (strong) | ag-charts-types/dist/types/src/chart/chartOptions.d.ts:248 |
| amCharts 5 | native | ~background\|plotContainer | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:167 |
| Google Charts | native | ~backgroundColor | dts-grep (weak) | @types/google.visualization/index.d.ts:372 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~background | dts-grep (weak) | 515:	 * The crosshair marker background color. An empty string falls back to the color of the series under the crosshair. |
| MUI X Charts | native | ~sx | dts-grep (weak) | @mui/x-charts/index.d.ts:11 |
| Mermaid (chart-ish diagrams only) | native | ~background | dts-grep (weak) | mermaid/dist/styles.d.ts:14 |
| AntV G2 | native | ~viewFill\|plotFill | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:43 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a59d27e1bde.

https://chartkit.dev/features.json
