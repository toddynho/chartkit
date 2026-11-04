# Parallel coordinates spec proposal

Status: design only. Rank 8 in [README.md](./README.md). Recommendation: later. Effort M for the static lines. A brush that filters axes is a second project and is not in the M. Coverage 3 of 9. Matrix id `type.parallel`, `agentRelevance` 1.

Parallel coordinates draw one vertical axis per measure and one polyline per row. Use them when a row has more than three or four numbers and the question is which rows share a shape. Do not use them for two measures. That is scatter. Do not use them for a time series. That is line. Do not use them when the reader needs to look up a single number. A table does that better, and `a11y.dataTable` already exists.

v1, when it is built, is static. Plotly's `constraintrange` brush is the feature that makes the chart an analysis tool. Shipping the lines without the brush is an honest chart and a weak one. That is why this waits.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `chart.parallelCoordinates: true`. Each measure is a y axis. `xAxis.categories` titles them. `chart.parallelAxes` sets the axes together. A line series is one row. | [Parallel coordinates](https://www.highcharts.com/docs/chart-and-series-types/parallel-coordinates-chart) |
| ECharts | `series.type: "parallel"` plus a `parallelAxis` array. `parallel.layout` is horizontal or vertical. | [series-parallel](https://echarts.apache.org/en/option.html#series-parallel), [parallelAxis](https://echarts.apache.org/en/option.html#parallelAxis) |
| Plotly | A trace `type: "parcoords"`. `dimensions` is an array of `{ label, values, range }`. `line.color` colors the lines. `constraintrange` brushes one axis. | [Parallel coordinates](https://plotly.com/javascript/parallel-coordinates-plot/), [parcoords reference](https://plotly.com/javascript/reference/parcoords/) |

Vega-Lite is manual. Chart.js is a plugin. Plot, Recharts, and Nivo do not have the mark. amCharts is `unknown`.

## Encoding

Wide rows. One row is one line.

| Channel | Role |
| --- | --- |
| `encoding.y` | A list of numeric fields. Each field is an axis, left to right, in list order. |
| `encoding.color` | Optional. A category colors the line. A constant color is one color for every line. |
| `encoding.label` | Optional. The row's name in the tooltip. Strip already owns this channel and warns on other types (`CK3094`). Parallel would join that allow-list. |

There is no `encoding.x`. The axes are the y list. `a11y.alt` stays required.

Each axis is scaled independently from the finite values of that field to the plot height. The default domain is the data extent, padded the way a line axis is not: no zero force. A field that is all equal gets a collapsed axis and a warning. `encoding.y[i].scale.domain` overrides that axis when the list item is a channel object. The string form `"mpg"` is the short form and is what the minimal spec uses.

## Mark options

A spec with `version`, `type`, `data`, `encoding.y` as a list of at least three fields, and `a11y.alt` draws a line per row, category color if set, otherwise `accent` at low opacity so thirty lines do not become a ribbon.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.opacity` | number 0–1, the existing mark key | `0.35` when there is no color field, otherwise `0.8` | Line opacity. The key already applies to scatter and spike. Parallel joins that description. The schema range stays 0–1. |
| `mark.strokeWidth` | number, existing | `1` | Thinner than a line chart. The line-chart default is the theme stroke, which is too heavy here. |
| `mark.missing` | `"skip"` \| `"gap"` | `"gap"` | `"gap"` breaks the polyline at a null. `"skip"` joins the neighbors and hides the hole. |
| `mark.axisOrder` | `"none"` \| string array | `"none"` | `"none"` follows the `encoding.y` list. An array of field names reorders the axes. |

Brush, range filters, and axis flipping (high at the bottom) are out of v1. `scale.reverse` on a channel object is the flip, and it uses the existing scale key. No new option.

## Catalog groups

| Group | On parallel coordinates |
| --- | --- |
| Data / Encoding | `encoding.y` as a list, optional `encoding.color`, optional `encoding.label`, per-field `scale.domain` and `scale.reverse`, per-field `format`. |
| Marks & style | `mark.opacity`, `mark.strokeWidth`, `mark.missing`, `mark.axisOrder`. Not `mark.curve`. Lines are straight between axes. |
| Axes | One axis per field. Title is the field name, or the channel `title`. Ticks use `readAxis` formatting. No gridlines between axes. The axis spine uses the `axis` token. |
| Labels | Axis titles only. |
| Legend | When `encoding.color` is a field. |
| Tooltip & interaction | Hover picks the nearest line and lists every field. No brush. |
| Colors & theme | Color field uses the series palette. No color field uses `accent`. |
| Layout & size | `size`, `size.padding`. Axes share the width equally. |
| Annotations | None. A rule on one axis would need an axis id. Out of v1. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. The table is the chart's honest form. |
| Advanced | `render` stays off. |

## Data shape and transforms

Wide rows only. A long table (one row per measure) is an error. Repair does not pivot. Pivoting invents a shape the agent did not write, and the hint says to pass one row per line with the measures as fields.

At least three y fields. Two fields is scatter, and the error says so. At least two rows. One row is a line with nothing to compare, and the error says so.

Nulls follow `mark.missing`. Non-numeric cells are nulls for that axis and warn once per field, not once per cell.

## Interactions

Hover: the nearest polyline, full opacity, in its series color or `accent`. The others drop to `muted` at 0.15. The tooltip lists field, value, in axis order. Legend hover, when color is a category, keeps that category.

`a11y.keyboard: true` moves across lines, not across axes. The announcement is the label, or the row index, then each field's value. There is no axis brush, so keyboard does not filter.

v1 does not implement `constraintrange`. When it is added later it should be `mark.brush` as a list of `{ field, min, max }`, declarative, so a spec still has no code. That object is not in this schema diff.

## Accessibility

`a11y.alt` names the pattern, not every row. Teach: which group sits high on which axis. Over 12 lines, the alt sentence cannot list them, and the docs should say to turn on `a11y.dataTable`.

Each polyline's `aria-label` is the label and the field values in order. Axes are titled text, not a second set of widgets. Color is backed by the tooltip list. A monochrome chart (`accent` at 0.35) is readable as a density of lines and is a poor place to encode a category. The warning when there are more than 30 lines and no color field says the lines are a mass and the table is the data.

## Soft theme

Lines use series colors or `accent`. Opacity is the separation, not a new palette. Axis spines and tick labels use `axis` and `muted`. Titles use `text`. The plot background stays transparent. No grid, so `grid` is unused. No new token. Dark mode uses the dark series list and the dark `accent`. Overlapping translucent lines will pick up whatever is behind the SVG. On a dark page that is fine. On a patterned page it is not. The chart does not paint a background rect. The embedder owns the page color, which is the Soft rule.

## Layout, dependency, bundle

Equal gaps across the inner width. Each axis: min, max, a linear scale, five ticks from `ticks`. Each row: a polyline through the scaled values. Deterministic. No layout library.

Zero dependencies.

Estimate: 5–7 KB gzip on `extra`, standalone entry 11–14 KB, because of the per-axis tick pass. Not in line or `all`. A brush would add interaction code in `interact`, not in this estimate.

## Shared code

`openChart`, `readAxis`, `ticks`, `linear`, `readFrame`, `readTable`, `valueFormat`. `paintLegend` when color is a field. The line polyline helper is the paint model. Do not import `cartesian.ts`. `encoding.label` joins strip's channel if both exist. The `CK3094` allow-list would add `parallel`.

## Risks

- Independent scales hide units. A line that looks flat can be a large move on a wide axis, or a small move on a tight one. The tooltip's raw values are the correction. v1 does not offer a shared scale. A shared scale is a different chart (a line chart with a categorical x of field names) and the error for two fields already points at scatter, not at that trick.
- Axis order changes the story. `mark.axisOrder` makes the order explicit. The default follows the encoding list so the spec the agent wrote is the picture.
- Thirty translucent lines and a hover that picks the nearest one will feel arbitrary. The pick is the smallest mean screen distance to the segments, deterministic given the pointer. Document the rule so tests can lock it.
- Agents will emit `encoding.x` as the row name. That is a warning, and `repair()` moves a string `encoding.x` to `encoding.label` only when `encoding.label` is empty and x's field is not in the y list. That is a narrow patch. It does not run when x looks like a measure.

## Error situations

Numbers are not assigned, except `CK3094`, which already fires for `encoding.label` on the wrong type. Parallel joins the allow-list, so the warning does not fire here.

| Situation | Severity | Repair |
| --- | --- | --- |
| `encoding.y` is not a list of at least three fields. | error | None. Two fields: the hint says scatter. |
| Fewer than two rows with any finite value. | error | None. |
| A field is non-numeric for every row. | error | None. The hint names the field. |
| A field is constant. | warning | None. The axis still draws as a short tick. |
| More than 30 lines and no color field. | warning | None. |
| More than 8 axes. | warning | None. Nothing is dropped. |
| `encoding.x` is a string field and `encoding.label` is empty. | warning | Move it to `encoding.label`. |
| `mark.curve` is set. | warning | Remove it. |
| `mark.axisOrder` names a field that is not on `encoding.y`. | warning | Drop the unknown name. If none remain, remove `mark.axisOrder`. |

## Schema diff

Add `"parallel"` to the `type` enum, the `data` branch, and a branch that requires `encoding.y`. One sentence: one vertical axis per y field, one polyline per row.

`mark` gains `missing` (`"skip"` \| `"gap"`) and `axisOrder` (the string `"none"` or an array of field names). `mark.opacity` already exists for scatter and spike, range 0–1. Its description gains parallel. The renderer default on this type is 0.35 with no color field and 0.8 with one. `encoding.label` description gains parallel, and `CK3094` allows it.

## Examples

### 1. Minimal

Three cars, three measures, one color because there is no series. Opacity defaults to 0.35.

```json
{
  "version": "1",
  "type": "parallel",
  "data": [
    { "name": "A", "mpg": 30, "hp": 100, "wt": 2.1 },
    { "name": "B", "mpg": 15, "hp": 250, "wt": 3.8 },
    { "name": "C", "mpg": 22, "hp": 140, "wt": 2.9 }
  ],
  "encoding": { "y": ["mpg", "hp", "wt"], "label": "name" },
  "a11y": { "alt": "A is high mpg and low horsepower. B is the opposite. Weight follows horsepower." }
}
```

Compact JSON is 309 characters and **108 tokens**. Pretty-printed it is 164 tokens.

### 2. Colored, one axis reversed

```json
{
  "version": "1",
  "type": "parallel",
  "data": [
    { "name": "A", "mpg": 30, "hp": 100, "wt": 2.1, "desk": "East" },
    { "name": "B", "mpg": 15, "hp": 250, "wt": 3.8, "desk": "West" }
  ],
  "encoding": {
    "y": ["mpg", { "field": "hp", "scale": { "reverse": true } }, "wt"],
    "color": "desk",
    "label": "name"
  },
  "mark": { "opacity": 0.9 },
  "a11y": { "alt": "East sits at high mpg. Horsepower is drawn with the high number at the bottom." }
}
```

Compact JSON is 369 characters and **120 tokens**. Pretty-printed it is 187 tokens.

## Where it ships

- `@chartkitdev/core/charts/parallel`, extra only, when it is built.
- Docs `/docs/charts/parallel`. The page leads with "no brush in this version."
- `llms.txt` gets example 1 only after the type exists, and the line says three or more measures, one row per line.
- Gallery tile is example 1, with few enough lines that the default opacity still reads.
- Eval task `cars-parallel` for a later round. The checker wants `type: "parallel"`, at least three y fields, and polylines. It rejects a scatter. Not a paid run. The scoreboard stays 42.

## Left for later

`mark.brush` as data, axis drag-to-reorder, and a density of lines drawn as a band instead of as polylines when the row count is over a few hundred. The band is the version that could share the density grid. It is not v1.

## Size

**M.** Several axes, one polyline painter. The brush is the part that would make it L.
