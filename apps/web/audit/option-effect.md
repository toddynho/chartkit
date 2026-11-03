# Option effect audit

Class (a) is a playground wiring bug. The preview used to assign a static SVG and never call mount(), so tooltip, crosshair, legend toggle, and hover could not run. That is fixed in the playground by mounting @chartkitdev/vanilla. Rows here are what remains after that mount is used for the hover probe.

Probed 6649 option writes across 33 chart types. 1393 changed the SVG. Remaining rows are classified below.

- (a) playground wiring: 0
- (b) core ignores a listed option: 2103
- (c) catalog scope too wide: 0
- (d) no-op for this example: 2609

## By chart type

### strip (128)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 116 more

### scatter (125)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.signed` — spec changed and the rendered SVG did not
- … 113 more

### spike (108)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.x.format` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- … 96 more

### histogram (104)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.signed` — spec changed and the rendered SVG did not
- … 92 more

### errorbar (100)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.error` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- … 88 more

### quadrant (88)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.format` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.signed` — spec changed and the rendered SVG did not
- … 76 more

### boxplot (81)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 69 more

### area-range (81)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- … 69 more

### bar-range (81)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y` — spec changed and the rendered SVG did not
- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- … 69 more

### sankey (78)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.signed` — spec changed and the rendered SVG did not
- … 66 more

### waterfall (78)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 66 more

### gantt (77)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.format` — spec changed and the rendered SVG did not
- … 65 more

### treemap (74)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 62 more

### radar (70)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.series.format` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.decimals` — spec changed and the rendered SVG did not
- … 58 more

### combo (67)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.series.format` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.series.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.scale.zero` — spec changed and the rendered SVG did not
- … 55 more

### candlestick (66)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `axes.x.grid` — spec changed and the rendered SVG did not
- **b** `axes.x.labels` — spec changed and the rendered SVG did not
- **b** `axes.x.position` — spec changed and the rendered SVG did not
- **b** `axes.x.titlePosition` — spec changed and the rendered SVG did not
- **b** `axes.x.titleRotate` — spec changed and the rendered SVG did not
- … 54 more

### bullet (63)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 51 more

### stacked-area (59)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.series.format` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.series.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.scale.zero` — spec changed and the rendered SVG did not
- … 47 more

### bar (58)

- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.type` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.series.format` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.series.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.series.scale.type` — spec changed and the rendered SVG did not
- … 46 more

### heatmap (55)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.x.format` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- … 43 more

### donut (46)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 34 more

### timeline (43)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.format` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.decimals` — spec changed and the rendered SVG did not
- … 31 more

### rose (42)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.suffix` — spec changed and the rendered SVG did not
- … 30 more

### funnel (42)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- … 30 more

### journey (41)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.title` — spec changed and the rendered SVG did not
- **b** `encoding.y.format` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- … 29 more

### line (40)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.fillOpacity` — spec changed and the rendered SVG did not
- **b** `encoding.y.stack` — spec changed and the rendered SVG did not
- … 28 more

### gauge (37)

- **b** `subtitle` — spec changed and the rendered SVG did not
- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `metric.delta` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.decimals` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.currency` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.prefix` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.suffix` — spec changed and the rendered SVG did not
- … 25 more

### progress-ring (36)

- **b** `subtitle` — spec changed and the rendered SVG did not
- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `metric.target` — spec changed and the rendered SVG did not
- **b** `metric.delta` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.decimals` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.currency` — spec changed and the rendered SVG did not
- **b** `metric.deltaFormat.prefix` — spec changed and the rendered SVG did not
- … 24 more

### radial-bar (33)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.title` — spec changed and the rendered SVG did not
- **b** `legend.position` — spec changed and the rendered SVG did not
- **b** `legend.anchor` — spec changed and the rendered SVG did not
- **b** `legend.align` — spec changed and the rendered SVG did not
- **b** `legend.orient` — spec changed and the rendered SVG did not
- **b** `legend.maxRows` — spec changed and the rendered SVG did not
- … 21 more

### kpi (29)

