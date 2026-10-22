# Responsive width (fill container)

ChartKit: **native**

Auto-resize to the container

Matrix status: `native`. Verification: `dts-path` (strong).

'auto' fills container and follows resizes

Source: chartkit:packages/core/src/generated/schema.ts:1097

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
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ~responsive\|maintainAspectRatio | dts-grep (weak) | chart.js/dist/types/index.d.ts:1650 |
| Recharts | native | ResponsiveContainer | dts-path (strong) | recharts/types/component/ResponsiveContainer.d.ts:76 |
| Apache ECharts | native | ~resize | dts-grep (weak) | echarts/types/src/util/types.d.ts:348 chart.resize() on window resize (manual hook) |
| Highcharts | native | chart.reflow | dts-path (strong) | highcharts/highcharts.d.ts:6538 |
| Plotly.js | native | config.responsive | dts-path (strong) | plot-schema.json#config.responsive |
| Nivo | native | ResponsiveLine | dts-path (strong) | @nivo/line/dist/types/ResponsiveLine.d.ts:4 |
| Victory | native | VictoryChart.width | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:55 responsive via viewBox by default |
| visx | native | ParentSize, ScaleSVG | dts-path (strong) | @visx/responsive/lib/components/ParentSize.d.ts:20, @visx/responsive/lib/components/ScaleSVG.d.ts:18 |
| ApexCharts | native | chart.width | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1765 '100%' |
| Tremor (npm) | native | LineChart | dts-path (strong) | @tremor/react/dist/index.d.ts:130 fills parent by default |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 fixed width; re-render on resize |
| Vega-Lite | native | ~container | dts-grep (weak) | 4264:          "description" width: 'container' |
| AG Charts | native | ~width\|minWidth | dts-grep (weak) | ag-charts-types/dist/types/src/serverSideRenderingOptions.d.ts:6 fills container by default |
| amCharts 5 | native | ~autoResize | dts-grep (weak) | @amcharts/amcharts5/.internal/core/Root.d.ts:373 root autoResize |
| Google Charts | unknown | — | unverified (unknown) | — redraw on resize |
| uPlot | manual | Options.hooks | dts-mechanism (weak) | uplot/dist/uPlot.d.ts:394 setSize() on resize |
| TradingView Lightweight Charts | native | ~autoSize | dts-grep (weak) | 938:	 * Please pay attention that `autoSize` option and explicit sizes options `width` and `height` don't conflict with one another. |
| MUI X Charts | native | LineChart.width | dts-path (strong) | @mui/x-charts/internals/plugins/corePlugins/useChartDimensions/useChartDimensions.types.d.mts:25 fills parent when omitted |
| Mermaid (chart-ish diagrams only) | native | ~useMaxWidth | dts-grep (weak) | mermaid/dist/setupGraphViewbox.d.ts:1 |
| AntV G2 | native | ~autoFit | dts-grep (weak) | @antv/g2/lib/component/slider.d.ts:7 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against b64aa4f4c004.

https://chartkit.dev/features.json
