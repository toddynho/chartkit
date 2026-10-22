# Dashboard styling gaps

These are visual details from the Stripe, Plausible, Google Analytics, and Sentry reference dashboards that the four pages could not reproduce with existing spec options. Page CSS styles the app shell only: page background, card chrome, type, and the 12-column grid. Chart colour, grid, axes, marks, and legends come from the spec.

Closed in this change:

- Choropleth sequential fills read `encoding.color.range` when it has two or more `#rrggbb` stops. The Google Analytics-style map uses `#aecbfa`, `#669df6`, `#1a73e8`. The default ramp stays green. A one-stop or non-hex range is ignored. Geo gzip is 18,895 (+129 versus 18,766 on this branch before the ramp, +236 versus 18,659 on main `910f98f`).
- `theme.tokens` accepts the keyword `transparent`. Scorecards set `surface` and `grid` to `transparent` so the shell card is the only card. Against main `910f98f` that is line 34,564 (+10), all 64,386 (+14), and extra 88,736 (+13). The token itself is about 3 bytes of the line bundle.

| Product | Detail | Current workaround | Proposed ChartKit option |
| --- | --- | --- | --- |
| All four | `theme.tokens.fontFamily` and `theme.tokens.fontSize` are ignored (CK3012). Stripe, Google Analytics, and Sentry ship proprietary faces. | The docs host already sets `--ck-font-family` to the system-ui stack, which is the open substitute. | Honor `theme.tokens.fontFamily` and `theme.tokens.fontSize` in the renderer. |
| All four | `theme.mode` is ignored, so one spec cannot follow the light/dark toggle. | The page stores two `theme.tokens` objects and swaps them. Both use `preset: "soft"` so bar radius and gap stay put. Colour still comes from the spec. | Honor `theme.mode`, or accept `light-dark()` inside token strings. |
| All four | Tooltip fill, radius, shadow, and type size are fixed. | `tooltip.mode` is `index`. The card is the built-in tooltip. | `tooltip.background`, `tooltip.radius`, and `tooltip.shadow`, or a `tooltip.tokens` object. |
| All four | Preset geometry (stroke, point style, area falloff) still follows the preset name. Token objects cannot describe it. | Every dashboard theme uses `preset: "soft"` and sets `mark.strokeWidth`, `mark.fillOpacity`, `mark.cornerRadius`, and `mark.gap` where those options exist. | Geometry tokens, or a way to set them without changing `preset`. |
| Stripe | Bars can be rounded, but the comparison line cannot sit on a second, lighter axis with Stripe's compact value labels inside the plot. | `combo` draws bars plus a dashed line, legend on top, horizontal grid only. | A plot-edge value label, and `mark` per series for radius so the line does not inherit the bar radius. |
| Plausible | Ranked rows are a short rounded bar on a 16px track, not a full-row low-opacity wash behind the label. | `bar-list` with the indigo series token. | `mark.track: "row"` for a full-height wash and a thin value bar. |
| Plausible | The current, still-open day is a dotted continuation of the same line. | One solid area for the whole series (`mark.curve` monotone, `mark.fillOpacity` 0.14, grids off). | `mark.partial` with a dash that applies from the last point only. |
| Plausible | Choosing a headline stat replots the main chart and outlines that stat. | Six static `kpi` specs and one static line. | A host interaction. Not a paint option. |
| Plausible | Duration reads as minutes and seconds (`2m 24s`). | `format: "duration-ms"` prints `2.4m`. | A duration style that keeps minutes and seconds together. |
| Google Analytics | Choropleth water, land, border, and legend text ignore `theme.tokens`. An object theme falls through to the soft chrome. | The map spec sets `theme` to the string `soft` or `midnight`. The blue ramp is `encoding.color.range`. | `chromeFor` reads `theme.tokens` for text and muted, plus `mark.water` and `mark.land`. |
| Google Analytics | The map legend is a vertical ramp on the right. `legend.position` is not read. | The built-in vertical legend, titled Sessions, with compact stops. | `legend.position: "bottom"` and a horizontal legend on choropleth. |
| Sentry | Stacked segments meet flush. There is no gap inside a stack, and only the outer corners round. | `mark.stack` `stack`, `mark.cornerRadius` 2, `mark.gap` 0.28 between bars. | `mark.stackGap` for space between segments. |
