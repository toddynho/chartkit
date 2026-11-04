# Big features: pros, cons, and a recommendation

Status: design only. Nothing here is scheduled. The four features are the top of the "no option for this" list in [option-parity.md](./option-parity.md), skipping raw drawing, an imperative API, and technical indicators, which are the same decision as custom marks or a refusal of the JSON spec. Chart types from that list have their own specs in [chart-types/README.md](./chart-types/README.md).

ChartKit's pitch is a small JSON spec that an agent gets right on the first try, then `validate()` and `repair()`. A feature that adds a function, a second layout engine, or a free-form path fights that pitch even when the picture would be better. Bundle sizes below are the budgets in `scripts/size-budget.json`. The line entry is 41,006 bytes gzip. `all` is 85,672. `extra` is 118,094. `validate` is 45,215. Those are the ceilings a feature has to argue with.

Coverage counts are native or partial among Highcharts, ECharts, Vega-Lite, Plotly, Chart.js, Observable Plot, Recharts, Nivo, and amCharts, from `catalog/public/features.json`.

## Plugin system

**Recommendation: don't.**

A plugin system means third-party code runs inside the render. In ChartKit that would be a registry on the spec or on the module: a name, a hook (`beforeLayout`, `afterMark`, `tooltip`), and a function. The JSON spec cannot carry the function. The module API would.

```ts
import { register } from "@chartkitdev/core";

register({
  name: "bands",
  types: ["line"],
  afterMark(scene, spec) {
    // draws into the SVG the core just built
  },
});
```

The spec would grow an allow-list, `plugins: ["bands"]`, and the renderer would refuse a name that was not registered. Cloud renders a spec someone posted. It will not load a package that spec names.

### How others do it

