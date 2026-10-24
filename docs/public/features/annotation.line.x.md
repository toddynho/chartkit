# Vertical reference line

ChartKit: **native**

Line at an x value (event, deploy)

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:225

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
      "axis": "x",
      "value": "Q2",
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
| Recharts | native | ReferenceLine.x | dts-path (strong) | @types/react/index.d.ts:3967 |
| Apache ECharts | native | series.markLine | dts-path (strong) | echarts/types/dist/shared.d.ts:12499 |
| Highcharts | native | xAxis.plotLines | dts-path (strong) | highcharts/highcharts.d.ts:108598 |
| Plotly.js | native | layout.shapes | dts-path (strong) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Line.markers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:186 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | annotations.xaxis | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2659 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ruleX | dts-path (strong) | @observablehq/plot/src/marks/rule.d.ts:114 |
| Vega-Lite | native | mark=rule | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | ~crossLines | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:9 |
| amCharts 5 | native | ~createAxisRange | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:740 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | partial | ~createSeriesMarkers\|setMarkers | dts-grep (weak) | 274: * import { createSeriesMarkers } from 'lightweight-charts'; markers at a time, not a line |
| MUI X Charts | native | ChartsReferenceLine | dts-path (strong) | @mui/x-charts/ChartsReferenceLine/ChartsReferenceLine.d.mts:5 |
| Mermaid (chart-ish diagrams only) | native | ~todayMarker | dts-grep (weak) | mermaid/dist/diagrams/gantt/ganttDb.d.ts:7 gantt todayMarker |
| AntV G2 | native | MarkTypes=lineX | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
