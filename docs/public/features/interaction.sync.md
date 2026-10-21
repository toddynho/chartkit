# Synchronised charts

ChartKit: **native**

Shared cursor/zoom across multiple charts

Matrix status: `native`. Verification: `runtime-probe` (strong).

interaction.sync is a group id. Charts with that id share the crosshair, tooltip, and x window, matched on the x value. The server SVG records data-ck-sync. An empty id warns CK3036.

Source: packages/core/src/sync-group.ts

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
    "sync": "sales"
  }
}
```

This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 |
| Recharts | native | LineChart.syncId | dts-path (strong) | recharts/types/util/types.d.ts:1259 |
| Apache ECharts | native | ~connect | dts-grep (weak) | echarts/types/dist/shared.d.ts:6987 echarts.connect(group) |
| Highcharts | manual | SVGRenderer | dts-mechanism (weak) | highcharts/highcharts.d.ts:115777 documented synchronized charts demo |
| Plotly.js | manual | layout.shapes | dts-mechanism (weak) | plot-schema.json#layout.layoutAttributes.shapes |
| Nivo | none | — | dts-absence (absence) | — |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | manual | Group | dts-mechanism (weak) | @visx/group/lib/Group.d.ts:15 |
| ApexCharts | native | chart.group | dts-path (strong) | apexcharts/types/apexcharts.d.ts:2111 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | none | — | dts-absence (absence) | — |
| Vega-Lite | native | ~concat | dts-grep (weak) | 5232:          "description" resolve/selection across concat views |
| AG Charts | native | ~sync | dts-grep (weak) | ag-charts-types/dist/types/src/presets/financial/priceVolumeOptions.d.ts:70 sync options (enterprise) |
| amCharts 5 | manual | Graphics | dts-mechanism (weak) | @amcharts/amcharts5/.internal/core/render/Graphics.d.ts:162 |
| Google Charts | unknown | — | unverified (unknown) | — Dashboard controls bind charts |
| uPlot | native | Options.cursor.sync | dts-path (strong) | uplot/dist/uPlot.d.ts:592 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView documented sync example |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | manual | ~register | dts-mechanism (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 67d25e30b540.

https://chartkit.dev/features.json
