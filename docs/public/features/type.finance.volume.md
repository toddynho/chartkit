# Volume pane / multiple panes

ChartKit: **partial**

Separate stacked panes sharing x (price + volume)

Matrix status: `partial`. Verification: `dts-path` (strong).

candlestick volume bars

Source: chartkit:packages/core/src/generated/schema.ts:585

## ChartKit spec

```json
{
  "version": "1",
  "type": "candlestick",
  "data": [
    {
      "x": "D1",
      "o": 5,
      "h": 7,
      "l": 4,
      "c": 6,
      "volume": "A"
    }
  ],
  "encoding": {
    "x": "x",
    "open": "o",
    "high": "h",
    "low": "l",
    "close": "c",
    "volume": "volume"
  },
  "a11y": {
    "alt": "D1 closed up."
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
| Apache ECharts | native | grid | dts-path (strong) | echarts/types/dist/shared.d.ts:12570 multiple grids with shared axisPointer |
| Highcharts | native | yAxis.height | dts-path (strong) | highcharts/highcharts.d.ts:110201 stacked yAxis panes in Stock |
| Plotly.js | native | layout.grid | dts-path (strong) | plot-schema.json#layout.layoutAttributes.grid subplots |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — multiple synced charts |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~fy | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:152 facets |
| Vega-Lite | native | ~vconcat | dts-grep (weak) | 5232:          "description" |
| AG Charts | native (ent) | ~priceVolume | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:47 |
| amCharts 5 | native | StockChart | dts-path (strong) | @amcharts/amcharts5/.internal/charts/stock/StockChart.d.ts:198 stock panels |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 synced charts |
| TradingView Lightweight Charts | native | IChartApi.panes | dts-path (strong) | lightweight-charts/dist/typings.d.ts:1779 |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
