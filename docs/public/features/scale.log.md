# Logarithmic scale

ChartKit: **native**

Log axis

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
    "x": "quarter",
    "y": {
      "field": "units",
      "scale": {
        "type": "log"
      }
    }
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
| Chart.js | native | ~LogarithmicScale | dts-grep (weak) | chart.js/dist/types/index.d.ts:3356 |
| Recharts | native | YAxis.scale=log | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:69 |
| Apache ECharts | native | yAxis.type=log | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 |
| Highcharts | native | yAxis.type=logarithmic | dts-path (strong) | highcharts/highcharts.d.ts:110754 |
| Plotly.js | native | layout.yaxis.type=log | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.type |
| Nivo | native | ~LogScale | dts-grep (weak) | @nivo/scales/dist/types/symlogScale.d.ts:2 |
| Victory | native | ~log | dts-grep (weak) | victory-core/src/victory-util/immutable-types.d.ts:110 |
| visx | native | ~scaleLog | dts-grep (weak) | @visx/scale/lib/index.d.ts:7 |
| ApexCharts | native | yaxis.logarithmic | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5038 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~"log" | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:212 |
| Vega-Lite | native | ~"log" | dts-grep (weak) | 21381:            "log", |
| AG Charts | native | ~"log" | dts-grep (weak) | ag-charts-community/dist/types/src/scale/logScale.d.ts:5 |
| amCharts 5 | native | ~logarithmic | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis.d.ts:45 |
| Google Charts | native | ~logScale | dts-grep (weak) | @types/google.visualization/index.d.ts:532 |
| uPlot | native | ~distr | dts-grep (weak) | 612:		export const enum Distr { distr: 3 (log) |
| TradingView Lightweight Charts | native | ~Logarithmic | dts-grep (weak) | 151:	 * Price scale shows prices. Price range changes logarithmically. PriceScaleMode.Logarithmic |
| MUI X Charts | native | LineChart.yAxis.scaleType=log | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~log | dts-grep (weak) | @antv/g2/lib/index.d.ts:24 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
