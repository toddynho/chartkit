# Opacity / fill opacity

ChartKit: **native**

Transparency of marks and area fills

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:871, chartkit:packages/core/src/generated/schema.ts:823

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
    "opacity": 0.7
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ~rgba | dts-grep (weak) | chart.js/dist/types/index.d.ts:2780 via rgba colours |
| Recharts | native | Area.fillOpacity | dts-path (strong) | @types/react/index.d.ts:3799 |
| Apache ECharts | native | series.itemStyle.opacity, series.areaStyle.opacity | dts-path (strong) | echarts/types/dist/shared.d.ts:7769, echarts/types/dist/shared.d.ts:7794 |
| Highcharts | native | plotOptions.series.opacity, plotOptions.area.fillOpacity | dts-path (strong) | highcharts/options/series.d.ts:1107, highcharts/options/area.d.ts:894 |
| Plotly.js | native | trace.opacity | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,carpet,cone,…}.attributes.opacity |
| Nivo | native | Line.areaOpacity | dts-path (strong) | @nivo/line/dist/types/types.d.ts:147 |
| Victory | native | VictoryArea.style | dts-path (strong) | victory-area/lib/victory-area.d.ts:8 |
| visx | native | AreaClosed.fillOpacity | dts-path (strong) | @types/react/index.d.ts:3799 |
| ApexCharts | native | fill.opacity | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4561 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~fillOpacity | dts-grep (weak) | @observablehq/plot/src/channel.d.ts:32 |
| Vega-Lite | native | ~opacity | dts-grep (weak) | 408:        "fillOpacity" |
| AG Charts | native | series.fillOpacity | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/commonOptions.d.ts:38 |
| amCharts 5 | native | ~fillOpacity | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/LineSeries.d.ts:100 |
| Google Charts | native | AreaChartOptions.areaOpacity | dts-path (strong) | @types/google.visualization/index.d.ts:921 |
| uPlot | partial | ~fill | dts-grep (weak) | 303:		export type Fill   = CSSStyleDeclaration['background']  \| ((self rgba |
| TradingView Lightweight Charts | partial | ~color | dts-grep (weak) | 24: * Represents a type of color. rgba |
| MUI X Charts | partial | ~opacity | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:3941 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~fillOpacity | dts-grep (weak) | @antv/g2/lib/runtime/types/theme.d.ts:11 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 0749a0e1cb93.

https://chartkit.dev/features.json
