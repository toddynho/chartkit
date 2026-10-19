# Conditional / threshold colouring

ChartKit: **partial**

Colour by value threshold (negative red, above target green)

Matrix status: `partial`. Verification: `dts-path` (strong).

waterfall/candlestick use positive/negative tokens

Source: chartkit:packages/core/src/generated/schema.ts:380

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
      "negative": "#5c6b7a"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ~Scriptable | dts-grep (weak) | chart.js/dist/types/index.d.ts:23 scriptable options |
| Recharts | partial | Cell | dts-path (strong) | recharts/types/component/Cell.d.ts:25 |
| Apache ECharts | native | visualMap | dts-path (strong) | echarts/types/dist/shared.d.ts:12590 piecewise visualMap |
| Highcharts | native | plotOptions.series.zones, plotOptions.series.negativeColor | dts-path (strong) | highcharts/options/series.d.ts:1393, highcharts/options/series.d.ts:1087 |
| Plotly.js | partial | trace.marker.colorscale | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,funnel,histogram,icicle,quiver,…}.attributes.marker.colorscale |
| Nivo | partial | Bar.colors | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:170 function |
| Victory | partial | VictoryBar.style | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:15 |
| visx | partial | Bar.fill | dts-path (strong) | @types/react/index.d.ts:3798 |
| ApexCharts | native | plotOptions.bar.colors.ranges | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3126 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | partial | ~fill | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:5 |
| Vega-Lite | native | ~condition | dts-grep (weak) | 1203:              "$ref" conditional encoding |
| AG Charts | partial | ~itemStyler | dts-grep (weak) | ag-charts-types/dist/types/src/presets/quadrant/quadrantOptions.d.ts:8 |
| amCharts 5 | native | ~heatRules\|adapters | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:58 |
| Google Charts | partial | ~style | dts-grep (weak) | @types/google.visualization/index.d.ts:403 |
| uPlot | partial | ~fill | dts-grep (weak) | 303:		export type Fill   = CSSStyleDeclaration['background']  \| ((self |
| TradingView Lightweight Charts | native | BaselineSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:7 baseline series colours above/below |
| MUI X Charts | native | ~colorMap, ~piecewise | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:36, @mui/x-charts/ChartsLegend/piecewiseColorLegendClasses.d.ts:1 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | partial | ~color | dts-grep (weak) | @antv/g2/lib/index.d.ts:43 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 167b01d2f0df.

https://chartkit.dev/features.json
