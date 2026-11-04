# Network graph spec proposal

Status: design only. Rank 9 in [README.md](./README.md). Recommendation: later. Effort L for the chart people mean, which is a force layout. A circle of the same links is S and is still a weak chart, so it is not the smaller version to build. Coverage 4 of 9. Matrix id `type.network`, `agentRelevance` 2.

A network draws nodes and edges. Use it when a node can have many links and there is no single parent and no flow value that should become a ribbon. Do not use it for a hierarchy. That is [tree](./tree.md). Do not use it for a weighted flow between peers. That is [chord](./chord.md) or sankey. Do not use it when the positions are the data (a map, a scatter). Fixed coordinates on this type are a scatter with extra lines, and scatter already exists.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | `series.type: "networkgraph"`, plus `modules/networkgraph.js`. Links are `from` and `to`. `layoutAlgorithm.type` is `reingold-fruchterman`. `maxIterations`, forces, and `initialPositions` are options. Nodes can be dragged. | [Network graph](https://www.highcharts.com/docs/chart-and-series-types/network-graph) |
| ECharts | `series.type: "graph"`. `layout` is `none`, `force`, or `circular`. `force` takes repulsion, gravity, and edge length. Data splits into `data` (nodes) and `links`. | [series-graph](https://echarts.apache.org/en/option.html#series-graph) |
| Nivo | `Network` / `ResponsiveNetwork`. Nodes and links. Centering and distance are props. Hover repulses the simulation in their demos. | [Network](https://nivo.rocks/network/) |
| amCharts 5 | A force-directed hierarchy chart. The docs treat it as a hierarchy series with a simulation. | [Force-directed](https://www.amcharts.com/docs/v5/charts/hierarchy/force-directed/) |

Vega-Lite and Plotly are `none`. Chart.js is a plugin. Plot is manual. Recharts is `none`.

## Encoding

One table of links, the sankey shape without a required value.

| Channel | Role |
| --- | --- |
| `encoding.source` | Link start. |
| `encoding.target` | Link end. |
| `encoding.y` | Optional weight. v1 draws it as stroke width, from 1 px to 4 px. It does not feed the layout. |
| `encoding.color` | Optional. The source node's group. A node that is only ever a target stays `muted`. Two colors on one source warn, and the first wins. |

`a11y.alt` stays required.

Node rows and link rows in one array are rejected. ECharts' split (`data` plus `links`) would be a second table, and ChartKit's `data` is one array. v1 infers nodes from the link endpoints. A node with a position is later, as `mark.arrange: "fixed"` reading `encoding.x` and `encoding.y` from a node table. That mode is specified here so the door is shaped, and it is not in the schema diff.

## Mark options

These describe the chart to build later. They are not a request to build it now.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.arrange` | `"circle"` \| `"force"` | `"circle"` if this type is ever forced into a first cut. The recommended build, when it happens, is `"force"` with a fixed iteration count. | Circle places nodes in first-seen order, equally spaced. Force runs a seeded Fruchterman–Reingold. |
| `mark.iterations` | integer 1–300 | `80` | Force steps. Ignored by circle. |
| `mark.seed` | integer | `1` | The only random source. The same spec renders the same SVG on the server and in every adapter. |
| `mark.labels` | boolean, the existing key | drawn when omitted | Node names. A deterministic overlap pass hides a label that would sit on another. `false` hides all of them. The schema default stays `false` for bar. The description says a network treats omission as on. |

Dragging nodes is out. A drag changes the picture and cannot round-trip through the spec without writing coordinates back. Highcharts supports it. ChartKit Cloud renders a spec. A drag that does not update the spec is a lie. Leave it out.

## Catalog groups

| Group | On a network |
| --- | --- |
| Data / Encoding | `encoding.source`, `encoding.target`, optional `encoding.y`, optional `encoding.color`. |
| Marks & style | `mark.arrange`, `mark.iterations`, `mark.seed`, `mark.labels`. |
| Axes | None. |
| Labels | Node names, `text`, hidden on collision. |
| Legend | Only with `encoding.color`. |
| Tooltip & interaction | Hover a node: name, degree, and the neighbor names up to six. Hover an edge: the two names and the weight. |
| Colors & theme | Nodes are series colors by group, or `accent` when there is one group. Edges are `muted`. |
| Layout & size | `size`. The layout uses a square inside the padding. |
| Annotations | None. |
| Accessibility | `a11y.alt`, `description`, `keyboard`, `dataTable`. |
| Advanced | `render` stays off. |

## Data shape and transforms

Link rows only. Nodes are the distinct source and target strings, in first-seen order. A self-loop warns and is not drawn. Duplicate pairs sum their weights when `encoding.y` is set, and collapse to one edge when it is not. The collapse is geometry. `repair()` does not rewrite `data`.

A force layout stores nothing. Re-running with the same seed and the same iteration count reproduces the coordinates. Tests can lock a three-node triangle.

## Interactions

Hover as above. No drag. No zoom. `a11y.keyboard: true` moves across nodes in first-seen order, then across that node's edges. The announcement is the name and the degree. Positions are not announced. They are not data.

## Accessibility

`a11y.alt` states the most connected node and one fact about the components ("one component" or "two components"). Do not describe the picture of the simulation. It will move if the iteration default ever changes, and the alt sentence must not depend on coordinates.

Each node's `aria-label` is the name, the group, and the degree. Edges are `aria-hidden` when the node label already implies them, and exposed when `a11y.keyboard` is on so focus can land on an edge. `a11y.dataTable` is the link list. Color is the group. The label repeats the group name.

A force layout is a bad screen-reader graphic. The table is the product. The warning at more than 40 nodes says so.

## Soft theme

Nodes are filled circles, series or `accent`, with a 1 px `surface` stroke. Edges are `muted` at opacity 0.6, width from the weight. Labels are `text`, with a halo of `surface` so a label on an edge still reads in both modes. The halo is a second text node in `surface` behind the ink, not a new token. Background stays transparent. No grid, no axis. Dark and light series lists apply.

## Layout, dependency, bundle

Circle: one angle per node. That part is S.

Force: Fruchterman–Reingold, repulsion between every pair, attraction along edges, a cool-down over `mark.iterations`, positions seeded from the circle so the start is stable. `d3-force` 3.0.1 min is 2,856 bytes gzip and still wants a timer. Do not take it. A simulation that runs on a timer will not match a server render unless the timer is replaced by a counted loop. The counted loop is the whole reason to write it. Cap nodes at 200. Past that, warn and fall back to the circle. An O(n²) repulsion at 200 nodes and 80 steps is acceptable on a server. Past that it is not.

Zero dependencies either way.

Estimate: circle 3–4 KB gzip on `extra`, standalone 8–11 KB. Force adds 6–9 KB on top of the circle for the integrator, the same file. Not in line or `all`.

## Shared code

`openChart`, `readFrame`, `readTable`, sankey's source and target field readers. `paintLegend` with a color field. Not the chord arc math. Not `readHierarchy`, unless a later mode accepts a tree and ignores it. v1 does not.

## Risks

- The same links do not produce the same picture as Highcharts or ECharts. Agents and reviewers will compare screenshots. The seed and the iteration count have to be in the docs, and tests lock coordinates for a fixture rather than "looks spread out."
- A circle layout of a real graph is hairball-adjacent and looks unfinished. Shipping it as v1 would create a type agents use once. That is the reason the smaller version is not recommended.
- Weighted edges that also pull on the layout (attraction proportional to weight) change the picture when a weight is missing. v1 force, if built, ignores weight for the forces and uses it only for stroke width. One behavior, written down.
- Cloud renders are stateless. A layout that needs 80 iterations is fine. A layout that needs a worker and a timeout is not. Stay synchronous and bounded.

## Error situations

Numbers are not assigned.

| Situation | Severity | Repair |
| --- | --- | --- |
| A link is missing a source or a target. | error | None. |
| Source equals target. | warning | Skip the loop. Do not patch `data`. |
| More than 200 nodes under `mark.arrange: "force"`. | warning | Draw the circle instead. Leave `mark.arrange` so the spec still says what was asked. |
| `mark.iterations` over 300, or `mark.seed` not an integer. | error | The existing bounds error. |
| `encoding.y` is not numeric. | warning | Ignore the weight. Stroke stays 1 px. |
| More than 40 nodes. | warning | None. The hint names the data table. |
| `mark.arrange` is `"force"` or `"circle"` on another type. | warning | Remove `mark.arrange`. |

## Schema diff

Not in the first cut. When it lands: add `"network"` to the `type` enum and to the branch that requires `encoding.source` and `encoding.target`. `encoding.y` stays optional. One sentence: nodes and links, circle or a seeded force layout.

`mark.arrange` is `"circle"` or `"force"`. The key is not `mark.layout`. Heatmap already uses that for `"calendar"` and `"grid"`. ECharts calls the choice `layout`. The schema keeps the two enums apart. `mark.iterations` is an integer 1–300. `mark.seed` is an integer. `mark.labels` is the existing boolean. Its description gains network: omission draws the names, and `false` hides them. Descriptions name network.

## Examples

### 1. Links only

The spec to teach. Circle if a first cut is forced. Force, seed 1, 80 steps, if the real chart is built.

```json
{
  "version": "1",
  "type": "network",
  "data": [
    { "from": "A", "to": "B" },
    { "from": "B", "to": "C" },
    { "from": "A", "to": "C" }
  ],
  "encoding": { "source": "from", "target": "to" },
  "a11y": { "alt": "A, B, and C are one triangle. A links to both of the others." }
}
```

Compact JSON is 228 characters and **71 tokens**. Pretty-printed it is 116 tokens.

### 2. Weights and groups

```json
{
  "version": "1",
  "type": "network",
  "data": [
    { "from": "A", "to": "B", "weight": 3, "side": "East" },
    { "from": "B", "to": "C", "weight": 1, "side": "East" },
    { "from": "D", "to": "C", "weight": 2, "side": "West" },
    { "from": "C", "to": "A", "weight": 1, "side": "East" }
  ],
  "encoding": { "source": "from", "target": "to", "y": "weight", "color": "side" },
  "mark": { "arrange": "force", "seed": 1, "iterations": 80 },
  "a11y": { "alt": "The strongest link is A to B. D is the West node." }
}
```

`encoding.color` is the source node's group. A node that is only ever a target stays `muted`. When the same source appears with two colors, the chart warns and keeps the first. In this spec A, B, and C are East, and D is West. Stroke width is the weight. The layout ignores the weight. Prefer example 1 in `llms.txt`.

Compact JSON is 419 characters and **130 tokens**. Pretty-printed it is 211 tokens.

## Where it ships

- `@chartkitdev/core/charts/network`, extra only, when it is built. Not in the recommended first cut.
- Docs `/docs/charts/network`. The page says the seed is part of the picture.
- `llms.txt` gets example 1, and only after tree and sankey are already described so the agent has somewhere else to send a hierarchy and a flow.
- No gallery tile until the force layout is the one that ships. A circle tile would teach the wrong chart.
- Eval task `triangle-network` for a later round. The checker wants link rows and node marks. It does not compare coordinates to another library. Not a paid run. The scoreboard stays 42.

## Left for later

Fixed coordinates (`mark.arrange: "fixed"` with a node table). Drag. Edge labels. Arrowheads. A map overlay. Those are different products. Arrowheads are the cheapest and can ride along with force if the type is built.

## Size

**L** for force. **S** for a circle, which is not worth shipping on its own.
