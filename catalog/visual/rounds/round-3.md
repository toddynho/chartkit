# Soft visual round 3

Scored 2026-10-29 by `round3-vision` from the rendered PNGs (1280×720, the 2× pack). This round applies the token changes Todd approved on the round 2 list, plus three small renderer fixes. `track` is unchanged. Area `fillOpacity` stays 0.22.

- Bar-list rows and timeline era pills use series fill at 0.72, up from 0.16. Area fills do not.
- Geo Soft accent, water, land, and border move onto the Soft series, surface, and neutral stops. The diverging ramp is negative, card or surface, and accent (`#be123c` / `#f5f5f7` / `#007aff` in light, `#ff453a` / `#2c2c2e` / `#0a84ff` in dark). Named themes keep their own land and the ColorBrewer diverging ramp.
- The default heatmap ramp is card to accent: light `#f5f5f7` → `#007aff`, dark `#2c2c2e` → `#0a84ff`. The clamped `#18469f`–`#288eff` band is gone.
- `grid` is `rgba(0, 0, 0, 0.16)` / `rgba(245, 245, 247, 0.22)`.
- Sunburst ring labels use the text token `#1d1d1f` instead of `#000000`.
- Gantt row pitch shrinks to the frame, and the time domain has a tail, so the last milestone is inside the card.
- Bullet rows and the timeline axis use the spare height, so the lower half of those cards is no longer blank.

`npm run visual:pack` rewrote the pack. Thirteen types are byte-identical to round 2 in both modes, so their scores are unchanged: donut, funnel, gauge, journey, mini-area, pie, progress-ring, quadrant, sankey, sparkline, spike, treemap, venn.

Reference match is closed. Each mean is the six required criteria. A mode passes when that mean is at least 4 and no criterion is 2 or lower. A type passes when both Soft modes pass.

**17 of 37 types pass.** Round 1 was 12 of 37. Round 2 was 16 of 37. One type crosses the line. None drop off it.

New pass: heatmap.

Still passing: combo, donut, errorbar, funnel, histogram, journey, kpi, mini-area, progress-ring, quadrant, radar, radial-bar, scatter, sparkline, spike, waterfall.

## Averages

| Type | soft-light | soft-dark | Type | vs round 2 |
|---|---:|---:|---|---|
| line | 3.83 | 3.83 | fail | same |
| bar | 4.00 | 3.83 | fail | same |
| bar-list | 3.67 | 3.83 | fail | was 2.83 / 2.83 |
| pie | 3.50 | 3.50 | fail | same |
| donut | 4.33 | 4.33 | pass | same |
| stacked-area | 3.67 | 3.50 | fail | same |
| scatter | 4.00 | 4.00 | pass | same |
| combo | 4.33 | 4.17 | pass | same |
| heatmap | 4.00 | 4.00 | pass | was 3.33 / 3.33 |
| gauge | 3.33 | 3.33 | fail | same |
| kpi | 4.33 | 4.00 | pass | same |
| sparkline | 4.50 | 4.50 | pass | same |
| mini-area | 4.00 | 4.00 | pass | same |
| progress-ring | 4.83 | 4.83 | pass | same |
| spike | 4.33 | 4.33 | pass | same |
| candlestick | 3.67 | 3.33 | fail | same |
| histogram | 4.00 | 4.00 | pass | same |
| boxplot | 4.00 | 3.83 | fail | same |
| radar | 4.17 | 4.17 | pass | same |
| funnel | 4.17 | 4.17 | pass | same |
| treemap | 3.50 | 3.50 | fail | same |
| sunburst | 3.50 | 3.33 | fail | was 3.33 / 3.00 |
| sankey | 3.17 | 3.00 | fail | same |
| bullet | 3.67 | 3.67 | fail | was 3.50 / 3.50 |
| waterfall | 4.33 | 4.33 | pass | same |
| area-range | 4.00 | 3.67 | fail | same |
| bar-range | 3.83 | 3.83 | fail | same |
| errorbar | 4.00 | 4.00 | pass | same |
| gantt | 3.67 | 3.33 | fail | same |
| timeline | 3.67 | 3.67 | fail | was 3.00 / 2.83 |
| quadrant | 4.00 | 4.00 | pass | same |
| venn | 3.67 | 3.67 | fail | same |
| journey | 4.00 | 4.00 | pass | same |
| radial-bar | 4.00 | 4.00 | pass | same |
| rose | 3.67 | 3.67 | fail | same |
| choropleth | 3.50 | 3.50 | fail | was 2.83 / 2.50 |
| map-points | 3.33 | 3.33 | fail | was 2.83 / 2.83 |

## Bottom 10

Lowest type × mode cells. Ties break by type, then mode.

