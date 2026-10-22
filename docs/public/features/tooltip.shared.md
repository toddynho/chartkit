# Shared (index) vs single (nearest) tooltip

ChartKit: **native**

All series at hovered x vs the nearest point

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:196

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
  "tooltip": {
    "mode": "index"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~intersect\|mode | dts-grep (weak) | chart.js/dist/types/utils.d.ts:20 interaction.mode 'index' \| 'nearest' ... |
| Recharts | native | Tooltip.shared | dts-path (strong) | recharts/types/component/Tooltip.d.ts:179 |
| Apache ECharts | native | tooltip.trigger | dts-path (strong) | echarts/types/dist/shared.d.ts:6815 'axis' \| 'item' |
| Highcharts | native | tooltip.shared, tooltip.split | dts-path (strong) | highcharts/highcharts.d.ts:107538, highcharts/highcharts.d.ts:107564 |
| Plotly.js | unknown | layout.hovermode=x unified | unverified (unknown) | — |
| Nivo | native | Line.enableSlices | dts-path (strong) | @nivo/line/dist/types/types.d.ts:181 |
| Victory | native | ~VoronoiDimension\|voronoiDimension | dts-grep (weak) | victory-voronoi-container/lib/victory-voronoi-container.d.ts:14 VictoryVoronoiContainer voronoiDimension |
| visx | native | ~showVerticalCrosshair\|snapTooltipToDatumX | dts-grep (weak) | @visx/xychart/lib/components/Tooltip.d.ts:22 xychart Tooltip |
| ApexCharts | native | tooltip.shared, tooltip.intersect | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4826, apexcharts/types/apexcharts.d.ts:4833 |
| Tremor (npm) | none | — | dts-absence (absence) | — shared index tooltip only |
| Observable Plot | native | ~pointerX\|pointer | dts-grep (weak) | @observablehq/plot/src/index.d.ts:7 tip + pointerX |
| Vega-Lite | partial | ~tooltip | dts-grep (weak) | 630:          "description" layer + selection recipe for shared |
| AG Charts | native | ~range | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:3 tooltip.range 'exact' \| 'nearest' \| number |
| amCharts 5 | native | ~snapToSeries | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/Axis.d.ts:294 |
| Google Charts | native | ~focusTarget | dts-grep (weak) | @types/google.visualization/index.d.ts:726 'category' vs 'datum' |
| uPlot | partial | Options.cursor | dts-path (strong) | uplot/dist/uPlot.d.ts:390 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~trigger | dts-grep (weak) | @mui/x-charts-pro/Heatmap/HeatmapTooltip/HeatmapTooltip.types.d.ts:20 tooltip trigger 'axis' \| 'item' |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~shared | dts-grep (weak) | @antv/g2/lib/composition/facetRect.d.ts:8 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 64e07159b6f8.

https://chartkit.dev/features.json
