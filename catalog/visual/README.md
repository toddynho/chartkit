# Soft visual scoreboard

Rate Soft chart styles with a fixed pack and a rubric. The pack is the specs in `specs/`, rendered at 640×360 in both Soft modes. Homepage screenshots and card vibes are a different check. This folder is the record.

`apps/web` does not publish these files.

## Layout

| Path | What it holds |
|---|---|
| `specs/` | One spec per type in the fixed pack. `pack.mjs` writes these. |
| `renders/soft-light/` | Soft light renders of that pack, 640×360. SVG, and PNG at 2× when resvg loads. |
| `renders/soft-dark/` | Soft dark renders of the same pack, same size. |
| `renders/contact-sheet.html` | Light and dark side by side, with the type id as the label. |
| `renders/contact-sheet.png` | The same grid as one PNG, when resvg loads. |
| `rubric.md` | Required criteria, fail cues, and the optional reference-match lane. |
| `scoresheet.csv` | One row per type, mode, and criterion. Header only until a type is scored. |

## Pack

From the repo root, after `npm install`:

```bash
npm run visual:pack
```

That runs `node --experimental-strip-types catalog/visual/pack.mjs`. The script is the source of the pack. It overwrites `specs/<type>.json` and both render folders. Re-running writes the same bytes. Do not hand-edit a spec or a render. Change `pack.mjs` and run the command again.

Each spec is 640×360, `theme.preset` `soft`, and `theme.tokens.fontFamily` `Inter`. Series, grid, and ink stay on Soft tokens. Histogram and box plot rows are copied from `packages/core/examples` on each run. Other series are frozen literals in `pack.mjs`, taken from the catalog examples, the dashboard cookbook, and `catalog/lib/geo-samples.ts`. Nothing in the pack calls `Math.random`.

The saved SVG resolves `var()` and `light-dark()` for that mode and sets the font to Inter, so opening the file does not depend on the page color scheme. A `#f5f5f7` or `#1c1c1e` rect sits behind the plot. Those are the Soft page fills. They are not colours in the spec. PNG is 1280×720, rasterized with `apps/cloud/src/png.ts` (`@resvg/resvg-wasm` and the faces in `apps/cloud/fonts`). The contact-sheet PNG is 1×. If resvg cannot load, the script still writes the specs, the SVGs, and the HTML sheet, and it skips PNG.

The script does not write `scoresheet.csv`.

Heatmap is a grid. A titled calendar grows past the requested 360px height, so it is not the pack frame. Journey keeps the checkout steps that fit in 360px. The full nine-step example draws past the frame.

## Workflow

1. After a Soft or token change, regenerate the pack with `npm run visual:pack`.
2. Score the types whose renders changed. Apply `rubric.md` and append rows to `scoresheet.csv`.
3. When a type fails, fix the theme or the tokens first. A one-off hex in a spec is a fail on token honesty, so it is not a fix.
4. Re-render the pack.
5. Re-score the types that changed.

## Pass

Group the sheet by `type` and `mode`. A mode passes when the mean of its required criteria is at least 4 and no criterion is 2 or lower. A type passes when both `soft-light` and `soft-dark` pass.

Score each criterion from 1 to 5. Write one note when the score is 3 or lower.

Reference match is optional. Leave it out of the mean unless that lane is open for the type. When the lane is open, include it in the mean and name the product in the note.

## Paint bench

Paint timing stays in `bench/results/paint.json`. This scoreboard is style. A fast chart can still fail the rubric, and a slow chart can still pass it. Do not copy paint medians into `scoresheet.csv`.

## Out of scope

- Rival libraries and the compare-matrix paint cells.
- Commercial Phase 3.
- Hover-steady benches.
- Site deploy, homepage chrome, and npm publish.
- Feature-matrix types ChartKit does not render.
