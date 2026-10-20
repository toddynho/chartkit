# Legend position

ChartKit: **native**

Top/right/bottom/left/inside placement

Matrix status: `native`. Verification: `dts-path` (strong).

top, right, bottom, left, and inside. A funnel draws it when legend is set.

Source: chartkit:packages/core/src/generated/schema.ts:173

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
  "legend": {
    "position": "bottom"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~position | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 plugins.legend.position |
| Recharts | native | Legend.verticalAlign, Legend.align | dts-path (strong) | recharts/types/component/Legend.d.ts:84, recharts/types/component/DefaultLegendContent.d.ts:55 |
| Apache ECharts | native | legend.orient, legend.left | dts-path (strong) | echarts/types/dist/shared.d.ts:4343, echarts/types/dist/shared.d.ts:7606 |
| Highcharts | native | legend.align, legend.verticalAlign | dts-path (strong) | highcharts/highcharts.d.ts:13400, highcharts/highcharts.d.ts:13669 |
| Plotly.js | native | layout.legend.x, layout.legend.orientation | dts-path (strong) | plot-schema.json#layout.layoutAttributes.legend.x, plot-schema.json#layout.layoutAttributes.legend.orientation |
| Nivo | native | ~anchor\|direction | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:8 legends[].anchor / direction / translateX |
| Victory | native | VictoryLegend.x, VictoryLegend.orientation | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:15, victory-legend/lib/victory-legend.d.ts:18 |
| visx | partial | LegendOrdinal.direction | dts-path (strong) | @visx/legend/lib/legends/Legend/index.d.ts:31 placement is manual layout |
| ApexCharts | native | legend.position, legend.horizontalAlign | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4598, apexcharts/types/apexcharts.d.ts:4599 |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | partial | ~legend | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:3 rendered as separate element |
| Vega-Lite | native | ~orient | dts-grep (weak) | 590:        "orient" |
| AG Charts | native | ~position | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:42 |
| amCharts 5 | native | ~layout\|centerX | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:19 |
| Google Charts | native | ~position | dts-grep (weak) | @types/google.visualization/index.d.ts:504 |
| uPlot | partial | Options.legend | dts-path (strong) | uplot/dist/uPlot.d.ts:388 below chart only |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~position\|direction | dts-grep (weak) | @mui/x-charts/ChartsLegend/useAxis.d.ts:5 slotProps.legend.position |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~position | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
