# Large dataset mode (100k+ points)

ChartKit: **native**

Dedicated large-data rendering paths

Matrix status: `native`. Verification: `dts-path` (strong).

Canvas paints line, area, scatter, bar, heatmap, and candlestick from the sampled geometry. Columnar data.sampling is lttb, minmax, or none. auto from 100000 rows. Typed-array append. Other types stay SVG.

Source: chartkit:packages/core/src/generated/schema.ts:82, chartkit:packages/core/src/generated/schema.ts:177

## ChartKit spec

```json
{
  "version": "1",
  "type": "line",
  "data": {
    "columns": {
      "quarter": [
        "Q1",
        "Q2"
      ],
      "units": [
        40,
        55
      ]
    },
    "sampling": "lttb"
  },
  "encoding": {
    "x": "quarter",
    "y": "units"
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "render": "canvas"
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ChartConfiguration.options.parsing | dts-path (strong) | chart.js/dist/types/index.d.ts:54 canvas; parsing:false + decimation documented |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.large, series.progressive | dts-path (strong) | echarts/types/dist/shared.d.ts:11154, echarts/types/dist/shared.d.ts:8347 |
| Highcharts | plugin | ~boostThreshold | dts-grep (weak) | highcharts/highcharts.src.d.ts:5529 boost module (WebGL) |
| Plotly.js | partial | trace.type=scattergl | dts-path (strong) | plot-schema.json#traces.scattergl WebGL traces |
| Nivo | partial | ResponsiveLineCanvas | dts-path (strong) | @nivo/line/dist/types/ResponsiveLineCanvas.d.ts:4 canvas variants |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | partial | ~"canvas" | dts-grep (weak) | ag-charts-community/dist/types/src/dom/domManager.d.ts:8 canvas renderer |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | ~setData | dts-grep (weak) | 74:	setData(data designed for 100k-1M points |
| TradingView Lightweight Charts | native | ~setData | dts-grep (weak) | 354: * upDownMarkers.setData( |
| MUI X Charts | native | ~ChartsWebGLLayer | dts-grep (weak) | @mui/x-charts-premium/index.d.ts:56 premium WebGL layer |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 40b908be291d.

https://chartkit.dev/features.json
