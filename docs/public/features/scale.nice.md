# Nice rounding

ChartKit: **native**

Round domain to nice values

Matrix status: `native`. Verification: `runtime-probe` (strong).

nice:false honoured since PR #16; drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:697

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
        "nice": false
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
| Chart.js | native | ~grace\|bounds | dts-grep (weak) | chart.js/dist/types/index.d.ts:1356 bounds:'ticks' / grace |
| Recharts | native | YAxis.allowDecimals, YAxis.niceTicks | dts-path (strong) | recharts/types/util/types.d.ts:814, recharts/types/cartesian/YAxis.d.ts:165 |
| Apache ECharts | partial | yAxis.splitNumber | dts-path (strong) | echarts/types/dist/shared.d.ts:2683 nice by default |
| Highcharts | native | yAxis.startOnTick, yAxis.endOnTick | dts-path (strong) | highcharts/highcharts.d.ts:110609, highcharts/highcharts.d.ts:110145 |
| Plotly.js | partial | layout.yaxis.autorange | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.autorange |
| Nivo | native | ~nice | dts-grep (weak) | @nivo/scales/dist/types/types.d.ts:40 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ~nice | dts-grep (weak) | @visx/scale/lib/index.d.ts:23 |
| ApexCharts | native | yaxis.forceNiceScale | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5042 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~nice | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:2 |
| Vega-Lite | native | ~nice | dts-grep (weak) | 1645:          "description" |
| AG Charts | native | ~nice | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:31 |
| amCharts 5 | partial | ~strictMinMax | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/axes/ValueAxis.d.ts:9 |
| Google Charts | partial | ~viewWindowMode | dts-grep (weak) | @types/google.visualization/index.d.ts:547 'pretty' |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | LineChart.yAxis.domainLimit | dts-path (strong) | @mui/x-charts/models/axis.d.mts:532 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~nice | dts-grep (weak) | @antv/g2/lib/composition/d3Projection.d.ts:1 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 24651e4fe1b9.

https://chartkit.dev/features.json
