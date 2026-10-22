# Alternating bands / plot bands

ChartKit: **native**

Shaded alternating stripes or bands on an axis

Matrix status: `native`. Verification: `dts-path` (strong).

axes.x.bands and axes.y.bands shade ranges. x also accepts "weekends" when x is dates.

Source: chartkit:packages/core/src/annotations.ts:19

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
      "bands": [
        {
          "from": "Q1",
          "to": "Q2",
          "label": "Window"
        }
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | ReferenceArea | dts-path (strong) | recharts/types/cartesian/ReferenceArea.d.ts:129 |
| Apache ECharts | native | yAxis.splitArea | dts-path (strong) | echarts/types/dist/shared.d.ts:2623 |
| Highcharts | native | yAxis.plotBands, yAxis.alternateGridColor | dts-path (strong) | highcharts/highcharts.d.ts:110494, highcharts/highcharts.d.ts:110050 |
| Plotly.js | native | layout.shapes | dts-path (strong) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | grid.row.colors | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5286 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | rectY | dts-path (strong) | @observablehq/plot/src/marks/rect.d.ts:270 bands as marks |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~crossLines\|fillOpacity | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:9 |
| amCharts 5 | native | ~axisFill\|fill | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/ChartSerializer.d.ts:42 axis ranges / alternating fills |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.bands | dts-path (strong) | uplot/dist/uPlot.d.ts:377 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~ChartsReferenceLine | dts-grep (weak) | @mui/x-charts/index.d.ts:8 lines only; bands via custom |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~rangeY | dts-grep (weak) | @antv/g2/lib/index.d.ts:82 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
