# Marimekko spec proposal

Status: design only. Rank 6 in [README.md](./README.md). Recommendation: build. Pulled forward of its score because the encoding is `x`, `y`, and `color`, which agents already write for a stacked bar. Effort M. Coverage 3 of 9. Matrix id `type.marimekko`, `agentRelevance` 1.

A marimekko (a mosaic, a variable-width stacked bar) makes column width a second quantity. In the default, width is the column's total and the segments are shares of that column. Use it when both the size of the group and the mix inside the group matter, and the groups should fill the plot. Do not use it to compare segment values across columns by bar length. The eye will compare areas, and the areas are the values, but a reader trained on bars will compare heights. When the width is not the total, say so in the alt sentence. A stacked bar is the chart when every column should be the same width.

Highcharts' own docs separate variwide from marimekko: variwide sets each column's width from a third value and does not force the columns to fill the plot. The matrix still counts variwide as native. This spec treats a true mekko as the default and variwide as `encoding.size`.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Nivo | `Marimekko` / `ResponsiveMarimekko`. `dimensions` is the column thickness. `value` is the segment. `layout` is `vertical` or `horizontal`. `offset` defaults to `none`. | [Marimekko](https://nivo.rocks/marimekko/) |
| Highcharts | `series.type: "variwide"`. `y` is the height. `z` is the width. The docs say a mekko computes widths so the stack fills the plot, and variwide does not. | [Variwide](https://www.highcharts.com/docs/chart-and-series-types/variwide-chart) |
| Plotly | A bar trace with `width` as an array, one width per bar. That is variwide, not a filled mosaic, unless the widths already sum to the axis. Matrix status `partial`. | [bar width](https://plotly.com/javascript/reference/bar/#bar-width) |

ECharts is a custom series (manual). Vega-Lite, Chart.js, Plot, Recharts, and amCharts do not have the mark.

## Encoding

Flat rows. One row per segment.

| Channel | Role |
| --- | --- |
| `encoding.x` | The column (nominal). |
| `encoding.y` | The segment value. Segments stack to the column height. |
| `encoding.color` | The segment series. |
| `encoding.size` | Optional. The column width. If omitted, the width is the sum of `y` in the column. If set, every row in a column must carry the same width. That is the variwide case. |

`a11y.alt` stays required. `encoding.y` is non-negative.

## Mark options

A spec with `version`, `type`, `data`, `encoding.x`, `encoding.y`, `encoding.color`, and `a11y.alt` draws vertical columns that fill the plot width. Each column's width is its total. Segments are shares of the column, so every column is the same height and the area is the value. That is the mosaic. A reader who wanted absolute segment heights sets `mark.share: false`.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.share` | boolean | `true` | `true`: each column is 100% tall, width carries the total, area is the value. `false`: height is the raw segment, width is the total or `encoding.size`. Columns no longer share a top. |
| `mark.orientation` | `"vertical"` \| `"horizontal"` | `"vertical"` | Vertical columns, or horizontal bars. |
| `mark.gap` | number 0–24, px | `2` | Gap between columns. The gaps are not part of the width scale. |
| `mark.pad` | number 0–8, px | `1` | Gap between segments inside a column. |

`mark.stack` is implied. Setting it warns and `repair()` removes it.

## Catalog groups

| Group | On a marimekko |
| --- | --- |
| Data / Encoding | `encoding.x`, `encoding.y`, `encoding.y.format`, `encoding.color`, `encoding.color.title`, optional `encoding.size`. |
| Marks & style | `mark.share`, `mark.orientation`, `mark.gap`, `mark.pad`. |
| Axes | `axes.x` category labels. `axes.y` is a percent axis when `mark.share` is true, and a value axis when it is false. No y grid on the share chart, because every column has the same top. Grid on when `mark.share` is false. |
| Labels | Segment labels only when the segment is at least 24 px on both sides. Format is the value, or the share when `mark.share` is true. `mark.labels` and `mark.labelFormat` apply, default off so the minimal chart stays quiet. |
| Legend | The color series. `legendSpace` shrinks the plot. |
| Tooltip & interaction | Hover: column, segment, value, share of the column, share of the total. |
| Colors & theme | Series palette. Segment stroke is `surface` at 1 px so neighbors separate in both modes. |
| Layout & size | `size`, `size.padding`. |
| Annotations | A `rule` on y is meaningful only when `mark.share` is false. When `mark.share` is true, a y rule warns and `repair()` removes it. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. |

## Data shape and transforms

One row per segment. The renderer groups by `encoding.x` in first-seen order, sums `y`, and assigns widths. `sort` with `by: "value"` orders the columns by that total. It does not reorder segments inside a column. Segment order is first-seen color order, shared across columns so the legend matches.

A column whose rows disagree about `encoding.size` is an error. Repair does not average them.

No stack transform in the spec. The widths are not written back to `data`.

## Interactions

Hover highlights the segment and fades other series to `muted`, the same as a stacked bar. Legend toggle hides a series and recomputes widths when the width is the sum. When `encoding.size` sets the width, hiding a series does not change the column width. That difference is the one rule the tooltip must not hide: the width label says "total" or the size field's name.

`a11y.keyboard: true` moves across columns, then through segments bottom to top. No drag.

## Accessibility

`a11y.alt` has to say what the width is. Teach: the widest column, and the segment that dominates it. If `mark.share` is true, the sentence should not compare heights across columns.

Each segment's `aria-label` is the column, the series, the value, and the share of the column. `a11y.dataTable` is the flat rows. Color is backed by the legend name and the label.

## Soft theme

Series fills at full opacity (these are bars, not areas). A 1 px `surface` stroke separates segments. `surface` follows `light-dark()`. Labels use `labelInk` when they sit on the fill, and `text` when they sit outside. Axis and category labels use `text` and `muted`. No new token. The share chart has no y grid, so `grid` is unused there and the token stays off the SVG. The value chart uses `grid`.

## Layout, dependency, bundle

A single pass. Column widths are proportions of the inner width minus gaps. Segment heights are proportions of the inner height minus pads, or raw values on a linear scale when `mark.share` is false. Deterministic.

Zero dependencies.

Estimate: 3–5 KB gzip on `extra`, standalone entry 9–12 KB. Not in line or `all`. Importing the bar renderer would pull cartesian into the chart entry. The rect loop belongs in the extra chart.

## Shared code

`openChart`, `readFrame`, `readTable`, `readAxis` for the category labels and, when `mark.share` is false, the value axis. `paintLegend`, `legendSpace`, `labelInk`, `valueFormat`. The series color resolver. Not the squarify function. Not the streamgraph offset.

## Risks

- The share default surprises an agent who wanted variwide heights. Example 2 is the variwide spec, and the docs lead with it next to the mosaic so both are visible. The default stays the mosaic because that is the chart the type is named for. A prompt that says "variable width bar" and includes a width column should set `encoding.size` and `mark.share: false`. The `llms.txt` line has to say both.
- Areas encode the value in the mosaic, and also in the variwide form when width is `encoding.size` and height is `y`. People compare heights anyway. The alt sentence is the mitigation, not a second geometry.
- Many colors and many columns make segments thinner than a label. Labels hide under 24 px. The tooltip keeps the number. More than 8 columns warns. More than 8 series warns. Nothing is dropped.

## Error situations

Numbers are not assigned.

| Situation | Severity | Repair |
| --- | --- | --- |
| `encoding.y` is negative or not numeric. | error | None. |
| `encoding.color` is missing. | error | None. A one-series variable-width bar is `encoding.size` on a future bar, not this type. The hint says so. |
| Rows in one column disagree on `encoding.size`. | error | None. |
| More than 8 columns, or more than 8 series. | warning | None. |
| `mark.stack` is set. | warning | Remove it. |
| A y `rule` annotation while `mark.share` is true. | warning | Remove that annotation. |
| `mark.share` or `mark.gap` on another type. | warning | Remove them. |

## Schema diff

Add `"marimekko"` to the `type` enum, the `data` branch, and the branch that requires `encoding.x`, `encoding.y`, and `encoding.color`. One sentence: column width is the total (or `encoding.size`), and segments stack inside the column.

`encoding.size` description gains marimekko: the column width, constant within an x value. `mark` gains `share` (boolean, default true) and `gap` (0–24, default 2). `mark.pad` (0–8, default 1) is the sibling gap. Icicle uses that same key for the same idea. One description names both types. `mark.orientation` description gains marimekko. `mark.labels` and `mark.labelFormat` gain marimekko.

## Examples

### 1. Mosaic

Width is the column total. Height is the share. Area is the value.

```json
{
  "version": "1",
  "type": "marimekko",
  "data": [
    { "market": "EU", "segment": "Retail", "sales": 30 },
    { "market": "EU", "segment": "Cloud", "sales": 10 },
    { "market": "US", "segment": "Retail", "sales": 20 },
    { "market": "US", "segment": "Cloud", "sales": 40 }
  ],
  "encoding": { "x": "market", "y": "sales", "color": "segment" },
  "a11y": { "alt": "The US column is wider. Cloud is most of that column. Height is share, not sales." }
}
```

Compact JSON is 380 characters and **104 tokens**. Pretty-printed it is 162 tokens.

### 2. Variwide

Width is headcount. Height is the raw sales. `mark.share` is false so the columns do not stretch to the same top.

```json
{
  "version": "1",
  "type": "marimekko",
  "data": [
    { "market": "EU", "segment": "Retail", "sales": 30, "staff": 12 },
    { "market": "EU", "segment": "Cloud", "sales": 10, "staff": 12 },
    { "market": "US", "segment": "Retail", "sales": 20, "staff": 40 },
    { "market": "US", "segment": "Cloud", "sales": 40, "staff": 40 }
  ],
  "encoding": { "x": "market", "y": "sales", "color": "segment", "size": "staff" },
  "mark": { "share": false },
  "a11y": { "alt": "Width is staff. The US column is wider. Cloud sales are the tall US segment." }
}
```

Compact JSON is 457 characters and **128 tokens**. Pretty-printed it is 200 tokens.

## Where it ships

- `@chartkitdev/core/charts/marimekko`, extra only.
- Docs `/docs/charts/marimekko`, with both examples above the fold.
- `llms.txt` gets example 1 and one sentence pointing `encoding.size` plus `mark.share: false` at the variwide case. After a trim.
- Gallery tile is example 1.
- Eval task `market-mosaic` for a later round. The checker wants `type: "marimekko"`, a color field, and column widths that sum to the plot rather than equal bands. Not a paid run. The scoreboard stays 42.

## Left for later

A gap that scales with a third measure. Labels that show value and share together. A spine plot (the same geometry, discussed under that name). The type name stays `marimekko`. The description can mention mosaic.

## Size

**M.** The math is short. The axis and the label rules are the work, and they are shared.
