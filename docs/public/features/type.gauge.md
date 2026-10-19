# Gauge / dial

ChartKit: **native**

Single value on an arc scale with needle or fill

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "gauge",
  "metric": {
    "label": "Capacity",
    "value": 64,
    "min": 0,
    "max": 100
  },
  "a11y": {
    "alt": "Capacity is 64/100."
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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 doughnut + plugin |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 Pie/RadialBar recipe |
| Apache ECharts | native | series.type=gauge | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=solidgauge, series.type=gauge | dts-path (strong) | highcharts/options/abands.d.ts:1386, highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=indicator, trace.gauge | dts-path (strong) | plot-schema.json#traces.indicator, plot-schema.json#traces.{indicator}.attributes.gauge |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | partial | chart.type=radialBar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 radialBar with startAngle/endAngle |
| Tremor (npm) | partial | ProgressCircle | dts-path (strong) | @tremor/react/dist/index.d.ts:693 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | AgGaugeOptions | dts-path (strong) | ag-charts-types/dist/types/src/chartBuilderOptions.d.ts:61 radial-gauge / linear-gauge (enterprise) |
| amCharts 5 | native | ~ClockHand | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:52 gauge = RadarChart + ClockHand |
| Google Charts | native | Gauge | dts-path (strong) | @types/google.visualization/index.d.ts:1751 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | Gauge | dts-path (strong) | @mui/x-charts/Gauge/Gauge.d.mts:9 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=gauge | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
