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

The site is the static files in `apps/web/dist`. Upload that directory to the chartkit.dev host, or serve it from there.

`npm run build` builds the libraries and then this app. `npm run start` serves the built `dist` with `astro preview` (build first). [`nixpacks.toml`](../../nixpacks.toml) uses Node 22, `npm run build`, and `npm run start` when a host builds the repo that way.

Preview the production build locally:

```bash
npm run preview --workspace=chartkit-web
```

## Routes

Header: Cloud, Dashboards, Agents, Gallery, Examples, Docs. Pricing is on `/cloud#pricing`. Footer columns are Product, Docs, Agents, and Compare.

Docs links are extensionless. The left rail is Start, Concepts, Charts (Core, Statistical, Planning, Maps), and Lookup. One upgrade link: [Upgrading from v0](/docs/migrate). Chart.js, Recharts, and ECharts stay as pages linked from that note, not as extra nav items.

`/llms.txt`, `/llms-full.txt`, `/llms.json`, `/features.json`, `/benchmarks.json`, `/recipes.json`, `/showcase.json`, and `/schema/v1.json` are served from this app.

Old v0 URLs redirect: `/getting-started`, `/components` and the named chart paths, `/hooks`, `/utilities` (including legend, annotations, and responsive-chart), `/themes`, `/about`, and `/.well-known/llms.txt`. `/play` and `/playground` go to `/examples`. `/demo` goes to `/dashboards`, `/showcase` to `/gallery`, `/maps` to `/gallery#maps`, `/dashboard` to `/dashboards`, and `/pricing` to `/cloud#pricing`. Unknown `/_next` assets, `/blog`, and `/api` 404. The render API is `cloud.chartkit.dev`, not this host.
