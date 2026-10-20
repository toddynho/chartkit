# KPI / big number card

ChartKit: **native**

Single value with label and delta

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "kpi",
  "metric": {
    "label": "N",
    "value": 18,
    "delta": -0.05
  },
  "a11y": {
    "alt": "Count is 18."
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
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | unknown | — | conflict (unknown) | — |
| Plotly.js | native | trace.type=indicator, trace.delta | dts-path (strong) | plot-schema.json#traces.indicator, plot-schema.json#traces.{indicator}.attributes.delta |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | native | BadgeDelta, Metric | dts-path (strong) | @tremor/react/dist/index.d.ts:224, @tremor/react/dist/index.d.ts:602 Card + Metric + BadgeDelta components |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | unknown | — | conflict (unknown) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 77c1df48ccc6.

https://chartkit.dev/features.json
