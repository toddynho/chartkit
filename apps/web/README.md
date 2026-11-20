# ChartKit web

The public site for chartkit.dev. Astro, static output in `dist/`. There is no second docs app.

Shared files (`llms.txt`, the feature matrix, benchmarks, recipes) live in [`catalog/`](../../catalog). The v1 schema is `packages/core/schema/chartkit.schema.json`, served at `/schema/v1.json`.

## Run locally

Node **22.23.4** or newer. From the repo root:

```bash
npm ci
npm run dev
```

`npm run dev` and `npm run dev:web` are the same command. The server is http://localhost:4321.

```bash
npm run build:web
npm run preview --workspace=chartkit-web
npm run check --workspace=chartkit-web
```

Library packages still allow Node 20. The site does not.

## Deploy by hand

Merging does not publish chartkit.dev. From a checkout of the commit you want live, on Node 22.23.4 or newer:

```bash
npm ci
npm run build:web
```

The site is the static files in `apps/web/dist`. chartkit.dev serves them from Cloudflare Workers static assets:

```bash
npm run deploy:check --workspace=chartkit-web
npm run deploy --workspace=chartkit-web
```

`deploy:check` is a local dry run. `deploy` uploads `dist` as the Worker `chartkit-web` (see [`wrangler.jsonc`](wrangler.jsonc)) and needs `wrangler login` or `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Response headers for the agent files are in [`public/_headers`](public/_headers). The 301s for the old v0 URLs are in [`public/_redirects`](public/_redirects); keep their destinations the same as the `redirects` map in `astro.config.mjs`. The config has no route, so a deploy updates the `workers.dev` URL; the `chartkit.dev/*` route is attached in the Cloudflare dashboard. The launch-day order and checks are in [the launch checklist](../../docs/internal/LAUNCH_CHECKLIST.md), step 7. `wrangler` comes from the `apps/cloud` workspace's dev dependencies.

## Cloud render URL

Curl samples, the Cloud page, and the docs snippets use `https://cloud.chartkit.dev` unless the build has `PUBLIC_CHARTKIT_CLOUD_URL`. `NEXT_PUBLIC_CHARTKIT_CLOUD_URL` still works. An unset variable does not fail the build. Set it to the workers.dev host from `wrangler deploy` when the marketing site should call that worker. The paint step that writes the docs snippets sees the variable too, so set it for `npm run build:web`. See [apps/cloud/README.md](../cloud/README.md).

`npm run build` builds the libraries and then this app. `npm run start` serves the built `dist` with `astro preview` (build first). [`nixpacks.toml`](../../nixpacks.toml) uses Node 22, `npm run build`, and `npm run start` when a host builds the repo that way.

Preview the production build locally:

```bash
npm run preview --workspace=chartkit-web
```

## Routes

Header (`primaryNav` in `src/data/nav.ts`): Cloud, Dashboards, Agents, Gallery, Playground, Docs. The docs header drops Dashboards. Pricing is on `/cloud#pricing`. Footer columns are Product, Docs, and Agents. Compare is a Product link and the bar under the columns, not its own column.

Docs links are extensionless. The left rail groups are Start, Concepts, and Lookup (`docsNav` in `src/data/docs-catalog.ts`). Chart types sit under Start, grouped Core, Statistical, Planning, Library, and Geo. One upgrade link: [Upgrading from v0](/docs/migrate). Chart.js, Recharts, and ECharts stay as pages linked from that note, not as extra nav items.

`/llms.txt`, `/llms-full.txt`, `/llms.json`, `/features.json`, `/benchmarks.json`, `/recipes.json`, `/showcase.json`, and `/schema/v1.json` are served from this app.

Old v0 URLs redirect: `/getting-started`, `/components` and the named chart paths, `/hooks`, `/utilities` (including legend, annotations, and responsive-chart), `/themes`, and `/about`. `/.well-known/llms.txt` is a byte copy of `/llms.txt`, not a redirect, so agents get text. `/play` and `/demo` go to `/playground`. `/playground` is a page. `/showcase` goes to `/gallery`, `/maps` to `/gallery#maps`, `/dashboard` to `/dashboards`, and `/pricing` to `/cloud#pricing`. `/when-to-use` goes to `/compare#when-to-use`; the compare page has no element with that id, so the fragment does not scroll. Unknown `/_next` assets, `/blog`, and `/api` have no routes, so they 404. The render API is `cloud.chartkit.dev`, not this host.
