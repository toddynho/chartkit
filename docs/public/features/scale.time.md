# Time scale

ChartKit: **native**

Continuous time axis with calendar-aware ticks

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:683

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
    "x": {
      "field": "quarter",
      "scale": {
        "type": "time"
      }
    },
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
| Chart.js | native | ~TimeScale\|timeseries | dts-grep (weak) | chart.js/dist/types/index.d.ts:3380 requires date adapter |
| Recharts | native | XAxis.scale=time | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:84 |
| Apache ECharts | native | xAxis.type=time | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 |
| Highcharts | native | xAxis.type=datetime | dts-path (strong) | highcharts/highcharts.d.ts:108788 |
| Plotly.js | native | layout.xaxis.type=date | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.type |
| Nivo | native | ~TimeScale | dts-grep (weak) | @nivo/static/dist/types/mappings/commons/scales.d.ts:4 |
| Victory | native | ~time | dts-grep (weak) | victory-shared-events/lib/victory-shared-events.d.ts:17 |
| visx | native | ~scaleTime | dts-grep (weak) | @visx/scale/lib/index.d.ts:5 |
| ApexCharts | native | xaxis.type=datetime | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4897 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~utc | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:181 |
| Vega-Lite | native | ~temporal | dts-grep (weak) | 1165:          "description" |
| AG Charts | native | ~"time" | dts-grep (weak) | ag-charts-community/dist/types/src/scale/timeScale.d.ts:6 |
| amCharts 5 | native | DateAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/DateAxis.d.ts:175 |
| Google Charts | native | ~datetime | dts-grep (weak) | @types/google.visualization/index.d.ts:1556 |
| uPlot | native | ~time | dts-grep (weak) | 147:	/** converts a Date into new Date that's time-adjusted for the given IANA Time Zone Name */ |
| TradingView Lightweight Charts | native | ~Time | dts-grep (weak) | 165: * Represents the type of a tick mark on the time axis. |
| MUI X Charts | native | LineChart.xAxis.scaleType=time | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | native | ~dateFormat | dts-grep (weak) | mermaid/dist/diagrams/gantt/ganttDb.d.ts:9 gantt axis |
| AntV G2 | native | ~time | dts-grep (weak) | @antv/g2/lib/index.d.ts:11 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3d041a41af6e.

https://chartkit.dev/features.json
