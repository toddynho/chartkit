# Values in legend

ChartKit: **native**

Show the current/last value next to each series name

Matrix status: `native`. Verification: `runtime-probe` (strong).

last value (line) or slice value (donut); line values are drawn on createRenderer([line]) since PR #17 (main 116d0af)

Source: chartkit:packages/core/src/generated/schema.ts:181

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
  "legend": {
    "values": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | — | conflict (unknown) | — |
| Recharts | partial | Legend.formatter | dts-path (strong) | recharts/types/component/DefaultLegendContent.d.ts:83 |
| Apache ECharts | native | legend.formatter | dts-path (strong) | echarts/types/dist/shared.d.ts:4306 |
| Highcharts | native | legend.labelFormatter | dts-path (strong) | highcharts/highcharts.d.ts:13522 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | legend.formatter | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4607 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | native | ~valueText\|valueLabels | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:497 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.legend.live | dts-path (strong) | uplot/dist/uPlot.d.ts:279 live values on hover |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~itemValue | dts-grep (weak) | @antv/g2/lib/spec/interaction.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against de2c823fa6b2.

https://chartkit.dev/features.json
