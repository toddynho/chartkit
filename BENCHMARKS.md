# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-16T21:44:20.619Z**, Node **v22.14.0**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/line 0.99.0, @nivo/bar 0.99.0, @nivo/pie 0.99.0, @observablehq/plot 0.6.17, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.

The round 13 ChartKit row is SVG. It uses `mark.sampling: "auto"` (minmax once a line is longer than twice the plot width). ChartKit sampling none is the same line with `mark.sampling: "none"`, measured only at 100,000 and 1,000,000 points. ECharts `sampling` stays off. Every update timer waits for that library's own completion and then the same two animation frames. ECharts completion is the `finished` event, and those two frames come after it. The canvas painter is a later measurement, in the canvas section, and it loses first paint at 10k, 100k, and 1M.

## Bundle size

esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. ChartKit entries bundle packages/core/src. Competitor entries use the pinned package and only the import that chart needs. ECharts uses echarts/core plus one chart, its grid component when the chart has axes, and CanvasRenderer.

| Library | Chart | Renderer | Status | min | gzip | brotli | gzip, React external |
|---|---|---|---|---:|---:|---:|---:|
| ChartKit minimal | line | svg | ok | 23636 | 8712 | 7859 | — |
| ChartKit minimal | bar | svg | ok | 17818 | 6794 | 6159 | — |
| ChartKit minimal | donut | svg | ok | 13397 | 5188 | 4723 | — |
| ChartKit all | line | svg | ok | 61398 | 19855 | 17407 | — |
| ChartKit all | bar | svg | ok | 61398 | 19855 | 17407 | — |
| ChartKit all | donut | svg | ok | 61398 | 19855 | 17407 | — |
| uPlot | line | canvas | ok | 53989 | 24038 | 21524 | — |
| uPlot | bar | canvas | ok | 54018 | 24047 | 21580 | — |
| uPlot | donut | canvas | unsupported | — | — | — | — |
| Chart.js | line | canvas | ok | 139295 | 49374 | 43436 | — |
| Chart.js | bar | canvas | ok | 134265 | 47530 | 41751 | — |
| Chart.js | donut | canvas | ok | 132392 | 46922 | 41268 | — |
| ECharts | line | canvas | ok | 476543 | 162991 | 139071 | — |
| ECharts | bar | canvas | ok | 471499 | 161020 | 137410 | — |
| ECharts | donut | canvas | ok | 357668 | 122174 | 104570 | — |
| Recharts | line | svg | ok | 331253 | 99718 | 84424 | 96213 |
| Recharts | bar | svg | ok | 328817 | 98811 | 83730 | 95516 |
| Recharts | donut | svg | ok | 306908 | 93493 | 79824 | 90090 |
| Nivo | line | svg | ok | 291572 | 100594 | 85196 | 96583 |
| Nivo | bar | svg | ok | 275347 | 94417 | 79798 | 90441 |
| Nivo | donut | svg | ok | 233012 | 79913 | 67820 | 75518 |
| Observable Plot | line | svg | ok | 289324 | 97723 | 79872 | — |
| Observable Plot | bar | svg | ok | 267789 | 92953 | 76361 | — |
| Observable Plot | donut | svg | unsupported | — | — | — | — |

uPlot gzip and brotli include the published stylesheet added to the JS bytes as two responses. React external is blank when the bundle does not import React.

Minimal line is 8712 gzip. Smaller than: uPlot 24038 gzip; Chart.js 49374 gzip; ECharts 162991 gzip; Recharts React-external 96213 gzip (React included 99718); Nivo React-external 96583 gzip (React included 100594); Observable Plot 97723 gzip. Not smaller than: none. No number: none.

Minimal bar is 6794 gzip. Smaller than: uPlot 24047 gzip; Chart.js 47530 gzip; ECharts 161020 gzip; Recharts React-external 95516 gzip (React included 98811); Nivo React-external 90441 gzip (React included 94417); Observable Plot 92953 gzip. Not smaller than: none. No number: none.

Minimal donut is 5188 gzip. Smaller than: Chart.js 46922 gzip; ECharts 122174 gzip; Recharts React-external 90090 gzip (React included 93493); Nivo React-external 75518 gzip (React included 79913). Not smaller than: none. No number: uPlot (unsupported); Observable Plot (unsupported).

ChartKit /all line bundle is 19855 gzip.

## Browser render

