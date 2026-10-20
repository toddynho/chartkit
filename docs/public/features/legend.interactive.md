# Click to toggle series

ChartKit: **native**

Legend items hide/show series

Matrix status: `native`. Verification: `dts-path` (strong).

client interact module; off unless set (schema default false)

Source: chartkit:packages/core/src/generated/schema.ts:177

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
  "legend": {
    "interactive": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~onClick | dts-grep (weak) | chart.js/dist/types/index.d.ts:1703 default toggles dataset visibility |
| Recharts | partial | Legend.onClick | dts-path (strong) | recharts/types/component/DefaultLegendContent.d.ts:97 handle and hide series yourself |
| Apache ECharts | native | legend.selectedMode | dts-path (strong) | echarts/types/dist/shared.d.ts:4370 |
| Highcharts | native | plotOptions.series.events.legendItemClick | dts-path (strong) | highcharts/highcharts.d.ts:99848 |
| Plotly.js | native | layout.legend.itemclick | dts-path (strong) | plot-schema.json#layout.layoutAttributes.legend.itemclick |
| Nivo | native | ~toggleSerie | dts-grep (weak) | @nivo/bar/dist/types/hooks.d.ts:39 legends[].toggleSerie (line/bar) |
| Victory | partial | VictoryLegend.events | dts-path (strong) | victory-legend/lib/victory-legend.d.ts:12 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | legend.onItemClick.toggleDataSeries | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4631 |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~bind\|legend | dts-grep (weak) | 1165:          "description" selection param bind: 'legend' |
| AG Charts | native | ~toggleSeries | dts-grep (weak) | ag-charts-enterprise/dist/types/src/series/waterfall/waterfallSeries.d.ts:185 legend.item.toggleSeries |
| amCharts 5 | native | ~clickTarget\|toggleKey | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/flow/Flow.d.ts:79 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | native | Options.legend.live, ~onClick | dts-path (strong) | uplot/dist/uPlot.d.ts:279 click toggles series |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~onItemClick\|toggleVisibilityOnClick | dts-grep (weak) | @mui/x-charts/package.json:694 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~legendFilter | dts-grep (weak) | @antv/g2/lib/index.d.ts:143 interaction legendFilter |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against aad14577fd95.

https://chartkit.dev/features.json
