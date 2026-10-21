# Show / hide legend

ChartKit: **native**

Toggle the legend

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:169

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
    "show": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~legend | dts-grep (weak) | chart.js/dist/types/index.d.ts:77 plugins.legend.display |
| Recharts | native | Legend | dts-path (strong) | recharts/types/component/Legend.d.ts:114 |
| Apache ECharts | native | legend.show | dts-path (strong) | echarts/types/dist/shared.d.ts:4342 |
| Highcharts | native | legend.enabled | dts-path (strong) | highcharts/highcharts.d.ts:13447 |
| Plotly.js | native | layout.showlegend | dts-path (strong) | plot-schema.json#layout.layoutAttributes.showlegend |
| Nivo | native | Line.legends | dts-path (strong) | @nivo/line/dist/types/types.d.ts:152 |
| Victory | native | VictoryLegend | dts-path (strong) | victory-legend/lib/victory-legend.d.ts:55 |
| visx | native | LegendOrdinal | dts-path (strong) | @visx/legend/lib/legends/Ordinal.d.ts:6 |
| ApexCharts | native | legend.show | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4592 |
| Tremor (npm) | native | LineChart.showLegend | dts-path (strong) | @tremor/react/dist/index.d.ts:67 |
| Observable Plot | native | ~legend | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:3 color: {legend: true} |
| Vega-Lite | native | ~legend | dts-grep (weak) | 1165:          "description" |
| AG Charts | native | AgChartOptions.legend | dts-path (strong) | ag-charts-types/dist/types/src/chart/chartOptions.d.ts:262 |
| amCharts 5 | native | Legend | dts-path (strong) | @amcharts/amcharts5/.internal/core/render/Legend.d.ts:107 |
| Google Charts | native | ~legend | dts-grep (weak) | @types/google.visualization/index.d.ts:380 legend: 'none' \| {position} |
| uPlot | native | Options.legend.show | dts-path (strong) | uplot/dist/uPlot.d.ts:277 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — no legend |
| MUI X Charts | native | LineChart.hideLegend | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:40 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~legend | dts-grep (weak) | @antv/g2/lib/index.d.ts:112 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
