# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-28T00:30:27.624Z**, Node **v22.23.4**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/bar 0.99.0, @nivo/boxplot 0.99.0, @nivo/bullet 0.99.0, @nivo/funnel 0.99.0, @nivo/heatmap 0.99.0, @nivo/line 0.99.0, @nivo/pie 0.99.0, @nivo/radar 0.99.0, @nivo/radial-bar 0.99.0, @nivo/sankey 0.99.0, @nivo/scatterplot 0.99.0, @nivo/stream 0.99.0, @nivo/sunburst 0.99.0, @nivo/treemap 0.99.0, @observablehq/plot 0.6.17, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.

The round 13 ChartKit row is SVG. It uses `mark.sampling: "auto"` (minmax once a line is longer than twice the plot width). ChartKit sampling none is the same line with `mark.sampling: "none"`, measured only at 100,000 and 1,000,000 points. ECharts `sampling` stays off. Every update timer waits for that library's own completion and then the same two animation frames. ECharts completion is the `finished` event, and those two frames come after it. The canvas painter is a later measurement, in the canvas section, and it loses first paint at 10k, 100k, and 1M.

## Bundle size

esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. ChartKit entries bundle packages/core/src. Competitor entries use the pinned package and only the import that chart needs. ECharts uses echarts/core plus one chart, its grid component when the chart has axes, and CanvasRenderer.

| Library | Chart | Renderer | Status | min | gzip | brotli | gzip, React external |
|---|---|---|---|---:|---:|---:|---:|
| ChartKit minimal | line | svg | ok | 116070 | 41221 | 36235 | — |
| ChartKit minimal | bar | svg | ok | 114187 | 40779 | 35837 | — |
| ChartKit minimal | donut | svg | ok | 41731 | 15085 | 13622 | — |
| ChartKit all | line | svg | ok | 209075 | 73514 | 62454 | — |
| ChartKit all | bar | svg | ok | 209075 | 73514 | 62454 | — |
| ChartKit all | donut | svg | ok | 209075 | 73514 | 62454 | — |
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

Minimal line is 41221 gzip. Smaller than: Chart.js 49374 gzip; ECharts 162991 gzip; Recharts React-external 96213 gzip (React included 99718); Nivo React-external 96583 gzip (React included 100594); Observable Plot 97723 gzip. Not smaller than: uPlot 24038 gzip. No number: none.

Minimal bar is 40779 gzip. Smaller than: Chart.js 47530 gzip; ECharts 161020 gzip; Recharts React-external 95516 gzip (React included 98811); Nivo React-external 90441 gzip (React included 94417); Observable Plot 92953 gzip. Not smaller than: uPlot 24047 gzip. No number: none.

Minimal donut is 15085 gzip. Smaller than: Chart.js 46922 gzip; ECharts 122174 gzip; Recharts React-external 90090 gzip (React included 93493); Nivo React-external 75518 gzip (React included 79913). Not smaller than: none. No number: uPlot (unsupported); Observable Plot (unsupported).

ChartKit /all line bundle is 73514 gzip.

## Browser render

Playwright Chromium. Each sample is a fresh page. Reported times are the median of 5 samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Every library does its own update, then waits for the same two animation frames. ECharts also waits for its finished event before those frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width) and returns that synchronous build as renderMs before the two frames. ChartKit canvas is the same line with render canvas. It paints sampled points straight onto a canvas and builds SVG for the axes only, and renderMs includes that paint. It does not build the mark DOM. ChartKit sampling none is the same SVG line with mark.sampling none, measured only at 100k and 1M. An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library. Chart-type cells are in charts, not in rows.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 11.40 | 30.20 | 4067050 | 1975834 |
| ChartKit | svg | 10000 | ok | 12.80 | 30.90 | 4266165 | 2174949 |
| ChartKit | svg | 100000 | ok | 15.00 | 20.40 | 5742022 | 3650806 |
| ChartKit | svg | 1000000 | ok | 30.00 | 20.40 | 28889985 | 26798765 |
| ChartKit canvas | canvas | 1000 | ok | 23.20 | 17.30 | 4936490 | 2482557 |
| ChartKit canvas | canvas | 10000 | ok | 24.80 | 21.90 | 5249174 | 2795241 |
| ChartKit canvas | canvas | 100000 | ok | 25.50 | 21.80 | 6765738 | 4311805 |
| ChartKit canvas | canvas | 1000000 | ok | 38.30 | 28.40 | 29867298 | 27413361 |
| ChartKit sampling none | svg | 100000 | ok | 56.30 | 1202.40 | 20503955 | 18412661 |
| ChartKit sampling none | svg | 1000000 | ok | 540.20 | 22355.90 | 137785811 | 135694513 |
| uPlot | canvas | 1000 | ok | 15.80 | 33.20 | 3020761 | 1277444 |
| uPlot | canvas | 10000 | ok | 16.60 | 33.10 | 3062173 | 1318856 |
| uPlot | canvas | 100000 | ok | 14.90 | 30.60 | 4944597 | 3201280 |
| uPlot | canvas | 1000000 | ok | 25.30 | 21.20 | 19412369 | 17669048 |
| Chart.js | canvas | 1000 | ok | 26.60 | 23.60 | 4661638 | 2298703 |
| Chart.js | canvas | 10000 | ok | 31.10 | 18.40 | 6584053 | 4221118 |
| Chart.js | canvas | 100000 | ok | 58.60 | 34.40 | 20051169 | 17688234 |
| Chart.js | canvas | 1000000 | ok | 359.10 | 192.60 | 154965730 | 152602791 |
| ECharts | canvas | 1000 | ok | 37.90 | 19.80 | 14410441 | 8456617 |
| ECharts | canvas | 10000 | ok | 98.30 | 72.30 | 16043958 | 10089402 |
| ECharts | canvas | 100000 | ok | 2392.40 | 2728.40 | 60711499 | 54756947 |
| ECharts | canvas | 1000000 | ok | 34611.20 | 35579.00 | 404407213 | 398452641 |
| Recharts | svg | 1000 | ok | 82.30 | 24.30 | 20641127 | 13562932 |
| Recharts | svg | 10000 | ok | 267.60 | 127.20 | 37703466 | 30625271 |
| Recharts | svg | 100000 | ok | 2166.80 | 1084.70 | 165634567 | 158556388 |
| Recharts | svg | 1000000 | ok | 21302.30 | 12336.20 | 1350685868 | 1343607669 |
| Nivo | svg | 1000 | ok | 41.50 | 18.80 | 16871630 | 10581690 |
| Nivo | svg | 10000 | ok | 76.30 | 56.20 | 26194329 | 19904117 |
| Nivo | svg | 100000 | ok | 372.70 | 946.70 | 131352681 | 125062469 |
| Nivo | svg | 1000000 | error | — | — | — | — |
| Observable Plot | svg | 1000 | ok | 17.90 | 25.10 | 8189522 | 4622157 |
| Observable Plot | svg | 10000 | ok | 29.80 | 44.40 | 9551606 | 5984853 |
| Observable Plot | svg | 100000 | ok | 104.40 | 1544.30 | 33656585 | 30089224 |
| Observable Plot | svg | 1000000 | ok | 911.90 | 25708.70 | 260103846 | 256536477 |

