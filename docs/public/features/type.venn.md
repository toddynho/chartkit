# Venn / Euler diagram

ChartKit: **native**

Overlapping set circles

Matrix status: `native`. Verification: `dts-grep` (weak).

phase 4 type; not in core schema enum

Source: chartkit:packages/core/src/validate-phase4.ts:13

## ChartKit spec

```json
{
  "version": "1",
  "type": "venn",
  "data": [
    {
      "set": "A",
      "size": 12
    },
    {
      "set": "B",
      "size": 8
    },
    {
      "set": "A+B",
      "size": 3
    }
  ],
  "a11y": {
    "alt": "A and B overlap."
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
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | none | — | dts-absence (absence) | — |
| Highcharts | native | series.type=venn | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes shapes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | native | ~Venn | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:252 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.venn | dts-path (strong) | mermaid/dist/config.type.d.ts:239 |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against de2c823fa6b2.

https://chartkit.dev/features.json
