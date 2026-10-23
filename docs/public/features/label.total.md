# Stack totals

ChartKit: **native**

Label the total on stacked bars

Matrix status: `native`. Verification: `runtime-probe` (strong).

Labels the total on a stacked bar or stacked area. On a bar this also stacks the series.

Source: packages/core/src/totals.ts:6

## ChartKit spec

```json
{
  "version": "1",
  "type": "stacked-area",
  "data": [
    {
      "x": "A",
      "a": 2,
      "b": 3
    },
    {
      "x": "B",
      "a": 4,
      "b": 2
    }
  ],
  "encoding": {
    "x": "x",
    "y": [
      "a",
      "b"
    ]
  },
  "a11y": {
    "alt": "B is higher."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "stackTotal": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | yAxis.stackLabels | dts-path (strong) | highcharts/highcharts.d.ts:110590 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Bar.enableTotals | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:176 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | plotOptions.bar.dataLabels.total | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3140 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 text on groupX sum |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
