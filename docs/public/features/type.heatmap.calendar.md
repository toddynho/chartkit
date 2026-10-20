# Calendar heatmap

ChartKit: **native**

Days laid out as a calendar grid

Matrix status: `native`. Verification: `dts-path` (strong).

Cells stay square, or at most 1.5:1, and cap at 32px. Extra width centres the grid. The last week includes the latest day. Unsized calendars stay at 12px.

Source: chartkit:packages/core/src/generated/schema.ts:2165

## ChartKit spec

```json
{
  "version": "1",
  "type": "heatmap",
  "data": [
    {
      "date": "2026-01-01",
      "value": 1
    },
    {
      "date": "2026-01-02",
      "value": 4
    },
    {
      "date": "2026-01-03",
      "value": 2
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "color": {
      "field": "value"
    }
  },
  "mark": {
    "layout": "calendar"
  },
  "a11y": {
    "alt": "Activity peaked on January 2."
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
| Chart.js | plugin | — | npm (weak) | — matrix recipe |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | calendar | dts-path (strong) | echarts/types/dist/shared.d.ts:12581 calendar coordinate + heatmap series |
| Highcharts | partial | series.type=heatmap | dts-path (strong) | highcharts/options/abands.d.ts:1386 documented calendar heatmap demo |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | native | Calendar, TimeRange | dts-path (strong) | @nivo/calendar/dist/types/Calendar.d.ts:1, @nivo/calendar/dist/types/TimeRange.d.ts:1 |
| Victory | none | — | dts-absence (absence) | — |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | unknown | — | unverified (unknown) | — |
| Tremor (npm) | native | Tracker | dts-path (strong) | @tremor/react/dist/index.d.ts:703 day-status strip, not a full calendar |
| Observable Plot | native | cell | dts-path (strong) | @observablehq/plot/src/marks/cell.d.ts:47 cell with utcWeek/utcDay channels (documented) |
| Vega-Lite | native | mark=rect, ~day | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19, 1645:          "description" timeUnit day/week |
| AG Charts | unknown | — | unverified (unknown) | — |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | native | Calendar | dts-path (strong) | @types/google.visualization/index.d.ts:1397 |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3347c1854d67.

https://chartkit.dev/features.json
