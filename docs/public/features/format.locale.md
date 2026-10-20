# Locale-aware formatting (i18n)

ChartKit: **native**

Decimal/thousand separators, month names per locale

Matrix status: `native`. Verification: `dts-path` (strong).

BCP 47 via Intl

Source: chartkit:packages/core/src/generated/schema.ts:77

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
  "locale": "en-US"
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~locale | dts-grep (weak) | chart.js/dist/types/index.d.ts:1669 options.locale |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | ~locale | dts-grep (weak) | echarts/types/src/core/locale.d.ts:3 init(el, theme, {locale}) + registerLocale |
| Highcharts | native | lang, ~locale | dts-path (strong) | highcharts/highcharts.d.ts:93572, highcharts/highcharts.src.d.ts:10133 |
| Plotly.js | native | config.locale, layout.separators | dts-path (strong) | plot-schema.json#config.locale, plot-schema.json#layout.layoutAttributes.separators |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.locales, chart.defaultLocale | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2120, apexcharts/types/apexcharts.d.ts:2121 |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | native | ~locale | dts-grep (weak) | @observablehq/plot/src/format.d.ts:3 numbers and dates use locale |
| Vega-Lite | plugin | — | npm (weak) | — formatLocale / timeFormatLocale |
| AG Charts | native | ~locale | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:197 ag-charts-locale package |
| amCharts 5 | native | ~locale | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/ChartSerializer.d.ts:12 am5locales |
| Google Charts | native | ~language | dts-grep (weak) | @types/google.visualization/index.d.ts:21 google.charts.load({language}) |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | native | ~locale | dts-grep (weak) | 3335: * Represents options for formatting dates, times, and prices according to a locale. localization.locale |
| MUI X Charts | native | ChartsLocalizationProvider | dts-path (strong) | @mui/x-charts/ChartsLocalizationProvider/ChartsLocalizationProvider.d.mts:23 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | unknown | ~locale | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
