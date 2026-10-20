# Treemap

ChartKit: **native**

Nested rectangles sized by value

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "treemap",
  "data": [
    {
      "name": "Oak",
      "size": 8,
      "group": "Wood"
    },
    {
      "name": "Steel",
      "size": 6,
      "group": "Metal"
    }
  ],
  "encoding": {
    "x": "name",
    "y": "size",
    "color": "group"
  },
  "a11y": {
    "alt": "Oak is larger."
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
| Recharts | native | Treemap | dts-path (strong) | recharts/types/chart/Treemap.d.ts:188 |
| Apache ECharts | native | series.type=treemap | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=treemap | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=treemap | dts-path (strong) | plot-schema.json#traces.treemap |
| Nivo | native | TreeMap | dts-path (strong) | @nivo/treemap/dist/types/TreeMap.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Treemap | dts-path (strong) | @visx/hierarchy/lib/hierarchies/Treemap.d.ts:45 |
| ApexCharts | native | chart.type=treemap | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 d3 hierarchy + rect (documented) |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 vega (not vega-lite) has treemap |
| AG Charts | native (ent) | series.type=treemap | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~Treemap | dts-grep (weak) | @amcharts/amcharts5/package.json:28 |
| Google Charts | native | TreeMap | dts-path (strong) | @types/google.visualization/index.d.ts:1131 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.treeView | dts-path (strong) | mermaid/dist/config.type.d.ts:237 treemap-beta diagram |
| AntV G2 | native | MarkTypes=treemap | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against da8da9d595d9.

https://chartkit.dev/features.json
