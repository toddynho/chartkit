# Paginated / scrolling legend

ChartKit: **native**

Handle many legend items

Matrix status: `native`. Verification: `dts-path` (strong).

Rows past maxRows page.

Source: chartkit:packages/core/src/generated/schema.ts:203

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
    "maxRows": 1
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | legend.type | dts-path (strong) | echarts/types/dist/shared.d.ts:8225 'scroll' |
| Highcharts | native | legend.navigation, legend.maxHeight | dts-path (strong) | highcharts/highcharts.d.ts:13563, highcharts/highcharts.d.ts:13550 |
| Plotly.js | partial | layout.legend.maxheight | dts-path (strong) | plot-schema.json#layout.layoutAttributes.legend.maxheight |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryLegend.itemsPerRow | dts-path (strong) | victory-legend/lib/victory-legend.d.ts:17 |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | native | LineChart.enableLegendSlider | dts-path (strong) | @tremor/react/dist/index.d.ts:75 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~columns\|symbolLimit | dts-grep (weak) | 5231:        "columns" |
| AG Charts | native | ~pagination | dts-grep (weak) | ag-charts-community/dist/types/src/chart/tooltip/tooltipContent.d.ts:37 |
| amCharts 5 | native | ~verticalScrollbar | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/Container.d.ts:73 |
| Google Charts | native | ~maxLines\|scrollArrows | dts-grep (weak) | @types/google.visualization/index.d.ts:512 legend.pageIndex / scrollArrows |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | native | ~overflow\|scroll | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:100 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~navEffect\|maxRows | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:329 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 21d2db2b482c.

https://chartkit.dev/features.json
