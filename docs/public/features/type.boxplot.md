# Box plot

ChartKit: **native**

Quartiles, whiskers and outliers

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "boxplot",
  "data": [
    {
      "x": "A",
      "y": 1
    },
    {
      "x": "A",
      "y": 9
    },
    {
      "x": "B",
      "y": 2
    },
    {
      "x": "B",
      "y": 4
    }
  ],
  "encoding": {
    "x": "x",
    "y": "y"
  },
  "a11y": {
    "alt": "A is wider."
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
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | series.type=boxplot | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=boxplot | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=box | dts-path (strong) | plot-schema.json#traces.box |
| Nivo | native | BoxPlot | dts-path (strong) | @nivo/boxplot/dist/types/BoxPlot.d.ts:4 |
| Victory | native | VictoryBoxPlot | dts-path (strong) | victory-box-plot/lib/victory-box-plot.d.ts:81 |
| visx | native | BoxPlot | dts-path (strong) | @visx/stats/lib/BoxPlot.d.ts:50 |
| ApexCharts | native | chart.type=boxPlot | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | boxY, boxX | dts-path (strong) | @observablehq/plot/src/marks/box.d.ts:53, @observablehq/plot/src/marks/box.d.ts:32 |
| Vega-Lite | native | mark=boxplot | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native (ent) | series.type=box-plot | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | partial | CandlestickSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/CandlestickSeries.d.ts:27 documented box plot via candlestick |
| Google Charts | partial | ~interval | dts-grep (weak) | @types/google.visualization/index.d.ts:46 intervals style:'boxes' |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=boxplot, MarkTypes=box | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13, @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
