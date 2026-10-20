# Roadmap

ChartKit's goals are the best-looking defaults, the smallest bundles, and the most agent-friendly JSON spec, with the gaps stated in the open.

Work is ordered by how widely a feature already exists across charting libraries, weighted by how popular those libraries are; how often agents and users ask for it; what it costs in the bundle; and how much effort it takes. The coverage data is the [feature matrix](https://chartkit.dev/features.json) (263 features across 21 libraries), the [feature pages](https://chartkit.dev/features), and the [compare pages](https://chartkit.dev/compare).

## Done

- [x] Schema honesty, so every option draws or warns ([#16](https://github.com/toddynho/chartkit/pull/16))
- [x] The small line bundle draws the axis options, plus the warning and claim fixes ([#17](https://github.com/toddynho/chartkit/pull/17))
- [x] Tooltip content: fields, position, and a crosshair label ([#18](https://github.com/toddynho/chartkit/pull/18))
- [x] The published feature matrix, with feature pages and compare pages ([#19](https://github.com/toddynho/chartkit/pull/19))
- [x] Click events, selection, and legend hover ([#21](https://github.com/toddynho/chartkit/pull/21))

Earlier v1 work. 31 chart types draw: 15 in the first core, eight in Phase 3, five in Phase 4, and three uncertainty charts.

- [x] Core, the React adapter, and the first 14 chart types ([#3](https://github.com/toddynho/chartkit/pull/3))
- [x] Vue, Svelte, and vanilla adapters ([#7](https://github.com/toddynho/chartkit/pull/7))
- [x] Soft as the default theme ([#9](https://github.com/toddynho/chartkit/pull/9))
- [x] Phase 3: histogram, box plot, radar, funnel, treemap, sankey, bullet, and waterfall ([#11](https://github.com/toddynho/chartkit/pull/11))
- [x] Phase 4: gantt, timeline, quadrant, venn, and journey ([#14](https://github.com/toddynho/chartkit/pull/14))
- [x] Mermaid import and Markdown auto-render ([#13](https://github.com/toddynho/chartkit/pull/13))
- [x] An explicit y domain ([#15](https://github.com/toddynho/chartkit/pull/15))
- [x] Point shapes and data labels ([#23](https://github.com/toddynho/chartkit/pull/23))
- [x] Axis finishing: title position, auto-skip, wrap, the axis line, and tick marks ([#24](https://github.com/toddynho/chartkit/pull/24))
- [x] Pie and colour: a real pie type, leader lines, and per-point and conditional colour ([#25](https://github.com/toddynho/chartkit/pull/25))
- [x] PNG, SVG, and CSV export, with a keyboard export menu ([#27](https://github.com/toddynho/chartkit/pull/27))
- [x] Legends and colour scales ([#27](https://github.com/toddynho/chartkit/pull/27))
- [x] Annotations: trendlines, a regression overlay, callouts, and axis bands ([#31](https://github.com/toddynho/chartkit/pull/31))
- [x] Uncertainty: range area, floating bars, and error bars

## In progress

- [ ] Showcase gallery, the first six boards ([#20](https://github.com/toddynho/chartkit/pull/20)): one spec on every stack, the roastery P&L, bike-share flows, a Mermaid game launch, the repair loop, and benchmarks drawn as charts
- [ ] `@chartkitdev/mcp`: validate, repair, render, and feature lookup for agents ([#26](https://github.com/toddynho/chartkit/pull/26))

## Next

- [ ] Time zones and sorting
- [ ] Sunburst
- [ ] A web component
- [ ] The remaining showcase boards

## Later

- [ ] A canvas renderer
- [ ] Maps
- [ ] Small multiples
- [ ] Linked interactions
- [ ] More chart types

## Then

A dedicated size pass, after the features above land, to trim the bundles back down.

## Not planned

- **Functions or HTML in the spec.** The spec stays JSON an agent can validate. Format presets, templates, events, and adapter slots cover custom formatting and custom tooltip UI.
- **A builder API.** One JSON spec is the interface.
- **3D charts and WebGL.** Large, and hard to read. Other libraries already cover them.
- **Word clouds.** Weak as analysis, poor for accessibility, and heavy on assets.
- **Technical indicators.** Candlestick stays. An indicator library is a separate product.
- **Drawing tools.** Draggable annotations need application state outside a spec.

## How this stays current

Update this file in the pull request that lands the feature.
