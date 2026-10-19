# Square-root / power scale

ChartKit: **native**

Sqrt or pow scale (bubble areas, skewed data)

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:683

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
        "type": "sqrt"
      }
    }
  },
  "a11y": {
    "alt": "Units rose in Q2."
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
| Recharts | native | YAxis.scale=sqrt | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:69 |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | none | — | dts-absence (absence) | — |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | ~sqrt | dts-grep (weak) | victory-core/lib/types/prop-types.d.ts:95 |
| visx | native | ~scaleSqrt\|scalePower | dts-grep (weak) | @visx/scale/lib/index.d.ts:8 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~sqrt\|pow | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:174 |
| Vega-Lite | native | ~sqrt | dts-grep (weak) | 21968:          "description" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.yAxis.scaleType=sqrt | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~sqrt\|pow | dts-grep (weak) | @antv/g2/lib/index.d.ts:98 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
