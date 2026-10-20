# Timeline / event chart

ChartKit: **native**

Events and periods along a time line

Matrix status: `native`. Verification: `dts-grep` (weak).

Source: chartkit:packages/core/src/validate-phase4.ts:13

## ChartKit spec

```json
{
  "version": "1",
  "type": "timeline",
  "data": [
    {
      "label": "Founded",
      "date": "2014-06-01"
    },
    {
      "label": "Platform",
      "start": "2024-01-01",
      "end": "2026-01-01",
      "kind": "period"
    }
  ],
  "a11y": {
    "alt": "The company started in 2014."
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
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=timeline, series.type=xrange | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | partial | chart.type=rangeBar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | native | ~SerpentineChart | dts-grep (weak) | @amcharts/amcharts5/timeline.d.ts:4 timeline package (curve/serpentine/spiral) |
| Google Charts | native | Timeline | dts-path (strong) | @types/google.visualization/index.d.ts:1216 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.timeline | dts-path (strong) | mermaid/dist/config.type.d.ts:219 |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