| Library | What you write | Docs |
| --- | --- | --- |
| Chart.js | `Chart.register(plugin)` or a `plugins` array on the chart. Hooks are `beforeDraw`, `afterDraw`, and the rest of the lifecycle. | [Plugins](https://www.chartjs.org/docs/latest/developers/plugins.html) |
| Highcharts | `Highcharts.chart` plus modules, `Highcharts.wrap`, `addEvent`, and `seriesType` for a new series. | [Extending Highcharts](https://www.highcharts.com/docs/extending-highcharts/extending-highcharts) |
| ECharts | `echarts.use(...)` to load a component, and a custom series for drawing. | [series-custom](https://echarts.apache.org/en/option.html#series-custom.renderItem) |
| Plotly | `Plotly.register` for a trace or a transform. | The matrix records `Plotly.register` on the Plotly types. The public surface is a trace module, not a spec key. |
| Observable Plot | A custom mark implements `render`. Initializers and transforms are the other extension points. | [Marks](https://observablehq.github.io/plot/features/marks) |
| amCharts 5 | Plugins are classes registered beside the chart. | The matrix records the plugin types. Slice grouper is one of them. |

Recharts is partial (`Customized`, and since v3 a child component). Nivo is partial (a `layers` array). Vega-Lite is `none`. Matrix id `extend.plugins`. Coverage 8 of 9. ChartKit's cell is `none`. `extend.hooks` is a different row: ChartKit already records legend toggle and range change, so that cell is `native`. This feature is new code in the render, not those events.

### Pros

The top pro: a chart type or a decoration can ship without a core release, which is how Chart.js and Highcharts grew a long tail (box plots, annotations, pattern fills) without putting all of it in the first file.

Agents that already know those libraries will ask for a plugin name. A registry would let a first-party extra chart register the way `adopt()` already does.

### Cons

The top con: Cloud renders JSON. A plugin is code. Accepting code from a spec is remote code execution on the render service. Accepting it only from the embedding page splits the product in two: the embedder can extend, the agent and the Cloud cannot. The agent then emits `plugins: ["chartjs-plugin-zoom"]` and repair has nothing honest to do with it.

The rest:

- **Bundle.** A hook bus in `all` is paid by every chart, including the line entry if the bus lives next to `createRenderer`. Chart.js pays this cost because every chart is the same object. ChartKit's line budget exists so a line chart does not carry funnel and sankey. A bus that might call unknown code cannot be tree-shaken.
- **API surface.** Hook order, mutation of the spec, mutation of the SVG, and a plugin that throws on bad data become support. `validate()` cannot see inside the function.
- **Agent tokens.** The spec either names a plugin the model must spell correctly, or it inlines a program. Both raise first-try failure. The repair pass cannot patch a function. The published repair story stops at that chart.
- **Security.** A server-side render of user JSON must not `import()` a string, `eval` a string, or fetch a plugin URL. A page-level `register()` is safe only when the page author is the one who wrote the function. That is an application API, not a spec feature, and ChartKit's adapters do not need it to ship the extra charts. `adopt()` is already that API for first-party types.
- **Maintenance.** Every hook is a compatibility promise. Highcharts' wrap and Chart.js's plugin lifecycle are forever. ChartKit's version is still `0.5.0` and the spec major is `"1"`.
- **Accessibility.** A plugin that draws marks does not go through `aria-label`, the data table, or `a11y.alt`. The core cannot promise the chart is readable.

### Smaller version

Keep `adopt()` and `@chartkitdev/core/charts/<type>` as the only extension. New charts are first-party extra entries, reviewed like strip. Do not add `plugins` to the schema. Do not add a hook bus to the line bundle.

A documented `registerMark` that receives the spec and returns SVG, for the embedding page only, is the smaller version people will ask for next. It has the same accessibility hole and it will be copied into Cloud by someone who treats the docs as permission. Don't add it.

### Effort

**L** to do a real lifecycle. **S** to write the docs that say `adopt()` is the extension point, which is this section.

## Auto layout around the legend

**Recommendation: do the smaller version.**

Auto layout means the plot rectangle shrinks so axes, tick labels, and the legend do not cover the marks and do not fall off the SVG. In ChartKit the concrete gap is smaller than the phrase.

Cartesian already does this. `packages/core/src/renderers/cartesian.ts` measures tick text, axis titles, rotated labels, and `legendSpace()` for `top`, `bottom`, `left`, and `right`, and it grows the padding. Donut and scatter call `legendSpace` too. The matrix cell `layout.legend.space` is `unknown` for ChartKit because the audit did not score that path. The parity doc says legend offset is only partly covered by `legend.*`.

The work that is actually open is the parity doc's batch 3, item 1: legend position, anchor, align, and symbol on the charts that already draw a legend and do not yet call `legendSpace` (the extra charts, and any core chart whose legend is still a fixed band). It is not a constraint solver.

A full version would be Vega's autosize or ECharts' `grid.containLabel`: the layout runs, measures every label, and repeats until the margins fit, including labels the scale produces only after the margin is known.

```json
{
  "legend": { "position": "right" },
  "layout": { "fit": "legend" }
}
```

`layout.fit` would be the new key. The recommendation is not to add it. Call the function that already exists.

### How others do it

| Library | What you write | Docs |
| --- | --- | --- |
| ECharts | `grid.containLabel: true` so the grid holds the axis labels. The legend has its own `left`, `top`, `right`, `bottom`. | [grid.containLabel](https://echarts.apache.org/en/option.html#grid.containLabel) |
| Plotly | `layout.xaxis.automargin` and the same on y. The margin grows to fit the tick labels. | [automargin](https://plotly.com/javascript/reference/#layout-xaxis-automargin) |
| Vega-Lite | `autosize` with `resize` and the padding. The view fits the container. | [Size](https://vega.github.io/vega-lite/docs/size.html) |
| Chart.js | `options.layout.padding`, and the legend is a layout box the chart measures. | [Layout](https://www.chartjs.org/docs/latest/configuration/layout.html) |
| Highcharts | `chart.margin` and `chart.spacing`, plus a legend that takes space unless `floating` is set. | [Legend](https://www.highcharts.com/docs/chart-concepts/legend), [legend API](https://api.highcharts.com/highcharts/legend) |
| Observable Plot | `marginLeft` and the other margins. Plot also infers a margin from the axis labels when you leave it automatic. | The matrix records `marginLeft` on the Plot options. |

Recharts is partial (`YAxis.width`, often `"auto"` in current docs). Nivo is `none`. Coverage 8 of 9.

### Pros

The top pro: a legend the agent places on the right stops covering the marks, on every chart, from one helper. Agents already emit `legend.position`. The failure is the chart ignoring it, not the agent inventing a new key.

### Cons

The top con: a second layout pass that remeasures until it converges will move padding on charts that are already correct, and it will move the pixel fixtures with them. Cartesian's one-pass measurement is the behavior tests lock. A solver is a new source of "the chart moved" bugs.

The rest:

- **Bundle.** `legend.ts` is already in the charts that import it. Wiring `legendSpace` into an extra chart adds a few hundred bytes to that chart's entry, not a new subsystem. A solver in `all` would be paid by the line chart too, which already has the one-pass version.
- **API surface.** `layout.fit` is a key agents will set on a pie, where it does nothing. Every no-op key is a warning and a repair.
- **Agent tokens.** Zero, if the work is "call `legendSpace`." A new key is a line in every spec the model copies from a Highcharts habit (`margin`, `containLabel`, `automargin`).
- **Security.** None. This is geometry.
- **Maintenance.** One function, already written. The cost is calling it from each extra renderer and checking the fixtures.
- **Accessibility.** A legend that overlaps marks is an access bug as well as a visual one. Screen-reader users get the table and the alt sentence either way. Sighted keyboard users get a focus ring on a mark they cannot see. Fixing the overlap helps them.

### Smaller version

Do this, and do not add `layout.fit`.

1. Every extra chart that draws more than one series calls `readLegend`, `legendSpace`, and `paintLegend`, and shrinks its plot the way cartesian does.
2. Scatter's side legends use `legendSpace().side`, not only the band. The current scatter path asks `legendSpace` for the band.
3. Batch 3's legend position work stays the owner. This document does not start it.

A contain-label loop that re-ticks after the margin changes is the later version. It is worth doing when a rotated category label is clipped, and it belongs in the shared axis path, not in a new layout product.

### Effort

**S** for the smaller version. **L** for a real autosize solver. The recommendation is the S.

## Custom marks

**Recommendation: don't.**

A custom mark is a way to draw geometry the chart types do not have. In other libraries it is a function from data to pixels. In ChartKit the matching feature would be a spec object the renderer does not understand:

```json
{
  "type": "line",
  "marks": [
    { "type": "arrow", "from": [0, 0], "to": [1, 1] }
  ]
}
```

or a function registered like a plugin. The JSON form only works for marks the schema lists. That is a new chart type, or a new annotation, which is how ChartKit already added `compare` on strip. The function form is the plugin decision again.

### How others do it

| Library | What you write | Docs |
| --- | --- | --- |
| ECharts | `series.type: "custom"` and `renderItem(params, api)`. `api.value` and `api.coord` turn data into pixels. The function returns graphic elements. | [renderItem](https://echarts.apache.org/en/option.html#series-custom.renderItem) |
| Highcharts | `Highcharts.seriesType(name, parent, options, prototype)`. | [Extending Highcharts](https://www.highcharts.com/docs/extending-highcharts/extending-highcharts) |
| Chart.js | A controller extending `DatasetController`, registered as a chart type. | [New charts](https://www.chartjs.org/docs/latest/developers/charts.html) |
| Observable Plot | A mark object with a `render` function that receives the scales and returns SVG. | [Marks](https://observablehq.github.io/plot/features/marks) |
| Recharts | `shape` on Bar, Area, and the others, or any child inside the chart since v3. The old `Customized` wrapper is deprecated. | [Customize](https://recharts.github.io/en-US/guide/customize/) |
| Nivo | `layers` as functions mixed with the built-in layer names. | The matrix records `Line.layers`. |
| amCharts 5 | `Graphics` and the rest of the sprite tree. | The matrix records `Graphics`. |

Vega-Lite is `none` at this row (`extend.custom.mark`). Plotly is `unknown`. Coverage 7 of 9. ChartKit is `none`. The sibling row `extend.escape` (raw drawing: `toPixels`, `convertToPixel`, `getPixelForValue`) is also 7 and is the same door. One decision covers both.

### Pros

The top pro: the long tail (vector, arc diagram, waffle, a one-off client mark) would not each need a core type. One escape hatch, and the nine-library list stops growing.

### Cons

The top con: `renderItem` is a program. An agent cannot emit it reliably, `repair()` cannot patch it, and Cloud cannot run it. The first-try pitch is the product. A custom mark is the feature that gives the product away.

The rest:

- **Bundle.** A safe subset (a declarative `arrow` annotation) is small and belongs in annotations, which already exist (`rule`, `band`, `text`, `marker`, `compare`). A general graphic tree is a second renderer inside `all`.
- **API surface.** ECharts' `renderItem` API is larger than ChartKit's chart schema. Teaching it to an agent costs more tokens than teaching one new type, and the type is then validated.
- **Agent tokens.** A function body is hundreds of tokens and does not round-trip through JSON schema. A declarative graphic tree (`{ type, x, y, shape, children }`) is a second language. Models will mix it with the encoding. The repair rules for that mix are a project.
- **Security.** The Recharts and ECharts versions run in the page, where the developer already has script. Cloud runs the spec. A `render` string is `eval`. An SVG fragment in the spec is the pictorial-bar problem: `foreignObject`, event handlers, and a path large enough to hurt the server. `additionalProperties: false` is what prevents that today.
- **Maintenance.** Every graphic primitive becomes a promise (arrow heads, text anchors, hit testing, dark mode). Annotations already show how fast that list grows.
- **Accessibility.** A custom shape has no default `aria-label`. The core would have to require a label on every custom mark and still could not describe the picture. The alt sentence would be the only access, with no data table row that matches the shape.

### Smaller version

Add a mark by adding a type or an annotation, with a schema, a repair rule, and an alt pattern. That is the strip `compare` annotation. It is slower than `renderItem` and it is the product.

Do not add `marks[]`, `renderItem`, `shape`, or an SVG slot. The chart-type specs in this set are the long tail for now. Vector, waffle, and arc diagram stay on the parity list until one of them outranks the types already specified.

### Effort

**L** for a real custom series. **S** for one declarative annotation when a real chart needs it. The recommendation is don't, until a named annotation has a spec of its own.

## Pattern fills

**Recommendation: do the smaller version, later.** Not in the chart-type build order. After the legend and the sequential color work the parity doc already ranks higher.

Pattern fills mean a series can be told apart without color: hatches, dots, stripes. ChartKit's `a11y.patterns` cell is `partial` because `encoding.y.dash` exists on lines. The `mark.pattern` cell is `none`. Areas, bars, and slices have no second cue.

The concrete API:

```json
{
  "type": "bar",
  "mark": { "pattern": "auto" },
  "encoding": { "x": "quarter", "y": "units", "color": "region" }
}
```

`"auto"` assigns a built-in pattern per series, in legend order, and the legend swatch uses the same pattern. `"none"` is the default and today's charts do not change. A series override is `legend.symbols`'s cousin, not a URL:

```json
{ "mark": { "pattern": "stripe" } }
```

or, if patterns should follow the series rather than the whole chart, a list `mark.patterns: ["solid", "stripe", "dot"]` indexed like the palette. One chart-level default is the smaller key. Per-series can wait.

### How others do it

| Library | What you write | Docs |
| --- | --- | --- |
| ECharts | `aria.decal.show`. Decals are a palette of patterns applied so a chart still works without color. `aria.decal.decals` replaces the set. | [aria.decal](https://echarts.apache.org/en/option.html#aria.decal) |
| Plotly | `marker.pattern` on bar, pie, histogram, and others. `shape` is one of a fixed list (`/`, `x`, `+`, `.`, `|`, `-`). `fillmode` is `replace` or `overlay`. | [bar marker pattern](https://plotly.com/javascript/reference/bar/#bar-marker-pattern) |
| Nivo | `defs` and `fill` on the bar, with SVG pattern ids. The guide shows dots, lines, and squares. | [Patterns](https://nivo.rocks/guides/patterns/) |
| amCharts 5 | `LinePattern` and the other pattern classes, assigned to `fillPattern` or `strokePattern`. | [Patterns](https://www.amcharts.com/docs/v5/concepts/colors-gradients-and-patterns/patterns/) |
| Highcharts | A module, `pattern-fill.js`. A color is `{ pattern: { path, width, height } }` or a `patternIndex` into ten built-in patterns. Image URLs are supported. The matrix marks this `plugin`, so it is not in the coverage count of 4. | [Pattern fills](https://www.highcharts.com/docs/chart-design-and-style/pattern-fills) |

The count of 4 is ECharts, Plotly, Nivo, and amCharts, all `native`. Chart.js is a plugin. Vega-Lite is `none` on `mark.pattern` and `native` on the sibling `a11y.patterns` row via `strokeDash` and `shape`. Plot is manual. Recharts is `unknown`.

### Pros

The top pro: a bar chart printed in grayscale, or read by someone who cannot separate the series colors, still has a per-series cue. ECharts puts this on the accessibility object for that reason. ChartKit's dash cue does not apply to a bar, a slice, or an area. Those are the charts where the gap is real.

### Cons

The top con: hatches are noisy, and an `"auto"` default would change every existing multi-series bar. The default has to stay `"none"` so current charts and their fixtures do not move. Agents that copy ECharts will set `pattern: "auto"` on a line that already has dash. Two cues on one series is worse than one. Repair should drop `mark.pattern` on a line unless the user set dash off.

The rest:

- **Bundle.** Four SVG `<pattern>` defs in the extra-or-core painter. A shared def block used by bar, pie, donut, and stacked area lands in `all`, because those charts are in `all`. Budget a few hundred bytes, not a module. A path parser or an image fill is the pictorial-bar problem and is out.
- **API surface.** `shape`, `size`, `color`, `patternIndex`, and per-point patterns are the Highcharts surface. ChartKit wants one enum.
- **Agent tokens.** One key, `"auto"` or a name. That is cheap. A custom path is expensive and unsafe, and it is not in the enum.
- **Security.** Pattern image URLs and raw SVG paths are user-controlled documents on the Cloud renderer. The enum has no URL. `additionalProperties: false` stays.
- **Maintenance.** Each pattern has to read in both Soft modes, at the sizes bars actually take, including a 4 px slice. A pattern that disappears on a thin bar is a bug the legend will not show, because the legend swatch is wider than the slice.
- **Accessibility.** Patterns can also hurt. Highcharts' own contrast article says hatches and dashes can make a chart harder, and that subtle patterns are the ones that work. `"auto"` on a chart with eight series will be a texture. The 8-series warning on marimekko belongs here too: over eight series, warn, and still draw. Do not refuse.

### Smaller version

This is the smaller version. Do not build the Highcharts module.

- `mark.pattern`: `"none"` (default) \| `"auto"` \| `"stripe"` \| `"dot"` \| `"cross"` \| `"horizontal"`.
- Applies to bar, stacked area, pie, and donut. Not to line (dash already exists). Not to scatter (shape already exists).
- `"auto"` walks the list in series order, skipping `"none"`.
- The legend swatch draws the pattern.
- No `pattern.path`, no `pattern.image`, no per-point pattern.
- Soft: the pattern stroke is `surface` or `text` at low opacity over the series fill, chosen so the day ramp and the night ramp both keep a 3:1 edge. The color-scale helper already uses a 3:1 floor. Reuse that test. No new token.

A later version can add per-series assignment. It is not required to close the `a11y.patterns` gap.

### Effort

**S** for the enum and four patterns on bar. **M** once pie, donut, stacked area, and the legend all agree. The recommendation is the M, later, not in front of streamgraph or the legend placement work.

## What not to start

| Feature | Recommendation | Top pro | Top con |
| --- | --- | --- | --- |
| Plugin system | Don't | A long tail can ship without a core release. | Cloud renders JSON, and a plugin is code. |
| Legend auto layout | Do the smaller version | A right-hand legend stops covering the marks. | A real autosize solver moves charts that are already correct. |
| Custom marks | Don't | One escape hatch would cover the long tail. | A render function is a program agents cannot repair and Cloud cannot run. |
| Pattern fills | Do the smaller version, later | Bars and slices gain a cue that is not color. | `"auto"` as a default would repaint every current multi-series bar, and hatches get noisy past a few series. |
