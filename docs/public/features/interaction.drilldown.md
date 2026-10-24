# Drilldown

ChartKit: **native**

Click a mark to drill into a child dataset

Matrix status: `native`. Verification: `runtime-probe` (strong).

interaction.drilldown.children maps a category to a child JSON spec. Click, Enter, or Space swaps to that spec. Back and Escape pop. The server SVG lists the keys on data-ck-drill. An empty map warns CK3037. A child with no type warns CK3038. A key that is not a field warns CK3039.

Source: packages/core/src/interact.ts

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
  "interaction": {
    "drilldown": {
      "key": "quarter",
      "children": {
        "Q1": {
          "version": "1",
          "type": "bar",
          "data": [
            {
              "name": "East",
              "units": 12
            },
            {
              "name": "West",
              "units": 9
            }
          ],
          "encoding": {
            "x": "name",
            "y": "units"
          },
          "a11y": {
            "alt": "East leads West in this category."
          }
        }
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
| Apache ECharts | native | series.nodeClick | dts-path (strong) | echarts/types/dist/shared.d.ts:11442 treemap/sunburst zoomToNode; universal transition for drilldown |
| Highcharts | native | drilldown.series | dts-path (strong) | highcharts/highcharts.d.ts:10666 drilldown module |
| Plotly.js | partial | ~level | dts-grep (weak) | @types/plotly.js/index.d.ts:265 treemap/sunburst/icicle drill by click |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | manual | TopLevelSpec.layer | dts-mechanism (weak) | vega-lite/build/spec/layer.d.ts:27 |
| AG Charts | native | ~drilldown\|navigat | dts-grep (weak) | ag-charts-types/dist/types/src/main.d.ts:31 treemap/sunburst click to drill |
| amCharts 5 | native | ~zoomable\|selectedDataItem | dts-grep (weak) | @amcharts/amcharts5/index.d.ts:17 hierarchy zoomable / drill |
| Google Charts | native | ~maxDepth | dts-grep (weak) | @types/google.visualization/index.d.ts:1148 TreeMap drill by click |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~drillDown | dts-grep (weak) | @antv/g2/lib/index.d.ts:156 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
