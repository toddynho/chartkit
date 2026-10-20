# Canvas output

ChartKit: **partial**

Renders to 2D canvas

Matrix status: `partial`. Verification: `dts-path` (strong).

Line, stacked-area, scatter, bar, heatmap, and candlestick. Axes, legend, title, and annotations stay SVG. Marks are painted from the sampled geometry. auto from 100000 rows. Other types stay SVG and warn CK3033.

Source: chartkit:packages/core/src/generated/schema.ts:82

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
  "render": "canvas"
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~CanvasRenderingContext2D | dts-grep (weak) | chart.js/dist/types/index.d.ts:502 |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | ~canvas | dts-grep (weak) | echarts/types/src/coord/View.d.ts:60 |
| Highcharts | partial | ~boostThreshold | dts-grep (weak) | highcharts/highcharts.src.d.ts:5529 SVG by default; boost module draws to WebGL/canvas (modules/boost-canvas) |
| Plotly.js | none | — | dts-absence (absence) | — SVG + WebGL |
| Nivo | native | ResponsiveLineCanvas, ~Canvas | dts-path (strong) | @nivo/line/dist/types/ResponsiveLineCanvas.d.ts:4, @nivo/tree/dist/types/types.d.ts:86 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | plugin | — | npm (weak) | — renderer 'canvas' |
| AG Charts | native | ~canvas | dts-grep (weak) | ag-charts-enterprise/dist/types/src/charts/topologyChart.d.ts:2 |
| amCharts 5 | native | ~canvas | dts-grep (weak) | @amcharts/amcharts5/package.json:5 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | ~CanvasRenderingContext2D | dts-grep (weak) | 22:	readonly ctx |
| TradingView Lightweight Charts | native | ~canvas | dts-grep (weak) | 3:import { CanvasRenderingTarget2D } from 'fancy-canvas'; |
| MUI X Charts | unknown | — | conflict (unknown) | — SVG |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~canvas | dts-grep (weak) | @antv/g2/lib/data/wordCloud.d.ts:94 default G canvas renderer |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against fb308ab4f88e.

https://chartkit.dev/features.json
