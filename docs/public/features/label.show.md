# Data labels on marks

ChartKit: **native**

Print values on bars, points, slices

Matrix status: `native`. Verification: `runtime-probe` (strong).

Line, stacked area, scatter, bar, and donut draw mark.labels. CK3012 is gone. Overlapping labels are skipped.

Source: packages/core/src/generated/schema.ts:887

## ChartKit spec

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    {
      "lane": "A",
      "stops": 12
    },
    {
      "lane": "C",
      "stops": 15
    }
  ],
  "encoding": {
    "x": "lane",
    "y": "stops"
  },
  "a11y": {
    "alt": "Lane C has more."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "mark": {
    "labels": true
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | native | LabelList, Bar.label | dts-path (strong) | recharts/types/component/LabelList.d.ts:146, recharts/types/cartesian/Bar.d.ts:259 |
| Apache ECharts | native | series.label.show | dts-path (strong) | echarts/types/dist/shared.d.ts:7875 |
| Highcharts | native | plotOptions.series.dataLabels.enabled | dts-path (strong) | highcharts/options/series.d.ts:232 |
| Plotly.js | native | trace.text, trace.textposition | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,box,candlestick,choropleth,choroplethmap,…}.attributes.text, plot-schema.json#traces.{bar,funnel,funnelarea,histogram,icicle,pie,…}.attributes.textposition |
| Nivo | native | Bar.enableLabel | dts-path (strong) | @nivo/bar/dist/types/types.d.ts:154 |
| Victory | native | VictoryBar.labels | dts-path (strong) | victory-core/lib/types/prop-types.d.ts:117 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 Text per datum |
| ApexCharts | native | dataLabels.enabled | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4708 |
| Tremor (npm) | none | — | dts-absence (absence) | — no data labels (BarList shows values) |
| Observable Plot | native | text | dts-path (strong) | @observablehq/plot/src/marks/text.d.ts:211 |
| Vega-Lite | native | mark=text | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native | series.label | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:38 |
| amCharts 5 | native | ~LabelBullet\|labels | dts-grep (weak) | @amcharts/amcharts5/xy.d.ts:13 |
| Google Charts | native | ~annotations | dts-grep (weak) | @types/google.visualization/index.d.ts:402 annotation role or pieSliceText |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | partial | ~lastValueVisible | dts-grep (weak) | 4032:	lastValueVisible last value label on price scale |
| MUI X Charts | native | BarChart.series.barLabel | dts-path (strong) | @mui/x-charts/models/seriesType/bar.d.mts:53 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.pie.textPosition | dts-path (strong) | mermaid/dist/config.type.d.ts:938 pie labels |
| AntV G2 | native | ~label | dts-grep (weak) | @antv/g2/lib/index.d.ts:165 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b64aa4f4c004.

https://chartkit.dev/features.json
