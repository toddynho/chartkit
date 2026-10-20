# Tick label wrapping / truncation

ChartKit: **native**

Wrap or ellipsize long labels

Matrix status: `native`. Verification: `runtime-probe` (strong).

labelWidth and labelLines wrap tick labels on x, y, and y2, then ellipsize. Drawn on createRenderer([line]).

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
      "labelWidth": 48
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ~callback | dts-grep (weak) | chart.js/dist/types/index.d.ts:1216 return arrays for multi-line |
| Recharts | partial | XAxis.tick | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:101 custom tick component |
| Apache ECharts | native | xAxis.axisLabel.overflow, xAxis.axisLabel.width | dts-path (strong) | echarts/types/dist/shared.d.ts:7917, echarts/types/dist/shared.d.ts:7845 |
| Highcharts | native | xAxis.labels.style | dts-path (strong) | highcharts/highcharts.d.ts:108063 textOverflow ellipsis |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | partial | ~renderTick | dts-grep (weak) | @nivo/axes/dist/types/types.d.ts:21 |
| Victory | partial | VictoryAxis.tickLabelComponent | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:56 |
| visx | partial | ~Text | dts-grep (weak) | @visx/sankey/node_modules/@types/d3-shape/index.d.ts:6 @visx/text width wrapping |
| ApexCharts | native | xaxis.labels.trim, xaxis.labels.maxHeight | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4913, apexcharts/types/apexcharts.d.ts:4915 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~lineWidth\|textOverflow | dts-grep (weak) | @observablehq/plot/src/marks/text.d.ts:29 |
| Vega-Lite | native | ~labelLimit | dts-grep (weak) | 1424:        "labelLimit" |
| AG Charts | native | ~wrapping\|truncate | dts-grep (weak) | ag-charts-types/dist/types/src/chart/types.d.ts:52 |
| amCharts 5 | native | ~oversizedBehavior\|maxWidth | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/Exporting.d.ts:283 |
| Google Charts | native | ~maxTextLines | dts-grep (weak) | @types/google.visualization/index.d.ts:542 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~tickLabelStyle | dts-grep (weak) | @mui/x-charts/constants/index.d.ts:14 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | unknown | ~labelAutoEllipsis\|labelAutoWrap | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a59d27e1bde.

https://chartkit.dev/features.json
