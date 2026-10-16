# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-16T15:40:22.418Z**, Node **v22.14.0**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/line 0.99.0, @nivo/bar 0.99.0, @nivo/pie 0.99.0, @observablehq/plot 0.6.17, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.

ChartKit is SVG-only. `mark.sampling` defaults to `auto` and uses minmax once a line is longer than twice the plot width. ECharts `sampling` was left off so the other libraries draw every point.

## Bundle size

esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. ChartKit entries bundle packages/core/src. Competitor entries use the pinned package and only the import that chart needs. ECharts uses echarts/core plus one chart, its grid component when the chart has axes, and CanvasRenderer.

| Library | Chart | Renderer | Status | min | gzip | brotli | gzip, React external |
|---|---|---|---|---:|---:|---:|---:|
| ChartKit minimal | line | svg | ok | 21971 | 8275 | 7507 | — |
| ChartKit minimal | bar | svg | ok | 16815 | 6406 | 5831 | — |
| ChartKit minimal | donut | svg | ok | 13234 | 5128 | 4673 | — |
| ChartKit all | line | svg | ok | 59468 | 19364 | 17010 | — |
| ChartKit all | bar | svg | ok | 59468 | 19364 | 17010 | — |
| ChartKit all | donut | svg | ok | 59468 | 19364 | 17010 | — |
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

Minimal line is 8275 gzip. Smaller than: uPlot 24038 gzip; Chart.js 49374 gzip; ECharts 162991 gzip; Recharts React-external 96213 gzip (React included 99718); Nivo React-external 96583 gzip (React included 100594); Observable Plot 97723 gzip. Not smaller than: none. No number: none.

Minimal bar is 6406 gzip. Smaller than: uPlot 24047 gzip; Chart.js 47530 gzip; ECharts 161020 gzip; Recharts React-external 95516 gzip (React included 98811); Nivo React-external 90441 gzip (React included 94417); Observable Plot 92953 gzip. Not smaller than: none. No number: none.

Minimal donut is 5128 gzip. Smaller than: Chart.js 46922 gzip; ECharts 122174 gzip; Recharts React-external 90090 gzip (React included 93493); Nivo React-external 75518 gzip (React included 79913). Not smaller than: none. No number: uPlot (unsupported); Observable Plot (unsupported).

ChartKit /all line bundle is 19364 gzip.

## Browser render

Playwright Chromium. Each sample is a fresh page. Reported times are the median of 5 samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Initial render and one full update (seed 2) are timed, then two animation frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width). An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off, and waits for the finished event. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 21.80 | 31.80 | 2557205 | 1201277 |
| ChartKit | svg | 10000 | ok | 17.00 | 28.80 | 3914580 | 2558652 |
| ChartKit | svg | 100000 | ok | 35.10 | 21.10 | 3628256 | 2272328 |
| ChartKit | svg | 1000000 | ok | 213.90 | 171.30 | 105056666 | 103700734 |
| uPlot | canvas | 1000 | ok | 18.30 | 33.10 | 3010966 | 1268263 |
| uPlot | canvas | 10000 | ok | 19.40 | 33.10 | 2396842 | 654139 |
| uPlot | canvas | 100000 | ok | 17.10 | 30.60 | 4740310 | 2997607 |
| uPlot | canvas | 1000000 | ok | 23.10 | 24.90 | 19299362 | 17556655 |
| Chart.js | canvas | 1000 | ok | 35.80 | 22.50 | 4644831 | 2282510 |
| Chart.js | canvas | 10000 | ok | 32.50 | 17.50 | 5909242 | 3546921 |
| Chart.js | canvas | 100000 | ok | 61.10 | 33.10 | 20965330 | 18603009 |
| Chart.js | canvas | 1000000 | ok | 332.40 | 181.20 | 154925431 | 152563106 |
| ECharts | canvas | 1000 | ok | 24.70 | 5.50 | 8886425 | 2933159 |
| ECharts | canvas | 10000 | ok | 34.20 | 12.00 | 12899922 | 6946644 |
| ECharts | canvas | 100000 | ok | 100.40 | 67.10 | 54841731 | 48888449 |
| ECharts | canvas | 1000000 | ok | 640.30 | 572.90 | 399427414 | 393474132 |
| Recharts | svg | 1000 | ok | 67.10 | 20.70 | 20681936 | 13604355 |
| Recharts | svg | 10000 | ok | 229.30 | 112.40 | 39082203 | 32004638 |
| Recharts | svg | 100000 | ok | 1799.70 | 965.50 | 165342108 | 158264527 |
| Recharts | svg | 1000000 | ok | 19039.90 | 10865.00 | 1350961005 | 1343883420 |
| Nivo | svg | 1000 | ok | 39.60 | 16.00 | 16880309 | 10590711 |
| Nivo | svg | 10000 | ok | 75.70 | 54.10 | 26154298 | 19864700 |
| Nivo | svg | 100000 | ok | 363.80 | 963.90 | 131194182 | 124903976 |
| Nivo | — | 1000000 | error | — | — | — | — |
| Observable Plot | svg | 1000 | ok | 17.30 | 32.80 | 8188651 | 4621900 |
| Observable Plot | svg | 10000 | ok | 29.20 | 48.80 | 9499483 | 5932732 |
| Observable Plot | svg | 100000 | ok | 96.00 | 1523.60 | 33628450 | 30061699 |
| Observable Plot | svg | 1000000 | ok | 744.30 | 26764.70 | 249349515 | 245782760 |

