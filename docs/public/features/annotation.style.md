# Annotation styling (dash, colour, opacity)

ChartKit: **native**

Line dash, colour and opacity of annotations

Matrix status: `native`. Verification: `dts-path` (strong).

dash, color, opacity

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
| Recharts | native | ReferenceLine.strokeDasharray | dts-path (strong) | @types/react/index.d.ts:3923 |
| Apache ECharts | native | ~lineStyle | dts-grep (weak) | echarts/types/dist/shared.d.ts:2758 |
| Highcharts | native | ~dashStyle | dts-grep (weak) | highcharts/highcharts.src.d.ts:367 |
| Plotly.js | native | ~dash | dts-grep (weak) | @types/plotly.js/index.d.ts:811 |
| Nivo | native | ~lineStyle | dts-grep (weak) | @nivo/core/index.d.ts:333 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | ~strokeDashArray | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:2104 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~strokeDasharray | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:357 |
| Vega-Lite | native | ~strokeDash | dts-grep (weak) | 736:        "strokeDash" |
| AG Charts | native | ~lineDash | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/radialGaugeOptions.d.ts:5 |
| amCharts 5 | native | ~strokeDasharray | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/XYChart.d.ts:37 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | native | ~lineStyle | dts-grep (weak) | 73:export declare enum LineStyle { |
| MUI X Charts | native | ~lineStyle\|sx | dts-grep (weak) | @mui/x-charts/index.d.ts:11 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~lineDash | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:207 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
