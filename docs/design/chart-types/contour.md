# Contour spec proposal

Status: design only. Rank 10 in [README.md](./README.md). Recommendation: later. After [density](./density.md) 1D, and after `readColorScale` follows Soft's mode instead of treating a transparent background as a light theme. Effort L. Coverage 3 of 9. Matrix id `type.contour`, `agentRelevance` 1.

A contour draws isolines of a value over a plane. Use it for a surface the reader already understands as a surface: elevation, a fitted field, a density. Do not use it for a table of categories. That is heatmap, which ChartKit already draws. Do not use it for a sample of one variable. That is density or histogram. v1, when it is built, takes a complete grid. Estimating the grid from scattered points is the 2D density problem and shares that code. It is not a second algorithm hiding in this type.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `series.type: "contour"`, plus `modules/contour.js`. Points are `x`, `y`, and `value`, and they do not have to be in order. `contourInterval` and `contourOffset` space the lines. The color axis paints the bands. The series is WebGPU, and the docs say browser support is not general. | [Contour](https://www.highcharts.com/docs/chart-and-series-types/contour) |
| Plotly | A trace `type: "contour"`. `z` is a 2D array. `x` and `y` are the axes, or `x0` and `dx`. `contours` sets start, end, and size. `histogram2dcontour` bins scattered points first. | [Contour plots](https://plotly.com/javascript/contour-plots/), [contour reference](https://plotly.com/javascript/reference/contour/) |
| Observable Plot | `Plot.contour` runs marching squares on a grid. The grid comes from samples or from a function `f(x, y)`. Thresholds and an interval. `Plot.density` is the same idea aimed at a point cloud. | [Contour mark](https://observablehq.github.io/plot/marks/contour) |

ECharts, Vega-Lite, Chart.js, Recharts, Nivo, and amCharts do not have the mark (matrix `none`).

## Encoding

Flat rows, one per grid cell. The grid is complete: every x appears with every y.

| Channel | Role |
| --- | --- |
| `encoding.x` | Column position, quantitative or a regular category the renderer sorts numerically when it can. |
| `encoding.y` | Row position. |
| `encoding.color` | The field value. This channel is already the heatmap value. The name is `color` because that is the ChartKit channel for "the number that paints." |

`a11y.alt` stays required. There is no series.

A 2D array inside `data` is rejected. ChartKit data is rows. The hint shows one row `{ x, y, z }`.

## Mark options

A spec with `version`, `type`, `data`, `encoding.x`, `encoding.y`, `encoding.color`, and `a11y.alt` fills the bands between isolines and draws the lines. The level step is a nice number on the value extent, aiming for 8 bands.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.interval` | `"auto"` \| number `> 0` | `"auto"` | Gap between levels, in data units. |
| `mark.lines` | boolean | `true` | The isolines. `false` leaves the filled bands. |
| `mark.fill` | boolean | `true` | The bands. `false` leaves the lines, which is the textbook contour. |
| `mark.smooth` | boolean | `false` | `false` draws the marching-squares segments. `true` is later. v1 ignores `true` and warns, so the schema can grow without a spline pass now. |
| `mark.thresholds` | number array | omitted | Explicit levels. Overrides `mark.interval`. |

Scattered points (`mark.from: "points"`) are not in the schema diff. They wait on the density grid.

## Catalog groups

| Group | On a contour |
| --- | --- |
| Data / Encoding | `encoding.x`, `encoding.y`, `encoding.color` as the value, `encoding.color.scale`, `encoding.color.range`, `encoding.color.format`, `encoding.color.title`. |
| Marks & style | `mark.interval`, `mark.lines`, `mark.fill`, `mark.thresholds`. |
| Axes | `axes.x` and `axes.y`, numeric, through `readAxis`. Grid off by default so it does not fight the isolines. |
| Labels | Level labels on the topmost line of each level, in `text`, hidden when the segment is shorter than the label. |
| Legend | The sequential ramp from `readColorScale`, not a series legend. `encoding.color.title` titles it. |
| Tooltip & interaction | Hover reports x, y, and the cell value, plus the band's level. No drag. |
| Colors & theme | The sequential scheme, default `blue`. See the Soft note. Lines use `text`. |
| Layout & size | `size`, `size.padding`. The ramp reserves `colorLegendHeight` (46) under the plot. |
| Annotations | A `rule` on x or y. A `text` note at a data coordinate. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. Heatmap may use canvas. Contour does not, in v1. The paths are the chart. |

## Data shape and transforms

Rows are cells. The renderer collects the distinct x values and y values, sorts them, and requires a rectangle. A missing cell is an error listing the x and y. Repair does not interpolate the hole. Interpolation is the scattered-point feature, and doing it quietly for one hole would hide a bad join.

The value field is `encoding.color`. Non-numeric values are errors. The grid is built in data order after the sort, so two renders match.

Marching squares on that grid produces one polyline per level per blob. Holes are a second path with the opposite winding. v1 can draw filled bands as stacked even-odd paths between neighboring levels. Lines are the upper boundary of each band.

## Interactions

Hover uses the cell under the pointer, not the nearest line. The cell is a rectangle of the grid and the hit test is a search on the sorted axes. The tooltip shows x, y, the value, and the level below it. Keyboard, when enabled, moves cell by cell, row-major. That is a lot of stops on a 40 by 40 grid. Cap the keyboard stops at the level labels plus the four corners, and say so. A cell-by-cell tour is the data table.

## Accessibility

`a11y.alt` states where the high and the low are, in data coordinates ("the high is at the top right"). Do not list levels.

Isolines are `aria-hidden`. The SVG `aria-label` is the alt sentence. The ramp has a title. `a11y.dataTable` is the rows, and it is the way to read the grid. A contour the reader cannot see as a surface has to survive as that sentence plus the table.

Color carries the value. The line labels repeat the level, so a grayscale print still has the numbers. That is the non-color cue. Patterns are the wrong tool on a continuous field.

## Soft theme

`readColorScale` picks night stops when the preset background is midnight's hex or the text is `#ffffff`. Soft's background is `transparent` and its text is a `light-dark()` string, so the function takes the day stops on a dark page. Contour and 2D density cannot ship on top of that. The ramp has to resolve `theme.mode` (`light`, `dark`, or the page `color-scheme` for `auto`) and emit stops that follow it. Prefer `light-dark()` inside the gradient stops so one SVG works on both pages, which is how the rest of Soft works. No new tokens. The scheme names (`blue`, `teal`, `orange`, `violet`) stay. Lines and level labels use `text`. The plot fill behind the bands stays transparent. Grid stays off.

## Layout, dependency, bundle

Marching squares, one cell at a time, lookup table of 16 cases, saddle disambiguation by the average of the four corners (a fixed rule, not a random one). Then a join of segment pieces into polylines. Deterministic.

`d3-contour` 4.0.3 min is 2,252 bytes gzip and depends on `d3-array`, whose min build is 5,963 bytes gzip. Do not take either. The 16-case table is the part to write. It is the reason this is L: the cases and the holes, not the idea.

Estimate: 6–9 KB gzip on `extra`, standalone entry 12–16 KB, including the ramp. Not in line or `all`. The scattered-point grid, later, adds the 4–6 KB noted on the density spec and should live in one module both charts import inside `extra`, not in `all`.

## Shared code

`openChart`, `readAxis`, `ticks`, `linear`, `readColorScale` once it follows the mode, `colorLegendHeight`, `readFrame`, `readTable`. Heatmap's grid is the cousin and the wrong painter (rects, not isolines). Do not draw a contour by coloring heatmap cells. That chart already exists.

## Risks

- Agents will send a heatmap spec (`x` category, `y` category, `color` value) and set `type: "contour"`. If x and y are categories with a complete grid, the chart can still draw, treating categories as equally spaced. That is useful and dangerous. v1 allows it when every pair exists, and warns that the spacing is even, not numeric. A time axis that is actually a string of dates should parse the way line parses dates. If the parse fails, the categories path stands.
- Nice intervals can skip the maximum. The top band has to include the max. Tests should lock a grid whose max is just above a nice step.
- Highcharts' series needs WebGPU. ChartKit's version is SVG paths. Do not document a GPU requirement, and do not refuse old browsers.
- A grid of 200 by 200 is 40,000 cells and a lot of path data. Warn above 10,000 cells. Still draw, up to 50,000, then error. The server render has to stay bounded.

## Error situations

Numbers are not assigned.

| Situation | Severity | Repair |
| --- | --- | --- |
| A cell is missing from the rectangle of x and y. | error | None. The message names one missing pair and the count. |
| The value is not numeric. | error | None. |
| `mark.interval` is `0` or negative. | error | None. |
| `mark.fill` and `mark.lines` are both false. | error | None. There is nothing to draw. |
| `mark.smooth` is true. | warning | Ignore it. |
| x and y are categories, not numbers. | warning | Draw equal spacing. |
| More than 10,000 cells. | warning | None. |
| More than 50,000 cells. | error | None. |
| `mark.interval` or `mark.thresholds` on another type. | warning | Remove them. |

## Schema diff

Add `"contour"` to the `type` enum, the `data` branch, and a branch that requires `encoding.x`, `encoding.y`, and `encoding.color`. One sentence: isolines of `encoding.color` on a grid of x and y.

`mark` gains `interval` (`"auto"` or a positive number), `lines` (boolean), `fill` (boolean), and `thresholds` (an array of numbers). `encoding.color` description already covers heatmap. Add contour to that sentence.

`mark.smooth` waits until it does something. Leaving it out of the schema is the way to avoid a warning for an option that does not exist. The table above mentions it so a later pass does not add a silent spline. It is not in the schema diff.

## Examples

### 1. A 2 by 2 grid

The smallest complete grid. One band step from the extent.

```json
{
  "version": "1",
  "type": "contour",
  "data": [
    { "x": 0, "y": 0, "z": 1 },
    { "x": 1, "y": 0, "z": 2 },
    { "x": 0, "y": 1, "z": 3 },
    { "x": 1, "y": 1, "z": 4 }
  ],
  "encoding": { "x": "x", "y": "y", "color": "z" },
  "a11y": { "alt": "The low is at the bottom left. The high, 4, is at the top right." }
}
```

Compact JSON is 244 characters and **102 tokens**. Pretty-printed it is 160 tokens.

### 2. Lines only, fixed interval

```json
{
  "version": "1",
  "type": "contour",
  "data": [
    { "x": 0, "y": 0, "z": 0 },
    { "x": 1, "y": 0, "z": 1 },
    { "x": 2, "y": 0, "z": 0 },
    { "x": 0, "y": 1, "z": 1 },
    { "x": 1, "y": 1, "z": 2 },
    { "x": 2, "y": 1, "z": 1 },
    { "x": 0, "y": 2, "z": 0 },
    { "x": 1, "y": 2, "z": 1 },
    { "x": 2, "y": 2, "z": 0 }
  ],
  "encoding": { "x": "x", "y": "y", "color": "z" },
  "mark": { "fill": false, "interval": 0.5 },
  "a11y": { "alt": "A peak of 2 at the center. Lines every 0.5." }
}
```

Compact JSON is 360 characters and **170 tokens**. Pretty-printed it is 274 tokens.

## Where it ships

- `@chartkitdev/core/charts/contour`, extra only, when it is built.
- Docs `/docs/charts/contour`. The page says the grid has to be complete.
- `llms.txt` gets example 1 after a trim, and only once the ramp follows Soft's mode.
- Gallery tile is example 2, which has a visible peak.
- Eval task `peak-contour` for a later round. The checker wants `type: "contour"`, a `color` field, and more than one path. It rejects a heatmap of rects. Not a paid run. The scoreboard stays 42.

## Left for later

Scattered points, smoothing, labeled major levels versus unlabeled minor levels, and a WebGPU painter. The GPU path is how Highcharts does it and is the wrong dependency for an SVG library.

## Size

**L.** The marching-squares cases are the project. The spec is the small part.
