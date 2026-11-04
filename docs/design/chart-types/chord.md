# Chord spec proposal

Status: design only. Rank 7 in [README.md](./README.md). Recommendation: later. The score is 16, above marimekko, and it still waits. Sankey already draws a flow, the ribbons cross, and the alt sentence cannot recover the matrix. Effort M. Coverage 4 of 9. Matrix id `type.chord`, `agentRelevance` 2.

A chord places the nodes on a circle and draws a ribbon for each flow. The ribbon's width at each end is the value. Use it for a small square matrix (regions, teams) when the circular form is the point. Do not use it when the flow has stages. That is sankey, and ChartKit already ships it. Do not use it past about 12 nodes. The circle becomes a solid ring. Do not use it for an undirected network with no weights. That is [network](./network.md).

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `series.type: "dependencywheel"`. Data is sankey data: `from`, `to`, `weight`. Nodes sit on one ring, so the flow is not staged. | [Dependency wheel](https://www.highcharts.com/docs/chart-and-series-types/dependency-wheel) |
| ECharts | `series.type: "chord"`. Nodes and links, with the current option page. | [series-chord](https://echarts.apache.org/en/option.html#series-chord) |
| Nivo | `Chord` / `ResponsiveChord`. A square matrix, plus a `keys` array for the names. Ribbons, arc labels, and hover that fades the rest. | [Chord](https://nivo.rocks/chord/) |
| amCharts 5 | A chord diagram under flow charts. Directed ribbons. | [Chord](https://www.amcharts.com/docs/v5/charts/flow-charts/chord-diagram/) |

Vega-Lite is manual (a layered spec). Plotly, Chart.js, Plot, and Recharts do not have the mark.

## Encoding

The sankey encoding. The same rows should render as either chart.

| Channel | Role |
| --- | --- |
| `encoding.source` | The node the flow leaves. `encoding.x` is accepted as a fallback, the way sankey already accepts it, and warns. |
| `encoding.target` | The node the flow enters. |
| `encoding.y` | The value. |

`a11y.alt` stays required. There is no hierarchy and no `encoding.color` in v1. The ribbon color is the source node's series color. A target-colored half (the usual chord fade along the ribbon) is v1: the ribbon interpolates from the source color to the target color. That is paint, not an encoding.

## Mark options

A spec with `version`, `type`, `data`, `encoding.source`, `encoding.target`, `encoding.y`, and `a11y.alt` draws a directed chord. Node order is first-seen. The gap between nodes is 1.5 degrees. Labels sit outside the ring.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.padAngle` | number 0–8, degrees | `1.5` | Gap between node arcs. Pie already uses `mark.padAngle`. |
| `mark.labels` | boolean, the existing key | drawn when omitted | Node names outside the ring. `false` hides them. The schema default stays `false` because that is the bar default. The description says a chord treats omission as on. Names that do not fit are hidden. The tooltip keeps them. |
| `mark.nodeOrder` | `"none"` \| `"sum"` | `"none"` | `"sum"` orders nodes by total flow through them, descending, so the large arcs sit together. |

`mark.sort` is not reused. Pie's sort is slice order by value. `mark.order` is the streamgraph series order, a different enum, so chord does not take that key.

## Catalog groups

| Group | On a chord |
| --- | --- |
| Data / Encoding | `encoding.source`, `encoding.target`, `encoding.y`, `encoding.y.format`. |
| Marks & style | `mark.padAngle`, `mark.labels`, `mark.nodeOrder`. |
| Axes | None. |
| Labels | Node names outside the ring, in `text`. A name that does not fit moves to the tooltip only. |
| Legend | None in v1. The nodes are labeled. A legend of nodes duplicates the ring. |
| Tooltip & interaction | Hover a ribbon: source, target, value, and the share of the source's outflow. Hover a node: the total through it. Other ribbons drop to `muted`. |
| Colors & theme | Node arcs and the source end of the ribbon use the series palette, one color per node in first-seen order. |
| Layout & size | `size`. The chart is square. A wide size is letterboxed. The ring uses the smaller side. |
| Annotations | None. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. The table is the right fallback. |
| Advanced | `render` stays off. |

## Data shape and transforms

One row per directed flow, the sankey row. A pair that flows both ways is two rows. A row from a node to itself is dropped with a warning. Values are positive. Zero and negative are errors.

Node identity is the string of the source or target. The renderer builds the matrix. It does not ask the agent for a square array. Nivo's matrix is the form to avoid. Agents are worse at matrices than at link rows, and sankey already taught the link row.

The layout groups arcs by node, in `mark.nodeOrder`, then places ribbons between the reserved arc spans. The ribbon is a quadratic or cubic path between the two arcs. Deterministic. No simulation.

## Interactions

Hover as above. No drag, no rotation. `a11y.keyboard: true` moves around the ring node by node, then through that node's outgoing ribbons. The announcement is the source, the target, and the value.

## Accessibility

This is the weak chart for access. Crossing ribbons do not have a reading order that matches the picture. `a11y.alt` should name the largest flow and stop. Teach that limit.

Each ribbon's `aria-label` is "from A to B, value, share of A's outflow." Node arcs announce the name and the total. `a11y.dataTable` defaults to a recommendation in the warning when there are more than 8 nodes: the warning text says to turn the table on. v1 does not turn it on by itself, because the table is opt-in everywhere else.

Color is the source node. The label names the source, so the color is not the only cue. Do not add patterns in v1.

## Soft theme

Node arcs are series fills. Ribbon opacity is 0.55 so overlaps do not become a flat slab, and the stroke is omitted so stacked ribbons do not grow a dark edge. Labels are `text`. A hovered ribbon goes to full opacity. Dimmed ribbons use `muted` at 0.25. The ring gap shows the transparent background. No new token. Dark and light series lists apply. `positive` and `negative` are not used. There is no up and down.

## Layout, dependency, bundle

The chord layout is a few dozen lines: totals, arc spans, then a path between spans. `d3-chord` 3.0.2 min is 1,550 bytes gzip. That is small and still a dependency, and it expects a square matrix. Write the loop. The path helper ChartKit uses for sankey ribbons is the model, on a circle instead of columns.

Zero dependencies.

Estimate: 4–6 KB gzip on `extra`, standalone entry 10–13 KB. Sankey's standalone budget is 9,109 bytes and does less geometry. Not in line or `all`.

## Shared code

`openChart`, `readFrame`, `readTable`, the sankey field fallbacks (`source` or `x`, `target`, `y`). `valueFormat`. Not `readHierarchy`. Not the sankey column layering. Tooltip from the extra interact path. `mark.padAngle` as a shared mark key with pie, described for both.

## Risks

- A sankey spec with the type changed to `chord` will draw. That is good. The risk is an agent picking chord for a staged flow because the word "flow" appeared. The `llms.txt` line, when this ships, says: stages are sankey, a circle of peers is chord.
- More than 12 nodes is unreadable and still draws. The warning is the whole mitigation.
- Bidirectional pairs need two ribbons that do not cover each other. Split each node's arc into an outgoing side and an incoming side, which is what a directed chord does. An undirected mode (`mark.directed: false` merging A→B and B→A) is later.
- Label collision around the ring is the layout bug that will show up in review. v1 hides a label whose arc is under 8 degrees rather than rotating text. The tooltip keeps the name.

## Error situations

Numbers are not assigned.

| Situation | Severity | Repair |
| --- | --- | --- |
| A value is missing, not numeric, or not positive. | error | None. |
| Source equals target. | warning | Drop that row from the geometry. Do not patch `data`. |
| `encoding.x` was used instead of `encoding.source`. | warning | None. Sankey already accepts this fallback. Keep the warning so the stored spec can be cleaned by the agent. |
| More than 12 nodes. | warning | None. The hint names sankey and the data table. |
| More than 8 nodes, and `a11y.dataTable` is not true. | warning | None. The hint says the table is the readable form. |
| `mark.nodeOrder` on a type that is not a chord. | warning | Remove `mark.nodeOrder`. `mark.padAngle` stays legal on pie. |

Missing source, target, or y stays the existing missing-encoding error.

## Schema diff

Add `"chord"` to the `type` enum, the `data` branch, and the branch that requires `encoding.source`, `encoding.target`, and `encoding.y`, next to sankey. One sentence: a chord is the sankey flow drawn as ribbons on a circle.

`mark` gains `nodeOrder` (`"none"` \| `"sum"`) for chord. `mark.labels` already exists as a boolean. Its description gains chord: omission draws the node names, and `false` hides them. `mark.padAngle` description gains chord. Streamgraph keeps `mark.order` for series order. The two enums are not the same key.

## Examples

### 1. Minimal

Three directed flows. First-seen node order.

```json
{
  "version": "1",
  "type": "chord",
  "data": [
    { "from": "EU", "to": "US", "value": 40 },
    { "from": "US", "to": "EU", "value": 25 },
    { "from": "EU", "to": "CN", "value": 15 }
  ],
  "encoding": { "source": "from", "target": "to", "y": "value" },
  "a11y": { "alt": "The largest flow is EU to US, 40. US sends 25 back." }
}
```

Compact JSON is 268 characters and **87 tokens**. Pretty-printed it is 137 tokens.

### 2. Nodes ordered by total

```json
{
  "version": "1",
  "type": "chord",
  "data": [
    { "from": "EU", "to": "US", "value": 40 },
    { "from": "US", "to": "EU", "value": 25 },
    { "from": "EU", "to": "CN", "value": 15 },
    { "from": "CN", "to": "US", "value": 8 }
  ],
  "encoding": { "source": "from", "target": "to", "y": "value" },
  "mark": { "nodeOrder": "sum", "padAngle": 2 },
  "a11y": { "alt": "EU and the US dominate the ring. EU to US is the largest ribbon." }
}
```

Compact JSON is 355 characters and **110 tokens**. Pretty-printed it is 175 tokens.

## Where it ships

- `@chartkitdev/core/charts/chord`, extra only, when it is built. Not in this recommendation's first cut.
- Docs `/docs/charts/chord`.
- `llms.txt` only after sankey's line already tells the agent to prefer sankey for stages.
- Gallery tile is example 1.
- Eval task `trade-chord` for a later round. The checker wants link rows, not a matrix, and a ribbon. A correct `type: "sankey"` for a staged prompt must not be failed. The task text has to say the nodes are peers on a circle. Not a paid run. The scoreboard stays 42.

## Left for later

Undirected ribbons, arrowheads, label rotation, and click-to-isolate beyond hover. A matrix input is not planned. Link rows stay the only shape.

## Size

**M.** Smaller than sankey was. The reason to wait is the chart, not the bytes.
