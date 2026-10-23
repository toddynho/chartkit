# Draw order / z-index

ChartKit: **native**

Control series stacking order

Matrix status: `native`. Verification: `render` (strong).

encoding.y[].z and annotations[].z. Higher paints later. Stacked series keep data order. z below 0 paints an annotation under the marks. zIndex repairs to z (CK3064).

Source: chartkit:packages/core/src/renderers/cartesian.ts

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40,
      "other": 22
    },
    {
      "quarter": "Q2",
      "units": 55,
      "other": 18
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": [
      {
        "field": "units",
        "z": 2
      },
      {
        "field": "other",
        "z": 0
      }
    ]
  },
  "a11y": {
    "alt": "Units stay above the other series."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 30,
      "z": -1,
      "label": "Floor"
    }
  ]
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.order | dts-path (strong) | chart.js/dist/types/index.d.ts:83 |
| Recharts | native | ~zIndex | dts-grep (weak) | recharts/types/index.d.ts:130 ZIndexLayer (v3) |
| Apache ECharts | native | series.z, series.zlevel | dts-path (strong) | echarts/types/dist/shared.d.ts:8228, echarts/types/dist/shared.d.ts:8229 |
| Highcharts | native | plotOptions.series.zIndex | dts-path (strong) | highcharts/options/series.d.ts:1377 |
| Plotly.js | partial | ~order | dts-grep (weak) | @types/plotly.js/index.d.ts:239 trace order |
| Nivo | native | Line.layers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 child order |
| visx | partial | Group | dts-path (strong) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | partial | marks | dts-path (strong) | @observablehq/plot/src/mark.d.ts:496 mark order |
| Vega-Lite | partial | ~layer\|zindex | dts-grep (weak) | 579:          "description" |
| AG Charts | partial | ~zIndex | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:98 |
| amCharts 5 | native | ~zIndex\|toFront | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/Axis.d.ts:218 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | partial | Options.series | dts-path (strong) | uplot/dist/uPlot.d.ts:375 series order |
| TradingView Lightweight Charts | native | ~zOrder | dts-grep (weak) | 2182:	 * @returns the desired position in the visual layer stack. @see {@link PrimitivePaneViewZOrder} |
| MUI X Charts | partial | ~zIndex\|slots | dts-grep (weak) | @mui/x-charts/index.d.ts:29 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~zIndex | dts-grep (weak) | @antv/g2/lib/component/axis.d.ts:6 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ddab4856d750.

https://chartkit.dev/features.json
