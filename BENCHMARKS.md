# ChartKit benchmarks

Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.

Measured **2026-10-29T02:07:52.908Z**, Node **v22.23.4**, **linux 6.12.94+ x64**, CPU **Intel(R) Xeon(R) Processor**, **4** CPUs.

Pinned libraries: @chartkitdev/core 0.5.0, uplot 1.6.32, chart.js 4.5.1, recharts 3.10.1, echarts 6.1.0, @nivo/bar 0.99.0, @nivo/boxplot 0.99.0, @nivo/bullet 0.99.0, @nivo/funnel 0.99.0, @nivo/heatmap 0.99.0, @nivo/line 0.99.0, @nivo/pie 0.99.0, @nivo/radar 0.99.0, @nivo/radial-bar 0.99.0, @nivo/sankey 0.99.0, @nivo/scatterplot 0.99.0, @nivo/stream 0.99.0, @nivo/sunburst 0.99.0, @nivo/treemap 0.99.0, @observablehq/plot 0.6.17, highcharts 13.1.1, plotly.js-dist-min 4.1.2, victory 37.3.6, @visx/visx 4.0.0, apexcharts 8.3.1, @tremor/react 3.18.7, vega-lite 6.4.3, ag-charts-community 14.2.0, ag-charts-enterprise 14.2.0, @amcharts/amcharts5 5.21.2, lightweight-charts 5.2.1, @mui/x-charts 9.15.0, @mui/material 9.5.0, mermaid 11.17.2, @antv/g2 5.4.8, react 19.3.1, react-dom 19.3.1, esbuild 0.25.0, playwright 1.64.1.

## What this does and does not claim

ChartKit's minimal entry is the registry, one gallery chart, and the Soft preset. Midnight, refined, and editorial register from @chartkitdev/core/features and /all. The `/all` entry is every core chart and every theme, measured once, without the validator. Phase 4 measures every gallery type. Rival cells are native charts only. A library that does not tree-shake records one full-package size. React libraries are measured with React included and with React external. ECharts is the modular import. uPlot's CSS is a second response. A missing headless renderer, a missing native chart, and a package that is not on npm are unsupported. A commercial package that will not install or run without a license key is license-blocked.

The round 13 ChartKit row is SVG. It uses `mark.sampling: "auto"` (minmax once a line is longer than twice the plot width). ChartKit sampling none is the same line with `mark.sampling: "none"`, measured only at 100,000 and 1,000,000 points. ECharts `sampling` stays off. Every update timer waits for that library's own completion and then the same two animation frames. ECharts completion is the `finished` event, and those two frames come after it. The canvas painter is a later measurement, in the canvas section, and it loses first paint at 10k, 100k, and 1M.

## Bundle size

esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. Same config for every entry. ChartKit minimal is createRenderer of one gallery chart from packages/core/src. ChartKit /all is one bundle for every core chart and every theme, without the validator. Rival entries import only the pinned module that chart needs. ECharts uses echarts/core plus one series, its components, and CanvasRenderer. A library is not tree-shakeable when its native entries' gzip sizes differ by at most 512 bytes. That full-package size is recorded once. Those per-type cells are labeled not tree-shakeable and do not repeat the number. A package with one native type keeps the number on the cell. Commercial packages are measured when npm installs them without a license key. Google Charts is not an npm package. Gallery aliases that repair to one chart type are listed on that type and are not a second bundle.

Phase 4 measured **2026-10-29T19:08:35.474Z**, commit `bb7c4b8996562106d7f74ae8d2db98f24f08f547`, Node **v22.23.4**.

Cells: ok 294, unsupported 442, license-blocked 0, error 0. Full rows: `bench/results/bundle.json`.

ChartKit minimal gzip is smallest for **progress-ring** (6673) and largest for **combo** (38220).

| Chart | gzip | brotli | min | Aliases |
|---|---:|---:|---:|---|
| line | 32110 | 28502 | 89551 | — |
| bar | 33686 | 29872 | 93172 | — |
| pie | 15293 | 13879 | 42040 | — |
| donut | 15292 | 13870 | 42042 | arc |
| stacked-area | 33423 | 29700 | 93378 | — |
| scatter | 25987 | 23271 | 72510 | point, circle, square |
| combo | 38220 | 33834 | 106155 | — |
| heatmap | 13924 | 12719 | 37390 | rect, grid-heat, gridheat, grid_heat, grid-heatmap, calendar-heatmap |
| gauge | 7199 | 6547 | 18410 | — |
| kpi | 9098 | 8305 | 24826 | — |
| sparkline | 32112 | 28520 | 89566 | — |
| mini-area | 32114 | 28533 | 89565 | — |
| progress-ring | 6673 | 6059 | 18201 | — |
| spike | 18763 | 16892 | 51349 | rule, tick |
| candlestick | 18104 | 16340 | 49792 | — |
| histogram | 17808 | 16139 | 49415 | hist |
| boxplot | 17786 | 16085 | 49546 | box, box-plot |
| radar | 7945 | 7205 | 20953 | radar-chart, radar-beta |
| funnel | 9489 | 8658 | 25406 | funnel-chart |
| treemap | 15197 | 13796 | 41024 | tree-map, treemap-beta |
| sankey | 9646 | 8800 | 25804 | sankey-diagram, sankey-beta |
| bullet | 8814 | 8017 | 23937 | bullet-chart |
| waterfall | 17446 | 15756 | 48410 | waterfall-chart |
| area-range | 19410 | 17504 | 54015 | arearange, area_range, range-area, rangearea |
| bar-range | 17292 | 15619 | 48086 | columnrange, column-range, rangebar, range-bar, floating-bar |
| errorbar | 17558 | 15881 | 49082 | error-bar, error-bars, errorbars |
| gantt | 9621 | 8740 | 25823 | — |
| timeline | 8505 | 7735 | 22185 | — |
| quadrant | 8257 | 7494 | 22326 | — |
| venn | 10246 | 9236 | 26860 | — |
| journey | 8124 | 7379 | 21499 | — |
| radial-bar | 10177 | 9269 | 27338 | radialBar, polar-bar, polar |
| rose | 10177 | 9238 | 27320 | polarArea, polar-area, nightingale, rose-chart |
| sunburst | 12397 | 11285 | 33352 | sun-burst, sunburstchart, sunburst-chart, partition |
| bar-list | 7941 | 7224 | 21674 | — |
| /all | 78081 | 66200 | 221184 | one bundle, not per type |

uPlot (`uplot`) is not tree-shakeable. Full package 23292 gzip. CSS adds 762 gzip as a second response. Per-type cells say not tree-shakeable and do not repeat that number. Plotly.js (`plotly`) is not tree-shakeable. Full package 1477742 gzip. Per-type cells say not tree-shakeable and do not repeat that number. Tremor (`tremor`) is not tree-shakeable. Full package 246834 gzip. Per-type cells say not tree-shakeable and do not repeat that number. AG Charts (`ag-enterprise`) is not tree-shakeable. Full package 692892 gzip. Per-type cells say not tree-shakeable and do not repeat that number. AG Charts (`ag-community`) is not tree-shakeable. Full package 420736 gzip. Per-type cells say not tree-shakeable and do not repeat that number. TradingView Lightweight Charts (`lightweight`) is not tree-shakeable. Full package 53352 gzip. Per-type cells say not tree-shakeable and do not repeat that number. Mermaid (`mermaid`) is not tree-shakeable. Full package 962019 gzip. Per-type cells say not tree-shakeable and do not repeat that number. Vega-Lite (`vegalite`) is not tree-shakeable. Full package 377693 gzip. Per-type cells say not tree-shakeable and do not repeat that number. AntV G2 (`g2`) is not tree-shakeable. Full package 407348 gzip. Per-type cells say not tree-shakeable and do not repeat that number.

