# Right-to-left support

ChartKit: **native**

RTL text and layout

Matrix status: `native`. Verification: `runtime-probe` (strong).

layout.direction rtl sets dir=rtl, mirrors every categorical bar, keeps every category label, moves the y axis to the right with a rotated title, and centres the x title.

Source: packages/core/src/layout.ts

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
    "alt": "Units rose in Q2, laid out right to left."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "title": "الوحدات",
  "layout": {
    "direction": "rtl"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~rtl\|textDirection | dts-grep (weak) | chart.js/dist/types/index.d.ts:2500 |
| Recharts | native | ~direction\|rtl | dts-grep (weak) | recharts/types/index.d.ts:137 |
| Apache ECharts | unknown | — | conflict (unknown) | — |
| Highcharts | native | ~rtl\|useHTML | dts-grep (weak) | highcharts/highcharts.src.d.ts:288 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~rtl | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-and-clustered-column/config.json:69 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~rtl\|direction | dts-grep (weak) | @mui/x-charts/locales/svSE.d.ts:68 MUI theme direction |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
