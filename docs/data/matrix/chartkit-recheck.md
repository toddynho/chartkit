# ChartKit column recheck, main 116d0af

The imported column was checked against main `1b9b869` (PR #16). This pass rechecked it against main `116d0af` (PR #17, “Draw axis options on the small line path”).

PR #17 calls `mountAxes()` from `createRenderer([line])` and the other cartesian entries. Titles, tick count, explicit ticks, rotation, side, `scale.nice`, `scale.reverse`, `size.padding`, and `a11y.description` draw on that path. `legend.values` is registered in the same `mountAxes()` hook. `mark.labels: true` on line, stacked-area, and scatter warns CK3012 (`ignored; bars and slices`) and is not drawn. Bar and donut still draw labels.

Statuses were not changed. `axis.ticks.autoskip` stays partial: the small path tilts crowded labels, and it still does not skip, stagger, or hide them. `label.show` stays partial. Nothing else in the column claimed the small path ignored an option that #17 now draws.

| id | status | correction |
|---|---|---|
| scale.nice | native | Drawn on `createRenderer([line])`. The old note said that entry ignored it. |
| scale.reverse | native | Drawn on `createRenderer([line])`. |
| axis.title | native | Drawn on `createRenderer([line])`. Channel-title fallback is unchanged. |
| axis.position | native | Side is drawn on `createRenderer([line])`. |
| axis.ticks.count | native | Drawn on `createRenderer([line])`. |
| axis.ticks.values | native | Drawn on `createRenderer([line])`. |
| axis.ticks.rotate | native | Drawn on `createRenderer([line])`. |
| axis.ticks.autoskip | partial | Auto-tilt now runs on `createRenderer([line])`. Still no skip, stagger, or hide. |
| legend.values | native | Line values draw on `createRenderer([line])`. |
| layout.margin | native | `size.padding` draws on `createRenderer([line])`. |
| a11y.description.long | native | Description draws on `createRenderer([line])`. |
| label.show | partial | Bar and donut still draw it. Line, stacked-area, and scatter warn CK3012 and are not drawn. |

## Events and selection

Rechecked after tooltip content (PR #18) and this interaction pass. A cell moved to native only when a runtime probe changed the DOM.

| id | status | correction |
|---|---|---|
| tooltip.fields | native | The interaction runtime draws the listed rows, labels, and format presets. CK3012 is gone. |
| tooltip.position | native | `auto`, `top`, `bottom`, `left`, and `right` place the tooltip. |
| tooltip.crosshair | native | Already drawn. `tooltip.crosshairLabel` prints the x value on the guide. |
| axis.crosshair.label | native | That label sits on the guide at the axis edge. |
| interaction.click | native | `pointclick`, `seriesclick`, and `legendclick` carry series, datum, index, x, y, value, and the original row. Enter or Space fires `pointclick`. |
| interaction.select | native | `point` and `series`, with Shift, Ctrl, or Meta to add. Escape or a background click clears. `--ck-dim` and `--ck-selected` style the marks. CK3012 is gone. |
| interaction.legend.hover | native | Hovering a legend item dims the other series. |

## Marks and labels

Rechecked on `createRenderer([line])` and the bar, scatter, and donut entries. A cell moved to native only when a runtime probe changed the picture.

| id | status | correction |
|---|---|---|
| mark.point.shape | native | `mark.pointShape` draws circle, square, diamond, triangle, cross, or none. A series can override shape, size, and filled or hollow. The legend swatch uses the marker. |
| label.show | native | Line, stacked area, and scatter draw `mark.labels`. CK3012 is gone. Bar and donut still draw it. |
| label.position | native | `mark.labelPosition` is top, bottom, left, right, center, inside, or outside. |
| label.format | native | `mark.labelFormat` reuses the format presets on the label text. |
| label.collision | native | A label that would overlap one already drawn is skipped. |
| label.total | native | `mark.stackTotal` labels the total on a stacked bar or stacked area. |

## Axis finishing

Rechecked on `createRenderer([line])` with a crowded category axis and a second y axis. A cell moved to native only when a runtime probe changed the picture.

| id | status | correction |
|---|---|---|
| axis.title.position | native | `titlePosition` is start, center, or end on x, y, and y2. `titleRotate` sets the y and y2 title angle. |
| axis.ticks.autoskip | native | `autoSkip: true` drops crowded category labels instead of tilting them. `false` draws every label. Numeric ticks skip on collision unless it is false. |
| axis.ticks.wrap | native | `labelWidth` and `labelLines` wrap tick labels, then ellipsize. |
| axis.ticks.marks | native | `tickMarks` is inside, outside, or none. `tickLength` sets the length. Outside is the default when only the length is set. |
| axis.line | native | The baseline is off until `line` is true or `{ show, color, width, dash }`. Dash is solid, dashed, or dotted. |

## Pie and colour

Rechecked on the pie, donut, bar, line, and scatter entries. A cell moved to native only when a runtime probe changed the picture.

| id | status | correction |
|---|---|---|
| type.pie | native | `type: "pie"` draws a solid pie. `mark.startAngle`, `mark.padAngle`, `mark.cornerRadius`, `mark.sort`, `mark.other`, and `mark.explode` change the slices. A donut keeps its hole. |
| label.pie | native | `mark.labels` and `mark.labelPosition: "outside"` draw leader lines on pie and donut. Labels on one side stack with a 16px gap. |
| mark.color.point | native | `encoding.color` names a category or a paint column. `domain` and `range` map values to colours. Drawn on bar, scatter, and pie. |
| mark.color.conditional | native | `mark.colorRules` recolours bar, line points, scatter, and pie. First match wins. Tokens `negative`, `positive`, and `accent` follow the theme. |

## Annotations

Rechecked on `createRenderer([line])` and the scatter entry. A cell moved to native only when a runtime probe changed the picture.

| id | status | correction |
|---|---|---|
| annotation.trendline | native | `type: "trendline"` draws mean, median, or linear, with a label. |
| type.regression | native | `type: "regression"` is an overlay, not a chart type. Linear or loess, with an optional confidence band. |
| annotation.marker | native | A point, a leader, and a text box. The box stays inside the plot and moves clear of earlier callouts. |
| axis.bands | native | `axes.x.bands` and `axes.y.bands` shade ranges. `axes.x.bands: "weekends"` shades Saturday and Sunday when x is dates, and warns otherwise. |

## Core gaps

| feature | status | note |
| --- | --- | --- |
| mark.glow | native | Blurred understroke on line, sparkline, and combo. One filter, emitted only when `mark.glow` is true. |
| type.line.smooth | native | `mark.curve` `monotone` is monotone-x. `smooth`, `spline`, and `basis` repair to it (CK1007). |
| legend.position | native | A funnel draws the legend when `legend` is set, including `position: "top"`. |
| type.heatmap.calendar | native | Cells stay square, or at most 1.5:1, and cap at 32px. Extra width centres the grid. The last week includes the latest day. Unsized calendars stay at 12px. `mark.weeks` on a grid warns CK3012. |
| scale.color.sequential | native | A threshold legend labels the cuts (`<6`, `6–12`, `≥12`), not the data ends. |

## Uncertainty

Rechecked on `area-range`, `bar-range`, `errorbar`, and a combo with `mark: "range"`. A cell moved to native only when a runtime probe changed the picture. The three renderers live in `@chartkitdev/core/charts/<type>`, so `createRenderer([line])` does not include them.

| id | status | correction |
|---|---|---|
| type.area.range | native | `type: "area-range"` draws a band between low and high. `encoding.y` is an optional centre line. `mark.line: false` draws the band only. A combo y item with `mark: "range"` and `lo`/`hi` paints the band under the other series. |
| type.bar.range | native | `type: "bar-range"` draws a floating bar from `encoding.low` to `encoding.high`. The bar does not start at zero. |
| type.errorbar | native | `type: "errorbar"` draws whiskers on a point or a bar. Bounds are `encoding.low` and `encoding.high`, or `encoding.error` as ± around y. `mark.error` is `point` or `bar`. |

## Hierarchy

Rechecked on multi-level treemap and sunburst. A flat treemap (encoding.x, encoding.y, optional encoding.color) still draws one level. Sunburst loads from `@chartkitdev/core/charts/sunburst`, so `createRenderer([line])` does not include it.

| id | status | correction |
|---|---|---|
| data.hierarchy | native | Nested `{name, value, children}`, `encoding.path` (field names from the root to the leaf), or `encoding.id` plus `encoding.parent`. A parent with no value is the sum of its leaves. Cycles, a missing parent, a negative size, and a parent that does not match its children are CK3027–CK3030. |
| type.sunburst | native | `type: "sunburst"` draws concentric rings coloured by the top-level branch. `mark.innerRadius` sets the hole (0.28 when omitted). `mark.depth` caps the rings. `sun-burst`, `sunburstchart`, and `partition` repair to sunburst (CK1005). Segment labels use the ink that clears 4.5:1 against the fill. Siblings shift lightness and keep a gap. |
| type.treemap | native | Nested leaves shift lightness within the branch hue and keep a gap. The label colour clears 4.5:1 against the fill. The formatted value sits under the name when the tile fits it. |

## Web component

| id | status | correction |
|---|---|---|
| framework.webcomponent | native | `@chartkitdev/element` defines `<chart-kit>`. The spec comes from the property, the `spec` attribute, or a child JSON script. `theme` reflects. `pointclick` and `select` are DOM events. An existing SVG is patched in place. |

## Shared chrome

Rechecked on line, bar, stacked-area, combo, scatter, candlestick, spike, histogram, boxplot, waterfall, area-range, bar-range, and errorbar. Title, subtitle, axis titles, `axes.y.ticks`, `scale.domain`, a y rule, and a linear trendline paint on each. Funnel and calendar heatmap paint the subtitle. The calendar also paints the title. A threshold point that sits on a line stroke shifts to a distinct colour, and the token is named when a legend is already shown.

## Interaction+

A cell moved to native only when a runtime probe changed the SVG or the client DOM. The server SVG stays free of buttons, nav, and scripts.

| id | status | correction |
|---|---|---|
| interaction.navigator | native | `interaction.navigator` mounts an overview and a keyboard range slider from the interaction extra. The SVG records `data-ck-nav`. CK3034 and CK3035. |
| interaction.sync | native | `interaction.sync` shares the crosshair, tooltip, and x window by x value. The SVG records `data-ck-sync`. CK3036. |
| interaction.drilldown | native | `interaction.drilldown.children` swaps in a child spec. Click, Enter, or Space drills. Back and Escape pop. The SVG records `data-ck-drill`. CK3037–CK3039. |