A rival is smaller than ChartKit minimal on these cells. The comparison uses the bundle that was actually produced, including React when that entry imports it. React-external gzip stays on the cell for an app that already ships React.

| Chart | ChartKit gzip | Library | Rival gzip |
|---|---:|---|---:|
| line | 32110 | uPlot (full package) | 24054 |
| bar | 33686 | uPlot (full package) | 24054 |
| scatter | 25987 | uPlot (full package) | 24054 |
| mini-area | 32114 | uPlot (full package) | 24054 |

visx heatmap is 69985 gzip with React and ReactDOM in the bundle, and 1360 gzip with them external. A HeatmapRect-only bundle was 1621 gzip and did not import react-dom.

uPlot's published stylesheet is a second response when that package is the full build. React external is omitted when the bundle does not import React.

## Browser render

Playwright Chromium. Each sample is a fresh page. Reported times are the median of 5 samples. Data is makeSeries(n, seed) generated inside the page and excluded from the timer. x[i] = i. Every library does its own update, then waits for the same two animation frames. ECharts also waits for its finished event before those frames. ChartKit replaces innerHTML with a new SVG (curve linear, points none, sampling auto, which is minmax above twice the plot width) and returns that synchronous build as renderMs before the two frames. ChartKit canvas is the same line with render canvas. It paints sampled points straight onto a canvas and builds SVG for the axes only, and renderMs includes that paint. It does not build the mark DOM. ChartKit sampling none is the same SVG line with mark.sampling none, measured only at 100k and 1M. An error SVG (ck-chart-error) fails that sample. uPlot uses setData. Chart.js uses update('none') and {x,y} points. ECharts uses setOption on a canvas renderer with sampling left off. Recharts and Nivo use flushSync. Observable Plot replaces the SVG node. Width 640, height 360. Memory is the median performance.memory.usedJSHeapSize when Chromium exposes it. A failed size skips larger sizes for that library. Chart-type cells are in charts, not in rows.

| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |
|---|---|---:|---|---:|---:|---:|---:|
| ChartKit | svg | 1000 | ok | 12.00 | 28.00 | 4083372 | 1973412 |
| ChartKit | svg | 10000 | ok | 15.30 | 33.10 | 4097815 | 1987855 |
| ChartKit | svg | 100000 | ok | 14.20 | 30.80 | 5726596 | 3616636 |
| ChartKit | svg | 1000000 | ok | 24.30 | 23.90 | 28569631 | 26459667 |
| ChartKit canvas | canvas | 1000 | ok | 21.60 | 24.30 | 5124108 | 2586891 |
| ChartKit canvas | canvas | 10000 | ok | 22.80 | 23.50 | 5370712 | 2833495 |
| ChartKit canvas | canvas | 100000 | ok | 22.10 | 18.50 | 7031228 | 4494011 |
| ChartKit canvas | canvas | 1000000 | ok | 32.90 | 21.10 | 24926108 | 22388887 |
| ChartKit sampling none | svg | 100000 | ok | 54.00 | 1157.20 | 20247949 | 18137915 |
| ChartKit sampling none | svg | 1000000 | ok | 466.70 | 21550.20 | 135652465 | 133542427 |
| uPlot | canvas | 1000 | ok | 14.30 | 33.10 | 3011641 | 1268324 |
| uPlot | canvas | 10000 | ok | 16.70 | 33.20 | 2392493 | 649176 |
| uPlot | canvas | 100000 | ok | 14.70 | 30.50 | 4733237 | 2989920 |
| uPlot | canvas | 1000000 | ok | 24.20 | 23.90 | 19482385 | 17739064 |
| Chart.js | canvas | 1000 | ok | 26.00 | 25.00 | 4631518 | 2268583 |
| Chart.js | canvas | 10000 | ok | 31.30 | 17.60 | 6651813 | 4288878 |
| Chart.js | canvas | 100000 | ok | 58.70 | 33.40 | 20710701 | 18347766 |
| Chart.js | canvas | 1000000 | ok | 342.80 | 190.60 | 154922926 | 152559987 |
| ECharts | canvas | 1000 | ok | 39.60 | 13.10 | 14414169 | 8459613 |
| ECharts | canvas | 10000 | ok | 95.20 | 70.20 | 16027270 | 10073446 |
| ECharts | canvas | 100000 | ok | 2491.80 | 2739.90 | 60777103 | 54822539 |
| ECharts | canvas | 1000000 | ok | 40778.90 | 42828.30 | 400441317 | 394486749 |
| Recharts | svg | 1000 | ok | 69.60 | 25.10 | 20668563 | 13590384 |
| Recharts | svg | 10000 | ok | 238.40 | 114.20 | 37324566 | 30246371 |
| Recharts | svg | 100000 | ok | 1884.30 | 1002.00 | 165484523 | 158406328 |
| Recharts | svg | 1000000 | ok | 20528.00 | 13053.00 | 1366667288 | 1359589089 |
| Nivo | svg | 1000 | ok | 40.90 | 21.90 | 16870842 | 10580514 |
| Nivo | svg | 10000 | ok | 80.90 | 52.00 | 24248621 | 17958125 |
| Nivo | svg | 100000 | ok | 383.20 | 980.20 | 130966509 | 124676297 |
| Nivo | svg | 1000000 | error | — | — | — | — |
| Observable Plot | svg | 1000 | ok | 17.70 | 25.70 | 8205654 | 4638289 |
| Observable Plot | svg | 10000 | ok | 30.00 | 46.40 | 9504450 | 5937085 |
| Observable Plot | svg | 100000 | ok | 109.50 | 1481.00 | 33632785 | 30065808 |
| Observable Plot | svg | 1000000 | ok | 823.80 | 26627.70 | 260205662 | 256638293 |

At 1000 points the fastest initial render is ChartKit (svg) at 12.00 ms. ChartKit initial render is 12.00 ms, rank 1 of 8.

At 10000 points the fastest initial render is ChartKit (svg) at 15.30 ms. ChartKit initial render is 15.30 ms, rank 1 of 8.

At 100000 points the fastest initial render is ChartKit (svg) at 14.20 ms. ChartKit initial render is 14.20 ms, rank 1 of 9.

At 1000000 points the fastest initial render is uPlot (canvas) at 24.20 ms. ChartKit initial render is 24.30 ms, rank 2 of 8. Failed or skipped: Nivo error (Maximum call stack size exceeded).

### Chart type paint

