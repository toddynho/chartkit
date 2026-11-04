# Option parity

Reviewed 4 November 2026, after the catalog narrowing in #108 and #112, `MARK_APPLIES`, and the audit rules that mark an option class (d) because the chart cannot use it.

Sources:

- ChartKit feature matrix (`catalog/public/features.json`, the “Compare ChartKit with 20 other libraries” data). Cells below name the nine libraries Todd asked about: Highcharts, Apache ECharts, Vega-Lite, Plotly, Chart.js, Observable Plot, Recharts, Nivo, amCharts 5.
- Those libraries’ option docs for the chart type, not only the matrix. The matrix scores a feature for the library as a whole. The per-type call is from the docs.
- A row is one option prefix on one chart type. Nested fields under that prefix (for example `encoding.y.format.decimals`) follow the prefix.

Verdicts:

- **KEEP HIDDEN.** The option is not a real control for that chart type. It stays out of the playground.
- **SHOULD EXIST.** At least two of the nine libraries offer it for that type, or it is the obvious reading of the chart. It is back in the catalog. The option-effect audit then marks it `works` or `not-yet`. `not-yet` is the playground line “Not yet supported”.
- **UNSURE.** Plausible, and not put back in this pass.

Counts of those rows: **KEEP HIDDEN 288**, **SHOULD EXIST 49**, **UNSURE 3**. The 288 are encoding, `render`, `timezone`, and `layout.coordinate`. Theme-token rows in the table below are the same verdict and are not added again. `MARK_APPLIES` mismatches such as `mark.curve` on a bar stay hidden and are not in the 288 either.

## What was put back

| Chart types | Option | Why it should exist | Libs |
| --- | --- | --- | --- |
| donut, pie, funnel, treemap, sunburst, sankey | `encoding.y.format` | The value is printed on the mark. Highcharts `dataLabels.format`, ECharts `label.formatter`, Plotly `texttemplate`, Vega-Lite `format` on the quantitative field, amCharts series labels. Donut, funnel, treemap, and sankey already format this field; the audit marks them `works`. Pie and sunburst use that same formatting. Bar-list prints the value and ignores `encoding.y.format`, but it has no example in the audit set, so restoring it would label the control supported. It stays hidden until an example can mark it `not-yet`. | Highcharts, ECharts, Plotly, Vega-Lite, amCharts |
| candlestick, spike, area-range | `encoding.x.type`, `encoding.x.format`, `encoding.x.scale` | The x axis is time or a continuous position, not a category band. Highcharts and amCharts datetime axes, ECharts `type: 'time'`, Plotly date axes, Vega-Lite temporal scales. | Highcharts, ECharts, Plotly, Vega-Lite, amCharts |
| scatter, treemap, map-points | `encoding.color.type`, `encoding.color.format`, `encoding.color.scale`, `encoding.color.range` | A third number can drive color. Vega-Lite quantitative color, Plotly `colorscale`, ECharts `visualMap`, Highcharts `colorAxis` (heatmap, treemap, and scatter). | Vega-Lite, Plotly, ECharts, Highcharts |
| every type that already has `encoding.color` | `encoding.color.title` | The color field’s name is the legend or color-bar title. Vega-Lite encoding `title`, Highcharts legend title, Plotly `colorbar.title` / legend. Hiding it left only heatmap and choropleth. | Vega-Lite, Highcharts, Plotly, ECharts |
| scatter | `theme.tokens.axis` | Scatter draws axes. Highcharts `xAxis.lineColor`, ECharts `axisLine.lineStyle.color`, Plotly `linecolor`, Chart.js scale border. The token stays off charts with no axis spine (sparkline, pie, sankey). | Highcharts, ECharts, Plotly, Chart.js |
| funnel, waterfall | `mark.labels`, `mark.labelFormat` | Stage and step labels are part of the chart. Highcharts `dataLabels`, ECharts `label`, Plotly `textinfo`, amCharts labels. | Highcharts, ECharts, Plotly, amCharts |

`axes.*.autoSkip` is no longer class (d) on a category axis. Chart.js skips crowded category ticks by default (`ticks.autoSkip`). Highcharts uses `labels.step` / overlap handling. ECharts uses `axisLabel.hideOverlap` and `interval`. Format and minor ticks stay class (d) on a non-numeric axis: minor ticks and currency format are value-axis features (ECharts `minorTick` is for value and time axes; Chart.js has no category minor ticks).

