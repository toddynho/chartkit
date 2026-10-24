# Stacked area

ChartKit: **native**

Areas stacked on top of each other

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "stacked-area",
  "data": [
    {
      "x": "A",
      "a": 2,
      "b": 3
    },
    {
      "x": "B",
      "a": 4,
      "b": 2
    }
  ],
  "encoding": {
    "x": "x",
    "y": [
      "a",
      "b"
    ]
  },
  "a11y": {
    "alt": "B is higher."
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
| Chart.js | native | ~stacked | dts-grep (weak) | chart.js/dist/types/index.d.ts:86 scales.y.stacked + fill |
| Recharts | native | Area.stackId | dts-path (strong) | recharts/types/cartesian/Area.d.ts:202 |
| Apache ECharts | native | series.stack | dts-path (strong) | echarts/types/dist/shared.d.ts:8415 |
| Highcharts | native | plotOptions.area.stacking=normal | dts-path (strong) | highcharts/options/area.d.ts:1277 |
| Plotly.js | native | trace.stackgroup | dts-path (strong) | plot-schema.json#traces.{scatter}.attributes.stackgroup |
| Nivo | native | Line.yScale, ~stacked | dts-path (strong) | @nivo/line/dist/types/types.d.ts:132, @nivo/bar/dist/types/types.d.ts:167 yScale.stacked + enableArea |
| Victory | native | VictoryStack | dts-path (strong) | victory-stack/lib/victory-stack.d.ts:15 |
| visx | native | AreaStack, AnimatedAreaStack | dts-path (strong) | @visx/shape/lib/shapes/AreaStack.d.ts:5, @visx/xychart/lib/components/series/AnimatedAreaStack.d.ts:3 |
| ApexCharts | native | chart.stacked | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2162 |
| Tremor (npm) | native | AreaChart.stack | dts-path (strong) | @tremor/react/dist/index.d.ts:92 |
| Observable Plot | native | areaY, stackY | dts-path (strong) | @observablehq/plot/src/marks/area.d.ts:198, @observablehq/plot/src/transforms/stack.d.ts:150 stack transform is implicit for areaY |
| Vega-Lite | native | ~stack | dts-grep (weak) | 592:          "description" encoding.y.stack |
| AG Charts | native | series.stacked | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:90 |
| amCharts 5 | native | ~stacked | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:177 XYSeries settings stacked:true |
| Google Charts | native | AreaChartOptions.isStacked | dts-path (strong) | @types/google.visualization/index.d.ts:936 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 uPlot has no stacking; demo shows manual cumulative data + bands |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | native | LineChart.series.stack | dts-path (strong) | @mui/x-charts/models/seriesType/common.d.mts:85 |
| Mermaid (chart-ish diagrams only) | unknown | ~stack | conflict (unknown) | — |
| AntV G2 | native | ~stackY | dts-grep (weak) | @antv/g2/lib/index.d.ts:27 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
