# Grid line style (dash, colour, width)

ChartKit: **native**

Dash pattern, colour and width of grid lines

Matrix status: `native`. Verification: `dts-path` (strong).

solid | dashed | dotted

Source: chartkit:packages/core/src/generated/schema.ts:1023

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
    "y": {
      "grid": true
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~borderDash\|tickBorderDash | dts-grep (weak) | chart.js/dist/types/index.d.ts:1865 grid.color / lineWidth / tickBorderDash |
| Recharts | native | CartesianGrid.strokeDasharray | dts-path (strong) | recharts/types/cartesian/CartesianGrid.d.ts:155 |
| Apache ECharts | native | yAxis.splitLine.lineStyle | dts-path (strong) | echarts/types/dist/shared.d.ts:2834 |
| Highcharts | native | yAxis.gridLineDashStyle | dts-path (strong) | highcharts/highcharts.d.ts:110170 |
| Plotly.js | native | layout.yaxis.griddash | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.griddash |
| Nivo | partial | ~theme | dts-grep (weak) | @nivo/tree/dist/types/types.d.ts:6 theme.grid.line |
| Victory | native | VictoryAxis.style | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:46 |
| visx | native | GridRows.strokeDasharray | dts-path (strong) | @visx/grid/lib/types.d.ts:33 |
| ApexCharts | native | grid.strokeDashArray, grid.borderColor | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5269, apexcharts/types/apexcharts.d.ts:5268 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~strokeDasharray\|strokeOpacity | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:357 |
| Vega-Lite | native | ~gridDash\|gridColor | dts-grep (weak) | 1186:        "gridColor" |
| AG Charts | native | ~lineDash | dts-grep (weak) | ag-charts-types/dist/types/src/presets/gauge/radialGaugeOptions.d.ts:5 |
| amCharts 5 | native | ~strokeDasharray | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/XYChart.d.ts:37 |
| Google Charts | native | ~gridlines\|color | dts-grep (weak) | @types/google.visualization/index.d.ts:372 |
| uPlot | native | Options.axes.grid.dash | dts-path (strong) | uplot/dist/uPlot.d.ts:1037 |
| TradingView Lightweight Charts | native | ~LineStyle\|style | dts-grep (weak) | 71: * Represents the possible line styles. |
| MUI X Charts | native | ~gridClasses\|sx | dts-grep (weak) | @mui/x-charts/index.d.ts:11 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~gridLineDash | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:207 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7eff21f18449.

https://chartkit.dev/features.json
