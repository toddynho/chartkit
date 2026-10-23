# Quadrant chart

ChartKit: **native**

Scatter divided into four labelled quadrants

Matrix status: `native`. Verification: `dts-grep` (weak).

Source: chartkit:packages/core/src/validate-phase4.ts:13

## ChartKit spec

```json
{
  "version": "1",
  "type": "quadrant",
  "quadrants": [
    "A",
    "B",
    "C",
    "D"
  ],
  "data": [
    {
      "name": "SSO",
      "x": 0.2,
      "y": 0.8
    },
    {
      "name": "R",
      "x": 0.8,
      "y": 0.3
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y"
  },
  "a11y": {
    "alt": "SSO is a win."
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
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | manual | SVGRenderer | dts-mechanism (weak) | highcharts/highcharts.d.ts:115777 |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~quadrantOptions | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:52 quadrant preset |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.quadrantChart | dts-path (strong) | mermaid/dist/config.type.d.ts:224 |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against e79729672133.

https://chartkit.dev/features.json
