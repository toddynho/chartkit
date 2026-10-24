# Tick label overlap avoidance

ChartKit: **native**

Auto-skip, stagger or hide overlapping labels

Matrix status: `native`. Verification: `runtime-probe` (strong).

autoSkip true drops crowded category labels instead of tilting them. false draws every label. Numeric ticks skip on collision unless it is false. Drawn on createRenderer([line]).

Source: packages/core/src/generated/schema.ts:1044

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
      "autoSkip": false
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~autoSkip | dts-grep (weak) | chart.js/dist/types/index.d.ts:3127 |
| Recharts | native | XAxis.interval, XAxis.minTickGap | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:125, recharts/types/cartesian/XAxis.d.ts:120 |
| Apache ECharts | native | xAxis.axisLabel.hideOverlap | dts-path (strong) | echarts/types/dist/shared.d.ts:2814 |
| Highcharts | native | xAxis.labels.staggerLines, xAxis.labels.autoRotation | dts-path (strong) | highcharts/highcharts.d.ts:108041, highcharts/highcharts.d.ts:107911 |
| Plotly.js | partial | layout.xaxis.automargin | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.automargin |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryAxis.fixLabelOverlap | dts-path (strong) | victory-axis/lib/victory-axis.d.ts:7 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | xaxis.labels.hideOverlappingLabels | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4911 |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | native | ~tickSpacing | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:572 |
| Vega-Lite | native | ~labelOverlap | dts-grep (weak) | 1474:        "labelOverlap" |
| AG Charts | native | ~avoidCollisions | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/linearGaugeOptions.d.ts:70 |
| amCharts 5 | native | ~minGridDistance | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-step/config.json:83 |
| Google Charts | native | ~showTextEvery\|slantedText | dts-grep (weak) | @types/google.visualization/index.d.ts:539 |
| uPlot | partial | Options.axes.space | dts-path (strong) | uplot/dist/uPlot.d.ts:1096 |
| TradingView Lightweight Charts | partial | ~tickMarkMaxCharacterLength | dts-grep (weak) | 1464:	tickMarkMaxCharacterLength? |
| MUI X Charts | native | ~tickLabelInterval | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:24 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~labelAutoHide\|labelAutoRotate | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
