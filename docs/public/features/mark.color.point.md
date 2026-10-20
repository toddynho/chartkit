# Per-point / per-category colour

ChartKit: **native**

Colour individual bars, slices or points

Matrix status: `native`. Verification: `runtime-probe` (strong).

encoding.color names a category or a paint column. domain and range map values to colours. Drawn on bar, scatter, and pie. Probed by rendering.

Source: packages/core/src/generated/schema.ts:482

## ChartKit spec

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    {
      "lane": "A",
      "stops": 12,
      "group": "A"
    },
    {
      "lane": "C",
      "stops": 15,
      "group": "B"
    }
  ],
  "encoding": {
    "x": "lane",
    "y": "stops",
    "color": "group"
  },
  "a11y": {
    "alt": "Lane C has more."
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
| Chart.js | native | ChartConfiguration.data.datasets.backgroundColor | dts-path (strong) | chart.js/dist/types/index.d.ts:1828 array or scriptable |
| Recharts | native | Cell | dts-path (strong) | recharts/types/component/Cell.d.ts:25 <Cell fill> per datum |
| Apache ECharts | native | series.data, ~colorBy | dts-path (strong) | echarts/types/dist/shared.d.ts:11188, echarts/types/src/model/Series.d.ts:2 data item itemStyle / colorBy:'data' |
| Highcharts | native | plotOptions.column.colorByPoint | dts-path (strong) | highcharts/options/column.d.ts:680 |
| Plotly.js | native | trace.marker.color | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,funnel,histogram,histogram2d,…}.attributes.marker.color array |
| Nivo | native | Bar.colorBy | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:169 |
| Victory | partial | VictoryBar.style | dts-path (strong) | victory-bar/lib/victory-bar.d.ts:15 functional style per datum |
| visx | native | Bar.fill | dts-path (strong) | @types/react/index.d.ts:3798 |
| ApexCharts | native | plotOptions.bar.distributed | dts-path (strong) | apexcharts/types/apexcharts.d.ts:3102 |
| Tremor (npm) | partial | BarList | dts-path (strong) | @tremor/react/dist/index.d.ts:640 single colour per category series |
| Observable Plot | native | ~fill | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:5 fill channel per datum |
| Vega-Lite | native | ~color | dts-grep (weak) | 238:              "description" |
| AG Charts | native | ~itemStyler | dts-grep (weak) | ag-charts-types/dist/types/src/presets/quadrant/quadrantOptions.d.ts:8 itemStyler callback |
| amCharts 5 | native | ~adapters\|columns.template | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:58 template adapters / heatRules |
| Google Charts | native | ~style | dts-grep (weak) | @types/google.visualization/index.d.ts:403 style role column |
| uPlot | partial | ~fill | dts-grep (weak) | 303:		export type Fill   = CSSStyleDeclaration['background']  \| ((self fill can be a function (gradient), not per point |
| TradingView Lightweight Charts | native | ~color | dts-grep (weak) | 24: * Represents a type of color. per-bar color field in data |
| MUI X Charts | native | ~colorMap | dts-grep (weak) | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:36 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~color | dts-grep (weak) | @antv/g2/lib/index.d.ts:43 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
