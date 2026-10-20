# Tooltip on hover

ChartKit: **native**

Show a tooltip with values on hover

Matrix status: `native`. Verification: `dts-path` (strong).

drawn by @chartkitdev/core/interact (client)

Source: chartkit:packages/core/src/generated/schema.ts:192

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
  "tooltip": {
    "show": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~tooltip | dts-grep (weak) | chart.js/dist/types/index.d.ts:77 plugins.tooltip |
| Recharts | native | Tooltip | dts-path (strong) | recharts/types/component/Tooltip.d.ts:236 |
| Apache ECharts | native | tooltip.show | dts-path (strong) | echarts/types/dist/shared.d.ts:8062 |
| Highcharts | native | tooltip.enabled | dts-path (strong) | highcharts/highcharts.d.ts:107302 |
| Plotly.js | native | layout.hovermode | dts-path (strong) | plot-schema.json#layout.layoutAttributes.hovermode |
| Nivo | native | Line.enableSlices, Line.tooltip | dts-path (strong) | @nivo/line/dist/types/types.d.ts:181, @nivo/line/dist/types/types.d.ts:165 |
| Victory | native | VictoryTooltip | dts-path (strong) | victory-tooltip/lib/victory-tooltip.d.ts:66 |
| visx | native | Tooltip, TooltipWithBounds | dts-path (strong) | @visx/tooltip/lib/tooltips/Tooltip.d.ts:32, @visx/tooltip/lib/tooltips/TooltipWithBounds.d.ts:7 |
| ApexCharts | native | tooltip.enabled | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4824 |
| Tremor (npm) | native | LineChart.showTooltip | dts-path (strong) | @tremor/react/dist/index.d.ts:66 |
| Observable Plot | native | tip | dts-path (strong) | @observablehq/plot/src/marks/tip.d.ts:110 tip mark / tip:true |
| Vega-Lite | native | ~tooltip | dts-grep (weak) | 630:          "description" |
| AG Charts | native | ~tooltip | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:41 |
| amCharts 5 | native | Tooltip | dts-path (strong) | @amcharts/amcharts5/.internal/core/render/Tooltip.d.ts:135 |
| Google Charts | native | ~tooltip | dts-grep (weak) | @types/google.visualization/index.d.ts:386 |
| uPlot | partial | Options.legend.live | dts-path (strong) | uplot/dist/uPlot.d.ts:279 cursor + live legend; tooltip is a plugin demo |
| TradingView Lightweight Charts | plugin | ~subscribeCrosshairMove | dts-grep (weak) | 1720:	 * chart.subscribeCrosshairMove(myCrosshairMoveHandler); tooltip built in user code (official example) |
| MUI X Charts | native | ChartsTooltip | dts-path (strong) | @mui/x-charts/ChartsTooltip/ChartsTooltip.d.mts:21 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — Mermaid charts have no hover tooltip |
| AntV G2 | native | ~tooltip | dts-grep (weak) | @antv/g2/lib/index.d.ts:142 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
