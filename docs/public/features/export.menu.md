# Built-in export menu / toolbar

ChartKit: **native**

UI button for download/print

Matrix status: `native`. Verification: `dts-path` (strong).

Keyboard menu, loaded only when interaction.export is set.

Source: chartkit:packages/core/src/generated/schema.ts:2611

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
    "y": "units"
  },
  "a11y": {
    "alt": "Units rose in Q2."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "interaction": {
    "export": [
      "png",
      "svg",
      "csv"
    ]
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | toolbox.feature.saveAsImage | dts-path (strong) | echarts/types/dist/shared.d.ts:12480 |
| Highcharts | plugin | ~contextButton | dts-grep (weak) | highcharts/highcharts.src.d.ts:10748 exporting module menu |
| Plotly.js | native | config.displayModeBar | dts-path (strong) | plot-schema.json#config.displayModeBar |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | chart.toolbar.show, chart.toolbar.tools.download | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2178, apexcharts/types/apexcharts.d.ts:2182 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | plugin | — | npm (weak) | — actions menu |
| AG Charts | native | ~contextMenu\|toolbar | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:21 |
| amCharts 5 | plugin | ~ExportingMenu | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:90 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native (pro) | ChartsToolbarPro | dts-path (strong) | @mui/x-charts-pro/ChartsToolbarPro/ChartsToolbarPro.d.mts:40 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against d039a4e4a8c9.

https://chartkit.dev/features.json
