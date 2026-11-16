# Size budgets

`npm run size` measures every headline bundle (esbuild `--bundle --minify`, gzip -9) and fails when one is over its cap in `scripts/size-budget.json`.

## Policy

- A cap is the measurement plus 1%, with a minimum of 256 B. It holds nothing else back: no "raise to measured + 64" after the fact.
- A PR that raises a cap versus `origin/main` must add an entry to `scripts/size-exceptions.json`: `{ "key", "cap", "reason", "pr" }`. `cap` must equal the new cap. Without it `npm run size` fails, and so does CI.
- A PR that lowers a cap needs nothing. Tighten caps whenever a change shrinks a bundle.
- `npm run size` prints a table of changed caps (base, new, measured, headroom, status) to stderr. Set `SIZE_ALL_ROWS=1` for every bundle. `SIZE_BASE_REF` overrides the base (default `origin/main`). With no base ref the raise check is skipped with a warning.
- Exceptions already merged stay in the file as a record. Once a cap is on `main`, its entry no longer matters.

## Where the bytes are

`npm run size:contributors` lists the top 10 source files for the `line` and `all` bundles from the esbuild metafile. Sizes are minified bytes in the output; esbuild cannot split gzip per file. Use it to pick targets for a size pass.

## History

The previous `note` field in `size-budget.json` (about 10 KB of per-PR cap raises) was removed. It is in git history before the reset commit.
