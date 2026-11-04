# Option effect audit

Class (a) is a playground wiring bug. The preview used to assign a static SVG and never call mount(), so tooltip, crosshair, legend toggle, and hover could not run. That is fixed in the playground by mounting @chartkitdev/vanilla. Rows here are what remains after that mount is used for the hover probe.

Probed 5732 option writes across 34 chart types. 2185 changed the SVG. Remaining rows are classified below.

- (a) playground wiring: 0
- (b) core ignores a listed option: 696
- (c) catalog scope too wide: 0
- (d) no-op for this example: 2290

## By chart type

### spike (62)

- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.format` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.x.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.reverse` — spec changed and the rendered SVG did not
- … 50 more

### errorbar (56)

- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.error` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.pointSize` — spec changed and the rendered SVG did not
- **b** `encoding.error` — spec changed and the rendered SVG did not
- … 44 more

### scatter (55)

- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.color` — spec changed and the rendered SVG did not
- **b** `encoding.y.pointSize` — spec changed and the rendered SVG did not
- **b** `encoding.y.z` — spec changed and the rendered SVG did not
- **b** `encoding.series` — spec changed and the rendered SVG did not
- … 43 more

### strip (53)

- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.value` — spec changed and the rendered SVG did not
- **b** `encoding.label` — spec changed and the rendered SVG did not
- **b** `encoding.label.type` — spec changed and the rendered SVG did not
- **b** `encoding.label.title` — spec changed and the rendered SVG did not
- **b** `encoding.label.format` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.label.format.specifier` — spec changed and the rendered SVG did not
- … 41 more

### histogram (51)

- **b** `encoding.x.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.padding` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.padding.min` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.padding.max` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.x.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- … 39 more

### bar-range (47)

- **b** `encoding.y` — spec changed and the rendered SVG did not
- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.format` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.y.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- … 35 more

### boxplot (40)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `mark.cornerRadius` — spec changed and the rendered SVG did not
- **b** `axes.x.grid` — spec changed and the rendered SVG did not
- **b** `axes.x.labels` — spec changed and the rendered SVG did not
- **b** `axes.x.position` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- … 28 more

### area-range (39)

- **b** `encoding.y.lo` — spec changed and the rendered SVG did not
- **b** `encoding.y.hi` — spec changed and the rendered SVG did not
- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `mark.line` — spec changed and the rendered SVG did not
- **b** `axes.x.grid` — spec changed and the rendered SVG did not
- **b** `axes.x.labels` — spec changed and the rendered SVG did not
- … 27 more

### gantt (38)

- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.value` — spec changed and the rendered SVG did not
- **b** `encoding.source.type` — spec changed and the rendered SVG did not
- **b** `encoding.source.title` — spec changed and the rendered SVG did not
- **b** `encoding.source.format` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.source.scale.type` — spec changed and the rendered SVG did not
- … 26 more

### sankey (37)

- **b** `encoding.source.type` — spec changed and the rendered SVG did not
- **b** `encoding.source.title` — spec changed and the rendered SVG did not
- **b** `encoding.source.format` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.source.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.source.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.source.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.source.scale.nice` — spec changed and the rendered SVG did not
- … 25 more

### waterfall (37)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `mark.cornerRadius` — spec changed and the rendered SVG did not
- **b** `axes.x.grid` — spec changed and the rendered SVG did not
- **b** `axes.x.labels` — spec changed and the rendered SVG did not
- **b** `axes.x.position` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- … 25 more

### candlestick (29)

- **b** `axes.x.grid` — spec changed and the rendered SVG did not
- **b** `axes.x.labels` — spec changed and the rendered SVG did not
- **b** `axes.x.position` — spec changed and the rendered SVG did not
- **b** `axes.x.labelWidth` — spec changed and the rendered SVG did not
- **b** `axes.x.labelLines` — spec changed and the rendered SVG did not
- **b** `axes.x.line` — spec changed and the rendered SVG did not
- **b** `axes.x.line.color` — spec changed and the rendered SVG did not
- **b** `axes.x.line.width` — spec changed and the rendered SVG did not
- **b** `axes.x.line.dash` — spec changed and the rendered SVG did not
- **b** `axes.x.tickMarks` — spec changed and the rendered SVG did not
- **b** `axes.x.tickLength` — spec changed and the rendered SVG did not
- **b** `axes.x.rotate` — spec changed and the rendered SVG did not
- … 17 more

### treemap (22)

- **b** `encoding.color.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.format` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.color.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.nice` — spec changed and the rendered SVG did not
- … 10 more

