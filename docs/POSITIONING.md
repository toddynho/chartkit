# ChartKit positioning memo

Status: draft for the owner's decision. Written 2026-11-16. Wave 2 (the README and docs rewrite, and the narrower API) is waiting on it.

This memo does three things. It recommends one position, with the README's first screen drafted from it. It lists the claims to stop making. It lists the decisions only the owner can make, each with a recommended default.

Competitor facts come from a web scan on 2026-11-16, with a source URL on each. Where a fact could not be confirmed from a primary source, it says "unverified". ChartKit numbers come from `bench/results/*.json`, `BENCHMARKS.md`, `catalog/public/features.json`, and `apps/web/src/data/token-eval.ts`. Each one names its file and field.

---

## 1. The recommendation in one line

> **Charts an agent can write and a server can render. One JSON spec, validated and repaired locally, drawn as SVG in any framework or none.**

Short form for the tagline: **"The chart spec built for agents and servers."**

The adjective to keep is **honest**: every option draws or warns, and the benchmarks publish their losses. Drop **tiny** and **impossible to misuse** (section 4 explains why).

### How the suggested position holds up

The review suggested "the best charts for dashboards, SSR, and AI agents: tiny, honest, impossible to misuse". Each part, tested against the data:

| Part | Verdict | Why |
| --- | --- | --- |
| SSR | **Keep. It is the strongest measured win.** | No measured rival is faster at server render on the same chart and N (`bench/results/ssr.json`). Bar at 48 rows takes 0.26 ms. ECharts takes 5.45 ms, Observable Plot 2.26 ms and Vega-Lite 8.47 ms. Pie at 8 slices takes 0.03 ms; the rivals take 2.4–6.5 ms. Nine adapters print the SVG during SSR. |
| AI agents | **Keep, but change the reason.** | An MCP is now table stakes among paid vendors (see section 5), so having one is not the edge. The edge is that `validate()`/`repair()` run locally and deterministically, with no model call and no hosted service, and fewer output tokens per working chart across 8 models. |
| Dashboards | **Use case, not moat.** | Tremor (now Vercel's) and shadcn/ui charts own React dashboards, and shadcn is what v0 and most AI-generated React apps use. Say "dashboards" in examples, not in the position. |
| Tiny | **Drop as a superlative.** | uPlot is smaller on line, bar, scatter and mini-area. `/all` is 78,081 B gzip, larger than Chart.js's line entry (49,361 B). What holds: a per-chart entry is 6.7–38 KB gzip, and the line entry is smaller than every measured rival except uPlot (`bundle.json`). |
| Honest | **Keep.** | It is true and rare. `BENCHMARKS.md` publishes the losses, and schema honesty means every option draws or warns (#16). |
| Impossible to misuse | **Drop.** | First-try with no docs is 21/42 while Recharts, ECharts and Chart.js score 42/42 (round 6). What holds: `repair()` takes those 21/42 to 42/42 with no model call. |

### Why this position and not another

- **Large data.** Owned by SciChart (WebGPU/WASM, "hundreds of millions of points") and LightningChart ("10M points per second"), plus uPlot among the free libraries. ChartKit has ruled out WebGL (`ROADMAP.md`, "Not planned"), so it cannot credibly compete here.
- **Breadth.** Owned by Highcharts and ECharts. ChartKit draws about 39 types and has no network, chord, violin, parallel coordinates or 3D (`features.json`, ChartKit `none` cells).
- **Accessibility.** Owned by Highcharts: WCAG 2.2, sonification, and the module in every licence. ChartKit requires alt text but leaves keyboard and the data table off by default.
- **React.** Owned by Recharts, with 34M weekly downloads in `features.json`.
- **The open lane.** A *framework-neutral JSON spec, built for generation*, that renders *on the server* with no browser, and that *checks and fixes itself locally*. Vega-Lite is the closest match. It has a better-known grammar but a ~266 KB runtime, no first-party agent tooling, and server rendering about 30× slower on the 48-bar cell (`ssr.json`). ECharts is next: JSON options and good SSR, but a 161 KB modular bar, community-only framework wrappers, and no llms.txt.

---

## 2. Three headline proof points

These go on the homepage and the README's first screen. Each one has a number a skeptic can reproduce.

### Proof point 1: server render

> **Renders on the server faster than any library we measured.** A 48-bar chart takes 0.26 ms in Node. ECharts takes 5.45 ms, Observable Plot 2.26 ms and Vega-Lite 8.47 ms.

- Source: `bench/results/ssr.json`, `cells[]`, chart `bar`, points 48, field `medianMs`. Rivals: the same chart and N.
- **Caveat that has to stay in the copy:** the 100k-point line figure (2.63 ms against ECharts 125 ms) is **sampled**. The cell's `nMeaning` is `"points; sampling auto"`, so ChartKit draws a minmax-reduced line. Don't make it the headline. If it is shown at all, label it "sampled" in the same sentence.

### Proof point 2: agents

> **Fewer tokens per working chart, on every model we tested, and `repair()` fixes bad specs without calling the model again.**

- Sources:
  - Token medians: `apps/web/src/data/token-eval.ts`, 8 models across Claude, GPT-6 and Grok. ChartKit takes 78–133 output tokens per working chart; the next library takes 166–711.
  - Repair: `BENCHMARKS.md` round 6. No-docs first try is 21/42; after `repair()` it is 42/42, with no model call.
- **Blocker before this can lead:** the raw token-matrix results are not in the repo. `token-eval.ts` says so, and `versionRecorded` is false. Commit `bench/results/agent/matrix/summary-official.json` and the per-model files, or the headline cannot be reproduced. Name round 6 as the current repair figure, or re-run it on the matrix models.
- **Fairness note to publish alongside:** ChartKit is compared with code libraries (Recharts, Chart.js, ECharts as code, Plot). A JSON spec will always cost fewer tokens than code that imports a library. The matrix does not include Vega-Lite or ECharts-as-JSON, which are the fair comparison. Add Vega-Lite to the matrix before a competitor does.

### Proof point 3: one spec, every stack

> **The same JSON draws in React, Vue, Svelte, Solid, Qwik, Angular, Astro, plain DOM and `<chart-kit>`, and each one prints the SVG on the server.**

- Source: `README.md` adapters section and `packages/*`.
- No competitor matches it. Highcharts and AG Charts ship React, Angular and Vue wrappers. ECharts and Chart.js have community wrappers only. Recharts, Nivo, Tremor and shadcn are React only.
- It is a claim about architecture, not a benchmark, so it cannot regress silently. Back it with one showcase board that renders one spec on every stack (already in progress in #20).

Bundle size goes **fourth**, as a supporting line, not a headline: "a line chart is 32 KB gzip, every chart is 78 KB". Put uPlot's 24 KB beside it.

### Draft README first screen

```md
# ChartKit

Charts an agent can write and a server can render.

One JSON spec. `validate()` and `repair()` run locally, with no model call.
The same spec draws as SVG in React, Vue, Svelte, Solid, Qwik, Angular, Astro,
plain DOM, or Node.

- **Server render:** a 48-bar chart in 0.26 ms. ECharts takes 5.45 ms and Vega-Lite 8.47 ms. [ssr.json]
- **Agents:** 78–133 output tokens per working chart across 8 models. The next library takes 166–711. `repair()` fixes the rest without the model. [method]
- **Every stack:** nine adapters, each with server output. Zero runtime dependencies in core.

A line chart is 32 KB gzip (uPlot: 24 KB). We publish our losses: [benchmarks].

npm install @chartkitdev/core
```

Then one spec, one render call, and a link to the framework picker. Move the README's current benchmark tables (the canvas table, the hover rows, the aligned-update losses) into `BENCHMARKS.md`. They are honest, but they bury the pitch.

---

## 3. Prerequisites for any "#1" claim

- **Publish to npm.** `npm view @chartkitdev/core version` returns 404 today, and `features.json` records 7 GitHub stars. Every rival in this memo has between 190k and 34M weekly downloads. Until v1 is on npm (the ship-prep workstream), no claim can be about adoption, and the install line in the README does not work.
- **Make the agent eval reproducible** (proof point 2 above).
- **Fix the stale matrix cells.** `features.json` gives `framework.mcp` only to ChartKit, and `validate.agentdocs` only to ChartKit and MUI X. That is no longer true (section 5). Any copy derived from those cells, such as "the only library with an MCP", must go. Update the cells in a separate PR.

---

## 4. Stop claiming

The scan of `apps/web/src`, `llms.txt` and the README found no "10M points" or "fastest" claim to retract. The risks are in what the current numbers imply.

| Claim or implication | Why it fails | Say instead |
| --- | --- | --- |
| Fast at very large data. The README's "Even 1M is 23.6 ms vs uPlot 26.5 ms" reads that way. | It is sampled. With sampling off, 1M takes 471.8 ms to draw and 462.4 ms to update (README). There is no WebGL. SciChart, LightningChart, Highcharts Boost and AG Charts all claim 500k–100M+ points. | "Draws 1M-point lines in about 24 ms by sampling to the pixel width. For millions of raw points, use a GPU library." Link to them. |
| SSR 48× faster than ECharts at 100k | Sampled against unsampled (see proof point 1). | Lead with the bar and pie cells. |
| Smallest bundle | uPlot wins line, bar, scatter and mini-area (`BENCHMARKS.md`, "A rival is smaller"). | "Per-chart entries from 6.7 KB. A line is 32 KB." |
| Hover is fast | First hover is 15.9–20.8 ms against uPlot's 4–4.9 ms (README). | Don't headline interaction speed. |
| Agents get it right first time | No docs first try: 21/42, where the rivals score 42/42 (round 6). | "`repair()` takes 21/42 to 42/42 with no model call." Ship `llms.txt` with the MCP. |
| Most features (212 native of 263) | ChartKit wrote the taxonomy, and its cells have 4 unknowns against 14–76 for the rivals. A reviewer will discount it. | Use the matrix as a reference tool, never as a score. |
| Only library with an MCP or agent docs | False: see section 5. | "Validate and repair run locally, not in a hosted service." |
| Accessible by default | Keyboard and the data table are off unless set (README). Recharts 3 turns its accessibility layer on by default, and Highcharts leads the category. | "Every chart requires alt text, and the validator enforces it." Or turn keyboard on by default (decision D5). |
| "Best-looking defaults" (`ROADMAP.md`) | It is taste, not a measurement. | Show the gallery. Don't assert it. |

---

## 5. Competitor snapshot

**Bundle columns.** "Bench" is ChartKit's own esbuild per-chart method: `bench/results/bundle.json`, chart `line`, `gzipBytes`, with React included for React libraries. "Full entry" is the bundlephobia default import, min+gzip, from the 2026-11-16 scan. The two methods are not comparable across columns.

| Library | Wins on | Licence and price (1 dev) | Line, bench gzip | Full entry | Large data | Accessibility | SSR | Frameworks | Agent/LLM |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| **ChartKit** | JSON spec, SSR, adapters | MIT | 32,110 | n/a (not on npm) | SVG; canvas marks; sampling; no WebGL | `a11y.alt` required; keyboard and data table opt-in | Node string, 9 adapters | 9 + element | MCP, llms.txt, local validate/repair |
| Highcharts 13.1 | Maturity, Stock/Maps/Gantt, accessibility | Proprietary; Core $366/seat [H2] | 104,197 | 99.5 KB | Boost (WebGL): 500k–1M pt samples [H4] | Leader: WCAG 2.2, sonification [H5] | Hosted Render MCP returns a PNG [H1] | React, Angular, Vue (unverified) | 3 hosted MCPs incl. schema validation [H1]; AI analytics "Orbit" planned for Q1 2027 [H6] |
| amCharts 5.22 | Polish, maps, low price | Free with attribution; $180 / $650 / $2,700 [A2] | 93,499 | 118 KB | Canvas (unverified) | Strong: keyboard, ARIA templates, forced colours [A5] | Unverified | Unverified | MCP, skills, llms.txt, `AGENTS.md` in the package, Claude plugin [A1][A3][A6] |
| AG Charts 14.3 | Pairs with AG Grid; free MIT tier | Community MIT; Enterprise priced in the configurator [G1] | not tree-shakeable (421 KB community) | 412 KB | Canvas with M4 sampling, "1M+" [G4] | Keyboard plus screen readers, tested on 4 readers [G3] | PNG in Node since 13.2 [G7] | React, Angular, Vue | Skills, Markdown docs, llms.txt [G2][G8]; MCP unverified |
| SciChart.js 6 | Raw performance, 3D | Non-commercial free; $1,350/yr 2D [S1] | not measured | 384 KB + WASM | WebGPU/WebGL, "hundreds of millions" [S2] | Unverified | Unverified | Unverified | GPT assistant; MCP in restricted testing [S3]; llms.txt [S5] |
| LightningChart JS 9 | Real-time streaming | Non-commercial free with watermark; paid by quote [L2a] | not measured | 401 KB | "10M pts/sec" [L1] | Unverified | Unverified | Unverified | Official MCP [L4], skill [L1] |
| ECharts 6.1 | Widest free catalogue, JSON options | Apache-2.0 | 162,948 (modular) | 359 KB | Canvas; WebGL via echarts-gl (unverified) | ARIA description (off by default), decals; no documented keyboard [E2] | Zero-dependency SVG string plus a 4 KB hydrate [E1] | Community wrappers only | Apache `echarts-mcp` repo [E3]; no llms.txt |
| Chart.js 4.6 | Simplest API, adoption | MIT | 49,361 | 68 KB | Canvas 2D | Left to the user [CJ1] | node-canvas only | Community | None. (There is no Chart.js 5 [CJ2].) |
| Recharts 3.10 | Default React library | MIT | 99,674 (96,168 React external) | 146 KB | SVG | Accessibility layer on by default since v3 [R1] | React SSR with fixed size | React | None |
| Nivo 0.99 | Good defaults, many types | MIT | 100,561 | 155 KB (core + line) | SVG/Canvas/HTML | Unverified | Yes [N1] | React | None. Last release May 2025 [N2]. |
| Plotly.js 4.3 | Science, 3D, Python/Dash | MIT | not tree-shakeable (1.48 MB) | 1,376 KB | WebGL traces | Unverified | Kaleido (unverified) | react-plotly.js | Dash/Cloud MCP, nothing for plotly.js [P3] |
| uPlot 1.6 | Smallest and fastest time series | MIT | 24,054 incl. CSS | 21 KB | Canvas 2D, ~166k pts in 25 ms [U1] | None | None | Community | None. Last release Mar 2025 [U2]. |
| Vega-Lite 6.5 | Declarative grammar LLMs already know | BSD-3 | not tree-shakeable (378 KB) | ~266 KB with Vega | SVG/Canvas | Unverified | `vl-convert`, no browser [V1] | Embeds | No first-party MCP or llms.txt |
| Observable Plot 0.6 | Concise grammar, exploration | ISC | 97,695 | 124 KB | SVG | Unverified | Virtual DOM `document` [O1] | None official | None found |
| Tremor | Tailwind dashboards | Apache-2.0, free; Vercel acquired it Jan 2025 [T1] | not tree-shakeable (247 KB) | 217 KB | SVG (Recharts) | Via Recharts/Radix | Via Recharts | React | None |
| shadcn/ui charts | Default for v0 and AI-made React apps | MIT, copy-paste | Recharts + your code | Recharts | SVG (Recharts v3) [C1] | `accessibilityLayer` [C1] | Via Recharts | React | Official MCP plus llms.txt [C2] |

### What this means for ChartKit

- **Paid vendors already sell agent tooling.** Highcharts has three hosted MCPs, one of which validates configs against its schema. amCharts ships an MCP, skills, `AGENTS.md` in the package and a Claude plugin. LightningChart ships an MCP, and AG Charts ships skills and llms.txt. "Has an MCP" is not a differentiator.
- **ChartKit's agent edge is that it is local, deterministic and free.** `repair()` returns a JSON Patch and an error code (CK…) in-process, without a network call or a model call. Highcharts' validation is a hosted service on a proprietary licence. Say "no hosted service, no API key, no model call" explicitly.
- **Open-source agent support is thin.** Only shadcn has a polished MCP and llms.txt, and it is React plus Recharts. ECharts has an MCP repo and no llms.txt. Vega-Lite has the right shape and no tooling. That is ChartKit's lane among free libraries.
- **On SSR, ECharts is the real competitor.** It has a zero-dependency SVG string and a 4 KB hydrate. ChartKit is faster on every measured cell and has first-party adapters. ECharts has the catalogue and the community.

### Sources

- [H1] https://www.highcharts.com/mcp/ · [H2] https://shop.highcharts.com/ · [H4] https://www.highcharts.com/docs/advanced-chart-features/boost-module · [H5] https://www.highcharts.com/docs/accessibility/accessibility-module · [H6] https://www.highcharts.com/roadmap
- [A1] https://www.amcharts.com/introducing-amcharts-ai-resources/ · [A2] https://www.amcharts.com/online-store/ · [A3] https://www.amcharts.com/llms.txt · [A5] https://docs.amcharts.com/v5/concepts/accessibility/ · [A6] https://www.npmjs.com/package/@amcharts/amcharts5-mcp
- [G1] https://www.ag-grid.com/charts/license-pricing · [G2] https://www.ag-grid.com/blog/whats-new-in-ag-charts-14-1/ · [G3] https://www.ag-grid.com/charts/javascript/accessibility/ · [G4] https://blog.ag-grid.com/optimizing-large-data-set-visualisations-with-the-m4-algorithm/ · [G7] https://www.ag-grid.com/blog/whats-new-in-ag-charts-13-2 · [G8] https://www.ag-grid.com/charts/llms.txt
- [S1] https://www.scichart.com/shop/ · [S2] https://www.scichart.com/blog/scichart-js-v6-in-alpha-webgpu-incredible-performance-gains-and-more/ · [S3] https://www.scichart.com/changelog/scichart-gpt/ · [S5] https://www.scichart.com/llms.txt
- [L1] https://lightningchart.com/news/lightningchart-js-v9-0-0/ · [L2a] https://www.lightningchart.com/community-license/ · [L4] https://www.npmjs.com/package/@lightningchart/mcp-server
- [E1] https://echarts.apache.org/handbook/en/how-to/cross-platform/server/ · [E2] https://echarts.apache.org/handbook/en/best-practices/aria/ · [E3] https://github.com/apache/echarts-mcp
- [CJ1] https://www.chartjs.org/docs/latest/general/accessibility.html · [CJ2] https://github.com/chartjs/Chart.js/releases
- [R1] https://github.com/recharts/recharts/releases/tag/v3.0.0 · [N1] https://github.com/plouc/nivo · [N2] https://github.com/plouc/nivo/releases
- [P3] https://plotly.com/llms.txt · [U1] https://github.com/leeoniya/uPlot · [U2] https://github.com/leeoniya/uPlot/releases
- [V1] https://github.com/vega/vl-convert · [O1] https://github.com/observablehq/plot/blob/main/docs/features/plots.md
- [T1] https://vercel.com/blog/vercel-acquires-tremor · [C1] https://ui.shadcn.com/docs/components/chart · [C2] https://ui.shadcn.com/llms.txt
- Full-entry sizes: https://bundlephobia.com/api/size?package=<name>, queried 2026-11-16.
- llms.txt returned 404 on 2026-11-16 for highcharts.com, lightningchart.com, echarts.apache.org, chartjs.org, recharts.org, nivo.rocks, vega.github.io and tremor.so.

---

## 6. Open decisions for the owner

Each decision has a recommended default. A "yes" adopts it.

**D1. WebGL stance.**
Recommend: **keep "not planned", and say so on the homepage as a choice.** Above roughly 1M raw points, link to SciChart, LightningChart or uPlot. GPU rendering conflicts with SSR, zero dependencies and SVG accessibility, which are the things ChartKit is selling. Revisit only if dashboard users regularly hit the sampled ceiling.

**D2. The legacy React prop components** (`LineChart`, `KpiCard` and the other 14).
Recommend: **freeze them, move them to `@chartkitdev/react/legacy`, and remove them from the README and the first docs screen.** Two APIs in one package contradict "one spec". The migration page (`catalog/migrate.md`) already exists. Remove them in v2 unless download data says otherwise.

**D3. Which adapters rank first.**
Recommend: **React, then vanilla/Node (`renderToString`), then Vue, then Svelte.** Astro, Solid, Qwik, Angular and `<chart-kit>` go behind a "more frameworks" fold. React is where the users are. Node/vanilla is the SSR and agent story. Vue and Svelte are the stacks that Recharts, Tremor and shadcn leave unserved. Keep all nine; ranking them is about the docs.

**D4. Accept Vega-Lite-shaped input.**
In the Sonnet 4.5 no-docs run, 41 of 42 failures were Vega-Lite-shaped specs (`BENCHMARKS.md`, "Supplementary runs"). Models already guess that shape.
Recommend: **have `repair()` translate the common Vega-Lite shapes** (`data.values`, a string `mark`, `encoding.x.field`), and score the no-docs eval after repair. This narrows the API (the spec stays the same) while forgiving the most common agent mistake. It is cheaper than teaching every model a new grammar. The agent-cold-start workstream may already cover this; check its result first.

**D5. Accessibility defaults.**
Recommend: **turn keyboard navigation and the hidden data table on by default for interactive (client) renders.** Recharts 3 did the same. It costs bytes only in `core/interact`, not in SSR output. It is the cheapest way to make "accessible" claimable.

**D6. A commercial or cloud tier (`apps/cloud`).**
`apps/cloud` already renders SVG and PNG from a spec, with a watermark removed by an API key. It is not deployed; `cloud.chartkit.dev` is commented out in `wrangler.toml`.
Recommend: **yes, but as the hosted twin of the open library, not a gated feature.**
- Hosted `render` (SVG and PNG) plus `validate`/`repair` as a remote MCP endpoint, for agents that cannot run Node: chat clients, Slack bots, email and PDF reports.
- That is exactly the niche Highcharts' Render and Dev Assist MCPs fill. ChartKit's version would be on an MIT core, with metered pricing and a free tier.
- Keep everything in the npm packages MIT. A paid tier that withholds library features would undercut "honest".
- Launch it after v1 is on npm, not before.

**D7. What "#1" means.**
Recommend: **define it as "most-used chart library in agent-generated and server-rendered output"**, measured by MCP installs, cloud render volume and npm downloads of core plus the adapters. "#1 overall" against Chart.js (7M per week) and Recharts (34M per week) is not a 2027 goal. "Better than the paid alternatives" holds for agent and SSR workflows only, and the copy should say so.

---

## 7. What Wave 2 should do with this

1. Rewrite the README's first screen to the draft in section 2. Move the benchmark tables into `BENCHMARKS.md`.
2. Rewrite the homepage hero to the one-line position. Make the three proof-point sections SSR, agents and every stack. Paint speed is demoted.
3. Remove or reword every row in section 4.
4. Act on D1–D7 once the owner has answered.
5. Out of scope for this memo, but blocking: npm publish, committed token-matrix raw results, and corrected `framework.mcp` and `validate.agentdocs` cells in `features.json`.
