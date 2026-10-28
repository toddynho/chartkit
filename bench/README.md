# Benchmarks

`npm run bench` from the repo root writes `BENCHMARKS.md` and `bench/results/latest.json`.

It compares a ChartKit line, bar, and donut (minimal entry and `/all`) with pinned versions of uPlot, Chart.js, Recharts, ECharts (modular imports), Nivo, and Observable Plot.

- Bundle: esbuild minify, gzip level 9, brotli quality 11.
- Browser: Playwright Chromium, line charts at 1k, 10k, 100k, and 1M points. Same `makeSeries` data, 640×360. Each cell is the median of 5 fresh pages. ChartKit uses `mark.sampling: "auto"`. A second row, ChartKit sampling none, draws every point at 100k and 1M. Every library waits for its own update and then the same two animation frames.
- SSR: Node, no jsdom and no node-canvas.
- Agent eval: 42 tasks. Runs only when `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `XAI_API_KEY` is set. A code-library pass must import that library and return a drawn chart, or correctly decline. Recharts, Chart.js, and Observable Plot run in Playwright. Recharts must produce an SVG with data marks. Chart.js must paint canvas pixels. Observable Plot must return the SVG from `Plot.plot`. Values come from the chart, not from `meta`. Validator, render, compile, and library-use errors are fed back once. ChartKit `repair()` can accept an answer with no extra model call. `BENCH_DOCS=none` gives every library one paragraph: how to draw, and where fields go. `BENCH_DOCS=official` also prepends that library's own official doc, cut to the length of `catalog/public/llms.txt`. The sources and byte counts are in `BENCHMARKS.md`. The recorded claude-sonnet-4-5 run in `bench/results/agent/sonnet-4-5/` used the older checker and is labeled as inflated. Round 2 at `055196d` is the old-protocol row. Round 3 at `ee0b474` is the protocol before drawn-output checks. Round 5 at `bc7ee8e`, plus a full-pixel Chart.js ink scan, is in `bench/results/agent/round-5/`. Round 6 at `5a026be` is the current first-try scoreboard, one model and one run, in `bench/results/agent/round-6/`. `bench/results/agent/conditions/` and `bench/results/agent/matrix/` are gitignored local scratch.

## Token matrix

Homepage medians are not the round-6 first-try means. They are output tokens and model calls until a working chart, with-docs (`BENCH_DOCS=official`) by default.

```bash
# one model. Defaults to with-docs. BENCH_DOCS=none is the optional no-docs run.
BENCH_LLM_PROVIDER=xai BENCH_LLM_MODEL=grok-4.7 npm run bench:agent

# every row in bench/agent/models.json. Skips a provider whose key is unset.
npm run bench:agent-matrix

# re-run one id into the same folder
BENCH_LLM_PROVIDER=openai BENCH_LLM_MODEL=gpt-6-luna npm run bench:agent-matrix
```

`BENCH_LLM_PROVIDER` is `openai`, `anthropic`, or `xai`. xAI is Chat Completions at `https://api.x.ai/v1/chat/completions` with `XAI_API_KEY`. A `gpt-6*` model that Chat Completions rejects is sent to the OpenAI Responses API. Temperature is 0 and max output tokens is 4096. Do not print keys.

Add a model by appending one object to `models` in `bench/agent/models.json` (`provider`, `model`, `inputPerMillion`, `outputPerMillion`), then re-run. Prices are stubs until replaced from the vendor price page. The summary is `bench/results/agent/matrix/summary-official.json`.

Medians use supported passes only. Sum output tokens across the model calls until the checker passes. ChartKit `repair()` does not add a call; if it fixes the first answer, there is no second prompt. Honest `meta.unsupported` counts as a pass only when that library cannot draw the type, and those rows are not working charts. DNF tasks are listed and left out of the median. The median is not infinity.

`npm run bench` still defaults its agent hook to `BENCH_DOCS=none`. The published commands above default to `official`.

```bash
npm run bench
npm run bench -- --skip-agent
npm run bench:agent
npm run bench:agent-matrix
```