- **b** `subtitle` — spec changed and the rendered SVG did not
- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `metric.min` — spec changed and the rendered SVG did not
- **b** `metric.max` — spec changed and the rendered SVG did not
- **b** `metric.target` — spec changed and the rendered SVG did not
- **b** `metric.format.currency` — spec changed and the rendered SVG did not
- **b** `metric.format.specifier` — spec changed and the rendered SVG did not
- **b** `theme.brand` — spec changed and the rendered SVG did not
- … 17 more

### venn (25)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `theme.brand` — spec changed and the rendered SVG did not
- **b** `theme.tokens.grid` — spec changed and the rendered SVG did not
- **b** `theme.tokens.axis` — spec changed and the rendered SVG did not
- **b** `theme.tokens.accent` — spec changed and the rendered SVG did not
- **b** `theme.tokens.positive` — spec changed and the rendered SVG did not
- **b** `theme.tokens.negative` — spec changed and the rendered SVG did not
- **b** `theme.tokens.fontSize` — spec changed and the rendered SVG did not
- … 13 more

### sparkline (24)

- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not
- **b** `theme.brand` — spec changed and the rendered SVG did not
- **b** `theme.tokens.surface` — spec changed and the rendered SVG did not
- **b** `theme.tokens.text` — spec changed and the rendered SVG did not
- **b** `theme.tokens.muted` — spec changed and the rendered SVG did not
- **b** `theme.tokens.grid` — spec changed and the rendered SVG did not
- **b** `theme.tokens.axis` — spec changed and the rendered SVG did not
- **b** `theme.tokens.accent` — spec changed and the rendered SVG did not
- **b** `theme.tokens.positive` — spec changed and the rendered SVG did not
- **b** `theme.tokens.negative` — spec changed and the rendered SVG did not
- **b** `theme.tokens.fontSize` — spec changed and the rendered SVG did not
- … 12 more

### mini-area (24)

- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not
- **b** `theme.brand` — spec changed and the rendered SVG did not
- **b** `theme.tokens.surface` — spec changed and the rendered SVG did not
- **b** `theme.tokens.text` — spec changed and the rendered SVG did not
- **b** `theme.tokens.muted` — spec changed and the rendered SVG did not
- **b** `theme.tokens.grid` — spec changed and the rendered SVG did not
- **b** `theme.tokens.axis` — spec changed and the rendered SVG did not
- **b** `theme.tokens.accent` — spec changed and the rendered SVG did not
- **b** `theme.tokens.positive` — spec changed and the rendered SVG did not
- **b** `theme.tokens.negative` — spec changed and the rendered SVG did not
- **b** `theme.tokens.fontSize` — spec changed and the rendered SVG did not
- … 12 more

## Example-only no-ops

These changed the spec and not the picture, and the example data cannot exercise them.

