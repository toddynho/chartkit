# Horizontal reference line

ChartKit: **native**

Line at a y value (target, threshold)

Matrix status: `native`. Verification: `dts-path` (strong).

{type:'rule', axis:'y', value}

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
| Recharts | native | ReferenceLine | dts-path (strong) | recharts/types/cartesian/ReferenceLine.d.ts:156 |
| Apache ECharts | native | series.markLine | dts-path (strong) | echarts/types/dist/shared.d.ts:12499 |
| Highcharts | native | yAxis.plotLines | dts-path (strong) | highcharts/highcharts.d.ts:110516 |
| Plotly.js | native | layout.shapes | dts-path (strong) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Line.markers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:186 markers axis:'y' |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 VictoryLine with constant data |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 Line + scale |
| ApexCharts | native | annotations.yaxis | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2658 |
| Tremor (npm) | none | — | dts-absence (absence) | — no reference lines |
| Observable Plot | native | ruleY | dts-path (strong) | @observablehq/plot/src/marks/rule.d.ts:137 |
| Vega-Lite | native | mark=rule | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | ~crossLines | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:9 axes[].crossLines type 'line' |
| amCharts 5 | native | ~createAxisRange\|axisRange | dts-grep (weak) | @amcharts/amcharts5/radar.d.ts:5 |
| Google Charts | none | — | dts-absence (absence) | — use an extra series |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 hooks draw |
| TradingView Lightweight Charts | native | ~createPriceLine | dts-grep (weak) | 2531:	 * const priceLine = series.createPriceLine({ |
| MUI X Charts | native | ChartsReferenceLine | dts-path (strong) | @mui/x-charts/ChartsReferenceLine/ChartsReferenceLine.d.mts:5 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=lineY | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3d041a41af6e.

https://chartkit.dev/features.json