At 1000 points the fastest initial render is ChartKit (svg) at 11.40 ms. ChartKit initial render is 11.40 ms, rank 1 of 8.

At 10000 points the fastest initial render is ChartKit (svg) at 12.80 ms. ChartKit initial render is 12.80 ms, rank 1 of 8.

At 100000 points the fastest initial render is uPlot (canvas) at 14.90 ms. ChartKit initial render is 15.00 ms, rank 2 of 9.

At 1000000 points the fastest initial render is uPlot (canvas) at 25.30 ms. ChartKit initial render is 30.00 ms, rank 2 of 8. Failed or skipped: Nivo error (Maximum call stack size exceeded).

### Chart type paint

Phase 2 paints ChartKit and the libraries already timed on the line sweep: uPlot, Chart.js, ECharts, Recharts, Nivo, and Observable Plot. One cell per gallery type from apps/web/src/data/chart-types.ts. There is no type id area. The homepage row area is native stacked-area (full size, four series). A single filled line stays type line with mark.area true. mini-area is one filled series with the axes off, in the same 640×360 frame. Line cells are projected from the existing line sweep and are not measured again. Every other native cell uses the same point count as the ChartKit cell for that type, and the same data shape. The timer matches the line sweep: build data before the clock, paint, then wait for two animation frames. ECharts also waits for finished. The reported time is the median of BENCH_SAMPLES fresh pages (default 5) at 640×360. ChartKit updates are a second full SVG replacement. An error SVG (ck-chart-error) fails the sample. A cell is status unsupported, with a reason and no invented time, when that library has no native chart of that shape. Stand-ins are not timed: a pie made from bars, a waterfall made from a transparent helper bar, a histogram made from bars we binned ourselves, a sparkline made by hiding the axes on the line cell, a spike drawn as a bar, Plot.spike (a fixed-pixel vector), the uPlot candlestick demo path, an ECharts custom series, or the ECharts timeline playback control. Nivo cells use the 0.99.0 package for that chart, the same version as the pinned line, bar, and pie. A missing license key is status blocked. This phase does not add commercial libraries. gzipBytes and ssrMs stay null until a later phase. Later paint, bundle, and SSR phases add a cell per library, including commercial compare-matrix rivals (Highcharts, amCharts, ApexCharts community and commercial builds, AG Charts enterprise, MUI X Pro and Premium, and the same class of product). Use the published npm or CDN build a customer would install. Record license and watermark limits on the cell. A missing license key is status blocked with a note, not a silent omission and not a reason to drop the rest of that set. unsupported means that library has no native chart of that type. gzipBytes and ssrMs stay null until those phases fill them.

Homepage row `area` is native `stacked-area`. `gzipBytes` and `ssrMs` are null until a later phase. A full run writes the same cells to `bench/results/latest.json` under `browser.charts` and to `bench/results/paint.json`. One-sample runs write `bench/results/paint-smoke.json` and are not published medians. Unsupported cells are an honest omit: no native chart of that shape, and no invented time.

