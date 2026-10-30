# Soft visual round 2

Scored 2026-10-29 by `round2-vision` from the rendered PNGs (1280×720, the 2× pack). This round is a fidelity fix only. Every shipped slash-alpha token (`rgb(r g b / a)` on Soft, refined, and editorial grid, axis, and track, plus the brush and navigator paints) is now the same number in `rgba(r, g, b, a)`. No alpha, fillOpacity, muted, fontSize, geo, or heatmap value changed.

`npm run visual:pack` rewrote all 37 types in both modes. Chrome screenshots of the light line, radial bar, and progress ring, and of the dark line, bullet, and gantt, are pixel-identical to the slash-alpha SVGs. The browser was already painting those colors. The PNG path was not.

Reference match is closed. Each mean is the six required criteria. A mode passes when that mean is at least 4 and no criterion is 2 or lower. A type passes when both Soft modes pass.

**16 of 37 types pass.** Round 1 was 12 of 37. Four types cross the line. None drop off it.

New passes: journey, quadrant, radar, radial-bar.

Still passing: combo, donut, errorbar, funnel, histogram, kpi, mini-area, progress-ring, scatter, sparkline, spike, waterfall.

Thirteen types are byte-identical to round 1 in both modes, so their scores are unchanged: bar-list, choropleth, donut, funnel, heatmap, map-points, mini-area, pie, sankey, sparkline, sunburst, treemap, venn.

## Averages

| Type | soft-light | soft-dark | Type | vs round 1 |
|---|---:|---:|---|---|
| line | 3.83 | 3.83 | fail | same |
| bar | 4.00 | 3.83 | fail | same |
| bar-list | 2.83 | 2.83 | fail | same |
| pie | 3.50 | 3.50 | fail | same |
| donut | 4.33 | 4.33 | pass | same |
| stacked-area | 3.67 | 3.50 | fail | same |
| scatter | 4.00 | 4.00 | pass | same |
| combo | 4.33 | 4.17 | pass | same |
| heatmap | 3.33 | 3.33 | fail | same |
| gauge | 3.33 | 3.33 | fail | same |
| kpi | 4.33 | 4.00 | pass | same |
| sparkline | 4.50 | 4.50 | pass | same |
| mini-area | 4.00 | 4.00 | pass | same |
| progress-ring | 4.83 | 4.83 | pass | same |
| spike | 4.33 | 4.33 | pass | same |
| candlestick | 3.67 | 3.33 | fail | same |
| histogram | 4.00 | 4.00 | pass | same |
| boxplot | 4.00 | 3.83 | fail | same |
| radar | 4.17 | 4.17 | pass | was 4.00 / 3.50, fail |
| funnel | 4.17 | 4.17 | pass | same |
| treemap | 3.50 | 3.50 | fail | same |
| sunburst | 3.33 | 3.00 | fail | same |
| sankey | 3.17 | 3.00 | fail | same |
| bullet | 3.50 | 3.50 | fail | was 3.00 / 2.67 |
| waterfall | 4.33 | 4.33 | pass | same |
| area-range | 4.00 | 3.67 | fail | same |
| bar-range | 3.83 | 3.83 | fail | same |
| errorbar | 4.00 | 4.00 | pass | same |
| gantt | 3.67 | 3.33 | fail | was 3.17 / 2.67 |
| timeline | 3.00 | 2.83 | fail | same |
| quadrant | 4.00 | 4.00 | pass | was 3.67 / 3.33, fail |
| venn | 3.67 | 3.67 | fail | same |
| journey | 4.00 | 4.00 | pass | was 3.50 / 3.00, fail |
| radial-bar | 4.00 | 4.00 | pass | was 2.83 / 2.83, fail |
| rose | 3.67 | 3.67 | fail | same |
| choropleth | 2.83 | 2.50 | fail | same |
| map-points | 2.83 | 2.83 | fail | same |

## Bottom 10

Lowest type × mode cells. Ties break by type, then mode.

