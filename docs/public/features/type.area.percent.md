# 100% stacked area

ChartKit: **native**

Stacked areas normalised to 100%

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:843

## ChartKit spec

```json
{
  "version": "1",
  "type": "stacked-area",
  "data": [
    {
      "year": "2022",
      "rail": 20,
      "road": 30
    },
    {
      "year": "2023",
      "rail": 24,
      "road": 28
    }
  ],
  "encoding": {
    "x": "year",
    "y": [
      "rail",
      "road"
    ]
  },
  "a11y": {
    "alt": "Road stayed larger."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "stack": "percent"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 requires pre-normalised data |
| Recharts | native | AreaChart.stackOffset=expand | dts-path (strong) | recharts/types/util/types.d.ts:1396 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 pre-normalise data |
| Highcharts | native | plotOptions.area.stacking=percent | dts-path (strong) | highcharts/options/area.d.ts:1277 |
| Plotly.js | native | trace.groupnorm=percent | dts-path (strong) | plot-schema.json#traces.{scatter}.attributes.groupnorm |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | AreaStack.offset | dts-path (strong) | @visx/shape/lib/types/D3ShapeConfig.d.ts:78 d3 stackOffsetExpand ('expand') |
| ApexCharts | native | chart.stackType=100% | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2163 |
| Tremor (npm) | native | AreaChart.stack, ~percent | dts-path (strong) | @tremor/react/dist/index.d.ts:92 stack + type="percent" |
| Observable Plot | native | ~offset | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:435 stackY offset 'normalize' |
| Vega-Lite | native | ~normalize | dts-grep (weak) | 7741:        "normalizedNumberFormat" stack: 'normalize' |
| AG Charts | native | series.normalizedTo | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:88 |
| amCharts 5 | native | ~valueYShow | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:261 valueYShow:'valueYTotalPercent' on stacked series |
| Google Charts | native | AreaChartOptions.isStacked, ~percent | dts-path (strong) | @types/google.visualization/index.d.ts:936, @types/google.visualization/index.d.ts:731 isStacked:'percent' |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | native | LineChart.series.stackOffset=expand | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:105 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~normalizeY | dts-grep (weak) | @antv/g2/lib/index.d.ts:37 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 5b79c72ec5e9.

https://chartkit.dev/features.json