| Chart | Homepage | Library | Variant | Renderer | N | Status | Initial ms | Update ms | gzip | SSR ms | N means |
|---|---|---|---|---|---:|---|---:|---:|---:|---:|---|
| line | line | Chart.js | — | canvas | 1000 | ok | 26.60 | 23.60 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 1000 | ok | 11.40 | 30.20 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 1000 | ok | 23.20 | 17.30 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 1000 | ok | 37.90 | 19.80 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 1000 | ok | 41.50 | 18.80 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 1000 | ok | 17.90 | 25.10 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 1000 | ok | 82.30 | 24.30 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 1000 | ok | 15.80 | 33.20 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 10000 | ok | 31.10 | 18.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 10000 | ok | 12.80 | 30.90 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 10000 | ok | 24.80 | 21.90 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 10000 | ok | 98.30 | 72.30 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 10000 | ok | 76.30 | 56.20 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 10000 | ok | 29.80 | 44.40 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 10000 | ok | 267.60 | 127.20 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 10000 | ok | 16.60 | 33.10 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 100000 | ok | 58.60 | 34.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 100000 | ok | 15.00 | 20.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 100000 | ok | 25.50 | 21.80 | — | — | points in one series; x[i] = i |
| line | line | ChartKit sampling none | sampling-none | svg | 100000 | ok | 56.30 | 1202.40 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 100000 | ok | 2392.40 | 2728.40 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 100000 | ok | 372.70 | 946.70 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 100000 | ok | 104.40 | 1544.30 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 100000 | ok | 2166.80 | 1084.70 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 100000 | ok | 14.90 | 30.60 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 1000000 | ok | 359.10 | 192.60 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 1000000 | ok | 30.00 | 20.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 1000000 | ok | 38.30 | 28.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit sampling none | sampling-none | svg | 1000000 | ok | 540.20 | 22355.90 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 1000000 | ok | 34611.20 | 35579.00 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 1000000 | error | — | — | — | — | points in one series; x[i] = i — Projected from the existing line sweep. The type matrix does not paint line a second time. — Maximum call stack size exceeded |
| line | line | Observable Plot | — | svg | 1000000 | ok | 911.90 | 25708.70 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 1000000 | ok | 21302.30 | 12336.20 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 1000000 | ok | 25.30 | 21.20 | — | — | points in one series; x[i] = i |
| bar | bar | Chart.js | — | canvas | 48 | ok | 26.70 | 22.80 | — | — | categories; one series |
| bar | bar | ChartKit | — | svg | 48 | ok | 16.40 | 33.60 | — | — | categories; one series |
| bar | bar | ECharts | — | canvas | 48 | ok | 35.00 | 12.20 | — | — | categories; one series |
| bar | bar | Nivo | — | svg | 48 | ok | 49.10 | 23.50 | — | — | categories; one series |
| bar | bar | Observable Plot | — | svg | 48 | ok | 16.80 | 31.80 | — | — | categories; one series |
| bar | bar | Recharts | — | svg | 48 | ok | 51.60 | 23.40 | — | — | categories; one series |
| bar | bar | uPlot | — | canvas | 48 | ok | 16.60 | 33.30 | — | — | categories; one series |
| pie | — | Chart.js | — | canvas | 8 | ok | 15.20 | 33.20 | — | — | slices |
| pie | — | ChartKit | — | svg | 8 | ok | 24.40 | 33.00 | — | — | slices |
| pie | — | ECharts | — | canvas | 8 | ok | 26.40 | 15.40 | — | — | slices |
| pie | — | Nivo | — | svg | 8 | ok | 23.30 | 21.70 | — | — | slices |
| pie | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | slices — No pie or donut mark. |
| pie | — | Recharts | — | svg | 8 | ok | 28.40 | 22.30 | — | — | slices |
| pie | — | uPlot | — | — | 8 | unsupported | — | — | — | — | slices — No pie series. |
| donut | donut | Chart.js | — | canvas | 8 | ok | 12.30 | 33.50 | — | — | slices |
| donut | donut | ChartKit | — | svg | 8 | ok | 17.90 | 33.20 | — | — | slices |
| donut | donut | ECharts | — | canvas | 8 | ok | 26.10 | 15.40 | — | — | slices |
| donut | donut | Nivo | — | svg | 8 | ok | 23.10 | 15.70 | — | — | slices |
| donut | donut | Observable Plot | — | — | 8 | unsupported | — | — | — | — | slices — No pie or donut mark. |
| donut | donut | Recharts | — | svg | 8 | ok | 28.50 | 19.10 | — | — | slices |
| donut | donut | uPlot | — | — | 8 | unsupported | — | — | — | — | slices — No donut series. |
| stacked-area | area | Chart.js | — | canvas | 100000 | ok | 691.40 | 687.40 | — | — | x positions; 4 stacked series |
| stacked-area | area | ChartKit | — | svg | 100000 | ok | 52.20 | 49.90 | — | — | x positions; 4 stacked series |
| stacked-area | area | ECharts | — | canvas | 100000 | ok | 18911.80 | 18589.10 | — | — | x positions; 4 stacked series |
| stacked-area | area | Nivo | — | svg | 100000 | error | — | — | — | — | x positions; 4 stacked series — @nivo/stream with offsetType none, a zero-baseline stack of the four series. Not the wiggle offset. Nivo's stream memo throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error. — Maximum call stack size exceeded |
| stacked-area | area | Observable Plot | — | svg | 100000 | ok | 606.10 | 5302.60 | — | — | x positions; 4 stacked series |
| stacked-area | area | Recharts | — | svg | 100000 | error | — | — | — | — | x positions; 4 stacked series — AreaChart with four Area elements that share stackId. Recharts walks that stacked domain recursively and throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error. — Maximum call stack size exceeded |
| stacked-area | area | uPlot | — | — | 100000 | unsupported | — | — | — | — | x positions; 4 stacked series — A series can fill to a baseline, but uPlot has no stack. One filled series is the mini-area cell. |
| scatter | scatter | Chart.js | — | canvas | 100000 | ok | 273.50 | 248.20 | — | — | points |
| scatter | scatter | ChartKit | — | svg | 100000 | ok | 3667.30 | 3581.00 | — | — | points |
| scatter | scatter | ECharts | — | canvas | 100000 | ok | 9044.40 | 9112.00 | — | — | points |
| scatter | scatter | Nivo | — | canvas | 100000 | ok | 402.80 | 335.30 | — | — | points |
| scatter | scatter | Observable Plot | — | svg | 100000 | ok | 522.20 | 629.90 | — | — | points |
| scatter | scatter | Recharts | — | svg | 100000 | ok | 5985.00 | 11852.40 | — | — | points |
| scatter | scatter | uPlot | — | canvas | 100000 | ok | 128.60 | 111.20 | — | — | points |
| combo | — | Chart.js | — | canvas | 48 | ok | 28.20 | 20.40 | — | — | categories; one bar series and one line series |
| combo | — | ChartKit | — | svg | 48 | ok | 13.90 | 26.90 | — | — | categories; one bar series and one line series |
| combo | — | ECharts | — | canvas | 48 | ok | 39.80 | 15.50 | — | — | categories; one bar series and one line series |
| combo | — | Nivo | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No combo chart and no second y scale. |
| combo | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No second y scale. A bar and a line on one scale would squash the margin series. |
| combo | — | Recharts | — | svg | 48 | ok | 56.00 | 22.70 | — | — | categories; one bar series and one line series |
| combo | — | uPlot | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No combo and no second scale. A bar and a line on one scale would squash the margin series. |
| heatmap | heatmap | Chart.js | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap controller. |
| heatmap | heatmap | ChartKit | — | svg | 1200 | ok | 44.70 | 43.40 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | ECharts | — | canvas | 1200 | ok | 53.20 | 27.00 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Nivo | — | svg | 1200 | ok | 418.40 | 432.40 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Observable Plot | — | svg | 1200 | ok | 22.60 | 24.50 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Recharts | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap chart. |
| heatmap | heatmap | uPlot | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap series. |
| gauge | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge controller. |
| gauge | — | ChartKit | — | svg | 1 | ok | 13.00 | 30.10 | — | — | one metric |
| gauge | — | ECharts | — | canvas | 1 | ok | 26.90 | 20.90 | — | — | one metric |
| gauge | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge package in Nivo 0.99.0. |
| gauge | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge mark. |
| gauge | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge chart. |
| gauge | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge series. |
| kpi | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | ChartKit | — | svg | 1 | ok | 23.80 | 33.40 | — | — | one metric; sparkline fixed at 24 |
| kpi | — | ECharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| sparkline | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | ChartKit | — | svg | 100000 | ok | 20.60 | 19.30 | — | — | values in a number array |
| sparkline | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| mini-area | — | Chart.js | — | canvas | 100000 | ok | 49.30 | 34.70 | — | — | values in a number array |
| mini-area | — | ChartKit | — | svg | 100000 | ok | 23.40 | 83.00 | — | — | values in a number array |
| mini-area | — | ECharts | — | canvas | 100000 | ok | 124.50 | 78.90 | — | — | values in a number array |
| mini-area | — | Nivo | — | svg | 100000 | ok | 308.90 | 270.30 | — | — | values in a number array |
| mini-area | — | Observable Plot | — | svg | 100000 | ok | 60.90 | 53.20 | — | — | values in a number array |
| mini-area | — | Recharts | — | svg | 100000 | ok | 236.10 | 133.90 | — | — | values in a number array |
| mini-area | — | uPlot | — | canvas | 100000 | ok | 10.60 | 29.10 | — | — | values in a number array |
| progress-ring | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | ChartKit | — | svg | 1 | ok | 20.90 | 33.20 | — | — | one metric |
| progress-ring | — | ECharts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| spike | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | ChartKit | — | svg | 100000 | ok | 67.00 | 57.40 | — | — | points |
| spike | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | points — Plot.spike is a fixed-pixel vector, not a value-height spike from the baseline. |
| spike | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| candlestick | — | Chart.js | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick controller. |
| candlestick | — | ChartKit | — | svg | 2000 | ok | 70.80 | 63.40 | — | — | OHLC candles, plus volume |
| candlestick | — | ECharts | — | canvas | 2000 | ok | 74.00 | 33.60 | — | — | OHLC candles, plus volume |
| candlestick | — | Nivo | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick package in Nivo 0.99.0. |
| candlestick | — | Observable Plot | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Recharts | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick chart. |
| candlestick | — | uPlot | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — The candlestick in the uPlot demos is a custom path, not a built-in series. |
| candlestick | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick controller. |
| candlestick | — | ChartKit | — | svg | 100000 | error | — | — | — | — | OHLC candles, plus volume — No sampling; every candle is drawn. 2,000 is a long series that still builds. 100,000 candles put about 200,000 prices into one Math.max spread, which throws past about 150,000 numbers in V8. That larger cell stays in the matrix so a throw is status error, not a missing row. If a runtime paints it, the timing is real. — page.evaluate: Error: error[CK1006]: render failed: Maximum call stack size exceeded at paint2 (/workspace/bench/.out/browser/chartkit-candlestick.js:2878:15) at timed (/workspace/bench/.out/browser/chartkit-candlestick.js:2845:26) at Object.run (/workspace/bench/.out/browser/chartkit-candlestick.js:2883:12) at eval (eval at evaluate (:370:30), <anonymous>:1:27) at UtilityScript.evaluate (<anonymous>:372:16) at UtilityScript.<anonymous> (<anonymous>:1:44) |
| candlestick | — | ECharts | — | canvas | 100000 | ok | 2847.30 | 2660.10 | — | — | OHLC candles, plus volume |
| candlestick | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick package in Nivo 0.99.0. |
| candlestick | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick chart. |
| candlestick | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — The candlestick in the uPlot demos is a custom path, not a built-in series. |
| histogram | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | ChartKit | — | svg | 100000 | ok | 27.20 | 18.00 | — | — | observations before binning |
| histogram | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | Observable Plot | — | svg | 100000 | ok | 48.00 | 31.50 | — | — | observations before binning |
| histogram | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| boxplot | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot controller. |
| boxplot | — | ChartKit | — | svg | 100000 | ok | 53.30 | 44.30 | — | — | observations across 8 categories |
| boxplot | — | ECharts | — | canvas | 100000 | ok | 74.70 | 49.30 | — | — | observations across 8 categories |
| boxplot | — | Nivo | — | svg | 100000 | ok | 87.10 | 61.60 | — | — | observations across 8 categories |
| boxplot | — | Observable Plot | — | svg | 100000 | ok | 226.30 | 187.20 | — | — | observations across 8 categories |
| boxplot | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot chart. |
| boxplot | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot series. |
| radar | — | Chart.js | — | canvas | 8 | ok | 23.10 | 19.60 | — | — | spokes; 3 series |
| radar | — | ChartKit | — | svg | 8 | ok | 23.80 | 33.30 | — | — | spokes; 3 series |
| radar | — | ECharts | — | canvas | 8 | ok | 30.20 | 25.50 | — | — | spokes; 3 series |
| radar | — | Nivo | — | svg | 8 | ok | 27.60 | 18.80 | — | — | spokes; 3 series |
| radar | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | spokes; 3 series — No radar mark. |
| radar | — | Recharts | — | svg | 8 | ok | 36.20 | 16.60 | — | — | spokes; 3 series |
| radar | — | uPlot | — | — | 8 | unsupported | — | — | — | — | spokes; 3 series — No radar series. |
| funnel | — | Chart.js | — | — | 8 | unsupported | — | — | — | — | stages — No funnel controller. |
| funnel | — | ChartKit | — | svg | 8 | ok | 23.00 | 33.10 | — | — | stages |
| funnel | — | ECharts | — | canvas | 8 | ok | 22.50 | 22.40 | — | — | stages |
| funnel | — | Nivo | — | svg | 8 | ok | 30.10 | 24.50 | — | — | stages |
| funnel | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | stages — No funnel mark. |
| funnel | — | Recharts | — | svg | 8 | ok | 24.30 | 16.70 | — | — | stages |
| funnel | — | uPlot | — | — | 8 | unsupported | — | — | — | — | stages — No funnel series. |
| treemap | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — No treemap controller. |
| treemap | — | ChartKit | — | svg | 48 | ok | 22.90 | 33.50 | — | — | tiles; 6 color groups |
| treemap | — | ECharts | — | canvas | 48 | ok | 34.80 | 948.00 | — | — | tiles; 6 color groups |
| treemap | — | Nivo | — | svg | 48 | ok | 42.20 | 19.60 | — | — | tiles; 6 color groups |
| treemap | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — The tree mark is a node-link layout, not a treemap. |
| treemap | — | Recharts | — | svg | 48 | ok | 33.00 | 16.90 | — | — | tiles; 6 color groups |
| treemap | — | uPlot | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — No treemap series. |
| sankey | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey controller. |
| sankey | — | ChartKit | — | svg | 48 | ok | 23.90 | 33.30 | — | — | links across 4 layers |
| sankey | — | ECharts | — | canvas | 48 | ok | 32.40 | 18.50 | — | — | links across 4 layers |
| sankey | — | Nivo | — | svg | 48 | ok | 44.40 | 18.90 | — | — | links across 4 layers |
| sankey | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey mark. |
| sankey | — | Recharts | — | svg | 48 | ok | 26.30 | 17.40 | — | — | links across 4 layers |
| sankey | — | uPlot | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey series. |
| bullet | — | Chart.js | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | ChartKit | — | svg | 6 | ok | 13.50 | 29.30 | — | — | rows, each with a target and three ranges |
| bullet | — | ECharts | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | Nivo | — | svg | 6 | ok | 43.60 | 15.00 | — | — | rows, each with a target and three ranges |
| bullet | — | Observable Plot | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | Recharts | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | uPlot | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| waterfall | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | ChartKit | — | svg | 12 | ok | 21.80 | 33.30 | — | — | steps, including the opening and closing totals |
| waterfall | — | ECharts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Nivo | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Recharts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | uPlot | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| area-range | — | Chart.js | — | canvas | 100000 | ok | 383.80 | 345.40 | — | — | x positions; low, high, and a centre line |
| area-range | — | ChartKit | — | svg | 100000 | ok | 189.50 | 2781.50 | — | — | x positions; low, high, and a centre line |
| area-range | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No area-range series. A transparent stacked helper is not this chart. |
| area-range | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No area-range package in Nivo 0.99.0. |
| area-range | — | Observable Plot | — | svg | 100000 | ok | 228.90 | 4342.80 | — | — | x positions; low, high, and a centre line |
| area-range | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No band series. ReferenceArea is an annotation, not a series. |
| area-range | — | uPlot | — | canvas | 100000 | ok | 44.70 | 38.00 | — | — | x positions; low, high, and a centre line |
| bar-range | — | Chart.js | — | canvas | 24 | ok | 24.10 | 24.90 | — | — | floating bars |
| bar-range | — | ChartKit | — | svg | 24 | ok | 22.10 | 33.30 | — | — | floating bars |
| bar-range | — | ECharts | — | — | 24 | unsupported | — | — | — | — | floating bars — No floating-bar data. A transparent stacked helper is not this chart. |
| bar-range | — | Nivo | — | — | 24 | unsupported | — | — | — | — | floating bars — No floating-bar chart in Nivo 0.99.0. |
| bar-range | — | Observable Plot | — | svg | 24 | ok | 15.50 | 32.50 | — | — | floating bars |
| bar-range | — | Recharts | — | svg | 24 | ok | 47.00 | 20.70 | — | — | floating bars |
| bar-range | — | uPlot | — | canvas | 24 | ok | 14.90 | 33.30 | — | — | floating bars |
| errorbar | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar element in chart.js core. |
| errorbar | — | ChartKit | — | svg | 24 | ok | 21.80 | 33.40 | — | — | points with low and high whiskers |
| errorbar | — | ECharts | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar series. A custom series can draw anything and is not this chart. |
| errorbar | — | Nivo | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar package in Nivo 0.99.0. |
| errorbar | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar mark. |
| errorbar | — | Recharts | — | svg | 24 | ok | 58.80 | 23.60 | — | — | points with low and high whiskers |
| errorbar | — | uPlot | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar series. |
| gantt | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | ChartKit | — | svg | 24 | ok | 17.00 | 33.10 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | ECharts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Nivo | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Recharts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | uPlot | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| timeline | — | Chart.js | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | ChartKit | — | svg | 16 | ok | 9.20 | 33.30 | — | — | events and periods |
| timeline | — | ECharts | — | — | 16 | unsupported | — | — | — | — | events and periods — The timeline component is a playback control, not an event timeline. |
| timeline | — | Nivo | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Observable Plot | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Recharts | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | uPlot | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| quadrant | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | ChartKit | — | svg | 24 | ok | 9.30 | 33.50 | — | — | labeled points on a unit square |
| quadrant | — | ECharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Nivo | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Recharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | uPlot | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| venn | — | Chart.js | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | ChartKit | — | svg | 3 | ok | 10.80 | 31.30 | — | — | sets; the data has 7 region rows |
| venn | — | ECharts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Nivo | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Observable Plot | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Recharts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | uPlot | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| journey | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | ChartKit | — | svg | 12 | ok | 23.30 | 33.20 | — | — | steps scored 1 to 5 |
| journey | — | ECharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Nivo | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Recharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | uPlot | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| radial-bar | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No radial bar controller. polarArea is the rose cell. |
| radial-bar | — | ChartKit | — | svg | 12 | ok | 21.70 | 33.30 | — | — | categories around a circle |
| radial-bar | — | ECharts | — | canvas | 12 | ok | 33.60 | 18.00 | — | — | categories around a circle |
| radial-bar | — | Nivo | — | svg | 12 | ok | 33.50 | 23.70 | — | — | categories around a circle |
| radial-bar | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No radial bar mark. |
| radial-bar | — | Recharts | — | svg | 12 | ok | 30.10 | 14.40 | — | — | categories around a circle |
| radial-bar | — | uPlot | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No polar bar series. |
| rose | — | Chart.js | — | canvas | 12 | ok | 20.30 | 26.20 | — | — | equal-angle slices |
| rose | — | ChartKit | — | svg | 12 | ok | 13.80 | 29.70 | — | — | equal-angle slices |
| rose | — | ECharts | — | canvas | 12 | ok | 27.50 | 16.90 | — | — | equal-angle slices |
| rose | — | Nivo | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area package in Nivo 0.99.0. |
| rose | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area mark. |
| rose | — | Recharts | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area chart. RadialBar is the radial-bar cell. |
| rose | — | uPlot | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No polar area or rose series. |
| sunburst | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst controller. |
| sunburst | — | ChartKit | — | svg | 48 | ok | 23.30 | 33.40 | — | — | leaves under 6 branches |
| sunburst | — | ECharts | — | canvas | 48 | ok | 30.50 | 15.00 | — | — | leaves under 6 branches |
| sunburst | — | Nivo | — | svg | 48 | ok | 36.60 | 17.30 | — | — | leaves under 6 branches |
| sunburst | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst mark. |
| sunburst | — | Recharts | — | svg | 48 | ok | 29.60 | 16.80 | — | — | leaves under 6 branches |
| sunburst | — | uPlot | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst series. |
| bar-list | — | Chart.js | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | ChartKit | — | svg | 20 | ok | 14.10 | 29.80 | — | — | ranked rows |
| bar-list | — | ECharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Nivo | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Observable Plot | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Recharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | uPlot | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |

