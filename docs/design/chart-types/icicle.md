# Icicle spec proposal

Status: design only. Rank 5 in [README.md](./README.md). Recommendation: build. Pulled forward of its score because `readHierarchy` and `CK3027`–`CK3030` already exist. Effort S. Coverage 3 of 9. Matrix id `type.icicle`, `agentRelevance` 1.

An icicle is a partition: each node is a rectangle, children sit side by side inside the parent's width, and depth runs down the height. Use it for the same hierarchy as a treemap or a sunburst when the reader should see levels as rows. Do not use it for a flow. That is sankey. Do not use it when the hierarchy is a link diagram. That is [tree](./tree.md). A one-level icicle is a stacked bar. Prefer `bar` with `mark.stack`.

Highcharts has no icicle series (matrix: manual, via the SVG renderer). ECharts, Vega-Lite, Chart.js, Plot, and Recharts do not have the mark. The three that do are Plotly, Nivo, and amCharts' partition.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Plotly | A trace `type: "icicle"` with `labels` or `ids`, `parents`, and `values`. An empty parent is the root. `branchvalues` says whether a parent value is the total or the remainder. | [icicle reference](https://plotly.com/javascript/reference/icicle/) |
| Nivo | `Icicle` / `ResponsiveIcicle`. Hierarchical `data` with `children`. Zoom by clicking a node. | [Icicle](https://nivo.rocks/icicle/) |
| amCharts 5 | A partition series under hierarchy charts. Rectangles, as opposed to the sunburst arcs. | [Partition](https://www.amcharts.com/docs/v5/charts/hierarchy/partition/) |

## Encoding

The treemap and sunburst encodings. No new channels.

| Shape | How the rows are written | Fields |
| --- | --- | --- |
| Flat path | One row per leaf | `encoding.path` (field names, root to leaf) and `encoding.y` (the size) |
| Id and parent | One row per node | `encoding.id`, `encoding.parent`, `encoding.y` |
| Nested | `children` on the row | `encoding.y` |

`encoding.color` is an optional group, used only when the hierarchy is one level deep. Deeper charts color by the top-level branch, which is what sunburst does. `a11y.alt` stays required.

## Mark options

A spec with `version`, `type`, `data`, a hierarchy, `encoding.y`, and `a11y.alt` draws a horizontal icicle: depth goes down, children share the parent's width, gaps of 1 px, labels when the cell is wide enough.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Horizontal: depth increases downward, width is the value. Vertical: depth increases to the right, height is the value. |
| `mark.depth` | integer ≥ 1 | all levels | Caps the levels drawn. Same option sunburst uses. |
| `mark.pad` | number 0–8, px | `1` | Gap between siblings. |

`mark.innerRadius` does not apply. Sunburst owns it. Setting it warns and `repair()` removes it.

## Catalog groups

| Group | On an icicle |
| --- | --- |
| Data / Encoding | `encoding.path` or `encoding.id` plus `encoding.parent`, `encoding.y`, `encoding.y.format`, `encoding.color` for a one-level group. |
| Marks & style | `mark.orientation`, `mark.depth`, `mark.pad`. |
| Axes | None. Level names are not an axis. |
| Labels | The node name, truncated to the cell, white or ink from `labelInk` the way treemap already chooses. |
| Legend | Only for a one-level color group. A deep tree does not get a legend of every leaf. |
| Tooltip & interaction | Hover names the path from the root and the value. Click to focus a node is later. v1 is static. |
| Colors & theme | Top-level branch takes the series palette. Children are tints, the treemap sibling treatment. |
| Layout & size | `size`, `size.padding`. |
| Annotations | None in v1. A `text` note has no position channel that means "this node." |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. |

## Data shape and transforms

`readHierarchy` already accepts the three shapes and already errors on a cycle (`CK3027`), a missing parent (`CK3028`), a negative size (`CK3029`), and a parent value that is not the sum of its children (`CK3030`). Icicle joins the `APPLIES` set. It does not grow a second parser.

A parent with no value is the sum of its leaves. That rule stays. The renderer does not invent a fourth shape.

## Interactions

Hover: the node path and the formatted value, in the existing tooltip. The hovered node keeps its fill. Siblings stay. Ancestors outside the path drop to `muted`. That is the one interaction, and it is local.

v1 does not zoom. Nivo and Plotly zoom by rewriting the root. That needs object constancy and a second spec state. It waits. `a11y.keyboard: true` moves among visible nodes in reading order (row by row, then left to right). Enter announces the path and the value.

## Accessibility

`a11y.alt` names the largest top-level branch and the largest leaf. Teach that, not a tour of every node.

Each rect's `aria-label` is the path joined with " / ", then the value and its share of the root. `a11y.dataTable` lists node, parent, and value. Color is the branch, and the label repeats the branch name, so color is not the only cue.

## Soft theme

Branch fills are the series ramp. Label ink uses the treemap helper, which flips to light text on a dark fill. Gaps show the page through the transparent background, so a dark page and a light page both read the gap as a gap. No new token. `theme.mode` does not change the layout. A one-level chart uses the same ramp as a stacked bar.

## Layout, dependency, bundle

Partition, not squarify. The root is the full plot width (or height, when vertical). Each level gets an equal band of the cross axis. A node's children split its main-axis span in proportion to their values. One pass, deterministic, no iteration.

Zero dependencies. Do not add `d3-hierarchy`. Its min build is 5,702 bytes gzip and includes a treemap ChartKit already has. The partition loop is small.

Estimate: 2–4 KB gzip on `extra` if the hierarchy module is already in that bundle, standalone entry 10–13 KB. Sunburst's standalone budget is 12,091 bytes and is the right comparison. Not in line or `all`.

## Shared code

`readHierarchy`, `limitDepth`, `labelInk`, `siblingFill`, `openChart`, `readFrame`, `readTable`, `valueFormat`. `paintLegend` only for the one-level case. Sunburst's depth cap. Not the squarify function. Not the arc math.

## Risks

- Agents will send a treemap spec with `type: "icicle"`. That should work, because the encodings match. The risk is the reverse: `mark.innerRadius` copied from a sunburst. Repair removes it.
- Equal bands waste space when one level has a single child. v1 keeps equal bands. Collapsing a single-child level is a later option and changes the depth the reader counts.
- Long labels on a thin leaf are truncated. The tooltip has the full path. The cell does not shrink the font below the theme size.

## Error situations

Hierarchy errors stay `CK3027`–`CK3030`. New situations, numbers not assigned:

| Situation | Severity | Repair |
| --- | --- | --- |
| No hierarchy (`encoding.path`, id/parent, and `children` all absent) and more than one row. | error | None. The hint lists the three shapes. |
| `mark.innerRadius` is set. | warning | Remove it. |
| One level of nodes. | warning | None. The hint points at a stacked bar. |
| `mark.orientation` or `mark.depth` needs no new code when the value is a bad enum. | error | The existing bad-enum error. |

## Schema diff

Add `"icicle"` to the `type` enum, to the `data` branch, and to the hierarchy branch treemap and sunburst use. One sentence: an icicle is the sunburst hierarchy drawn as rows of rectangles.

`encoding.path`, `encoding.id`, and `encoding.parent` descriptions gain icicle. `mark.depth` description gains icicle. `mark` gains `pad` (number 0–8, default 1) for the sibling gap. Marimekko uses the same key. `mark.orientation` description gains icicle: horizontal means depth goes down.

## Examples

### 1. Flat path

The shape treemap already teaches.

```json
{
  "version": "1",
  "type": "icicle",
  "data": [
    { "group": "Fruit", "item": "Apple", "sold": 30 },
    { "group": "Fruit", "item": "Pear", "sold": 10 },
    { "group": "Veg", "item": "Kale", "sold": 20 }
  ],
  "encoding": { "path": ["group", "item"], "y": "sold" },
  "a11y": { "alt": "Fruit is the larger branch. Apple is the largest leaf, at 30." }
}
```

Compact JSON is 292 characters and **89 tokens**. Pretty-printed it is 138 tokens.

### 2. Id and parent, vertical, depth capped

```json
{
  "version": "1",
  "type": "icicle",
  "data": [
    { "id": "all", "parent": "", "sold": 60 },
    { "id": "Fruit", "parent": "all", "sold": 40 },
    { "id": "Apple", "parent": "Fruit", "sold": 30 },
    { "id": "Pear", "parent": "Fruit", "sold": 10 },
    { "id": "Veg", "parent": "all", "sold": 20 }
  ],
  "encoding": { "id": "id", "parent": "parent", "y": "sold" },
  "mark": { "orientation": "vertical", "depth": 2 },
  "a11y": { "alt": "Two branches. Fruit is twice veg. Leaves under fruit are not drawn." }
}
```

Compact JSON is 417 characters and **121 tokens**. Pretty-printed it is 194 tokens.

The parent values match the children, so `CK3030` stays quiet. Leaving `sold` off the parent rows is the other legal form.

## Where it ships

- `@chartkitdev/core/charts/icicle`, extra only.
- Docs `/docs/charts/icicle`.
- `llms.txt` gets example 1 after a trim, and one line: same data as treemap.
- Gallery tile is example 1.
- Eval task `sales-icicle` for a later round. The checker wants `type: "icicle"`, a path or id/parent encoding, and rectangles rather than arcs. Not a paid run. The scoreboard stays 42.

## Left for later

Click-to-zoom, a flame-graph sort (leaves ordered by name or by value within the parent), and inverted icicles for stack traces. The sort is the one worth doing with the first build if it is a `mark.sort` of `"none"` or `"desc"` inside each parent. It is not required for v1. `"none"` (data order) is the default if it is added.

## Size

**S.** A partition loop on a parser that already exists.
