# Label collision avoidance

ChartKit: **native**

Hide or move overlapping labels

Matrix status: `native`. Verification: `runtime-probe` (strong).

A label whose box overlaps one already drawn is skipped. No separate option.

Source: packages/core/src/glyphs.ts:39

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
  "mark": {
    "labels": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — display:'auto' |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.labelLayout, series.avoidLabelOverlap | dts-path (strong) | echarts/types/dist/shared.d.ts:8361, echarts/types/dist/shared.d.ts:11264 |
| Highcharts | native | plotOptions.series.dataLabels.allowOverlap | dts-path (strong) | highcharts/options/series.d.ts:143 |
| Plotly.js | native | layout.uniformtext | dts-path (strong) | plot-schema.json#layout.layoutAttributes.uniformtext |
| Nivo | native | Bar.labelSkipWidth, Bar.labelSkipHeight | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:159, @nivo/bar/dist/types/types.d.ts:160 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~dodge\|textOverflow | dts-grep (weak) | @observablehq/plot/src/index.d.ts:51 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~avoidCollisions | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/linearGaugeOptions.d.ts:70 |
| amCharts 5 | native | ~oversizedBehavior | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/scene/SceneNode.d.ts:186 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~overlapHide\|overlapDodgeY | dts-grep (weak) | @antv/g2/lib/index.d.ts:165 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
