# Shaded band / region

ChartKit: **native**

Highlighted range on an axis

Matrix status: `native`. Verification: `dts-path` (strong).

{type:'band', from, to}

Source: chartkit:packages/core/src/generated/schema.ts:69

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
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 50,
      "label": "Mark"
    }
  ]
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | ReferenceArea | dts-path (strong) | recharts/types/cartesian/ReferenceArea.d.ts:129 |
| Apache ECharts | native | series.markArea | dts-path (strong) | echarts/types/dist/shared.d.ts:12498 |
| Highcharts | native | xAxis.plotBands | dts-path (strong) | highcharts/highcharts.d.ts:108576 |
| Plotly.js | native | layout.shapes | dts-path (strong) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | annotations.xaxis, ~fillColor | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2659, apexcharts/types/apexcharts.d.ts:1415 x2 / y2 make a band |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | rectX, rectY | dts-path (strong) | @observablehq/plot/src/marks/rect.d.ts:257, @observablehq/plot/src/marks/rect.d.ts:270 |
| Vega-Lite | native | mark=rect | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | ~crossLines | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:9 type 'range' |
| amCharts 5 | native | ~axisFill\|createAxisRange | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:740 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.bands | dts-path (strong) | uplot/dist/uPlot.d.ts:377 bands are between series; manual region via hooks |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=rangeX, MarkTypes=rangeY | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13, @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
