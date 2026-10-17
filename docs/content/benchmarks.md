# ChartKit benchmarks, round 7

Measured 2026-10-16. Core is pull request #6 at `dccdbe6`. The harness is pull request #4 at `afd7edb`.

npm run bench on the harness commit with this core. Median of 5. This file does not re-time the libraries.

Machine-readable copy: https://chartkit.dev/benchmarks.json (schema https://chartkit.dev/benchmarks.schema.json). HTML page: https://chartkit.dev/benchmarks.

## Methodology

- Browser: Playwright Chromium, a 640×360 line, equal two-frame timers, median of 5. The full run shared the machine (about 11.6 GB of 16 GB in use). quietMs is a later same-session rerun.
- Updates: Update tests sit on a shared two-frame wait. A few milliseconds is frame-timing noise. ChartKit updates land between about 19 and 33 ms on both round 6 core and this core.
- Sampling: mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point.
- Bundle: gzip -9, bench harness. scripts/size.mjs measures the ChartKit line entry separately and is recorded as sizeScriptLineBytes. That separate measurement is 12,106 bytes.
- Server render: Mean of a 1,000 point line. supported false means no chart without a DOM. Recharts returned an empty wrapper.
- Agents: claude-sonnet-4-5, temperature 0, 42 tasks, one run on 2026-10-16. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.

## Headline

- Smallest line chart in the harness: **12,171 bytes** gzip. Next is uPlot at 23,867 bytes.
- Server render: **0.95 ms** mean (quiet box 1.22 ms).
- `repair()`, no model call, no docs: **20/42 → 42/42**.

## Losses

- 1,000-point update: ChartKit is last of 7.
- 10,000-point update: loss. The samples sit inside frame-timing noise.
- 100,000-point update: loss to uPlot. The round 6 win on this cell was frame noise.
- 1,000,000-point full run: loss to uPlot on initial and update. The quiet-box initial is a tie (36.3 vs 36.9).
- Sampling none at 1,000,000 points: 782.5 ms initial and 53,343.8 ms update, on the loaded box.
- No-docs agent first try is 20/42. repair() reaches 42/42. The other libraries in the eval were already 42/42 with no docs.
- Tooltip, zoom, pan, brush, animation, and keyboard access validate and are not drawn (CK3011).

## Bundle, gzip -9

| Library | Entry | Bytes | Note |
| --- | --- | ---: | --- |
| ChartKit | minimal line | 12,171 |  |
| ChartKit | minimal bar | 10,289 |  |
| ChartKit | minimal donut | 5,681 |  |
| ChartKit | /all | 22,864 |  |
| uPlot | line plus stylesheet | 23,867 |  |
| Chart.js | line | 49,234 |  |
| Observable Plot | line | 97,215 |  |
| Recharts | line | 95,807 | React external |
| Nivo | line | 95,493 | React external |
| ECharts | echarts/core plus one series | 162,391 |  |

## Browser, milliseconds

Parentheses are the quiet-box rerun.

| Points | ChartKit initial | ChartKit update | Fastest initial | Fastest update | Result |
| ---: | --- | --- | --- | --- | --- |
| 1,000 | 11.9 (13.7) | 32.8 (31.9) | uPlot 15 (15.1) | Chart.js 20.2 (Nivo 19.4) | win-initial-loss-update |
| 10,000 | 13 (14.2) | 30.7 (26.4) | uPlot 17.7 (17.1) | Chart.js 18.5 (Chart.js 24.2) | win-initial-loss-update |
| 100,000 | 17.4 (18.3) | 22.9 (23.5) | uPlot 20.2 (21.9) | uPlot 17.5 (uPlot 15.1) | win-initial-loss-update |
| 1,000,000 | 34.8 (36.3) | 33.4 (36.8) | uPlot 32 (36.9) | uPlot 29.2 (uPlot 33.9) | loss-full-run-quiet-initial-tie |

## Sampling none, ChartKit only

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
| 100,000 | 88.7 | 1257.8 |
| 1,000,000 | 782.5 | 53343.8 |

## Server render, 1,000 point line

| Library | Full run mean ms | Quiet ms | SVG without a DOM |
| --- | ---: | ---: | --- |
| ChartKit | 0.95 | 1.22 | yes |
| ECharts | 9.04 | 8.42 | yes |
| Nivo | 113 | — | yes |
| uPlot | — | — | no chart without a DOM |
| Chart.js | — | — | no chart without a DOM |
| Recharts | — | — | no chart without a DOM |
| Observable Plot | — | — | no chart without a DOM |

## Agent eval

Tasks: 42. Model: claude-sonnet-4-5. Temperature: 0.

| Library | No docs, first | No docs, within two | Official, first | Official, within two | Mean first-try tokens, no docs / official |
| --- | --- | --- | --- | --- | --- |
| ChartKit | 20 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 139.4 / 131.1 |
| Recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 223.3 / 236.6 |
| ECharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 334.2 / 367.2 |
| Chart.js | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 294.6 / 260.9 |
| Nivo | not in this eval |  |  |  |  |
| uPlot | not in this eval |  |  |  |  |

ChartKit's no-docs first try plus `repair()` is 42/42. Official first try is already 42/42. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

A ChartKit-only rerun with llms.txt cut to 6,329 bytes scored 41/42 on the first try. The miss was combo axis CK3002, which repair() does not patch. The headline uses the full docs file.
