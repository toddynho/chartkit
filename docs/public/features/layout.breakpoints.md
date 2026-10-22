# Responsive rules / breakpoints

ChartKit: **native**

Different options at different container sizes

Matrix status: `native`. Verification: `runtime-probe` (strong).

layout.breakpoints is a list of rules. The first rule whose maxWidth or minWidth matches size.width, or the container width when width is auto, overrides legend, direction, facet columns, or concat direction. A narrow rule can set columns to 2 so the panels stay readable. A non-positive maxWidth warns CK3046. columns without a facet field warns CK3047.

Source: packages/core/src/layout.ts

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40,
      "cost": 12
    },
    {
      "quarter": "Q2",
      "units": 55,
      "cost": 15
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": [
      "units",
      "cost"
    ]
  },
  "a11y": {
    "alt": "The legend hides below 480px."
  },
  "size": {
    "width": 320,
    "height": 220
  },
  "layout": {
    "breakpoints": [
      {
        "maxWidth": 480,
        "legend": false
      }
    ]
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~onResize | dts-grep (weak) | chart.js/dist/types/index.d.ts:1677 onResize callback only |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | ~media | dts-grep (weak) | echarts/types/src/model/OptionManager.d.ts:11 baseOption + media queries |
| Highcharts | native | responsive.rules | dts-path (strong) | highcharts/highcharts.d.ts:98595 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | responsive | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1487 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~ResponsiveTheme | dts-grep (weak) | @amcharts/amcharts5/.internal/themes/ResponsiveTheme.d.ts:27 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b64aa4f4c004.

https://chartkit.dev/features.json
