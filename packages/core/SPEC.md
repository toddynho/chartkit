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