1. **choropleth / soft-dark, 2.50.** Unchanged picture. The light diverging ramp is still pasted on a navy ocean. Product ship is 2.
2. **bar-list / soft-dark, 2.83.** Unchanged. Bars are navy on `#1c1c1e` at about 1.2:1. Gift, Points, and Other are not visible.
3. **bar-list / soft-light, 2.83.** Unchanged. Pale blue rows (`#cde1f8` on `#f5f5f7`). The long Card row is a tint.
4. **choropleth / soft-light, 2.83.** Unchanged. Ocean, land, and the red–gray–blue ramp are a second palette.
5. **map-points / soft-dark, 2.83.** Unchanged. Off-palette blue markers, East Asia labels piled up, no size key.
6. **map-points / soft-light, 2.83.** Unchanged. Beige land and `#2b6cb0` dots, same collisions.
7. **timeline / soft-dark, 2.83.** Unchanged. Era pills stay a 0.16 series wash. The plot sits in the top third.
8. **sankey / soft-dark, 3.00.** Unchanged. Ribbons sink and crossings go brown. Product ship is 2.
9. **sunburst / soft-dark, 3.00.** Unchanged. Labels are `#000000` on the dark card. Token honesty is 2.
10. **timeline / soft-light, 3.00.** Unchanged. Era pills are the same pale wash, and "First paid plan" falls into the year row. Chrome density is 2.

Radial-bar left this list. Both modes were 2.83 in round 1 and are 4.00 now. Bullet and gantt dark left it too (2.67 → 3.50 and 3.33) and still fail.

## Per-type deltas

Criterion moves, light then dark. Everything not listed kept its round 1 scores. Notes that claimed a missing grid now say the grid is a 5% hairline. That did not raise a chrome score: the axis-title, tick, and empty-field problems are still there.

| Type | What moved | Why |
|---|---|---|
| radial-bar | Glance 2→4, chrome 3→4, parity 2→4, product 2→4, both modes | The track was painting as opaque black, then `fill-opacity` made a gray or black wheel. It is now a quiet ring. Music still dominates; the other desks are short because the data is short. |
| journey | Light parity 2→4 and product 3→4. Dark glance 3→4, chrome 3→4, parity 2→4, product 2→4 | Section panels were `#b1b1b2` in light and about 1.07:1 in dark. Both modes now show Browse and Pay, and the 1–5 scores read. |
| quadrant | Light parity 2→4. Dark glance 3→4, parity 2→4, product 3→4 | Dark fill-ins was missing. All four cells now separate in both modes. |
| radar | Light parity 3→4. Dark glance 3→4, series 3→4, parity 3→4, product 3→4 | Spokes were dropped strokes. The web is back, and car versus bike holds in the dark overlap. |
| gantt | Light glance 3→4, parity 2→3, product 3→4. Dark glance 2→4, parity 2→3, product 2→3 | Groups are no longer `#868688` slabs or `#101011` holes. Dark tails are still muddy, and General availability still sits on the right edge, so chrome stays 3 and the type fails. |
| bullet | Light glance 3→4 and parity 2→4. Dark glance 2→4, parity 2→4, product 2→3 | Qualitative bands exist in both modes. Chrome stays 2: two rows, empty lower two thirds. |
| line, bar, stacked-area, scatter, bar-range, errorbar | Scores unchanged | Grid strokes exist and are a 5% hairline. The notes no longer say the grid is absent. |

## Raster bugs versus design gaps

Round 1 mixed two failures into one picture. The PNG path dropped slash-alpha strokes and painted slash-alpha fills as opaque black before `fill-opacity`. The SVG in a browser did not.

### The failure was the raster

These round 1 fails were that bug. The same tokens, spelled `rgba()`, clear them.

- **Radial-bar tracks.** Opaque black times `fill-opacity` was the gray dial and the `#101011` wheel. The true track is a faint ring. The type passes.
- **Journey sections and inactive dots.** Light panels were a heavy gray and dark panels were black, so the scores vanished. Both modes now group and score. The type passes.
- **Quadrant fills.** Dark cells, especially fill-ins, were gone. They are distinct now. The type passes.
- **Radar spokes.** Grid strokes never reached the PNG, so the web was missing and the dark polygons read as one blob. The web is there. The type passes.
- **Gantt groups and bullet bands.** These were the same black fill. Groups and bands are visible. The types still fail for other reasons below.
- **Cartesian grid strokes.** They were absent. They are present, at 5% black and 7% white, which is too faint to fix chrome on its own.

### The failure was the design

These pictures did not change, or the remaining miss is not the spelling.

