# Histogram

ChartKit: **native**

Binned distribution of one variable

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:24

## ChartKit spec

```json
{
  "version": "1",
  "type": "histogram",
  "data": [
    {
      "x": 1
    },
    {
      "x": 2
    },
    {
      "x": 2
    },
    {
      "x": 8
    }
  ],
  "encoding": {
    "x": "x"
  },
  "mark": {
    "bins": 2
  },
  "a11y": {
    "alt": "Most are low."
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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 pre-bin + bar |
| Recharts | manual | Customized | dts-mechanism (weak) | recharts/types/component/Customized.d.ts:26 |
| Apache ECharts | plugin | — | npm (weak) | — ecStat transform; or pre-bin |
| Highcharts | native | series.type=histogram | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | native | trace.type=histogram | dts-path (strong) | plot-schema.json#traces.histogram |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | native | VictoryHistogram | dts-path (strong) | victory-histogram/lib/victory-histogram.d.ts:73 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | partial | chart.type=histogram | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 bar with pre-binned data |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | binX, rectY | dts-path (strong) | @observablehq/plot/src/transforms/bin.d.ts:201, @observablehq/plot/src/marks/rect.d.ts:270 rectY(data, binX()) |
| Vega-Lite | native | ~bin | dts-grep (weak) | 1172:          "description" encoding.x.bin |
| AG Charts | native | series.type=histogram | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 documented histogram via data processing |
| Google Charts | native | Histogram | dts-path (strong) | @types/google.visualization/index.d.ts:866 |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 |
| TradingView Lightweight Charts | unknown | — | conflict (unknown) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~binX | dts-grep (weak) | @antv/g2/lib/index.d.ts:28 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against c0ed28f0cadd.

https://chartkit.dev/features.json
