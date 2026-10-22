# Symlog / signed log scale

ChartKit: **native**

Log-like scale that handles zero and negatives

Matrix status: `native`. Verification: `render` (strong).

encoding.y.scale.type is symlog. constant is the linear half-width around zero, default 1. asinh, symLog, and signed-log repair to symlog (CK3070). A constant on any other scale warns CK3062.

Source: chartkit:packages/core/src/svg.ts

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
    "y": {
      "field": "units",
      "scale": {
        "type": "symlog",
        "constant": 1
      }
    }
  },
  "a11y": {
    "alt": "Units rose in Q2, on a signed log."
  },
  "size": {
    "width": 640,
    "height": 260
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | YAxis.scale=symlog | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:69 |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | none | — | dts-absence (absence) | — |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~symlog | dts-grep (weak) | @nivo/scatterplot/dist/types/hooks.d.ts:14 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ~scaleSymlog | dts-grep (weak) | @visx/scale/lib/index.d.ts:12 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~symlog | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:177 |
| Vega-Lite | native | ~symlog | dts-grep (weak) | 21698:          "description" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | ~asinh | dts-grep (weak) | 139:	static rangeAsinh(min distr: 4 (asinh) |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.yAxis.scaleType=symlog | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~symlog\|Symlog | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
