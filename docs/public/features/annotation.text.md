# Text annotation at a data point

ChartKit: **native**

Label pinned to data coordinates

Matrix status: `native`. Verification: `dts-path` (strong).

{type:'text', x, y, label}

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
| Recharts | native | ReferenceDot, Label | dts-path (strong) | recharts/types/cartesian/ReferenceDot.d.ts:137, recharts/types/component/Label.d.ts:135 |
| Apache ECharts | native | series.markPoint | dts-path (strong) | echarts/types/dist/shared.d.ts:12500 |
| Highcharts | native | ~annotations | dts-grep (weak) | highcharts/highcharts.src.d.ts:162 annotations module labels |
| Plotly.js | native | layout.annotations | dts-path (strong) | plot-schema.json#layout.layoutAttributes.annotations |
| Nivo | native | Line.markers, ~legend | dts-path (strong) | @nivo/line/dist/types/types.d.ts:186, @nivo/stream/package.json:42 |
| Victory | native | VictoryLabel | dts-path (strong) | victory-core/lib/victory-label/victory-label.d.ts:54 |
| visx | native | Annotation, Label | dts-path (strong) | @visx/annotation/lib/components/Annotation.d.ts:7, @visx/annotation/lib/components/Label.d.ts:59 |
| ApexCharts | native | annotations.points | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2660 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | text | dts-path (strong) | @observablehq/plot/src/marks/text.d.ts:211 |
| Vega-Lite | native | mark=text | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | ~annotations | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:7 enterprise annotations / crossLines label |
| amCharts 5 | native | ~Label | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:55 |
| Google Charts | native | ~annotation | dts-grep (weak) | @types/google.visualization/index.d.ts:402 annotation role column |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~createSeriesMarkers\|text | dts-grep (weak) | 274: * import { createSeriesMarkers } from 'lightweight-charts'; |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | MarkTypes=text | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
