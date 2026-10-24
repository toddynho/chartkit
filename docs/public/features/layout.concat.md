# Composed dashboards / concatenation

ChartKit: **native**

Multiple views in one spec

Matrix status: `native`. Verification: `runtime-probe` (strong).

layout.concat.views is a list of chart specs stacked vertically, placed in a row, or wrapped with columns. A view may set span to cover more than one column. An empty list warns CK3044. A view with no type warns CK3045. Facet and concat together warn CK3048.

Source: packages/core/src/layout.ts

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
    "alt": "Units rose while cost fell."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "layout": {
    "concat": {
      "direction": "vertical",
      "views": [
        {
          "version": "1",
          "type": "bar",
          "title": "Units",
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
          }
        },
        {
          "version": "1",
          "type": "line",
          "title": "Cost",
          "data": [
            {
              "quarter": "Q1",
              "cost": 18
            },
            {
              "quarter": "Q2",
              "cost": 14
            }
          ],
          "encoding": {
            "x": "quarter",
            "y": "cost"
          },
          "a11y": {
            "alt": "Cost fell in Q2."
          }
        }
      ]
    }
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | none | — | dts-absence (absence) | — |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | grid | dts-path (strong) | echarts/types/dist/shared.d.ts:12570 multiple coordinate systems in one option |
| Highcharts | none | — | dts-absence (absence) | — |
| Plotly.js | native | layout.grid | dts-path (strong) | plot-schema.json#layout.layoutAttributes.grid |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~hconcat\|vconcat | dts-grep (weak) | 5232:          "description" |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | none | — | dts-absence (absence) | — |
| Google Charts | native | Dashboard | dts-path (strong) | @types/google.visualization/index.d.ts:1352 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | native | IChartApi.panes | dts-path (strong) | lightweight-charts/dist/typings.d.ts:1779 |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | ~spaceFlex\|spaceLayer | dts-grep (weak) | @antv/g2/lib/index.d.ts:159 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ee06d7ac9aa.

https://chartkit.dev/features.json
