# Grouped bar

ChartKit: **native**

Several series side by side per category

Matrix status: `native`. Verification: `dts-path` (strong).

series split, unstacked

Source: chartkit:packages/core/src/generated/schema.ts:443

## ChartKit spec

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    {
      "lane": "A",
      "stops": 12,
      "group": "A"
    },
    {
      "lane": "C",
      "stops": 15,
      "group": "B"
    }
  ],
  "encoding": {
    "x": "lane",
    "y": "stops",
    "series": "group"
  },
  "a11y": {
    "alt": "Lane C has more."
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
| Chart.js | native | ChartTypeRegistry.bar | dts-path (strong) | chart.js/dist/types/index.d.ts:3707 multiple datasets |
| Recharts | native | Bar | dts-path (strong) | recharts/types/cartesian/Bar.d.ts:352 multiple Bar children |
| Apache ECharts | native | series.type=bar | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 multiple bar series |
| Highcharts | native | series.type=column | dts-path (strong) | highcharts/options/abands.d.ts:1386 multiple series |
| Plotly.js | native | layout.barmode=group | dts-path (strong) | plot-schema.json#layout.layoutAttributes.barmode |
| Nivo | native | Bar.groupMode=grouped | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:167 |
| Victory | native | VictoryGroup, VictoryGroup.offset | dts-path (strong) | victory-group/lib/victory-group.d.ts:13, victory-group/lib/victory-group.d.ts:9 |
| visx | native | BarGroup, AnimatedBarGroup | dts-path (strong) | @visx/shape/lib/shapes/BarGroup.d.ts:56, @visx/xychart/lib/components/series/AnimatedBarGroup.d.ts:3 |
| ApexCharts | native | chart.type=bar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | BarChart | dts-path (strong) | @tremor/react/dist/index.d.ts:105 multiple categories |
| Observable Plot | native | barY, ~fx | dts-path (strong) | @observablehq/plot/src/marks/bar.d.ts:203, @observablehq/plot/src/scales.d.ts:151 facet fx or dodge via x + fx |
| Vega-Lite | native | ~xOffset | dts-grep (weak) | 5161:        "xOffset" encoding.xOffset |
| AG Charts | native | series.grouped | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:106 |
| amCharts 5 | native | ColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:33 clustered by default |
| Google Charts | native | ColumnChart | dts-path (strong) | @types/google.visualization/index.d.ts:710 |
| uPlot | partial | ~bars | dts-grep (weak) | 713:		export const enum BarsPathBuilderFacetUnit { demo grouped bars via multiple series and offsets |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | BarChart | dts-path (strong) | @mui/x-charts/BarChart/BarChart.d.mts:72 multiple series |
| Mermaid (chart-ish diagrams only) | partial | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 multiple bar lines overlap rather than group |
| AntV G2 | native | ~dodgeX | dts-grep (weak) | @antv/g2/lib/index.d.ts:30 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 24651e4fe1b9.

https://chartkit.dev/features.json
