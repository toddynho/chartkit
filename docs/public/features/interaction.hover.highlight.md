# Hover highlight

ChartKit: **native**

Emphasise hovered mark/series, dim others

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:1141

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
    "hover": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~hoverBackgroundColor\|hoverRadius | dts-grep (weak) | chart.js/dist/types/index.d.ts:1628 |
| Recharts | native | Line.activeDot, Bar.activeBar | dts-path (strong) | recharts/types/cartesian/Line.d.ts:43, recharts/types/cartesian/Bar.d.ts:153 |
| Apache ECharts | native | series.emphasis.focus | dts-path (strong) | echarts/types/dist/shared.d.ts:8265 |
| Highcharts | native | plotOptions.series.states.hover, plotOptions.series.states.inactive | dts-path (strong) | highcharts/highcharts.d.ts:103192, highcharts/highcharts.d.ts:103196 |
| Plotly.js | partial | trace.hoverlabel | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,choropleth,choroplethmap,…}.attributes.hoverlabel no dimming of other traces |
| Nivo | native | Line.enableSlices, ~activeLineWidth\|onMouseEnter | dts-path (strong) | @nivo/line/dist/types/types.d.ts:181, @nivo/tree/dist/types/types.d.ts:71 |
| Victory | native | VictoryVoronoiContainer, ~activateData | dts-path (strong) | victory-voronoi-container/lib/victory-voronoi-container.d.ts:76, victory-tooltip/lib/victory-tooltip.d.ts:4 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | states.hover.filter, states.active.filter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2419, apexcharts/types/apexcharts.d.ts:2433 |
| Tremor (npm) | native | ~activeDot\|onValueChange | dts-grep (weak) | @tremor/react/dist/index.d.ts:74 |
| Observable Plot | native | ~pointer | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:5 pointer transform highlights |
| Vega-Lite | native | ~param\|hover | dts-grep (weak) | 340:              "description" selection params + condition |
| AG Charts | native | AgBarSeriesOptions.highlight | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:76 |
| amCharts 5 | native | ~hoverState\|states.create | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/Sprite.d.ts:108 |
| Google Charts | native | ~focusTarget | dts-grep (weak) | @types/google.visualization/index.d.ts:726 |
| uPlot | native | Options.focus.alpha | dts-path (strong) | uplot/dist/uPlot.d.ts:401 cursor.focus dims other series |
| TradingView Lightweight Charts | partial | ~crosshairMarker | dts-grep (weak) | 501:	crosshairMarkerVisible hover marker only |
| MUI X Charts | native | LineChart.series.highlightScope | dts-path (strong) | @mui/x-charts/models/seriesType/common.d.mts:51 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~elementHighlight | dts-grep (weak) | @antv/g2/lib/index.d.ts:133 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