### bullet (22)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding.min` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding.max` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.target.type` — spec changed and the rendered SVG did not
- **b** `encoding.target.title` — spec changed and the rendered SVG did not
- … 10 more

### quadrant (21)

- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.value` — spec changed and the rendered SVG did not
- **b** `encoding.size.type` — spec changed and the rendered SVG did not
- **b** `encoding.size.title` — spec changed and the rendered SVG did not
- **b** `encoding.size.format` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.decimals` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.currency` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.prefix` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.suffix` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.signed` — spec changed and the rendered SVG did not
- **b** `encoding.size.format.specifier` — spec changed and the rendered SVG did not
- **b** `encoding.size.scale.type` — spec changed and the rendered SVG did not
- … 9 more

### rose (13)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding.min` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.padding.max` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `mark.cornerRadius` — spec changed and the rendered SVG did not
- **b** `mark.gap` — spec changed and the rendered SVG did not
- … 1 more

### line (12)

- **b** `encoding.y.type` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.clamp` — spec changed and the rendered SVG did not
- **b** `encoding.y.scale.constant` — spec changed and the rendered SVG did not
- **b** `encoding.y.fillOpacity` — spec changed and the rendered SVG did not
- **b** `encoding.y.stack` — spec changed and the rendered SVG did not
- **b** `encoding.y.z` — spec changed and the rendered SVG did not
- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not
- **b** `mark.baseLabel` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- **b** `axes.y.autoSkip` — spec changed and the rendered SVG did not

### heatmap (10)

- **b** `encoding.color.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.type` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.zero` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.nice` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.reverse` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.midpoint` — spec changed and the rendered SVG did not
- **b** `encoding.color.scale.bins` — spec changed and the rendered SVG did not
- **b** `sort.field` — spec changed and the rendered SVG did not
- **b** `sort.by` — spec changed and the rendered SVG did not
- **b** `sort.order` — spec changed and the rendered SVG did not

### combo (10)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- **b** `axes.y.autoSkip` — spec changed and the rendered SVG did not
- **b** `axes.y2.grid` — spec changed and the rendered SVG did not
- **b** `axes.y2.autoSkip` — spec changed and the rendered SVG did not

### stacked-area (9)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- **b** `axes.y.autoSkip` — spec changed and the rendered SVG did not
- **b** `locale` — spec changed and the rendered SVG did not

### bar (7)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `axes.x.autoSkip` — spec changed and the rendered SVG did not
- **b** `axes.y.autoSkip` — spec changed and the rendered SVG did not
- **b** `layout.coordinate` — spec changed and the rendered SVG did not

### radar (6)

- **b** `encoding.series` — spec changed and the rendered SVG did not
- **b** `encoding.series.title` — spec changed and the rendered SVG did not
- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.value` — spec changed and the rendered SVG did not
- **b** `locale` — spec changed and the rendered SVG did not

### donut (3)

- **b** `mark.other` — spec changed and the rendered SVG did not
- **b** `mark.other.label` — spec changed and the rendered SVG did not
- **b** `layout.coordinate` — spec changed and the rendered SVG did not

### timeline (3)

- **b** `encoding.color` — spec changed and the rendered SVG did not
- **b** `encoding.color.title` — spec changed and the rendered SVG did not
- **b** `encoding.color.value` — spec changed and the rendered SVG did not

### venn (3)

- **b** `sort.field` — spec changed and the rendered SVG did not
- **b** `sort.by` — spec changed and the rendered SVG did not
- **b** `sort.order` — spec changed and the rendered SVG did not

### bar-list (3)

