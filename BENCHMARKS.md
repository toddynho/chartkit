# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-16T15:19:52.560Z**, Node **v22.14.0**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/line 0.99.0, @nivo/bar 0.99.0, @nivo/pie 0.99.0, @observablehq/plot 0.6.17, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.

ChartKit is SVG-only today. Canvas libraries are expected to win once a line has hundreds of thousands of points. ECharts `sampling` was left off so every library draws every point.

## Bundle size

esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. ChartKit entries bundle packages/core/src. Competitor entries use the pinned package and only the import that chart needs. ECharts uses echarts/core plus one chart, its grid component when the chart has axes, and CanvasRenderer.

| Library | Chart | Renderer | Status | min | gzip | brotli | gzip, React external |
|---|---|---|---|---:|---:|---:|---:|
| ChartKit minimal | line | svg | ok | 17992 | 6739 | 6120 | — |
| ChartKit minimal | bar | svg | ok | 16624 | 6285 | 5721 | — |
| ChartKit minimal | donut | svg | ok | 13234 | 5126 | 4665 | — |
| ChartKit all | line | svg | ok | 55731 | 17728 | 15514 | — |
| ChartKit all | bar | svg | ok | 55731 | 17728 | 15514 | — |
| ChartKit all | donut | svg | ok | 55731 | 17728 | 15514 | — |
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

Minimal line is 6739 gzip. Smaller than: uPlot 24038 gzip; Chart.js 49374 gzip; ECharts 162991 gzip; Recharts React-external 96213 gzip (React included 99718); Nivo React-external 96583 gzip (React included 100594); Observable Plot 97723 gzip. Not smaller than: none. No number: none.

Minimal bar is 6285 gzip. Smaller than: uPlot 24047 gzip; Chart.js 47530 gzip; ECharts 161020 gzip; Recharts React-external 95516 gzip (React included 98811); Nivo React-external 90441 gzip (React included 94417); Observable Plot 92953 gzip. Not smaller than: none. No number: none.

Minimal donut is 5126 gzip. Smaller than: Chart.js 46922 gzip; ECharts 122174 gzip; Recharts React-external 90090 gzip (React included 93493); Nivo React-external 75518 gzip (React included 79913). Not smaller than: none. No number: uPlot (unsupported); Observable Plot (unsupported).

ChartKit /all line bundle is 17728 gzip.

## Browser render

Playwright Chromium. Each library is a fresh page. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Initial render and one full update (seed 2) are timed, then two animation frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none). uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off, and waits for the finished event. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 18.70 | 25.10 | 2573755 | 1248101 |
| ChartKit | svg | 10000 | ok | 23.60 | 45.50 | 5082607 | 3756953 |
| ChartKit | svg | 100000 | ok | 123.80 | 1202.30 | 33317499 | 31991845 |
| ChartKit | svg | 1000000 | ok | 260.80 | 239.70 | 134510587 | 133184929 |
| uPlot | canvas | 1000 | ok | 11.10 | 28.20 | 3020398 | 1277695 |
| uPlot | canvas | 10000 | ok | 14.90 | 33.40 | 2990322 | 1247619 |
| uPlot | canvas | 100000 | ok | 16.10 | 30.70 | 5081262 | 3338559 |
| uPlot | canvas | 1000000 | ok | 26.20 | 17.70 | 19326186 | 17583479 |
| Chart.js | canvas | 1000 | ok | 28.50 | 20.00 | 4648147 | 2285826 |
| Chart.js | canvas | 10000 | ok | 32.80 | 27.80 | 6644510 | 4282189 |
| Chart.js | canvas | 100000 | ok | 60.90 | 31.40 | 20066374 | 17704053 |
| Chart.js | canvas | 1000000 | ok | 347.50 | 176.20 | 154917871 | 152555546 |
| ECharts | canvas | 1000 | ok | 27.50 | 5.50 | 8795173 | 2841911 |
| ECharts | canvas | 10000 | ok | 34.60 | 12.70 | 12948042 | 6920756 |
| ECharts | canvas | 100000 | ok | 100.90 | 66.30 | 54895319 | 48942033 |
| ECharts | canvas | 1000000 | ok | 765.70 | 633.20 | 399420966 | 393467676 |
| Recharts | svg | 1000 | ok | 66.50 | 15.20 | 20671960 | 13605423 |
| Recharts | svg | 10000 | ok | 229.10 | 112.80 | 38562139 | 31484598 |
| Recharts | svg | 100000 | ok | 1833.60 | 961.90 | 164616520 | 157538951 |
| Recharts | svg | 1000000 | ok | 21868.80 | 18815.30 | 1352584169 | 1345506600 |
| Nivo | svg | 1000 | ok | 62.90 | 20.30 | 16871392 | 10582066 |
| Nivo | svg | 10000 | ok | 82.30 | 62.60 | 23886288 | 17596574 |
| Nivo | svg | 100000 | ok | 374.40 | 942.60 | 132478274 | 126188068 |
| Nivo | svg | 1000000 | ok | 829.90 | 639.90 | 373053155 | 366763437 |
| Observable Plot | svg | 1000 | ok | 24.60 | 33.30 | 8195599 | 4628848 |
| Observable Plot | svg | 10000 | ok | 29.00 | 42.00 | 10146499 | 6579748 |
| Observable Plot | svg | 100000 | ok | 100.80 | 1593.50 | 33894154 | 30327803 |
| Observable Plot | svg | 1000000 | ok | 831.40 | 25972.90 | 260831507 | 257265152 |

