# Axis breaks

ChartKit: **native**

Skip a range of an axis (gaps, weekends)

Matrix status: `native`. Verification: `render` (strong).

axes.y.breaks is a list of {from, to}, up to three gaps. Ticks inside a gap are omitted and the spine draws a zigzag. Overlapping gaps warn CK3069. from must be below to (CK3061).

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
    "y": {
      "breaks": [
        {
          "from": 45,
          "to": 52
        }
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | xAxis.breaks | dts-path (strong) | echarts/types/dist/shared.d.ts:2658 ECharts 6 axis breaks |
| Highcharts | native | xAxis.breaks | dts-path (strong) | highcharts/highcharts.d.ts:108155 broken-axis module |
| Plotly.js | native | layout.xaxis.rangebreaks | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.rangebreaks |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | unknown | — | conflict (unknown) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | unverified (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~ignoreWhitespaceIndices\|business | dts-grep (weak) | 391: * Check if a time value is a business day object. business-day time scale skips gaps |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~breaks | dts-grep (weak) | @antv/g2/lib/runtime/constant.d.ts:10 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3d041a41af6e.

https://chartkit.dev/features.json
