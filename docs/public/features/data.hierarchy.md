# Hierarchical data input

ChartKit: **partial**

Nested/parent-child data for tree types

Matrix status: `partial`. Verification: `dts-path` (strong).

treemap: label/size/group (one level)

Source: chartkit:packages/core/src/generated/schema.ts:461

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40,
      "group": "A"
    },
    {
      "quarter": "Q2",
      "units": 55,
      "group": "B"
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": "units",
    "color": "group"
  },
  "a11y": {
    "alt": "Units rose in Q2."
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
| Recharts | native | Treemap.data, ~children | dts-path (strong) | recharts/types/chart/Treemap.d.ts:60, recharts/types/zIndex/ZIndexPortal.d.ts:2 |
| Apache ECharts | native | series.data, ~children | dts-path (strong) | echarts/types/dist/shared.d.ts:11188, echarts/types/src/util/states.d.ts:82 treemap/sunburst/tree nested children |
| Highcharts | native | ~parent | dts-grep (weak) | highcharts/highcharts.src.d.ts:1100 point.parent ids |
| Plotly.js | native | trace.parents, trace.ids | dts-path (strong) | plot-schema.json#traces.{icicle,sunburst,treemap}.attributes.parents, plot-schema.json#traces.{bar,barpolar,box,candlestick,carpet,choropleth,…}.attributes.ids |
| Nivo | native | TreeMap.data, ~children | dts-path (strong) | @nivo/treemap/dist/types/types.d.ts:84, @nivo/tree/dist/types/types.d.ts:17 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | ~hierarchy | dts-grep (weak) | @visx/visx/package.json:54 d3-hierarchy |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~stratify\|treeNode | dts-grep (weak) | @observablehq/plot/src/marks/tree.d.ts:36 tree() transform from path strings |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | series.childrenKey | dts-path (strong) | ag-charts-types/dist/types/src/series/standalone/treemapOptions.d.ts:125 |
| amCharts 5 | native | ~childDataField | dts-grep (weak) | @amcharts/amcharts5/examples/hierarchy-sunburst/config.json:7 |
| Google Charts | native | ~parent | dts-grep (weak) | @types/google.visualization/index.d.ts:1625 TreeMap parent column |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.treeView | dts-path (strong) | mermaid/dist/config.type.d.ts:237 |
| AntV G2 | native | ~children | dts-grep (weak) | @antv/g2/lib/composition/view.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b2aaa2671f30.

https://chartkit.dev/features.json
