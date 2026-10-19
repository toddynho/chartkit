# Pan

ChartKit: **native**

Drag to move the visible range

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:1153

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
    "pan": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | dataZoom | dts-path (strong) | echarts/types/dist/shared.d.ts:12589 inside dataZoom moveOnMouseMove |
| Highcharts | native | chart.panning | dts-path (strong) | highcharts/highcharts.d.ts:6454 |
| Plotly.js | native | layout.dragmode=pan | dts-path (strong) | plot-schema.json#layout.layoutAttributes.dragmode |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictoryZoomContainer.allowPan | dts-path (strong) | victory-zoom-container/lib/victory-zoom-container.d.ts:9 |
| visx | native | Zoom | dts-path (strong) | @visx/zoom/lib/Zoom.d.ts:60 |
| ApexCharts | native | chart.toolbar.tools.pan | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2187 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~bind\|scales | dts-grep (weak) | 524:          "description" |
| AG Charts | native (ent) | ~panKey\|enableDragging | dts-grep (weak) | ag-charts-community/dist/types/src/core/eventsHub.d.ts:239 |
| amCharts 5 | native | ~panX | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/XYChart.d.ts:49 |
| Google Charts | unknown | ~dragToPan | unverified (unknown) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 demos |
| TradingView Lightweight Charts | native | ~handleScroll | dts-grep (weak) | 993:	handleScroll |
| MUI X Charts | native (pro) | ~zoom\|panning | dts-grep (weak) | @mui/x-charts/locales/svSE.d.ts:10 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~scrollbar | dts-grep (weak) | @antv/g2/lib/index.d.ts:118 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against bdf969b7d123.

https://chartkit.dev/features.json
