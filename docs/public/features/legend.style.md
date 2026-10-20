# Legend item styling

ChartKit: **native**

Marker shape, size, font, spacing

Matrix status: `native`. Verification: `dts-path` (strong).

symbol and per-series symbols.

Source: chartkit:packages/core/src/generated/schema.ts:215

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
  "legend": {
    "symbol": "circle"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~boxWidth\|usePointStyle | dts-grep (weak) | chart.js/dist/types/index.d.ts:2354 |
| Recharts | native | Legend.iconType, Legend.iconSize | dts-path (strong) | recharts/types/component/DefaultLegendContent.d.ts:35, recharts/types/component/DefaultLegendContent.d.ts:31 |
| Apache ECharts | native | legend.itemWidth, legend.icon | dts-path (strong) | echarts/types/dist/shared.d.ts:4365, echarts/types/dist/shared.d.ts:4290 |
| Highcharts | native | legend.itemStyle, legend.symbolRadius | dts-path (strong) | highcharts/highcharts.d.ts:13500, highcharts/highcharts.d.ts:13624 |
| Plotly.js | native | layout.legend.font, layout.legend.itemsizing | dts-path (strong) | plot-schema.json#layout.layoutAttributes.legend.font, plot-schema.json#layout.layoutAttributes.legend.itemsizing |
| Nivo | native | ~symbolShape\|symbolSize | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:15 |
| Victory | native | VictoryLegend.symbolSpacer, VictoryLegend.style | dts-path (strong) | victory-legend/lib/victory-legend.d.ts:23, victory-legend/lib/victory-legend.d.ts:20 |
| visx | native | LegendOrdinal.shape, LegendOrdinal.shapeWidth | dts-path (strong) | @visx/legend/lib/legends/Legend/index.d.ts:39, @visx/legend/lib/legends/Legend/index.d.ts:15 |
| ApexCharts | native | legend.markers.size, legend.fontSize | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4617, apexcharts/types/apexcharts.d.ts:4600 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~swatchSize\|swatchWidth | dts-grep (weak) | @observablehq/plot/src/legends.d.ts:117 |
| Vega-Lite | native | ~symbolType\|labelFontSize | dts-grep (weak) | 1381:        "labelFontSize" |
| AG Charts | native | ~marker\|maxWidth | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:86 |
| amCharts 5 | native | ~markerRectangles\|itemContainers | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/Legend.d.ts:118 |
| Google Charts | native | ~textStyle | dts-grep (weak) | @types/google.visualization/index.d.ts:404 |
| uPlot | partial | Options.legend.markers | dts-path (strong) | uplot/dist/uPlot.d.ts:283 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | ~markGap\|itemGap | unverified (unknown) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~itemMarker | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:305 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
