# Dashboard styling gaps

These are visual details from the Stripe, Plausible, Google Analytics, and Sentry reference dashboards that the four pages could not reproduce with existing spec options. Page CSS styles the app shell only: page background, card chrome, type, the metric-tab strip, the issues table, and the 12-column grid. Chart colour, grid, axes, marks, and legends come from the spec.

Closed in this change:

- Choropleth sequential fills read `encoding.color.range` when it has two or more `#rrggbb` stops. The Google Analytics-style map uses `#aecbfa`, `#669df6`, `#1a73e8`. The default ramp stays green. A one-stop or non-hex range is ignored.
- `theme.tokens` accepts the keyword `transparent`. Scorecards set `surface` and `grid` to `transparent` so the shell card is the only card.
- `mark.track` is `bar` or `row` on `bar-list`. `row` is a full-height wash behind the label, width proportional to the value, with the count in the text token. `bar` stays the short rounded bar. The option is on the on-demand bar-list chunk, and the schema text also lands in validate, mermaid, and global.
- An axis `title` of `""` is kept and is not drawn. Omitting the title still copies the series name onto the axis. The payments and analytics charts set `axes.y.title` to `""` so a series name is not a y-axis title.
- Choropleth `mark.nodata: "fill"` paints missing countries with `mark.land` and does not hatch them. `mark.land` and `mark.water` accept `#rrggbb`. The default choropleth is still hatched. A points map still uses the land fill on every region.
- A heatmap `encoding.color.range` of two or more stops is a continuous ramp. A two-stop range used to paint only the maximum cell in the last stop.

| Product | Detail | Current workaround | Proposed ChartKit option |
| --- | --- | --- | --- |
| All four | `theme.tokens.fontFamily` and `theme.tokens.fontSize` are ignored (CK3012). Stripe, Google Analytics, and Sentry ship proprietary faces. | The docs host already sets `--ck-font-family` to the system-ui stack, which is the open substitute. | Honor `theme.tokens.fontFamily` and `theme.tokens.fontSize` in the renderer. |
| All four | `theme.mode` is ignored, so one spec cannot follow the light/dark toggle. | The page stores two `theme.tokens` objects and swaps them. Both use `preset: "soft"` so bar radius and gap stay put. Colour still comes from the spec. Bar-list is static, so the page draws a soft SVG and a midnight SVG, plus a phone-width pair so the rows stay readable. | Honor `theme.mode`, or accept `light-dark()` inside token strings. |
| All four | Tooltip fill, radius, shadow, and type size are fixed. | `tooltip.mode` is `index`. The card is the built-in tooltip. | `tooltip.background`, `tooltip.radius`, and `tooltip.shadow`, or a `tooltip.tokens` object. |
| All four | Preset geometry (stroke, point style, area falloff) still follows the preset name. Token objects cannot describe it. | Every dashboard theme uses `preset: "soft"` and sets `mark.strokeWidth`, `mark.fillOpacity`, `mark.curve`, and `mark.points` where those options exist. | Geometry tokens, or a way to set them without changing `preset`. |
| All four | Metric tabs (label, value, delta, selected underline) are not a chart. | The strip is page state. The selected tab renders that tab's spec. One "View spec" control lists every spec on the page. | A `metric-tabs` chart, or a selected state on a row of `kpi` specs. |
| Stripe | A category axis cannot label only the first and last category. `axes.x.ticks: 2` steps through the categories and does not pin the last one. | Gross volume uses a temporal x and `axes.x.ticks` set to the first and last timestamps. | `axes.x.ticks: "ends"` for category axes. |
| Stripe | The period total and delta sit in the card, not in the plot. | Page text above the chart. `legend.show` is false. | A chart headline slot: value and delta, drawn by the spec. |
| Plausible | The current, still-open day is a dotted continuation of the same line. | Two series in one combo. The area is null on the last day. A dotted line covers the last segment. Both use the same series token. | `mark.partial` with a dash that applies from the last point only. |
| Plausible | Choosing a headline stat replots the main chart and outlines that stat. | The tab strip is page state. It swaps which spec the chart host draws. | A host interaction. Not a paint option. |
| Plausible | Duration reads as minutes and seconds (`2m 24s`). | The tab label is page text. `format: "duration-ms"` would print `2.4m`. | A duration style that keeps minutes and seconds together. |
| Google Analytics | Choropleth text and border still ignore `theme.tokens`. An object theme falls through to the soft chrome. | The map spec sets `theme` to the string `soft` or `midnight`, plus `mark.land` and `mark.water`. | `chromeFor` reads `theme.tokens` for text, muted, and border. |
| Google Analytics | The map legend is a vertical ramp on the right. `legend.position` is not read. | The built-in vertical legend, titled Users, with compact stops. | `legend.position: "bottom"` and a horizontal legend on choropleth. |
| Google Analytics | A linear colour scale still stretches to the minimum and maximum, so one cell far above the rest washes the others pale. | The hour grid has no outlier: weekday afternoons are the dark end and nights are the light end. | `scale.type: "quantile"` or a clamp on the colour domain. |
| Sentry | Stacked segments meet flush. There is no gap inside a stack, and only the outer corners round. | `mark.stack` `stack`, `mark.cornerRadius` 2, `mark.gap` 0.28 between bars. | `mark.stackGap` for space between segments. |