Phase 2 paints ChartKit and the libraries already timed on the line sweep: uPlot, Chart.js, ECharts, Recharts, Nivo, and Observable Plot. One cell per gallery type from apps/web/src/data/chart-types.ts. There is no type id area. The homepage row area is native stacked-area (full size, four series). A single filled line stays type line with mark.area true. mini-area is one filled series with the axes off, in the same 640×360 frame. Line cells are projected from the existing line sweep and are not measured again. Every other native cell uses the same point count as the ChartKit cell for that type, and the same data shape. The timer matches the line sweep: build data before the clock, paint, then wait for two animation frames. ECharts also waits for finished. The reported time is the median of BENCH_SAMPLES fresh pages (default 5) at 640×360. ChartKit updates are a second full paint. Marks stay SVG, except a dense scatter, a large heatmap, a long mini-area, and a long candlestick, which use ChartKit's canvas painter (axes stay SVG) because one node per mark, or a path with a command per pixel, cannot paint that N. The timer still waits for two animation frames after that paint. An error SVG (ck-chart-error) fails the sample. A cell is status unsupported, with a reason and no invented time, when that library has no native chart of that shape. Stand-ins are not timed: a pie made from bars, a waterfall made from a transparent helper bar, a histogram made from bars we binned ourselves, a sparkline made by hiding the axes on the line cell, a spike drawn as a bar, Plot.spike (a fixed-pixel vector), the uPlot candlestick demo path, an ECharts custom series, or the ECharts timeline playback control. Nivo cells use the 0.99.0 package for that chart, the same version as the pinned line, bar, and pie. A missing license key is status blocked. gzipBytes and ssrMs stay null until a later phase. Phase 3 adds the rest of the compare matrix and times the eleven gallery types that had no Phase-2 rival ok cell: bar-list, gantt, journey, kpi, progress-ring, quadrant, sparkline, spike, timeline, venn, and waterfall. ChartKit is painted again for those eleven, and for candlestick, so the comparison matches the canvas candlestick painter. Phase-2 rivals stay unsupported on the eleven and are not repainted. BENCH_PHASE=3 skips the line sweep. Candlestick is the extra type: Phase 2 had only ECharts, and a Phase-3 library is timed only when it has a native OHLC series. Pins: highcharts 13.1.1 (credits left on), plotly.js-dist-min 4.1.2, victory 37.3.6, @visx/visx 4.0.0, apexcharts 8.3.1 plus apexcharts/features/waterfall, @tremor/react 3.18.7 (React 18 peer, harness React 19.3.1, nested recharts 2.15.4, Tailwind utilities inlined because the package ships no CSS), vega-lite 6.4.3, ag-charts-community 14.2.0 and ag-charts-enterprise 14.2.0 (no license key, trial watermark when the series is enterprise), @amcharts/amcharts5 5.21.2 (logo left on), Google Charts loader current from https://www.gstatic.com/charts/loader.js, lightweight-charts 5.2.1 (attribution logo left on), @mui/x-charts 9.15.0 with @mui/material 9.5.0, @mui/system 9.5.0, @emotion/react 11.14.0, @emotion/styled 11.14.1, mermaid 11.17.2, @antv/g2 5.4.8. Later paint, bundle, and SSR phases add a cell per library, including commercial compare-matrix rivals (Highcharts, amCharts, ApexCharts community and commercial builds, AG Charts enterprise, MUI X Pro and Premium, and the same class of product). Use the published npm or CDN build a customer would install. Record license and watermark limits on the cell. A missing license key is status blocked with a note, not a silent omission and not a reason to drop the rest of that set. unsupported means that library has no native chart of that type. gzipBytes and ssrMs stay null until those phases fill them.

Homepage row `area` is native `stacked-area`. Paint cells leave `gzipBytes` and `ssrMs` null. Phase 4 writes `bench/results/bundle.json` and `bench/results/ssr.json`. The homepage is not wired from this file. A full run writes the same cells to `bench/results/latest.json` under `browser.charts` and to `bench/results/paint.json`. One-sample runs write `bench/results/paint-smoke.json` and are not published medians. Unsupported cells are an honest omit: no native chart of that shape, and no invented time.

