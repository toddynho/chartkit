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

A columnar table `{ "columns": { … } }` may set `sampling` to `lttb`, `minmax`, or `none`. That value overrides `mark.sampling`. Omit it to keep `mark.sampling`. There is no `auto` on the columnar field: the default stays on the mark. A line-like chart with sampling explicitly `none` and 100,000 or more rows warns **CK3032**. The patch sets `lttb`. Row arrays keep using `mark.sampling`.

`mount().append` from `@chartkitdev/vanilla` grows `Float64Array` columns by doubling, so a one-point append does not copy the whole series. A `window` copies the tail into a new array.

## Canvas

`render` is `svg` (the default), `canvas`, or `auto`. `render()` always returns SVG, including on the server, marks included. On the client, canvas paints `line`, `stacked-area`, `scatter`, `bar`, `heatmap`, and `candlestick` marks from the computed geometry. The SVG keeps the axes, the legend, the title, annotations, the aria description, and the data table. Hit-testing reads the data: binary search on x for line, area, and bar, and a grid for scatter. `auto` chooses canvas for those types at 100,000 rows or more. Sampled SVG is still faster on first paint at 10,000, 100,000, and 1,000,000, so auto leaves sizes under 100,000 on SVG. Other types stay SVG. `render: "canvas"` on a type with no painter warns **CK3033**. A covered type left on `svg` at 100,000 or more rows warns **CK3031**.

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

## Keyboard and the data table

`a11y.keyboard` and `a11y.dataTable` are client behaviour. Both are **on by default** when an adapter mounts the chart (`mount()`, `<Chart>`, `<chartkit-chart>`), and each is turned off with an explicit `false`. `render()` and `renderToString()` are not affected: the static SVG has no `tabindex`, no table, and no live region, and it records `data-ck-intent` only when the spec sets a value to `true`, as before.

- **Tab order.** The chart SVG is one tab stop with a visible focus ring (`--ck-focus` sets its colour). Focus alone announces nothing beyond `a11y.alt`.
- **Keys.** Left and Right move between points; the first press lands on the current point. Home and End jump to the ends of the visible range. Up and Down narrow the reading to one series and dim the others. Escape clears the highlight, the tooltip, and the announcement, and so does leaving the chart. Enter and Space fire `pointclick` (or `seriesclick` on a slice) for the focused point. A key that has nothing to do is left to the page, so arrows still scroll at either end.
- **Announcements.** Each move writes one polite live region: the x value, then each series and value. It never repeats `a11y.alt`.
- **Covered types.** `line`, `bar`, `stacked-area`, `combo`, `scatter`, `candlestick`, `sparkline`, `mini-area`, and `spike` walk rows. `donut`, `pie`, and `sunburst` walk slices in drawing order. `tree` (parent, child, sibling) and `streamgraph` (columns and layers) move focus between their own marks, which are tab stops in the static SVG too. Every other type has no keyboard model yet: its SVG is not made a tab stop and it gets no table by default. `strip` and `density` keep the per-mark tab stops their static SVG already has, with no arrow keys.
- **Limits.** Rows are walked in data order, so a scatter moves through its rows, not left to right. The top-level `sort` is not applied by `interact`: on a sorted chart the reading and the tooltip name the data row while the highlight sits on the drawn slot, the same as the pointer. With `render: "canvas"` a line gets its markers, a scatter gets the crosshair and tooltip but no point marker, and a bar gets the tooltip but no highlight. The script-tag build (`@chartkitdev/vanilla/global`) does not pass the spec to the tree and streamgraph keys, so `keyboard: false` does not turn them off there. No screen reader has been tested.
- **Table.** One visually hidden `<table>` after the SVG, with a caption, column headers, and a row header per row. Wide data is x plus one column per series. Long data (`encoding.series`) is x, series, value. A sunburst lists its arcs. The table reads the full data, not the drawn sample. Past 1000 rows it takes 1000 rows at even steps, first and last included, and the caption says so. `dataTable: true` also adds a visible "Show data table" button.
- **Cost.** Both live in the lazy `@chartkitdev/core/interact/extra` chunk, which a client mount now fetches after the chart is interactive. The hidden table is written in its own task after mount, and a stream of `update()` calls rewrites it at most once per 300 ms.

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
