# Pie slice labels / leader lines

ChartKit: **native**

Outside labels with connector lines

Matrix status: `native`. Verification: `runtime-probe` (strong).

mark.labels and mark.labelPosition outside draw leader lines on pie and donut. Labels on one side stack with a 16px gap. Probed by rendering.

Source: packages/core/src/generated/schema.ts:898

## ChartKit spec

```json
{
  "version": "1",
  "type": "pie",
  "data": [
    {
      "wood": "Oak",
      "boards": 8
    },
    {
      "wood": "Pine",
      "boards": 5
    }
  ],
  "encoding": {
    "x": "wood",
    "y": "boards"
  },
  "a11y": {
    "alt": "Oak is larger."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "labelPosition": "outside"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | Pie.label, Pie.labelLine | dts-path (strong) | recharts/types/polar/Pie.d.ts:230, recharts/types/polar/Pie.d.ts:240 |
| Apache ECharts | native | series.labelLine | dts-path (strong) | echarts/types/dist/shared.d.ts:8357 |
| Highcharts | native | plotOptions.pie.dataLabels.connectorShape | dts-path (strong) | highcharts/highcharts.d.ts:101806 |
| Plotly.js | partial | trace.textposition | dts-path (strong) | plot-schema.json#traces.{bar,funnel,funnelarea,histogram,icicle,pie,…}.attributes.textposition outside without connectors |
| Nivo | native | Pie.enableArcLinkLabels | dts-path (strong) | @nivo/pie/dist/types/types.d.ts:70 |
| Victory | native | VictoryPie.labelPlacement, VictoryPie.labelIndicator | dts-path (strong) | victory-pie/lib/victory-pie.d.ts:13, victory-pie/lib/victory-pie.d.ts:10 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | series.calloutLabel, series.calloutLine | dts-path (strong) | ag-charts-types/dist/types/src/series/polar/donutOptions.d.ts:73, ag-charts-types/dist/types/src/series/polar/donutOptions.d.ts:77 |
| amCharts 5 | native | ~Tick\|alignLabels | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:45 pie series ticks |
| Google Charts | native | ~pieSliceText\|legend | dts-grep (weak) | @types/google.visualization/index.d.ts:380 legend labeled lines |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~arcLabel | dts-grep (weak) | @mui/x-charts/themeAugmentation/overrides.d.ts:20 inside labels only |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~connector | dts-grep (weak) | @antv/g2/lib/index.d.ts:79 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
