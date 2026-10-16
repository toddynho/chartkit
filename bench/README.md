# Benchmarks

`npm run bench` from the repo root writes `BENCHMARKS.md` and `bench/results/latest.json`.

It compares a ChartKit line, bar, and donut (minimal entry and `/all`) with pinned versions of uPlot, Chart.js, Recharts, ECharts (modular imports), Nivo, and Observable Plot.

- Bundle: esbuild minify, gzip level 9, brotli quality 11.
- Browser: Playwright Chromium, line charts at 1k, 10k, 100k, and 1M points. Same `makeSeries` data, 640×360. Each cell is the median of 5 fresh pages. ChartKit uses `mark.sampling: "auto"`.
- SSR: Node, no jsdom and no node-canvas.
- Agent eval: 42 tasks. Runs only when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. Otherwise the report says `not yet run`.

```bash
npm run bench
npm run bench -- --skip-agent
```

`BENCH_POINTS=1000,10000` limits the browser sweep. The default is 1000, 10000, 100000, and 1000000.

Dependencies live in this directory and are pinned in `package.json`. The first `npm run bench` needs `npm install` here and `npx playwright install chromium`. The GitHub Actions workflow `Benchmarks` is `workflow_dispatch` and runs the non-LLM sections.