These were already in the catalog, so they were not “hidden”. They stay visible, and several are already `not-yet`:

- Legend position, anchor, and symbol on donut, radar, radial-bar, strip, and treemap. Highcharts, ECharts, Plotly, and amCharts all place a donut legend.
- `axes.*.grid` on histogram. Highcharts, ECharts, Plotly, and Chart.js draw a histogram grid.
- `encoding.y.scale.reverse` (and the rest of `encoding.y.scale`) on bullet. Vega-Lite and Plotly reverse a quantitative axis; a bullet’s value axis is that kind of axis.

## KEEP HIDDEN

### Position scales that the chart does not have

`encoding.x.type`, `encoding.x.format`, and `encoding.x.scale` stay off charts whose x is a category, a slice name, or a hierarchy key: bar, donut, pie, heatmap, boxplot, radar, funnel, treemap, bullet, waterfall, bar-range, errorbar, sunburst, radial-bar, rose, bar-list, gantt, timeline, quadrant, journey.

Highcharts, ECharts, and Vega-Lite do not put a log or time scale on a pie slice name or a bar category. Category tick *formatting* is `axes.x.labels` and `axes.x.rotate`, which those charts still have. The encoding format object is a number format (decimals, currency, percent).

`encoding.y.type` and `encoding.y.scale` stay off donut, pie, funnel, treemap, sunburst, sankey, bar-list, gantt, quadrant, journey, and strip. Those y channels are a slice size, a flow, a tile, or a group name. None of the nine libraries expose a reversible log scale on a pie. Strip’s y is the group when the chart is horizontal; the number scale is x, and that one stays.

### Axis titles where there is no axis

`encoding.x.title` and `encoding.y.title` stay on the axis charts only (`AXIS_TYPES`). Donut, pie, heatmap, radar, funnel, treemap, bullet, sunburst, radial-bar, rose, bar-list, gantt, timeline, quadrant, and journey do not draw an axis title. Highcharts and ECharts use the chart title there, which ChartKit already has as `title`. Radar spoke names are the category labels, not an axis title.

### Series is a category split

`encoding.series.type`, `encoding.series.format`, and `encoding.series.scale` stay out of the catalog for line, bar, stacked-area, scatter, combo, heatmap, radar, pie, and donut. Vega-Lite’s series field is nominal. Highcharts series names are legend text, not a quantitative scale. `encoding.series` and `encoding.series.title` remain.

### Color scales on category color

`encoding.color.type`, `encoding.color.format`, `encoding.color.scale`, and `encoding.color.range` stay off line, bar, donut, pie, stacked-area, combo, sunburst, funnel, sankey, radar, strip, gantt, timeline, and quadrant. Those charts color by series or category. A sequential scale there would invent a second encoding. The color *field* and its title stay.

### Canvas `render`

`render` stays on line, stacked-area, scatter, bar, heatmap, and candlestick. The schema already says other types stay SVG and warn CK3033. Highcharts Boost, the comparable canvas path, is line, scatter, bubble, column, and heatmap, not pie or sankey. Chart.js is canvas-only and has no `render` switch. Turning `render` on for every type would pretend canvas painters exist.

### Theme tokens whose role is absent

| Token | Kept off | Why |
| --- | --- | --- |
| `background` | kpi, bar-list | The KPI card is `surface`. A bar list has no chart background rect. ECharts and Chart.js have one background color; on these charts that is `surface` or nothing. |
| `grid` | sparkline, mini-area, and every chart with no grid | A sparkline’s grid is off on purpose. Highcharts sparkline axes are hidden, grid included. |
| `axis` | charts with no spine (pie, sankey, kpi, sparkline, …) | No axis line to color. Scatter is the exception and is listed above. |
| `accent`, `positive`, `negative` | charts that do not paint that role | A line’s series color is `theme.tokens.series`, not `accent`. Candlestick up/down stays on `positive` / `negative`. |
| `series` | candlestick, waterfall, gauge | Those paints are up/down or the gauge value, not a series palette. |
| `surface` | charts that do not draw a card or halo | Gauge, kpi, quadrant, sankey, timeline, and venn keep it. |

