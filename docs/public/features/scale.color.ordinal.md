# Categorical colour scale / palette

ChartKit: **native**

Map categories to a palette

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:395

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
  "theme": {
    "tokens": {
      "series": [
        "#0066cc",
        "#c45c26"
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 dataset colours; Colors plugin cycles defaults |
| Recharts | partial | Cell | dts-path (strong) | recharts/types/component/Cell.d.ts:25 per-series colours manual |
| Apache ECharts | native | color | dts-path (strong) | echarts/types/dist/shared.d.ts:7594 top-level palette |
| Highcharts | native | colors | dts-path (strong) | highcharts/highcharts.d.ts:93499 |
| Plotly.js | native | layout.colorway | dts-path (strong) | plot-schema.json#layout.layoutAttributes.colorway |
| Nivo | native | Line.colors | dts-path (strong) | @nivo/line/dist/types/types.d.ts:137 scheme name or array |
| Victory | native | VictoryChart.theme, ~colorScale | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:58, victory-group/lib/helper-methods.d.ts:16 |
| visx | native | ~scaleOrdinal | dts-grep (weak) | @visx/shape/lib/shapes/BarGroup.d.ts:48 |
| ApexCharts | native | colors | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1457 |
| Tremor (npm) | native | LineChart.colors | dts-path (strong) | @tremor/react/dist/index.d.ts:59 |
| Observable Plot | native | ~scheme\|range | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:2 |
| Vega-Lite | native | ~scheme | dts-grep (weak) | 4935:    "ColorScheme" |
| AG Charts | native | ~palette | dts-grep (weak) | ag-charts-types/dist/types/src/integratedCharts.d.ts:2 |
| amCharts 5 | native | ColorSet | dts-path (strong) | @amcharts/amcharts5/.internal/core/util/ColorSet.d.ts:75 |
| Google Charts | native | LineChartOptions.colors | dts-path (strong) | @types/google.visualization/index.d.ts:786 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~ordinal | dts-grep (weak) | @mui/x-charts/hooks/useTicks.d.ts:2 colorMap type 'ordinal' |
| Mermaid (chart-ish diagrams only) | native | ~plotColorPalette | dts-grep (weak) | mermaid/dist/diagrams/xychart/chartBuilder/interfaces.d.ts:20 |
| AntV G2 | native | ~palette\|category10 | dts-grep (weak) | @antv/g2/lib/index.d.ts:89 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 64e07159b6f8.

https://chartkit.dev/features.json
