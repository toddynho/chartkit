# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-16T20:37:52.498Z**, Node **v22.14.0**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/line 0.99.0, @nivo/bar 0.99.0, @nivo/pie 0.99.0, @observablehq/plot 0.6.17, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.

ChartKit is SVG-only. `mark.sampling` defaults to `auto` and uses minmax once a line is longer than twice the plot width. ECharts `sampling` was left off so the other libraries draw every point.

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

Playwright Chromium. Each sample is a fresh page. Reported times are the median of 5 samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Initial render and one full update (seed 2) are timed, then two animation frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width). An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off, and waits for the finished event. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 10.70 | 33.00 | 2351313 | 982621 |
| ChartKit | svg | 10000 | ok | 10.10 | 33.20 | 2513512 | 1144820 |
| ChartKit | svg | 100000 | ok | 11.20 | 26.80 | 4373128 | 3004436 |
| ChartKit | svg | 1000000 | ok | 24.70 | 31.50 | 18938746 | 17570050 |
| uPlot | canvas | 1000 | ok | 19.60 | 33.10 | 3014446 | 1271743 |
| uPlot | canvas | 10000 | ok | 18.50 | 33.00 | 2393210 | 650507 |
| uPlot | canvas | 100000 | ok | 15.60 | 30.70 | 4753390 | 3010687 |
| uPlot | canvas | 1000000 | ok | 25.20 | 24.70 | 19410794 | 17668087 |
| Chart.js | canvas | 1000 | ok | 26.40 | 23.10 | 4660215 | 2297894 |
| Chart.js | canvas | 10000 | ok | 31.30 | 19.00 | 6625754 | 4263433 |
| Chart.js | canvas | 100000 | ok | 57.10 | 38.00 | 20944186 | 18581865 |
| Chart.js | canvas | 1000000 | ok | 335.30 | 185.50 | 154958011 | 152595686 |
| ECharts | canvas | 1000 | ok | 24.80 | 5.50 | 9100769 | 3147507 |
| ECharts | canvas | 10000 | ok | 33.10 | 12.50 | 12989942 | 7036652 |
| ECharts | canvas | 100000 | ok | 98.30 | 64.60 | 54836691 | 48883413 |
| ECharts | canvas | 1000000 | ok | 623.70 | 571.20 | 393332045 | 387378755 |
| Recharts | svg | 1000 | ok | 65.60 | 26.00 | 20650068 | 13572503 |
| Recharts | svg | 10000 | ok | 225.10 | 114.60 | 39301483 | 32223902 |
| Recharts | svg | 100000 | ok | 1790.70 | 947.30 | 173245670 | 166168089 |
| Recharts | svg | 1000000 | ok | 19482.30 | 11283.60 | 1351070949 | 1343993364 |
| Nivo | svg | 1000 | ok | 39.40 | 19.10 | 16856133 | 10566419 |
| Nivo | svg | 10000 | ok | 73.70 | 53.10 | 26179758 | 19890160 |
| Nivo | svg | 100000 | ok | 359.80 | 949.70 | 131787230 | 125497632 |
| Nivo | — | 1000000 | error | — | — | — | — |
| Observable Plot | svg | 1000 | ok | 17.30 | 33.10 | 8181855 | 4615104 |
| Observable Plot | svg | 10000 | ok | 28.80 | 47.60 | 9555439 | 5988688 |
| Observable Plot | svg | 100000 | ok | 98.30 | 1484.10 | 33655970 | 30089219 |
| Observable Plot | svg | 1000000 | ok | 730.20 | 25535.70 | 260573215 | 257006860 |

At 1000 points the fastest initial render is ChartKit (svg) at 10.70 ms. ChartKit initial render is 10.70 ms, rank 1 of 7.

At 10000 points the fastest initial render is ChartKit (svg) at 10.10 ms. ChartKit initial render is 10.10 ms, rank 1 of 7.

At 100000 points the fastest initial render is ChartKit (svg) at 11.20 ms. ChartKit initial render is 11.20 ms, rank 1 of 7.

At 1000000 points the fastest initial render is ChartKit (svg) at 24.70 ms. ChartKit initial render is 24.70 ms, rank 1 of 6. Failed or skipped: Nivo error (Maximum call stack size exceeded).

### ChartKit before and after sampling

Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.

