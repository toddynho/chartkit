# Line caps / joins

ChartKit: **native**

Stroke cap and join styles

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:891

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
    "linecap": "round"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.data.datasets.borderCapStyle, ChartConfiguration.data.datasets.borderJoinStyle | dts-path (strong) | chart.js/dist/types/index.d.ts:1914, chart.js/dist/types/index.d.ts:1929 |
| Recharts | native | Line.strokeLinecap | dts-path (strong) | @types/react/index.d.ts:3925 |
| Apache ECharts | native | series.lineStyle.cap, series.lineStyle.join | dts-path (strong) | echarts/types/dist/shared.d.ts:7783, echarts/types/dist/shared.d.ts:7784 |
| Highcharts | native | plotOptions.series.linecap | dts-path (strong) | highcharts/options/series.d.ts:1039 |
| Plotly.js | none | — | dts-absence (absence) | — |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | native | VictoryLine.style | dts-path (strong) | victory-line/lib/victory-line.d.ts:84 |
| visx | native | LinePath.strokeLinecap | dts-path (strong) | @types/react/index.d.ts:3925 |
| ApexCharts | native | stroke.lineCap | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2650 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~strokeLinecap | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:373 |
| Vega-Lite | native | ~strokeCap | dts-grep (weak) | 725:        "strokeCap" |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | native | ~strokeLinecap\|lineJoin | dts-grep (weak) | @amcharts/amcharts5/.internal/core/render/scene/SceneNode.d.ts:144 |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.series.cap | dts-path (strong) | uplot/dist/uPlot.d.ts:944 |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | partial | ~strokeLinecap | dts-grep (weak) | @mui/x-charts/ChartsXAxis/useAxisTicksProps.d.ts:4148 via sx |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~lineCap | dts-grep (weak) | @antv/g2/lib/theme/create.d.ts:53 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
