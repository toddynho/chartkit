# Time values (Date/ISO/epoch)

ChartKit: **native**

Accepts dates as Date objects, ISO strings or epoch numbers

Matrix status: `native`. Verification: `dts-path` (strong).

Source: chartkit:packages/core/src/generated/schema.ts:428

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
      "type": "temporal"
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
| Chart.js | plugin | — | npm (weak) | — time scale needs a date adapter |
| Recharts | partial | XAxis.scale=time | dts-path (strong) | recharts/types/cartesian/XAxis.d.ts:84 |
| Apache ECharts | native | xAxis.type=time | dts-path (strong) | echarts/types/dist/shared.d.ts:2729 |
| Highcharts | native | xAxis.type=datetime | dts-path (strong) | highcharts/highcharts.d.ts:108788 |
| Plotly.js | native | layout.xaxis.type=date | dts-path (strong) | plot-schema.json#layout.layoutAttributes.xaxis.type |
| Nivo | native | Line.xScale, ~time | dts-path (strong) | @nivo/line/dist/types/types.d.ts:130, @nivo/tree/dist/types/Nodes.d.ts:21 xScale type time with format |
| Victory | native | VictoryChart.scale, ~time | dts-path (strong) | victory-core/lib/victory-util/common-props.d.ts:42, victory-shared-events/lib/victory-shared-events.d.ts:17 |
| visx | native | ~scaleTime\|scaleUtc | dts-grep (weak) | @visx/vendor/node_modules/@types/d3-scale/index.d.ts:993 |
| ApexCharts | native | xaxis.type=datetime | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4897 |
| Tremor (npm) | unknown | — | unverified (unknown) | — pre-formatted strings |
| Observable Plot | native | ~utc\|time | dts-grep (weak) | @observablehq/plot/src/symbol.d.ts:19 scale type utc/time |
| Vega-Lite | native | ~temporal | dts-grep (weak) | 1165:          "description" |
| AG Charts | native | ~time-axis\|"time" | dts-grep (weak) | ag-charts-community/dist/types/src/scale/timeScale.d.ts:6 axis type 'time' |
| amCharts 5 | native | DateAxis | dts-path (strong) | @amcharts/amcharts5/.internal/charts/xy/axes/DateAxis.d.ts:175 |
| Google Charts | unknown | ~"date"\|"datetime" | unverified (unknown) | — column types date/datetime |
| uPlot | native | Options.scales, ~time | dts-path (strong) | uplot/dist/uPlot.d.ts:379, 147:	/** converts a Date into new Date that's time-adjusted for the given IANA Time Zone Name */ scales.x.time (default true for x) |
| TradingView Lightweight Charts | native | ~UTCTimestamp\|BusinessDay | dts-grep (weak) | 394: * @returns `true` if `time` is a {@link BusinessDay} object, false otherwise. |
| MUI X Charts | native | LineChart.xAxis.scaleType=time | dts-path (strong) | @mui/x-charts/models/axis.d.mts:365 |
| Mermaid (chart-ish diagrams only) | native | ~dateFormat | dts-grep (weak) | mermaid/dist/diagrams/gantt/ganttDb.d.ts:9 gantt only |
| AntV G2 | native | ~time | dts-grep (weak) | @antv/g2/lib/index.d.ts:11 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67a0c9849a0c.

https://chartkit.dev/features.json
