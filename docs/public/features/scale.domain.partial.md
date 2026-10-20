# One-sided domain (only min or only max)

ChartKit: **native**

Fix one end and auto the other

Matrix status: `native`. Verification: `dts-path` (strong).

either end can be null

Source: chartkit:packages/core/src/generated/schema.ts:689

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
        "domain": [
          0,
          80
        ]
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
| Chart.js | native | ~suggestedMin | dts-grep (weak) | chart.js/dist/types/index.d.ts:1210 |
| Recharts | native | YAxis.domain | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:53 ['auto', 100] / functions |
| Apache ECharts | native | yAxis.min | dts-path (strong) | echarts/types/dist/shared.d.ts:2630 min only |
| Highcharts | native | yAxis.softMin, yAxis.softMax | dts-path (strong) | highcharts/highcharts.d.ts:110582, highcharts/highcharts.d.ts:110572 |
| Plotly.js | native | layout.yaxis.autorangeoptions | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.autorangeoptions autorangeoptions.minallowed etc. |
| Nivo | native | ~min | dts-grep (weak) | @nivo/tree/package.json:36 min:'auto' |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | yaxis.min | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5049 min only or function |
| Tremor (npm) | native | LineChart.minValue | dts-path (strong) | @tremor/react/dist/index.d.ts:70 |
| Observable Plot | native | ~domain | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:197 |
| Vega-Lite | native | ~domainMin\|domainMax | dts-grep (weak) | 21743:        "domainMax" |
| AG Charts | native | ~min\?: | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineOptions.d.ts:49 |
| amCharts 5 | native | ~min\?: | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:35 |
| Google Charts | native | ~viewWindow | dts-grep (weak) | @types/google.visualization/index.d.ts:547 viewWindow.min only |
| uPlot | native | ~range | dts-grep (weak) | 131:	/** re-ranges a given min/max by a multiple of the range's magnitude (used internally to expand/snap/pad numeric y scales) */ function returning [min, max] |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.yAxis.min | dts-path (strong) | @mui/x-charts/models/axis.d.mts:467 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~domainMin | dts-grep (weak) | @antv/g2/lib/spec/scale.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 8f00db13813e.

https://chartkit.dev/features.json
