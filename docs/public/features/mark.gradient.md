# Gradient fills

ChartKit: **native**

Linear/radial gradient fills on areas/bars

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:827

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
    "gradient": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ~CanvasGradient | dts-grep (weak) | chart.js/dist/types/color.d.ts:1 pass a canvas gradient object |
| Recharts | unknown | ~defs | unverified (unknown) | — SVG <defs> linearGradient manually |
| Apache ECharts | native | ~LinearGradient | dts-grep (weak) | echarts/types/src/visual/helper.d.ts:9 new echarts.graphic.LinearGradient |
| Highcharts | native | ~linearGradient | dts-grep (weak) | highcharts/highcharts-autoload.src.d.ts:208 color.linearGradient |
| Plotly.js | native | trace.fillgradient | dts-path (strong) | plot-schema.json#traces.{scatter}.attributes.fillgradient |
| Nivo | native | Line.defs, Line.fill | dts-path (strong) | @nivo/core/index.d.ts:71, @nivo/core/index.d.ts:75 defs + fill rules |
| Victory | partial | VictoryArea.style | dts-path (strong) | victory-area/lib/victory-area.d.ts:8 url(#gradient) via svg defs |
| visx | native | LinearGradient, RadialGradient | dts-path (strong) | @visx/gradient/lib/gradients/LinearGradient.d.ts:35, @visx/gradient/lib/gradients/RadialGradient.d.ts:4 |
| ApexCharts | native | fill.gradient | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4563 |
| Tremor (npm) | partial | AreaChart.showGradient | dts-path (strong) | @tremor/react/dist/index.d.ts:95 on/off only |
| Observable Plot | partial | ~fill | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:5 url() refs; no gradient helper |
| Vega-Lite | native | ~gradient | dts-grep (weak) | 251:              "$ref" |
| AG Charts | native | ~gradient | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:26 fill gradient options |
| amCharts 5 | native | LinearGradient, RadialGradient | dts-path (strong) | @amcharts/amcharts5/.internal/core/render/gradients/LinearGradient.d.ts:20, @amcharts/amcharts5/.internal/core/render/gradients/RadialGradient.d.ts:28 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | partial | ~fill | dts-grep (weak) | 303:		export type Fill   = CSSStyleDeclaration['background']  \| ((self fill: (u, si) => CanvasGradient |
| TradingView Lightweight Charts | native | ~topColor\|bottomColor | dts-grep (weak) | 419:	topColor? area gradient top/bottom colours |
| MUI X Charts | partial | ~gradient | dts-grep (weak) | @mui/x-charts/hooks/useChartGradientId.d.ts:3 gradient on color scale / svg defs |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~linear\|gradient | dts-grep (weak) | @antv/g2/lib/index.d.ts:91 color string 'l(0) 0:#fff 1:#000' |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against e79729672133.

https://chartkit.dev/features.json