| Chart | Homepage | Library | Variant | Renderer | N | Status | Initial ms | Update ms | gzip | SSR ms | N means |
|---|---|---|---|---|---:|---|---:|---:|---:|---:|---|
| line | line | Chart.js | — | canvas | 1000 | ok | 26.00 | 25.00 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 1000 | ok | 12.00 | 28.00 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 1000 | ok | 21.60 | 24.30 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 1000 | ok | 39.60 | 13.10 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 1000 | ok | 40.90 | 21.90 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 1000 | ok | 17.70 | 25.70 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 1000 | ok | 69.60 | 25.10 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 1000 | ok | 14.30 | 33.10 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 10000 | ok | 31.30 | 17.60 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 10000 | ok | 15.30 | 33.10 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 10000 | ok | 22.80 | 23.50 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 10000 | ok | 95.20 | 70.20 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 10000 | ok | 80.90 | 52.00 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 10000 | ok | 30.00 | 46.40 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 10000 | ok | 238.40 | 114.20 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 10000 | ok | 16.70 | 33.20 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 100000 | ok | 58.70 | 33.40 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 100000 | ok | 14.20 | 30.80 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 100000 | ok | 22.10 | 18.50 | — | — | points in one series; x[i] = i |
| line | line | ChartKit sampling none | sampling-none | svg | 100000 | ok | 54.00 | 1157.20 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 100000 | ok | 2491.80 | 2739.90 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 100000 | ok | 383.20 | 980.20 | — | — | points in one series; x[i] = i |
| line | line | Observable Plot | — | svg | 100000 | ok | 109.50 | 1481.00 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 100000 | ok | 1884.30 | 1002.00 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 100000 | ok | 14.70 | 30.50 | — | — | points in one series; x[i] = i |
| line | line | Chart.js | — | canvas | 1000000 | ok | 342.80 | 190.60 | — | — | points in one series; x[i] = i |
| line | line | ChartKit | sampling-auto | svg | 1000000 | ok | 24.30 | 23.90 | — | — | points in one series; x[i] = i |
| line | line | ChartKit canvas | canvas | canvas | 1000000 | ok | 32.90 | 21.10 | — | — | points in one series; x[i] = i |
| line | line | ChartKit sampling none | sampling-none | svg | 1000000 | ok | 466.70 | 21550.20 | — | — | points in one series; x[i] = i |
| line | line | ECharts | — | canvas | 1000000 | ok | 40778.90 | 42828.30 | — | — | points in one series; x[i] = i |
| line | line | Nivo | — | svg | 1000000 | error | — | — | — | — | points in one series; x[i] = i — Projected from the existing line sweep. The type matrix does not paint line a second time. — Maximum call stack size exceeded |
| line | line | Observable Plot | — | svg | 1000000 | ok | 823.80 | 26627.70 | — | — | points in one series; x[i] = i |
| line | line | Recharts | — | svg | 1000000 | ok | 20528.00 | 13053.00 | — | — | points in one series; x[i] = i |
| line | line | uPlot | — | canvas | 1000000 | ok | 24.20 | 23.90 | — | — | points in one series; x[i] = i |
| bar | bar | Chart.js | — | canvas | 48 | ok | 26.40 | 21.40 | — | — | categories; one series |
| bar | bar | ChartKit | — | svg | 48 | ok | 12.10 | 29.80 | — | — | categories; one series |
| bar | bar | ECharts | — | canvas | 48 | ok | 34.70 | 15.80 | — | — | categories; one series |
| bar | bar | Nivo | — | svg | 48 | ok | 55.20 | 20.40 | — | — | categories; one series |
| bar | bar | Observable Plot | — | svg | 48 | ok | 17.40 | 29.60 | — | — | categories; one series |
| bar | bar | Recharts | — | svg | 48 | ok | 49.80 | 19.10 | — | — | categories; one series |
| bar | bar | uPlot | — | canvas | 48 | ok | 12.00 | 32.30 | — | — | categories; one series |
| pie | — | Chart.js | — | canvas | 8 | ok | 14.50 | 33.10 | — | — | slices |
| pie | — | ChartKit | — | svg | 8 | ok | 7.60 | 33.20 | — | — | slices |
| pie | — | ECharts | — | canvas | 8 | ok | 25.60 | 18.50 | — | — | slices |
| pie | — | Nivo | — | svg | 8 | ok | 23.50 | 21.20 | — | — | slices |
| pie | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | slices — No pie or donut mark. |
| pie | — | Recharts | — | svg | 8 | ok | 28.50 | 22.50 | — | — | slices |
| pie | — | uPlot | — | — | 8 | unsupported | — | — | — | — | slices — No pie series. |
| donut | donut | Chart.js | — | canvas | 8 | ok | 11.70 | 33.50 | — | — | slices |
| donut | donut | ChartKit | — | svg | 8 | ok | 8.80 | 33.50 | — | — | slices |
| donut | donut | ECharts | — | canvas | 8 | ok | 25.30 | 23.90 | — | — | slices |
| donut | donut | Nivo | — | svg | 8 | ok | 23.60 | 19.40 | — | — | slices |
| donut | donut | Observable Plot | — | — | 8 | unsupported | — | — | — | — | slices — No pie or donut mark. |
| donut | donut | Recharts | — | svg | 8 | ok | 27.70 | 17.10 | — | — | slices |
| donut | donut | uPlot | — | — | 8 | unsupported | — | — | — | — | slices — No donut series. |
| stacked-area | area | Chart.js | — | canvas | 100000 | ok | 737.40 | 670.00 | — | — | x positions; 4 stacked series |
| stacked-area | area | ChartKit | — | svg | 100000 | ok | 45.60 | 51.60 | — | — | x positions; 4 stacked series |
| stacked-area | area | ECharts | — | canvas | 100000 | ok | 18700.40 | 18445.80 | — | — | x positions; 4 stacked series |
| stacked-area | area | Nivo | — | svg | 100000 | error | — | — | — | — | x positions; 4 stacked series — @nivo/stream with offsetType none, a zero-baseline stack of the four series. Not the wiggle offset. Nivo's stream memo throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error. — Maximum call stack size exceeded |
| stacked-area | area | Observable Plot | — | svg | 100000 | ok | 563.30 | 5252.70 | — | — | x positions; 4 stacked series |
| stacked-area | area | Recharts | — | svg | 100000 | error | — | — | — | — | x positions; 4 stacked series — AreaChart with four Area elements that share stackId. Recharts walks that stacked domain recursively and throws Maximum call stack size exceeded at this N. The cell stays in the matrix as status error. — Maximum call stack size exceeded |
| stacked-area | area | uPlot | — | — | 100000 | unsupported | — | — | — | — | x positions; 4 stacked series — A series can fill to a baseline, but uPlot has no stack. One filled series is the mini-area cell. |
| scatter | scatter | Chart.js | — | canvas | 100000 | ok | 269.30 | 247.10 | — | — | points |
| scatter | scatter | ChartKit | — | canvas | 100000 | ok | 62.40 | 40.00 | — | — | points |
| scatter | scatter | ECharts | — | canvas | 100000 | ok | 8827.40 | 9060.50 | — | — | points |
| scatter | scatter | Nivo | — | canvas | 100000 | ok | 410.60 | 339.80 | — | — | points |
| scatter | scatter | Observable Plot | — | svg | 100000 | ok | 519.00 | 624.90 | — | — | points |
| scatter | scatter | Recharts | — | svg | 100000 | ok | 5815.90 | 11446.60 | — | — | points |
| scatter | scatter | uPlot | — | canvas | 100000 | ok | 132.00 | 121.10 | — | — | points |
| combo | — | Chart.js | — | canvas | 48 | ok | 28.50 | 17.00 | — | — | categories; one bar series and one line series |
| combo | — | ChartKit | — | svg | 48 | ok | 14.20 | 28.10 | — | — | categories; one bar series and one line series |
| combo | — | ECharts | — | canvas | 48 | ok | 36.90 | 23.90 | — | — | categories; one bar series and one line series |
| combo | — | Nivo | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No combo chart and no second y scale. |
| combo | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No second y scale. A bar and a line on one scale would squash the margin series. |
| combo | — | Recharts | — | svg | 48 | ok | 56.90 | 23.50 | — | — | categories; one bar series and one line series |
| combo | — | uPlot | — | — | 48 | unsupported | — | — | — | — | categories; one bar series and one line series — No combo and no second scale. A bar and a line on one scale would squash the margin series. |
| heatmap | heatmap | Chart.js | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap controller. |
| heatmap | heatmap | ChartKit | — | canvas | 1200 | ok | 15.90 | 24.10 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | ECharts | — | canvas | 1200 | ok | 49.10 | 25.50 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Nivo | — | svg | 1200 | ok | 426.40 | 446.80 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Observable Plot | — | svg | 1200 | ok | 22.90 | 22.70 | — | — | grid cells; 40 columns by 30 rows |
| heatmap | heatmap | Recharts | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap chart. |
| heatmap | heatmap | uPlot | — | — | 1200 | unsupported | — | — | — | — | grid cells; 40 columns by 30 rows — No heatmap series. |
| gauge | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge controller. |
| gauge | — | ChartKit | — | svg | 1 | ok | 15.30 | 28.40 | — | — | one metric |
| gauge | — | ECharts | — | canvas | 1 | ok | 24.90 | 24.90 | — | — | one metric |
| gauge | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge package in Nivo 0.99.0. |
| gauge | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge mark. |
| gauge | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge chart. |
| gauge | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric — No gauge series. |
| kpi | — | AG Charts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | amCharts 5 | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | AntV G2 | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | ApexCharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | ChartKit | — | svg | 1 | ok | 17.70 | 25.90 | — | — | one metric; sparkline fixed at 24 |
| kpi | — | ECharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Google Charts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | Highcharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI series. |
| kpi | — | Mermaid | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | MUI X Charts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Plotly.js | — | svg | 1 | ok | 67.90 | 13.20 | — | — | one metric; sparkline fixed at 24 |
| kpi | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | TradingView Lightweight Charts | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | Tremor | — | svg | 1 | ok | 47.30 | 66.70 | — | — | one metric; sparkline fixed at 24 |
| kpi | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. The chart is a labeled metric, not a series. |
| kpi | — | Vega-Lite | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | Victory | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| kpi | — | visx | — | — | 1 | unsupported | — | — | — | — | one metric; sparkline fixed at 24 — No KPI card. A gauge is the gauge cell. |
| sparkline | — | AG Charts | — | canvas | 100000 | ok | 180.80 | 75.00 | — | — | values in a number array |
| sparkline | — | amCharts 5 | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | AntV G2 | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | ApexCharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — chart.sparkline.enabled hides axes on a line or area. That is the line cell. |
| sparkline | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | ChartKit | — | svg | 100000 | ok | 18.70 | 15.20 | — | — | values in a number array |
| sparkline | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Google Charts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | Highcharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — The sparkline demo disables axes on a line. That is the line cell. |
| sparkline | — | Mermaid | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | MUI X Charts | — | svg | 100000 | ok | 167.70 | 1828.30 | — | — | values in a number array |
| sparkline | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Plotly.js | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | TradingView Lightweight Charts | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | Tremor | — | svg | 100000 | ok | 182.10 | 1875.60 | — | — | values in a number array |
| sparkline | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. A line with the axes hidden is the line cell. |
| sparkline | — | Vega-Lite | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | Victory | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| sparkline | — | visx | — | — | 100000 | unsupported | — | — | — | — | values in a number array — No sparkline chart. Hiding the axes on a line is the line cell. |
| mini-area | — | Chart.js | — | canvas | 100000 | ok | 47.40 | 28.60 | — | — | values in a number array |
| mini-area | — | ChartKit | — | canvas | 100000 | ok | 9.50 | 21.40 | — | — | values in a number array |
| mini-area | — | ECharts | — | canvas | 100000 | ok | 122.40 | 78.80 | — | — | values in a number array |
| mini-area | — | Nivo | — | svg | 100000 | ok | 310.10 | 270.90 | — | — | values in a number array |
| mini-area | — | Observable Plot | — | svg | 100000 | ok | 57.80 | 56.20 | — | — | values in a number array |
| mini-area | — | Recharts | — | svg | 100000 | ok | 233.00 | 132.20 | — | — | values in a number array |
| mini-area | — | uPlot | — | canvas | 100000 | ok | 10.50 | 21.00 | — | — | values in a number array |
| progress-ring | — | AG Charts | — | canvas | 1 | ok | 117.90 | 6.70 | — | — | one metric |
| progress-ring | — | amCharts 5 | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| progress-ring | — | AntV G2 | — | — | 1 | unsupported | — | — | — | — | one metric — gauge is a dial and liquid is a liquid-fill chart. Neither is a progress ring. |
| progress-ring | — | ApexCharts | — | svg | 1 | ok | 33.60 | 17.60 | — | — | one metric |
| progress-ring | — | Chart.js | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | ChartKit | — | svg | 1 | ok | 15.10 | 29.60 | — | — | one metric |
| progress-ring | — | ECharts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Google Charts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| progress-ring | — | Highcharts | — | svg | 1 | ok | 28.80 | 28.50 | — | — | one metric |
| progress-ring | — | Mermaid | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| progress-ring | — | MUI X Charts | — | svg | 1 | ok | 22.60 | 22.30 | — | — | one metric |
| progress-ring | — | Nivo | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Observable Plot | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Plotly.js | — | — | 1 | unsupported | — | — | — | — | one metric — indicator mode gauge is a gauge, not a progress ring. |
| progress-ring | — | Recharts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | TradingView Lightweight Charts | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| progress-ring | — | Tremor | — | svg | 1 | ok | 45.30 | 66.60 | — | — | one metric |
| progress-ring | — | uPlot | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A gauge drawn as a ring is the gauge cell. |
| progress-ring | — | Vega-Lite | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| progress-ring | — | Victory | — | — | 1 | unsupported | — | — | — | — | one metric — VictoryPie is the pie cell. A partial pie is not a progress ring. |
| progress-ring | — | visx | — | — | 1 | unsupported | — | — | — | — | one metric — No progress ring. A needle gauge is the gauge cell, and a pie used as a ring is the pie cell. |
| spike | — | AG Charts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | amCharts 5 | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | AntV G2 | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | ApexCharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | ChartKit | — | svg | 100000 | ok | 56.60 | 43.30 | — | — | points |
| spike | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | Google Charts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Highcharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Mermaid | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | MUI X Charts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | points — Plot.spike is a fixed-pixel vector, not a value-height spike from the baseline. |
| spike | — | Plotly.js | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | TradingView Lightweight Charts | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Tremor | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | points — No spike chart. A thin bar would be the bar cell. |
| spike | — | Vega-Lite | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | Victory | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| spike | — | visx | — | — | 100000 | unsupported | — | — | — | — | points — No spike series. A thin bar would be the bar cell. A fixed-length vector is not a value-height spike. |
| candlestick | — | AG Charts | — | canvas | 2000 | ok | 168.20 | 32.60 | — | — | OHLC candles, plus volume |
| candlestick | — | amCharts 5 | — | canvas | 2000 | ok | 224.90 | 200.50 | — | — | OHLC candles, plus volume |
| candlestick | — | AntV G2 | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | ApexCharts | — | svg | 2000 | ok | 1076.30 | 1025.50 | — | — | OHLC candles, plus volume |
| candlestick | — | Chart.js | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick controller. |
| candlestick | — | ChartKit | — | canvas | 2000 | ok | 23.80 | 18.90 | — | — | OHLC candles, plus volume |
| candlestick | — | ECharts | — | canvas | 2000 | ok | 71.60 | 42.80 | — | — | OHLC candles, plus volume |
| candlestick | — | Google Charts | — | svg | 2000 | ok | 339.20 | 284.40 | — | — | OHLC candles, plus volume |
| candlestick | — | Highcharts | — | svg | 2000 | ok | 130.60 | 108.90 | — | — | OHLC candles, plus volume |
| candlestick | — | Mermaid | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | MUI X Charts | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | Nivo | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick package in Nivo 0.99.0. |
| candlestick | — | Observable Plot | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Plotly.js | — | svg | 2000 | ok | 567.50 | 248.70 | — | — | OHLC candles, plus volume |
| candlestick | — | Recharts | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick chart. |
| candlestick | — | TradingView Lightweight Charts | — | canvas | 2000 | ok | 41.70 | 24.30 | — | — | OHLC candles, plus volume |
| candlestick | — | Tremor | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | uPlot | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — The candlestick in the uPlot demos is a custom path, not a built-in series. |
| candlestick | — | Vega-Lite | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Victory | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | visx | — | — | 2000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | AG Charts | — | canvas | 100000 | ok | 212.00 | 69.90 | — | — | OHLC candles, plus volume |
| candlestick | — | amCharts 5 | — | canvas | 100000 | ok | 7145.00 | 131435.40 | — | — | OHLC candles, plus volume |
| candlestick | — | AntV G2 | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | ApexCharts | — | svg | 100000 | timeout | — | — | — | — | OHLC candles, plus volume — candlestick chart. y is [open, high, low, close]. Volume is not on this axis. apexcharts 8.3.1. No key. The license is a revenue threshold, not a paint lock. — Timeout 180000ms exceeded |
| candlestick | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick controller. |
| candlestick | — | ChartKit | — | canvas | 100000 | ok | 181.50 | 153.80 | — | — | OHLC candles, plus volume |
| candlestick | — | ECharts | — | canvas | 100000 | ok | 2840.80 | 2626.40 | — | — | OHLC candles, plus volume |
| candlestick | — | Google Charts | — | svg | 100000 | ok | 5314.00 | 10612.30 | — | — | OHLC candles, plus volume |
| candlestick | — | Highcharts | — | svg | 100000 | ok | 2954.50 | 2913.30 | — | — | OHLC candles, plus volume |
| candlestick | — | Mermaid | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | MUI X Charts | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick package in Nivo 0.99.0. |
| candlestick | — | Observable Plot | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Plotly.js | — | svg | 100000 | ok | 101610.60 | 60983.60 | — | — | OHLC candles, plus volume |
| candlestick | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick chart. |
| candlestick | — | TradingView Lightweight Charts | — | canvas | 100000 | ok | 281.30 | 155.00 | — | — | OHLC candles, plus volume |
| candlestick | — | Tremor | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — The candlestick in the uPlot demos is a custom path, not a built-in series. |
| candlestick | — | Vega-Lite | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick mark. |
| candlestick | — | Victory | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| candlestick | — | visx | — | — | 100000 | unsupported | — | — | — | — | OHLC candles, plus volume — No candlestick series. |
| histogram | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | ChartKit | — | svg | 100000 | ok | 30.80 | 17.30 | — | — | observations before binning |
| histogram | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | Observable Plot | — | svg | 100000 | ok | 45.70 | 40.10 | — | — | observations before binning |
| histogram | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| histogram | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | observations before binning — No histogram that bins observations. Pre-binned bars would be the bar cell. |
| boxplot | — | Chart.js | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot controller. |
| boxplot | — | ChartKit | — | svg | 100000 | ok | 56.70 | 40.10 | — | — | observations across 8 categories |
| boxplot | — | ECharts | — | canvas | 100000 | ok | 70.80 | 53.20 | — | — | observations across 8 categories |
| boxplot | — | Nivo | — | svg | 100000 | ok | 86.50 | 69.70 | — | — | observations across 8 categories |
| boxplot | — | Observable Plot | — | svg | 100000 | ok | 222.20 | 184.30 | — | — | observations across 8 categories |
| boxplot | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot chart. |
| boxplot | — | uPlot | — | — | 100000 | unsupported | — | — | — | — | observations across 8 categories — No boxplot series. |
| radar | — | Chart.js | — | canvas | 8 | ok | 21.80 | 27.50 | — | — | spokes; 3 series |
| radar | — | ChartKit | — | svg | 8 | ok | 10.00 | 33.10 | — | — | spokes; 3 series |
| radar | — | ECharts | — | canvas | 8 | ok | 29.00 | 19.30 | — | — | spokes; 3 series |
| radar | — | Nivo | — | svg | 8 | ok | 27.10 | 17.40 | — | — | spokes; 3 series |
| radar | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | spokes; 3 series — No radar mark. |
| radar | — | Recharts | — | svg | 8 | ok | 36.10 | 16.20 | — | — | spokes; 3 series |
| radar | — | uPlot | — | — | 8 | unsupported | — | — | — | — | spokes; 3 series — No radar series. |
| funnel | — | Chart.js | — | — | 8 | unsupported | — | — | — | — | stages — No funnel controller. |
| funnel | — | ChartKit | — | svg | 8 | ok | 15.50 | 27.60 | — | — | stages |
| funnel | — | ECharts | — | canvas | 8 | ok | 23.50 | 25.90 | — | — | stages |
| funnel | — | Nivo | — | svg | 8 | ok | 29.90 | 20.00 | — | — | stages |
| funnel | — | Observable Plot | — | — | 8 | unsupported | — | — | — | — | stages — No funnel mark. |
| funnel | — | Recharts | — | svg | 8 | ok | 24.30 | 14.20 | — | — | stages |
| funnel | — | uPlot | — | — | 8 | unsupported | — | — | — | — | stages — No funnel series. |
| treemap | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — No treemap controller. |
| treemap | — | ChartKit | — | svg | 48 | ok | 19.30 | 23.20 | — | — | tiles; 6 color groups |
| treemap | — | ECharts | — | canvas | 48 | ok | 34.30 | 950.30 | — | — | tiles; 6 color groups |
| treemap | — | Nivo | — | svg | 48 | ok | 41.60 | 19.50 | — | — | tiles; 6 color groups |
| treemap | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — The tree mark is a node-link layout, not a treemap. |
| treemap | — | Recharts | — | svg | 48 | ok | 32.70 | 17.30 | — | — | tiles; 6 color groups |
| treemap | — | uPlot | — | — | 48 | unsupported | — | — | — | — | tiles; 6 color groups — No treemap series. |
| sankey | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey controller. |
| sankey | — | ChartKit | — | svg | 48 | ok | 17.30 | 24.20 | — | — | links across 4 layers |
| sankey | — | ECharts | — | canvas | 48 | ok | 31.40 | 20.60 | — | — | links across 4 layers |
| sankey | — | Nivo | — | svg | 48 | ok | 41.70 | 24.60 | — | — | links across 4 layers |
| sankey | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey mark. |
| sankey | — | Recharts | — | svg | 48 | ok | 26.90 | 18.50 | — | — | links across 4 layers |
| sankey | — | uPlot | — | — | 48 | unsupported | — | — | — | — | links across 4 layers — No sankey series. |
| bullet | — | Chart.js | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | ChartKit | — | svg | 6 | ok | 15.90 | 28.60 | — | — | rows, each with a target and three ranges |
| bullet | — | ECharts | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | Nivo | — | svg | 6 | ok | 43.20 | 20.40 | — | — | rows, each with a target and three ranges |
| bullet | — | Observable Plot | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | Recharts | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| bullet | — | uPlot | — | — | 6 | unsupported | — | — | — | — | rows, each with a target and three ranges — No bullet chart. |
| waterfall | — | AG Charts | — | canvas | 12 | ok | 144.20 | 19.50 | — | — | steps, including the opening and closing totals |
| waterfall | — | amCharts 5 | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — The openValueY column demo is a manual column, not a waterfall series. |
| waterfall | — | AntV G2 | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — An interval with a manual y1 is not a waterfall mark. |
| waterfall | — | ApexCharts | — | svg | 12 | ok | 43.60 | 11.90 | — | — | steps, including the opening and closing totals |
| waterfall | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | ChartKit | — | svg | 12 | ok | 16.80 | 25.80 | — | — | steps, including the opening and closing totals |
| waterfall | — | ECharts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Google Charts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — The candlestick waterfall trick is not a waterfall chart. |
| waterfall | — | Highcharts | — | svg | 12 | ok | 33.50 | 24.10 | — | — | steps, including the opening and closing totals |
| waterfall | — | Mermaid | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | MUI X Charts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series in @mui/x-charts 9.15.0. Composing bars is not this chart. |
| waterfall | — | Nivo | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Plotly.js | — | svg | 12 | ok | 80.30 | 19.20 | — | — | steps, including the opening and closing totals |
| waterfall | — | Recharts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | TradingView Lightweight Charts | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Tremor | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | uPlot | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | Vega-Lite | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — The window-transform recipe is a manual stack, not a waterfall mark. |
| waterfall | — | Victory | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall series. A transparent helper bar is not a native waterfall. |
| waterfall | — | visx | — | — | 12 | unsupported | — | — | — | — | steps, including the opening and closing totals — No waterfall shape. A bar with a computed baseline is not this chart. |
| area-range | — | Chart.js | — | canvas | 100000 | ok | 377.50 | 341.40 | — | — | x positions; low, high, and a centre line |
| area-range | — | ChartKit | — | svg | 100000 | ok | 28.00 | 22.40 | — | — | x positions; low, high, and a centre line |
| area-range | — | ECharts | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No area-range series. A transparent stacked helper is not this chart. |
| area-range | — | Nivo | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No area-range package in Nivo 0.99.0. |
| area-range | — | Observable Plot | — | svg | 100000 | ok | 230.90 | 4285.10 | — | — | x positions; low, high, and a centre line |
| area-range | — | Recharts | — | — | 100000 | unsupported | — | — | — | — | x positions; low, high, and a centre line — No band series. ReferenceArea is an annotation, not a series. |
| area-range | — | uPlot | — | canvas | 100000 | ok | 45.80 | 34.80 | — | — | x positions; low, high, and a centre line |
| bar-range | — | Chart.js | — | canvas | 24 | ok | 24.90 | 23.40 | — | — | floating bars |
| bar-range | — | ChartKit | — | svg | 24 | ok | 18.10 | 24.80 | — | — | floating bars |
| bar-range | — | ECharts | — | — | 24 | unsupported | — | — | — | — | floating bars — No floating-bar data. A transparent stacked helper is not this chart. |
| bar-range | — | Nivo | — | — | 24 | unsupported | — | — | — | — | floating bars — No floating-bar chart in Nivo 0.99.0. |
| bar-range | — | Observable Plot | — | svg | 24 | ok | 15.40 | 25.70 | — | — | floating bars |
| bar-range | — | Recharts | — | svg | 24 | ok | 47.00 | 21.10 | — | — | floating bars |
| bar-range | — | uPlot | — | canvas | 24 | ok | 15.30 | 33.40 | — | — | floating bars |
| errorbar | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar element in chart.js core. |
| errorbar | — | ChartKit | — | svg | 24 | ok | 17.20 | 22.60 | — | — | points with low and high whiskers |
| errorbar | — | ECharts | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar series. A custom series can draw anything and is not this chart. |
| errorbar | — | Nivo | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar package in Nivo 0.99.0. |
| errorbar | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar mark. |
| errorbar | — | Recharts | — | svg | 24 | ok | 59.10 | 23.70 | — | — | points with low and high whiskers |
| errorbar | — | uPlot | — | — | 24 | unsupported | — | — | — | — | points with low and high whiskers — No error-bar series. |
| gantt | — | AG Charts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series in ag-charts-community or ag-charts-enterprise 14.2.0. |
| gantt | — | amCharts 5 | — | canvas | 24 | ok | 237.90 | 105.80 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | AntV G2 | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | ApexCharts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt type. rangeBar is the bar-range cell. ApexGantt is a different product. |
| gantt | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | ChartKit | — | svg | 24 | ok | 10.60 | 30.30 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | ECharts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Google Charts | — | svg | 24 | ok | 188.70 | 31.50 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | Highcharts | — | svg | 24 | ok | 68.90 | 26.60 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | Mermaid | — | svg | 24 | ok | 75.30 | 14.70 | — | — | tasks, with a dependency chain and one milestone |
| gantt | — | MUI X Charts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Nivo | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Plotly.js | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt trace. Shapes on a date axis are not a gantt series. |
| gantt | — | Recharts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | TradingView Lightweight Charts | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Tremor | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | uPlot | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | Vega-Lite | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — A bar with x and x2 is the bar-range cell, not a gantt chart. |
| gantt | — | Victory | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt series. A floating bar is the bar-range cell. |
| gantt | — | visx | — | — | 24 | unsupported | — | — | — | — | tasks, with a dependency chain and one milestone — No gantt chart. @visx/shape bars are the bar cell. |
| timeline | — | AG Charts | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | amCharts 5 | — | — | 16 | unsupported | — | — | — | — | events and periods — The timeline module is a curve, serpentine, or spiral axis, not an event timeline. |
| timeline | — | AntV G2 | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | ApexCharts | — | — | 16 | unsupported | — | — | — | — | events and periods — rangeBar is the bar-range cell, not an event timeline. |
| timeline | — | Chart.js | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | ChartKit | — | svg | 16 | ok | 10.30 | 29.80 | — | — | events and periods |
| timeline | — | ECharts | — | — | 16 | unsupported | — | — | — | — | events and periods — The timeline component is a playback control, not an event timeline. |
| timeline | — | Google Charts | — | svg | 16 | ok | 233.10 | 27.70 | — | — | events and periods |
| timeline | — | Highcharts | — | svg | 16 | ok | 47.40 | 23.00 | — | — | events and periods |
| timeline | — | Mermaid | — | svg | 16 | ok | 82.40 | 20.50 | — | — | events and periods |
| timeline | — | MUI X Charts | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Nivo | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Observable Plot | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Plotly.js | — | — | 16 | unsupported | — | — | — | — | events and periods — No event-timeline trace. |
| timeline | — | Recharts | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | TradingView Lightweight Charts | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Tremor | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | uPlot | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Vega-Lite | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | Victory | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| timeline | — | visx | — | — | 16 | unsupported | — | — | — | — | events and periods — No event timeline. |
| quadrant | — | AG Charts | — | canvas | 24 | ok | 152.20 | 16.30 | — | — | labeled points on a unit square |
| quadrant | — | amCharts 5 | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | AntV G2 | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | ApexCharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart type. |
| quadrant | — | Chart.js | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | ChartKit | — | svg | 24 | ok | 9.60 | 33.60 | — | — | labeled points on a unit square |
| quadrant | — | ECharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Google Charts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Highcharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Mermaid | — | svg | 24 | ok | 78.50 | 19.50 | — | — | labeled points on a unit square |
| quadrant | — | MUI X Charts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Nivo | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Observable Plot | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Plotly.js | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Recharts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | TradingView Lightweight Charts | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Tremor | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | uPlot | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Vega-Lite | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | Victory | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| quadrant | — | visx | — | — | 24 | unsupported | — | — | — | — | labeled points on a unit square — No quadrant chart. Points with guides are the scatter cell. |
| venn | — | AG Charts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | amCharts 5 | — | canvas | 3 | ok | 38.20 | 44.00 | — | — | sets; the data has 7 region rows |
| venn | — | AntV G2 | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | ApexCharts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Chart.js | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | ChartKit | — | svg | 3 | ok | 13.20 | 26.90 | — | — | sets; the data has 7 region rows |
| venn | — | ECharts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Google Charts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Highcharts | — | svg | 3 | ok | 34.10 | 29.10 | — | — | sets; the data has 7 region rows |
| venn | — | Mermaid | — | svg | 3 | ok | 77.20 | 12.30 | — | — | sets; the data has 7 region rows |
| venn | — | MUI X Charts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Nivo | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Observable Plot | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Plotly.js | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn trace. layout.shapes can draw circles and are not this chart. |
| venn | — | Recharts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | TradingView Lightweight Charts | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Tremor | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | uPlot | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Vega-Lite | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | Victory | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| venn | — | visx | — | — | 3 | unsupported | — | — | — | — | sets; the data has 7 region rows — No venn chart. |
| journey | — | AG Charts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | amCharts 5 | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | AntV G2 | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | ApexCharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | ChartKit | — | svg | 12 | ok | 10.60 | 30.90 | — | — | steps scored 1 to 5 |
| journey | — | ECharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Google Charts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Highcharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Mermaid | — | svg | 12 | ok | 76.20 | 14.40 | — | — | steps scored 1 to 5 |
| journey | — | MUI X Charts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Nivo | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Plotly.js | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Recharts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | TradingView Lightweight Charts | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Tremor | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | uPlot | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Vega-Lite | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | Victory | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| journey | — | visx | — | — | 12 | unsupported | — | — | — | — | steps scored 1 to 5 — No journey chart. |
| radial-bar | — | Chart.js | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No radial bar controller. polarArea is the rose cell. |
| radial-bar | — | ChartKit | — | svg | 12 | ok | 15.20 | 27.30 | — | — | categories around a circle |
| radial-bar | — | ECharts | — | canvas | 12 | ok | 31.10 | 19.20 | — | — | categories around a circle |
| radial-bar | — | Nivo | — | svg | 12 | ok | 33.40 | 25.40 | — | — | categories around a circle |
| radial-bar | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No radial bar mark. |
| radial-bar | — | Recharts | — | svg | 12 | ok | 29.40 | 12.40 | — | — | categories around a circle |
| radial-bar | — | uPlot | — | — | 12 | unsupported | — | — | — | — | categories around a circle — No polar bar series. |
| rose | — | Chart.js | — | canvas | 12 | ok | 20.20 | 28.40 | — | — | equal-angle slices |
| rose | — | ChartKit | — | svg | 12 | ok | 15.00 | 26.70 | — | — | equal-angle slices |
| rose | — | ECharts | — | canvas | 12 | ok | 26.40 | 19.30 | — | — | equal-angle slices |
| rose | — | Nivo | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area package in Nivo 0.99.0. |
| rose | — | Observable Plot | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area mark. |
| rose | — | Recharts | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No rose or polar-area chart. RadialBar is the radial-bar cell. |
| rose | — | uPlot | — | — | 12 | unsupported | — | — | — | — | equal-angle slices — No polar area or rose series. |
| sunburst | — | Chart.js | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst controller. |
| sunburst | — | ChartKit | — | svg | 48 | ok | 18.20 | 23.20 | — | — | leaves under 6 branches |
| sunburst | — | ECharts | — | canvas | 48 | ok | 29.50 | 18.40 | — | — | leaves under 6 branches |
| sunburst | — | Nivo | — | svg | 48 | ok | 35.90 | 13.00 | — | — | leaves under 6 branches |
| sunburst | — | Observable Plot | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst mark. |
| sunburst | — | Recharts | — | svg | 48 | ok | 29.50 | 21.30 | — | — | leaves under 6 branches |
| sunburst | — | uPlot | — | — | 48 | unsupported | — | — | — | — | leaves under 6 branches — No sunburst series. |
| bar-list | — | AG Charts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | amCharts 5 | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | AntV G2 | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | ApexCharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Chart.js | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | ChartKit | — | svg | 20 | ok | 26.80 | 33.30 | — | — | ranked rows |
| bar-list | — | ECharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Google Charts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Highcharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Mermaid | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | MUI X Charts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Nivo | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Observable Plot | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Plotly.js | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Recharts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | TradingView Lightweight Charts | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Tremor | — | html | 20 | ok | 46.00 | 66.50 | — | — | ranked rows |
| bar-list | — | uPlot | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Vega-Lite | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | Victory | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |
| bar-list | — | visx | — | — | 20 | unsupported | — | — | — | — | ranked rows — No bar-list component. A horizontal bar is the bar cell. |