`theme.tokens.fontSize` and `theme.tokens.fontFamily` stay on every type. Text size is not narrowed to the four examples that already changed.

### Time zone and polar repair

`timezone` stays on line, bar, stacked-area, scatter, combo, sparkline, mini-area, spike, candlestick, and area-range. It stays off heatmap, gantt, and timeline because those x values are civil dates (`YYYY-MM-DD`). Shifting a calendar day into the previous evening is the bug the scope avoided. Highcharts and ECharts time zones apply to instants, not to a date-only Gantt day. It stays off pie, donut, sankey, and the other charts with no time axis.

The audit still marks `timezone` class (d) when the example’s x values are categories. The option remains on line. The quarterly line example cannot show a zone shift. That is needs-data, not a removal.

`layout.coordinate` stays on bar, pie, donut, radial-bar, and rose. It is a repair (`polar` on a bar becomes radial-bar; on a pie it becomes rose), not a second paint mode. Sankey, treemap, gauge, and kpi have no polar form in these libraries.

### Marks that are not that geometry

`MARK_APPLIES` still drops `mark.curve` from bars, `mark.bins` from lines, `mark.innerRadius` from bars, and the other mismatches. Highcharts does not spline a column series. Corner radius stays on bars, pies, heatmaps, and the other shapes that have a corner. Sampling stays on line-like charts.

### Audit class (d) that stays

| Rule | Verdict |
| --- | --- |
| Legend options when the example draws no legend | KEEP. The option stays in the catalog. This example cannot show it. |
| `subtitle` or `metric.*` when the example does not set that field | KEEP. Same reason. Gauge and kpi still list `subtitle`. |
| `timezone` when x is not a date | KEEP. See above. |
| Axis `format` and `minorTicks` when the axis column is not numeric | KEEP. Currency and minor ticks are value-axis features. |
| A theme token the example SVG does not reference | KEEP for tokens the renderer does emit when the chart uses that role (a line with no title does not paint `--ck-text`). |

## UNSURE

| Chart types | Option | Why it is open |
| --- | --- | --- |
| line, stacked-area, scatter | `layout.coordinate` | Highcharts `chart.polar` and ECharts polar both draw a polar line or scatter. ChartKit already has radar as its own type, and `layout.coordinate` is documented as a repair, not a paint mode. Putting polar back on line would either duplicate radar or reopen CK3077. Left hidden until that choice is explicit. |

## Features other libraries have that ChartKit has no option for

From the feature matrix, ChartKit status `none` or `unknown`, ranked by how many of the nine libraries have the feature (`native` or `partial`). `type.beeswarm` is omitted: the matrix says none, and ChartKit ships `strip`.

| Rank | Feature | Libs (of 9) | Notes |
| --- | --- | --- | --- |
| 1 | Plugin system (`extend.plugins`) | 8 | Highcharts, ECharts, Plotly, Chart.js, Plot are native. |
| 2 | Auto layout around the legend (`layout.legend.space`) | 8 | Matrix `unknown` for ChartKit. Legend offset is only partly covered by `legend.*`. |
| 3 | Custom marks / series renderers | 7 | |
| 4 | Raw drawing access | 7 | |
| 5 | Imperative / builder API | 6 | ChartKit is JSON on purpose. |
| 6 | Streamgraph | 6 | Highcharts, ECharts, Vega-Lite, Plot, Recharts, Nivo. |
| 7 | Tree / org chart / dendrogram | 5 | |
| 8 | Pattern / hatch fills | 4 | ECharts, Plotly, Nivo, amCharts. |
| 9 | Chord diagram | 4 | |
| 10 | Density (KDE) | 4 | |
| 11 | Technical indicators | 4 | |
| 12 | Network / force graph | 4 | |
| 13 | Pictorial bar | 4 | |
| 14 | Draggable annotations | 3 | |
| 15 | Contour plot | 3 | |
| 16 | Icicle / partition | 3 | |
| 17 | Tile map base layer | 3 | |
| 18 | Marimekko | 3 | |
| 19 | OHLC bars (separate from candlestick) | 3 | Candlestick exists. A separate OHLC mark does not. |
| 20 | Parallel coordinates | 3 | Highcharts, ECharts, Plotly. |