- heatmap: id is a hook, not paint (`id`)
- heatmap: probe value makes the spec invalid (`encoding.x`)
- heatmap: example rows have no spare series column (`encoding.series`)
- heatmap: example draws no legend (`legend`)
- heatmap: example is not faceted (`layout.facet.field`)
- heatmap: example is not a concatenation (`layout.concat.columns`)
- heatmap: example has no drilldown (`interaction.drilldown.key`)
- heatmap: motion runs in the client, not in the static SVG (`animation`)
- heatmap: client behavior; the static SVG only records intent (`a11y.keyboard`)
- donut: id is a hook, not paint (`id`)
- donut: x values are categories, so format and scale do not apply (`encoding.x.format`)
- donut: probe value makes the spec invalid (`encoding.y`)
- donut: example rows have no spare series column (`encoding.series`)
- donut: example has no color field (`encoding.color.type`)
- donut: example is not faceted (`layout.facet.field`)
- donut: example is not a concatenation (`layout.concat.columns`)
- donut: example has no drilldown (`interaction.drilldown.key`)
- donut: motion runs in the client, not in the static SVG (`animation`)
- donut: client behavior; the static SVG only records intent (`a11y.keyboard`)
- gauge: probe value makes the spec invalid (`type`)
- gauge: id is a hook, not paint (`id`)
- gauge: example is not faceted (`layout.facet.field`)
- gauge: example is not a concatenation (`layout.concat.columns`)
- gauge: example has no drilldown (`interaction.drilldown.key`)
- gauge: motion runs in the client, not in the static SVG (`animation`)
- gauge: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar: id is a hook, not paint (`id`)
- bar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- bar: example has no series on y2 (`axes.y2`)
- bar: example is not faceted (`layout.facet.field`)
- bar: example is not a concatenation (`layout.concat.columns`)
- bar: example has no drilldown (`interaction.drilldown.key`)
- bar: motion runs in the client, not in the static SVG (`animation`)
- bar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- histogram: id is a hook, not paint (`id`)
- histogram: probe value makes the spec invalid (`encoding.x`)
- histogram: example has no series on y2 (`axes.y2`)
- histogram: example draws no legend (`legend`)
- histogram: example is not faceted (`layout.facet.field`)
- histogram: example is not a concatenation (`layout.concat.columns`)
- histogram: example has no drilldown (`interaction.drilldown.key`)
- histogram: motion runs in the client, not in the static SVG (`animation`)
- histogram: client behavior; the static SVG only records intent (`a11y.keyboard`)
- journey: id is a hook, not paint (`id`)
- journey: x values are categories, so format and scale do not apply (`encoding.x.format`)
- journey: example draws no legend (`legend`)
- journey: example is not faceted (`layout.facet.field`)
- journey: example is not a concatenation (`layout.concat.columns`)
- journey: example has no drilldown (`interaction.drilldown.key`)
- journey: motion runs in the client, not in the static SVG (`animation`)
- journey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- boxplot: id is a hook, not paint (`id`)
- boxplot: x values are categories, so format and scale do not apply (`encoding.x.format`)
- boxplot: example has no series on y2 (`axes.y2`)
- boxplot: example draws no legend (`legend`)
- boxplot: example is not faceted (`layout.facet.field`)
- boxplot: example is not a concatenation (`layout.concat.columns`)
- boxplot: example has no drilldown (`interaction.drilldown.key`)
- boxplot: motion runs in the client, not in the static SVG (`animation`)
- boxplot: client behavior; the static SVG only records intent (`a11y.keyboard`)
- timeline: id is a hook, not paint (`id`)
- timeline: x values are categories, so format and scale do not apply (`encoding.x.format`)
- timeline: example is not an OHLC series (`encoding.open.type`)
- timeline: example draws no legend (`legend`)
- timeline: example is not faceted (`layout.facet.field`)
- timeline: example is not a concatenation (`layout.concat.columns`)
- timeline: example has no drilldown (`interaction.drilldown.key`)
- timeline: motion runs in the client, not in the static SVG (`animation`)
- timeline: client behavior; the static SVG only records intent (`a11y.keyboard`)
- strip: id is a hook, not paint (`id`)
- strip: probe value makes the spec invalid (`encoding.x`)
- strip: x values are categories, so format and scale do not apply (`encoding.x.format`)
- strip: example has no series on y2 (`axes.y2`)
- strip: example is not faceted (`layout.facet.field`)
- strip: example is not a concatenation (`layout.concat.columns`)
- strip: example has no drilldown (`interaction.drilldown.key`)
- strip: motion runs in the client, not in the static SVG (`animation`)
- strip: client behavior; the static SVG only records intent (`a11y.keyboard`)
- kpi: id is a hook, not paint (`id`)
- kpi: example is not faceted (`layout.facet.field`)
- kpi: example is not a concatenation (`layout.concat.columns`)
- kpi: example has no drilldown (`interaction.drilldown.key`)
- kpi: motion runs in the client, not in the static SVG (`animation`)
- kpi: client behavior; the static SVG only records intent (`a11y.keyboard`)
- spike: id is a hook, not paint (`id`)
- spike: probe value makes the spec invalid (`encoding.y`)
- spike: example has no series on y2 (`axes.y2`)
- spike: example draws no legend (`legend`)
- spike: example is not faceted (`layout.facet.field`)
- spike: example is not a concatenation (`layout.concat.columns`)
- spike: example has no drilldown (`interaction.drilldown.key`)
- spike: motion runs in the client, not in the static SVG (`animation`)
- spike: client behavior; the static SVG only records intent (`a11y.keyboard`)
- venn: id is a hook, not paint (`id`)
- venn: example draws no legend (`legend`)
- venn: example is not faceted (`layout.facet.field`)
- venn: example is not a concatenation (`layout.concat.columns`)
- venn: example has no drilldown (`interaction.drilldown.key`)
- venn: motion runs in the client, not in the static SVG (`animation`)
- venn: client behavior; the static SVG only records intent (`a11y.keyboard`)
- treemap: id is a hook, not paint (`id`)
- treemap: x values are categories, so format and scale do not apply (`encoding.x.format`)
- treemap: probe value makes the spec invalid (`encoding.y`)
- treemap: example is not faceted (`layout.facet.field`)
- treemap: example is not a concatenation (`layout.concat.columns`)
- treemap: example has no drilldown (`interaction.drilldown.key`)
- treemap: motion runs in the client, not in the static SVG (`animation`)
- treemap: client behavior; the static SVG only records intent (`a11y.keyboard`)
- errorbar: id is a hook, not paint (`id`)
- errorbar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- errorbar: example is not an OHLC series (`encoding.high.type`)
- errorbar: example has no series on y2 (`axes.y2`)
- errorbar: example draws no legend (`legend`)
- errorbar: example is not faceted (`layout.facet.field`)
- errorbar: example is not a concatenation (`layout.concat.columns`)
- errorbar: example has no drilldown (`interaction.drilldown.key`)
- errorbar: motion runs in the client, not in the static SVG (`animation`)
- errorbar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- sparkline: id is a hook, not paint (`id`)
- sparkline: example is not faceted (`layout.facet.field`)
- sparkline: example is not a concatenation (`layout.concat.columns`)
- sparkline: example has no drilldown (`interaction.drilldown.key`)
- sparkline: motion runs in the client, not in the static SVG (`animation`)
- sparkline: client behavior; the static SVG only records intent (`a11y.keyboard`)
- gantt: id is a hook, not paint (`id`)
- gantt: x values are categories, so format and scale do not apply (`encoding.x.format`)
- gantt: y values are categories, so format and scale do not apply (`encoding.y.format`)
- gantt: example is not an OHLC series (`encoding.open.type`)
- gantt: example draws no legend (`legend`)
- gantt: example is not faceted (`layout.facet.field`)
- gantt: example is not a concatenation (`layout.concat.columns`)
- gantt: example has no drilldown (`interaction.drilldown.key`)
- gantt: motion runs in the client, not in the static SVG (`animation`)
- gantt: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radial-bar: id is a hook, not paint (`id`)
- radial-bar: probe value makes the spec invalid (`encoding.x`)
- radial-bar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- radial-bar: example is not faceted (`layout.facet.field`)
- radial-bar: example is not a concatenation (`layout.concat.columns`)
- radial-bar: example has no drilldown (`interaction.drilldown.key`)
- radial-bar: motion runs in the client, not in the static SVG (`animation`)
- radial-bar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- rose: id is a hook, not paint (`id`)
- rose: probe value makes the spec invalid (`encoding.x`)
- rose: x values are categories, so format and scale do not apply (`encoding.x.format`)
- rose: example draws no legend (`legend`)
- rose: example is not faceted (`layout.facet.field`)
- rose: example is not a concatenation (`layout.concat.columns`)
- rose: example has no drilldown (`interaction.drilldown.key`)
- rose: motion runs in the client, not in the static SVG (`animation`)
- rose: client behavior; the static SVG only records intent (`a11y.keyboard`)
- sankey: id is a hook, not paint (`id`)
- sankey: probe value makes the spec invalid (`encoding.y`)
- sankey: example has no color field (`encoding.color`)
- sankey: example draws no legend (`legend`)
- sankey: example is not faceted (`layout.facet.field`)
- sankey: example is not a concatenation (`layout.concat.columns`)
- sankey: example has no drilldown (`interaction.drilldown.key`)
- sankey: motion runs in the client, not in the static SVG (`animation`)
- sankey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- stacked-area: id is a hook, not paint (`id`)
- stacked-area: x values are categories, so format and scale do not apply (`encoding.x.format`)
- stacked-area: example has no series on y2 (`axes.y2`)
- stacked-area: example is not faceted (`layout.facet.field`)
- stacked-area: example is not a concatenation (`layout.concat.columns`)
- stacked-area: example has no drilldown (`interaction.drilldown.key`)
- stacked-area: motion runs in the client, not in the static SVG (`animation`)
- stacked-area: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radar: id is a hook, not paint (`id`)
- radar: probe value makes the spec invalid (`encoding.x`)
- radar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- radar: example is not faceted (`layout.facet.field`)
- radar: example is not a concatenation (`layout.concat.columns`)
- radar: example has no drilldown (`interaction.drilldown.key`)
- radar: motion runs in the client, not in the static SVG (`animation`)
- radar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- combo: id is a hook, not paint (`id`)
- combo: x values are categories, so format and scale do not apply (`encoding.x.format`)
- combo: example is not faceted (`layout.facet.field`)
- combo: example is not a concatenation (`layout.concat.columns`)
- combo: example has no drilldown (`interaction.drilldown.key`)
- combo: motion runs in the client, not in the static SVG (`animation`)
- combo: client behavior; the static SVG only records intent (`a11y.keyboard`)
- quadrant: id is a hook, not paint (`id`)
- quadrant: example draws no legend (`legend`)
- quadrant: example is not faceted (`layout.facet.field`)
- quadrant: example is not a concatenation (`layout.concat.columns`)
- quadrant: example has no drilldown (`interaction.drilldown.key`)
- quadrant: motion runs in the client, not in the static SVG (`animation`)
- quadrant: client behavior; the static SVG only records intent (`a11y.keyboard`)
- waterfall: id is a hook, not paint (`id`)
- waterfall: x values are categories, so format and scale do not apply (`encoding.x.format`)
- waterfall: probe value makes the spec invalid (`encoding.y`)
- waterfall: example has no series on y2 (`axes.y2`)
- waterfall: example draws no legend (`legend`)
- waterfall: example is not faceted (`layout.facet.field`)
- waterfall: example is not a concatenation (`layout.concat.columns`)
- waterfall: example has no drilldown (`interaction.drilldown.key`)
- waterfall: motion runs in the client, not in the static SVG (`animation`)
- waterfall: client behavior; the static SVG only records intent (`a11y.keyboard`)
- line: id is a hook, not paint (`id`)
- line: x values are categories, so format and scale do not apply (`encoding.x.format`)
- line: example rows have no spare series column (`encoding.series`)
- line: example has no color field (`encoding.color`)
- line: example has no series on y2 (`axes.y2`)
- line: example draws no legend (`legend`)
- line: example is not faceted (`layout.facet.field`)
- line: example is not a concatenation (`layout.concat.columns`)
- line: example has no drilldown (`interaction.drilldown.key`)
- line: motion runs in the client, not in the static SVG (`animation`)
- line: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bullet: id is a hook, not paint (`id`)
- bullet: x values are categories, so format and scale do not apply (`encoding.x.format`)
- bullet: probe value makes the spec invalid (`encoding.y`)
- bullet: example draws no legend (`legend`)
- bullet: example is not faceted (`layout.facet.field`)
- bullet: example is not a concatenation (`layout.concat.columns`)
- bullet: example has no drilldown (`interaction.drilldown.key`)
- bullet: motion runs in the client, not in the static SVG (`animation`)
- bullet: client behavior; the static SVG only records intent (`a11y.keyboard`)
- area-range: id is a hook, not paint (`id`)
- area-range: x values are categories, so format and scale do not apply (`encoding.x.format`)
- area-range: example is not an OHLC series (`encoding.high.type`)
- area-range: example has no series on y2 (`axes.y2`)
- area-range: example draws no legend (`legend`)
- area-range: example is not faceted (`layout.facet.field`)
- area-range: example is not a concatenation (`layout.concat.columns`)
- area-range: example has no drilldown (`interaction.drilldown.key`)
- area-range: motion runs in the client, not in the static SVG (`animation`)
- area-range: client behavior; the static SVG only records intent (`a11y.keyboard`)
- mini-area: id is a hook, not paint (`id`)
- mini-area: example is not faceted (`layout.facet.field`)
- mini-area: example is not a concatenation (`layout.concat.columns`)
- mini-area: example has no drilldown (`interaction.drilldown.key`)
- mini-area: motion runs in the client, not in the static SVG (`animation`)
- mini-area: client behavior; the static SVG only records intent (`a11y.keyboard`)
- funnel: id is a hook, not paint (`id`)
- funnel: x values are categories, so format and scale do not apply (`encoding.x.format`)
- funnel: probe value makes the spec invalid (`encoding.y`)
- funnel: example has no color field (`encoding.color.type`)
- funnel: example draws no legend (`legend`)
- funnel: example is not faceted (`layout.facet.field`)
- funnel: example is not a concatenation (`layout.concat.columns`)
- funnel: example has no drilldown (`interaction.drilldown.key`)
- funnel: motion runs in the client, not in the static SVG (`animation`)
- funnel: client behavior; the static SVG only records intent (`a11y.keyboard`)
- progress-ring: probe value makes the spec invalid (`type`)
- progress-ring: id is a hook, not paint (`id`)
- progress-ring: example draws no legend (`legend`)
- progress-ring: example is not faceted (`layout.facet.field`)
- progress-ring: example is not a concatenation (`layout.concat.columns`)
- progress-ring: example has no drilldown (`interaction.drilldown.key`)
- progress-ring: motion runs in the client, not in the static SVG (`animation`)
- progress-ring: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar-range: id is a hook, not paint (`id`)
- bar-range: x values are categories, so format and scale do not apply (`encoding.x.format`)
- bar-range: example is not an OHLC series (`encoding.high.type`)
- bar-range: example has no series on y2 (`axes.y2`)
- bar-range: example draws no legend (`legend`)
- bar-range: example is not faceted (`layout.facet.field`)
- bar-range: example is not a concatenation (`layout.concat.columns`)
- bar-range: example has no drilldown (`interaction.drilldown.key`)
- bar-range: motion runs in the client, not in the static SVG (`animation`)
- bar-range: client behavior; the static SVG only records intent (`a11y.keyboard`)
- candlestick: id is a hook, not paint (`id`)
- candlestick: x values are categories, so format and scale do not apply (`encoding.x.format`)
- candlestick: probe value makes the spec invalid (`encoding.open`)
- candlestick: example is not an OHLC series (`encoding.open.type`)
- candlestick: example has no series on y2 (`axes.y2`)
- candlestick: example draws no legend (`legend`)
- candlestick: example is not faceted (`layout.facet.field`)
- candlestick: example is not a concatenation (`layout.concat.columns`)
- candlestick: example has no drilldown (`interaction.drilldown.key`)
- candlestick: motion runs in the client, not in the static SVG (`animation`)
- candlestick: client behavior; the static SVG only records intent (`a11y.keyboard`)
- scatter: id is a hook, not paint (`id`)
- scatter: probe value makes the spec invalid (`encoding.x`)
- scatter: example has no color field (`encoding.color`)
- scatter: example has no series on y2 (`axes.y2`)
- scatter: example draws no legend (`legend`)
- scatter: example is not faceted (`layout.facet.field`)
- scatter: example is not a concatenation (`layout.concat.columns`)
- scatter: example has no drilldown (`interaction.drilldown.key`)
- scatter: motion runs in the client, not in the static SVG (`animation`)
- scatter: client behavior; the static SVG only records intent (`a11y.keyboard`)
