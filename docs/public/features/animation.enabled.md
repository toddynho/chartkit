# Animation on/off

ChartKit: **native**

Enable/disable animation

Matrix status: `native`. Verification: `dts-path` (strong).

client interact; disabled for >2000 points

Source: chartkit:packages/core/src/generated/schema.ts:73

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
| Chart.js | native | ~animation | dts-grep (weak) | chart.js/dist/types/index.d.ts:7 options.animation |
| Recharts | native | Line.isAnimationActive | dts-path (strong) | recharts/types/cartesian/Line.d.ts:144 |
| Apache ECharts | native | animation | dts-path (strong) | echarts/types/dist/shared.d.ts:7659 |
| Highcharts | native | chart.animation, plotOptions.series.animation | dts-path (strong) | highcharts/highcharts.d.ts:6275, highcharts/options/series.d.ts:589 |
| Plotly.js | native | layout.transition | dts-path (strong) | plot-schema.json#layout.layoutAttributes.transition |
| Nivo | native | Line.animate | dts-path (strong) | @nivo/line/dist/types/types.d.ts:188 |
| Victory | native | VictoryChart.animate | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:20 |
| visx | native | ~AnimatedLineSeries\|react-spring | dts-grep (weak) | @visx/react-spring/package.json:2 |
| ApexCharts | native | chart.animations.enabled | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2325 |
| Tremor (npm) | native | LineChart.showAnimation | dts-path (strong) | @tremor/react/dist/index.d.ts:38 |
| Observable Plot | none | — | dts-absence (absence) | — static output |
| Vega-Lite | none | — | dts-absence (absence) | — no transitions |
| AG Charts | native | ~animation | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:3 |
| amCharts 5 | native | ~animate\|duration | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Serializer.d.ts:147 sprite.animate / series.appear() |
| Google Charts | native | ~animation | dts-grep (weak) | @types/google.visualization/index.d.ts:518 animation: {startup, duration} |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | native | LineChart.skipAnimation | dts-path (strong) | @mui/x-charts/LineChart/LineChart.d.mts:71 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~animate | dts-grep (weak) | @antv/g2/lib/runtime/transform.d.ts:16 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7fd168ebe9c0.

https://chartkit.dev/features.json
