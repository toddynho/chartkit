# Soft visual scoreboard

Rate Soft chart styles with a fixed pack and a rubric. The pack is the specs in `specs/`, rendered at 640×360 in both Soft modes. Homepage screenshots and card vibes are a different check. This folder is the record.

`apps/web` does not publish these files.

## Layout

| Path | What it holds |
|---|---|
| `specs/` | One spec per type in the fixed pack. |
| `renders/soft-light/` | Soft light renders of that pack, 640×360. |
| `renders/soft-dark/` | Soft dark renders of the same pack, same size. |
| `rubric.md` | Required criteria, fail cues, and the optional reference-match lane. |
| `scoresheet.csv` | One row per type, mode, and criterion. Header only until a type is scored. |

`renders/` may be empty. The pack script is not in the repo yet, so nothing writes images into those folders.

## Workflow

1. After a Soft or token change, regenerate the pack with `npm run visual:pack`.
2. Score the types whose renders changed. Apply `rubric.md` and append rows to `scoresheet.csv`.
3. When a type fails, fix the theme or the tokens first. A one-off hex in a spec is a fail on token honesty, so it is not a fix.
4. Re-render the pack.
5. Re-score the types that changed.

`npm run visual:pack` is the intended command. It is not wired up yet. Document it here so the script can land later under that name. Until it exists, leave `renders/soft-light/` and `renders/soft-dark/` empty. Do not commit hand-exported stand-ins.

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
