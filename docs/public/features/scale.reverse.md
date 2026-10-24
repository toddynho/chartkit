# Reversed scale

ChartKit: **native**

Flip axis direction

Matrix status: `native`. Verification: `runtime-probe` (strong).

drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:701

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
      "scale": {
        "reverse": true
      }
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
| Chart.js | native | ~reverse | dts-grep (weak) | chart.js/dist/types/index.d.ts:1054 |
| Recharts | native | YAxis.reversed | dts-path (strong) | recharts/types/util/types.d.ts:850 |
| Apache ECharts | native | yAxis.inverse | dts-path (strong) | echarts/types/dist/shared.d.ts:2574 |
| Highcharts | native | yAxis.reversed | dts-path (strong) | highcharts/highcharts.d.ts:110532 |
| Plotly.js | native | layout.yaxis.autorange=reversed | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.autorange |
| Nivo | native | ~reverse | dts-grep (weak) | @nivo/scales/dist/types/types.d.ts:38 |
| Victory | partial | VictoryChart.scale | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:42 via domain ordering |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | native | yaxis.reversed | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5037 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~reverse | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:364 |
| Vega-Lite | native | ~reverse | dts-grep (weak) | 21930:        "reverse" |
| AG Charts | native | ~reverse | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineAxisOptions.d.ts:9 |
| amCharts 5 | native | ~inversed | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/hierarchy/Tree.d.ts:38 |
| Google Charts | native | ~direction | dts-grep (weak) | @types/google.visualization/index.d.ts:528 vAxis.direction: -1 |
| uPlot | native | ~dir | dts-grep (weak) | 480:			/** when x & y are true, sets an upper drag limit in CSS px for adaptive/unidirectional behavior */ scales.y.dir: -1 |
| TradingView Lightweight Charts | native | ~invertScale | dts-grep (weak) | 3726:	invertScale |
| MUI X Charts | native | LineChart.yAxis.reverse | dts-path (strong) | @mui/x-charts/models/axis.d.mts:525 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~reverse | dts-grep (weak) | @antv/g2/lib/index.d.ts:168 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
