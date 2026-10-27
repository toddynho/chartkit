# Benchmarks

`npm run bench` from the repo root writes `BENCHMARKS.md` and `bench/results/latest.json`.

It compares a ChartKit line, bar, and donut (minimal entry and `/all`) with pinned versions of uPlot, Chart.js, Recharts, ECharts (modular imports), Nivo, and Observable Plot.

- Bundle: esbuild minify, gzip level 9, brotli quality 11.
- Browser: Playwright Chromium, line charts at 1k, 10k, 100k, and 1M points. Same `makeSeries` data, 640×360. Each cell is the median of 5 fresh pages. ChartKit uses `mark.sampling: "auto"`. A second row, ChartKit sampling none, draws every point at 100k and 1M. Every library waits for its own update and then the same two animation frames.
- SSR: Node, no jsdom and no node-canvas.
- Agent eval: 42 tasks. Runs only when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. A code-library pass must import that library and return a drawn chart, or correctly decline. Recharts and Chart.js run in Playwright. Recharts must produce an SVG with data marks. Chart.js must paint canvas pixels. Values come from the chart, not from `meta`. Validator, render, compile, and library-use errors are fed back once. `BENCH_DOCS=none` gives every library one paragraph: how to draw, and where fields go. `BENCH_DOCS=official` also prepends that library's own official doc, cut to the length of `catalog/public/llms.txt`. The sources and byte counts are in `BENCHMARKS.md`. The recorded claude-sonnet-4-5 run in `bench/results/agent/sonnet-4-5/` used the older checker and is labeled as inflated. Round 2 at `055196d` is the old-protocol row. Round 3 at `ee0b474` is the protocol before drawn-output checks. Round 5 at `bc7ee8e`, plus a full-pixel Chart.js scan, is in `bench/results/agent/round-5/`. Round 6 at `5a026be` is the current scoreboard, one model and one run, in `bench/results/agent/round-6/`. `bench/results/agent/conditions/` is gitignored local scratch.

```bash
npm run bench
npm run bench -- --skip-agent
```

`BENCH_POINTS=1000,10000` limits the line comparison. The default is 1000, 10000, 100000, and 1000000. It does not change chart-type point counts.

### Chart types

The browser sweep also paints every gallery type ChartKit ships (`apps/web/src/data/chart-types.ts`, 35 types). Cells land in `browser.charts` inside `bench/results/latest.json` when bundle, browser, and SSR all run, and in `bench/results/paint.json` (median of 5) or `bench/results/paint-smoke.json` (any other sample count). The line comparison table is unchanged: chart-type rows are not mixed into it.

There is no `type: "area"`. The homepage row **area** is native **stacked-area** (full size, four series). A filled line is still `line` with `mark.area: true`. `mini-area` is the small chart with no axes.

The timer matches the line row: data is built before the clock, the SVG is assigned to `innerHTML`, then two animation frames. Size is 640×360. An error SVG fails the sample. `gzipBytes` and `ssrMs` are null until a later phase. Line multi-size, canvas, and sampling-none cells are copied from the line sweep so line is not measured twice. Those numbers are this paint protocol, not the hover-steady figure in `catalog/public/benchmarks.json`.

Point counts are the fair N for that chart, not a copy of the line's 100,000:

| Type | N | Why |
|---|---:|---|
| line | 1k, 10k, 100k, 1M | Existing sweep. sampling auto. Canvas and sampling-none are variants. |
| stacked-area (homepage area) | 100,000 x, 4 series | Dense series, sampling auto. N is the x length. |
| scatter, sparkline, mini-area, spike, area-range, histogram | 100,000 | Dense series. Histogram N is observations; the chart bins them (32, cap 60). |
| boxplot | 100,000 observations | Eight groups. Values stay inside the Tukey fences. |
| bar, combo | 48 categories | A bar chart, not 100,000 bars. Combo is one bar series and one line series. |
| pie, donut, funnel | 8 | Parts of a whole, or stages. |
| heatmap | 1,200 | 40×30 grid. A calendar cannot grow past weeks×7. |
| candlestick | 2,000 and 100,000 | No sampling. 2,000 is the long series. 100,000 puts ~200,000 prices into `Math.max` spread and is expected to error on V8; the cell is kept. |
| treemap, sankey, sunburst | 48 | Tiles, links, or leaves. |
| bar-list | 20 | Ranked rows. Loaded from its own module. |
| bar-range, errorbar, gantt, quadrant | 24 | Categories, tasks, or labeled points. |
| timeline | 16 | Events and periods. |
| radar | 8 spokes, 3 series | Fewer than 3 spokes is unsupported. |
| radial-bar, rose, waterfall, journey | 12 | Categories, steps, or equal angles. Waterfall includes the two totals. |
| bullet | 6 | Rows with a target and ranges. |
| gauge, kpi, progress-ring | 1 | One metric. KPI's sparkline stays 24 and is not N. |
| venn | 3 sets | Largest supported Venn. Four or more is unsupported. |

Later paint, bundle, and SSR phases add the other libraries on the same cell, including commercial compare-matrix rivals (Highcharts, amCharts, ApexCharts community and commercial builds, AG Charts enterprise, MUI X Pro and Premium, and the same class of product) from the published npm or CDN build a customer would install. Record license and watermark limits. A missing license key is `status: "blocked"` with a note, not a silent omission and not a reason to drop the rest of that set. `unsupported` means that library has no native chart of that type. This phase does not invent those cells.

```bash
BENCH_SAMPLES=1 BENCH_LIBS=chartkit-bar,chartkit-donut npm run bench -- --skip-bundle --skip-ssr --skip-agent
BENCH_TYPES=stacked-area,scatter BENCH_RESUME=1 npm run bench -- --skip-bundle --skip-ssr --skip-agent
BENCH_SKIP_CHARTS=1 npm run bench -- --skip-agent
node bench/browser/probe.mjs
```

`BENCH_TYPES` limits the type sweep (ids such as `bar`, not `chartkit-bar`). `BENCH_LIBS` limits adapter ids and still applies. `BENCH_CHART_POINTS` keeps only type sizes that are in that list. `BENCH_RESUME=1` reuses ok cells in `bench/results/paint-checkpoint.jsonl` when their sample count matches `BENCH_SAMPLES`, so a one-sample smoke is not reused as a median of 5. `node bench/browser/probe.mjs` renders each spec in Node and does not time the browser protocol.

Dependencies live in this directory and are pinned in `package.json`. The first `npm run bench` needs `npm install` here and `npx playwright install chromium`. The GitHub Actions workflow `Benchmarks` is `workflow_dispatch` and runs the non-LLM sections.
