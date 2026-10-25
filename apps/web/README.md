# ChartKit web

Astro app for the public site at chartkit.dev: marketing pages and the docs shell. It is a scaffold. The live site is still the Next.js app in [`docs/`](../../docs).

`apps/*` is already an npm workspace, and [`apps/cloud`](../cloud) is the render API, so this app lives at `apps/web` (`chartkit-web`). Nothing here is deployed. The package is private, and the publish workflow does not list it.

## Run locally

From the repo root, on Node 22.23.4 or newer (the Astro 7 engine):

```bash
npm run dev:web
```

The dev server is http://localhost:4321.

```bash
npm run build:web
npm run preview --workspace=chartkit-web
npm run check --workspace=chartkit-web
```

`npm run dev` and `npm run build:docs` are unchanged. They run `chartkit-docs`. `npm run build` builds the libraries and the Next.js docs, not this app. CI builds this app in a separate job (`npm run build:web`).

## How this sits next to the Next.js docs

| | Astro (`apps/web`) | Next.js (`docs/`) |
| --- | --- | --- |
| Role | Next public site. Marketing and docs shell. | What chartkit.dev serves today. |
| Dev | `npm run dev:web` | `npm run dev` |
| Content | Marketing and docs. Hero, gallery, and the response rail render with `@chartkitdev/core`. | Full docs, demos, benchmarks, llms.txt |
| Hosting | Not wired | Existing production app |

Chart-type paths match the current docs (`/docs/charts/line` and the rest) so a later move can keep URLs. `llms.txt`, the schema, and the measured pages stay on the Next.js app until cutover.

Do not delete `docs/` to “finish” the migration. Point chartkit.dev at `apps/web` only after each public URL either exists here or redirects, and serve `llms.txt` from the same host.

## Routes

- `/` — product hero (core-rendered carousel, chart/JSON hover, Free watermark preview), why switch, agents, Cloud API with a live spec, draft pricing, gallery
- `/cloud` — Cloud API, the same live spec, and draft pricing
- `/agents` — agent loop. Nav Agents points here. `llms.txt` stays on the Next.js app
- `/docs` — Overview
- Start: `/docs/react`, `/docs/vue`, `/docs/svelte`, `/docs/vanilla`, `/docs/markdown`
- Concepts: `/docs/spec-anatomy`, `/docs/data`, `/docs/encoding`, `/docs/scales`, `/docs/axes`, `/docs/themes-tokens`, `/docs/bundles`
- Chart types in the left nav, grouped Core, Statistical, and Planning: `/docs/charts/<type>` (`area`, `line`, `bar`, `donut`, `combo`, `gauge`, `heatmap`, `candlestick`, `scatter`, `kpi`, `sparkline`, `mini-area`, `progress-ring`, `spike`, `histogram`, `boxplot`, `radar`, `funnel`, `treemap`, `sankey`, `bullet`, `waterfall`, `gantt`, `timeline`, `quadrant`, `venn`, `journey`)
- `/docs/charts` — every type, including library URLs that are not in the left nav (`pie`, `stacked-area`, `area-range`, `bar-range`, `errorbar`, `radial-bar`, `rose`)
- Reference: `/docs/options`, `/docs/errors`, `/docs/themes`
- Agents: `/docs/validate`, `/docs/repair`, `/docs/render`, `/docs/llms-txt`, `/docs/mcp`
- `/docs/reference/try` — playground (sidebar footer)
- Extra pages kept for older links: `/docs/install`, `/docs/concepts/adapters`
- Aliases of the pages above: `/docs/concepts/spec`, `/docs/concepts/themes`, `/docs/reference`, `/docs/reference/validate`, `/docs/agents`, `/docs/agents/llms`, `/docs/agents/mcp`

The left nav is Start, Concepts, Chart types (Core, Statistical, Planning), Reference, and Agents. Links are extensionless.

## Try it

Chart-type pages follow the Line template: facts, an editable spec, chips beside the JSON, anatomy, an options table, and a response rail. The rail runs `validate()` and `render()` from `@chartkitdev/core` in the page (core charts from `/all`, the rest from `/extra`, planning charts through `validatePhase4`). It does not call Cloud. An invalid spec shows the CK codes and does not draw a chart. `npm run dev:web` builds core first.

## Tokens

Global CSS is `src/styles/global.css`. Inter at a 15px body. Page `#f5f5f7`, ink `#1d1d1f`, accent `#0071e3`. Text links use `#006ae2` so they clear 4.5:1 on the gray page. Dark scheme follows `prefers-color-scheme`.

## Next migration steps

1. Move one Next.js docs route at a time into this app, starting with getting started and the chart types. Keep the Next.js app running until the URL exists here.
2. The homepage stage, gallery, and docs response rail already run `validate()` and `render()` from `@chartkitdev/core`. Pro pricing on the page is the draft set ($29/mo, 10,000 renders, $0.002).
3. Fill pricing only when the amounts are real. The live Cloud offer (a key removes the mark, and 120/minute is not a paid quota) is not this mock.
4. Serve `llms.txt`, `llms-full.txt`, and `schema/v1.json` from this app at the same paths.
5. Switch the host, then remove `docs/` if nothing else imports it.
