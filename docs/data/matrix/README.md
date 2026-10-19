# Publishing this matrix on chartkit.dev

`matrix.json` in this directory is the source the site publishes. Bundle bytes on the compare pages and in `features.json` come from `docs/data/measured-sizes.json`. From the repo root:

```bash
npm run sizes:capture
npm run matrix:refresh
```

`sizes:capture` runs `node scripts/size.mjs` and `node bench/run.mjs --skip-browser --skip-ssr --skip-agent`, then writes the JSON. Run it when main’s line chart or the pinned bench packages change. Do not type gzip figures into the compare pages.

That writes `docs/public/features.json` and one Markdown file per feature at `docs/public/features/<id>.md`. The docs prebuild runs the same script, so `npm run build` regenerates the `/features` and `/compare` pages from this file. Do not hand-edit those pages or the generated JSON.

Refresh monthly, or when a scored library ships a release you want reflected:

1. Replace `matrix.json`, `matrix.csv`, `features.md`, `conflicts.md`, and `popularity.json` with a new extract. Keep feature ids stable.
2. Re-check the ChartKit column against current main. A cell is native only when a runtime probe shows the SVG changing. If the schema accepts an option and the renderer ignores it, leave the status at none (or partial) and say so. Update `libraries` for ChartKit to the commit you probed.
3. Run `npm run matrix:refresh`. A spec snippet is published only when `validate()` (or `validatePhase4()` for gantt, timeline, quadrant, venn, and journey) returns ok and `render()` does not emit `ck-chart-error`. Warnings with code CK3012 drop the snippet.
4. Commit this directory and the generated `docs/public/features.json` and `docs/public/features/*.md`.

Other libraries were checked on 2026-10-18 against shipped types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main `116d0af`. The extract pipeline below is how a new matrix is produced; this repo stores the result, not the option-tree dumps.

# Charting library feature matrix

This is a normalized, source-verified map of what can be configured in 21 charting libraries: ChartKit plus 20 others. It was built for ChartKit roadmap planning and for agents that need to answer "which library can do X, and what is the option path?"

