# ChartKit column recheck, main 116d0af

The imported column was checked against main `1b9b869` (PR #16). This pass rechecked it against main `116d0af` (PR #17, “Draw axis options on the small line path”).

PR #17 calls `mountAxes()` from `createRenderer([line])` and the other cartesian entries. Titles, tick count, explicit ticks, rotation, side, `scale.nice`, `scale.reverse`, `size.padding`, and `a11y.description` draw on that path. `legend.values` is registered in the same `mountAxes()` hook. `mark.labels: true` on line, stacked-area, and scatter warns CK3012 (`ignored; bars and slices`) and is not drawn. Bar and donut still draw labels.

Statuses were not changed. `axis.ticks.autoskip` stays partial: the small path tilts crowded labels, and it still does not skip, stagger, or hide them. `label.show` stays partial. Nothing else in the column claimed the small path ignored an option that #17 now draws.

| id | status | correction |
|---|---|---|
| scale.nice | native | Drawn on `createRenderer([line])`. The old note said that entry ignored it. |
| scale.reverse | native | Drawn on `createRenderer([line])`. |
| axis.title | native | Drawn on `createRenderer([line])`. Channel-title fallback is unchanged. |
| axis.position | native | Side is drawn on `createRenderer([line])`. |
| axis.ticks.count | native | Drawn on `createRenderer([line])`. |
| axis.ticks.values | native | Drawn on `createRenderer([line])`. |
| axis.ticks.rotate | native | Drawn on `createRenderer([line])`. |
| axis.ticks.autoskip | partial | Auto-tilt now runs on `createRenderer([line])`. Still no skip, stagger, or hide. |
| legend.values | native | Line values draw on `createRenderer([line])`. |
| layout.margin | native | `size.padding` draws on `createRenderer([line])`. |
| a11y.description.long | native | Description draws on `createRenderer([line])`. |
| label.show | partial | Bar and donut still draw it. Line, stacked-area, and scatter warn CK3012 and are not drawn. |