At 1000 points the fastest initial render is Observable Plot (svg) at 17.30 ms. ChartKit initial render is 21.80 ms, rank 3 of 7.

At 10000 points the fastest initial render is ChartKit (svg) at 17.00 ms. ChartKit initial render is 17.00 ms, rank 1 of 7.

At 100000 points the fastest initial render is uPlot (canvas) at 17.10 ms. ChartKit initial render is 35.10 ms, rank 2 of 7.

At 1000000 points the fastest initial render is uPlot (canvas) at 23.10 ms. ChartKit initial render is 213.90 ms, rank 2 of 6. Failed or skipped: Nivo error (Maximum call stack size exceeded).

### ChartKit before and after sampling

Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.

| Points | Before initial / update | After initial / update | Before note |
|---:|---:|---:|---|
| 1000 | 18.70 / 25.10 | 21.80 / 31.80 | full path |
| 10000 | 23.60 / 45.50 | 17.00 / 28.80 | full path |
| 100000 | 123.80 / 1202.30 | 35.10 / 21.10 | full path; update was one sample and slower than the error-SVG 1M row |
| 1000000 | 260.80 / 239.70 | 213.90 / 171.30 | error SVG, not a chart |

### Canvas

Not measured. This run downsamples ChartKit with `mark.sampling: "auto"` (minmax above twice the 572px plot width, so 1,000 points stay complete and 10k, 100k, and 1M do not). A Canvas renderer would draw the sampled points without an SVG path node. ECharts `sampling` stayed off.

## Server render

Same 1,000-point line (x[i] = i) for every library. Success means a chart was produced in Node without a DOM implementation. Timing is mean/median/min of 8 calls after 2 warmup calls.

| Library | Renderer | Status | Mean ms | Median ms | Min ms | Error |
|---|---|---|---:|---:|---:|---|
| ChartKit minimal | svg | ok | 1.80 | 1.50 | 0.73 | — |
| uPlot | canvas | unsupported | — | — | — | uPlot requires a DOM element. Node has no document. |
| Chart.js | canvas | unsupported | — | — | — | Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas. |
| Recharts | svg | unsupported | — | — | — | Recharts renderToStaticMarkup returned 127 characters and no <svg>: <div width="640" height="360" class="recharts-wrapper" style="position:relative;cursor:default;width:640px;height:360px"></div> |
| ECharts | svg | ok | 5.15 | 5.15 | 3.59 | — |
| Nivo | svg | ok | 56.24 | 54.55 | 51.08 | — |
| Observable Plot | svg | unsupported | — | — | — | Cannot read properties of undefined (reading 'documentElement') |

Server render succeeded for ChartKit minimal (1.80 ms mean), ECharts (5.15 ms mean), Nivo (56.24 ms mean). No server render without a DOM: uPlot, Chart.js, Recharts, Observable Plot.

## Agent first-try eval

Status: **not yet run**.

Skipped with --skip-agent. Set OPENAI_API_KEY or ANTHROPIC_API_KEY and run without that flag.

The fixed set has 42 tasks covering all 14 chart types. The runner asks for a ChartKit JSON spec and for Recharts, ECharts, and Chart.js modules, then checks validation or compilation, render, chart type, and fields. Chart.js and Recharts have no candlestick, gauge, heatmap, or KPI card; a correct reply for those is `meta.unsupported`. Nothing in this section is a model score.

## Reproduce

```bash
npm run bench
```

Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model.
