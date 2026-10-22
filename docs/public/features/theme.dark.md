# Dark mode

ChartKit: **native**

Dark theme / auto light-dark

Matrix status: `native`. Verification: `dts-path` (strong).

dark preset, or auto light/dark by default; theme.mode light|dark warns CK3012 since PR #16

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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 set colours manually |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | ~dark | dts-grep (weak) | echarts/types/src/util/types.d.ts:581 init(el, 'dark') |
| Highcharts | native | ~dark | dts-grep (weak) | highcharts/highcharts.src.d.ts:680 dark themes / adaptive theme module |
| Plotly.js | native | layout.template | dts-path (strong) | plot-schema.json#layout.layoutAttributes.template plotly_dark |
| Nivo | partial | Line.theme | dts-path (strong) | @nivo/line/dist/types/types.d.ts:136 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | ~darkTheme | dts-grep (weak) | @visx/xychart/lib/index.d.ts:37 |
| ApexCharts | native | theme.mode=dark | dts-path (strong) | apexcharts/types/apexcharts.d.ts:5303 |
| Tremor (npm) | partial | ~dark | dts-grep (weak) | @tremor/react/dist/lib/theme.d.ts:9 Tailwind dark: classes |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 CSS currentColor |
| Vega-Lite | plugin | — | npm (weak) | — dark theme |
| AG Charts | native | ~dark | dts-grep (weak) | ag-charts-community/dist/types/src/integrated-charts-theme.d.ts:24 |
| amCharts 5 | native | ~DarkTheme | dts-grep (weak) | @amcharts/amcharts5/themes/SpiritedDark.d.ts:1 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~ColorType\|background | dts-grep (weak) | 26:export declare enum ColorType { |
| MUI X Charts | native | ~palette\|dark | dts-grep (weak) | @mui/x-charts/index.d.ts:5 follows MUI palette mode |
| Mermaid (chart-ish diagrams only) | native | ~darkMode\|dark | dts-grep (weak) | mermaid/dist/utils.d.ts:25 |
| AntV G2 | native | ~dark | dts-grep (weak) | @antv/g2/lib/index.d.ts:106 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b64aa4f4c004.

https://chartkit.dev/features.json
