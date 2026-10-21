# Include zero

ChartKit: **native**

Force or allow the scale to include zero

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:693

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
        "zero": true
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
| Chart.js | native | ~beginAtZero | dts-grep (weak) | chart.js/dist/types/index.d.ts:3313 |
| Recharts | partial | YAxis.domain | dts-path (strong) | recharts/types/cartesian/YAxis.d.ts:53 [0, 'auto'] |
| Apache ECharts | native | yAxis.scale | dts-path (strong) | echarts/types/dist/shared.d.ts:2736 scale:true means do not force zero |
| Highcharts | partial | yAxis.min | dts-path (strong) | highcharts/highcharts.d.ts:110317 |
| Plotly.js | native | layout.yaxis.rangemode=tozero | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.rangemode |
| Nivo | partial | ~min | dts-grep (weak) | @nivo/tree/package.json:36 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | ~zero | dts-grep (weak) | @visx/sankey/node_modules/@types/d3-shape/index.d.ts:133 |
| ApexCharts | native | yaxis.forceNiceScale | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5042 |
| Tremor (npm) | partial | LineChart.autoMinValue | dts-path (strong) | @tremor/react/dist/index.d.ts:69 |
| Observable Plot | native | ~zero | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:260 |
| Vega-Lite | native | ~zero | dts-grep (weak) | 524:          "description" |
| AG Charts | partial | ~min\?: | dts-grep (weak) | ag-charts-types/dist/types/src/presets/sparkline/sparklineOptions.d.ts:49 |
| amCharts 5 | partial | ~min\?: | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:35 |
| Google Charts | partial | ~viewWindow | dts-grep (weak) | @types/google.visualization/index.d.ts:547 |
| uPlot | partial | ~range | dts-grep (weak) | 131:	/** re-ranges a given min/max by a multiple of the range's magnitude (used internally to expand/snap/pad numeric y scales) */ |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | partial | LineChart.yAxis.min | dts-path (strong) | @mui/x-charts/models/axis.d.mts:467 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~zero | dts-grep (weak) | @antv/g2/lib/api/utils.d.ts:12 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