Chart-type cells that failed: Nivo line n=1000000 error, ChartKit candlestick n=100000 error, Recharts stacked-area n=100000 error, Nivo stacked-area n=100000 error.
136 cells are unsupported: the library has no native chart of that shape, and the time is null.

At 10,000 points the fastest update is Chart.js at 18.40 ms. ChartKit update is 30.90 ms (samples 31.90, 32.50, 26.90, 30.90, 29.70). Those samples sit on the two-frame wait. The sampled SVG replacement is not a separate hotspot in that cell. ChartKit sampling none at 100,000 points is 56.30 ms initial and 1202.40 ms update. At 1,000,000 points with sampling none the status is ok (540.20 ms initial, 22355.90 ms update). ECharts at 100,000 points updates in 2728.40 ms; the shared frames now wait for that canvas to paint, which the old finished-only timer did not.

### ChartKit before and after sampling

Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.

| Points | Before initial / update | After initial / update | Before note |
|---:|---:|---:|---|
| 1000 | 18.70 / 25.10 | 11.40 / 30.20 | full path |
| 10000 | 23.60 / 45.50 | 12.80 / 30.90 | full path |
| 100000 | 123.80 / 1202.30 | 15.00 / 20.40 | full path; update was one sample and slower than the error-SVG 1M row |
| 1000000 | 260.80 / 239.70 | 30.00 / 20.40 | error SVG, not a chart |