Chart-type cells that failed: Nivo line n=1000000 error, Recharts stacked-area n=100000 error, Nivo stacked-area n=100000 error, ApexCharts candlestick n=100000 timeout.
276 cells are unsupported: the library has no native chart of that shape, and the time is null.

At 10,000 points the fastest update is Chart.js at 17.60 ms. ChartKit update is 33.10 ms (samples 33.10, 33.20, 32.60, 33.20, 33.00). Those samples sit on the two-frame wait. The sampled SVG replacement is not a separate hotspot in that cell. ChartKit sampling none at 100,000 points is 54.00 ms initial and 1157.20 ms update. At 1,000,000 points with sampling none the status is ok (466.70 ms initial, 21550.20 ms update). ECharts at 100,000 points updates in 2739.90 ms; the shared frames now wait for that canvas to paint, which the old finished-only timer did not.

### ChartKit before and after sampling

Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.

| Points | Before initial / update | After initial / update | Before note |
|---:|---:|---:|---|
| 1000 | 18.70 / 25.10 | 12.00 / 28.00 | full path |
| 10000 | 23.60 / 45.50 | 15.30 / 33.10 | full path |
| 100000 | 123.80 / 1202.30 | 14.20 / 30.80 | full path; update was one sample and slower than the error-SVG 1M row |
| 1000000 | 260.80 / 239.70 | 24.30 / 23.90 | error SVG, not a chart |

