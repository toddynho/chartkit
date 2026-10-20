# Radial bar

ChartKit: **partial**

Bars bent around a circle

Matrix status: `partial`. Verification: `dts-path` (strong).

single-value ring only

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "progress-ring",
  "metric": {
    "label": "Done",
    "value": 3,
    "min": 0,
    "max": 8
  },
  "a11y": {
    "alt": "3 of 8 are done."
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
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | native | RadialBarChart, RadialBar | dts-path (strong) | recharts/types/chart/RadialBarChart.d.ts:27, recharts/types/polar/RadialBar.d.ts:250 |
| Apache ECharts | native | series.coordinateSystem=polar | dts-path (strong) | echarts/types/dist/shared.d.ts:11177 bar series on polar |
| Highcharts | native | chart.polar, chart.inverted | dts-path (strong) | highcharts/highcharts.d.ts:6526, highcharts/highcharts.d.ts:6364 inverted polar column |
| Plotly.js | native | trace.type=barpolar | dts-path (strong) | plot-schema.json#traces.barpolar |
| Nivo | native | RadialBar | dts-path (strong) | @nivo/radial-bar/dist/types/RadialBar.d.ts:4 |
| Victory | partial | VictoryChart.polar | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:40 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=radialBar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | partial | ProgressCircle | dts-path (strong) | @tremor/react/dist/index.d.ts:693 single value |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | partial | mark=arc | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 radial via theta + radius |
| AG Charts | native | series.type=radial-bar | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | RadarColumnSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/radar/RadarColumnSeries.d.ts:43 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (premium) | RadialBarChart | dts-path (strong) | @mui/x-charts-premium/RadialBarChart/RadialBarChart.d.mts:66 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~radial | dts-grep (weak) | @antv/g2/lib/index.d.ts:58 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
