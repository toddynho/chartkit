# Automatic light/dark from page

ChartKit: **native**

Follows prefers-color-scheme without re-render

Matrix status: `native`. Verification: `dts-path` (strong).

Soft default follows prefers-color-scheme via light-dark()

Source: chartkit:packages/core/src/generated/schema.ts:315

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
  "theme": {
    "preset": "auto"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | unknown | ~currentColor | unverified (unknown) | — CSS-styled SVG can follow page |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | ~adaptive\|prefers-color-scheme | dts-grep (weak) | highcharts/esm/themes/adaptive.src.d.ts:1 adaptive theme module |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | partial | ~dark | dts-grep (weak) | @tremor/react/dist/lib/theme.d.ts:9 |
| Observable Plot | native | ~currentColor | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:318 inherits CSS colour |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | ~colorSchemes\|CssVarsProvider | unverified (unknown) | — MUI CSS vars |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
