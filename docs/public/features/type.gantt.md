# Gantt

ChartKit: **native**

Tasks as bars on a time axis with dependencies

Matrix status: `native`. Verification: `dts-grep` (weak).

phase 4 extra type

Source: chartkit:packages/core/src/validate-phase4.ts:13

## ChartKit spec

```json
{
  "version": "1",
  "type": "gantt",
  "data": [
    {
      "id": "a",
      "task": "A",
      "start": "2026-03-02",
      "end": "2026-03-13"
    },
    {
      "id": "b",
      "task": "B",
      "start": "2026-04-06",
      "milestone": true,
      "depends": "a"
    }
  ],
  "a11y": {
    "alt": "B follows A."
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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 custom series example |
| Highcharts | native | series.type=gantt | dts-path (strong) | highcharts/options/abands.d.ts:1386 Highcharts Gantt (separate license) |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | plugin | — | npm (weak) | — separate ApexGantt product; core has rangeBar timelines |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 barX with x1/x2 |
| Vega-Lite | partial | mark=bar, ~x2 | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19, 941:          "description" bar with x/x2 |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | native | GanttSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/gantt/GanttSeries.d.ts:154 |
| Google Charts | native | Gantt | dts-path (strong) | @types/google.visualization/index.d.ts:1704 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.gantt | dts-path (strong) | mermaid/dist/config.type.d.ts:217 |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
