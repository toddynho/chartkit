# ChartKit benchmarks, round 13

Measured 2026-10-18 on phase 2 `d8dcc5a`. The agent eval was not re-run; it stays 2026-10-16.

Median of 5, Playwright Chromium, a 640×360 line, three x spacings. This file does not re-time the libraries.

Machine-readable copy: https://chartkit.dev/benchmarks.json (schema https://chartkit.dev/benchmarks.schema.json). HTML page: https://chartkit.dev/benchmarks.

## Methodology

- Browser: Playwright Chromium, a 640×360 line, median of 5. Shapes are even x, jittered x, and gapped timestamps. ChartKit initial is mount(); the aligned update is mount().update().
- Updates: The aligned update starts at the top of a requestAnimationFrame. The harness awaits the library's own completion, then reads the clock from a MessageChannel task after that frame's style, layout, and paint. GPU and raster time is not in the number. ChartKit is measured through mount(element, spec).update(spec), the same shape as uPlot's setData. The figure is the median of five samples.
- Sampling: mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point and use the same aligned update timer.
- Bundle: gzip -9. ChartKit’s headline line is scripts/size.mjs. Competitor rows and the harness chartkit-minimal line are the bench harness. uPlot’s JS and stylesheet are gzipped separately and the uPlot row sums those two responses. The JS figure is the loss named in the headline. `scripts/size.mjs` line is 40,979 bytes. `/all` on that script is 71,398 bytes.
- Server render: Mean and median of 8 calls after 2 warmups, a 1,000 point line. supported false means no chart without a DOM. Recharts returned an empty wrapper.
- Agents: Round 6 is the scoreboard. claude-sonnet-4-5, temperature 0, 42 tasks, one run on 2026-10-16. Not re-run for round 13. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.

## Headline

- Line chart: **40,979 bytes** gzip, `scripts/size.mjs` on `236653a`, measured 2026-10-24. That is a loss to uPlot at 23,276 bytes. The stylesheet is 762 bytes more, a separate response, and the two sum to 24,038, still smaller than ChartKit. It is still smaller than Chart.js (49,374), Recharts (96,213, React external), Nivo (96,583, React external), Observable Plot (97,723), and ECharts (162,991). The harness minimal line is 41,178 bytes. The harness donut is 15,085 bytes and is smaller than Chart.js (46,922), Nivo (75,518, React external), Recharts (90,090, React external), and ECharts (122,174). uPlot and Observable Plot have no donut.
- Initial render: ChartKit is faster than uPlot in all 12 cells. Even 1,000,000 points is 23.6 ms vs 26.5 ms.
- Aligned update: ChartKit wins 6 of 12 cells against uPlot and loses 6. Those six are marked in the browser table. It is not a sweep.
- Server render: **0.85 ms** mean (median 0.85 ms).
- `repair()`, no model call, no docs: **21/42 → 42/42**. That agent run is 2026-10-16, not round 13.

## Paint, two-rAF

Two-rAF completion, animation and tooltips off, sampling auto. Median of 5 at 640×360. Run date 2026-10-29. Phase 3 rival cells in the same file stay from 2026-10-28. A cell is initial ms / update ms. DNF means the run errored or timed out. N/A means that library has no native chart of that type. An em dash means this run did not include that cell. Spike is ChartKit only; every rival is N/A. The line row is sampling auto at 100,000 points. The sampling-none rows are the dense line, ChartKit only. This is not a hover-steady time.

Candlestick in the table is 100,000 candles, the size the other libraries were timed at. ChartKit also finished 2,000 candles at 23.8 ms initial and 18.9 ms update. Other line sizes (1,000, 10,000, and the 1,000,000-point sampling-auto cell) and the canvas line stay in paint.json. They are not extra rows here. Bundle size and server render are not in this matrix.

