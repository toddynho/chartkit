# Built-in themes

ChartKit: **native**

Named theme presets

Matrix status: `native`. Verification: `dts-path` (strong).

20+ presets

Source: chartkit:packages/core/src/generated/schema.ts:315

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
    "preset": "midnight"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — defaults only; Colors plugin |
| Recharts | unknown | — | conflict (unknown) | — style via props/CSS |
| Apache ECharts | native | ~registerTheme | dts-grep (weak) | echarts/types/src/core/echarts.d.ts:411 echarts.init(el, 'dark'), registerTheme |
| Highcharts | native | ~theme | dts-grep (weak) | highcharts/highcharts.src.d.ts:1415 Highcharts.setOptions + themes/ (dark-unica, grid-light...) |
| Plotly.js | native | layout.template | dts-path (strong) | plot-schema.json#layout.layoutAttributes.template plotly, plotly_dark, ggplot2, seaborn... |
| Nivo | native | Line.theme | dts-path (strong) | @nivo/line/dist/types/types.d.ts:136 |
| Victory | native | VictoryChart.theme | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:58 grayscale, material, clean |
| visx | native | ~buildChartTheme\|lightTheme\|darkTheme | dts-grep (weak) | @visx/xychart/lib/index.d.ts:36 |
| ApexCharts | native | theme.palette, theme.mode | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5304, apexcharts/types/apexcharts.d.ts:5303 |
| Tremor (npm) | unknown | — | conflict (unknown) | — Tailwind-based styling |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~config\|theme | dts-grep (weak) | 130:    "AnyMarkConfig" vega-themes (separate package) |
| AG Charts | native | ~theme | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:38 ag-default, ag-sheets, ag-polychroma, ag-vivid, ag-material + dark |
| amCharts 5 | native | ~AnimatedTheme\|DarkTheme | dts-grep (weak) | @amcharts/amcharts5/.internal/themes/KellyDarkTheme.d.ts:10 themes package (Animated, Dark, Dataviz...) |
| Google Charts | native | ~theme | dts-grep (weak) | @types/google.visualization/index.d.ts:696 theme: 'material' only |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | ~layout\|background | dts-grep (weak) | 515:	 * The crosshair marker background color. An empty string falls back to the color of the series under the crosshair. |
| MUI X Charts | unknown | ~ThemeProvider | unverified (unknown) | — MUI theme |
| Mermaid (chart-ish diagrams only) | native | ~theme | dts-grep (weak) | mermaid/dist/utils.d.ts:11 default, neutral, dark, forest, base |
| AntV G2 | native | ~theme | dts-grep (weak) | @antv/g2/lib/index.d.ts:105 light, dark, classic, academy |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.

https://chartkit.dev/features.json