### ChartKit before and after the typed-column path

Before is the median of 5 from 2026-10-16T15:40:22.418Z, after sampling was added and before typed columns stayed in place. After is this run. The machines can differ; the library table above is the same-machine comparison.

| Points | Before initial / update | After initial / update |
|---:|---:|---:|
| 1000 | 21.80 / 31.80 | 12.00 / 28.00 |
| 10000 | 17.00 / 28.80 | 15.30 / 33.10 |
| 100000 | 35.10 / 21.10 | 14.20 / 30.80 |
| 1000000 | 213.90 / 171.30 | 24.30 / 23.90 |

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

Node string or SVG render at the paint-matrix N. Line is 100,000 points. Candlestick is timed at 2,000 and at 100,000. Other types use the paint N (100,000 where the series is dense, smaller for categories and hierarchies). Data is built before the clock. One untimed warmup, then the median of 5. ChartKit calls createRenderer of that chart. ECharts uses init(null, { renderer: svg, ssr: true }) and renderToSVGString. Recharts, Nivo, visx, Victory, MUI X, and Tremor use renderToStaticMarkup. Observable Plot uses linkedom. Vega-Lite compiles the spec and vega View.toSVG runs it. ApexCharts uses apexcharts/ssr renderToString. A library with no headless string path is unsupported. A throw is error. No timing is invented.

