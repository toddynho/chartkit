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

`BENCH_POINTS=1000,10000` limits the browser sweep. The default is 1000, 10000, 100000, and 1000000.

Dependencies live in this directory and are pinned in `package.json`. The first `npm run bench` needs `npm install` here and `npx playwright install chromium`. The GitHub Actions workflow `Benchmarks` is `workflow_dispatch` and runs the non-LLM sections.
