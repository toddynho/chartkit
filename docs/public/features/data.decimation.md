# Downsampling / decimation

ChartKit: **native**

Reduce large series before drawing (LTTB, min-max)

Matrix status: `native`. Verification: `dts-path` (strong).

auto | minmax | lttb | none

Source: chartkit:packages/core/src/generated/schema.ts:807

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
  "mark": {
    "sampling": "lttb"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | ChartConfiguration.options.plugins.decimation | dts-path (strong) | chart.js/dist/types/index.d.ts:2986 lttb, min-max |
| Recharts | none | — | dts-absence (absence) | — |
| Apache ECharts | native | series.sampling | dts-path (strong) | echarts/types/dist/shared.d.ts:8421 lttb, average, max, min, sum, minmax |
| Highcharts | native | ~dataGrouping | dts-grep (weak) | highcharts/highcharts.src.d.ts:394 Stock dataGrouping; boost module for raw speed |
| Plotly.js | none | — | dts-absence (absence) | — scattergl for speed; no decimation option |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | unknown | — | unverified (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | none | — | dts-absence (absence) | — |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | none | — | dts-absence (absence) | — |
| amCharts 5 | native | ~groupData | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/sliceGrouper/SliceGrouper.d.ts:45 DateAxis groupData |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | none | — | dts-absence (absence) | — draws every point; relies on fast canvas paths |
| TradingView Lightweight Charts | native | ~conflation\|Conflation | dts-grep (weak) | 1124: * Context object provided to custom series conflation reducers. data conflation |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | none | — | dts-absence (absence) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 699f05dc7c70.

https://chartkit.dev/features.json