`BENCH_POINTS=1000,10000` limits the line comparison. The default is 1000, 10000, 100000, and 1000000. It does not change chart-type point counts.

### Chart types

The browser sweep paints every gallery type (`apps/web/src/data/chart-types.ts`, 35 types) for ChartKit and for the libraries already on the line sweep: uPlot, Chart.js, ECharts, Recharts, Nivo, and Observable Plot. Cells land in `browser.charts` inside `bench/results/latest.json` when bundle, browser, and SSR all run, and in `bench/results/paint.json` (median of 5) or `bench/results/paint-smoke.json` (any other sample count). The line comparison table is unchanged: chart-type rows are not mixed into it.

There is no `type: "area"`. The homepage row **area** is native **stacked-area** (full size, four series). A filled line is still `line` with `mark.area: true`. `mini-area` is one filled series with the axes off, still in the 640×360 frame.

A rival cell is timed only when that library has a native chart of the same shape. The point count is the ChartKit cell's N. Line cells are copied from the line sweep, so line is not measured twice. `unsupported` is written with a reason and a null time. It is not a silent omit and it is not a stand-in: no pie made from bars, no waterfall made from a transparent helper bar, no histogram made from bars the harness binned, no sparkline made by hiding axes on the line cell, no spike drawn as a bar. uPlot's candlestick demo path, ECharts' custom series, and the ECharts timeline playback control are not native charts. Nivo uses the 0.99.0 package for that shape (the same version as the pinned line, bar, and pie), including stream with `offsetType: "none"` for stacked area. The Nivo scatter cell uses that package's canvas renderer. The SVG scatter builds one node per point and does not finish inside the sample timeout at 100,000. Recharts and Nivo stacked-area throw `Maximum call stack size exceeded` at 100,000 x values inside their own domain or stack walk. That cell is status `error`. Plot's histogram is `binX`, so Plot does the binning. Commercial libraries are a later phase. A missing license key is `blocked`, not a reason to drop the rest of that set.

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

Phase 3 (`BENCH_PHASE=3`) adds the rest of the compare matrix and times the eleven types that had no Phase-2 rival ok cell: bar-list, gantt, journey, kpi, progress-ring, quadrant, sparkline, spike, timeline, venn, and waterfall. ChartKit is painted again for those eleven. Phase-2 rivals stay unsupported there and are not repainted. Candlestick is included only where a Phase-3 library has a native OHLC series, because Phase 2 had ECharts alone. A cell is timed only for a native chart. Credits, logos, and trial watermarks stay visible. A library that will not paint without a license key is `status: "blocked"`. Pins and the commercial notes are in `chartMethod` on `bench/results/paint.json`. This pass does not change the homepage.

```bash
BENCH_PHASE=3 BENCH_SAMPLES=5 npm run bench -- --skip-bundle --skip-ssr --skip-agent
```

```bash
BENCH_SAMPLES=1 BENCH_LIBS=chartkit-bar,chartkit-donut npm run bench -- --skip-bundle --skip-ssr --skip-agent
BENCH_TYPES=stacked-area,scatter BENCH_RESUME=1 npm run bench -- --skip-bundle --skip-ssr --skip-agent
BENCH_SKIP_CHARTS=1 npm run bench -- --skip-agent
node bench/browser/probe.mjs
```

`BENCH_TYPES` limits the type sweep (ids such as `bar`, not `chartkit-bar`). `BENCH_LIBS` limits adapter ids and still applies. `BENCH_CHART_POINTS` keeps only type sizes that are in that list. `BENCH_RESUME=1` reuses ok cells in `bench/results/paint-checkpoint.jsonl` when their sample count matches `BENCH_SAMPLES`, so a one-sample smoke is not reused as a median of 5. A chart-type sample that does not finish in time is status `timeout` (180s at 100,000 points). `node bench/browser/probe.mjs` renders each ChartKit spec in Node and does not time the browser protocol.

Dependencies live in this directory and are pinned in `package.json`. The first `npm run bench` needs `npm install` here and `npx playwright install chromium`. The GitHub Actions workflow `Benchmarks` is `workflow_dispatch` and runs the non-LLM sections.
