# ChartKit benchmarks, round 13

Measured 2026-10-18 on phase 2 `d8dcc5a`. The agent eval was not re-run; it stays 2026-10-16.

Median of 5, Playwright Chromium, a 640×360 line, three x spacings. This file does not re-time the libraries.

Machine-readable copy: https://chartkit.dev/benchmarks.json (schema https://chartkit.dev/benchmarks.schema.json). HTML page: https://chartkit.dev/benchmarks.

## Methodology

- Browser: Playwright Chromium, a 640×360 line, median of 5. Shapes are even x, jittered x, and gapped timestamps. ChartKit initial is mount(); the aligned update is mount().update().
- Updates: The aligned update starts at the top of a requestAnimationFrame. The harness awaits the library's own completion, then reads the clock from a MessageChannel task after that frame's style, layout, and paint. GPU and raster time is not in the number. ChartKit is measured through mount(element, spec).update(spec), the same shape as uPlot's setData. The figure is the median of five samples.
- Sampling: mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point and use the same aligned update timer.
- Bundle: gzip -9. ChartKit’s headline line is scripts/size.mjs. Competitor rows and the harness chartkit-minimal line are the bench harness. uPlot adds its stylesheet, gzipped separately. `scripts/size.mjs` line is 14,858 bytes. `/all` on that script is 26,673 bytes.
- Server render: Mean and median of 8 calls after 2 warmups, a 1,000 point line. supported false means no chart without a DOM. Recharts returned an empty wrapper.
- Agents: claude-sonnet-4-5, temperature 0, 42 tasks, one run on 2026-10-16. Not re-run for round 13. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.

## Headline

- Smallest line chart: **14,858 bytes** gzip, `scripts/size.mjs` on phase 2 `d8dcc5a`. Next is uPlot at 23,109 bytes. The harness minimal line is 14,987 bytes.
- Initial render: ChartKit is faster than uPlot in all 12 cells. Even 1,000,000 points is 23.6 ms vs 26.5 ms.
- Aligned update: ChartKit wins 6 of 12 cells against uPlot and loses the 6 listed below. It is not a sweep.
- Server render: **0.85 ms** mean (median 0.85 ms).
- `repair()`, no model call, no docs: **20/42 → 42/42**. That agent run is 2026-10-16, not round 13.

## Losses

- Aligned update, even x, 1,000 points: ChartKit 1.5 ms, uPlot 1.2 ms.
- Aligned update, even x, 10,000 points: ChartKit 1.9 ms, uPlot 1.7 ms.
- Aligned update, jittered x, 1,000 points: ChartKit 1.6 ms, uPlot 1.4 ms.
- Aligned update, gapped timestamps, 1,000 points: ChartKit 1.6 ms, uPlot 1.4 ms.
- Aligned update, gapped timestamps, 10,000 points: ChartKit 1.9 ms, uPlot 1.6 ms.
- Aligned update, gapped timestamps, 100,000 points: ChartKit 3.5 ms, uPlot 3.4 ms.
- Steady hover at 100k, painted median: ChartKit 16.5 ms, uPlot 16.2 ms.
- First hover, painted median: ChartKit 20.8 / 15.9 / 16.5 ms at about 50 / 200 / 500 ms after mount. uPlot 4 / 4.6 / 4.9 ms.
- No-docs agent first try is 20/42. That eval was not re-run for round 13. repair() reaches 42/42. The other libraries in the eval were already 42/42 with no docs.

## Bundle, gzip -9

| Library | Entry | Bytes | Note |
| --- | --- | ---: | --- |
| ChartKit | size script line, phase 2 d8dcc5a | 14,858 |  |
| ChartKit | harness minimal line | 14,987 |  |
| ChartKit | harness minimal bar | 13,022 |  |
| ChartKit | harness minimal donut | 6,683 |  |
| ChartKit | harness /all | 26,715 |  |
| uPlot | line plus stylesheet | 23,109 |  |
| Chart.js | line | 49,234 |  |
| Observable Plot | line | 97,215 |  |
| Recharts | line, React external | 95,807 | React external |
| Nivo | line, React external | 95,493 | React external |
| ECharts | echarts/core plus one series | 162,391 |  |

