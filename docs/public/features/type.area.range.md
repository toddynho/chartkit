# Range / band area

ChartKit: **native**

Area between a low and high value per x (confidence band)

Matrix status: `native`. Verification: `dts-path` (strong).

Band between lo and hi, with an optional centre line. A combo mark range paints the band under the other series.

Source: chartkit:packages/core/src/charts/area-range.ts:1

## ChartKit spec

```json
{
  "version": "1",
  "type": "area-range",
  "data": [
    {
      "month": "Jan",
      "y": 40,
      "lo": 36,
      "hi": 48
    },
    {
      "month": "Feb",
      "y": 55,
      "lo": 46,
      "hi": 66
    }
  ],
  "encoding": {
    "x": "month",
    "y": "y",
    "low": "lo",
    "high": "hi"
  },
  "a11y": {
    "alt": "It widens."
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
| Chart.js | manual | Plugin.afterDatasetsDraw | dts-mechanism (weak) | chart.js/dist/types/index.d.ts:1051 two datasets with fill:'-1' |
| Recharts | partial | Area.dataKey | dts-path (strong) | recharts/types/util/types.d.ts:1208 dataKey returning [low, high] |
| Apache ECharts | manual | series.type=custom | dts-mechanism (weak) | echarts/types/dist/shared.d.ts:11176 stacked transparent base series |
| Highcharts | native | series.type=arearange | dts-path (strong) | highcharts/options/abands.d.ts:1386 |
| Plotly.js | partial | trace.fill=tonexty | dts-path (strong) | plot-schema.json#traces.{scatter,scattergl,scatterpolargl}.attributes.fill two traces |
| Nivo | manual | Line.layers | dts-mechanism (weak) | @nivo/line/dist/types/types.d.ts:171 |
| Victory | native | VictoryArea, ~y0 | dts-path (strong) | victory-area/lib/victory-area.d.ts:31, victory-histogram/lib/victory-histogram.d.ts:4 y0 accessor |
| visx | native | Area, ~y0 | dts-path (strong) | @visx/shape/lib/shapes/Area.d.ts:3, @visx/sankey/node_modules/@types/d3-shape/index.d.ts:1017 Area with y0/y1 accessors |
| ApexCharts | native | chart.type=rangeArea | dts-path (strong) | apexcharts/types/apexcharts.d.ts:1767 |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | areaY, ~y1 | dts-path (strong) | @observablehq/plot/src/marks/area.d.ts:198, @observablehq/plot/src/scales.d.ts:29 areaY({y1, y2}) |
| Vega-Lite | native | mark=errorband, ~y2 | dts-path (strong) | vega-lite/build/spec/unit.d.ts:19, 971:          "description" |
| AG Charts | native | series.type=range-area | dts-path (strong) | ag-charts-types/dist/types/src/series/cartesian/areaOptions.d.ts:86 |
| amCharts 5 | native | ~openValueYField | dts-grep (weak) | @amcharts/amcharts5/.internal/charts/xy/series/XYSeries.d.ts:292 area between openValueY and valueY |
| Google Charts | partial | ~interval | dts-grep (weak) | @types/google.visualization/index.d.ts:46 intervals role style:'area' |
| uPlot | partial | Options.bands | dts-path (strong) | uplot/dist/uPlot.d.ts:377 |
| TradingView Lightweight Charts | manual | ~ICustomSeriesPaneView | dts-mechanism (weak) | 1629:	addCustomSeries<TData extends CustomData<HorzScaleItem>, TOptions extends CustomSeriesOptions, TPartialOptions extends SeriesPartialOptions<TOptions> = SeriesPartialOptions<TOptions>>(customPaneView |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | none | — | dts-absence (absence) | — |
| AntV G2 | native | MarkTypes=area, ~y1 | dts-path (strong) | @antv/g2/lib/spec/mark.d.ts:13, @antv/g2/lib/index.d.ts:89 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 6ec84d7091db.

https://chartkit.dev/features.json
