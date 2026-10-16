# Chart spec — sampling

`mark.sampling` controls how line-like charts draw a long series. The published schema is `schema/chartkit.schema.json`. Invalid values fail validation as **CK1007** on `/mark/sampling`. A value set on a chart type that ignores it warns as **CK3010**.

| Value | Behavior |
|---|---|
| `auto` (default) | `minmax` when the finite point count is greater than twice the plot width in pixels. Otherwise every point is drawn and the SVG matches `none`. |
| `minmax` | Same threshold. Each pixel bucket keeps the original points with the lowest and highest y. |
| `lttb` | Same threshold. Largest-triangle-three-buckets, also selecting original points. |
| `none` | Draw every point. |

The threshold is `2 * floor(plotWidth)`, where plot width is the pixel width inside the axes. A 640×360 line chart has a plot width of 572, so sampling starts above 1,144 finite points and the path stays at or under that many vertices.

## Which types sample

| Type | What is sampled |
|---|---|
| `line`, `sparkline`, `mini-area` | The line, and the area fill when `mark.area` is set. `auto` uses minmax. |
| `stacked-area` | One shared index list from the stacked total, so the bands stay aligned. `auto` uses minmax. |
| `combo` | Line and area series only. Bars are drawn in full. `auto` uses minmax. |
| `spike` | Vertical spikes. `auto` and `minmax` keep the min and max in each pixel bucket. `lttb` keeps the LTTB indexes. |

`bar`, `scatter`, `candlestick`, `donut`, `heatmap`, `gauge`, `kpi`, and `progress-ring` do not sample. Scatter and candlestick need every point; the others are not point series.

`auto` uses minmax rather than LTTB because a metric chart has to keep spikes, and minmax is one pass over the series. Set `lttb` when a smoother silhouette matters more than the sharpest spike.

## What stays on the full series

- **Axis extents** are the min and max of every finite value, computed before sampling. A spike that is drawn is also inside the axis domain; a spike that sampling kept is not required for the domain itself.
- **`a11y.alt`** is the author's sentence. The renderer does not rewrite it from the sample. It is the SVG `aria-label` and `<desc>`.
- **Hover.** Every sampled vertex is an original row, not an average. The path carries `data-ck-sample` and `data-ck-i` (original indexes, in order) only when the series was actually reduced. A tooltip resolves the nearest vertex, then reads that index. Spike lines carry `data-ck-i` of that one row. `mark.points: "always"` draws markers only at those indexes.

Sampling assumes each series is already ordered by x. Nulls stay as gaps unless `mark.connectNulls` is true, in which case the finite points are sampled as one run.

## Repairable shapes

These are errors with a JSON Patch in `fix`. Applying the patch is the correction.

| Code | Shape | What to do |
|---|---|---|
| CK1009 | `data: { values: [...] }` | Move `values` up so `data` is the array. Do not look for `columns`. |
| CK1009 | `mark: "line"` and no `type` | `type` is the chart type. `mark` is an options object. The patch sets `type` and removes the string `mark`. |
| CK1009 | `encoding.*.axis` is an object | `axis` is `"y"` or `"y2"`. Titles go in `axes.y.title` or `axes.y2.title`. |
| CK1009 | `value`, `min`, `max`, `delta`, or `label` on a gauge, kpi, or progress-ring | Move them into `metric`. |
| CK1009 | Donut `encoding` uses `theta`, `angle`, `label`, or `value` | `x` is the slice label and `y` is the number. |
| CK1005 | `type: "pie"` | `donut`, with `mark.innerRadius` 0. |
| CK1005 | `type: "area"` | Did-you-mean `mini-area`. A full-size filled line is `type: "line"` and `mark.area: true`. Stacked layers are `stacked-area`. |
| CK1005 | `type: "grid-heat"` | `heatmap`. A grid uses `encoding.x`, `encoding.y`, and `encoding.color`. |
| CK1007 | field `type: "categorical"` | `nominal`. Field types are `quantitative`, `temporal`, `ordinal`, and `nominal`. |

A heatmap with `encoding.y` and no `mark.layout` renders as a grid. `mark.layout: "calendar"` is the date-by-weekday layout, and it is also the fallback when `y` is absent. `validate` accepts both.
