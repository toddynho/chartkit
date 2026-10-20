# Date formatting

ChartKit: **native**

Date/time tick and tooltip formats

Matrix status: `native`. Verification: `dts-path` (strong).

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
    "x": {
      "format": {
        "style": "date"
      }
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — time.displayFormats |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | ~formatter | dts-grep (weak) | echarts/types/dist/shared.d.ts:2768 time axis formatter templates {yyyy} |
| Highcharts | native | xAxis.dateTimeLabelFormats | dts-path (strong) | highcharts/highcharts.d.ts:108217 |
| Plotly.js | native | layout.xaxis.tickformat | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.tickformat d3-time-format |
| Nivo | native | ~format | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:3 xFormat 'time:%Y' |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | xaxis.labels.datetimeFormatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4928 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~tickFormat | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:591 |
| Vega-Lite | native | ~timeFormat\|format | dts-grep (weak) | 84:          "description" |
| AG Charts | native | ~format | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:3 time format strings |
| amCharts 5 | native | ~dateFormats\|dateFormat | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:69 |
| Google Charts | native | DateFormat | dts-path (strong) | @types/google.visualization/index.d.ts:1599 |
| uPlot | native | Options.axes.values | dts-path (strong) | uplot/dist/uPlot.d.ts:1108 fmtDate templates |
| TradingView Lightweight Charts | native | ~timeFormatter\|tickMarkFormatter | dts-grep (weak) | 3343:	timeFormatter? |
| MUI X Charts | native | ~valueFormatter | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:43 |
| Mermaid (chart-ish diagrams only) | native | ~axisFormat\|dateFormat | dts-grep (weak) | mermaid/dist/config.type.d.ts:590 gantt |
| AntV G2 | native | ~labelFormatter | dts-grep (weak) | @antv/g2/lib/component/legendCategory.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
