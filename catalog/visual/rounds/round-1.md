# Soft visual round 1

Scored 2026-10-29 by `round1-vision` from the rendered PNGs (1280×720, the 2× pack). `npm run visual:pack` on `cb36a64f` rewrote all 37 types in both modes and the bytes matched the committed renders, including the contact sheet. No spec, SVG, or PNG changed.

Reference match is closed. Each mean is the six required criteria. A mode passes when that mean is at least 4 and no criterion is 2 or lower. A type passes when both modes pass.

**12 of 37 types pass.**

Passing types: combo, donut, errorbar, funnel, histogram, kpi, mini-area, progress-ring, scatter, sparkline, spike, waterfall.

Four more pass in light only and fail in dark: area-range, bar, boxplot, radar.

## Averages

| Type | soft-light | soft-dark | Type |
|---|---:|---:|---|
| line | 3.83 | 3.83 | fail |
| bar | 4.00 | 3.83 | fail |
| bar-list | 2.83 | 2.83 | fail |
| pie | 3.50 | 3.50 | fail |
| donut | 4.33 | 4.33 | pass |
| stacked-area | 3.67 | 3.50 | fail |
| scatter | 4.00 | 4.00 | pass |
| combo | 4.33 | 4.17 | pass |
| heatmap | 3.33 | 3.33 | fail |
| gauge | 3.33 | 3.33 | fail |
| kpi | 4.33 | 4.00 | pass |
| sparkline | 4.50 | 4.50 | pass |
| mini-area | 4.00 | 4.00 | pass |
| progress-ring | 4.83 | 4.83 | pass |
| spike | 4.33 | 4.33 | pass |
| candlestick | 3.67 | 3.33 | fail |
| histogram | 4.00 | 4.00 | pass |
| boxplot | 4.00 | 3.83 | fail |
| radar | 4.00 | 3.50 | fail |
| funnel | 4.17 | 4.17 | pass |
| treemap | 3.50 | 3.50 | fail |
| sunburst | 3.33 | 3.00 | fail |
| sankey | 3.17 | 3.00 | fail |
| bullet | 3.00 | 2.67 | fail |
| waterfall | 4.33 | 4.33 | pass |
| area-range | 4.00 | 3.67 | fail |
| bar-range | 3.83 | 3.83 | fail |
| errorbar | 4.00 | 4.00 | pass |
| gantt | 3.17 | 2.67 | fail |
| timeline | 3.00 | 2.83 | fail |
| quadrant | 3.67 | 3.33 | fail |
| venn | 3.67 | 3.67 | fail |
| journey | 3.50 | 3.00 | fail |
| radial-bar | 2.83 | 2.83 | fail |
| rose | 3.67 | 3.67 | fail |
| choropleth | 2.83 | 2.50 | fail |
| map-points | 2.83 | 2.83 | fail |

## Bottom 10

Lowest type × mode cells. Ties break by type, then mode.

1. **choropleth / soft-dark, 2.50.** The light diverging ramp is pasted onto a navy ocean. Pale states and the white legend midpoint shout, and the land colors are not Soft tokens. Product ship is 2.
2. **bullet / soft-dark, 2.67.** The qualitative bands are about 1.1:1 against `#1c1c1e`, so the scale that makes a bullet a bullet is gone. Two rows float in the top third of an otherwise empty card.
3. **gantt / soft-dark, 2.67.** Group panels render near `#101011`, darker than the page, and the remaining-work tails vanish into that black. The schedule is a few bright tips and a today line.
4. **bar-list / soft-dark, 2.83.** Bars are navy on `#1c1c1e` at about 1.2:1. Gift, Points, and Other are not visible. There is no title.
5. **bar-list / soft-light, 2.83.** The same bars are pale blue (`#cde1f8` on `#f5f5f7`, about 1.2:1). The long Card row is a tint, not a mark, and the short rows disappear.
6. **choropleth / soft-light, 2.83.** Ocean, land, and the red–gray–blue ramp are a second palette. Many states sit on the white middle of that ramp and do not separate.
7. **map-points / soft-dark, 2.83.** Markers stay the off-palette blue, city labels pile up over East Asia, and the legend says Population without a size key.
8. **map-points / soft-light, 2.83.** Same collisions and missing size key, on beige land (`#efe6d6`) with `#2b6cb0` dots instead of Soft series blue.
9. **radial-bar / soft-dark, 2.83.** The track wheel falls out (near `#101011`). Apart from Music, the data is a ring of stubs around the hub.
10. **radial-bar / soft-light, 2.83.** The same wheel is a mid-gray slab (`#868688`) that outweighs the bars. The chart reads as a gray dial, not a comparison.

## Cross-cutting issues

These show up on many types. Values below are proposals only. This round does not change tokens or renderers.

The rasterizer does not honor the CSS Color 4 form `rgb(0 0 0 / 0.05)`. Strokes in that form never appear in the PNG. Fills in that form paint as opaque black, then any `fill-opacity` on the element wins. That is why a token written as 10% black can look like a 45% black slab, and why the same token in dark mode paints black instead of a white lift.

### 1. Gridlines are missing

Horizontal grid strokes are absent on line, bar, scatter, histogram, waterfall, and the other cartesian charts. Sampling the line PNG at the grid y positions returns the exact card color, `#f5f5f7` or `#1c1c1e`.

| Token | Current | Proposed |
|---|---|---|
| `grid` | `light-dark(rgb(0 0 0 / 0.05), rgb(245 245 247 / 0.07))` | `light-dark(rgba(0, 0, 0, 0.16), rgba(245, 245, 247, 0.22))` |
| `axis` | `light-dark(rgb(0 0 0 / 0.14), rgb(245 245 247 / 0.16))` | `light-dark(rgba(0, 0, 0, 0.28), rgba(245, 245, 247, 0.32))` |