| Chart | Points | ChartKit | uPlot | Chart.js | ECharts | Recharts | Nivo | Observable Plot | Highcharts | Plotly.js | Victory | visx | ApexCharts | Tremor | Vega-Lite | AG Charts | amCharts 5 | Google Charts | TradingView Lightweight Charts | MUI X Charts | Mermaid | AntV G2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Line | 100,000 | 14.2 / 30.8 | 14.7 / 30.5 | 58.7 / 33.4 | 2491.8 / 2739.9 | 1884.3 / 1002.0 | 383.2 / 980.2 | 109.5 / 1481.0 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Line, sampling none | 100,000 | 54.0 / 1157.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Line, sampling none | 1,000,000 | 466.7 / 21550.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bar | 48 | 12.1 / 29.8 | 12.0 / 32.3 | 26.4 / 21.4 | 34.7 / 15.8 | 49.8 / 19.1 | 55.2 / 20.4 | 17.4 / 29.6 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Pie | 8 | 7.6 / 33.2 | N/A | 14.5 / 33.1 | 25.6 / 18.5 | 28.5 / 22.5 | 23.5 / 21.2 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Donut | 8 | 8.8 / 33.5 | N/A | 11.7 / 33.5 | 25.3 / 23.9 | 27.7 / 17.1 | 23.6 / 19.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Stacked area | 100,000 | 45.6 / 51.6 | N/A | 737.4 / 670.0 | 18700.4 / 18445.8 | DNF | DNF | 563.3 / 5252.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Scatter | 100,000 | 62.4 / 40.0 | 132.0 / 121.1 | 269.3 / 247.1 | 8827.4 / 9060.5 | 5815.9 / 11446.6 | 410.6 / 339.8 | 519.0 / 624.9 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Combo | 48 | 14.2 / 28.1 | N/A | 28.5 / 17.0 | 36.9 / 23.9 | 56.9 / 23.5 | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Heatmap | 1,200 | 15.9 / 24.1 | N/A | N/A | 49.1 / 25.5 | N/A | 426.4 / 446.8 | 22.9 / 22.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Gauge | 1 | 15.3 / 28.4 | N/A | N/A | 24.9 / 24.9 | N/A | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| KPI | 1 | 17.7 / 25.9 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 67.9 / 13.2 | N/A | N/A | N/A | 47.3 / 66.7 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Sparkline | 100,000 | 18.7 / 15.2 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 182.1 / 1875.6 | N/A | 180.8 / 75.0 | N/A | N/A | N/A | 167.7 / 1828.3 | N/A | N/A |
| Mini area | 100,000 | 9.5 / 21.4 | 10.5 / 21.0 | 47.4 / 28.6 | 122.4 / 78.8 | 233.0 / 132.2 | 310.1 / 270.9 | 57.8 / 56.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Progress ring | 1 | 15.1 / 29.6 | N/A | N/A | N/A | N/A | N/A | N/A | 28.8 / 28.5 | N/A | N/A | N/A | 33.6 / 17.6 | 45.3 / 66.6 | N/A | 117.9 / 6.7 | N/A | N/A | N/A | 22.6 / 22.3 | N/A | N/A |
| Spike | 100,000 | 56.6 / 43.3 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Candlestick | 100,000 | 181.5 / 153.8 | N/A | N/A | 2840.8 / 2626.4 | N/A | N/A | N/A | 2954.5 / 2913.3 | 101610.6 / 60983.6 | N/A | N/A | DNF | N/A | N/A | 212.0 / 69.9 | 7145.0 / 131435.4 | 5314.0 / 10612.3 | 281.3 / 155.0 | N/A | N/A | N/A |
| Histogram | 100,000 | 30.8 / 17.3 | N/A | N/A | N/A | N/A | N/A | 45.7 / 40.1 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Box plot | 100,000 | 56.7 / 40.1 | N/A | N/A | 70.8 / 53.2 | N/A | 86.5 / 69.7 | 222.2 / 184.3 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Radar | 8 | 10.0 / 33.1 | N/A | 21.8 / 27.5 | 29.0 / 19.3 | 36.1 / 16.2 | 27.1 / 17.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Funnel | 8 | 15.5 / 27.6 | N/A | N/A | 23.5 / 25.9 | 24.3 / 14.2 | 29.9 / 20.0 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Treemap | 48 | 19.3 / 23.2 | N/A | N/A | 34.3 / 950.3 | 32.7 / 17.3 | 41.6 / 19.5 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Sankey | 48 | 17.3 / 24.2 | N/A | N/A | 31.4 / 20.6 | 26.9 / 18.5 | 41.7 / 24.6 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bullet | 6 | 15.9 / 28.6 | N/A | N/A | N/A | N/A | 43.2 / 20.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Waterfall | 12 | 16.8 / 25.8 | N/A | N/A | N/A | N/A | N/A | N/A | 33.5 / 24.1 | 80.3 / 19.2 | N/A | N/A | 43.6 / 11.9 | N/A | N/A | 144.2 / 19.5 | N/A | N/A | N/A | N/A | N/A | N/A |
| Range area | 100,000 | 28.0 / 22.4 | 45.8 / 34.8 | 377.5 / 341.4 | N/A | N/A | N/A | 230.9 / 4285.1 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Range bar | 24 | 18.1 / 24.8 | 15.3 / 33.4 | 24.9 / 23.4 | N/A | 47.0 / 21.1 | N/A | 15.4 / 25.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Error bar | 24 | 17.2 / 22.6 | N/A | N/A | N/A | 59.1 / 23.7 | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Gantt | 24 | 10.6 / 30.3 | N/A | N/A | N/A | N/A | N/A | N/A | 68.9 / 26.6 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 237.9 / 105.8 | 188.7 / 31.5 | N/A | N/A | 75.3 / 14.7 | N/A |
| Timeline | 16 | 10.3 / 29.8 | N/A | N/A | N/A | N/A | N/A | N/A | 47.4 / 23.0 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 233.1 / 27.7 | N/A | N/A | 82.4 / 20.5 | N/A |
| Quadrant | 24 | 9.6 / 33.6 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 152.2 / 16.3 | N/A | N/A | N/A | N/A | 78.5 / 19.5 | N/A |
| Venn | 3 | 13.2 / 26.9 | N/A | N/A | N/A | N/A | N/A | N/A | 34.1 / 29.1 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 38.2 / 44.0 | N/A | N/A | N/A | 77.2 / 12.3 | N/A |
| Journey | 12 | 10.6 / 30.9 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 76.2 / 14.4 | N/A |
| Radial bar | 12 | 15.2 / 27.3 | N/A | N/A | 31.1 / 19.2 | 29.4 / 12.4 | 33.4 / 25.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Rose | 12 | 15.0 / 26.7 | N/A | 20.2 / 28.4 | 26.4 / 19.3 | N/A | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Sunburst | 48 | 18.2 / 23.2 | N/A | N/A | 29.5 / 18.4 | 29.5 / 21.3 | 35.9 / 13.0 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bar list | 20 | 26.8 / 33.3 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 46.0 / 66.5 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