Phase 4 measured **2026-10-29T15:58:39.954Z**, commit `71f3fe44240285d7a3c5047f31d956568c0fa45f`, Node **v22.23.4**.

Cells: ok 136, unsupported 616, license-blocked 0, error 4. Median of 5. Full rows: `bench/results/ssr.json`.

| Chart | N | Median ms |
|---|---:|---:|
| line | 100000 | 2.63 |
| bar | 48 | 0.26 |
| pie | 8 | 0.03 |
| donut | 8 | 0.03 |
| stacked-area | 100000 | 17.35 |
| scatter | 100000 | 83.58 |
| combo | 48 | 0.30 |
| heatmap | 1200 | 4.34 |
| gauge | 1 | 0.07 |
| kpi | 1 | 0.04 |
| sparkline | 100000 | 6.83 |
| mini-area | 100000 | 3.28 |
| progress-ring | 1 | 0.01 |
| spike | 100000 | 24.19 |
| candlestick | 2000 | 5.58 |
| candlestick | 100000 | 435.69 |
| histogram | 100000 | 10.54 |
| boxplot | 100000 | 28.08 |
| radar | 8 | 0.08 |
| funnel | 8 | 0.05 |
| treemap | 48 | 0.78 |
| sankey | 48 | 0.37 |
| bullet | 6 | 0.07 |
| waterfall | 12 | 0.11 |
| area-range | 100000 | 5.21 |
| bar-range | 24 | 0.16 |
| errorbar | 24 | 0.17 |
| gantt | 24 | 0.27 |
| timeline | 16 | 0.09 |
| quadrant | 24 | 0.10 |
| venn | 3 | 3.06 |
| journey | 12 | 0.13 |
| radial-bar | 12 | 0.12 |
| rose | 12 | 0.06 |
| sunburst | 48 | 0.58 |
| bar-list | 20 | 0.07 |

No measured rival is faster than ChartKit at SSR on the same chart and N.

MUI X Charts sparkline n=100000: error (Cannot read properties of undefined (reading 'length')); Victory stacked-area n=100000: error (error: sample exceeded 90000ms); ApexCharts stacked-area n=100000: error (error: sample exceeded 90000ms); ApexCharts area-range n=100000: error (error: sample exceeded 90000ms).

Unsupported means that library has no native chart of that shape, or no headless Node string path. The time is null.

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