Checked 2026-10-18. ChartKit cells re-checked 2026-10-19 against main 116d0af (v0.5.0, PR #17 merged). The column arrived reflecting main 1b9b869 (PR #16). Notes for axis options that now draw on `createRenderer([line])`, and for `mark.labels` on line, area, and scatter, are updated in `chartkit-recheck.md`. Statuses were not upgraded.

## Files

| File | What it is |
|---|---|
| `matrix.json` | Main deliverable. Contains `schema` (statuses, verification kinds, cell fields), `libraries` (version, licence, npm downloads, GitHub stars, bundle size, escape hatch, docs URL), `notScored`, `taxonomy` (23 categories), `features` (263 rows with stable dotted ids), and `coverage`. |
| `matrix.csv` | One line per feature × library (5,523 lines). Columns: id, category, label, relevance, library, version, status, assessed, tier, api_paths, source (d.ts file:line or URL), verified, strength, note. |
| `features.md` | Human-readable grid by category, plus the library table (versions, licences, popularity, bundle sizes). |
| `chartkit-gaps.md` | ChartKit gaps ranked by commonness × agent relevance, options the schema accepts but the renderer ignores, and where ChartKit leads. |
| `conflicts.md` | "None" claims whose absence probe matched something. These are unknown until someone reviews them. |
| `option-trees/<lib>.txt` | Full option-tree dumps from each library's types (about 7.9M lines, 569 MB), as `Root.path.to.option = literal\|values`. Agents can grep these for exact option names. |
| `bundle/sizes.json` | Measured min and gzip bundle sizes, with method. |
| `meta/popularity.json` | npm weekly downloads (window 2026-10-10..16) and GitHub stars. |

## Statuses

| Status | Meaning |
|---|---|
| `native` | A first-class option, type or component exists. |
| `partial` | Possible with limits: a subset, only some chart types, or a workaround option. |
| `plugin` | Needs a separate package. The evidence names it, and its existence on npm was checked. |
| `manual` | Only possible through the library's escape hatch (custom render, SVG or canvas code). Each library's hatch is listed in `libraries[].escapeHatch`. |
| `none` | Not supported. |
| `unknown` | Not verified. When the author had a claim, it is in `assessed`. |

`tier` is `ent` (AG Enterprise), `pro` or `premium` (MUI X), or null (free).

## Method

1. **Install** every library's current npm release into `pkgs/` with `--legacy-peer-deps`. Plotly is checked against the official `plot-schema.json` for the installed version, because `@types/plotly.js` lags (no icicle, no `line.shape`). Google Charts is checked against `@types/google.visualization`, since the library itself is not on npm.
2. **Extract** (`extract/core.mjs`, `dump.mjs`): the TypeScript compiler API walks every exported type.
   - Generic roots are instantiated.
   - Companion types (`XProps`, `IXSettings`, `XOptions`) are merged.
   - Unions and arrays are transparent, and index signatures are tracked.
   - The result is the `option-trees/` dumps.
3. **Claims** (`rows/*.txt`, a small DSL): each row is a feature with an id, label, description and an absence-probe regex. Each library cell is a status plus evidence:
   - an option path such as `xAxis.axisLabel.rotate` or `series.type=sankey`
   - `~regex`, an identifier grep over the library's shipped `.d.ts` and JS
   - `pkg:name`, a plugin on npm
   - `url:`, a doc citation
   - `probe:`, a ChartKit runtime probe
4. **Verify** (`extract/verify.mjs`):
   - Every path is resolved with the type checker, and `=literal` must appear in the literal union.
   - Every regex must match.
   - Every package must exist on npm.
   - Every `none` claim is tested against the row's absence probe, limited to identifier and literal contexts.
   - A failed path is a hard error (`fails.txt` must be empty).
   - A `none` whose probe matches becomes a **conflict**, and so status unknown.
5. **ChartKit** is held to a higher bar. The schema says what is accepted, so spec variants were rendered and their SVGs diffed (`tmp/probe*.ts`, `tmp/chartkit-runtime-probes.txt`). Options that change nothing are recorded as none, with a note. ChartKit probe conflicts were read by hand (`source-review`).
6. **Build** (`build/build.mjs`, `build/gaps-doc.mjs`) writes all the outputs.

### Verification strength

| Kind | Strength | Meaning |
|---|---|---|
| `dts-path`, `schema-path`, `dts-index` | strong | Option path type-checks against shipped types or schema. File:line is in `evidence[].loc`. |
| `runtime-probe`, `source-review` | strong | ChartKit only: rendered and diffed, or read in source. |
| `pkg-license` | strong | Licence read from package.json or LICENSE. |
| `dts-absence` | moderate | A `none` where no identifier or literal matched the row probe in the library's types and sources. |
| `dts-grep` | weak | The identifier exists. Semantics were not checked. |
| `dts-mechanism` | weak | A `manual` claim where only the escape hatch was verified to exist. |
| `npm` | weak | The plugin package exists. It was not tested. |
| `doc-cited` | weak | Taken from docs, not machine-checked. |
| `conflict`, `unverified` | none | Forced to `unknown`. |

**Coverage of 5,523 cells:** 33.9% strong, 31.3% weak, 26.7% absence-verified none, 8.1% unknown (358 conflicts plus the unverified cells). `coverage.perLibrary` in matrix.json has the per-library numbers.

## How to update

```bash
cd /workspace/chart-matrix/pkgs && npm i --legacy-peer-deps <pkg>@latest   # bump libraries
curl -sL https://unpkg.com/plotly.js@<ver>/dist/plot-schema.json -o plot-schema.json
cd ../extract && node --max-old-space-size=14000 dump.mjs     # refresh option-trees (slow, ~1.5M lines/root cap)
node --max-old-space-size=14000 verify.mjs                     # must end "fails 0"; fix rows/*.txt otherwise
cd ../meta && node fetch-meta.mjs                              # npm downloads + stars
cd ../bundle && node measure.mjs                               # bundle sizes
cd .. && node build/build.mjs && node build/gaps-doc.mjs       # outputs
```

**Adding a feature.** Append a block to the right `rows/*.txt` file:

```
@axis.ticks.rotate|Tick label rotation|Rotate category labels|rotat|angle
 ck -
 cj options.scales.x.ticks.maxRotation
 ...
```

A cell is `[n|p|x|m|e|-|?] evidence[, evidence] [{ent|pro|premium}] [# note]`. The status codes are n native, p partial, x plugin, m manual, - none and ? unknown; omitting the code means native. Ids must stay stable. Rename only by adding a row and removing the old one.

**Adding a library.** Add an entry to `extract/libs.mjs` (modules plus default root prefixes), a code in `verify.mjs`, metadata in `build/build.mjs`, then a cell on every row.

**Working down `conflicts.md`.** Open the `loc`. If the hit is incidental, tighten the row probe. If it is real support, change the claim and give it evidence.

## Caveats

- Cells are verified against **types and schemas, not rendering**, except ChartKit's. A typed option can be partly implemented, which favours the other libraries in comparisons.
- Grep evidence (`dts-grep`) shows the name exists. 31% of cells rest on it or on similarly weak evidence. The libraries with the most grep-based cells are G2, Vega-Lite, amCharts, Chart.js, Plot and AG.
- Absence probes look only at identifiers and literals. They can miss support that has an unusual name; those cells are recorded as `none` with strength `absence`.
- Doc URLs are library-level bases in `libraries[].docs`. Plotly cells link to reference anchors. Individual doc pages were not fetched per cell; the `.d.ts` file:line is the per-cell source.
- Nivo `@nivo/parallel-coordinates` ships no types, so its parallel row is unknown.
- Mermaid is scored only on chart-like diagrams (pie, xychart, sankey, quadrant, gantt, timeline, venn, journey). It has many conflicts, because its internal sources match generic probes.
- The bundle sizes come from esbuild tree-shaking with one documented entry per library. Mermaid's figure is an upper bound because its CDN build lazy-loads diagram code. Google Charts is CDN-only and was not measured.
- GitHub stars for MUI X cover the whole mui-x monorepo.
