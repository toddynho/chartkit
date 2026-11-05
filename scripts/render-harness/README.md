# Render harness

Deterministic checks for broken or bad-looking charts. No model calls. The sweep lives next to `npm test`, `npm run size`, `npm run audit:options`, and the soft visual scoreboard in `catalog/visual`.

ChartKit does not rewrite or shorten labels. When two labels occupy the same pixels, that is a layout bug. The harness reports it. It does not suggest truncation. Example sizes stay as the spec wrote them, except in cases that exist to vary `size`.

## Run

From the repo root, after `npm install`:

```bash
npm run test:render
npm run test:render:full
npm run test:render:update
```

`test:render` is the fast subset: every example at its spec, plus key options and the curated pairs on the primary example for each type. `npm test` runs that subset.

`test:render:full` is the one-at-a-time sweep across every gallery and docs example. `test:render:update` rewrites the allowlist and the full hash baseline, then runs the fast subset once more to refresh `baselines/fast.json`. A few charts draw differently after other charts in the same process, so the fast baseline has to come from a fast run.

`node scripts/render-harness/run.mjs --count` prints the case totals without rendering. `--type gantt` limits a run.

The case list is sorted. `SEED` in `paths.mjs` is `20261105`. Nothing in the generator calls `Math.random`. A later sampler should draw from these ids with that seed.

## What a case is

Bases are `packages/core/examples`, the gallery specs in `catalog/lib/specs.ts`, and the geo samples. Identical specs collapse.

Options come from `optionCatalog`, the same list the playground and `audit:options` use. One option changes at a time:

- enum: every value
- boolean: both
- number: minimum, maximum, default, `0`, and `1000000`
- string: empty, and a fixed long sentence. `size.width` and `size.height` also take `0`, `240`, `1200`, and `10000`
- color: empty, `#111111`, `#f5f5f7`
- JSON, and the `type` field: recorded as unsampled

`pairs.mjs` crosses a few options that interact: legend position with title, orientation with labels, size with legend, and dark theme with each type.

An option the playground marks “Not yet supported” is recorded and not rendered. `needs-data` is the same. The example cannot exercise it, so a failure would be the fixture.

A finding that is already present on the untouched example is not repeated for every option. The option cases are the ones that introduce a new check.

## Checks

Each rendered SVG is checked in process. A check returns `{ type, example, option, value, check, severity, detail, elements }`. `elements` carries an id and a bbox.

| Check | What it flags |
| --- | --- |
| `text-overlap` | Two labels, ticks, legend items, or titles occupy the same box |
| `text-outside` | Text extends past the viewBox |
| `text-clipped` | Text is cut by the plot clip |
| `mark-outside` | A mark sits outside the plot or the viewBox and is not clipped |
| `legend-overlap` | A legend intersects the plot, an axis, or tick labels |
| `contrast` | Text is under 4.5:1 (3:1 for large or bold) on the light page, the dark page, or the shape it sits on |
| `bad-number` | `NaN`, `Infinity`, or `undefined` in the SVG |
| `empty-chart` | Data is present and the SVG has no marks |
| `render-exception` | The renderer threw, or returned `ck-chart-error` |
| `console` | `console.error` or `console.warn` during render |
| `render-time` | Render took 1000 ms or more |
| `snapshot` | The dHash moved, or raster failed |

Text width uses the renderer’s 6.4px-at-11px estimate, so a gap the layout already reserved is not an overlap.

## Baselines

Hashes live in `baselines/fast.json` and `baselines/full.json`. Each value is a 64-bit dHash of a 96px-wide PNG made with `@resvg/resvg-wasm` and the faces in `apps/cloud/fonts`. Distance above 8 bits is a changed render.

The PNGs are not committed. A full sweep is about twenty thousand renders. Storing every PNG would add tens of megabytes and would churn on antialiasing. The hash is enough to notice a real change and small enough to diff. Flagged renders are written to `out/png/`, which is gitignored. A full update also copies a few of those into `report/examples/` so the written report has pictures.

`report/latest.md` is the last full sweep. `out/findings.json` is the machine-readable list from the last run, including element ids and bboxes.

## Allowlist

`allowlist.json` is the set of known error and warning keys. CI fails when a run produces a key that is not in the file. A key that disappears, because a bug was fixed, does not fail the run. Refresh the file with `npm run test:render:update` after a full sweep. That is the same idea as `scripts/audit-status.test.mjs`: known state is committed, and new failures are the ones that go red.

## Add a check

Add a function in `geometry.mjs` that returns findings with `check`, `severity`, `detail`, `elements`, `signature`, and `roles`. Call it from `checkSvg`. Cover it with a fixture in `harness.test.mjs`. Run `npm run test:render:update` so the current failures are allowlisted, then read `report/latest.md`.

`signature` is the stable part of the allowlist key. Leave coordinates out of it. A one-pixel bbox change should not look like a new bug. A new pair of labels should.

## Triage

Open `report/latest.md`. Groups are ordered by count. A group that names many types is one cause. The examples under it are the renders to open. `out/png/` has more images than the report embeds.

Do not fix a group by shortening text. Move the layout, or change the spec size in the product if the size was not explicit. Explicit `size` wins.

## Vision and fix agents

`vision.mjs` exports `reviewFlagged(findings, reviewer)`. Without a reviewer it returns `status: "stub"` and does not call a model. A reviewer implements `review({ findings, images })` and returns notes. `images` lists flagged case ids, png paths, and check names. Feed that list to a vision model, or to a fix agent, later. Keep the model out of this sweep.

## CI

The fast subset runs inside `npm test`, via `harness.test.mjs`. The full sweep is local. The workflow file is unchanged: this harness does not add a job and does not publish or deploy.
