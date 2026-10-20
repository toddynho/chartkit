# Chart spec — sampling

`mark.sampling` controls how line-like charts draw a long series. The published schema is `schema/chartkit.schema.json`. Invalid values fail validation as **CK1007** on `/mark/sampling`. A value set on a chart type that ignores it warns as **CK3010**.

| Value | Behavior |
|---|---|
| `auto` (default) | `minmax` when the finite point count is greater than twice the plot width in pixels. Otherwise every point is drawn and the SVG matches `none`. |
| `minmax` | Same threshold. Each pixel bucket keeps the original points with the lowest and highest y. |
| `lttb` | Same threshold. Largest-triangle-three-buckets, also selecting original points. |
| `none` | Draw every point. |

The threshold is `2 * floor(plotWidth)`, where plot width is the pixel width inside the axes. A 640×360 line chart has a plot width of 572, so sampling starts above 1,144 finite points and the path stays at or under that many vertices.

## Columnar `data.sampling`

A columnar table `{ "columns": { … } }` may set `sampling` to `lttb`, `minmax`, or `none`. That value overrides `mark.sampling`. Omit it to keep `mark.sampling`. There is no `auto` on the columnar field: the default stays on the mark. A line-like chart with sampling explicitly `none` and 8,000 or more rows warns **CK3032**. The patch sets `lttb`. Row arrays keep using `mark.sampling`.

`mount().append` from `@chartkitdev/vanilla` grows `Float64Array` columns by doubling, so a one-point append does not copy the whole series. A `window` copies the tail into a new array.

## Canvas

`render` is `svg` (the default), `canvas`, or `auto`. `render()` always returns SVG, including on the server. The client then paints the marks onto a canvas for `line`, `stacked-area`, `scatter`, `bar`, `heatmap`, and `candlestick`. Axes, the legend, the title, annotations, the aria description, and the data table stay SVG, so type stays sharp and hit-testing still uses the SVG nodes. `auto` chooses canvas for those types at 8,000 rows or more. Other types stay SVG. `render: "canvas"` on a type with no painter warns **CK3033**. A covered type left on `svg` at 8,000 or more rows warns **CK3031**.

The painter is `@chartkitdev/core/canvas/hydrate`. It loads on demand. `createRenderer([line])` does not include it. The canvas is sized with `devicePixelRatio` and redrawn when the SVG resizes. Until the chunk loads, the SVG marks are the picture.

## Which types sample

| Type | What is sampled |
|---|---|
| `line`, `sparkline`, `mini-area` | The line, and the area fill when `mark.area` is set. `auto` uses minmax. |
| `stacked-area` | One shared index list from the stacked total, so the bands stay aligned. `auto` uses minmax. |
| `combo` | Line and area series only. Bars are drawn in full. `auto` uses minmax. |
| `spike` | Vertical spikes. `auto` and `minmax` keep the min and max in each pixel bucket. `lttb` keeps the LTTB indexes. |

`bar`, `scatter`, `candlestick`, `donut`, `heatmap`, `gauge`, `kpi`, `progress-ring`, `histogram`, `boxplot`, `radar`, `funnel`, `treemap`, `sankey`, `bullet`, and `waterfall` do not sample. Scatter and candlestick need every point; the others are not point series.

`auto` uses minmax rather than LTTB because a metric chart has to keep spikes, and minmax is one pass over the series. Set `lttb` when a smoother silhouette matters more than the sharpest spike.

## What stays on the full series

- **Axis extents** are the min and max of every finite value, computed before sampling. A spike that is drawn is also inside the axis domain; a spike that sampling kept is not required for the domain itself.
- **`a11y.alt`** is the author's sentence. The renderer does not rewrite it from the sample. It is the SVG `aria-label` and `<desc>`.
- **Hover.** Every sampled vertex is an original row, not an average. The path carries `data-ck-sample` and `data-ck-i` (original indexes, in order) only when the series was actually reduced. The static SVG string still has no tooltip node. `@chartkitdev/core/interact` builds an x index over the full table (constant time on a category axis, binary search when x is numeric) and snaps the tooltip to the nearest original row. Spike lines carry `data-ck-i` of that one row. `mark.points: "always"` draws markers only at those indexes. A downsampled line omits the hidden per-point circles (they exist so `--ck-line-dots` can show every vertex, and on a reduced series they dominate the SVG). Hover dots are drawn by interact from the path at the snapped x. Charts under the sampling threshold, and `mark.points: "always"`, still emit the circles.

