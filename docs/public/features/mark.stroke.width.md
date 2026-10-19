# Line width

ChartKit: **native**

Stroke width of lines/borders

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:831

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
    "strokeWidth": 4
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.borderWidth | dts-path (strong) | chart.js/dist/types/index.d.ts:1826 |
| Recharts | native | Line.strokeWidth | dts-path (strong) | @types/react/index.d.ts:3929 |
| Apache ECharts | native | series.lineStyle.width | dts-path (strong) | echarts/types/dist/shared.d.ts:7779 |
| Highcharts | native | plotOptions.series.lineWidth | dts-path (strong) | highcharts/options/series.d.ts:1043 |
| Plotly.js | native | trace.line.width | dts-path (strong) | plot-schema.json#traces.{box,candlestick,contour,contourcarpet,histogram2dcontour,ohlc,…}.attributes.line.width |
| Nivo | native | Line.lineWidth | dts-path (strong) | @nivo/line/dist/types/types.d.ts:138 |
| Victory | native | VictoryLine.style | dts-path (strong) | victory-line/lib/victory-line.d.ts:84 |
| visx | native | LinePath.strokeWidth | dts-path (strong) | @types/react/index.d.ts:3929 |
| ApexCharts | native | stroke.width | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2652 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~strokeWidth | dts-grep (weak) | @observablehq/plot/src/channel.d.ts:47 |
| Vega-Lite | native | ~strokeWidth | dts-grep (weak) | 807:        "strokeWidth" |
| AG Charts | native | series.strokeWidth | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/commonOptions.d.ts:150 |
| amCharts 5 | native | ~strokeWidth | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/XYChart.d.ts:34 |
| Google Charts | native | LineChartOptions.lineWidth | dts-path (strong) | @types/google.visualization/index.d.ts:799 |
| uPlot | native | Options.series.width | dts-path (strong) | uplot/dist/uPlot.d.ts:929 |
| TradingView Lightweight Charts | native | ~lineWidth | dts-grep (weak) | 471:	lineWidth |
| MUI X Charts | native | ~strokeWidth | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4071 via sx / slotProps |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.xyChart | dts-path (strong) | mermaid/dist/config.type.d.ts:225 plotReservedSpacePercent etc; line width in theme |
| AntV G2 | native | ~lineWidth | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:52 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 699f05dc7c70.

https://chartkit.dev/features.json
