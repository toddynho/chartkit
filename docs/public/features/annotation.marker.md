# Point marker / callout

ChartKit: **native**

Marker or arrow highlighting a point

Matrix status: `native`. Verification: `dts-path` (strong).

Point, leader, and a text box kept inside the plot. Later callouts move clear of earlier ones.

Source: chartkit:packages/core/src/annotations.ts:19

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
  "annotations": [
    {
      "type": "marker",
      "x": "Q2",
      "label": "Peak"
    }
  ]
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | ReferenceDot | dts-path (strong) | recharts/types/cartesian/ReferenceDot.d.ts:137 |
| Apache ECharts | native | series.markPoint | dts-path (strong) | echarts/types/dist/shared.d.ts:12500 |
| Highcharts | native | ~annotations | dts-grep (weak) | highcharts/highcharts.src.d.ts:162 shapes + labels |
| Plotly.js | native | layout.annotations | dts-path (strong) | plot-schema.json#layout.layoutAttributes.annotations showarrow |
| Nivo | native | ~annotations | dts-grep (weak) | @nivo/scatterplot/package.json:39 @nivo/annotations |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | Annotation, Connector | dts-path (strong) | @visx/annotation/lib/components/Annotation.d.ts:7, @visx/annotation/lib/components/Connector.d.ts:13 |
| ApexCharts | native | annotations.points | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2660 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | arrow, dot | dts-path (strong) | @observablehq/plot/src/marks/arrow.d.ts:111, @observablehq/plot/src/marks/dot.d.ts:112 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~annotations | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:7 |
| amCharts 5 | native | ~CalloutSeries\|Callout | dts-grep (weak) | @amcharts/amcharts5/stock.d.ts:56 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~SeriesMarker | dts-grep (weak) | 274: * import { createSeriesMarkers } from 'lightweight-charts'; series markers (arrows/circles) at times |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~annotation | dts-grep (weak) | @antv/g2/lib/component/constant.d.ts:22 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 668873d6cd29.

https://chartkit.dev/features.json
