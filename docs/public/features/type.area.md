# Area chart

ChartKit: **native**

Filled area under a line

Matrix status: `native`. Verification: `dts-path` (strong).

type:'line' + mark.area:true, or mini-area

Source: chartkit:packages/core/src/generated/schema.ts:819

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
  "mark": {
    "area": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.options.elements.line.fill | dts-path (strong) | chart.js/dist/types/index.d.ts:1953 line dataset with fill:true (Filler plugin) |
| Recharts | native | AreaChart, Area | dts-path (strong) | recharts/types/chart/AreaChart.d.ts:8, recharts/types/cartesian/Area.d.ts:300 |
| Apache ECharts | native | series.areaStyle | dts-path (strong) | echarts/types/dist/shared.d.ts:11100 |
| Highcharts | native | series.type=area | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.fill=tozeroy | dts-path (strong) | plot-schema.json#traces.{scatter,scattergl,scatterpolargl}.attributes.fill |
| Nivo | native | Line.enableArea | dts-path (strong) | @nivo/line/dist/types/types.d.ts:145 |
| Victory | native | VictoryArea | dts-path (strong) | victory-area/lib/victory-area.d.ts:31 |
| visx | native | AreaClosed, AreaSeries | dts-path (strong) | @visx/shape/lib/shapes/AreaClosed.d.ts:5, @visx/xychart/lib/components/series/AreaSeries.d.ts:3 |
| ApexCharts | native | chart.type=area | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | native | AreaChart | dts-path (strong) | @tremor/react/dist/index.d.ts:97 |
| Observable Plot | native | area | dts-path (strong) | @observablehq/plot/src/marks/area.d.ts:134 |
| Vega-Lite | native | mark=area | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.type=area | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | LineSeries, ~fillOpacity | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:70, @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:100 fills.visible on line series |
| Google Charts | native | AreaChart | dts-path (strong) | @types/google.visualization/index.d.ts:912 |
| uPlot | native | Options.series.fill | dts-path (strong) | uplot/dist/uPlot.d.ts:935 |
| TradingView Lightweight Charts | native | AreaSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:5 |
| MUI X Charts | native | LineChart.series.area | dts-path (strong) | @mui/x-charts/models/seriesType/line.d.mts:52 |
| Mermaid (chart-ish diagrams only) | unknown | ~area | conflict (unknown) | — |
| AntV G2 | native | MarkTypes=area | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ef3d290670a1.

https://chartkit.dev/features.json
