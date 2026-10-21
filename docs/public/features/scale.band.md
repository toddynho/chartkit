# Band / category scale

ChartKit: **native**

Discrete categories with bands

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:683

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
    "x": {
      "field": "quarter",
      "scale": {
        "type": "band"
      }
    },
    "y": "units"
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
| Chart.js | native | ~CategoryScale | dts-grep (weak) | chart.js/dist/types/index.d.ts:3295 |
| Recharts | native | XAxis.type=category | dts-path (strong) | @types/react/index.d.ts:3709 |
| Apache ECharts | native | xAxis.type=category | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 |
| Highcharts | native | xAxis.type=category, xAxis.categories | dts-path (strong) | highcharts/highcharts.d.ts:108788, highcharts/highcharts.d.ts:108166 |
| Plotly.js | native | layout.xaxis.type=category | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.type |
| Nivo | native | Bar.indexScale, ~band | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:146, @nivo/funnel/dist/types/hooks.d.ts:6 |
| Victory | native | VictoryAxis.tickValues, ~categories | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:60, victory-stack/lib/victory-stack.d.ts:6 |
| visx | native | ~scaleBand | dts-grep (weak) | @visx/shape/lib/shapes/BarGroupHorizontal.d.ts:3 |
| ApexCharts | native | xaxis.categories | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4902 |
| Tremor (npm) | native | LineChart.index | dts-path (strong) | @tremor/react/dist/index.d.ts:58 |
| Observable Plot | native | ~band | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:188 |
| Vega-Lite | native | ~band | dts-grep (weak) | 683:          "description" |
| AG Charts | native | ~category | dts-grep (weak) | ag-charts-types/dist/types/src/main-scene.d.ts:13 |
| amCharts 5 | native | CategoryAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/CategoryAxis.d.ts:108 |
| Google Charts | native | ~string | dts-grep (weak) | @types/google.visualization/index.d.ts:3 string domain column |
| uPlot | partial | ~values | dts-grep (weak) | 82:	/** sets the legend to the values of the specified idx */ category labels via axis values fn |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.xAxis.scaleType=band | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 x-axis [a, b, c] |
| AntV G2 | native | ~band | dts-grep (weak) | @antv/g2/lib/index.d.ts:93 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 1eae17b953e2.

https://chartkit.dev/features.json
