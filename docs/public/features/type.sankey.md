# Sankey

ChartKit: **native**

Flows between nodes with width as value

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "sankey",
  "data": [
    {
      "s": "A",
      "t": "B",
      "y": 10
    },
    {
      "s": "B",
      "t": "C",
      "y": 6
    }
  ],
  "encoding": {
    "source": "s",
    "target": "t",
    "y": "y"
  },
  "a11y": {
    "alt": "Flow leaves B."
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
| Recharts | native | Sankey | dts-path (strong) | recharts/types/chart/Sankey.d.ts:225 |
| Apache ECharts | native | series.type=sankey | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=sankey | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=sankey | dts-path (strong) | plot-schema.json#traces.sankey |
| Nivo | native | Sankey | dts-path (strong) | @nivo/sankey/dist/types/Sankey.d.ts:3 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Sankey | dts-path (strong) | @visx/sankey/lib/Sankey.d.ts:52 |
| ApexCharts | plugin | — | npm (weak) | — separate ApexSankey product |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | series.type=sankey | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~Sankey | dts-grep (weak) | @amcharts/amcharts5/package.json:29 |
| Google Charts | native | Sankey | dts-path (strong) | @types/google.visualization/index.d.ts:1783 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | SankeyChart | dts-path (strong) | @mui/x-charts-pro/SankeyChart/SankeyChart.d.mts:31 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.sankey | dts-path (strong) | mermaid/dist/config.type.d.ts:233 |
| AntV G2 | native | MarkTypes=sankey | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
