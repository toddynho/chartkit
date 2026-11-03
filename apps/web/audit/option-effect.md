# Option effect audit

The playground preview used to assign `innerHTML` to the SVG string from `render()`. That string can record `data-ck-intent`, but nothing listens for the pointer. Docs charts call `mount()` from `@chartkitdev/vanilla`, which attaches the interactive runtime. The playground now does the same, and destroys the previous mount before the next paint. On “Deploys, step curve”, hovering the line shows a tooltip (`Wed / Deploys / 6`); turning tooltip off removes it.

`data-ck-intent` is stripped before the SVG diff, so an attribute-only change is not counted as a visible effect. Hover probes use the real `mount()`.

Class (a) rows are zero after that fix. Class (c) is zero: the catalog’s `appliesTo` / `MARK_APPLIES` filter already hides options that belong to other chart types. What remains is either ignored by the renderer (b) or impossible for that example’s data (d).

One core bug this audit isolates, and does not fix here: extra charts (histogram, strip, treemap, sankey, and the other phase-3 types) still show a mark tooltip when `tooltip` or `interaction.hover` is off. `extra-tip` does not read the spec. Line, bar, area, and scatter honor the switch through `interact`.

Probed 6649 option writes across 33 chart types. 1329 changed the SVG. Remaining rows are classified below.

- (a) playground wiring: 0
- (b) core ignores a listed option: 2199
- (c) catalog scope too wide: 0
- (d) no-op for this example: 2838

## By chart type

### strip (132)

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
- … 120 more

### scatter (127)

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
- … 115 more

### spike (110)

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
- … 98 more

### histogram (108)

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
- … 96 more

### errorbar (102)

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
- … 90 more

### quadrant (92)

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
- … 80 more

### boxplot (85)

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
- … 73 more

### area-range (83)

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
- … 71 more

### bar-range (83)

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
- … 71 more

### sankey (82)

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
- … 70 more

### waterfall (82)

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
- … 70 more

### gantt (81)

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
- … 69 more

### treemap (78)

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

### radar (74)

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
- … 62 more

### combo (69)

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
- … 57 more

### candlestick (68)

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
- … 56 more

### bullet (67)

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
- … 55 more

### stacked-area (61)

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
- … 49 more

### bar (60)

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
- … 48 more

### heatmap (57)

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
- … 45 more

### donut (48)

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
- … 36 more

### timeline (47)

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
- … 35 more

### rose (46)

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
- … 34 more

### funnel (46)

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

### journey (45)

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
- … 33 more

### line (42)

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
- … 30 more

### gauge (39)

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
- … 27 more

### progress-ring (38)

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
- … 26 more

### radial-bar (37)

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
- … 25 more

### kpi (31)

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
- … 19 more

### venn (29)

- **b** `headline.label` — spec changed and the rendered SVG did not
- **b** `headline.value` — spec changed and the rendered SVG did not
- **b** `headline.compare` — spec changed and the rendered SVG did not
- **b** `headline.delta` — spec changed and the rendered SVG did not
- **b** `headline.tone` — spec changed and the rendered SVG did not
- **b** `tooltip` — mounted chart still shows a tooltip when the option is off
- **b** `theme.brand` — spec changed and the rendered SVG did not
- **b** `theme.tokens.grid` — spec changed and the rendered SVG did not
- **b** `theme.tokens.axis` — spec changed and the rendered SVG did not
- **b** `theme.tokens.accent` — spec changed and the rendered SVG did not
- **b** `theme.tokens.positive` — spec changed and the rendered SVG did not
- **b** `theme.tokens.negative` — spec changed and the rendered SVG did not
- … 17 more

### sparkline (25)

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
- … 13 more

### mini-area (25)

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
- … 13 more

## Example-only no-ops

These changed the spec and not the picture, and the example data cannot exercise them.

