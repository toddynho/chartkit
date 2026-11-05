# Density spec proposal

Status: shipped as a 1D curve. The gallery example is Wait time. 2D filled density waits on [contour](./contour.md). Rank 2 in [README.md](./README.md). Coverage 4 of 9, and two of the four are partial. Matrix id `type.density`, `agentRelevance` 2.

A density chart draws a kernel density estimate: a smooth curve of how a quantitative sample is spread. Use it when the question is the shape of a distribution (one mode or two, where the mass sits, how wide the tail is). Do not use it for counts in bins. That is `histogram`, which ChartKit already draws. Do not use it when the reader needs a median and quartiles. That is `boxplot` or `strip`. A density with a group field is one curve per group, not a violin. Violin outlines are out of v1.

The matrix count of 4 is Highcharts (partial), Vega-Lite (native, 1D), Plotly (partial), and Observable Plot (native, and the mark is 2D). ECharts, Chart.js, Recharts, and Nivo are `none`. amCharts is `unknown` and is not coverage.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Vega-Lite | A `density` transform on a field, then an area mark. `bandwidth` `0` means Scott's rule. `groupby` makes one curve per group. `steps` samples the curve. The output fields default to `value` and `density`. | [Density](https://vega.github.io/vega-lite/docs/density.html) |
| Observable Plot | `Plot.density` estimates a 2D density and draws contours. Bandwidth, thresholds, and a weight channel. This is the 2D chart, shared with contour. | [Density mark](https://observablehq.github.io/plot/marks/density) |
| Plotly | `violin` computes a KDE (Silverman's rule when `bandwidth` is omitted) and draws it as a violin, not as a curve on a value axis. `histogram2dcontour` is the 2D form. | [violin](https://plotly.com/javascript/reference/violin/), [histogram2dcontour](https://plotly.com/javascript/reference/histogram2dcontour/) |
| Highcharts | `series.type: "bellcurve"` fits a normal curve to a base series. It is not a kernel estimate. The docs say the picture is wrong when the data is not normal. Counted partial. | [Bell curve](https://www.highcharts.com/docs/chart-and-series-types/bell-curve-series) |

ChartKit should take the raw sample and draw the curve. The spec does not contain a `density` transform. That transform is the Vega-Lite step agents get wrong, and it replaces the data the alt sentence is about.

## Encoding

`data` is one row per observation. `a11y.alt` stays required.

| | Sample | Group |
| --- | --- | --- |
| 1D (v1) | `encoding.x` quantitative | `encoding.series` or `encoding.color`, optional |
| 2D (later, with contour) | `encoding.x` and `encoding.y`, both quantitative | `encoding.color` is the density, not a field the user supplies |

A 1D spec that also sets a quantitative `encoding.y` is a different chart (scatter). v1 warns and draws the 1D curve on `x` only when `mark.dims` is omitted. Setting `mark.dims: 2` before the 2D work exists is an error.

Horizontal is the default: the sample runs along x, density along y. `mark.orientation: "vertical"` swaps them, the same word bar uses.

## Mark options

A spec with only `version`, `type`, `data`, `encoding.x`, and `a11y.alt` draws one filled curve. Bandwidth is Scott's rule. The curve is sampled at 64 points. The y domain starts at 0.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.bandwidth` | `"auto"` \| number `> 0` | `"auto"` | Gaussian kernel standard deviation, in data units. `"auto"` is Scott's rule: `1.06 * sd * n^(-1/5)`. A number is used as given. |
| `mark.steps` | integer 16–256 | `64` | Samples along the extent. The path is monotone through those samples. |
| `mark.extent` | `"pad"` \| `"data"` \| `[min, max]` | `"pad"` | `"pad"` is the sample min and max, each extended by 3 bandwidths. `"data"` clips to the sample. A pair is the domain. |
| `mark.normalize` | `"density"` \| `"count"` | `"density"` | `"density"` integrates to 1. `"count"` multiplies by `n`, which is what you stack. |
| `mark.orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Which axis holds the sample. |

`mark.curve` stays off. The curve is the kernel, not an interpolation choice. `mark.bins` on a density warns and is removed. The hint points at `histogram`.

## Catalog groups

| Group | On a density |
| --- | --- |
| Data / Encoding | `encoding.x` (the sample), optional `encoding.series` or `encoding.color`, `encoding.x.scale`, `encoding.x.format`, `encoding.y.format` for the density axis. Not a user-supplied `encoding.y` field in v1. |
| Marks & style | `mark.bandwidth`, `mark.steps`, `mark.extent`, `mark.normalize`, `mark.orientation`, `mark.fillOpacity`, `mark.strokeWidth`. |
| Axes | `axes.x` on the sample, `axes.y` on the density. Y includes zero. Grid on by default, same as histogram. |
| Labels | None on the curve. The group name is the legend. |
| Legend | Series legend when there is a group. `legendSpace` shrinks the plot. One series draws no legend. |
| Tooltip & interaction | Hover reports the sample value and the density at the nearest sample point, plus the group. |
| Colors & theme | Series palette per group. A single curve uses `accent`. Grid, axis, text as usual. |
| Layout & size | `size`, `size.padding`. |
| Annotations | `rule` and `text` in sample space (a marker at a threshold). `band` between two sample values. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. The table is the raw sample, not the 64 curve points, unless `mark` would make that table huge. Over 200 rows, the table warns and stays off unless `a11y.dataTable` is true. |
| Advanced | `render` stays off (`CK3033`). |

## Data shape and transforms

Rows are observations. The renderer sorts a copy of the numeric sample, computes the bandwidth, and evaluates the Gaussian at `mark.steps` positions. It does not write a new table into the spec. `repair()` does not replace `data` with curve points. The spec the agent wrote remains the sample.

Grouped curves share one extent and one step grid so they could be stacked later. v1 overlays them. It does not stack. Stacked densities are a follow-up that reuses `mark.normalize: "count"`.

Fewer than 2 finite numbers is an error. The histogram bin rules (`mark.bins`, Sturges, Freedman–Diaconis) are not reused. Scott's rule is the one density default.

## Interactions

Hover snaps to a sample point on the curve. The tooltip shows the x value, the density, and the group. Other groups drop to `muted`. No brush in v1. A brush that recomputes the kernel is a second chart and belongs with parallel-coordinates brushing, not here.

## Accessibility

`a11y.alt` states the shape, not the kernel. Teach: where the mass is, and whether there is a second bump. Do not teach the bandwidth.

The path `aria-label` is the group name, the x at the peak, and the peak density, rounded. `a11y.keyboard: true` moves along the sample. The announcement is the x value and the density. A density curve is a poor screen-reader chart. `a11y.dataTable` on the raw rows is the fallback, and the alt sentence carries the claim.

One curve uses `accent` so it is not "series 1 of a palette the reader cannot see." Groups use the series palette plus the legend names.

## Soft theme

Fill is `accent` at `0.22` for one curve, series colors at `0.22` for groups, stroke at full opacity. The zero baseline uses the `axis` token. Grid uses `grid`. Peak label, if a later version adds one, uses `text`. No new token. Dark and light follow the series lists and `light-dark()` on ink and grid. The curve does not use `positive` or `negative`.

## Layout, dependency, bundle

1D Gaussian KDE. Sort, standard deviation, Scott's rule, then 64 evaluations. Each evaluation is the sum of `n` kernels. That is `O(steps * n)`. Cap the naive sum at 5,000 rows by binning the sample into 256 equal-width bins and placing a kernel at each bin center weighted by the count. The bandwidth is still computed from the raw sample. The picture stays a KDE, and a 50,000-row column does not lock the server. Say so in the docs. The binning is an implementation detail, not a `mark` option.

Zero dependencies. Do not add a stats package.

Estimate: 3–4 KB gzip on `extra` for 1D, standalone entry 8–11 KB. 2D adds the grid and the blur, shared with contour, another 4–6 KB, and it does not land in this build. Not in line or `all`.

## Shared code

`openChart`, `readAxis`, `ticks`, `linear`, `readFrame`, `readTable`. Histogram's scale and zero baseline are the visual cousins. Do not call the histogram bin painter. `paintLegend` when a group exists. Tooltip from the extra interact path.

## Risks

- Scott's rule over-smooths a distribution that is two tight clusters. `"auto"` will hide the second mode. The alt sentence cannot be checked against that. `mark.bandwidth` as a number is the escape. v1 does not add a "robust" rule. Document the failure next to the default.
- Agents will set `type: "density"` and also `mark.bins`, because histogram and density share a prompt. Repair removes `mark.bins`.
- The y axis is a density, a small number. Default formatting will print `0.00`. The axis format should be a short general number, not the sample's format. That is a renderer choice, not a new encoding.
- Overlaying many groups makes a solid band of color. The 12-series warning from streamgraph applies.

## Error situations

Numbers are not assigned. See the README.

| Situation | Severity | Repair |
| --- | --- | --- |
| `encoding.x` has fewer than 2 finite numbers. | error | None. |
| `mark.bandwidth` is `0` or negative. | error | None. `"auto"` is the documented default, not a patch for a bad number. |
| `mark.bins` is set. | warning | Remove `mark.bins`. Hint: histogram bins counts. Density smooths the sample. |
| A quantitative `encoding.y` is set and `mark.dims` is omitted. | warning | Ignore `encoding.y` for the geometry. The hint says 2D is not in this version. |
| `mark.dims` is `2`. | error | None, until contour's grid exists. Then this row becomes a redirect. |
| More than 12 groups. | warning | None. |
| `mark.bandwidth` or `mark.steps` on a chart that is not a density. | warning | Remove them. |

## Schema diff

Add `"density"` to the `type` enum, to the branch that requires `data`, and to the branch that requires `encoding.x`. One sentence: a density draws a kernel estimate of `encoding.x`. `encoding.y` is not a data field in v1.

`mark` gains `bandwidth` (`"auto"` or a positive number), `steps` (integer 16–256, default 64), `extent` (`"pad"`, `"data"`, or a two-number array), and `normalize` (`"density"` or `"count"`). `mark.orientation` description gains density. `mark.bins` description says density warns and removes it.

## Examples

### 1. Minimal

One sample, Scott bandwidth, 64 steps, padded extent.

```json
{
  "version": "1",
  "type": "density",
  "data": [
    { "wait": 12 },
    { "wait": 15 },
    { "wait": 18 },
    { "wait": 14 },
    { "wait": 40 }
  ],
  "encoding": { "x": "wait" },
  "a11y": { "alt": "Most waits sit near 15 minutes, with a tail out to 40." }
}
```

Compact JSON is 197 characters and **61 tokens**. Pretty-printed it is 103 tokens.

### 2. Two groups, fixed bandwidth

```json
{
  "version": "1",
  "type": "density",
  "data": [
    { "wait": 12, "desk": "A" },
    { "wait": 14, "desk": "A" },
    { "wait": 30, "desk": "B" },
    { "wait": 36, "desk": "B" }
  ],
  "encoding": { "x": "wait", "color": "desk" },
  "mark": { "bandwidth": 4, "normalize": "count" },
  "a11y": { "alt": "Desk A clusters near 13 minutes. Desk B clusters near 33." }
}
```

Compact JSON is 290 characters and **87 tokens**. Pretty-printed it is 147 tokens.

## Where it ships

- `@chartkitdev/core/charts/density`, extra only, not line or `all`.
- Docs `/docs/charts/density`.
- `llms.txt` gets example 1 after a trim, plus one line: raw rows in, curve out, no transform.
- Gallery tile is example 1.
- Eval task `wait-time-density` for a later round. The checker wants `type: "density"`, the raw rows still in `data` (not a `value`/`density` table), and a path. It rejects a histogram. Not a paid run. The scoreboard stays 42.

## Left for later

2D grids, contour lines, violin outlines, stacked densities, a bandwidth rule other than Scott, and a rug of the raw points under the curve. The rug is the useful one. It reuses the strip dot and can follow in the same extra file once 1D is in.

## Size

**S** for the 1D curve. **M** once the sample is a grid.
