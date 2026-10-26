# Overview navigator / range slider

ChartKit: **native**

Mini-chart or slider to choose the visible window

Matrix status: `native`. Verification: `runtime-probe` (strong).

interaction.navigator is true or { height }. The client mounts an overview and a keyboard range slider. The server SVG records data-ck-nav and does not include the control. A type with no x window warns CK3034. A height outside 28 to 96 warns CK3035.

Source: packages/core/src/interact-extra.ts

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
  "interaction": {
    "navigator": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | Brush | dts-path (strong) | recharts/types/cartesian/Brush.d.ts:111 Brush with mini chart children |
| Apache ECharts | native | SliderDataZoomComponentOption | dts-path (strong) | echarts/types/dist/shared.d.ts:10769 dataZoom type slider |
| Highcharts | native | navigator.enabled, rangeSelector | dts-path (strong) | highcharts/highcharts.d.ts:90060, highcharts/highcharts.d.ts:93684 |
| Plotly.js | native | layout.xaxis.rangeslider | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.rangeslider |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 VictoryBrushContainer second chart |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | partial | chart.brush | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1917 synced brush chart |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~navigator | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:31 |
| amCharts 5 | native | ~Scrollbar\|XYChartScrollbar | dts-grep (weak) | @amcharts/amcharts5/xy.d.ts:2 |
| Google Charts | native | ~ChartRangeFilter\|ControlWrapper | dts-grep (weak) | @types/google.visualization/index.d.ts:1355 dashboard ChartRangeFilter control |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 demo |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | ~ChartsZoomSlider | dts-grep (weak) | @mui/x-charts-pro/index.d.ts:48 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~slider | dts-grep (weak) | @antv/g2/lib/index.d.ts:116 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
