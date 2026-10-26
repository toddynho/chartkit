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

`BENCH_POINTS=1000,10000` limits the browser sweep. The default is 1000, 10000, 100000, and 1000000.

Dependencies live in this directory and are pinned in `package.json`. The first `npm run bench` needs `npm install` here and `npx playwright install chromium`. The GitHub Actions workflow `Benchmarks` is `workflow_dispatch` and runs the non-LLM sections.
