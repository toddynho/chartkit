# Sunburst

ChartKit: **native**

Radial hierarchy

Matrix status: `native`. Verification: `dts-path` (strong).

Concentric rings from nested children, encoding.path, or encoding.id and encoding.parent. Loaded from @chartkitdev/core/charts/sunburst.

Source: chartkit:packages/core/src/charts/sunburst.ts:1

## ChartKit spec

```json
{
  "version": "1",
  "type": "sunburst",
  "data": [
    {
      "name": "A",
      "children": [
        {
          "name": "B",
          "value": 3
        },
        {
          "name": "C",
          "value": 1
        }
      ]
    }
  ],
  "a11y": {
    "alt": "B leads A."
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
| Chart.js | none | — | dts-absence (absence) | — no maintained sunburst controller found on npm |
| Recharts | native | SunburstChart | dts-path (strong) | recharts/types/chart/SunburstChart.d.ts:146 |
| Apache ECharts | native | series.type=sunburst | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=sunburst | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=sunburst | dts-path (strong) | plot-schema.json#traces.sunburst |
| Nivo | native | Sunburst | dts-path (strong) | @nivo/sunburst/dist/types/Sunburst.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | Partition | dts-path (strong) | @visx/hierarchy/lib/hierarchies/Partition.d.ts:26 with radial layout |
| ApexCharts | native | chart.type=sunburst | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | series.type=sunburst | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~Sunburst | dts-grep (weak) | @amcharts/amcharts5/hierarchy.d.ts:10 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=partition | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 sunburst via partition + polar (extension) |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 2e11cdd3e2dc.

https://chartkit.dev/features.json