- heatmap: id is a hook, not paint (`id`)
- heatmap: probe value makes the spec invalid (`encoding.x`)
- heatmap: example rows have no spare series column (`encoding.series`)
- heatmap: example draws no legend (`legend`)
- heatmap: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- heatmap: example is not faceted (`layout.facet.field`)
- heatmap: example is not a concatenation (`layout.concat.columns`)
- heatmap: this example does not show a hover tooltip to change (`interaction.select`)
- heatmap: example has no drilldown (`interaction.drilldown.key`)
- heatmap: motion runs in the client, not in the static SVG (`animation`)
- heatmap: client behavior; the static SVG only records intent (`a11y.keyboard`)
- donut: id is a hook, not paint (`id`)
- donut: x values are categories, so format and scale do not apply (`encoding.x.format`)
- donut: probe value makes the spec invalid (`encoding.y`)
- donut: example rows have no spare series column (`encoding.series`)
- donut: example has no color field (`encoding.color.type`)
- donut: this example does not show a hover tooltip to change (`legend.interactive`)
- donut: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- donut: example is not faceted (`layout.facet.field`)
- donut: example is not a concatenation (`layout.concat.columns`)
- donut: example has no drilldown (`interaction.drilldown.key`)
- donut: motion runs in the client, not in the static SVG (`animation`)
- donut: client behavior; the static SVG only records intent (`a11y.keyboard`)
- gauge: probe value makes the spec invalid (`type`)
- gauge: id is a hook, not paint (`id`)
- gauge: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- gauge: example is not faceted (`layout.facet.field`)
- gauge: example is not a concatenation (`layout.concat.columns`)
- gauge: this example does not show a hover tooltip to change (`interaction.select`)
- gauge: example has no drilldown (`interaction.drilldown.key`)
- gauge: motion runs in the client, not in the static SVG (`animation`)
- gauge: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar: id is a hook, not paint (`id`)
- bar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- bar: example has no series on y2 (`axes.y2`)
- bar: hover tooltip did not change for this example (`legend.interactive`)
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
- histogram: hover tooltip did not change for this example (`interaction.select`)
- histogram: example has no drilldown (`interaction.drilldown.key`)
- histogram: motion runs in the client, not in the static SVG (`animation`)
- histogram: client behavior; the static SVG only records intent (`a11y.keyboard`)
- journey: id is a hook, not paint (`id`)
- journey: x values are categories, so format and scale do not apply (`encoding.x.format`)
- journey: example draws no legend (`legend`)
- journey: example is not faceted (`layout.facet.field`)
- journey: example is not a concatenation (`layout.concat.columns`)
- journey: hover tooltip did not change for this example (`interaction.select`)
- journey: example has no drilldown (`interaction.drilldown.key`)
- journey: motion runs in the client, not in the static SVG (`animation`)
- journey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- boxplot: id is a hook, not paint (`id`)
- boxplot: x values are categories, so format and scale do not apply (`encoding.x.format`)
- boxplot: example has no series on y2 (`axes.y2`)
- boxplot: example draws no legend (`legend`)
- boxplot: example is not faceted (`layout.facet.field`)
- boxplot: example is not a concatenation (`layout.concat.columns`)
- boxplot: hover tooltip did not change for this example (`interaction.select`)
- boxplot: example has no drilldown (`interaction.drilldown.key`)
- boxplot: motion runs in the client, not in the static SVG (`animation`)
- boxplot: client behavior; the static SVG only records intent (`a11y.keyboard`)
- timeline: id is a hook, not paint (`id`)
- timeline: x values are categories, so format and scale do not apply (`encoding.x.format`)
- timeline: example is not an OHLC series (`encoding.open.type`)
- timeline: example draws no legend (`legend`)
- timeline: example is not faceted (`layout.facet.field`)
- timeline: example is not a concatenation (`layout.concat.columns`)
- timeline: hover tooltip did not change for this example (`interaction.select`)
- timeline: example has no drilldown (`interaction.drilldown.key`)
- timeline: motion runs in the client, not in the static SVG (`animation`)
- timeline: client behavior; the static SVG only records intent (`a11y.keyboard`)
- strip: id is a hook, not paint (`id`)
- strip: probe value makes the spec invalid (`encoding.x`)
- strip: x values are categories, so format and scale do not apply (`encoding.x.format`)
- strip: example has no series on y2 (`axes.y2`)
- strip: hover tooltip did not change for this example (`legend.interactive`)
- strip: example is not faceted (`layout.facet.field`)
- strip: example is not a concatenation (`layout.concat.columns`)
- strip: example has no drilldown (`interaction.drilldown.key`)
- strip: motion runs in the client, not in the static SVG (`animation`)
- strip: client behavior; the static SVG only records intent (`a11y.keyboard`)
- kpi: id is a hook, not paint (`id`)
- kpi: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- kpi: example is not faceted (`layout.facet.field`)
- kpi: example is not a concatenation (`layout.concat.columns`)
- kpi: this example does not show a hover tooltip to change (`interaction.select`)
- kpi: example has no drilldown (`interaction.drilldown.key`)
- kpi: motion runs in the client, not in the static SVG (`animation`)
- kpi: client behavior; the static SVG only records intent (`a11y.keyboard`)
- spike: id is a hook, not paint (`id`)
- spike: probe value makes the spec invalid (`encoding.y`)
- spike: example has no series on y2 (`axes.y2`)
- spike: example draws no legend (`legend`)
- spike: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- spike: example is not faceted (`layout.facet.field`)
- spike: example is not a concatenation (`layout.concat.columns`)
- spike: this example does not show a hover tooltip to change (`interaction.select`)
- spike: example has no drilldown (`interaction.drilldown.key`)
- spike: motion runs in the client, not in the static SVG (`animation`)
- spike: client behavior; the static SVG only records intent (`a11y.keyboard`)
- venn: id is a hook, not paint (`id`)
- venn: example draws no legend (`legend`)
- venn: example is not faceted (`layout.facet.field`)
- venn: example is not a concatenation (`layout.concat.columns`)
- venn: hover tooltip did not change for this example (`interaction.select`)
- venn: example has no drilldown (`interaction.drilldown.key`)
- venn: motion runs in the client, not in the static SVG (`animation`)
- venn: client behavior; the static SVG only records intent (`a11y.keyboard`)
- treemap: id is a hook, not paint (`id`)
- treemap: x values are categories, so format and scale do not apply (`encoding.x.format`)
- treemap: probe value makes the spec invalid (`encoding.y`)
- treemap: hover tooltip did not change for this example (`legend.interactive`)
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
- errorbar: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- errorbar: example is not faceted (`layout.facet.field`)
- errorbar: example is not a concatenation (`layout.concat.columns`)
- errorbar: this example does not show a hover tooltip to change (`interaction.select`)
- errorbar: example has no drilldown (`interaction.drilldown.key`)
- errorbar: motion runs in the client, not in the static SVG (`animation`)
- errorbar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- sparkline: id is a hook, not paint (`id`)
- sparkline: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- sparkline: example is not faceted (`layout.facet.field`)
- sparkline: example is not a concatenation (`layout.concat.columns`)
- sparkline: this example does not show a hover tooltip to change (`interaction.select`)
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
- gantt: hover tooltip did not change for this example (`interaction.select`)
- gantt: example has no drilldown (`interaction.drilldown.key`)
- gantt: motion runs in the client, not in the static SVG (`animation`)
- gantt: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radial-bar: id is a hook, not paint (`id`)
- radial-bar: probe value makes the spec invalid (`encoding.x`)
- radial-bar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- radial-bar: hover tooltip did not change for this example (`legend.interactive`)
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
- rose: hover tooltip did not change for this example (`interaction.select`)
- rose: example has no drilldown (`interaction.drilldown.key`)
- rose: motion runs in the client, not in the static SVG (`animation`)
- rose: client behavior; the static SVG only records intent (`a11y.keyboard`)
- sankey: id is a hook, not paint (`id`)
- sankey: probe value makes the spec invalid (`encoding.y`)
- sankey: example has no color field (`encoding.color`)
- sankey: example draws no legend (`legend`)
- sankey: example is not faceted (`layout.facet.field`)
- sankey: example is not a concatenation (`layout.concat.columns`)
- sankey: hover tooltip did not change for this example (`interaction.select`)
- sankey: example has no drilldown (`interaction.drilldown.key`)
- sankey: motion runs in the client, not in the static SVG (`animation`)
- sankey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- stacked-area: id is a hook, not paint (`id`)
- stacked-area: x values are categories, so format and scale do not apply (`encoding.x.format`)
- stacked-area: example has no series on y2 (`axes.y2`)
- stacked-area: hover tooltip did not change for this example (`legend.interactive`)
- stacked-area: example is not faceted (`layout.facet.field`)
- stacked-area: example is not a concatenation (`layout.concat.columns`)
- stacked-area: example has no drilldown (`interaction.drilldown.key`)
- stacked-area: motion runs in the client, not in the static SVG (`animation`)
- stacked-area: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radar: id is a hook, not paint (`id`)
- radar: probe value makes the spec invalid (`encoding.x`)
- radar: x values are categories, so format and scale do not apply (`encoding.x.format`)
- radar: hover tooltip did not change for this example (`legend.interactive`)
- radar: example is not faceted (`layout.facet.field`)
- radar: example is not a concatenation (`layout.concat.columns`)
- radar: example has no drilldown (`interaction.drilldown.key`)
- radar: motion runs in the client, not in the static SVG (`animation`)
- radar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- combo: id is a hook, not paint (`id`)
- combo: x values are categories, so format and scale do not apply (`encoding.x.format`)
- combo: hover tooltip did not change for this example (`legend.interactive`)
- combo: example is not faceted (`layout.facet.field`)
- combo: example is not a concatenation (`layout.concat.columns`)
- combo: example has no drilldown (`interaction.drilldown.key`)
- combo: motion runs in the client, not in the static SVG (`animation`)
- combo: client behavior; the static SVG only records intent (`a11y.keyboard`)
- quadrant: id is a hook, not paint (`id`)
- quadrant: example draws no legend (`legend`)
- quadrant: example is not faceted (`layout.facet.field`)
- quadrant: example is not a concatenation (`layout.concat.columns`)
- quadrant: hover tooltip did not change for this example (`interaction.select`)
- quadrant: example has no drilldown (`interaction.drilldown.key`)
- quadrant: motion runs in the client, not in the static SVG (`animation`)
- quadrant: client behavior; the static SVG only records intent (`a11y.keyboard`)
- waterfall: id is a hook, not paint (`id`)
- waterfall: x values are categories, so format and scale do not apply (`encoding.x.format`)
- waterfall: probe value makes the spec invalid (`encoding.y`)
- waterfall: example has no series on y2 (`axes.y2`)
- waterfall: example draws no legend (`legend`)
- waterfall: hover tooltip did not change for this example (`tooltip.mode`)
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
- line: hover tooltip did not change for this example (`tooltip.mode`)
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
- bullet: hover tooltip did not change for this example (`interaction.select`)
- bullet: example has no drilldown (`interaction.drilldown.key`)
- bullet: motion runs in the client, not in the static SVG (`animation`)
- bullet: client behavior; the static SVG only records intent (`a11y.keyboard`)
- area-range: id is a hook, not paint (`id`)
- area-range: x values are categories, so format and scale do not apply (`encoding.x.format`)
- area-range: example is not an OHLC series (`encoding.high.type`)
- area-range: example has no series on y2 (`axes.y2`)
- area-range: example draws no legend (`legend`)
- area-range: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- area-range: example is not faceted (`layout.facet.field`)
- area-range: example is not a concatenation (`layout.concat.columns`)
- area-range: this example does not show a hover tooltip to change (`interaction.select`)
- area-range: example has no drilldown (`interaction.drilldown.key`)
- area-range: motion runs in the client, not in the static SVG (`animation`)
- area-range: client behavior; the static SVG only records intent (`a11y.keyboard`)
- mini-area: id is a hook, not paint (`id`)
- mini-area: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- mini-area: example is not faceted (`layout.facet.field`)
- mini-area: example is not a concatenation (`layout.concat.columns`)
- mini-area: this example does not show a hover tooltip to change (`interaction.select`)
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
- funnel: hover tooltip did not change for this example (`interaction.select`)
- funnel: example has no drilldown (`interaction.drilldown.key`)
- funnel: motion runs in the client, not in the static SVG (`animation`)
- funnel: client behavior; the static SVG only records intent (`a11y.keyboard`)
- progress-ring: probe value makes the spec invalid (`type`)
- progress-ring: id is a hook, not paint (`id`)
- progress-ring: example draws no legend (`legend`)
- progress-ring: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- progress-ring: example is not faceted (`layout.facet.field`)
- progress-ring: example is not a concatenation (`layout.concat.columns`)
- progress-ring: this example does not show a hover tooltip to change (`interaction.select`)
- progress-ring: example has no drilldown (`interaction.drilldown.key`)
- progress-ring: motion runs in the client, not in the static SVG (`animation`)
- progress-ring: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar-range: id is a hook, not paint (`id`)
- bar-range: x values are categories, so format and scale do not apply (`encoding.x.format`)
- bar-range: example is not an OHLC series (`encoding.high.type`)
- bar-range: example has no series on y2 (`axes.y2`)
- bar-range: example draws no legend (`legend`)
- bar-range: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- bar-range: this example does not show a hover tooltip to change (`tooltip.template`)
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
- candlestick: hover did not land on a mark, so the tooltip could not be compared (`tooltip`)
- candlestick: example is not faceted (`layout.facet.field`)
- candlestick: example is not a concatenation (`layout.concat.columns`)
- candlestick: this example does not show a hover tooltip to change (`interaction.select`)
- candlestick: example has no drilldown (`interaction.drilldown.key`)
- candlestick: motion runs in the client, not in the static SVG (`animation`)
- candlestick: client behavior; the static SVG only records intent (`a11y.keyboard`)
- scatter: id is a hook, not paint (`id`)
- scatter: probe value makes the spec invalid (`encoding.x`)
- scatter: example has no color field (`encoding.color`)
- scatter: example has no series on y2 (`axes.y2`)
- scatter: example draws no legend (`legend`)
- scatter: hover tooltip did not change for this example (`tooltip.mode`)
- scatter: example is not faceted (`layout.facet.field`)
- scatter: example is not a concatenation (`layout.concat.columns`)
- scatter: example has no drilldown (`interaction.drilldown.key`)
- scatter: motion runs in the client, not in the static SVG (`animation`)
- scatter: client behavior; the static SVG only records intent (`a11y.keyboard`)
