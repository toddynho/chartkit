# Candlestick

ChartKit: **native**

Open/high/low/close bodies and wicks

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "candlestick",
  "data": [
    {
      "day": "D1",
      "open": 5,
      "high": 7,
      "low": 4,
      "close": 6
    }
  ],
  "encoding": {
    "x": "day",
    "open": "open",
    "high": "high",
    "low": "low",
    "close": "close"
  },
  "a11y": {
    "alt": "D1 closed up."
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
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | native | series.type=candlestick | dts-path (strong) | echarts/types/dist/shared.d.ts:11176 |
| Highcharts | native | series.type=candlestick | dts-path (strong) | highcharts/options/abands.d.ts:1386 Highcharts Stock |
| Plotly.js | native | trace.type=candlestick | dts-path (strong) | plot-schema.json#traces.candlestick |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryCandlestick | dts-path (strong) | victory-candlestick/lib/victory-candlestick.d.ts:69 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.type=candlestick | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ruleX, ~stroke | dts-path (strong) | @observablehq/plot/src/marks/rule.d.ts:114, @observablehq/plot/src/symbol.d.ts:15 documented candlestick with ruleX |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 layered rule + bar |
| AG Charts | native (ent) | series.type=candlestick | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | CandlestickSeries | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/series/CandlestickSeries.d.ts:27 |
| Google Charts | native | CandlestickChart | dts-path (strong) | @types/google.visualization/index.d.ts:1260 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 candlestick demo plugin |
| TradingView Lightweight Charts | native | CandlestickSeries | dts-path (strong) | lightweight-charts/dist/typings.d.ts:8 |
| MUI X Charts | native (premium) | CandlestickChart | dts-path (strong) | @mui/x-charts-premium/CandlestickChart/CandlestickChart.d.mts:66 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7fd168ebe9c0.

https://chartkit.dev/features.json
