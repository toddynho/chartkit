# Sequential / diverging colour scale

ChartKit: **partial**

Continuous colour mapping for heatmaps etc

Matrix status: `partial`. Verification: `dts-path` (strong).

range of colours

Source: chartkit:packages/core/src/generated/schema.ts:480

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": [
    {
      "quarter": "Q1",
      "units": 40
    },
    {
      "quarter": "Q2",
      "units": 55
    }
  ],
  "encoding": {
    "x": "quarter",
    "y": "units",
    "color": {
      "range": [
        "#d6e4f0",
        "#0066cc"
      ],
      "field": "units"
    }
  },
  "a11y": {
    "alt": "Units rose in Q2."
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
| Chart.js | unknown | — | conflict (unknown) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | visualMap.inRange | dts-path (strong) | echarts/types/dist/shared.d.ts:5807 continuous visualMap |
| Highcharts | native | colorAxis.stops | dts-path (strong) | highcharts/highcharts.d.ts:8692 |
| Plotly.js | native | trace.colorscale | dts-path (strong) | plot-schema.json#traces.{choropleth,choroplethmap,cone,contour,contourcarpet,densitymap,…}.attributes.colorscale |
| Nivo | native | ~colors\|scheme | dts-grep (weak) | @nivo/tree/package.json:33 |
| Victory | unknown | — | conflict (unknown) | — |
| visx | native | ~scaleLinear | dts-grep (weak) | @visx/scale/lib/index.d.ts:3 with colour range |
| ApexCharts | native | plotOptions.heatmap.colorScale | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3433 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~scheme\|interpolate | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:7 |
| Vega-Lite | native | ~scheme | dts-grep (weak) | 4935:    "ColorScheme" |
| AG Charts | native (ent) | AgHeatmapSeriesOptions.colorKey, ~gradientLegend | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/heatmapOptions.d.ts:66, ag-charts-types/dist/types/src/main.d.ts:26 heatmap colorScale + gradient legend |
| amCharts 5 | native | ~heatRules | dts-grep (weak) | @amcharts/amcharts5/examples/xy-bubble/config.json:549 |
| Google Charts | native | ~colorAxis | dts-grep (weak) | @types/google.visualization/index.d.ts:373 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~continuous | dts-grep (weak) | @mui/x-charts-pro/Heatmap/Heatmap.d.ts:24 colorMap type 'continuous' |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~palette\|interpolate | dts-grep (weak) | @antv/g2/lib/index.d.ts:89 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67a0c9849a0c.

https://chartkit.dev/features.json
