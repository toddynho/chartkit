# Glow / shadow effects

ChartKit: **native**

Drop shadows or glow on series

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:835

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
    "glow": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 plugin drawing ctx.shadow* |
| Recharts | partial | ~filter | dts-grep (weak) | recharts/types/hooks.d.ts:336 SVG filter manually |
| Apache ECharts | native | series.lineStyle.shadowBlur | dts-path (strong) | echarts/types/dist/shared.d.ts:7623 |
| Highcharts | native | plotOptions.series.shadow | dts-path (strong) | highcharts/options/series.d.ts:1243 |
| Plotly.js | unknown | — | conflict (unknown) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | partial | VictoryLine.style | dts-path (strong) | victory-line/lib/victory-line.d.ts:84 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.dropShadow | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1830 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | series.shadow | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:36 |
| amCharts 5 | native | ~shadowBlur | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/scene/SceneNode.d.ts:178 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~shadowBlur | dts-grep (weak) | @antv/g2/lib/spec/interaction.d.ts:94 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against da8da9d595d9.

https://chartkit.dev/features.json