Playwright Chromium. Each sample is a fresh page. Reported times are the median of 5 samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Every library does its own update, then waits for the same two animation frames. ECharts also waits for its finished event before those frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width). ChartKit sampling none is the same line with mark.sampling none, measured only at 100k and 1M. An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 22.30 | 33.10 | 2349885 | 981193 |
| ChartKit | svg | 10000 | ok | 11.70 | 33.20 | 2502632 | 1133940 |
| ChartKit | svg | 100000 | ok | 11.60 | 27.30 | 4285220 | 2916528 |
| ChartKit | svg | 1000000 | ok | 24.90 | 31.90 | 18333690 | 16964994 |
| ChartKit sampling none | svg | 100000 | ok | 66.80 | 1170.90 | 23505880 | 22137110 |
| ChartKit sampling none | svg | 1000000 | ok | 505.20 | 21472.50 | 198788756 | 197419982 |
| uPlot | canvas | 1000 | ok | 19.70 | 33.20 | 3011050 | 1268347 |
| uPlot | canvas | 10000 | ok | 17.60 | 33.10 | 2392106 | 649403 |
| uPlot | canvas | 100000 | ok | 16.50 | 30.80 | 4805722 | 3063019 |
| uPlot | canvas | 1000000 | ok | 22.50 | 25.70 | 19378506 | 17635799 |
| Chart.js | canvas | 1000 | ok | 26.30 | 25.40 | 4658491 | 2296170 |
| Chart.js | canvas | 10000 | ok | 31.80 | 32.10 | 6638626 | 4276305 |
| Chart.js | canvas | 100000 | ok | 56.30 | 40.10 | 20956206 | 18593885 |
| Chart.js | canvas | 1000000 | ok | 321.70 | 173.70 | 154874227 | 152511902 |
| ECharts | canvas | 1000 | ok | 37.90 | 19.10 | 14407234 | 8453280 |
| ECharts | canvas | 10000 | ok | 94.60 | 74.00 | 16011895 | 10057937 |
| ECharts | canvas | 100000 | ok | 2642.00 | 2574.40 | 61895012 | 55941066 |
| ECharts | canvas | 1000000 | ok | 34051.10 | 33740.30 | 394724130 | 388770168 |
| Recharts | svg | 1000 | ok | 65.70 | 15.30 | 20639468 | 13561887 |
| Recharts | svg | 10000 | ok | 223.40 | 104.60 | 39248143 | 32170562 |
| Recharts | svg | 100000 | ok | 1770.70 | 940.90 | 165170180 | 158092603 |
| Recharts | svg | 1000000 | ok | 19790.70 | 11251.80 | 1351332137 | 1344254552 |
| Nivo | svg | 1000 | ok | 39.20 | 17.10 | 16856696 | 10566982 |
| Nivo | svg | 10000 | ok | 75.20 | 52.50 | 24279666 | 17989952 |
| Nivo | svg | 100000 | ok | 343.30 | 954.90 | 131410102 | 125120388 |
| Nivo | — | 1000000 | error | — | — | — | — |
| Observable Plot | svg | 1000 | ok | 18.00 | 33.40 | 8190739 | 4624600 |
| Observable Plot | svg | 10000 | ok | 27.20 | 56.20 | 10112583 | 6546232 |
| Observable Plot | svg | 100000 | ok | 93.60 | 1475.10 | 33575286 | 30009147 |
| Observable Plot | svg | 1000000 | ok | 737.10 | 25647.10 | 259480175 | 255913808 |

At 1000 points the fastest initial render is Observable Plot (svg) at 18.00 ms. ChartKit initial render is 22.30 ms, rank 3 of 7.

At 10000 points the fastest initial render is ChartKit (svg) at 11.70 ms. ChartKit initial render is 11.70 ms, rank 1 of 7.

At 100000 points the fastest initial render is ChartKit (svg) at 11.60 ms. ChartKit initial render is 11.60 ms, rank 1 of 8.

At 1000000 points the fastest initial render is uPlot (canvas) at 22.50 ms. ChartKit initial render is 24.90 ms, rank 2 of 7. Failed or skipped: Nivo error (Maximum call stack size exceeded).

