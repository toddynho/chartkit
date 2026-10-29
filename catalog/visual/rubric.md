# Soft visual rubric

Score each required criterion from 1 to 5 for one type in one mode (`soft-light` or `soft-dark`). The frame is 640×360, the same size the pack renders.

Write one note when the score is 3 or lower. Leave the note empty at 4 or 5.

A mode passes when the mean of its required criteria is at least 4 and no criterion is 2 or lower. A type passes when both Soft modes pass. See `README.md` for the sheet columns and the regenerate loop.

| Criterion | 5 means | Fail cues (≤2) |
|---|---|---|
| Glance | Shape readable in ~1s at 640×360 | Clutter, legend fights marks |
| Token honesty | Soft inks/fills/grid/radius only | One-off hex, hard-coded greys |
| Chrome density | Title · axes · legend · plot balanced | Crowded inset, huge empty margin |
| Series discrimination | Color and mark/weight/dash | Adjacent hues only |
| Light / dark parity | Same hierarchy both Soft modes | Dark washes out or neon |
| Product ship | Would put in a real app card | Demo / toy look |

Glance is the first second: the mark should read before the legend does. Token honesty means the paint comes from Soft tokens (inks, fills, grid, radius). A hex or a hard-coded grey that is not a token is a fail even when the picture looks fine. Chrome density is the balance of title, axes, legend, and plot. Series discrimination needs a second channel when two fills sit next to each other: mark, weight, or dash. Light / dark parity is one judgment of both renders, so both mode rows carry the same score. Product ship is whether the chart belongs on a card in a real app.

## Optional

**Reference match** compares the render to a named product. Score it only when that lane is open for the type. Name the product in the note. Leave the row out when the lane is closed, and leave it out of the pass mean until the lane is open. When the lane is open, the score counts in the mean like the six required criteria.

## Sheet values

Rows go in `scoresheet.csv`.

| Column | Value |
|---|---|
| `type` | Chart type id, matching the spec filename in `specs/`. |
| `mode` | `soft-light` or `soft-dark`. |
| `criterion` | A name from the table above, or `Reference match` when that lane is open. |
| `score` | Integer 1–5. |
| `note` | One sentence when `score` is 3 or lower. Empty otherwise. For Reference match, the product name. |
| `scoredAt` | ISO date, `YYYY-MM-DD`. |
| `scorer` | Person who scored the row. |