Circle packing, waffle, vector/wind, and arc diagram tie with parallel coordinates at 3 libraries. They are the next ones if this list is extended.

## Streamgraph scorecard

Full grid: [parity/streamgraph.md](./parity/streamgraph.md). Fourteen features. Partial counts as offered. `mark.streamOffset` is the baseline because `mark.offset` is the pie pull and `mark.baseline` is the spike origin.

| Library | They offer | We match | We exceed | We lack |
| --- | --- | --- | --- | --- |
| Highcharts | 9 | 9 | 4 | 0 |
| ECharts | 8 | 8 | 5 | 0 |
| Vega-Lite | 9 | 9 | 4 | 0 |
| Plotly | 0 | 0 | 13 | 0 |
| Chart.js | 0 | 0 | 13 | 0 |
| Observable Plot | 11 | 11 | 2 | 0 |
| Recharts | 12 | 11 | 2 | 1 |
| Nivo | 14 | 13 | 0 | 1 |
| amCharts | 0 | 0 | 13 | 0 |

The lack is the signed offset (Recharts and Nivo). Negatives stay an error (CK3095).

## Density scorecard

Full grid: [parity/density.md](./parity/density.md). Twelve features. ChartKit ships the 1D curve. The lacks are ridgeline, cumulative, and 2D contours.

| Library | They offer | We match | We exceed | We lack |
| --- | --- | --- | --- | --- |
| Highcharts | 2 | 2 | 7 | 0 |
| ECharts | 0 | 0 | 9 | 0 |
| Vega-Lite | 11 | 9 | 0 | 2 |
| Plotly | 8 | 7 | 2 | 1 |
| Chart.js | 0 | 0 | 9 | 0 |
| Observable Plot | 8 | 6 | 3 | 2 |
| Recharts | 0 | 0 | 9 | 0 |
| Nivo | 0 | 0 | 9 | 0 |
| amCharts | 0 | 0 | 9 | 0 |

## Tree scorecard

Full grid: [parity/tree.md](./parity/tree.md). Fifteen features. ChartKit ships the tidy tree and the dendrogram. The lacks are org-chart boxes and node images.

| Library | They offer | We match | We exceed | We lack |
| --- | --- | --- | --- | --- |
| Highcharts | 14 | 12 | 1 | 2 |
| ECharts | 14 | 13 | 0 | 1 |
| Vega-Lite | 0 | 0 | 13 | 0 |
| Plotly | 0 | 0 | 13 | 0 |
| Chart.js | 4 | 4 | 9 | 0 |
| Observable Plot | 9 | 9 | 4 | 0 |
| Recharts | 0 | 0 | 13 | 0 |
| Nivo | 11 | 11 | 2 | 0 |
| amCharts | 14 | 13 | 0 | 1 |

## Batch 3, ranked by value

Not started. Order is what users hit on charts we already ship, not new chart types.

1. **Legend placement on charts that already draw a legend.** Donut, radar, radial-bar, strip, treemap. Position, anchor, align, symbol. Highcharts, ECharts, Plotly, and amCharts all do this. One shared legend box.
2. **Quantitative color on scatter and treemap.** `encoding.color` scale, range, and type. The options are visible again and will read `not-yet` until a sequential scale paints.
3. **Axis grid, line, tick marks, and label rotation on the extra axis charts.** Histogram grid is the example. The shared axis path already does title placement, autoSkip, and minor ticks. Line color (`theme.tokens.axis` on scatter), grid style, and tick rotation are the rest.
4. **Value labels on funnel and waterfall.** `mark.labels` and `mark.labelFormat` are visible again.
5. **Bar-list value format.** `encoding.y.format` is ignored, and there is no bar-list example in the audit set, so the control was not restored (the playground would have called it supported). Donut, funnel, treemap, and sankey already format this field.
6. **Datetime x on candlestick, spike, and area-range.** Type, format, and scale are visible again.
7. **Category autoSkip** on the extra charts that still ignore it. Cartesian already skips. The probe now counts a miss.
8. **Do not start** streamgraph, tree, chord, network, or a plugin API in this batch. Those are new products, not unfinished options.
