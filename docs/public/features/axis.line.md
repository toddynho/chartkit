# Axis line styling

ChartKit: **native**

Visibility, colour and width of the axis baseline

Matrix status: `native`. Verification: `runtime-probe` (strong).

The baseline is off until line is true or { show, color, width, dash }. Dash is solid, dashed, or dotted. Drawn on createRenderer([line]).

Source: packages/core/src/generated/schema.ts:1044

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
  "axes": {
    "x": {
      "line": {
        "show": true,
        "dash": "dashed",
        "width": 1.5
      }
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~border | dts-grep (weak) | chart.js/dist/types/index.d.ts:1632 scales.x.border |
| Recharts | native | XAxis.axisLine | dts-path (strong) | recharts/types/util/types.d.ts:776 |
| Apache ECharts | native | xAxis.axisLine.show, xAxis.axisLine.lineStyle | dts-path (strong) | echarts/types/dist/shared.d.ts:2752, echarts/types/dist/shared.d.ts:2758 |
| Highcharts | native | xAxis.lineWidth, xAxis.lineColor | dts-path (strong) | highcharts/highcharts.d.ts:108317, highcharts/highcharts.d.ts:108309 |
| Plotly.js | native | layout.xaxis.showline, layout.xaxis.linecolor | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.showline, plot-schema.json#layout.layoutAttributes.xaxis.linecolor |
| Nivo | native | ~domain | dts-grep (weak) | @nivo/geo/index.d.ts:104 theme.axis.domain.line |
| Victory | native | VictoryAxis.style | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:46 |
| visx | native | AxisBottom.hideAxisLine, AxisBottom.stroke | dts-path (strong) | @visx/axis/lib/types.d.ts:30, @visx/axis/lib/types.d.ts:53 |
| ApexCharts | native | xaxis.axisBorder.show, xaxis.axisBorder.color | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4948, apexcharts/types/apexcharts.d.ts:4949 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~frame\|ruleY | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:299 axis line via frame/rule |
| Vega-Lite | native | ~domain\|domainColor | dts-grep (weak) | 524:          "description" |
| AG Charts | native | ~line | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:16 |
| amCharts 5 | native | ~strokeOpacity | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/ColumnSeries.d.ts:55 |
| Google Charts | native | ~baselineColor | dts-grep (weak) | @types/google.visualization/index.d.ts:527 |
| uPlot | native | Options.axes.border | dts-path (strong) | uplot/dist/uPlot.d.ts:1126 |
| TradingView Lightweight Charts | native | ~borderVisible\|borderColor | dts-grep (weak) | 513:	crosshairMarkerBorderColor |
| MUI X Charts | native | ~disableLine\|axisLine | dts-grep (weak) | @mui/x-charts/ChartsYAxis/utilities.d.ts:6 |
| Mermaid (chart-ish diagrams only) | native | ~showAxisLine\|axisLineWidth | dts-grep (weak) | mermaid/dist/config.type.d.ts:1137 |
| AntV G2 | native | ~line\|lineStroke | dts-grep (weak) | @antv/g2/lib/index.d.ts:12 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
