# Number formatting options

ChartKit: **native**

Decimals, prefix/suffix, compact, percent, currency

Matrix status: `native`. Verification: `dts-path` (strong).

number|compact|percent|currency|bytes|duration-ms|date|time|datetime

Source: chartkit:packages/core/src/generated/schema.ts:644

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
  "axes": {
    "y": {
      "format": {
        "style": "compact"
      }
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 callback with Intl |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 tickFormatter callback |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 formatter callback / template |
| Highcharts | native | yAxis.labels.format | dts-path (strong) | highcharts/highcharts.d.ts:109837 {value:,.2f} format strings + numericSymbols |
| Plotly.js | native | layout.yaxis.tickformat | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.tickformat d3-format strings |
| Nivo | native | ~format | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:3 d3-format strings |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — formatter callbacks |
| Tremor (npm) | native | LineChart.valueFormatter | dts-path (strong) | @tremor/react/dist/index.d.ts:60 function |
| Observable Plot | native | ~tickFormat | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:591 d3-format strings |
| Vega-Lite | native | ~format | dts-grep (weak) | 84:          "description" d3-format strings in JSON |
| AG Charts | native | ~format | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:3 d3-style format strings in options |
| amCharts 5 | native | ~numberFormat | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:72 '#,###.00' patterns |
| Google Charts | native | NumberFormat, ~format | dts-path (strong) | @types/google.visualization/index.d.ts:1646, @types/google.visualization/index.d.ts:162 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~priceFormat\|precision | dts-grep (weak) | 2211:export interface IPriceFormatter { |
| MUI X Charts | native | ~valueFormatter | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:43 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~labelFormatter | dts-grep (weak) | @antv/g2/lib/component/legendCategory.d.ts:5 d3-format string or function |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40eb8c4522fd.

https://chartkit.dev/features.json
