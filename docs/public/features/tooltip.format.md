# Tooltip value formatting

ChartKit: **partial**

Format numbers/dates in tooltips

Matrix status: `partial`. Verification: `dts-path` (strong).

tooltip reuses the channel format, and a tooltip.fields item can set its own format preset

Source: chartkit:packages/core/src/generated/schema.ts:136

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
      "format": "compact"
    }
  },
  "a11y": {
    "alt": "Units rose in Q2."
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
| Chart.js | native | ~callbacks | dts-grep (weak) | chart.js/dist/types/index.d.ts:2681 tooltip.callbacks.label |
| Recharts | native | Tooltip.formatter, Tooltip.labelFormatter | dts-path (strong) | recharts/types/component/DefaultTooltipContent.d.ts:41, recharts/types/component/DefaultTooltipContent.d.ts:45 |
| Apache ECharts | native | tooltip.valueFormatter, tooltip.formatter | dts-path (strong) | echarts/types/dist/shared.d.ts:8078, echarts/types/dist/shared.d.ts:8072 |
| Highcharts | native | tooltip.valueDecimals, tooltip.valuePrefix | dts-path (strong) | highcharts/highcharts.d.ts:107591, highcharts/highcharts.d.ts:107596 |
| Plotly.js | native | trace.hovertemplate | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,choropleth,choroplethmap,…}.attributes.hovertemplate |
| Nivo | native | Line.yFormat, Line.xFormat | dts-path (strong) | @nivo/line/dist/types/types.d.ts:133, @nivo/line/dist/types/types.d.ts:131 |
| Victory | native | VictoryTooltip | dts-path (strong) | victory-tooltip/lib/victory-tooltip.d.ts:66 labels function |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 render your own content |
| ApexCharts | native | tooltip.y.formatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4816 |
| Tremor (npm) | native | LineChart.valueFormatter | dts-path (strong) | @tremor/react/dist/index.d.ts:60 |
| Observable Plot | native | ~format | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:349 tip format / channels |
| Vega-Lite | native | ~format | dts-grep (weak) | 84:          "description" |
| AG Charts | native | ~renderer\|format | dts-grep (weak) | ag-charts-enterprise/dist/types/src/license/licenseManager.d.ts:2 |
| amCharts 5 | native | ~labelText\|numberFormat | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:72 |
| Google Charts | native | ~format | dts-grep (weak) | @types/google.visualization/index.d.ts:162 NumberFormat formatters on DataTable |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~valueFormatter | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:43 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~items\|valueFormatter | dts-grep (weak) | @antv/g2/lib/runtime/transform.d.ts:10 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