At 10,000 points the fastest update is Chart.js at 32.10 ms. ChartKit update is 33.20 ms (samples 33.20, 33.40, 32.50, 33.20, 33.20). Those samples sit on the two-frame wait. The sampled SVG replacement is not a separate hotspot in that cell. ChartKit sampling none at 100,000 points is 66.80 ms initial and 1170.90 ms update. At 1,000,000 points with sampling none the status is ok (505.20 ms initial, 21472.50 ms update). ECharts at 100,000 points updates in 2574.40 ms; the shared frames now wait for that canvas to paint, which the old finished-only timer did not.

### ChartKit before and after sampling

Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.

| Points | Before initial / update | After initial / update | Before note |
|---:|---:|---:|---|
| 1000 | 18.70 / 25.10 | 22.30 / 33.10 | full path |
| 10000 | 23.60 / 45.50 | 11.70 / 33.20 | full path |
| 100000 | 123.80 / 1202.30 | 11.60 / 27.30 | full path; update was one sample and slower than the error-SVG 1M row |
| 1000000 | 260.80 / 239.70 | 24.90 / 31.90 | error SVG, not a chart |

### ChartKit before and after the typed-column path

Before is the median of 5 from 2026-10-16T15:40:22.418Z, after sampling was added and before typed columns stayed in place. After is this run. The machines can differ; the library table above is the same-machine comparison.

| Points | Before initial / update | After initial / update |
|---:|---:|---:|
| 1000 | 21.80 / 31.80 | 22.30 / 33.10 |
| 10000 | 17.00 / 28.80 | 11.70 / 33.20 |
| 100000 | 35.10 / 21.10 | 11.60 / 27.30 |
| 1000000 | 213.90 / 171.30 | 24.90 / 31.90 |

On a cold page, constructing `Intl.NumberFormat` for the tick labels was about 10 ms, and `Array.from` on a 100k Float64 column was about 6 ms. This run keeps those columns in place and formats `en-US` ticks without `Intl`. Replacing `innerHTML` with the sampled SVG measured 0.2 ms, and the next animation frames matched a mutation that did nothing. Writing the path `d` attribute in place matched `innerHTML`. The earlier 10k update gap was partly the timer: ChartKit waited for two animation frames and ECharts waited only for `finished`. This run gives every library the same two frames after its own completion.

## Canvas line, 2026-10-21

This is not a re-time of the round above. Median of 5, Playwright Chromium, a 640×360 sampled line. Canvas paints the marks and builds SVG for the axes only. First paint waits for the same two frames. Sampling none was not re-timed. Canvas loses first paint at 10k, 100k, and 1M.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10k | 7.3 | 7.8 | 13.1 | 21.8 | 14.5 | 25.6 | 19.1 | 33.2 |
| 100k | 8.2 | 9.1 | 13.1 | 20.1 | 17.6 | 29.0 | 18.1 | 23.0 |
| 1M | 16.5 | 17.1 | 20.8 | 27.7 | 25.1 | 20.6 | 21.8 | 20.9 |

Canvas loses first paint at every size: 10,000 is 21.8 ms against SVG 13.1 and uPlot 14.5; 100,000 is 20.1 ms against SVG 13.1 and uPlot 17.6; 1,000,000 is 27.7 ms against SVG 20.8 and uPlot 25.1. Render is slower at every size: 10,000 7.8 vs 7.3; 100,000 9.1 vs 8.2; 1,000,000 17.1 vs 16.5. Updates: wins 10,000 (19.1 vs SVG 25.6 and uPlot 33.2); wins 100,000 (18.1 vs SVG 29.0 and uPlot 23.0); loses 1,000,000 (21.8 vs SVG 20.6 and uPlot 20.9).


The round 13 ChartKit row still downsamples with `mark.sampling: "auto"` (minmax above twice the 572px plot width, so 1,000 points stay complete and 10k, 100k, and 1M do not). The ChartKit sampling none row draws every point at 100k and 1M. ECharts `sampling` stayed off. Canvas first-paint losses are in the section above.

## Server render

Same 1,000-point line (x[i] = i) for every library. Success means a chart was produced in Node without a DOM implementation. Timing is mean/median/min of 8 calls after 2 warmup calls.

