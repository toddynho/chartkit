# Dashed / dotted lines

ChartKit: **native**

Dash patterns on series lines

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:150

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
      "dash": "dashed"
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
| Chart.js | native | ChartConfiguration.data.datasets.borderDash | dts-path (strong) | chart.js/dist/types/index.d.ts:1919 |
| Recharts | native | Line.strokeDasharray | dts-path (strong) | @types/react/index.d.ts:3923 |
| Apache ECharts | native | series.lineStyle.type | dts-path (strong) | echarts/types/dist/shared.d.ts:7782 |
| Highcharts | native | plotOptions.series.dashStyle | dts-path (strong) | highcharts/options/series.d.ts:805 |
| Plotly.js | native | trace.line.dash | dts-path (strong) | plot-schema.json#traces.{contour,contourcarpet,histogram2dcontour,ohlc,scatter,scatter3d,…}.attributes.line.dash |
| Nivo | partial | Line.layers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:171 custom layer / theme |
| Victory | native | VictoryLine.style | dts-path (strong) | victory-line/lib/victory-line.d.ts:84 |
| visx | native | LinePath.strokeDasharray | dts-path (strong) | @types/react/index.d.ts:3923 |
| ApexCharts | native | stroke.dashArray | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2653 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~strokeDasharray | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:357 |
| Vega-Lite | native | ~strokeDash | dts-grep (weak) | 736:        "strokeDash" |
| AG Charts | native | series.lineDash | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/commonOptions.d.ts:170 |
| amCharts 5 | native | ~strokeDasharray | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/XYChart.d.ts:37 |
| Google Charts | partial | ~lineDashStyle | dts-grep (weak) | @types/google.visualization/index.d.ts:761 certainty role / series lineDashStyle |
| uPlot | native | Options.series.dash | dts-path (strong) | uplot/dist/uPlot.d.ts:941 |
| TradingView Lightweight Charts | native | ~lineStyle\|LineStyle | dts-grep (weak) | 73:export declare enum LineStyle { |
| MUI X Charts | partial | ~strokeDasharray | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4065 via sx/slotProps |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~lineDash | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:207 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