### ChartKit before and after the typed-column path

Before is the median of 5 from 2026-10-16T15:40:22.418Z, after sampling was added and before typed columns stayed in place. After is this run. The machines can differ; the library table above is the same-machine comparison.

| Points | Before initial / update | After initial / update |
|---:|---:|---:|
| 1000 | 21.80 / 31.80 | 11.40 / 30.20 |
| 10000 | 17.00 / 28.80 | 12.80 / 30.90 |
| 100000 | 35.10 / 21.10 | 15.00 / 20.40 |
| 1000000 | 213.90 / 171.30 | 30.00 / 20.40 |

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
| ChartKit minimal | svg | ok | 1.48 | 1.53 | 0.72 | — |
| uPlot | canvas | unsupported | — | — | — | uPlot requires a DOM element. Node has no document. |
| Chart.js | canvas | unsupported | — | — | — | Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas. |
| Recharts | svg | unsupported | — | — | — | Recharts renderToStaticMarkup returned 127 characters and no <svg>: <div width="640" height="360" class="recharts-wrapper" style="position:relative;cursor:default;width:640px;height:360px"></div> |
| ECharts | svg | ok | 6.18 | 6.15 | 4.47 | — |
| Nivo | svg | ok | 59.00 | 57.61 | 55.25 | — |
| Observable Plot | svg | unsupported | — | — | — | Cannot read properties of undefined (reading 'documentElement') |

