# Duration and easing

ChartKit: **partial**

Control animation length and curve

Matrix status: `partial`. Verification: `dts-path` (strong).

duration works (client interact); easing warns CK3012 since PR #16

Source: chartkit:packages/core/src/generated/schema.ts:407

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
  "animation": {
    "duration": 200
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~easing\|duration | dts-grep (weak) | chart.js/dist/types/index.d.ts:6 |
| Recharts | native | Line.animationDuration, Line.animationEasing | dts-path (strong) | recharts/types/cartesian/Line.d.ts:57, recharts/types/cartesian/Line.d.ts:62 |
| Apache ECharts | native | animationDuration, animationEasing | dts-path (strong) | echarts/types/dist/shared.d.ts:7668, echarts/types/dist/shared.d.ts:7672 |
| Highcharts | native | chart.animation | dts-path (strong) | highcharts/highcharts.d.ts:6275 {duration, easing} |
| Plotly.js | native | layout.transition.duration, layout.transition.easing | dts-path (strong) | plot-schema.json#layout.layoutAttributes.transition.duration, plot-schema.json#layout.layoutAttributes.transition.easing |
| Nivo | native | Line.motionConfig | dts-path (strong) | @nivo/line/dist/types/types.d.ts:189 |
| Victory | native | VictoryChart.animate | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:20 {duration, easing} |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 react-spring config |
| ApexCharts | native | chart.animations.speed, chart.animations.easing | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2327, apexcharts/types/apexcharts.d.ts:2334 |
| Tremor (npm) | native | LineChart.animationDuration | dts-path (strong) | @tremor/react/dist/index.d.ts:37 |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | unknown | — | conflict (unknown) | — |
| AG Charts | native | ~duration | dts-grep (weak) | ag-charts-types/dist/types/src/chart/types.d.ts:40 |
| amCharts 5 | native | ~duration\|easing | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:43 |
| Google Charts | native | ~easing\|duration | dts-grep (weak) | @types/google.visualization/index.d.ts:520 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~duration\|easing | dts-grep (weak) | @antv/g2/lib/animation/types.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 668873d6cd29.

https://chartkit.dev/features.json