At 1000 points the fastest initial render is uPlot (canvas) at 11.10 ms. ChartKit initial render is 18.70 ms, rank 2 of 7.

At 10000 points the fastest initial render is uPlot (canvas) at 14.90 ms. ChartKit initial render is 23.60 ms, rank 2 of 7.

At 100000 points the fastest initial render is uPlot (canvas) at 16.10 ms. ChartKit initial render is 123.80 ms, rank 5 of 7.

At 1000000 points the fastest initial render is uPlot (canvas) at 26.20 ms. ChartKit initial render is 260.80 ms, rank 2 of 7.

### What a Canvas path or downsampling would need

Not measured. ChartKit's line renderer in this run builds one SVG path through every point (`curve: "linear"`, `points: "none"`) and the update replaces `innerHTML`. A Canvas renderer would draw those points without keeping a DOM path. Downsampling (min/max per pixel, or largest-triangle-three-buckets) would cap the path near two points per horizontal pixel of the 640px chart before that Canvas path exists. ECharts can do this with `sampling: "lttb"`; this run left it off.

## Server render

Same 1,000-point line (x[i] = i) for every library. Success means a chart was produced in Node without a DOM implementation. Timing is mean/median/min of 8 calls after 2 warmup calls.

| Library | Renderer | Status | Mean ms | Median ms | Min ms | Error |
|---|---|---|---:|---:|---:|---|
| ChartKit minimal | svg | ok | 2.83 | 2.53 | 1.62 | — |
| uPlot | canvas | unsupported | — | — | — | uPlot requires a DOM element. Node has no document. |
| Chart.js | canvas | unsupported | — | — | — | Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas. |
| Recharts | svg | unsupported | — | — | — | Recharts renderToStaticMarkup returned 127 characters and no <svg>: <div width="640" height="360" class="recharts-wrapper" style="position:relative;cursor:default;width:640px;height:360px"></div> |
| ECharts | svg | ok | 5.18 | 5.60 | 3.65 | — |
| Nivo | svg | ok | 59.70 | 56.75 | 48.48 | — |
| Observable Plot | svg | unsupported | — | — | — | Cannot read properties of undefined (reading 'documentElement') |

Server render succeeded for ChartKit minimal (2.83 ms mean), ECharts (5.18 ms mean), Nivo (59.70 ms mean). No server render without a DOM: uPlot, Chart.js, Recharts, Observable Plot.

## Agent first-try eval

Status: **not yet run**.

Skipped with --skip-agent. Set OPENAI_API_KEY or ANTHROPIC_API_KEY and run without that flag.

The fixed set has 42 tasks covering all 14 chart types. The runner asks for a ChartKit JSON spec and for Recharts, ECharts, and Chart.js modules, then checks validation or compilation, render, chart type, and fields. Chart.js and Recharts have no candlestick, gauge, heatmap, or KPI card; a correct reply for those is `meta.unsupported`. Nothing in this section is a model score.

## Reproduce

```bash
npm run bench
```

Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model.