Server render succeeded for ChartKit minimal (1.48 ms mean), ECharts (6.18 ms mean), Nivo (59.00 ms mean). No server render without a DOM: uPlot, Chart.js, Recharts, Observable Plot.

## Agent first-try eval

Fair-scoring protocol on this branch: A code-library pass must import that library and return a drawn chart, or set `meta.unsupported` when the library cannot draw the chart. Recharts, Chart.js, and Observable Plot run in Playwright. A Recharts pass needs an SVG with data marks. A Chart.js pass needs painted canvas pixels. Observable Plot must return the SVG from `Plot.plot` (its versioned `plot-` class) and the checker reads the mark that was called. ECharts code that touches `document` runs in Playwright; `echarts.init(null, …, { ssr: true })` stays in Node and the SVG must contain marks. The chart type is read from that rendered chart (Chart.js `config.type`, ECharts series type, Recharts `chartName`, Plot mark name). `meta.type` is not evidence. Data values come from the rendered chart, not from `meta`. ChartKit values are compared as numbers. Validator errors, render errors, compile errors, and library-use failures are fed back once. ChartKit `repair()` can accept the answer with no second model call, and that repair does not count as a call. The first-try column ignores that repair. Homepage token medians come from the token matrix below, not from this first-try table.

Status of a fair-scoring run: **not yet run**.

