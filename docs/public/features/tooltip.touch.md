# Touch-friendly tooltip

ChartKit: **native**

Tap/press to show tooltips on touch devices

Matrix status: `native`. Verification: `render` (strong).

tooltip.pin keeps the tooltip after a tap until Escape or a second tap. tooltip.hit is the hit target in px, from 8 to 48, and 18 when pin is set and hit is omitted. pinTooltip and hitSize repair to pin and hit (CK3067).

Source: chartkit:packages/core/src/interact.ts

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
    "pin": true,
    "hit": 28
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~touchstart\|events | dts-grep (weak) | chart.js/dist/types/index.d.ts:551 default events include touchstart/touchmove |
| Recharts | native | ~touch | dts-grep (weak) | recharts/types/index.d.ts:144 |
| Apache ECharts | native | ~triggerOn | dts-grep (weak) | echarts/types/src/coord/parallel/ParallelModel.d.ts:17 'mousemove\|click' incl. touch |
| Highcharts | native | ~touch\|followTouchMove | dts-grep (weak) | highcharts/highcharts.src.d.ts:2034 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~touch | dts-grep (weak) | @nivo/grid/dist/types/boundingBoxes.d.ts:3 |
| Victory | native | ~touch | dts-grep (weak) | victory-selection-container/lib/victory-selection-container.d.ts:98 |
| visx | native | ~touch | dts-grep (weak) | @visx/event/lib/types.d.ts:1 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~pointer | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:5 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~touch | dts-grep (weak) | ag-charts-community/dist/types/src/core/eventsHub.d.ts:48 |
| amCharts 5 | native | ~touch | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:105 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~touch\|handleScroll | dts-grep (weak) | 197:	 * Tracking Mode will be deactivated on touch end event. |
| MUI X Charts | native | ~touch\|pointer | dts-grep (weak) | @mui/x-charts/hooks/useInteractionItemProps.d.ts:9 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~touch | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
