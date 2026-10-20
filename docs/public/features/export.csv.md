# Data export (CSV/XLSX)

ChartKit: **native**

Download underlying data

Matrix status: `native`. Verification: `dts-path` (strong).

toCSV writes rows, number arrays, or columns.

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
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 dataView |
| Highcharts | plugin | ~downloadCSV\|getCSV | dts-grep (weak) | highcharts/highcharts.src.d.ts:10965 export-data module |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | native | ~exportToCSV | dts-grep (weak) | apexcharts/types/apexcharts.d.ts:284 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | plugin | ~xlsx\|csv | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:67 exporting plugin CSV/XLSX/JSON |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | — | conflict (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 8f00db13813e.

https://chartkit.dev/features.json