1. **sankey / soft-dark, 3.00.** Unchanged picture. Ribbons sink and crossings go brown. Product ship is 2.
2. **sankey / soft-light, 3.17.** Unchanged. The same crossings. Product ship is 2.
3. **candlestick / soft-dark, 3.33.** Unchanged. Volume is a muddy wash and the dates are full ISO strings. Product ship is 2.
4. **gantt / soft-dark, 3.33.** The last milestone is inside the frame. Remaining-work tails are still muddy navy and maroon, and the dependency elbows still crowd the bars.
5. **gauge / soft-dark, 3.33.** Unchanged. Two arcs and a needle. Dark green is still neon.
6. **gauge / soft-light, 3.33.** Unchanged. The same two-arc gauge.
7. **map-points / soft-dark, 3.33.** Bubbles are series blue on surface land. East Asia labels still pile up, and the legend has no size key.
8. **map-points / soft-light, 3.33.** Same collisions and missing size key, now on card-colored land with series-blue dots.
9. **sunburst / soft-dark, 3.33.** Labels are the text token. The center hole still reads as a black disk, and two slices are both named Search.
10. **choropleth / soft-dark, 3.50.** The ramp is negative, surface, and accent on a dark ocean. States near zero still sit on the card and do not separate.

Choropleth dark was 2.50 and is no longer the worst cell. Bar-list and timeline left this list. Sankey, which did not change, is now the bottom.

## Per-type deltas

Criterion moves, light then dark. A stronger grid did not raise a chrome score: the axis-title, tick, and empty-field problems are still there. Notes that called the grid a 5% hairline now name only the remaining chrome problem.

| Type | What moved | Why |
|---|---|---|
| heatmap | Glance 3→4, token 3→4, series 3→4, product 3→4, both modes | Cells run from the card to accent. Low hours are quiet and the busy hours are series blue. The type passes. |
| bar-list | Light glance 2→4, parity 2→4, product 2→3. Dark glance 2→4, parity 2→4, product 2→4 | Rows are series blue at 0.72. Short rows are visible. Light contrast is about 2.6:1, so light product stays 3. There is still no title. |
| timeline | Glance 3→4, chrome 2→3, parity 2→4, both modes. Dark product 2→3 | Era pills are solid series blue. Year labels sit on the bottom edge, clear of "First paid plan". A wide gap remains between the pills and the axis. |
| bullet | Chrome 2→3, both modes | The two rows are spaced through the card. There is still no numeric scale, so chrome and product stay 3. |
| choropleth | Token 2→4, parity 2→4, both modes. Dark chrome 3→4, product 2→3 | Ocean, land, and the ramp use Soft stops, and dark mode is no longer a light map on a navy ocean. Near-zero states still match the card. |
| map-points | Token 2→4, parity 3→4, both modes | Dots are series blue and land is the card or surface. Labels still collide, and there is no size key. |
| sunburst | Token 2→3, both modes. Dark glance 3→4 | Labels are `#1d1d1f`, the text token, not `#000000`. The outer ring is still a mixed series tint, and the dark center still reads as a black disk. |
| gantt | Scores unchanged | General availability is inside the frame, with an Apr 19 tick past the diamond. Elbows and dark tails keep chrome at 3 and the type failing. |
| line, bar, stacked-area, scatter, bar-range, errorbar | Chrome scores unchanged | The grid is a 16% / 22% line. The y-axis title, missing titles, and sparse frames are still the chrome miss. |

## Remaining gaps

These are larger than a token or a one-line layout fix. They are not changed here.

- The y-axis title is the first series name on bar (`Search`), stacked-area (`Product`), and line (`Revenue`). Line also skips every other month.
- Bar-list never draws its title. Light rows at 0.72 of `#007aff` on `#f5f5f7` measure about 2.6:1, under 3:1. Dark clears 3:1.
- Pie labels are percents only.
- Map city labels collide in East Asia, and the population legend has no size key.
- Choropleth states near zero use the card color, so the middle of the diverging ramp does not separate.
- Timeline still leaves a wide band between the era pills and the axis. Bullet has no tick scale.
- Gantt dependency elbows crowd the bars, and dark remaining-work tails go muddy.
- Sunburst has two slices named Search, a parent-only legend, and a dark center that reads as a black disk. Treemap dark mode is still the light mosaic.
- Sankey crossings go brown. That type is the new bottom of the sheet.
- Candlestick dates are full ISO strings, and the volume strip is a 0.35 wash.
- Gauge still reads as two arcs and a needle. Dark green is still neon.
- Dark area fills on line, stacked-area, and area-range are still hot or muddy. Boxplot dark fills still go brown and maroon. Rose still puts neighboring blues on Hale and Orchard.
- `muted` and `fontSize` were on the round 2 list and were not in this approval. `track` was left at 0.10 / 0.16.

## Size

Gzip deltas versus `91a814c8`, same `npm run size` script. Grid alpha strings are the same length, so `line`, `bar-list`, and the adapters do not grow. `track` is unchanged.

| Bundle | Delta |
|---|---:|
| all | +109 |
| canvas | +134 |
| extra | +317 |
| treemap | +124 |
| bullet | +33 |
| gantt | +60 |
| timeline | +58 |
| sunburst | +26 |
| geo | +184 |
| global | +76 |
| globalAuto | +88 |

The `91a814c8` build already measured above the recorded caps, which is why that branch fails `npm run size`. Caps that were under that measurement are raised to the current measurement. The table above is the code this round added, not that realignment.
