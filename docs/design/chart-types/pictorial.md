# Pictorial bar spec proposal

Status: design only. Rank 11 in [README.md](./README.md). Recommendation: don't. Effort M if it were built. Coverage 4 of 9. Matrix id `type.pictorial`, `agentRelevance` 1.

A pictorial bar repeats a symbol, or clips one symbol, so the count is a row of icons. Use it for a small set of integers in a story where the icon is the subject (people, buses, trees). Do not use it for precise comparison. That is `bar`. Do not use it for a share of a whole with many series. That is a stacked bar. Do not use it when the symbol would be a user-supplied SVG path or an image URL. Those are the security problem, and they are the feature the other libraries are proud of.

The smaller version, if a page ever needs isotype, is a closed set of built-in symbols and a repeat count. It is written here so the refusal has a shape. It is not recommended.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `series.type: "pictorial"`, plus `modules/pictorial.js`. `paths.definition` is an SVG path in a viewBox that sits on `(0, 0)`. One image is one series. Stacking fills the shape. `paths.max` scales a repeated image. | [Pictorial series](https://www.highcharts.com/docs/chart-and-series-types/pictorial) |
| ECharts | `series.type: "pictorialBar"`. `symbol` is a built-in shape or an `image://` URL. `symbolRepeat` tiles it. `symbolClip` fills one symbol. `symbolBoundingData` sets the track. | [series-pictorialBar](https://echarts.apache.org/en/option.html#series-pictorialBar) |
| amCharts 5 | `PictorialStackedSeries`. An SVG path is stacked by value, the same idea as Highcharts' stacked shape. | [PictorialStackedSeries](https://www.amcharts.com/docs/v5/reference/pictorialstackedseries/) |
| Recharts | `Bar` `shape` as a component or a function. That is a partial: the chart draws whatever the function returns, not a symbol chart. Matrix status `partial`. | [Bar](https://recharts.github.io/en-US/api/Bar) |

The Recharts bar `shape` page moves. The prop is the custom-render escape hatch, which [big-features-pros-cons.md](../big-features-pros-cons.md) recommends not copying. Count it as partial, not as a symbol chart.

Vega-Lite, Plotly, and Chart.js are `none`. Plot and Nivo are manual.

## Encoding

The bar encoding, if this were built.

| Channel | Role |
| --- | --- |
| `encoding.x` | The category. |
| `encoding.y` | The value. |
| `encoding.color` | Optional series. |

`a11y.alt` stays required.

## Mark options

The smaller version's whole surface:

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.symbol` | `"square"` \| `"circle"` \| `"person"` | `"square"` | A built-in path. `"person"` is one shipped silhouette, not a user path. |
| `mark.unit` | number `> 0` | a nice step so the longest bar is about 10 symbols | The value one symbol stands for. |
| `mark.clip` | boolean | `false` | `false` repeats whole symbols and draws a partial last symbol for the remainder. `true` clips one symbol to the value, which is the Highcharts stacked-shape look, and it needs a single symbol the height of the axis. v1 of the smaller version would ship repeat only. |

No `mark.path`. No `mark.image`. No URL. A string that is not one of the three symbols is the bad-enum error.

## Catalog groups

| Group | On a pictorial bar |
| --- | --- |
| Data / Encoding | `encoding.x`, `encoding.y`, `encoding.y.format`, optional `encoding.color`. |
| Marks & style | `mark.symbol`, `mark.unit`. |
| Axes | Category axis. The value axis can be hidden because the icons are the scale. Default: value axis off, category on. |
| Labels | The value at the end of the row, in `text`. |
| Legend | The unit ("one square is 10") as the legend title, plus series when colored. |
| Tooltip & interaction | Hover: category, value, and how many symbols that is, including the fraction. |
| Colors & theme | Series palette, or `accent` for one series. |
| Layout & size | `size`. Rows are horizontal by default, unlike bar. Isotype is a row. `mark.orientation: "vertical"` stacks the symbols upward. |
| Annotations | None. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. |

## Data shape and transforms

Bar rows. The renderer divides `y` by `mark.unit`. It does not change `data`. A value that is not a multiple of the unit draws a clipped last symbol at the remainder. The label shows the real value, not the rounded icon count.

Negative values are an error. A pictorial bar of a loss is a normal bar.

## Interactions

Hover the row, not the icon. The whole row is one hit target. Keyboard moves by category. There is nothing to do per icon.

## Accessibility

The icons are decoration. `a11y.alt` states the comparison in numbers. Each row's `aria-label` is the category and the value, not "eight person shapes." The symbols are `aria-hidden`. `a11y.dataTable` is the rows.

A decorative person silhouette is a problem of its own (whose body, which stereotype). The closed set includes `"person"` because isotype's classic unit is a person, and the docs would have to show the path and accept that it is a generic standing figure. That discomfort is one of the reasons not to build the type. `"square"` and `"circle"` do not have it. If a smaller version is ever forced, ship those two and leave `"person"` out until someone draws the figure on purpose.

Color is not the value. The count of symbols is the value, and the text label repeats it.

## Soft theme

Symbols use the series fill or `accent`. The remainder symbol uses the same fill at `0.35` so a partial unit reads as partial in both modes. The track behind a row, if any, uses `track`, which is already `light-dark()`. Labels use `text`. No new token. No image. Dark and light do not change the symbol geometry.

## Layout, dependency, bundle

A row of equally spaced paths. The last one is clipped by a rect. Zero dependencies. No SVG parser. The paths are constants in the file.

Estimate, if it were built: 3–5 KB gzip on `extra`, standalone 8–11 KB. Not in line or `all`. A user-path parser and an image fetch would be larger and would not belong in a server renderer.

## Shared code

`openChart`, `readFrame`, `readTable`, the bar's category scale if it can be called without importing `cartesian.ts`. If it cannot, duplicate the band layout. It is short. `valueFormat` for the end label. `paintLegend` for the unit sentence.

## Risks

- The feature agents will ask for is "use this logo." That is an image URL or an SVG string. Cloud renders the spec on a server. Fetching a URL is a request the spec author controls (SSRF). Inlining an SVG is a document the spec author controls (script, foreignObject, a huge path). Both are out. The closed symbol list is the only version that stays inside the threat model. [Custom marks](../big-features-pros-cons.md) is the same decision.
- A unit that does not divide the max makes the chart look quantized. The end label is required so the icon count is not the only number.
- `"person"` as a default would put a human figure on every accidental chart. The default in the table is `"square"` for that reason.
- Highcharts' stacked path (one shape filled by several series) is a different chart from a repeated icon. Supporting both is how this becomes L. The smaller version is repeat only.

## Error situations

Numbers are not assigned. This section is the contract if the smaller version is ever built. The recommendation is not to build it, so these codes should not be reserved ahead of a type that will not ship.

| Situation | Severity | Repair |
| --- | --- | --- |
| `encoding.y` is negative or not numeric. | error | None. |
| `mark.symbol` is not one of the closed names. | error | The bad-enum error. Do not accept a path string. |
| `mark.unit` is `0` or negative. | error | None. |
| A value is more than 40 units. | warning | None. The hint says the row will be a texture and a bar is the better chart. |
| `mark.symbol` or `mark.unit` on another type. | warning | Remove them. |

## Schema diff

None. Do not add `"pictorial"` to the enum while the recommendation is don't.

If the smaller version is forced later: add the type, require `data`, `encoding.x`, and `encoding.y`, and add `mark.symbol` and `mark.unit` with the enums above. `additionalProperties` on `mark` already rejects `mark.path` and `mark.image`. Keep it that way.

## Examples

### 1. The spec not to teach

Shown so a later reader can see how small the safe version is. Ten trips per square.

```json
{
  "version": "1",
  "type": "pictorial",
  "data": [
    { "mode": "Bike", "trips": 40 },
    { "mode": "Walk", "trips": 25 }
  ],
  "encoding": { "x": "mode", "y": "trips" },
  "mark": { "symbol": "square", "unit": 10 },
  "a11y": { "alt": "Bike is 40 trips. Walk is 25. Each square is 10 trips." }
}
```

Compact JSON is 242 characters and **80 tokens**. Pretty-printed it is 123 tokens.

### 2. What an agent will try, and what validation would reject

A path and an image are not in the schema. They are not given a repair that strips them into a square, because a square is a different chart than a logo and the agent should hear the refusal.

```json
{
  "version": "1",
  "type": "pictorial",
  "data": [{ "mode": "Bike", "trips": 40 }],
  "encoding": { "x": "mode", "y": "trips" },
  "mark": { "symbol": "M2 2 h20 v20 h-20 z" },
  "a11y": { "alt": "Bike is 40 trips." }
}
```

This does not validate. `mark.symbol` is not one of the names. There is no patch. Compact JSON is 181 characters and **66 tokens**. Pretty-printed it is 98 tokens. The bad spec is short. It is still the wrong feature.

## Where it ships

It does not. A docs page that says "use bar" is the delivery if anything is delivered. No `llms.txt` entry. No gallery tile. No eval task that expects a pictorial chart to succeed. A later eval may expect `meta.unsupported` or a repaired bar, and that task should be written when the refusal exists, not before.

## Left for later

Nothing, on purpose. A built-in two-symbol repeat can be reopened if a real page needs isotype and the security review is still this list. User paths and images do not get a later.

## Size

**M** to do the repeat well (partial symbols, rows, a unit legend). **Don't.** The safe subset is S, and the demand is 1.
