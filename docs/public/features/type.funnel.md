# Funnel

ChartKit: **native**

Stage values narrowing down

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "funnel",
  "data": [
    {
      "stage": "Visit",
      "count": 80
    },
    {
      "stage": "Pay",
      "count": 12
    }
  ],
  "encoding": {
    "x": "stage",
    "y": "count"
  },
  "a11y": {
    "alt": "12 of 80 pay."
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
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | FunnelChart, Funnel | dts-path (strong) | recharts/types/chart/FunnelChart.d.ts:8, recharts/types/cartesian/Funnel.d.ts:208 |
| Apache ECharts | native | series.type=funnel | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=funnel | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=funnel | dts-path (strong) | plot-schema.json#traces.funnel |
| Nivo | native | Funnel | dts-path (strong) | @nivo/funnel/dist/types/Funnel.d.ts:4 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=funnel | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | FunnelChart | dts-path (strong) | @tremor/react/dist/index.d.ts:208 |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | series.type=funnel | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | FunnelSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/funnel/FunnelSeries.d.ts:83 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | FunnelChart | dts-path (strong) | @mui/x-charts-pro/FunnelChart/FunnelChart.d.mts:38 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 interval + funnel shape |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b2aaa2671f30.

https://chartkit.dev/features.json
