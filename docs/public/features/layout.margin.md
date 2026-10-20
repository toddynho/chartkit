# Margins / padding

ChartKit: **native**

Space around the plot area

Matrix status: `native`. Verification: `runtime-probe` (strong).

size.padding, number or per-side object; drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:1113

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
    "height": 260,
    "padding": {
      "left": 48,
      "right": 16,
      "top": 12,
      "bottom": 28
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~layout | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 options.layout.padding |
| Recharts | native | LineChart.margin | dts-path (strong) | recharts/types/util/types.d.ts:1247 |
| Apache ECharts | native | grid.left, grid.right | dts-path (strong) | echarts/types/dist/shared.d.ts:7606, echarts/types/dist/shared.d.ts:7604 |
| Highcharts | native | chart.margin, chart.spacing | dts-path (strong) | highcharts/highcharts.d.ts:6391, highcharts/highcharts.d.ts:6611 |
| Plotly.js | native | layout.margin | dts-path (strong) | plot-schema.json#layout.layoutAttributes.margin |
| Nivo | native | Line.margin | dts-path (strong) | @nivo/line/dist/types/types.d.ts:134 |
| Victory | native | VictoryChart.padding | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:39 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 margins are yours |
| ApexCharts | native | grid.padding | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5293 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~margin\|marginLeft | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:626 |
| Vega-Lite | native | ~padding\|autosize | dts-grep (weak) | 609:              "description" |
| AG Charts | native | ~padding | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:15 |
| amCharts 5 | native | ~paddingLeft | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/hierarchy/Treemap.d.ts:34 |
| Google Charts | native | ~chartArea | dts-grep (weak) | @types/google.visualization/index.d.ts:493 |
| uPlot | native | Options.padding | dts-path (strong) | uplot/dist/uPlot.d.ts:384 |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | LineChart.margin | dts-path (strong) | @mui/x-charts/internals/plugins/corePlugins/useChartDimensions/useChartDimensions.types.d.mts:36 |
| Mermaid (chart-ish diagrams only) | native | ~plotReservedSpacePercent\|padding | dts-grep (weak) | mermaid/dist/internals.d.ts:34 |
| AntV G2 | native | ~margin\|padding | dts-grep (weak) | @antv/g2/lib/data/wordCloud.d.ts:76 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against aad14577fd95.

https://chartkit.dev/features.json
