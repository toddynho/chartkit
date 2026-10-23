# Missing values / gaps

ChartKit: **native**

Nulls render as gaps, with an option to connect them

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:839

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
  "mark": {
    "connectNulls": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~spanGaps | dts-grep (weak) | chart.js/dist/types/index.d.ts:211 |
| Recharts | native | Line.connectNulls | dts-path (strong) | recharts/types/shape/Curve.d.ts:47 |
| Apache ECharts | native | series.connectNulls | dts-path (strong) | echarts/types/dist/shared.d.ts:11106 |
| Highcharts | native | plotOptions.series.connectNulls | dts-path (strong) | highcharts/options/series.d.ts:733 |
| Plotly.js | native | trace.connectgaps | dts-path (strong) | plot-schema.json#traces.{contour,heatmap,scatter,scatter3d,scattercarpet,scattergeo,…}.attributes.connectgaps |
| Nivo | native | ~enableSlices\|null | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:47 null y values create gaps; no connect option |
| Victory | partial | ~null | dts-grep (weak) | victory-scatter/lib/victory-scatter.d.ts:68 null data creates gaps |
| visx | native | LinePath.defined | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:41 |
| ApexCharts | native | stroke, ~connectNulls\|NullDataPoints | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1491, apexcharts/types/apexcharts.d.ts:4663 |
| Tremor (npm) | native | LineChart.connectNulls | dts-path (strong) | @tremor/react/dist/index.d.ts:128 |
| Observable Plot | native | ~defined\|NaN | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:232 undefined values create gaps |
| Vega-Lite | native | ~invalid | dts-grep (weak) | 515:        "invalid" mark.invalid / config.mark.invalid: 'filter' \| 'break-paths-show-domains' ... |
| AG Charts | native | series.connectMissingData | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:42 |
| amCharts 5 | native | ~connect | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:21 LineSeries connect / autoGapCount |
| Google Charts | native | LineChartOptions.interpolateNulls | dts-path (strong) | @types/google.visualization/index.d.ts:797 |
| uPlot | native | Options.series.spanGaps | dts-path (strong) | uplot/dist/uPlot.d.ts:903 |
| TradingView Lightweight Charts | native | ~WhitespaceData | dts-grep (weak) | 1157:export interface CustomData<HorzScaleItem = Time> extends CustomSeriesWhitespaceData<HorzScaleItem> { whitespace points create gaps |
| MUI X Charts | native | LineChart.series.connectNulls | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:87 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~connect | dts-grep (weak) | @antv/g2/lib/index.d.ts:79 line connect option |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 32e6d8403882.

https://chartkit.dev/features.json