`rgba()` is the proposed spelling because the slash form does not rasterize. 0.16 is a quiet hairline; 0.28 keeps the axis darker than the grid. Radar spokes use the same grid paint, which is why the radar has no web.

### 2. Tracks, groups, and bands render as black

Gantt groups, radial-bar tracks, journey sections, bullet ranges, and the quadrant fill-ins cell all use `track` (radial tracks use `grid`) plus a `fill-opacity` of 0.45, 0.28, or a stacked range. With the slash alpha dropped, light panels land near `#868688` or `#b1b1b2`, and dark panels land near `#101011`, which is darker than the page. That single failure is the radial wheel, the gantt slabs, the bullet scale, the journey dots, and the dark quadrant that disappears.

| Token | Current | Proposed |
|---|---|---|
| `track` | `light-dark(rgb(0 0 0 / 0.10), rgb(245 245 247 / 0.16))` | `light-dark(rgba(0, 0, 0, 0.22), rgba(245, 245, 247, 0.36))` |

Gantt and radial-bar multiply by `fill-opacity: 0.45`. At that multiplier the proposed alpha composites to about 10% black and 16% white, which is the weight the current token already claims. Bullet ranges, which stack their own opacities on `track`, would then be a real gray scale instead of black on black.

### 3. Series marks at 0.16 opacity wash out

Bar-list rows and timeline era pills are series blue at `fill-opacity: 0.16`. Measured contrast is about 1.2:1 in both modes (`#cde1f8` on `#f5f5f7`, `#1a2d43` on `#1c1c1e`). The KPI spark and the candlestick volume strip have the same pale-in-light, muddy-in-dark split. Dark area bands (mini-area, area-range, stacked area) go the other way and glow, because the same bright series is used as a large translucent fill.

`fillOpacity` on the Soft geometry is 0.22, and these charts do not read it. No series color is both a solid bar and a readable 16% bar. The proposal is to raise the geometry value and point those marks at it, so one number governs the wash.

| Token | Current | Proposed |
|---|---|---|
| `fillOpacity` | `0.22` | `0.72` |

0.72 of `#007aff` on `#f5f5f7` clears 3:1. 0.72 of `#0a84ff` on `#1c1c1e` stays a blue instead of a navy stain. Area gradients that already look heavy should keep their own lower stop; this change is aimed at the flat 0.16 washes.

### 4. Tick and axis labels are small and faint

Axis text is 11px in `#6e6e73` on `#f5f5f7` (4.66:1) and `#98989d` on `#1c1c1e` (5.93:1). The light pair is only just over 4.5:1, and at 11px it looks like a whisper next to a 15px title. Histogram ticks land on 9, 18, and 27, line labels skip every other month, and candlestick dates are full ISO strings. `fontSize` does not choose those tick values. It does make the labels that do exist carry more weight.

| Token | Current | Proposed |
|---|---|---|
| `muted` | `light-dark(#6e6e73, #98989d)` | `light-dark(#636366, #aeaeb2)` |
| `fontSize` | omitted (renderer default 11) | `12` |

`#636366` is 5.50:1 on `#f5f5f7`. `#aeaeb2` is 7.69:1 on `#1c1c1e`.

### 5. Maps use a second palette

Choropleth and map-points do not use Soft series, positive, or negative. The diverging ramp is ColorBrewer RdBu, the same stops in both modes, which is why dark mode is a light map on a navy ocean. Point markers use `#2b6cb0` / `#7eb6ff`. Land is beige in light.

| Token | Current | Proposed |
|---|---|---|
| geo `SOFT.accent` | `light-dark(#2b6cb0, #7eb6ff)` | `light-dark(#007aff, #0a84ff)` |
| geo `SOFT.water` | `light-dark(#d7ebf6, #10202c)` | `light-dark(#e8eef2, #243038)` |
| geo `SOFT.land` | `light-dark(#efe6d6, #2a3338)` | `light-dark(#f5f5f7, #2c2c2e)` |
| geo `SOFT.border` | `light-dark(#7d93a8, #8aa0b4)` | `light-dark(#8e8e93, #636366)` |
| geo `DIVERGING` | `["#b2182b", "#f7f7f7", "#2166ac"]` | light `["#be123c", "#f5f5f7", "#007aff"]`, dark `["#ff453a", "#2c2c2e", "#0a84ff"]` |

The diverging stops are Soft `negative`, `surface` / card, and `accent`. The dark middle is surface `#2c2c2e` instead of white, so a zero state does not punch out of the dark ocean.

### 6. Heatmap ramp is a narrow one-off blue

Every heatmap cell in both modes is a baked blue between about `#18469f` and `#288eff`. Low and high do not separate, and dark mode does not get its own ramp.

| Token | Current | Proposed |
|---|---|---|
| sequential stops | interpolated one-off blues around `#007aff` | light `#f5f5f7` → `#007aff`, dark `#2c2c2e` → `#0a84ff` |

That is card to `accent`. Low cells sit on the card and high cells are the accent, instead of five similar blues.

## Also seen, not a token

These repeat and a token will not fix them.

- The y-axis title is the first series name on bar (`Search`), stacked-area (`Product`), and line (`Revenue`, which also repeats the chart title).
- Pie labels are percents only. The slices have no names.
- Map city labels collide in East Asia, and the population legend has no size key.
- Timeline puts the plot in the top third and drops "First paid plan" into the year row. Bullet leaves the lower two thirds empty.
- Sunburst labels are `#000000`, including on the dark card.