| Library | Renderer | Status | Mean ms | Median ms | Min ms | Error |
|---|---|---|---:|---:|---:|---|
| ChartKit minimal | svg | ok | 0.62 | 0.60 | 0.47 | — |
| uPlot | canvas | unsupported | — | — | — | uPlot requires a DOM element. Node has no document. |
| Chart.js | canvas | unsupported | — | — | — | Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas. |
| Recharts | svg | unsupported | — | — | — | Recharts renderToStaticMarkup returned 127 characters and no <svg>: <div width="640" height="360" class="recharts-wrapper" style="position:relative;cursor:default;width:640px;height:360px"></div> |
| ECharts | svg | ok | 5.32 | 5.36 | 3.78 | — |
| Nivo | svg | ok | 52.91 | 51.79 | 49.50 | — |
| Observable Plot | svg | unsupported | — | — | — | Cannot read properties of undefined (reading 'documentElement') |

Server render succeeded for ChartKit minimal (0.62 ms mean), ECharts (5.32 ms mean), Nivo (52.91 ms mean). No server render without a DOM: uPlot, Chart.js, Recharts, Observable Plot.

## Agent first-try eval

Fair-scoring protocol on this branch: A code-library pass must import that library and return a drawn chart, or set `meta.unsupported` when the library cannot draw the chart. Recharts and Chart.js run in Playwright. A Recharts pass needs an SVG with data marks. A Chart.js pass needs painted canvas pixels. ECharts code that touches `document` runs in Playwright; `echarts.init(null, …, { ssr: true })` stays in Node and the SVG must contain marks. The chart type is read from that rendered chart (Chart.js `config.type`, ECharts series type, Recharts `chartName`). `meta.type` is not evidence. Data values come from the rendered chart, not from `meta`. ChartKit values are compared as numbers. Validator errors, render errors, compile errors, and library-use failures are fed back once. The first-try column ignores that repair.

Status of a fair-scoring run: **not yet run**.

Skipped with --skip-agent. Set OPENAI_API_KEY or ANTHROPIC_API_KEY and run without that flag.

The fixed set has 42 tasks covering all 14 chart types.

### Recorded run: claude-sonnet-4-5, published protocol

One run, temperature 0, max_tokens 4096, one attempt per task, no repair loop. Model **claude-sonnet-4-5** via Anthropic. The checker in that run did not require a library import: `render()` only had to return a string, and `meta.values` is written by the model. Those code-library rates are inflated. Raw rows are in `bench/results/agent/sonnet-4-5/`. A later library-use run is the old-protocol row in the two-condition table below. It is not the no-docs column and not the with-docs column.

Recorded **2026-10-16T18:27:03.774Z**, Node **v20.19.2**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **8** CPUs. This is a different machine from the browser table above.

| Library | First-try pass | Rate | Honest unsupported included | Passes that import the library | Hand-written SVG passes | Strict (import, or correct unsupported) |
|---|---:|---:|---:|---:|---:|---:|
| chartkit | 1 / 42 | 2.4% | 0 | — | — | 1 / 42 |
| recharts | 41 / 42 | 97.6% | 18 | 3 | 20 | 21 / 42 (50%) |
| echarts | 33 / 42 | 78.6% | 6 | 5 | 22 | 11 / 42 (26%) |
| chartjs | 30 / 42 | 71.4% | 18 | 0 | 12 | 18 / 42 (43%) |

Supported tasks in this set: recharts 24, echarts 36, chartjs 24. Chart.js strict passes are all correct `meta.unsupported` answers (0 imported the library).

| Failure | chartkit | recharts | echarts | chartjs |
|---|---:|---:|---:|---:|
| Invalid spec | 41 | 0 | 0 | 0 |
| Render error | 0 | 0 | 9 | 12 |
| Missing or wrong values | 0 | 1 | 0 | 0 |

ChartKit first-try passes: candle-up.

Tokens: 20737 input, 59853 output. At the list price noted with the run ($3/M input, $15/M output) that is $0.96.

### Supplementary runs, same model, ChartKit only, docs prepended

These are not the published protocol. The context files were not part of the checker.

| Context | ChartKit pass | Failures |
|---|---:|---|
| None (the run above) | 1 / 42 | Vega-Lite-shaped specs |
| `docs/public/llms.txt` as shipped (recorded as 5.9 KB) | 18 / 42 | donut ×3, combo ×3, heatmap ×3, gauge ×3, kpi ×3, sparkline ×3, mini-area ×3, progress-ring ×3 |
| the 15 `packages/core/examples/*.json` files (recorded as 6.2 KB, plus one hint sentence) | 40 / 42 | heatmap ×2 |

