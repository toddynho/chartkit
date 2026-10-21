# Custom colour palette

ChartKit: **native**

Replace the series colour cycle

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:395

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
  "theme": {
    "tokens": {
      "series": [
        "#0066cc",
        "#c45c26"
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 per dataset or Colors plugin |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | color | dts-path (strong) | echarts/types/dist/shared.d.ts:7594 |
| Highcharts | native | colors | dts-path (strong) | highcharts/highcharts.d.ts:93499 |
| Plotly.js | native | layout.colorway | dts-path (strong) | plot-schema.json#layout.layoutAttributes.colorway |
| Nivo | native | Line.colors | dts-path (strong) | @nivo/line/dist/types/types.d.ts:137 |
| Victory | native | VictoryChart.colorScale | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:21 |
| visx | native | ~scaleOrdinal | dts-grep (weak) | @visx/shape/lib/shapes/BarGroup.d.ts:48 |
| ApexCharts | native | colors | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1457 |
| Tremor (npm) | native | LineChart.colors | dts-path (strong) | @tremor/react/dist/index.d.ts:59 |
| Observable Plot | native | ~scheme\|range | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:2 |
| Vega-Lite | native | ~range\|scheme | dts-grep (weak) | 164:          "description" |
| AG Charts | native | ~palette | dts-grep (weak) | ag-charts-types/dist/types/src/integratedCharts.d.ts:2 |
| amCharts 5 | native | ColorSet | dts-path (strong) | @amcharts/amcharts5/.internal/core/util/ColorSet.d.ts:75 |
| Google Charts | native | LineChartOptions.colors | dts-path (strong) | @types/google.visualization/index.d.ts:786 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | native | ~colors\|blueberryTwilightPalette | dts-grep (weak) | @mui/x-charts/SparkLineChart/SparkLineChart.d.ts:16 palettes exported |
| Mermaid (chart-ish diagrams only) | native | ~plotColorPalette\|pie1 | dts-grep (weak) | mermaid/dist/themes/theme-redux.d.ts:114 |
| AntV G2 | native | ~palette | dts-grep (weak) | @antv/g2/lib/index.d.ts:89 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
