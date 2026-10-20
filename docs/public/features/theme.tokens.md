# Design tokens (colours, font, grid, axis)

ChartKit: **native**

Override base theme tokens

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:344

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
      "axis": "#5c6b7a"
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~defaults | dts-grep (weak) | chart.js/dist/types/index.d.ts:561 Chart.defaults.font / color |
| Recharts | partial | ~style | dts-grep (weak) | recharts/types/theme/graphicalItemIdentity.d.ts:5 |
| Apache ECharts | native | textStyle, backgroundColor | dts-path (strong) | echarts/types/dist/shared.d.ts:7437, echarts/types/dist/shared.d.ts:7435 |
| Highcharts | native | chart.style, ~setOptions | dts-path (strong) | highcharts/highcharts.d.ts:6649, highcharts/highcharts.src.d.ts:619 |
| Plotly.js | native | layout.font, layout.paper_bgcolor | dts-path (strong) | plot-schema.json#layout.layoutAttributes.font, plot-schema.json#layout.layoutAttributes.paper_bgcolor |
| Nivo | native | Line.theme | dts-path (strong) | @nivo/line/dist/types/types.d.ts:136 theme object (text, axis, grid, tooltip...) |
| Victory | native | VictoryChart.theme | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:58 |
| visx | native | ~buildChartTheme | dts-grep (weak) | @visx/xychart/lib/index.d.ts:38 |
| ApexCharts | native | chart.fontFamily, chart.foreColor | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1826, apexcharts/types/apexcharts.d.ts:1825 |
| Tremor (npm) | partial | ~tremor | dts-grep (weak) | @tremor/react/dist/lib/tremorTwMerge.d.ts:1 tailwind config tokens |
| Observable Plot | native | ~style\|fontFamily | dts-grep (weak) | @observablehq/plot/src/plot.d.ts:13 |
| Vega-Lite | native | ~config\|font | dts-grep (weak) | 130:    "AnyMarkConfig" |
| AG Charts | native | ~theme | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:38 theme.params / overrides |
| amCharts 5 | native | ~Theme\|rule | dts-grep (weak) | @amcharts/amcharts5/xy.d.ts:32 theme rules |
| Google Charts | native | ~fontName\|backgroundColor | dts-grep (weak) | @types/google.visualization/index.d.ts:372 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 per-option |
| TradingView Lightweight Charts | native | ~layout\|textColor\|fontFamily | dts-grep (weak) | 323: * 	      fontFamily |
| MUI X Charts | native | ~ThemeProvider\|chartsGridClasses | dts-grep (weak) | @mui/x-charts/ChartsGrid/index.d.ts:2 |
| Mermaid (chart-ish diagrams only) | native | MermaidConfig.themeVariables | dts-path (strong) | mermaid/dist/config.type.d.ts:70 |
| AntV G2 | native | ~theme | dts-grep (weak) | @antv/g2/lib/index.d.ts:105 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against ab69724f4cc6.

https://chartkit.dev/features.json
