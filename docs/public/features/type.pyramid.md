# Pyramid

ChartKit: **partial**

Triangular funnel / population pyramid

Matrix status: `partial`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:899

## ChartKit spec

```json
{
  "version": "1",
  "type": "funnel",
  "data": [
    {
      "x": "A",
      "y": 80
    },
    {
      "x": "B",
      "y": 12
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y"
  },
  "a11y": {
    "alt": "12 of 80 pay."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "shape": "trapezoid"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | partial | series.sort | dts-path (strong) | echarts/types/dist/shared.d.ts:11810 funnel sorted ascending |
| Highcharts | native | series.type=pyramid | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.type=funnelarea | dts-path (strong) | plot-schema.json#traces.funnelarea |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=pyramid | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | series.type=pyramid | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | PyramidSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/funnel/PyramidSeries.d.ts:45 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against e79729672133.

https://chartkit.dev/features.json