Skipped with --skip-agent. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY and run without that flag. The publishable token matrix is npm run bench:agent-matrix.

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
| `catalog/public/llms.txt` as shipped (recorded as 5.9 KB) | 18 / 42 | donut ×3, combo ×3, heatmap ×3, gauge ×3, kpi ×3, sparkline ×3, mini-area ×3, progress-ring ×3 |
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

`no docs` gives every library one paragraph of similar length: how to produce a drawn chart, and where the fields go. The paragraphs are the whole hint. They are not official docs, and ChartKit's paragraph does not add channel shapes the others do not get. `with docs` prepends that library's own official text, cut so it is no longer than ChartKit `llms.txt`. A pass requires drawn output. Recharts needs an SVG with data marks (Playwright, `createRoot` and `flushSync`; a detached container counts). Chart.js needs every canvas pixel scanned; a 32 by 32 sample is not enough. Observable Plot needs the SVG from `Plot.plot` in Playwright. The chart type is read from the rendered chart. `meta.type` and `meta.values` are not evidence. ChartKit values are compared as numbers, and ChartKit bars have to sit inside the plot, one rect per row per bar series.

| Library | no docs hint | with docs | Bytes | Source |
|---|---|---|---:|---|
| chartkit | Return one JSON object. version is "1". type is the chart name. data is the rows, or a number array when the chart is a single series. a11y.alt is one sentence. encoding.x is the category or date field and encoding.y is the measure. The renderer draws that object. | ChartKit llms.txt | 6376 | https://chartkit.dev/llms.txt. This file is the llms.txt. Full file. This length is the cap. The other libraries are cut to this many bytes. |
| plot | render() runs in a browser document. Import @observablehq/plot, call Plot.plot, and return the SVG outerHTML. Put rows on the mark data and field names on x and y. Plot needs a document, so this runs in the browser. A hand-written SVG does not pass. | Observable Plot getting started | 6374 | https://observablehq.com/plot/getting-started. Also https://github.com/observablehq/plot/blob/v0.6.17/docs/getting-started.md. No official llms.txt. Observable Plot does not publish an llms.txt. This excerpt is the official getting-started page from the Plot docs (ISC) at v0.6.17, retrieved 2026-10-27, cut to the ChartKit cap. |
| chartjs | render() runs in a browser document. Create a canvas, register every scale and controller you construct, and leave that canvas in the document. A canvas tag or a data URL with no painted pixels does not pass. Put the numbers in the dataset data. | Chart.js getting started: installation and usage | 6327 | https://www.chartjs.org/docs/latest/getting-started/. Also https://github.com/chartjs/Chart.js/blob/master/docs/getting-started/installation.md, https://github.com/chartjs/Chart.js/blob/master/docs/getting-started/usage.md. No official llms.txt. Chart.js does not publish an llms.txt. This excerpt is the official installation page plus the start of the usage guide, from the Chart.js docs (MIT), cut to the ChartKit cap. |
| recharts | render() runs in a browser. renderToStaticMarkup returns an empty recharts-wrapper in Recharts 3.10.1 and draws nothing. Mount with react-dom/client createRoot and react-dom flushSync. Use a fixed width and height; ResponsiveContainer stays 0px. Put rows on data and field names on dataKey, and return the mounted markup. | Recharts getting started and quickstart | 6329 | https://mintlify.com/recharts/recharts/guides/getting-started.md. Also https://mintlify.com/recharts/recharts/quickstart.md. Official llms.txt index: https://mintlify.com/recharts/recharts/llms.txt. Recharts publishes an llms.txt index of links, not a spec. This excerpt is the official getting-started page plus the start of quickstart, cut to the ChartKit cap. The Mintlify index blurb at the top of each page was removed. |
| echarts | In Node, call echarts.init(null, null, { renderer: "svg", ssr: true, width, height }) and return chart.renderToSVGString(). The SVG has to include the series marks. Put the numbers in series.data. Code that touches document or window runs in a browser instead. | Apache ECharts handbook: Get Started and Import | 6077 | https://echarts.apache.org/handbook/en/get-started/. Also https://github.com/apache/echarts-handbook/blob/master/contents/en/basics/import.md. Official llms.txt index: https://echarts.apache.org/en/llms.txt. ECharts publishes an llms.txt index. The handbook link on that index is Get Started. This excerpt is that page plus Import ECharts, cut to the ChartKit cap. Apache License 2.0. |

