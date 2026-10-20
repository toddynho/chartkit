# Compact / SI number abbreviations

ChartKit: **native**

1.2k, 3.4M style

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:644

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
  "axes": {
    "y": {
      "format": {
        "style": "compact"
      }
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | lang.numericSymbols | dts-path (strong) | highcharts/highcharts.d.ts:12888 |
| Plotly.js | native | layout.yaxis.exponentformat=SI | dts-path (strong) | plot-schema.json#layout.layoutAttributes.yaxis.exponentformat |
| Nivo | native | ~format | dts-grep (weak) | @nivo/legends/dist/types/types.d.ts:3 '.2s' |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | unknown | — | unverified (unknown) | — |
| Observable Plot | native | ~tickFormat | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:591 '~s' |
| Vega-Lite | native | ~format | dts-grep (weak) | 84:          "description" '.2s' |
| AG Charts | native | ~format | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:3 '~s' |
| amCharts 5 | native | ~bigNumberPrefixes\|numberFormat | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:159 |
| Google Charts | native | ~compact\|short | dts-grep (weak) | @types/google.visualization/index.d.ts:1577 NumberFormat pattern 'short' |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~labelFormatter | dts-grep (weak) | @antv/g2/lib/component/legendCategory.d.ts:5 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a53ab56c775.

https://chartkit.dev/features.json