Sampling assumes each series is already ordered by x. Nulls stay as gaps unless `mark.connectNulls` is true, in which case the finite points are sampled as one run.

## Repairable shapes

These are errors with a JSON Patch in `fix`. Applying the patch is the correction.

| Code | Shape | What to do |
|---|---|---|
| CK1009 | `data: { values: [...] }` | Move `values` up so `data` is the array. Do not look for `columns`. |
| CK1009 | `mark: "line"` and no `type` | `type` is the chart type. `mark` is an options object. The patch sets `type` and removes the string `mark`. |
| CK1009 | `encoding.y.axis` is an object or `null` | `axis` is `"y"` or `"y2"`. Titles go in `axes.y.title` or `axes.y2.title`. `null` is removed. |
| CK1009 | `encoding.x.axis` is an object or `null` | `x` has no `axis`. The title moves to `axes.x.title` and `axis` is removed. |
| CK1009 | `value`, `min`, `max`, `delta`, or `label` on a gauge, kpi, or progress-ring | Move them into `metric: { value, min, max, label?, delta? }`. The same object is built from a one-row `data` array, from a `data` object of those fields, or from those encoding channels. The patch removes that `data`. A real table, such as a kpi sparkline, stays. |
| CK1009 | Donut `encoding` uses `theta`, `angle`, `label`, or `value` | Only when `type` is `donut` or `mark` is `arc`. `x` is the slice label and `y` is the number. |
| CK1009 | Heatmap `encoding.value`, `encoding.date`, or a calendar numeric `y` | The measure moves to `encoding.color`. `encoding.date` moves to `encoding.x` when `x` is missing. A numeric `y` moves to `color` only when the layout is calendar. A grid keeps `y` as the row category. |
| CK1009 | `layer`, `layers`, `marks` (array or object), `mark` array, `encoding.y2`, `encoding.bar`, `encoding.line`, or `encoding.area` | Combo: `encoding.y` is `[{ field, mark: "bar" }, { field, mark: "line", axis: "y2" }]`. |
| CK1009 | `encoding.y.field` is an array of names | The list belongs on `encoding.y` (`["a", "b"]`). Other keys on that object are copied onto each field. |
| CK1009 | Combo y item `type` is `"bar"`, `"line"`, or `"area"` | That value is `mark`. `type` on a y channel is quantitative, temporal, ordinal, or nominal. |
| CK1009 | `chartType` and no usable `type` | Move it to `type`. |
| CK1005 | `type: "pie"` or `"arc"` | `donut`. `pie` also sets `mark.innerRadius` 0. |
| CK1005 | `type: "point"`, `"circle"`, or `"square"` | `scatter`. |
| CK1005 | `type: "rect"` | `heatmap`. |
| CK1005 | `type: "area"` | `stacked-area` when `y` has two or more fields. Otherwise `mini-area`. A full-size filled line is `type: "line"` and `mark.area: true`. |
| CK1005 | `type: "metric"` | `gauge` when min/max are present, otherwise `kpi`. Both use `metric: { value, min, max, label?, delta? }`. |
| CK1005 | `type: "rule"` or `"tick"` | `spike`. |
| CK1005 | `type: "grid-heat"` | `heatmap`. A grid uses `encoding.x`, `encoding.y`, and `encoding.color`. |
| CK1005 | `type: "grid-heatmap"` or `"calendar-heatmap"` | `heatmap`, and `mark.layout` is `"grid"` or `"calendar"`. |
| CK1007 | field `type: "categorical"` | `nominal`. Field types are `quantitative`, `temporal`, `ordinal`, and `nominal`. |
| CK1007 | `mark.points: true` | `"always"`. `false` is `"none"`. |
| CK1007 | format `".2f"` | `{ "style": "number", "decimals": 2 }`. |

When `type` is missing or not a known chart type, per-type required fields (`metric`, `color`, `open`, `high`, `low`, `close`) are not reported. The type repair is the first error. `repair(spec)` from `@chartkitdev/core/validate` applies these patches and returns the spec plus whatever errors remain.

A heatmap with `encoding.y` and no `mark.layout` renders as a grid. `mark.layout: "calendar"` is the date-by-weekday layout, and it is also the fallback when `y` is absent. `validate` accepts both.
