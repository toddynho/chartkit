# Changelog

## Unreleased

- Soft default look. One series palette for fills and strokes, so a series keeps its colour across chart types: `#2f6fe4 #e2622a #0f9d83 #b7791f #d9488f #3f8f2f #8b5cf6 #d14343` on light, `#4a8ff0 #e06a35 #1aa37e #c08318 #dd5f97 #4aa040 #9180ea #e66767` on dark. Neighbours stay apart under protan and deutan simulation and every step clears 3:1 on its page. The grid is lighter (9% black, 12% white) and the axis line firmer. `--ck-series-N`, `--ck-line-N` and `theme.tokens` still override all of it.
- Line, bar, stacked-area and combo default to 640×320 when the spec has no `size` (was 640×240).
- A category axis shows up to twelve labels when they fit, so twelve months are no longer thinned to six.
- Donut and pie: the legend sits beside the ring when that leaves the larger ring, with the percent next to the name; long names keep a legend underneath. The centre total scales to the hole. Its caption is the y channel's `title`, or "Total" when there is none. A raw field name is no longer shown.
- A line with a single point, or a point between two gaps, draws as a dot.
- A value label past the tip of a stacked bar segment takes its ink from the segment it lands on. Inside labels on pie and donut slices take the slice ink.
- Heatmap empty cells and sunburst outside labels follow dark mode.

- Odds replay, prototype. `createOddsReplay` draws step lines for a two-outcome market and replays them with `frame(t)`. The y axis fits the series (`scale: "fit"`) or locks to 0–100 (`"unit"`). `theme` is `light` or `dark`. `exportLineRace` records it. The builder switch is on `/race`.
- Line chart race, prototype. `@chartkitdev/core/race` exports `createLineRace` and `frame(t)`. `t` runs from 0 to 1 and each call returns one SVG, so playback and export share a frame. It is not a spec `type` and it is not in the line bundle. `exportLineRace` writes an MP4 in browsers that can encode H.264, otherwise WebM. The builder is at `/race` on the site.
- Presets `tape`, `kite`, `mustard`, and `violet`. Tape and Kite are the named ideas. Mustard (`#ca8a04`) and Violet (`#6d28d9`) freeze the light and dark output of `createTheme`. Import them from `@chartkitdev/core/themes/<name>` or `@chartkitdev/core/themes/all`. They are not in the line bundle.
- `createTheme({ brand })` and `theme: { brand: "#hex" }` derive a light and a dark preset, then adjust for contrast and for deuteranopia and protanopia. `validate` and `repair` canonicalize the hex (CK3085). The colour math stays in `@chartkitdev/core/themes/brand`, off the line bundle.
- `colorsFromSvg` reads SVG fills. `sampleImageData` reads pixels. `colorsFromBitmap` samples a browser canvas at 48px. Node does not decode PNG or JPEG.
- `createTheme().textures` suggests riso for Mustard and Violet. Pattern tiles are not painted.
- The line entry does not import these themes. `@chartkitdev/core/all` registers tape, kite, mustard, and violet with the other named presets.
- Motion is in beta. The API may change. `motion: "auto"` opts an update into a 320ms ease-out. Omitted and `"none"` stay still, which is the default. `render()` and export ignore it, so SSR and PNG/SVG export stay still. The runtime lives in the interact chunk. Bundled alone it is 4,478 bytes gzip. Morphs stop above 2,000 rows. A same-length canvas window strokes in place.
- Minimal `createRenderer([...])` setups now need `import "@chartkitdev/core/features"` for annotations, color rules, headlines, tooltip chrome, line labels and the midnight, refined and editorial themes.
- Themes can also be imported individually from `@chartkitdev/core/themes/<name>`.
