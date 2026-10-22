# Dashboard styling gaps

These are visual details from the Stripe, Plausible, Google Analytics, and Sentry reference dashboards that the four pages could not reproduce with existing spec options. Page CSS styles the app shell only: page background, card chrome, type, the metric-tab strip, the issues table, and the 12-column grid. Chart colour, grid, axes, marks, and legends come from the spec.

Closed in this change:

- Choropleth sequential fills read `encoding.color.range` when it has two or more `#rrggbb` stops. The Google Analytics-style map uses `#aecbfa`, `#669df6`, `#1a73e8`. The default ramp stays green. A one-stop or non-hex range is ignored.
- `theme.tokens` accepts the keyword `transparent`. Scorecards set `surface` and `grid` to `transparent` so the shell card is the only card.
- `mark.track` is `bar` or `row` on `bar-list`. `row` is a full-height wash behind the label, width proportional to the value, with the count in the text token. `bar` stays the short rounded bar. The option is on the on-demand bar-list chunk, and the schema text also lands in validate, mermaid, and global.
- An axis `title` of `""` is kept and is not drawn. Omitting the title still copies the series name onto the axis. The payments and analytics charts set `axes.y.title` to `""` so a series name is not a y-axis title.
- Choropleth `mark.nodata: "fill"` paints missing countries with `mark.land` and does not hatch them. `mark.land` and `mark.water` accept `#rrggbb`. The default choropleth is still hatched. A points map still uses the land fill on every region.
- A heatmap `encoding.color.range` of two or more stops is a continuous ramp. A two-stop range used to paint only the maximum cell in the last stop.
- A y series `fillOpacity` overrides `mark.fillOpacity` for that series.
- `theme.tokens.fontFamily` is written as `--ck-font-family` on the chart, and `theme.tokens.fontSize` sets tick and axis-title size. The pages use Inter (payments, analytics, issues) and Roboto (the traffic report).
- `theme.mode` `dark` starts from the midnight colour base. `light` on the midnight preset starts from the soft colour base. Geometry stays on the named preset. The pages still pass two token objects.
- `tooltip.background`, `tooltip.radius`, `tooltip.shadow`, and `tooltip.crosshairColor` are recorded on the chart and read by the tooltip card.
- `axes.x.ticks`, `axes.y.ticks`, and `axes.y2.ticks` accept `"ends"`, which labels only the first and last tick. Gross volume uses it.
- `headline` draws a label, a value, a comparison figure, and a delta pill in the chart. Gross volume uses it.
- `mark.partial` dashes the last segment. `mark.partialOpacity` paints that segment's area at its own opacity. The analytics chart uses both.
- Choropleth `legend.position: "bottom"` draws a horizontal ramp. The traffic map uses it.
- `mark.stackGap` opens a pixel gap between stacked segments, and `mark.radiusEnds: "all"` rounds every corner. The issues bars use both.

| Product | Detail | Current workaround | Proposed ChartKit option |
| --- | --- | --- | --- |
| All four | Preset geometry (stroke, point style, area falloff) still follows the preset name. Token objects cannot describe it. | Every dashboard theme uses `preset: "soft"` and sets `mark.strokeWidth`, `mark.fillOpacity`, `mark.curve`, and `mark.points` where those options exist. | Geometry tokens, or a way to set them without changing `preset`. |
| All four | Metric tabs (label, value, delta, selected underline) are not a chart. | The strip is page state. The selected tab renders that tab's spec. One "View spec" control lists every spec on the page. | A `metric-tabs` chart, or a selected state on a row of `kpi` specs. |
| Plausible | Choosing a headline stat replots the main chart and outlines that stat. | The tab strip is page state. It swaps which spec the chart host draws. | A host interaction. Not a paint option. |
| Plausible | Duration reads as minutes and seconds (`2m 24s`). | Closed. `format: "duration-hm"` prints `2m 24s` for 144000. The analytics tab uses that formatter. | |
| Google Analytics | Choropleth text and border still ignore `theme.tokens`. An object theme falls through to the soft chrome. | The map spec sets `theme` to the string `soft` or `midnight`, plus `mark.land` and `mark.water`. The page sets Roboto on `.ck-geo-label`. | `chromeFor` reads `theme.tokens` for text, muted, border, and `fontFamily`. |
| Google Analytics | A linear colour scale still stretches to the minimum and maximum, so one cell far above the rest washes the others pale. | The hour grid has no outlier: weekday afternoons are the dark end and nights are the light end. | `scale.type: "quantile"` or a clamp on the colour domain. |
