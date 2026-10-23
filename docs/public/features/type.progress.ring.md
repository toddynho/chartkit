# Progress ring

ChartKit: **native**

Single value as fraction of a ring

Matrix status: `native`. Verification: `dts-path` (strong).

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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | partial | RadialBar | dts-path (strong) | recharts/types/polar/RadialBar.d.ts:250 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | partial | series.type=solidgauge | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.type=indicator | dts-path (strong) | plot-schema.json#traces.indicator |
| Nivo | partial | RadialBar | dts-path (strong) | @nivo/radial-bar/dist/types/RadialBar.d.ts:4 |
| Victory | partial | VictoryPie | dts-path (strong) | victory-pie/lib/victory-pie.d.ts:56 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=radialBar | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | ProgressCircle | dts-path (strong) | @tremor/react/dist/index.d.ts:693 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | ~radial-gauge | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:47 |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | Gauge | dts-path (strong) | @mui/x-charts/Gauge/Gauge.d.mts:9 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=liquid | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 liquid / gauge |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