supp-llms.json failures: donut-traffic, donut-budget, donut-survey, combo-margin, combo-orders, combo-weather, heat-load, heat-commits, heat-sales, gauge-done, gauge-cpu, gauge-nps, kpi-revenue, kpi-errors, kpi-uptime, spark-latency, spark-sales, spark-queue, mini-balance, mini-cpu, mini-signups, ring-uptime, ring-storage, ring-tasks. supp-llms.json: 92434 input tokens, 6805 output tokens, about $0.38 at the same list price. supp-examples.json failures: heat-load, heat-sales. supp-examples.json: 92098 input tokens, 6283 output tokens, about $0.37 at the same list price.

With the examples in the prompt, heat-load and heat-sales still failed: `validate` passed and `render` did not. At the time of that run the heatmap renderer used the calendar layout unless `mark.layout` was `"grid"`, and calendar mode does not draw a non-date x. The core this branch sits on now infers grid when `encoding.y` is set. That recorded failure is unchanged.

Second-try column: not measured on this run. The harness now feeds validator errors, render errors, compile errors, and library-use failures back once. That column stays empty until the fair-scoring rerun.

### Doc conditions

Round 2 was run outside this repo at bench `055196d`, model claude-sonnet-4-5, temperature 0. That protocol gave ChartKit the two-line rule and no how-to-render hint. Recharts, ECharts, and Chart.js got an API hint and no official docs. Those scores are the old-protocol row. A ChartKit-only follow-up prepended `llms.txt` and scored 41 / 42 on the first try and 41 / 42 within two; the miss was `heat-sales`, and the checker now accepts either axis orientation for that task. That follow-up did not give the other libraries their docs, so it is not the with-docs row.

Round 3 was run outside this repo at bench `ee0b474`, same model and temperature. No-docs hints were one line each, and ChartKit's line also named the spec shape. Recharts passed on an empty `recharts-wrapper` because the checker matched `/recharts-/` and trusted `meta.values`. Re-executing those answers found 0 / 24 supported charts with an SVG. The corrected row counts only the 18 tasks that library correctly declined. ECharts Node SSR answers in the official run returned SVG with marks. Chart.js passed when a canvas element existed, without a pixel check. Those scores are the round-3 protocol. They are not the equal-hint, drawn-output column below.

| Library | Round 3 no docs first | Round 3 no docs within two | Round 3 official first | Round 3 official within two |
|---|---:|---:|---:|---:|
| chartkit | 31 / 42 | 41 / 42 | 42 / 42 | 42 / 42 |
| recharts as scored | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 |
| recharts corrected | 18 / 42 | 18 / 42 | 18 / 42 | 18 / 42 |
| echarts | 42 / 42 | 42 / 42 | 40 / 42 | 41 / 42 |
| chartjs | 39 / 42 | 42 / 42 | 42 / 42 | 42 / 42 |

Round 4 was run outside this repo at bench `38282f2`, plus the detached-container search, the 2.5 s Recharts pie wait, and Chart.js scatter x+y capture. Model claude-sonnet-4-5, temperature 0. Recharts, ECharts, and Chart.js were verified drawn. Code-library passes include a correct unsupported answer. The supported / unsupported split was Recharts 24 / 18, ECharts 36 / 6, Chart.js 24 / 18. These scores are that protocol. Round 5 and round 6 follow. Round 6 is the current scoreboard.

| Library | Round 4 no docs first | Round 4 no docs within two | Round 4 official first | Round 4 official within two | Round 4 no docs mean first-try output tokens | Round 4 official mean first-try output tokens |
|---|---:|---:|---:|---:|---:|---:|
| chartkit | 21 / 42 | 33 / 42 | 42 / 42 | 42 / 42 | 139 | 132 |
| recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 221 | 236 |
| echarts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 329 | 364 |
| chartjs | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 293 | 259 |

Those token means are the averages reported with the round-4 run. The first-try specs were not saved in this repo, so the pass rate after `repair()` was not recomputed here. Recharts, ECharts, and Chart.js have no `repair()` step. All 9 ChartKit no-docs misses were gauge, kpi, and progress-ring.

Round 5 was run outside this repo at bench `bc7ee8e`, plus a full-pixel Chart.js ink scan. A 32 by 32 sample had missed a thin line. One model, claude-sonnet-4-5, temperature 0, one run, 2026-10-16. Code-library passes include a correct unsupported answer. The raw rows are `bench/results/agent/round-5/`. These scores are that protocol. They are not the drawn-shape column.