Run `BENCH_DOCS=none` and `BENCH_DOCS=official` separately. A local run writes `bench/results/agent/conditions/`, which is gitignored and is not the published scoreboard.

### Efficiency

Mean first-try output tokens are the average of `usage.output_tokens` on the first answer. The second try is not included. `repair()` is ChartKit only: parse the first-try JSON and apply `repair()` from `@chartkitdev/core/validate`, with no model call. The other libraries have no `repair()` step.

Computed from `bench/results/agent/sonnet-4-5/` (claude-sonnet-4-5, one attempt, no repair loop). That checker did not require a library import, so these rates are not round 4 and not round 5. The ChartKit column is how many of those first-try specs `repair()` accepts now.

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 231.2 (n=42) | 27 / 42 |
| chartjs | 355 (n=42) | no repair() |
| recharts | 446.8 (n=42) | no repair() |
| echarts | 392.1 (n=42) | no repair() |

Round 6 token means and the `checkChartKit` repair rate are in the current scoreboard above. `repair().ok` on the same first-try outputs, with no drawn-shape check:

Round 6 no docs, one model, one run, computed from `bench/results/agent/round-6/`:

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 139.3 (n=42) | 42 / 42 |
| chartjs | 295 (n=42) | no repair() |
| recharts | 221.9 (n=42) | no repair() |
| echarts | 331.7 (n=42) | no repair() |

Round 6 official, one model, one run, computed from `bench/results/agent/round-6/`:

| Library | Mean first-try output tokens | After repair(), no model |
|---|---:|---|
| chartkit | 132.4 (n=42) | 42 / 42 |
| chartjs | 258.4 (n=42) | no repair() |
| recharts | 236.5 (n=42) | no repair() |
| echarts | 362.6 (n=42) | no repair() |


## Token matrix

The homepage “fewer tokens per working chart” claim uses this harness. The round-6 first-try means above stay the historical scoreboard. The homepage and /agents scoreboard publish the with-docs medians from this matrix (Claude, GPT-6, and Grok). A re-run writes bench/results/agent/matrix/summary-official.json and does not overwrite those pages.

Published condition: `BENCH_DOCS=official` (each library's own doc, cut to ChartKit `llms.txt`). `BENCH_DOCS=none` is the optional no-docs condition.

One model:

```bash
BENCH_LLM_PROVIDER=anthropic BENCH_LLM_MODEL=claude-sonnet-5-5 npm run bench:agent
```

`BENCH_LLM_PROVIDER` is `openai`, `anthropic`, or `xai`. xAI uses `XAI_API_KEY` and `https://api.x.ai/v1/chat/completions`. OpenAI and Anthropic keep their existing clients. A `gpt-6*` model that Chat Completions rejects is retried on the OpenAI Responses API. Temperature is 0. Max output tokens is 4096. Keys are read from the environment and are not printed.

The registry:

```bash
npm run bench:agent-matrix
```

`BENCH_LLM_MATRIX` points at another JSON file. The default registry is `bench/agent/models.json`. Set `BENCH_LLM_PROVIDER` and `BENCH_LLM_MODEL` with the matrix script to re-run one id. Each model writes `bench/results/agent/matrix/<provider>/<model>/<docs>.json` (gitignored). The summary is `summary-<docs>.json` in that directory.

Add a model: one object in `models`. Then re-run. No other code change, unless the provider is new.

On successful supported charts (a drawn chart, or ChartKit `repair()` of that answer):

- median and mean of the sum of output tokens across model calls until pass
- median model calls until pass
- pass rate first-try and within-two (honest `meta.unsupported` counts as a pass only when that library cannot draw the type)
- `costPer100` from `inputPerMillion` and `outputPerMillion` on the registry row (`costPer100 = 100 * (medianInputTokens * inputPerMillion + medianOutputTokens * outputPerMillion) / 1e6`)

ChartKit `repair()` does not add a model call and does not add tokens of its own. If it makes the first answer pass, the runner does not send a second prompt. Failed tasks are DNF: they are listed and left out of the median. The median is never infinity. Correct unsupported answers are declined: they count in the pass rates and are not working charts.

Observable Plot is a code library in this suite, with the same no-docs paragraph length budget and the same official-doc cap. It runs in Playwright. Donut, gauge, kpi, progress-ring, and candlestick are unsupported.

## Reproduce

```bash
npm run bench
```

Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `XAI_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai`, `anthropic`, or `xai`. `BENCH_LLM_MODEL` overrides the default model. `BENCH_AGENT_LOG` checkpoints rows for resume. `BENCH_LIBRARIES` limits a run. `BENCH_DOCS=none` is the no-docs condition: one paragraph per library. `BENCH_DOCS=official` prepends that library's own doc. `npm run bench` still defaults the agent hook to `none`. The published one-model command `npm run bench:agent` and `npm run bench:agent-matrix` default to `official`. A finished one-model run is also written to `bench/results/agent/conditions/`, which is gitignored local scratch and is not the published scoreboard. A failed validate, render, compile, or library-use check is sent back once. See the token matrix section for medians until a working chart.