## Browser, milliseconds, ChartKit mount().update() vs uPlot setData

ChartKit wins every initial cell. The update column is the fair timer. Six of those twelve cells are losses, and they are marked in the result column.

| X spacing | Points | ChartKit initial | uPlot initial | ChartKit update | uPlot update | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| even | 1,000 | 11.3 | 12.0 | 1.5 | 1.2 | win-initial-loss-update |
| even | 10,000 | 13.2 | 14.8 | 1.9 | 1.7 | win-initial-loss-update |
| even | 100,000 | 14.1 | 16.3 | 2.3 | 2.9 | win-initial-win-update |
| even | 1,000,000 | 23.6 | 26.5 | 10.7 | 11.2 | win-initial-win-update |
| jitter | 1,000 | 10.1 | 14.2 | 1.6 | 1.4 | win-initial-loss-update |
| jitter | 10,000 | 12.6 | 15.2 | 1.9 | 2.2 | win-initial-win-update |
| jitter | 100,000 | 15.0 | 19.4 | 2.7 | 3.4 | win-initial-win-update |
| jitter | 1,000,000 | 24.4 | 32.1 | 11.7 | 13.0 | win-initial-win-update |
| tsgaps | 1,000 | 11.8 | 12.3 | 1.6 | 1.4 | win-initial-loss-update |
| tsgaps | 10,000 | 12.5 | 14.5 | 1.9 | 1.6 | win-initial-loss-update |
| tsgaps | 100,000 | 15.0 | 17.8 | 3.5 | 3.4 | win-initial-loss-update |
| tsgaps | 1,000,000 | 27.3 | 29.1 | 11.5 | 11.8 | win-initial-win-update |

In these same 12 cells ChartKit’s initial and aligned update are both faster than Chart.js and Observable Plot. Even 1,000,000 points: Chart.js updates in 189.8 ms and Plot in 1,295.8 ms. ECharts, Recharts, and Nivo are not in the round 13 browser rows, so this file does not give them a browser millisecond.

## Hover

Steady hover at 100,000 points. Painted median is the number to cite. ChartKit 16.5 ms, uPlot 16.2 ms.

| Library | Tip ms | Painted median ms | Painted p95 ms |
| --- | ---: | ---: | ---: |
| ChartKit | 16 | 16.5 | 17.1 |
| uPlot | 15.4 | 16.2 | 17 |
| Chart.js | 17 | 20.3 | 22.2 |
| Observable Plot | 22.7 | 28.3 | 34.6 |
| Recharts | 28.2 | 28.9 | 35.1 |
| ECharts | 20.4 | 2881.4 | 3113.2 |

First hover on a fresh 100,000 point chart, painted median. uPlot is about 4–5 ms. ChartKit is 15.9–20.8 ms. That gap is a loss.

| After mount | ChartKit painted | ChartKit max | uPlot painted | uPlot max |
| ---: | ---: | ---: | ---: | ---: |
| 50 | 20.8 | 27 | 4 | 16.6 |
| 200 | 15.9 | 35.9 | 4.6 | 8.4 |
| 500 | 16.5 | 29.2 | 4.9 | 5 |

## Sampling none, ChartKit only, fair timer

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
| 100,000 | 54.8 | 39.2 |
| 1,000,000 | 471.8 | 462.4 |

## Server render, 1,000 point line

| Library | Mean ms | Median ms | SVG without a DOM |
| --- | ---: | ---: | --- |
| ChartKit | 0.85 | 0.85 | yes |
| ECharts | 6.65 | 6.38 | yes |
| Nivo | 92.29 | 90.89 | yes |
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