| Library | Round 5 no docs first | Round 5 no docs within two | Round 5 official first | Round 5 official within two | Round 5 no docs mean first-try output tokens, all / supported | Round 5 official mean first-try output tokens, all / supported |
|---|---:|---:|---:|---:|---:|---:|
| chartkit | 20 / 42 | 41 / 42 | 42 / 42 | 42 / 42 | 139.5 (n=42) / 139.5 (n=42) | 131.8 (n=42) / 131.8 (n=42) |
| recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 220.5 (n=42) / 340.6 (n=24) | 237.5 (n=42) / 329.5 (n=24) |
| echarts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 331.4 (n=42) / 373.0 (n=36) | 366.6 (n=42) / 414.1 (n=36) |
| chartjs | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 294.3 (n=42) / 471.5 (n=24) | 265.7 (n=42) / 408.7 (n=24) |

Mean first-try output tokens are `usage.output_tokens` on the first answer. The second try is not included. Supported drops a correct unsupported answer. Recharts, ECharts, and Chart.js have no `repair()` step.
ChartKit `repair()`, measured at `bc7ee8e` with `checkChartKit` before the y-field list and combo mark patches: no docs 40 / 42, official 42 / 42. The two no-docs specs that `repair()` did not fix were stack-queue (`encoding.y.field` was an array) and combo-weather (`type: "bar"` on a y item). Recomputed on these same first-try outputs with the current `repair()` and the drawn-shape check: no docs 42 / 42, official 42 / 42. The recomputed rate is not the round-5 score.

Round 6 is the current scoreboard. It was run outside this repo at bench `5a026be`. One model, claude-sonnet-4-5, temperature 0, one run, 2026-10-16. The checker required drawn ChartKit shapes, including bars inside the plot. Raw rows are `bench/results/agent/round-6/`. A later change counts one rect per row per bar series. Every bar task in this run is a single series, so these scores stay the same. `bench/results/agent/conditions/` is gitignored local scratch and is not this scoreboard.

| Library | Round 6 no docs first | Round 6 no docs within two | Round 6 official first | Round 6 official within two | Round 6 no docs mean first-try output tokens, all / supported | Round 6 official mean first-try output tokens, all / supported |
|---|---:|---:|---:|---:|---:|---:|
| chartkit | 21 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 139.3 (n=42) / 139.3 (n=42) | 132.4 (n=42) / 132.4 (n=42) |
| recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 221.9 (n=42) / 343.5 (n=24) | 236.5 (n=42) / 327.1 (n=24) |
| echarts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 331.7 (n=42) / 373.5 (n=36) | 362.6 (n=42) / 409.2 (n=36) |
| chartjs | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 295.0 (n=42) / 472.8 (n=24) | 258.4 (n=42) / 396.7 (n=24) |

Mean first-try output tokens are `usage.output_tokens` on the first answer. The second try is not included. Supported drops a correct unsupported answer. Recharts, ECharts, and Chart.js have no `repair()` step.
ChartKit `repair()`, scored with `checkChartKit` on the first try and no model call: no docs 42 / 42, official 42 / 42.

`no docs` gives every library one paragraph of similar length: how to produce a drawn chart, and where the fields go. The paragraphs are the whole hint. They are not official docs, and ChartKit's paragraph does not add channel shapes the others do not get. `with docs` prepends that library's own official text, cut so it is no longer than ChartKit `llms.txt`. A pass requires drawn output. Recharts needs an SVG with data marks (Playwright, `createRoot` and `flushSync`; a detached container counts). Chart.js needs every canvas pixel scanned; a 32 by 32 sample is not enough. The chart type is read from the rendered chart. `meta.type` and `meta.values` are not evidence. ChartKit values are compared as numbers, and ChartKit bars have to sit inside the plot, one rect per row per bar series.

