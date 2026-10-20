# Aspect ratio sizing

ChartKit: **native**

Height derived from width by ratio

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:1105

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
    "height": 260,
    "aspectRatio": 2
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~aspectRatio | dts-grep (weak) | chart.js/dist/types/index.d.ts:506 |
| Recharts | native | ResponsiveContainer.aspect | dts-path (strong) | recharts/types/component/ResponsiveContainer.d.ts:8 |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | partial | chart.height | dts-path (strong) | highcharts/highcharts.d.ts:6350 '56%' percentage height |
| Plotly.js | unknown | — | conflict (unknown) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | partial | VictoryChart.width | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:55 viewBox scales with fixed ratio |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~aspectRatio | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:22 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
