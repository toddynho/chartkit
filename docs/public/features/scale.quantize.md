# Quantize / threshold / quantile scales

ChartKit: **native**

Binned colour scales

Matrix status: `native`. Verification: `render` (strong).

encoding.color.scale.type quantize or threshold. bins sets the quantize width. thresholds sets the cuts. On x or y the same words are an error and the hint points at the colour scale (CK3063).

Source: chartkit:packages/core/src/color-scale.ts

## ChartKit spec

```json
{
  "version": "1",
  "type": "heatmap",
  "data": [
    {
      "bay": "Ash",
      "bell": "02",
      "kiln": -12
    },
    {
      "bay": "Elm",
      "bell": "14",
      "kiln": 80
    },
    {
      "bay": "Oak",
      "bell": "14",
      "kiln": 420
    }
  ],
  "encoding": {
    "x": "bell",
    "y": "bay",
    "color": {
      "field": "kiln",
      "scale": {
        "type": "quantize",
        "bins": 4
      }
    }
  },
  "a11y": {
    "alt": "Oak is the hottest bay."
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
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | visualMap | dts-path (strong) | echarts/types/dist/shared.d.ts:12590 piecewise splitNumber/pieces |
| Highcharts | native | colorAxis.dataClasses | dts-path (strong) | highcharts/highcharts.d.ts:8389 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | native | ~quantize | dts-grep (weak) | @nivo/heatmap/dist/types/hooks.d.ts:30 |
| Victory | none | — | dts-absence (absence) | — |
| visx | native | ~scaleQuantize\|scaleThreshold\|scaleQuantile | dts-grep (weak) | @visx/scale/lib/index.d.ts:10 |
| ApexCharts | native | plotOptions.heatmap.colorScale.ranges | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3434 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~quantize\|quantile\|threshold | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:195 |
| Vega-Lite | native | ~quantize\|quantile\|threshold | dts-grep (weak) | 20073:              "description" |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | partial | ~heatRules | dts-grep (weak) | @amcharts/amcharts5/examples/xy-bubble/config.json:549 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~piecewise | dts-grep (weak) | @mui/x-charts/ChartsLegend/piecewiseColorLegendClasses.d.ts:1 piecewise color map thresholds |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~quantize\|quantile\|threshold | dts-grep (weak) | @antv/g2/lib/index.d.ts:100 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