| Library | no docs hint | with docs | Bytes | Source |
|---|---|---|---:|---|
| chartkit | Return one JSON object. version is "1". type is the chart name. data is the rows, or a number array when the chart is a single series. a11y.alt is one sentence. encoding.x is the category or date field and encoding.y is the measure. The renderer draws that object. | ChartKit llms.txt | 6382 | https://chartkit.dev/llms.txt. This file is the llms.txt. Full file. This length is the cap. The other libraries are cut to this many bytes. |
| recharts | render() runs in a browser. renderToStaticMarkup returns an empty recharts-wrapper in Recharts 3.10.1 and draws nothing. Mount with react-dom/client createRoot and react-dom flushSync. Use a fixed width and height; ResponsiveContainer stays 0px. Put rows on data and field names on dataKey, and return the mounted markup. | Recharts getting started and quickstart | 6329 | https://mintlify.com/recharts/recharts/guides/getting-started.md. Also https://mintlify.com/recharts/recharts/quickstart.md. Official llms.txt index: https://mintlify.com/recharts/recharts/llms.txt. Recharts publishes an llms.txt index of links, not a spec. This excerpt is the official getting-started page plus the start of quickstart, cut to the ChartKit cap. The Mintlify index blurb at the top of each page was removed. |
| echarts | In Node, call echarts.init(null, null, { renderer: "svg", ssr: true, width, height }) and return chart.renderToSVGString(). The SVG has to include the series marks. Put the numbers in series.data. Code that touches document or window runs in a browser instead. | Apache ECharts handbook: Get Started and Import | 6077 | https://echarts.apache.org/handbook/en/get-started/. Also https://github.com/apache/echarts-handbook/blob/master/contents/en/basics/import.md. Official llms.txt index: https://echarts.apache.org/en/llms.txt. ECharts publishes an llms.txt index. The handbook link on that index is Get Started. This excerpt is that page plus Import ECharts, cut to the ChartKit cap. Apache License 2.0. |
| chartjs | render() runs in a browser document. Create a canvas, register every scale and controller you construct, and leave that canvas in the document. A canvas tag or a data URL with no painted pixels does not pass. Put the numbers in the dataset data. | Chart.js getting started: installation and usage | 6327 | https://www.chartjs.org/docs/latest/getting-started/. Also https://github.com/chartjs/Chart.js/blob/master/docs/getting-started/installation.md, https://github.com/chartjs/Chart.js/blob/master/docs/getting-started/usage.md. No official llms.txt. Chart.js does not publish an llms.txt. This excerpt is the official installation page plus the start of the usage guide, from the Chart.js docs (MIT), cut to the ChartKit cap. |

Run `BENCH_DOCS=none` and `BENCH_DOCS=official` separately. A local run writes `bench/results/agent/conditions/`, which is gitignored and is not the published scoreboard.

### Efficiency

Mean first-try output tokens are the average of `usage.output_tokens` on the first answer. The second try is not included. `repair()` is ChartKit only: parse the first-try JSON and apply `repair()` from `@chartkitdev/core/validate`, with no model call. The other libraries have no `repair()` step.

Computed from `bench/results/agent/sonnet-4-5/` (claude-sonnet-4-5, one attempt, no repair loop). That checker did not require a library import, so these rates are not round 4 and not round 5. The ChartKit column is how many of those first-try specs `repair()` accepts now.

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 231.2 (n=42) | 27 / 42 |
| recharts | 446.8 (n=42) | no repair() |
| echarts | 392.1 (n=42) | no repair() |
| chartjs | 355 (n=42) | no repair() |

Round 6 token means and the `checkChartKit` repair rate are in the current scoreboard above. `repair().ok` on the same first-try outputs, with no drawn-shape check:

Round 6 no docs, one model, one run, computed from `bench/results/agent/round-6/`:

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 139.3 (n=42) | 42 / 42 |
| recharts | 221.9 (n=42) | no repair() |
| echarts | 331.7 (n=42) | no repair() |
| chartjs | 295 (n=42) | no repair() |

Round 6 official, one model, one run, computed from `bench/results/agent/round-6/`:

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 132.4 (n=42) | 42 / 42 |
| recharts | 236.5 (n=42) | no repair() |
| echarts | 362.6 (n=42) | no repair() |
| chartjs | 258.4 (n=42) | no repair() |


## Reproduce

```bash
npm run bench
```

Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model. `BENCH_AGENT_LOG` checkpoints rows for resume. `BENCH_LIBRARIES` limits a run. `BENCH_DOCS=none` (the default) is the no-docs condition: one paragraph per library. `BENCH_DOCS=official` prepends that library's own doc. A finished run is also written to `bench/results/agent/conditions/`, which is gitignored local scratch and is not the published scoreboard. A failed validate, render, compile, or library-use check is sent back once.
