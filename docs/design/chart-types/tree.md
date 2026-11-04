# Tree / dendrogram spec proposal

Status: design only. Rank 3 in [README.md](./README.md). Recommendation: build the tidy tree and the dendrogram. An org chart (boxes, photos, wrapped text) is later. Effort M. Coverage 5 of 9. Matrix id `type.tree`, `agentRelevance` 2. Recharts is `unknown` and is not in the 5.

A tree draws nodes and parent links. A tidy tree gives each leaf a slot and lets branches share the gaps (Reingold–Tilford). A dendrogram (`mark.tree: "cluster"`) puts every leaf at the same depth, which is the chart for a clustering. Use a tree when the question is who connects to whom and the data has one parent per node. Do not use it for a weighted flow. That is sankey. Do not use it for a partition of a quantity. That is treemap, sunburst, or [icicle](./icicle.md). Do not use it when a node has two parents. That is [network](./network.md), and v1 of tree rejects it.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `treegraph` (links by `id` and parent) and `organization` (boxes, hanging layouts). Both need the treemap module plus their own module. | [Treegraph](https://www.highcharts.com/docs/chart-and-series-types/treegraph-chart), [Organization](https://www.highcharts.com/docs/chart-and-series-types/organization-chart) |
| ECharts | `series.type: "tree"`. `layout` is `"orthogonal"` or `"radial"`. `orient` is `LR`, `RL`, `TB`, or `BT`. `edgeShape` is `curve` or `polyline`. Data is nested, or id and parent. | [series-tree](https://echarts.apache.org/en/option.html#series-tree) |
| Observable Plot | `Plot.tree` is the tidy layout. `Plot.cluster` is the dendrogram: leaves aligned. Both are a link, a dot, and a text label. | [Tree mark](https://observablehq.github.io/plot/marks/tree) |
| Nivo | `Tree` / `ResponsiveTree`. `layout` and `mode` pick the algorithm. Labels and a mesh for hover. | [Tree](https://nivo.rocks/tree/) |
| amCharts 5 | A hierarchy tree series. Node links, not a partition. | [Tree](https://www.amcharts.com/docs/v5/charts/hierarchy/tree/) |

Vega-Lite and Plotly have no tree mark (matrix `none`). Chart.js is a plugin.

## Encoding

The hierarchy encodings treemap already has. A tree does not need `encoding.y`. Node size is not the layout. If `encoding.y` is present it is the label's number, not a length.

| Shape | Fields |
| --- | --- |
| Id and parent | `encoding.id`, `encoding.parent`. An empty parent is a root. |
| Nested | `children` on the row. |
| Flat path | `encoding.path`. Legal, because `readHierarchy` already accepts it. Unusual for a tree, and fine. |

`encoding.color` colors the node by the top-level branch, or by a field when the tree is flat. `a11y.alt` stays required.

## Mark options

A spec with `version`, `type`, `data`, a hierarchy, and `a11y.alt` draws a tidy tree, left to right, curve links, dots, labels at the leaves and at internal nodes when they fit.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.tree` | `"tidy"` \| `"cluster"` | `"tidy"` | Tidy is Reingold–Tilford. Cluster lines the leaves up. That is the dendrogram. |
| `mark.orient` | `"LR"` \| `"RL"` \| `"TB"` \| `"BT"` | `"LR"` | Root on the left, right, top, or bottom. The same four ECharts uses. |
| `mark.link` | `"curve"` \| `"step"` | `"curve"` | A smooth link, or a right-angle step. `"step"` is the org-chart hint and does not draw a box. |
| `mark.radial` | boolean | `false` | Root at the center, depth as radius. Off in the default because labels collide. |
| `mark.depth` | integer ≥ 1 | all levels | Same cap as sunburst and icicle. |

`mark.orient` is not `mark.orientation`. Bar's orientation is horizontal or vertical and means a different thing. A tree spec that sets `mark.orientation` warns and `repair()` maps `"horizontal"` to `LR` and `"vertical"` to `TB`, then removes `orientation`.

## Catalog groups

| Group | On a tree |
| --- | --- |
| Data / Encoding | `encoding.id`, `encoding.parent`, `encoding.path`, optional `encoding.y` as a label number, optional `encoding.color`. |
| Marks & style | `mark.tree`, `mark.orient`, `mark.link`, `mark.radial`, `mark.depth`. |
| Axes | None. |
| Labels | Node name, at the node, in `text`. Truncate to the gap. The full name is in the tooltip. |
| Legend | Only when `encoding.color` is a field other than the branch. A plain tree has no legend. |
| Tooltip & interaction | Hover: name, parent, and the value when `encoding.y` is set. No collapse in v1. |
| Colors & theme | Dots use the branch series color. Links use `muted`. Labels use `text`. |
| Layout & size | `size`, `size.padding`. The tidy pass reads the inner plot after padding. |
| Annotations | None in v1. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. |

## Data shape and transforms

`readHierarchy` parses the rows. Tree joins `APPLIES`. A forest (two roots) is an error in v1. ECharts documents the same limit and tells you to use two series. ChartKit has one chart, so the hint says to add a synthetic root. `repair()` does not invent that root. Inventing a node is inventing data, which the strip numeric-group decision already refuses.

A cycle, a missing parent, and a negative `encoding.y` stay `CK3027`–`CK3029`. `CK3030` (parent value must equal the children) applies only when `encoding.y` is set. A tree with no sizes skips it.

## Interactions

Hover highlights the node, its ancestors, and its links. Everything else uses `muted`. Click-to-collapse is later. It changes the layout and the alt text. `a11y.keyboard: true` walks pre-order: parent, then each child. Arrow keys follow the link, not the x coordinate. Enter announces the name and the parent.

## Accessibility

`a11y.alt` states the root and how many children it has, plus the deepest fact that matters. Do not try to read the whole tree into one sentence.

Each dot's `aria-label` is the name, the parent, and the depth. Links are `aria-hidden` because the dots already state the parent. `a11y.dataTable` is id, parent, and the optional value. Color is the branch. The label repeats the name, so the branch color is not the only cue.

## Soft theme

Dots are series fills with a 1 px `surface` stroke so a dot on a similar series color still has an edge. `surface` is `light-dark(#ffffff, #2c2c2e)`. Links are `muted` at opacity 0.7. Labels are `text`. The plot background stays transparent. Radial mode uses the same tokens. No new token. Dark mode does not flip the layout.

## Layout, dependency, bundle

Reingold–Tilford, second walk for the tidy shift, then a coordinate pass for `LR` / `RL` / `TB` / `BT`. Cluster is the same walk with leaves pushed to the maximum depth. Radial maps depth to radius and the leaf index to angle. All deterministic. No iteration budget, no timer.

Zero dependencies. `d3-hierarchy` 3.1.3 min is 5,702 bytes gzip and also contains treemap, partition, and pack. ChartKit would pay for code it already wrote. The tidy function for one tree is the piece to write.

Estimate: 4–6 KB gzip on `extra`, standalone entry 11–14 KB. Not in line or `all`. Org-chart boxes would add another chunk and are not in this estimate.

## Shared code

`readHierarchy`, `openChart`, `readFrame`, `labelInk` if a node ever draws a filled box (not in v1). `paintLegend` only with a color field. Not the sankey layer assigner. Not squarify.

## Risks

- Org-chart prompts ("CEO at the top, reports as boxes") will hit this type and get dots. The docs and the `llms.txt` line say boxes are not this chart. A warning when node labels average more than 24 characters points at that limit without refusing the draw.
- Radial labels collide past about 30 leaves. `mark.radial: true` with more than 30 leaves warns. The chart still draws.
- Two roots are the data agents will send for a forest. The error has to name the fix (add a root row). Repair must not insert one.
- `mark.orient: "TB"` with long labels under the nodes needs more than the default height. v1 does not auto-grow the SVG. `size.height` is the agent's job. The warning for average label length mentions height.

## Error situations

Hierarchy codes stay. New situations, numbers not assigned:

| Situation | Severity | Repair |
| --- | --- | --- |
| More than one root. | error | None. Hint: add a parent row that the roots point at. |
| `mark.orientation` is set. | warning | Map `horizontal` to `mark.orient: "LR"`, `vertical` to `"TB"`, and remove `mark.orientation`. |
| `mark.radial` is true and the tree has more than 30 leaves. | warning | None. |
| Mean node-name length over 24. | warning | None. Hint: this chart draws dots and short labels, not boxes. |
| `encoding.y` is set and a parent does not match its children. | error | `CK3030`, unchanged. |
| `mark.tree` or `mark.orient` on another type. | warning | Remove them. |

## Schema diff

Add `"tree"` to the `type` enum and to the hierarchy branch. It does not require `encoding.y`. One sentence: a tree is a tidy node-link layout of the treemap hierarchy. `mark.tree: "cluster"` lines the leaves up (a dendrogram).

`mark` gains `tree` (`"tidy"` \| `"cluster"`, default `"tidy"`), `orient` (`"LR"` \| `"RL"` \| `"TB"` \| `"BT"`), `link` (`"curve"` \| `"step"`), and `radial` (boolean). `mark.depth` gains tree. The key is `mark.tree`, not `mark.layout`. Heatmap already uses `mark.layout` for `"calendar"` and `"grid"`. Plot and Nivo call this a layout. The schema cannot put a second enum on that key.

## Examples

### 1. Minimal tidy tree

```json
{
  "version": "1",
  "type": "tree",
  "data": [
    { "id": "Root", "parent": "" },
    { "id": "A", "parent": "Root" },
    { "id": "B", "parent": "Root" },
    { "id": "A1", "parent": "A" }
  ],
  "encoding": { "id": "id", "parent": "parent" },
  "a11y": { "alt": "Root has two children. A has one child." }
}
```

Compact JSON is 241 characters and **71 tokens**. Pretty-printed it is 122 tokens.

### 2. Dendrogram, top to bottom

```json
{
  "version": "1",
  "type": "tree",
  "data": [
    { "id": "All", "parent": "" },
    { "id": "Fruit", "parent": "All" },
    { "id": "Veg", "parent": "All" },
    { "id": "Apple", "parent": "Fruit" },
    { "id": "Pear", "parent": "Fruit" },
    { "id": "Kale", "parent": "Veg" }
  ],
  "encoding": { "id": "id", "parent": "parent" },
  "mark": { "tree": "cluster", "orient": "TB" },
  "a11y": { "alt": "Leaves line up. Fruit has two. Veg has one." }
}
```

Compact JSON is 355 characters and **105 tokens**. Pretty-printed it is 178 tokens.

## Where it ships

- `@chartkitdev/core/charts/tree`, extra only.
- Docs `/docs/charts/tree`. The page says dendrogram is `mark.tree: "cluster"`.
- `llms.txt` gets example 1 after a trim, plus the line that boxes are not drawn.
- Gallery tile is example 1.
- Eval task `org-dot-tree` for a later round. The checker wants `type: "tree"`, id and parent, and link geometry. It does not require boxes. Not a paid run. The scoreboard stays 42.

## Left for later

Org-chart boxes, node images, collapse, a radial default, and edge labels. Images are a Cloud problem (the renderer would fetch a URL) and stay out. See the security note on [custom marks](../big-features-pros-cons.md).

## Size

**M.** The layout is a real algorithm. The paint is dots and paths.
