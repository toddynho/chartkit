# Data table chart

ChartKit: **partial**

Tabular display as a chart type

Matrix status: `partial`. Verification: `dts-path` (strong).

accessible table, not a visual table type

Source: chartkit:packages/core/src/generated/schema.ts:1185

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
    "alt": "Units rose in Q2.",
    "dataTable": true
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
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | unknown | — | conflict (unknown) | — |
| Plotly.js | native | trace.type=table | dts-path (strong) | plot-schema.json#traces.table |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | native | Table | dts-path (strong) | @tremor/react/dist/index.d.ts:532 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | native | Table | dts-path (strong) | @types/google.visualization/index.d.ts:1169 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b64aa4f4c004.

https://chartkit.dev/features.json
