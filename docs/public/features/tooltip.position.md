# Tooltip positioning / follow cursor

ChartKit: **native**

Fixed, follow-cursor or anchored placement

Matrix status: `native`. Verification: `runtime-probe` (strong).

auto, top, bottom, left, or right. The interaction runtime places the tooltip.

Source: packages/core/src/interact.ts

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
    "position": "top"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~position\|xAlign | dts-grep (weak) | chart.js/dist/types/layout.d.ts:3 tooltip.position + custom positioners |
| Recharts | native | Tooltip.position, Tooltip.offset | dts-path (strong) | recharts/types/component/Tooltip.d.ts:158, recharts/types/component/Tooltip.d.ts:142 |
| Apache ECharts | native | tooltip.position, tooltip.confine | dts-path (strong) | echarts/types/dist/shared.d.ts:8086, echarts/types/dist/shared.d.ts:8087 |
| Highcharts | native | tooltip.positioner, tooltip.followPointer | dts-path (strong) | highcharts/highcharts.d.ts:107507, highcharts/highcharts.d.ts:107322 |
| Plotly.js | unknown | — | conflict (unknown) | — |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictoryTooltip.orientation, VictoryTooltip.dx | dts-path (strong) | victory-tooltip/lib/victory-tooltip.d.ts:28, victory-core/lib/victory-label/victory-label.d.ts:45 |
| visx | native | TooltipWithBounds | dts-path (strong) | @visx/tooltip/lib/tooltips/TooltipWithBounds.d.ts:7 keeps inside bounds |
| ApexCharts | native | tooltip.followCursor, tooltip.fixed | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4832, apexcharts/types/apexcharts.d.ts:4884 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~anchor\|frameAnchor | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:12 |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | native | ~position | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:42 |
| amCharts 5 | native | ~pointerOrientation | dts-grep (weak) | @amcharts/amcharts5/examples/xy-percent-change-comparison/config.json:293 |
| Google Charts | native | ~trigger | dts-grep (weak) | @types/google.visualization/index.d.ts:464 |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | ~anchor\|placement | dts-grep (weak) | @mui/x-charts/ChartsXAxis/useAxisTicksProps.d.ts:19 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~position\|mount | dts-grep (weak) | @antv/g2/lib/index.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 1eae17b953e2.

https://chartkit.dev/features.json
