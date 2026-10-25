# Zoom (wheel / pinch / drag)

ChartKit: **native**

Zoom into a range

Matrix status: `native`. Verification: `dts-path` (strong).

'none' | 'x' | 'xy' (client interact)

Source: chartkit:packages/core/src/generated/schema.ts:1149

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
    "zoom": "x"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | none | — | dts-absence (absence) | — Brush only |
| Apache ECharts | native | dataZoom | dts-path (strong) | echarts/types/dist/shared.d.ts:12589 |
| Highcharts | native | chart.zooming | dts-path (strong) | highcharts/highcharts.d.ts:6692 |
| Plotly.js | native | layout.dragmode=zoom, config.scrollZoom | dts-path (strong) | plot-schema.json#layout.layoutAttributes.dragmode, plot-schema.json#config.scrollZoom |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictoryZoomContainer | dts-path (strong) | victory-zoom-container/lib/victory-zoom-container.d.ts:81 |
| visx | native | Zoom | dts-path (strong) | @visx/zoom/lib/Zoom.d.ts:60 |
| ApexCharts | native | chart.zoom.enabled | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2236 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~bind\|scales | dts-grep (weak) | 524:          "description" params interval bind: 'scales' |
| AG Charts | native (ent) | ~zoom | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:43 |
| amCharts 5 | native | ~zoomX\|wheelX | dts-grep (weak) | @amcharts/amcharts5/examples/xy-stacked-step/config.json:6 |
| Google Charts | native | ~explorer | dts-grep (weak) | @types/google.visualization/index.d.ts:467 explorer: {actions: ['dragToZoom']} |
| uPlot | native | Options.cursor.drag, ~setScale | dts-path (strong) | uplot/dist/uPlot.d.ts:589, 67:	/** manual batching of multiple ops (aka immediate mode that skips implicit microtask queue), ops, e.g. setScale('x', ...) && setScale('y', ...) */ |
| TradingView Lightweight Charts | native | ~handleScale | dts-grep (weak) | 997:	handleScale |
| MUI X Charts | native (pro) | ~zoom | dts-grep (weak) | @mui/x-charts-pro/index.d.ts:47 LineChartPro zoom |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~sliderFilter\|scrollbarFilter\|brushXFilter | dts-grep (weak) | @antv/g2/lib/index.d.ts:150 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 236653ac9462.

https://chartkit.dev/features.json
