# Point / ordinal scale

ChartKit: **native**

Discrete positions without bands

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
        "type": "point"
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
| Chart.js | partial | ~CategoryScale | dts-grep (weak) | chart.js/dist/types/index.d.ts:3295 offset:false |
| Recharts | native | XAxis.scale=point | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:84 |
| Apache ECharts | native | xAxis.boundaryGap | dts-path (strong) | echarts/types/dist/shared.d.ts:2679 category with boundaryGap false |
| Highcharts | partial | xAxis.categories | dts-path (strong) | highcharts/highcharts.d.ts:108166 |
| Plotly.js | partial | layout.xaxis.type=category | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.type |
| Nivo | native | ~point | dts-grep (weak) | @nivo/tree/node_modules/@types/d3-hierarchy/index.d.ts:265 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | ~scalePoint | dts-grep (weak) | @visx/scale/lib/index.d.ts:2 |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~point | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:12 |
| Vega-Lite | native | ~point | dts-grep (weak) | 350:              "description" |
| AG Charts | partial | ~category | dts-grep (weak) | ag-charts-types/dist/types/src/main-scene.d.ts:13 |
| amCharts 5 | partial | CategoryAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/CategoryAxis.d.ts:108 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | LineChart.xAxis.scaleType=point | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~point | dts-grep (weak) | @antv/g2/lib/index.d.ts:68 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
