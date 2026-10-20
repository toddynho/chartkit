# Error bars

ChartKit: **native**

Uncertainty whiskers on points or bars

Matrix status: `native`. Verification: `dts-path` (strong).

Whiskers on point or bar marks, from low and high or a ± field.

Source: chartkit:packages/core/src/charts/errorbar.ts:1

## ChartKit spec

```json
{
  "version": "1",
  "type": "errorbar",
  "data": [
    {
      "assay": "A",
      "mean": 5.2,
      "lo": 4.9,
      "hi": 5.5
    }
  ],
  "encoding": {
    "x": "assay",
    "y": "mean",
    "low": "lo",
    "high": "hi"
  },
  "a11y": {
    "alt": "A reads 5.2."
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
| Recharts | native | ErrorBar | dts-path (strong) | recharts/types/cartesian/ErrorBar.d.ts:121 |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 custom series example |
| Highcharts | native | series.type=errorbar | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.error_y | dts-path (strong) | plot-schema.json#traces.{bar,histogram,scatter,scatter3d,scattergl}.attributes.error_y |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryErrorBar | dts-path (strong) | victory-errorbar/lib/victory-errorbar.d.ts:27 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | none | — | dts-absence (absence) | — no native error bars (boxPlot/rangeBar workarounds) |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ruleX, tickY | dts-path (strong) | @observablehq/plot/src/marks/rule.d.ts:114, @observablehq/plot/src/marks/tick.d.ts:72 compose |
| Vega-Lite | native | mark=errorbar | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19 |
| AG Charts | native (ent) | series.errorBar | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/barOptions.d.ts:114 |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | partial | ~interval | dts-grep (weak) | @types/google.visualization/index.d.ts:46 interval role style:'bars' |
| uPlot | partial | Options.bands | dts-path (strong) | uplot/dist/uPlot.d.ts:377 whisker demo |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against da8da9d595d9.

https://chartkit.dev/features.json