- **b** `theme.tokens.fontSize` — spec changed and the rendered SVG did not
- **b** `layout.direction` — spec changed and the rendered SVG did not
- **b** `interaction.sync` — spec changed and the rendered SVG did not

### gauge (2)

- **b** `metric.format.decimals` — spec changed and the rendered SVG did not
- **b** `metric.format.currency` — spec changed and the rendered SVG did not

### sparkline (2)

- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not

### mini-area (2)

- **b** `mark.sampling` — spec changed and the rendered SVG did not
- **b** `mark.connectNulls` — spec changed and the rendered SVG did not

### kpi (1)

- **b** `metric.format.currency` — spec changed and the rendered SVG did not

### radial-bar (1)

- **b** `layout.coordinate` — spec changed and the rendered SVG did not

## Example-only no-ops

These changed the spec and not the picture, and the example data cannot exercise them.

- heatmap: id is a hook, not paint (`id`)
- heatmap: probe value makes the spec invalid (`encoding.x`)
- heatmap: example rows have no spare series column (`encoding.series`)
- heatmap: example draws no legend (`legend`)
- heatmap: example does not paint this token (`theme.tokens.text`)
- heatmap: example is not faceted (`layout.facet.field`)
- heatmap: example is not a concatenation (`layout.concat.columns`)
- heatmap: example has no drilldown (`interaction.drilldown.key`)
- heatmap: motion runs in the client, not in the static SVG (`animation`)
- heatmap: client behavior; the static SVG only records intent (`a11y.keyboard`)
- donut: id is a hook, not paint (`id`)
- donut: probe value makes the spec invalid (`encoding.y`)
- donut: example rows have no spare series column (`encoding.series`)
- donut: example has no color field (`encoding.color.title`)
- donut: example does not paint this token (`theme.tokens.muted`)
- donut: example is not faceted (`layout.facet.field`)
- donut: example is not a concatenation (`layout.concat.columns`)
- donut: example has no drilldown (`interaction.drilldown.key`)
- donut: motion runs in the client, not in the static SVG (`animation`)
- donut: client behavior; the static SVG only records intent (`a11y.keyboard`)
- gauge: probe value makes the spec invalid (`type`)
- gauge: id is a hook, not paint (`id`)
- gauge: example has no subtitle (`subtitle`)
- gauge: example has no metric.delta (`metric.delta`)
- gauge: example has no metric.deltaFormat (`metric.deltaFormat`)
- gauge: example has no metric.goodDirection (`metric.goodDirection`)
- gauge: example does not paint this token (`theme.tokens.text`)
- gauge: example is not faceted (`layout.facet.field`)
- gauge: example is not a concatenation (`layout.concat.columns`)
- gauge: example has no drilldown (`interaction.drilldown.key`)
- gauge: motion runs in the client, not in the static SVG (`animation`)
- gauge: example has no column whose order can change (`sort.field`)
- gauge: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar: id is a hook, not paint (`id`)
- bar: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- bar: example has no series on y2 (`axes.y2`)
- bar: example does not paint this token (`theme.tokens.axis`)
- bar: example is not faceted (`layout.facet.field`)
- bar: example is not a concatenation (`layout.concat.columns`)
- bar: example has no drilldown (`interaction.drilldown.key`)
- bar: motion runs in the client, not in the static SVG (`animation`)
- bar: x values are categories, so timezone does not apply (`timezone`)
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
- journey: example draws no legend (`legend`)
- journey: example is not faceted (`layout.facet.field`)
- journey: example is not a concatenation (`layout.concat.columns`)
- journey: example has no drilldown (`interaction.drilldown.key`)
- journey: motion runs in the client, not in the static SVG (`animation`)
- journey: example does not format 1234.5 (`locale`)
- journey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- boxplot: id is a hook, not paint (`id`)
- boxplot: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- boxplot: example has no series on y2 (`axes.y2`)
- boxplot: example draws no legend (`legend`)
- boxplot: example is not faceted (`layout.facet.field`)
- boxplot: example is not a concatenation (`layout.concat.columns`)
- boxplot: example has no drilldown (`interaction.drilldown.key`)
- boxplot: motion runs in the client, not in the static SVG (`animation`)
- boxplot: client behavior; the static SVG only records intent (`a11y.keyboard`)
- timeline: id is a hook, not paint (`id`)
- timeline: example is not an OHLC series (`encoding.open.type`)
- timeline: example draws no legend (`legend`)
- timeline: example is not faceted (`layout.facet.field`)
- timeline: example is not a concatenation (`layout.concat.columns`)
- timeline: example has no drilldown (`interaction.drilldown.key`)
- timeline: motion runs in the client, not in the static SVG (`animation`)
- timeline: example has no number to format (`locale`)
- timeline: client behavior; the static SVG only records intent (`a11y.keyboard`)
- strip: id is a hook, not paint (`id`)
- strip: probe value makes the spec invalid (`encoding.x`)
- strip: x values are categories, so type, format, and scale do not apply (`encoding.x.type`)
- strip: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- strip: example has no series on y2 (`axes.y2`)
- strip: example does not paint this token (`theme.tokens.axis`)
- strip: example is not faceted (`layout.facet.field`)
- strip: example is not a concatenation (`layout.concat.columns`)
- strip: example has no drilldown (`interaction.drilldown.key`)
- strip: motion runs in the client, not in the static SVG (`animation`)
- strip: client behavior; the static SVG only records intent (`a11y.keyboard`)
- kpi: id is a hook, not paint (`id`)
- kpi: example has no subtitle (`subtitle`)
- kpi: example has no metric.min (`metric.min`)
- kpi: example has no metric.max (`metric.max`)
- kpi: example has no metric.target (`metric.target`)
- kpi: example does not paint this token (`theme.tokens.negative`)
- kpi: example is not faceted (`layout.facet.field`)
- kpi: example is not a concatenation (`layout.concat.columns`)
- kpi: example has no drilldown (`interaction.drilldown.key`)
- kpi: motion runs in the client, not in the static SVG (`animation`)
- kpi: example has no column whose order can change (`sort.field`)
- kpi: client behavior; the static SVG only records intent (`a11y.keyboard`)
- spike: id is a hook, not paint (`id`)
- spike: probe value makes the spec invalid (`encoding.y`)
- spike: example has no series on y2 (`axes.y2`)
- spike: example draws no legend (`legend`)
- spike: example does not paint this token (`theme.tokens.text`)
- spike: example is not faceted (`layout.facet.field`)
- spike: example is not a concatenation (`layout.concat.columns`)
- spike: example has no drilldown (`interaction.drilldown.key`)
- spike: motion runs in the client, not in the static SVG (`animation`)
- spike: x values are categories, so timezone does not apply (`timezone`)
- spike: client behavior; the static SVG only records intent (`a11y.keyboard`)
- venn: id is a hook, not paint (`id`)
- venn: example draws no legend (`legend`)
- venn: example is not faceted (`layout.facet.field`)
- venn: example is not a concatenation (`layout.concat.columns`)
- venn: example has no drilldown (`interaction.drilldown.key`)
- venn: motion runs in the client, not in the static SVG (`animation`)
- venn: example does not format 1234.5 (`locale`)
- venn: client behavior; the static SVG only records intent (`a11y.keyboard`)
- treemap: id is a hook, not paint (`id`)
- treemap: probe value makes the spec invalid (`encoding.y`)
- treemap: example does not paint this token (`theme.tokens.muted`)
- treemap: example is not faceted (`layout.facet.field`)
- treemap: example is not a concatenation (`layout.concat.columns`)
- treemap: example has no drilldown (`interaction.drilldown.key`)
- treemap: motion runs in the client, not in the static SVG (`animation`)
- treemap: client behavior; the static SVG only records intent (`a11y.keyboard`)
- errorbar: id is a hook, not paint (`id`)
- errorbar: example is not an OHLC series (`encoding.high.type`)
- errorbar: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- errorbar: example has no series on y2 (`axes.y2`)
- errorbar: example draws no legend (`legend`)
- errorbar: example is not faceted (`layout.facet.field`)
- errorbar: example is not a concatenation (`layout.concat.columns`)
- errorbar: example has no drilldown (`interaction.drilldown.key`)
- errorbar: motion runs in the client, not in the static SVG (`animation`)
- errorbar: example has no column whose order can change (`sort.field`)
- errorbar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- sparkline: id is a hook, not paint (`id`)
- sparkline: example does not paint this token (`theme.tokens.text`)
- sparkline: example is not faceted (`layout.facet.field`)
- sparkline: example is not a concatenation (`layout.concat.columns`)
- sparkline: example has no drilldown (`interaction.drilldown.key`)
- sparkline: motion runs in the client, not in the static SVG (`animation`)
- sparkline: example has no number to format (`locale`)
- sparkline: x values are categories, so timezone does not apply (`timezone`)
- sparkline: example has no column whose order can change (`sort.field`)
- sparkline: client behavior; the static SVG only records intent (`a11y.keyboard`)
- gantt: id is a hook, not paint (`id`)
- gantt: example is not an OHLC series (`encoding.open.type`)
- gantt: example draws no legend (`legend`)
- gantt: example is not faceted (`layout.facet.field`)
- gantt: example is not a concatenation (`layout.concat.columns`)
- gantt: example has no drilldown (`interaction.drilldown.key`)
- gantt: motion runs in the client, not in the static SVG (`animation`)
- gantt: example does not format 1234.5 (`locale`)
- gantt: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radial-bar: id is a hook, not paint (`id`)
- radial-bar: probe value makes the spec invalid (`encoding.x`)
- radial-bar: example is not faceted (`layout.facet.field`)
- radial-bar: example is not a concatenation (`layout.concat.columns`)
- radial-bar: example has no drilldown (`interaction.drilldown.key`)
- radial-bar: motion runs in the client, not in the static SVG (`animation`)
- radial-bar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- rose: id is a hook, not paint (`id`)
- rose: probe value makes the spec invalid (`encoding.x`)
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
- sankey: example does not paint this token (`theme.tokens.muted`)
- sankey: example is not faceted (`layout.facet.field`)
- sankey: example is not a concatenation (`layout.concat.columns`)
- sankey: example has no drilldown (`interaction.drilldown.key`)
- sankey: motion runs in the client, not in the static SVG (`animation`)
- sankey: client behavior; the static SVG only records intent (`a11y.keyboard`)
- stacked-area: id is a hook, not paint (`id`)
- stacked-area: x values are categories, so type, format, and scale do not apply (`encoding.x.format`)
- stacked-area: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- stacked-area: example has no series on y2 (`axes.y2`)
- stacked-area: example does not paint this token (`theme.tokens.axis`)
- stacked-area: example is not faceted (`layout.facet.field`)
- stacked-area: example is not a concatenation (`layout.concat.columns`)
- stacked-area: example has no drilldown (`interaction.drilldown.key`)
- stacked-area: motion runs in the client, not in the static SVG (`animation`)
- stacked-area: x values are categories, so timezone does not apply (`timezone`)
- stacked-area: client behavior; the static SVG only records intent (`a11y.keyboard`)
- radar: id is a hook, not paint (`id`)
- radar: probe value makes the spec invalid (`encoding.x`)
- radar: example does not paint this token (`theme.tokens.muted`)
- radar: example is not faceted (`layout.facet.field`)
- radar: example is not a concatenation (`layout.concat.columns`)
- radar: example has no drilldown (`interaction.drilldown.key`)
- radar: motion runs in the client, not in the static SVG (`animation`)
- radar: client behavior; the static SVG only records intent (`a11y.keyboard`)
- combo: id is a hook, not paint (`id`)
- combo: x values are categories, so type, format, and scale do not apply (`encoding.x.format`)
- combo: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- combo: example does not paint this token (`theme.tokens.axis`)
- combo: example is not faceted (`layout.facet.field`)
- combo: example is not a concatenation (`layout.concat.columns`)
- combo: example has no drilldown (`interaction.drilldown.key`)
- combo: motion runs in the client, not in the static SVG (`animation`)
- combo: x values are categories, so timezone does not apply (`timezone`)
- combo: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar-list: id is a hook, not paint (`id`)
- bar-list: example has no subtitle (`subtitle`)
- bar-list: probe value makes the spec invalid (`encoding.x`)
- bar-list: example does not paint this token (`theme.tokens.muted`)
- bar-list: example is not faceted (`layout.facet.field`)
- bar-list: example is not a concatenation (`layout.concat.columns`)
- bar-list: example has no drilldown (`interaction.drilldown.key`)
- bar-list: motion runs in the client, not in the static SVG (`animation`)
- bar-list: client behavior; the static SVG only records intent (`a11y.keyboard`)
- quadrant: id is a hook, not paint (`id`)
- quadrant: example draws no legend (`legend`)
- quadrant: example is not faceted (`layout.facet.field`)
- quadrant: example is not a concatenation (`layout.concat.columns`)
- quadrant: example has no drilldown (`interaction.drilldown.key`)
- quadrant: motion runs in the client, not in the static SVG (`animation`)
- quadrant: client behavior; the static SVG only records intent (`a11y.keyboard`)
- waterfall: id is a hook, not paint (`id`)
- waterfall: probe value makes the spec invalid (`encoding.y`)
- waterfall: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- waterfall: example has no series on y2 (`axes.y2`)
- waterfall: example draws no legend (`legend`)
- waterfall: example does not paint this token (`theme.tokens.negative`)
- waterfall: example is not faceted (`layout.facet.field`)
- waterfall: example is not a concatenation (`layout.concat.columns`)
- waterfall: example has no drilldown (`interaction.drilldown.key`)
- waterfall: motion runs in the client, not in the static SVG (`animation`)
- waterfall: client behavior; the static SVG only records intent (`a11y.keyboard`)
- line: id is a hook, not paint (`id`)
- line: x values are categories, so type, format, and scale do not apply (`encoding.x.format`)
- line: example rows have no spare series column (`encoding.series`)
- line: example has no color field (`encoding.color`)
- line: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- line: example has no series on y2 (`axes.y2`)
- line: example draws no legend (`legend`)
- line: example does not paint this token (`theme.tokens.text`)
- line: example is not faceted (`layout.facet.field`)
- line: example is not a concatenation (`layout.concat.columns`)
- line: example has no drilldown (`interaction.drilldown.key`)
- line: motion runs in the client, not in the static SVG (`animation`)
- line: x values are categories, so timezone does not apply (`timezone`)
- line: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bullet: id is a hook, not paint (`id`)
- bullet: probe value makes the spec invalid (`encoding.y`)
- bullet: example draws no legend (`legend`)
- bullet: example is not faceted (`layout.facet.field`)
- bullet: example is not a concatenation (`layout.concat.columns`)
- bullet: example has no drilldown (`interaction.drilldown.key`)
- bullet: motion runs in the client, not in the static SVG (`animation`)
- bullet: example has no column whose order can change (`sort.field`)
- bullet: client behavior; the static SVG only records intent (`a11y.keyboard`)
- area-range: id is a hook, not paint (`id`)
- area-range: x values are categories, so type, format, and scale do not apply (`encoding.x.type`)
- area-range: example is not an OHLC series (`encoding.high.type`)
- area-range: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- area-range: example has no series on y2 (`axes.y2`)
- area-range: example draws no legend (`legend`)
- area-range: example is not faceted (`layout.facet.field`)
- area-range: example is not a concatenation (`layout.concat.columns`)
- area-range: example has no drilldown (`interaction.drilldown.key`)
- area-range: motion runs in the client, not in the static SVG (`animation`)
- area-range: x values are categories, so timezone does not apply (`timezone`)
- area-range: client behavior; the static SVG only records intent (`a11y.keyboard`)
- mini-area: id is a hook, not paint (`id`)
- mini-area: example does not paint this token (`theme.tokens.text`)
- mini-area: example is not faceted (`layout.facet.field`)
- mini-area: example is not a concatenation (`layout.concat.columns`)
- mini-area: example has no drilldown (`interaction.drilldown.key`)
- mini-area: motion runs in the client, not in the static SVG (`animation`)
- mini-area: example has no number to format (`locale`)
- mini-area: x values are categories, so timezone does not apply (`timezone`)
- mini-area: example has no column whose order can change (`sort.field`)
- mini-area: client behavior; the static SVG only records intent (`a11y.keyboard`)
- funnel: id is a hook, not paint (`id`)
- funnel: probe value makes the spec invalid (`encoding.y`)
- funnel: example has no color field (`encoding.color.title`)
- funnel: example draws no legend (`legend`)
- funnel: example is not faceted (`layout.facet.field`)
- funnel: example is not a concatenation (`layout.concat.columns`)
- funnel: example has no drilldown (`interaction.drilldown.key`)
- funnel: motion runs in the client, not in the static SVG (`animation`)
- funnel: client behavior; the static SVG only records intent (`a11y.keyboard`)
- progress-ring: probe value makes the spec invalid (`type`)
- progress-ring: id is a hook, not paint (`id`)
- progress-ring: example has no subtitle (`subtitle`)
- progress-ring: example has no metric.target (`metric.target`)
- progress-ring: example has no metric.delta (`metric.delta`)
- progress-ring: example has no metric.deltaFormat (`metric.deltaFormat`)
- progress-ring: example has no metric.goodDirection (`metric.goodDirection`)
- progress-ring: example draws no legend (`legend`)
- progress-ring: example is not faceted (`layout.facet.field`)
- progress-ring: example is not a concatenation (`layout.concat.columns`)
- progress-ring: example has no drilldown (`interaction.drilldown.key`)
- progress-ring: motion runs in the client, not in the static SVG (`animation`)
- progress-ring: example has no column whose order can change (`sort.field`)
- progress-ring: client behavior; the static SVG only records intent (`a11y.keyboard`)
- bar-range: id is a hook, not paint (`id`)
- bar-range: example is not an OHLC series (`encoding.high.type`)
- bar-range: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- bar-range: example has no series on y2 (`axes.y2`)
- bar-range: example draws no legend (`legend`)
- bar-range: example is not faceted (`layout.facet.field`)
- bar-range: example is not a concatenation (`layout.concat.columns`)
- bar-range: example has no drilldown (`interaction.drilldown.key`)
- bar-range: motion runs in the client, not in the static SVG (`animation`)
- bar-range: client behavior; the static SVG only records intent (`a11y.keyboard`)
- candlestick: id is a hook, not paint (`id`)
- candlestick: x values are categories, so type, format, and scale do not apply (`encoding.x.type`)
- candlestick: probe value makes the spec invalid (`encoding.open`)
- candlestick: example is not an OHLC series (`encoding.open.type`)
- candlestick: x axis is not numeric, so format and minor ticks do not apply (`axes.x.format`)
- candlestick: example has no series on y2 (`axes.y2`)
- candlestick: example draws no legend (`legend`)
- candlestick: example does not paint this token (`theme.tokens.text`)
- candlestick: example is not faceted (`layout.facet.field`)
- candlestick: example is not a concatenation (`layout.concat.columns`)
- candlestick: example has no drilldown (`interaction.drilldown.key`)
- candlestick: motion runs in the client, not in the static SVG (`animation`)
- candlestick: x values are categories, so timezone does not apply (`timezone`)
- candlestick: client behavior; the static SVG only records intent (`a11y.keyboard`)
- scatter: id is a hook, not paint (`id`)
- scatter: probe value makes the spec invalid (`encoding.x`)
- scatter: example has no color field (`encoding.color`)
- scatter: example has no series on y2 (`axes.y2`)
- scatter: example draws no legend (`legend`)
- scatter: example does not paint this token (`theme.tokens.text`)
- scatter: example is not faceted (`layout.facet.field`)
- scatter: example is not a concatenation (`layout.concat.columns`)
- scatter: example has no drilldown (`interaction.drilldown.key`)
- scatter: motion runs in the client, not in the static SVG (`animation`)
- scatter: x values are categories, so timezone does not apply (`timezone`)
- scatter: client behavior; the static SVG only records intent (`a11y.keyboard`)
