# Streamgraph spec proposal

Status: shipped. The gallery example is Copies by genre. Rank 1 in [README.md](./README.md). Coverage 6 of 9. Matrix id `type.area.stream`, `agentRelevance` 2.

A streamgraph is a stacked area whose baseline moves so the layers sit around a center instead of on zero. Use it for a composition over time when the shape of the change matters more than the total. Do not use it when the reader needs to compare a layer to zero, read a level off the axis, or see negatives. Those are stacked area (`mark.stack: "stack"` or `"percent"`), which ChartKit already draws. A streamgraph with one series is a centered area and should repair toward stacked area.

Vega-Lite's `center` offset is in the count of 6. It centers each stack. It does not implement Byron and Wattenberg's wiggle. A strict wiggle count is 5.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `series.type: "streamgraph"`. Y values per series, stacked around a central axis. The series-label module places names on the layers. | [Stream graph](https://www.highcharts.com/docs/chart-and-series-types/stream-graph) |
| ECharts | `series.type: "themeRiver"`. One series, data rows `[date, value, name]`, on a single axis. | [series-themeRiver](https://echarts.apache.org/en/option.html#series-themeRiver) |
| Observable Plot | `Plot.areaY` with the stack transform. `offset: "wiggle"` is the streamgraph and switches the default order to inside-out. `offset: "center"` centers each stack. `"normalize"` is a share. | [Stack transform](https://observablehq.github.io/plot/transforms/stack) |
| Recharts | `AreaChart` `stackOffset` `"wiggle"`, `"silhouette"`, `"expand"`, `"sign"`, or `"none"`. Areas share a `stackId`. | [AreaChart](https://recharts.github.io/en-US/api/AreaChart) |
| Nivo | `Stream` (and `ResponsiveStream`). `offsetType` includes the d3-shape offsets. | [Stream](https://nivo.rocks/stream/) |
| Vega-Lite | `stack` offset `"zero"`, `"center"`, or `"normalize"` on a quantitative field. No wiggle. | [Stack](https://vega.github.io/vega-lite/docs/stack.html) |

Chart.js has no stream type (matrix: manual, a plugin draw). Plotly's shapes are manual. amCharts is manual. They are not coverage.

## Encoding

`data` is flat rows, wide or long, the same as stacked area. `a11y.alt` stays required.

| | Position | Layer value | Layer name |
| --- | --- | --- | --- |
| Wide (default) | `encoding.x` | `encoding.y` as a list of fields | the field name |
| Long | `encoding.x` | `encoding.y` one field | `encoding.series` or `encoding.color` |

`encoding.color` colors the layers. A field uses the series palette. A constant is the existing color channel. `encoding.color.title` is the legend title.

`encoding.y` values are non-negative. A negative is an error and is not drawn as a signed stream. `"sign"` offset (Recharts) is out of v1. The reader who has negatives wanted stacked area.

## Mark options

All of these have a default. A spec with only `version`, `type`, `data`, `encoding.x`, `encoding.y`, and `a11y.alt` draws a wiggle stream, inside-out order, monotone curves, series colors, no point markers.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.offset` | `"wiggle"` \| `"center"` \| `"zero"` \| `"expand"` | `"wiggle"` | Baseline. `"zero"` is stacked area. `"expand"` is shares that sum to 1. `"center"` centers each column. `"wiggle"` minimizes layer-to-layer movement. |
| `mark.order` | `"inside-out"` \| `"none"` \| `"ascending"` \| `"descending"` | `"inside-out"` when offset is `"wiggle"`, otherwise `"none"` | `"none"` keeps first-seen series order. Inside-out places the quietest series in the middle, which is the wiggle companion from Byron and Wattenberg. |
| `mark.curve` | existing enum | the schema default, `"monotone"` | Same curves as stacked area. `smooth`, `spline`, and `basis` already repair to monotone. |
| `mark.fillOpacity` | number, existing | the Soft geometry, `0.22` | Layer fill. The stroke stays the series color at full opacity so a dark page still shows the edge. |

`mark.stack` is not a second control. The offset is the stack. Setting `mark.stack` on a streamgraph warns and `repair()` removes it.

## Catalog groups

Playground groups are `OPTION_GROUPS` in `packages/core/src/option-catalog.ts`.

| Group | On a streamgraph |
| --- | --- |
| Data / Encoding | `encoding.x`, `encoding.y` (field or list), `encoding.series`, `encoding.color`, `encoding.color.title`, `encoding.x.type`, `encoding.x.format`, `encoding.x.scale`, `encoding.y.format`. `sort` and the existing `transform` steps (filter, window, aggregate). |
| Marks & style | `mark.offset`, `mark.order`, `mark.curve`, `mark.fillOpacity`, `mark.strokeWidth`. Not `mark.stack`, `mark.stackGap`, or `mark.gradient` in v1. |
| Axes | `axes.x` and `axes.y` through `readAxis`: title, grid, labels, rotate, `autoSkip`. The y domain is the stacked extent after the offset, not the raw values. `"expand"` formats y as a percent. |
| Labels | No point labels in v1. A series name sits in the legend, not on the layer. |
| Legend | `legend.show`, `position`, `anchor`, `align`, `orient`, `symbol`, `title`, `hide`. The chart calls `legendSpace` and shrinks the plot. |
| Tooltip & interaction | The existing mark tooltip, one layer at the hovered x. `a11y.keyboard` moves across x and announces the layer values. |
| Colors & theme | `theme`, `theme.mode`, `theme.tokens.series`, `theme.tokens.grid`, `theme.tokens.axis`, `theme.tokens.text`. |
| Layout & size | `size.width`, `size.height`, `size.padding`. |
| Annotations | `rule`, `text`, and `band` on the x domain. A y rule is in offset space and is easy to misread. v1 allows it and does not retarget it. |
| Accessibility | `a11y.alt` (required), `a11y.description`, `a11y.keyboard`, `a11y.dataTable`. |
| Advanced | `render` stays off. Canvas is line, stacked-area, scatter, bar, heatmap, and candlestick (`CK3033`). `timezone` applies when x is temporal, same list as line. |

## Data shape and transforms

Wide rows, one column per layer, are the short spec and the one `llms.txt` should teach. Long rows with `encoding.series` are the same stack. The renderer builds the running totals. It does not write them back into `data`.

No density, bin, or stack transform is added to the `transform` array. Agents already fail when a library asks them to emit a stack transform. The offset is a mark default.

Nulls break the layer at that x, matching `mark.connectNulls` on stacked area (default leaves the gap). A missing series cell is a zero only when the column exists and the value is `0`, not when the key is absent in a long table.

## Interactions

Hover at an x shows every layer's value and its share of the column, in the existing tooltip. The hovered layer uses the series color. The others drop to `muted` at the fill opacity. Legend click uses the existing legend toggle (`legend.hide` is the static form). No drag, no zoom in v1. Zoom on a streamgraph changes the wiggle baseline, which is a different chart, and it waits.

## Accessibility

`a11y.alt` is one sentence the agent writes. The shape to teach: the layer that grew, and the layer that shrank, with no claim that a reader can recover the total from the picture.

Each layer path gets `aria-label` of the series name plus min and max of that layer's value, not of the offset coordinate. `a11y.keyboard: true` moves by x order. ArrowLeft and ArrowRight change x. ArrowUp and ArrowDown change layer. The announcement is the series, the x label, the value, and the share. `a11y.dataTable` is the honest fallback, because a streamgraph's geometry hides the zero.

Color is not the only cue inside a layer: the tooltip and the table name the series. v1 does not add pattern fills. See [pattern fills](../big-features-pros-cons.md).

## Soft theme

Layer fills are the series ramp at `fillOpacity` 0.22, stroke the same series color. Grid and axis use those tokens. Labels use `text`. A highlighted series (legend hover) stays series; the rest use `muted`. No new token. Dark mode is the dark series list through `theme.mode` or `light-dark()`. The transparent background stays. A wiggle chart with no zero line must not invent a baseline stroke. The axis spine is enough.

## Layout, dependency, bundle

The layout is the d3-shape stack, written out, not imported. For each x, sum the layer values in order. `"zero"` starts at 0. `"expand"` divides by the column sum. `"center"` shifts the column so its midpoint is 0. `"wiggle"` adds the weighted difference of successive columns from Byron and Wattenberg (2008), then shifts so the global minimum is 0, which is what Plot does so the axis starts clean. Inside-out order is by the series with the smallest sum toward the middle. The result is deterministic.

Zero dependencies. Do not add `d3-shape`. The stack plus the area path is the whole algorithm.

Estimate, not a measurement: about 2.5–4 KB gzip on `extra`, and a standalone `@chartkitdev/core/charts/streamgraph` entry around 8–11 KB because it pulls `openChart` and the axis helpers. Not in the line bundle. Not in `all`. For scale, strip's first landing added about 2,800 bytes to `extra`, and its standalone entry is budgeted at 13,046 bytes gzip.

## Shared code

`openChart`, `readAxis`, `ticks`, `linear`, `readFrame`, `readTable`. `paintLegend` and `legendSpace`. The area path builder should be a small function in the extra chart, not an import of `cartesian.ts` (that file is the line bundle's weight). `mark.curve` resolution already lives in one place and should be called, not reimplemented. Tooltip hit-testing is the extra interact path.

## Risks

- Agents will emit `type: "streamgraph"` with ordinary stacked data and expect a zero baseline. The default wiggle then looks wrong and they blame the data. The alt sentence and the `llms.txt` line have to say the baseline is not zero. `mark.offset: "zero"` is the escape, and it is in the spec so repair can offer it.
- Wiggle depends on series order. Inside-out as the default keeps two runs with the same rows stable. `"none"` follows first-seen order, which follows row order, so a sort changes the picture. Document that next to `mark.order`.
- Y gridlines are in offset space. A tick labeled `40` is not "40 units above zero" under wiggle. v1 still draws the ticks. The risk is a reader treating them as absolute. The tooltip reports the raw value.
- Smooth curves can cross if the offset is steep and the interpolation overshoots. Monotone-x is the default because it stays inside the data, which is already why line uses it.

## Error situations

Numbers are not assigned. See the README. Severity and repair are the contract.

| Situation | Severity | Repair |
| --- | --- | --- |
| `encoding.y` has a negative, or a value that is not numeric. | error | None. |
| One series, or one y field. | warning | Set `mark.offset` to `"zero"`. The picture is an area on a baseline. |
| More than 12 series. | warning | None. Nothing is dropped. The hint points at a legend and at filtering. |
| `mark.stack` is set. | warning | Remove `mark.stack`. |
| `mark.offset` is set on a chart that is not a streamgraph. | warning | Remove `mark.offset`. |
| `render` is `"canvas"`. | warning | The existing canvas refusal (`CK3033`). Do not add a painter. |

Missing `encoding.x` or `encoding.y` stays the existing missing-encoding error. A bad enum stays the existing bad-enum error. An unknown field stays the existing unknown-field error.

## Schema diff

Add `"streamgraph"` to the root `type` enum, to the `allOf` branch that requires `data`, and to the branch that requires `encoding.x` and `encoding.y`. One sentence on `type`: a streamgraph is a stacked area around a moving baseline. `mark.offset` is `"wiggle"` unless set.

`mark` gains `offset` (`"wiggle"` \| `"center"` \| `"zero"` \| `"expand"`) and `order` (`"inside-out"` \| `"none"` \| `"ascending"` \| `"descending"`). Descriptions say they apply to streamgraph. `mark.curve` and `mark.fillOpacity` descriptions gain streamgraph.

## Examples

### 1. Minimal

The zero-option chart. Three years, two genres. Wiggle, inside-out, monotone.

```json
{
  "version": "1",
  "type": "streamgraph",
  "data": [
    { "year": "2020", "fiction": 20, "history": 12 },
    { "year": "2021", "fiction": 28, "history": 18 },
    { "year": "2022", "fiction": 22, "history": 30 }
  ],
  "encoding": { "x": "year", "y": ["fiction", "history"] },
  "a11y": { "alt": "History overtook fiction by 2022. The baseline is not zero." }
}
```

Compact JSON is 298 characters and **87 tokens**. Pretty-printed it is 135 tokens.

### 2. Centered, long data, legend on the right

`mark.offset: "center"` is the Vega-Lite chart. `mark.order: "none"` keeps first-seen series order so the legend matches the stack.

```json
{
  "version": "1",
  "type": "streamgraph",
  "data": [
    { "year": "2020", "genre": "Fiction", "copies": 20 },
    { "year": "2020", "genre": "History", "copies": 12 },
    { "year": "2021", "genre": "Fiction", "copies": 28 },
    { "year": "2021", "genre": "History", "copies": 18 }
  ],
  "encoding": { "x": "year", "y": "copies", "color": "genre" },
  "mark": { "offset": "center", "order": "none" },
  "legend": { "position": "right" },
  "a11y": { "alt": "Fiction stays the larger share. Layers are centered, not stacked on zero." }
}
```

Compact JSON is 445 characters and **120 tokens**. Pretty-printed it is 192 tokens.

## Where it ships

- Renderer in `@chartkitdev/core/charts/streamgraph`, adopted like strip. The `extra` entry re-exports it. Not in line or `all`.
- Docs page `/docs/charts/streamgraph` through the existing chart page.
- `llms.txt` gets the minimal spec, not the centered one, and only after a trim.
- Gallery tile uses the minimal spec.
- Eval task `copies-by-genre-streamgraph` for a later round. The checker wants `type: "streamgraph"`, both y fields, and a rendered path whose baseline is not the zero of a stacked area. It is not a paid run. The published scoreboard stays 42 tasks.

## Left for later

A `"sign"` offset. Labels sitting inside the thickest part of a layer. Drawing `mark.offset: "wiggle"` as an option on `stacked-area` instead of a type. v1 is a type because agents say `streamgraph` and because `"zero"` on this type is the repair, not the default. Canvas. Zoom.

## Size

**S.** One stack function and the area path ChartKit already knows how to draw.