| Points | Before initial / update | After initial / update | Before note |
|---:|---:|---:|---|
| 1000 | 18.70 / 25.10 | 10.70 / 33.00 | full path |
| 10000 | 23.60 / 45.50 | 10.10 / 33.20 | full path |
| 100000 | 123.80 / 1202.30 | 11.20 / 26.80 | full path; update was one sample and slower than the error-SVG 1M row |
| 1000000 | 260.80 / 239.70 | 24.70 / 31.50 | error SVG, not a chart |

### ChartKit before and after the typed-column path

Before is the median of 5 from 2026-10-16T15:40:22.418Z, after sampling was added and before typed columns stayed in place. After is this run. The machines can differ; the library table above is the same-machine comparison.

| Points | Before initial / update | After initial / update |
|---:|---:|---:|
| 1000 | 21.80 / 31.80 | 10.70 / 33.00 |
| 10000 | 17.00 / 28.80 | 10.10 / 33.20 |
| 100000 | 35.10 / 21.10 | 11.20 / 26.80 |
| 1000000 | 213.90 / 171.30 | 24.70 / 31.50 |

On a cold page, constructing `Intl.NumberFormat` for the tick labels was about 10 ms, and `Array.from` on a 100k Float64 column was about 6 ms. This run keeps those columns in place and formats `en-US` ticks without `Intl`. Replacing `innerHTML` with the sampled SVG measured 0.2 ms, and the next animation frames matched a mutation that did nothing. Writing the path `d` attribute in place matched `innerHTML`. A canvas renderer was not added: the sampled SVG is not what the 10k update time is waiting on. That wait is the harness's two animation frames after a synchronous paint. ECharts is timed on its `finished` event instead.

### Canvas

Not measured. This run downsamples ChartKit with `mark.sampling: "auto"` (minmax above twice the 572px plot width, so 1,000 points stay complete and 10k, 100k, and 1M do not). A Canvas renderer would draw the sampled points without an SVG path node. ECharts `sampling` stayed off.

## Server render

Same 1,000-point line (x[i] = i) for every library. Success means a chart was produced in Node without a DOM implementation. Timing is mean/median/min of 8 calls after 2 warmup calls.

| Library | Renderer | Status | Mean ms | Median ms | Min ms | Error |
|---|---|---|---:|---:|---:|---|
| ChartKit minimal | svg | ok | 0.67 | 0.67 | 0.51 | — |
| uPlot | canvas | unsupported | — | — | — | uPlot requires a DOM element. Node has no document. |
| Chart.js | canvas | unsupported | — | — | — | Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas. |
| Recharts | svg | unsupported | — | — | — | Recharts renderToStaticMarkup returned 127 characters and no <svg>: <div width="640" height="360" class="recharts-wrapper" style="position:relative;cursor:default;width:640px;height:360px"></div> |
| ECharts | svg | ok | 6.83 | 7.70 | 3.92 | — |
| Nivo | svg | ok | 59.60 | 60.70 | 49.81 | — |
| Observable Plot | svg | unsupported | — | — | — | Cannot read properties of undefined (reading 'documentElement') |

Server render succeeded for ChartKit minimal (0.67 ms mean), ECharts (6.83 ms mean), Nivo (59.60 ms mean). No server render without a DOM: uPlot, Chart.js, Recharts, Observable Plot.

## Agent first-try eval

Fair-scoring protocol on this branch: A code-library pass must import that library and return markup the library produced, or set `meta.unsupported` when the library cannot draw the chart. Chart.js runs in Playwright. ECharts code that touches `document` runs in Playwright; `echarts.init(null, …, { ssr: true })` stays in Node. Validator errors, render errors, compile errors, and library-use failures are fed back once. The first-try column ignores that repair.

Status of a fair-scoring run: **not yet run**.

Skipped with --skip-agent. Set OPENAI_API_KEY or ANTHROPIC_API_KEY and run without that flag.

The fixed set has 42 tasks covering all 14 chart types.

### Recorded run: claude-sonnet-4-5, published protocol

One run, temperature 0, max_tokens 4096, one attempt per task, no repair loop. Model **claude-sonnet-4-5** via Anthropic. The checker in that run did not require a library import: `render()` only had to return a string, and `meta.values` is written by the model. Those code-library rates are inflated. Raw rows are in `bench/results/agent/sonnet-4-5/`. The fair-scoring rerun (import and library markup required, Chart.js and browser-only ECharts in Playwright, one repair try) has not been run.

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

## Reproduce

```bash
npm run bench
```

Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model. `BENCH_AGENT_LOG` checkpoints rows for resume. `BENCH_LIBRARIES` and `BENCH_CHARTKIT_CONTEXT` limit a run. A failed validate, render, compile, or library-use check is sent back once.