- **Bar-list and timeline** paint series blue at `fill-opacity: 0.16`. That is a hex, so resvg already honored it. Contrast stays about 1.2:1. Both stay in the bottom 10.
- **Choropleth and map-points** use the geo palette, not Soft grid or track. Byte-identical. They are four of the bottom six cells.
- **Heatmap** is still one baked blue ramp in both modes.
- **Sunburst** labels are still `#000000`. **Treemap** dark mode is still the light mosaic. **Sankey** crossings and **venn** mixes are unchanged. **Pie** still labels percents only.
- **Bullet and timeline** still leave most of the 360px card empty. Bullet chrome is 2. Timeline chrome is 2.
- **Gantt** tails are still a dim second paint, and the last milestone is clipped. Chrome is 3.
- **Candlestick** volume is still a 0.35 wash with ISO dates. Dark product ship is 2. The grid returning did not restore that panel.
- **Gauge** still reads as two arcs and a needle. Dark green is still neon. The track segment is a real gray now; the layout is the miss.
- **Line, stacked-area, mini-area, area-range** dark fills are still hot or muddy. Area-range dark stays at 3.67 because the navy band barely lifts, and that band's pixels did not move.
- **Bar, line, stacked-area** still title the y-axis with the first series name.
- **Rose** still puts neighboring blues on Hale and Orchard.
- **Boxplot** dark fills still go brown and maroon.

Round 1's stronger `track` proposal was compensating for the black fill. At the true alpha, gantt groups, journey sections, bullet bands, and radial rings read. Raising `track` would push the radial wheel back toward a slab. It is not on the step 2 list.

## Step 2 proposals

Proposals only. Nothing here is applied.

Priority is what still keeps a type under 4 after the raster is honest.

### 1. Flat washes at 0.16

Bar-list rows and timeline era pills are series blue at `fill-opacity: 0.16`. Soft `fillOpacity` is 0.22 and these marks do not read it. Area charts must not inherit a higher flat wash; their dark fills are already heavy.

| Token | Current | Proposed |
|---|---|---|
| wash used by bar-list and timeline | `0.16` of series | `0.72` of series |
| `fillOpacity` | `0.22` | `0.72`, only for those flat marks |

0.72 of `#007aff` on `#f5f5f7` clears 3:1. 0.72 of `#0a84ff` on `#1c1c1e` stays blue. Area stops stay on their own, lower opacity.

### 2. Geo palette

Choropleth and map-points are unchanged and occupy four of the six worst cells.

| Token | Current | Proposed |
|---|---|---|
| geo `SOFT.accent` | `light-dark(#2b6cb0, #7eb6ff)` | `light-dark(#007aff, #0a84ff)` |
| geo `SOFT.water` | `light-dark(#d7ebf6, #10202c)` | `light-dark(#e8eef2, #243038)` |
| geo `SOFT.land` | `light-dark(#efe6d6, #2a3338)` | `light-dark(#f5f5f7, #2c2c2e)` |
| geo `SOFT.border` | `light-dark(#7d93a8, #8aa0b4)` | `light-dark(#8e8e93, #636366)` |
| geo `DIVERGING` | `["#b2182b", "#f7f7f7", "#2166ac"]` | light `["#be123c", "#f5f5f7", "#007aff"]`, dark `["#ff453a", "#2c2c2e", "#0a84ff"]` |

The dark middle is surface `#2c2c2e`, so a zero state does not punch out of the ocean.

### 3. Heatmap ramp

| Token | Current | Proposed |
|---|---|---|
| sequential stops | interpolated one-off blues around `#007aff` | light `#f5f5f7` → `#007aff`, dark `#2c2c2e` → `#0a84ff` |

### 4. Grid hairline

Strokes rasterize now. At 5% and 7% they do not carry the plot. Axis at 14% and 16% is already a visible baseline (spike, waterfall), so it stays.

| Token | Current | Proposed |
|---|---|---|
| `grid` | `light-dark(rgba(0, 0, 0, 0.05), rgba(245, 245, 247, 0.07))` | `light-dark(rgba(0, 0, 0, 0.16), rgba(245, 245, 247, 0.22))` |

### 5. Tick ink, after the washes and the maps

Axis text is 11px. Light muted is 4.66:1 on `#f5f5f7`. This did not by itself fail a type once the raster was fixed.

| Token | Current | Proposed |
|---|---|---|
| `muted` | `light-dark(#6e6e73, #98989d)` | `light-dark(#636366, #aeaeb2)` |
| `fontSize` | omitted (renderer default 11) | `12` |

## Also seen, not a token

- The y-axis title is the first series name on bar (`Search`), stacked-area (`Product`), and line (`Revenue`).
- Pie labels are percents only.
- Map city labels collide in East Asia, and the population legend has no size key.
- Timeline and bullet leave the lower half of the card empty. Gantt clips General availability.
- Sunburst labels are `#000000`, including on the dark card.
- Candlestick dates are full ISO strings, and the volume strip is a 0.35 wash.
