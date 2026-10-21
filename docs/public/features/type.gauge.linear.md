# Linear gauge / progress bar

ChartKit: **partial**

Single value on a straight scale

Matrix status: `partial`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "bullet",
  "data": [
    {
      "x": "R",
      "y": 275,
      "t": 250,
      "g": 300
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y",
    "target": "t"
  },
  "mark": {
    "ranges": [
      "g"
    ]
  },
  "a11y": {
    "alt": "R beats target."
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
| Highcharts | partial | series.type=bullet | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.gauge.shape=bullet | dts-path (strong) | plot-schema.json#traces.{indicator}.attributes.gauge.shape |
| Nivo | partial | Bullet | dts-path (strong) | @nivo/bullet/dist/types/Bullet.d.ts:1 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | native | ProgressBar, CategoryBar | dts-path (strong) | @tremor/react/dist/index.d.ts:680, @tremor/react/dist/index.d.ts:652 |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native (ent) | ~linear-gauge | dts-grep (weak) | ag-charts-enterprise/dist/types/src/main.d.ts:34 |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
