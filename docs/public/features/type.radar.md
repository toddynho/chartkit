# Radar / spider chart

ChartKit: **native**

Multivariate values on radial axes

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "radar",
  "data": [
    {
      "spoke": "Speed",
      "car": 4,
      "bike": 2
    },
    {
      "spoke": "Cost",
      "car": 2,
      "bike": 5
    },
    {
      "spoke": "Ease",
      "car": 3,
      "bike": 4
    }
  ],
  "encoding": {
    "x": "spoke",
    "y": [
      "car",
      "bike"
    ]
  },
  "a11y": {
    "alt": "Bike leads on cost."
  },
  "size": {
    "width": 640,
    "height": 260
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartTypeRegistry.radar | dts-path (strong) | chart.js/dist/types/index.d.ts:3763 |
| Recharts | native | RadarChart, Radar | dts-path (strong) | recharts/types/chart/RadarChart.d.ts:27, recharts/types/polar/Radar.d.ts:188 |
| Apache ECharts | native | series.type=radar | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | chart.polar | dts-path (strong) | highcharts/highcharts.d.ts:6526 line series, gridLineInterpolation polygon |
| Plotly.js | native | trace.type=scatterpolar | dts-path (strong) | plot-schema.json#traces.scatterpolar fill:'toself' |
| Nivo | native | Radar | dts-path (strong) | @nivo/radar/dist/types/Radar.d.ts:4 |
| Victory | native | VictoryChart.polar | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:40 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 GridPolar + LineRadial |
| ApexCharts | native | chart.type=radar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 documented radar example built from line + projection |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | series.type=radar-line | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | RadarChart, RadarLineSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/radar/RadarChart.d.ts:72, @amcharts/amcharts5/.internal/charts/radar/RadarLineSeries.d.ts:25 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | RadarChart | dts-path (strong) | @mui/x-charts/RadarChart/RadarChart.d.mts:45 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.radar | dts-path (strong) | mermaid/dist/config.type.d.ts:238 |
| AntV G2 | native | ~polar | dts-grep (weak) | @antv/g2/lib/index.d.ts:53 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against bb58c45afae3.

https://chartkit.dev/features.json
