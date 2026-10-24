# Axis title position / alignment

ChartKit: **native**

Where the title sits along the axis

Matrix status: `native`. Verification: `runtime-probe` (strong).

titlePosition is start, center, or end on x, y, and y2. titleRotate sets the y and y2 title angle. Drawn on createRenderer([line]).

Source: packages/core/src/generated/schema.ts:1044

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
  "axes": {
    "x": {
      "titlePosition": "end",
      "title": "Quarter"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~align | dts-grep (weak) | chart.js/dist/types/index.d.ts:1177 title.align |
| Recharts | partial | XAxis.label | dts-path (strong) | recharts/types/util/types.d.ts:843 Label position prop |
| Apache ECharts | native | xAxis.nameLocation | dts-path (strong) | echarts/types/dist/shared.d.ts:2582 |
| Highcharts | native | xAxis.title.align | dts-path (strong) | highcharts/highcharts.d.ts:109298 |
| Plotly.js | native | layout.xaxis.title.standoff | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.title.standoff |
| Nivo | native | ~legendPosition\|legendOffset | dts-grep (weak) | @nivo/core/index.d.ts:332 |
| Victory | native | VictoryAxis.axisLabelComponent | dts-path (strong) | victory-core/lib/victory-theme/types.d.ts:40 |
| visx | native | AxisBottom.labelOffset | dts-path (strong) | @visx/axis/lib/types.d.ts:40 |
| ApexCharts | native | xaxis.title.offsetX | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4982 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~labelAnchor\|labelOffset | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:623 |
| Vega-Lite | native | ~titleAnchor\|titleAlign | dts-grep (weak) | 1768:        "titleAlign" |
| AG Charts | native | ~spacing | dts-grep (weak) | ag-charts-types/dist/types/src/presets/quadrant/quadrantOptions.d.ts:100 |
| amCharts 5 | native | ~centerX\|x\?: | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/exporting/ExportingCSS.d.ts:6 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.axes.labelGap | dts-path (strong) | uplot/dist/uPlot.d.ts:1090 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~labelStyle | dts-grep (weak) | @mui/x-charts/constants/index.d.ts:14 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~titlePosition\|titleSpacing | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:229 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
