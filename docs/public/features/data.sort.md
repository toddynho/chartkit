# Sorting categories

ChartKit: **native**

Sort bars/categories by value or custom order

Matrix status: `native`. Verification: `dts-path` (strong).

sort by a field or by value, ascending or descending

Source: chartkit:packages/core/src/sort.ts:1

## ChartKit spec

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    {
      "lane": "A",
      "stops": 12
    },
    {
      "lane": "C",
      "stops": 15
    }
  ],
  "encoding": {
    "x": "lane",
    "y": "stops"
  },
  "a11y": {
    "alt": "Lane C has more."
  },
  "size": {
    "width": 640,
    "height": 260
  },
  "sort": {
    "by": "value",
    "order": "descending"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | unknown | — | conflict (unknown) | — |
| Recharts | unknown | — | conflict (unknown) | — |
| Apache ECharts | native | dataset.transform | dts-path (strong) | echarts/types/dist/shared.d.ts:5304 sort transform |
| Highcharts | native | ~dataSorting | dts-grep (weak) | highcharts/options/zigzag.src.d.ts:404 dataSorting.enabled |
| Plotly.js | native | layout.xaxis.categoryorder | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.categoryorder |
| Nivo | unknown | — | conflict (unknown) | — |
| Victory | native | VictoryBar.sortKey, VictoryBar.sortOrder | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:13, victory-core/lib/victory-util/common-props.d.ts:14 |
| visx | unknown | — | conflict (unknown) | — |
| ApexCharts | unknown | — | conflict (unknown) | — |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | native | ~sort | dts-grep (weak) | @observablehq/plot/src/mark.d.ts:2 mark sort option + scale domain sort |
| Vega-Lite | native | ~SortField\|sort | dts-grep (weak) | 101:    "AllSortString" |
| AG Charts | unknown | — | conflict (unknown) | — |
| amCharts 5 | unknown | ~sortBy\|sortAsc | unverified (unknown) | — categoryAxis sorting via data.sort |
| Google Charts | native | ~sortColumn | dts-grep (weak) | @types/google.visualization/index.d.ts:169 |
| uPlot | unknown | — | conflict (unknown) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | unknown | — | conflict (unknown) | — |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | native | ~sortX | dts-grep (weak) | @antv/g2/lib/index.d.ts:45 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against fb308ab4f88e.

https://chartkit.dev/features.json
