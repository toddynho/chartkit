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
| Content | Stub routes, tokens, try-it layout | Full docs, demos, benchmarks, llms.txt |
| Hosting | Not wired | Existing production app |

Chart-type paths match the current docs (`/docs/charts/line` and the rest) so a later move can keep URLs. `llms.txt`, the schema, and the measured pages stay on the Next.js app until cutover.

Do not delete `docs/` to “finish” the migration. Point chartkit.dev at `apps/web` only after each public URL either exists here or redirects, and serve `llms.txt` from the same host.

## Routes

- `/` — product hero (chart carousel, chart/JSON hover, Free watermark preview), why switch, Cloud API, pricing (numbers TBD), gallery placeholders
- `/cloud` — Cloud API stub and the same pricing block
- `/docs` — docs shell
- `/docs/install`
- `/docs/concepts`, `/docs/concepts/spec`, `/docs/concepts/adapters`, `/docs/concepts/themes`
- `/docs/charts` and `/docs/charts/<type>`
- `/docs/reference`, `/docs/reference/try`, `/docs/reference/validate`
- `/docs/agents`, `/docs/agents/mcp`, `/docs/agents/llms`

The left nav groups are Start, Concepts, Chart types, Reference, and Agents. Chart types in the nav are All types, Line, Bar, and Donut. The index lists every type.

## Try it

`/docs/reference/try` is the pattern for later docs pages: an editable spec, chips (Line, Bar, Donut, Watermark), and a response rail. Watermark is a Cloud request flag, not a spec field. The rail echoes JSON. It does not call Cloud or `@chartkitdev/core`.

## Tokens

Global CSS is `src/styles/global.css`. Inter at a 15px body. Page `#f5f5f7`, ink `#1d1d1f`, accent `#0071e3`. Text links use `#006ae2` so they clear 4.5:1 on the gray page. Dark scheme follows `prefers-color-scheme`.

## Next migration steps

1. Move one Next.js docs route at a time into this app, starting with getting started and the chart types. Keep the Next.js app running until the URL exists here.
2. Replace the try-it response with `validate` / `render` from core, or with Cloud. Keep the spec, chips, and response rail.
3. Fill pricing only when the amounts are real. The live Cloud offer (a key removes the mark, and 120/minute is not a paid quota) is not this mock.
4. Serve `llms.txt`, `llms-full.txt`, and `schema/v1.json` from this app at the same paths.
5. Switch the host, then remove `docs/` if nothing else imports it.
