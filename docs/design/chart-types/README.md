# Chart types not yet supported

Status: the types in the table below are design only, except streamgraph, 1D density, and tree, which have shipped. This folder does not change the schema, the renderer, or a bundle. Spec major stays `"1"`. The package stays `0.5.0`. The schema stays `packages/core/schema/chartkit.schema.json`.

ChartKit renders 41 types (`HERO_TYPE_COUNT` in `apps/web/src/data/hero-catalog.ts`): 39 ids in `apps/web/src/data/chart-types.ts`, plus choropleth and map-points. The list below started as the chart-type rows in [option-parity.md](../option-parity.md) where ChartKit's cell was `none`. Counts are native or partial among the nine libraries Todd named: Highcharts, Apache ECharts, Vega-Lite, Plotly, Chart.js, Observable Plot, Recharts, Nivo, amCharts 5. `catalog/public/features.json` is the matrix (generated 2026-10-19). A `manual` or `plugin` cell is not coverage. Each spec cites the docs, not only the matrix, and says where the matrix is generous.

One spec per type lives next to this file. [big-features-pros-cons.md](../big-features-pros-cons.md) covers the four product gaps that are not a chart type (plugins, legend layout, custom marks, pattern fills).

## How the rank is computed

`value = coverage × demand × ease`.

- **Coverage** is the parity-doc count, out of 9.
- **Demand** is the matrix `agentRelevance` (1, 2, or 3). These rows are 1 or 2. It is not a traffic measurement.
- **Ease** is the effort of the chart people mean: S = 3, M = 2, L = 1. A smaller build scores higher, which is what a build order needs.

The recommended order is that score, with three calls that the score does not make on its own. Icicle and marimekko move up because the spec is data ChartKit already teaches (`encoding.path`, or `x` / `y` / `color`). Chord moves down because sankey already draws flow, and a ribbon chart is a bad default for an agent.

| Order | Type | Coverage | Demand | Effort | Value | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [streamgraph](./streamgraph.md) | 6 | 2 | S | 36 | Shipped. |
| 2 | [density](./density.md) | 4 | 2 | S for 1D, M for 2D | 24 | 1D curve shipped. 2D is not yet supported. |
| 3 | [tree](./tree.md) | 5 | 2 | M | 20 | Tidy tree and dendrogram shipped. Org charts are not yet supported. |
| 4 | [ohlc](./ohlc.md) | 3 | 2 | S | 18 | Not yet supported. Smaller version: `mark.style` on candlestick, and accept `type: "ohlc"` as that. |
| 5 | [icicle](./icicle.md) | 3 | 1 | S | 9 | Not yet supported. |
| 6 | [marimekko](./marimekko.md) | 3 | 1 | M | 6 | Not yet supported. |
| 7 | [chord](./chord.md) | 4 | 2 | M | 16 | Not yet supported. Use sankey. |
| 8 | [parallel](./parallel.md) | 3 | 1 | M | 6 | Not yet supported. |
| 9 | [network](./network.md) | 4 | 2 | L | 8 | Not yet supported. |
| 10 | [contour](./contour.md) | 3 | 1 | L | 3 | Not yet supported. |
| 11 | [pictorial](./pictorial.md) | 4 | 1 | M | 8 | Not yet supported. |

Circle packing, waffle, vector, and arc diagram tie parallel coordinates at 3 libraries in the parity doc. They are out of this set.

## What every spec assumes

- Options for one type live on `mark` or on an encoding channel that already exists. No new root keys.
- `a11y.alt` stays required. The chart SVG is `role="img"` from `openChart`. `a11y.keyboard` stays off unless set, because it loads the interaction runtime. `a11y.dataTable` stays the table escape hatch.
- Error-code numbers for a new type are not assigned. The last codes registered in `packages/core/src/__tests__/ck-codes.test.ts` are strip-row `CK3132`–`CK3135`. `CK3094` is the end of the first strip block, not the last code. An implementation claims the next free block and registers the family in that test. The situations in each spec are the contract.
- Shipped streamgraph, density, and tree load from `@chartkitdev/core/charts/<type>` and from `@chartkitdev/core/extra`. They are not in the `/all` entry until `adopt()`. Bar-list is its own module and is not in `extra`. A type that is not yet supported would use that same on-demand path. None of them belong in the line bundle (`createRenderer([line])`). OHLC, if built, is the exception: candlestick is already in `all`.
- Zero dependencies. Measured gzip-9 of the min builds we would be buying, so the estimates have a ceiling: `d3-hierarchy` 3.1.3 is 5,702 bytes and includes treemap, which ChartKit already wrote; `d3-force` 3.0.1 is 2,856 bytes and still needs a timer; `d3-contour` 4.0.3 is 2,252 bytes and depends on `d3-array` (5,963 bytes); `d3-chord` 3.0.2 is 1,550 bytes. A hand-rolled layout for one chart is smaller than the package, and the server render stays free of those graphs.
- For scale, the strip standalone entry is budgeted at 13,046 bytes gzip. Its first landing added about 2,800 bytes to `extra`. Estimates below are that kind of number, not a measurement. `scripts/size.mjs` is the check when one of these is built.
- Soft is the default theme (`theme` omitted, `"auto"`, or `"soft"`). The plot fill is transparent. Ink, grid, axis, muted, accent, positive, and negative are `light-dark()` tokens. Series and line ramps have a light list and a dark list. No new tokens. `theme.mode` `"light"` and `"dark"` keep today's resolution.
- A render is a function of the spec. No `Math.random`. The strip jitter rule is the rule here too.
- Token counts use `gpt-tokenizer` cl100k, the same encoding as the strip proposal. Compact is `JSON.stringify` of the object. Pretty is the fenced spec. The 42-task scoreboard is a finished round and stays 42. A task name in a spec is a proposal for a later round, not a paid run.
- `llms.txt` is capped at 6,400 bytes. A shipped type is one short spec in that file when it fits. Pie, radial-bar, rose, and bar-list are omitted so the file stays under the cap. The long example stays in the doc.
- A shipped type has a docs page at `/docs/charts/<type>`. A type that is not yet supported has no page. Adapters already branch on `isExtra()`. Bar-list is separate from that set.

## Shared code a type is allowed to call

| Piece | Where | Use it for |
| --- | --- | --- |
| `openChart` / `closeChart` | `packages/core/src/svg.ts` | SVG shell, `aria-label`, description, font. |
| `readAxis`, `ticks`, `linear` | `svg.ts` | A numeric or category spine. |
| `readFrame`, `readTable`, `column`, `fieldOf` | `frame.ts` | Spec, rows, fields. |
| `readLegend`, `legendSpace`, `paintLegend` | `legend.ts` | A series legend. Cartesian already shrinks the plot for `legend.position`. Extra charts have to call `legendSpace` themselves. |
| `readColorScale` | `color-scale.ts` | A sequential ramp. Soft's ramp picks night stops only when the preset background is midnight's hex or the text is `#ffffff`. A transparent Soft background takes the day stops. Contour and 2D density have to pass the resolved mode. That is a bug to fix in the ramp, not a new token. |
| `readHierarchy` | `hierarchy.ts` | Treemap and sunburst. Icicle and tree should extend `APPLIES` rather than parse parents again. Codes `CK3027`–`CK3030` stay the hierarchy errors. |
| Candlestick painter | `renderers/candlestick.ts` | OHLC ticks, the volume pane, `positive` / `negative`. |
| Stacked-area stack | cartesian stack | Streamgraph and marimekko need the same running total. Copying the stack loop into the extra chart is cheaper than importing `cartesian.ts` into the chart entry. |