## Bundle, gzip -9

| Library | Entry | Bytes | Note |
| --- | --- | ---: | --- |
| ChartKit | size script line, 236653a | 40,979 |  |
| ChartKit | harness minimal line | 41,178 |  |
| ChartKit | harness minimal bar | 40,752 |  |
| ChartKit | harness minimal donut | 15,085 |  |
| ChartKit | harness /all | 71,734 |  |
| uPlot | line plus stylesheet | 24,038 |  |
| Chart.js | line | 49,374 |  |
| Observable Plot | line | 97,723 |  |
| Recharts | line, React external | 96,213 | React external |
| Nivo | line, React external | 96,583 | React external |
| ECharts | echarts/core plus one series | 162,991 |  |

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
| ChartKit | 21 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 139.3 / 132.4 |
| Recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 221.9 / 236.5 |
| ECharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 331.7 / 362.6 |
| Chart.js | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 295 / 258.4 |
| Nivo | not in this eval |  |  |  |  |
| uPlot | not in this eval |  |  |  |  |

ChartKit's no-docs first try plus `repair()` is 42/42. Official first try is already 42/42. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

A ChartKit-only rerun with llms.txt cut to 6,329 bytes scored 41/42 on the first try. The miss was combo axis CK3002, which repair() does not patch. The headline uses the full docs file.

## Canvas line, 2026-10-21

Median of 5, Playwright Chromium, a 640×360 line, sampling auto (minmax above twice the plot width). This is not a re-time of round 13. Canvas paints sampled points and builds SVG for the axes only. `render` includes that paint. First paint waits for the same two frames. uPlot has no separate render number. Sampling none was not re-timed in this run.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10,000 | 7.3 | 7.8 | 13.1 | 21.8 | 14.5 | 25.6 | 19.1 | 33.2 |
| 100,000 | 8.2 | 9.1 | 13.1 | 20.1 | 17.6 | 29.0 | 18.1 | 23.0 |
| 1,000,000 | 16.5 | 17.1 | 20.8 | 27.7 | 25.1 | 20.6 | 21.8 | 20.9 |

Canvas loses first paint at every size: 10,000 is 21.8 ms against SVG 13.1 and uPlot 14.5; 100,000 is 20.1 ms against SVG 13.1 and uPlot 17.6; 1,000,000 is 27.7 ms against SVG 20.8 and uPlot 25.1. Render is slower at every size: 10,000 7.8 vs 7.3; 100,000 9.1 vs 8.2; 1,000,000 17.1 vs 16.5. Updates: wins 10,000 (19.1 vs SVG 25.6 and uPlot 33.2); wins 100,000 (18.1 vs SVG 29.0 and uPlot 23.0); loses 1,000,000 (21.8 vs SVG 20.6 and uPlot 20.9).
