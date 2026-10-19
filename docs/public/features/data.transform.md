# Built-in data transforms

ChartKit: **partial**

Filter, aggregate, bin, fold, pivot, window inside the spec

Matrix status: `partial`. Verification: `dts-path` (strong).

histogram binning and boxplot stats only

Source: chartkit:packages/core/src/generated/schema.ts:903

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
  "mark": {
    "bins": 4
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | partial | ChartConfiguration.options.parsing | dts-path (strong) | chart.js/dist/types/index.d.ts:54 |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | dataset.transform | dts-path (strong) | echarts/types/dist/shared.d.ts:5304 filter, sort, + registerTransform (ecStat) |
| Highcharts | partial | ~dataGrouping | dts-grep (weak) | highcharts/highcharts.src.d.ts:394 Stock dataGrouping only |
| Plotly.js | unknown | ~transforms | unverified (unknown) | — transforms removed in v3; aggregation by histogram/histfunc |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | binX, groupX | dts-path (strong) | @observablehq/plot/src/transforms/bin.d.ts:201, @observablehq/plot/src/transforms/group.d.ts:122 rich transform library |
| Vega-Lite | native | TopLevelSpec.transform | dts-path (strong) | vega-lite/build/spec/base.d.ts:34 |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~DataProcessor | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:68 data processor for dates/numbers only |
| Google Charts | native | ~data.group\|DataView | dts-grep (weak) | @types/google.visualization/index.d.ts:35 google.visualization.data.group / DataView |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~transform | dts-grep (weak) | @antv/g2/lib/index.d.ts:27 sortX, groupX, binX, stackY, normalizeY... |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against bdf969b7d123.

https://chartkit.dev/features.json
