# Pure JSON spec (serialisable, no functions)

ChartKit: **native**

Whole chart is a JSON document

Matrix status: `native`. Verification: `dts-path` (strong).

JSON-only by design (functions never needed)

Source: chartkit:packages/core/src/generated/schema.ts:20

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
| Chart.js | partial | ChartConfiguration | dts-path (strong) | chart.js/dist/types/index.d.ts:3865 JSON-like config; many features need callbacks |
| Recharts | unknown | — | conflict (unknown) | — JSX components |
| Apache ECharts | partial | EChartsOption | dts-path (strong) | echarts/types/dist/shared.d.ts:12566 JSON option; formatters often functions |
| Highcharts | partial | Options | dts-path (strong) | highcharts/highcharts.d.ts:93407 JSON options; formatters often functions |
| Plotly.js | native | layout | dts-path (strong) | plot-schema.json#layout.layoutAttributes. JSON traces + layout (figure JSON) |
| Nivo | none | — | dts-absence (absence) | — React props with functions |
| Victory | unknown | — | conflict (unknown) | — |
| visx | none | — | dts-absence (absence) | — |
| ApexCharts | partial | ApexOptions | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1449 JSON-like; formatters are functions |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — JS function calls |
| Vega-Lite | native | TopLevelSpec | dts-path (strong) | vega-lite/build/spec/index.d.ts:43 canonical JSON grammar |
| AG Charts | partial | AgChartOptions | dts-path (strong) | ag-charts-types/dist/types/src/chartBuilderOptions.d.ts:50 |
| amCharts 5 | plugin | — | npm (weak) | — JSON plugin (plugins/json) serialisation |
| Google Charts | partial | ~options | dts-grep (weak) | @types/google.visualization/index.d.ts:3 JSON options + DataTable |
| uPlot | none | — | dts-absence (absence) | — imperative options with functions |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | none | — | dts-absence (absence) | — |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — text DSL |
| AntV G2 | native | G2Spec | dts-path (strong) | @antv/g2/lib/spec/index.d.ts:4 JSON spec (or chainable API) |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 7eff21f18449.

https://chartkit.dev/features.json
