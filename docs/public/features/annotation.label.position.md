# Annotation label placement

ChartKit: **native**

Where an annotation's label sits

Matrix status: `native`. Verification: `dts-path` (strong).

labelPosition start|center|end

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
| Recharts | native | ReferenceLine.label | dts-path (strong) | recharts/types/cartesian/ReferenceLine.d.ts:102 |
| Apache ECharts | native | ~position | dts-grep (weak) | echarts/types/dist/shared.d.ts:63 markLine.label.position |
| Highcharts | native | ~align\|verticalAlign | dts-grep (weak) | highcharts/highcharts.src.d.ts:147 plotLines.label.align |
| Plotly.js | native | ~xanchor\|yanchor | dts-grep (weak) | @types/plotly.js/index.d.ts:587 |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | Label | dts-path (strong) | @visx/annotation/lib/components/Label.d.ts:59 |
| ApexCharts | native | ~position\|offsetX | dts-grep (weak) | apexcharts/types/unit-shapes.d.ts:48 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~textAnchor\|frameAnchor | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:18 |
| Vega-Lite | native | ~align\|baseline | dts-grep (weak) | 93:    "Align" |
| AG Charts | native | ~position | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:42 |
| amCharts 5 | native | ~centerX\|location | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:140 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~axisLabelVisible\|title | dts-grep (weak) | 2241:	 *     axisLabelVisible |
| MUI X Charts | native | ~labelAlign\|labelStyle | dts-grep (weak) | @mui/x-charts/internals/useDefaultTickLabelStyle.d.ts:7 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~position | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7eff21f18449.

https://chartkit.dev/features.json
