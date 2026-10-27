# ChartKit Cloud

Free SVG and PNG renders of a ChartKit spec. An API key removes the small `chartkit.dev` mark. There is no live checkout in this package.

SVG is ChartKit SSR. PNG is `@resvg/resvg-wasm` in the same process. Cloudflare Browser Rendering is not used.

## Node server

```bash
npm run dev:node --workspace=@chartkitdev/cloud
```

Listens on `http://127.0.0.1:8787` (`PORT` overrides it). `npm run start` is the same process. Vitest uses this handler directly and does not need Cloudflare.

## Workers

The worker name is `chartkit-cloud`. A workers.dev deploy looks like:

```text
https://chartkit-cloud.<account-subdomain>.workers.dev
```

Wrangler prints the exact URL. The account subdomain is not in the repo. `cloud.chartkit.dev` stays commented in `wrangler.toml` until that zone is on the account.

`nodejs_compat` is on so `node:crypto` and `Buffer` match the Node handler. The bundle is ChartKit source plus the resvg wasm and the Inter and Roboto files in `fonts/`. A local bundle of the script plus wasm is about 1.2 MB gzipped, inside the Workers script limit.

### Deploy

Deploy from a machine that has the Cloudflare API token. This repo does not deploy itself.

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
cd apps/cloud
npm run deploy
```

From the repo root:

```bash
npm run deploy --workspace=@chartkitdev/cloud
```

`npm run deploy` runs `node scripts/bundle.mjs` and then `wrangler deploy`.

Interactive login, when you are not using an API token:

```bash
cd apps/cloud
npx wrangler login
npm run deploy
```

`wrangler login` stores an OAuth session. An API token does not need that login. Do not commit the token, and do not put it in `wrangler.toml`.

### Local worker

```bash
cd apps/cloud
npm run dev
```

That bundles, then runs `wrangler dev --local`. It does not deploy and it does not need the API token. `npx wrangler dev --remote` is the optional edge preview, and that one does need the token.

### Environment

Required to deploy:

| Variable | Role |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Deploy auth. Not a runtime secret. |
| `CLOUDFLARE_ACCOUNT_ID` | Account that owns the worker. |

Not required for a first workers.dev test. Keys, charts, and the 120/minute limiter stay in memory inside the isolate.

| Variable | Role |
| --- | --- |
| `KV_REST_API_URL` | Vercel KV or Upstash REST, shared with the Node service. |
| `KV_REST_API_TOKEN` | Bearer token for that REST API. |
| `CHARTKIT_DEV_KEYS` | Comma-separated keys that remove the mark. A test seed, not a billing system. |
| `STRIPE_SECRET_KEY` | Leave unset. Checkout returns 503 until a price exists. |
| `STRIPE_PRICE_ID` | Leave unset. |
| `STRIPE_WEBHOOK_SECRET` | Leave unset. |

Set runtime secrets with `npx wrangler secret put KV_REST_API_URL` from `apps/cloud`. Native KV and R2 bindings in `wrangler.toml` are comments. The worker does not read those bindings yet.

### Cache

A render is hashed from the spec, the frame, and whether a key was valid. The response sends `ETag` and `Cache-Control: public, max-age=31536000, immutable`. The isolate also keeps a small map of those hashes. GET renders are written to the Workers Cache API. That cache still bills the request. A browser or CDN that honors `Cache-Control` does not ask again for a year. R2 is the later place for the hashed bytes.

The rate limit is 120 a minute per IP. On Cloudflare the IP is `cf-connecting-ip`. The counter is per isolate, not global.

### Routes

- `GET /health`
- `GET /render` and `POST /render`
- `POST /validate`
- `POST /charts` and `GET /c/<id>.svg` or `.png`
- `POST /mcp` — stateless [Streamable HTTP](https://modelcontextprotocol.io). One tool, `render_chart`, which calls the same render path. Omit `format`, or pass `svg`. Pass `png` only when the host cannot display SVG (email, a GitHub README image, some Slack clients), and then set `scale` to 2 or higher. `GET /mcp` is 405. This is not `@chartkitdev/mcp` on stdio.

Cloud SVGs add an outer margin so a chat attachment is not flush with the image edge: 24px on top, 16px on each side, and 12px under the 16px watermark band. The library drawing is unchanged. A keyed render gets the same margin without the mark. `/cloud` marketing previews are local SVGs and do not use this margin.

### Point the Astro site at a deploy

`apps/web` bakes example URLs from `PUBLIC_CHARTKIT_CLOUD_URL`. `NEXT_PUBLIC_CHARTKIT_CLOUD_URL` still works. Unset, the examples stay on `https://cloud.chartkit.dev` and the site build still succeeds.

```bash
PUBLIC_CHARTKIT_CLOUD_URL=https://chartkit-cloud.<account-subdomain>.workers.dev npm run build:web
```

Use the host wrangler printed. Docs snippets are painted during that build, so the variable has to be set for `npm run build:web`, not only for the browser.

### Still needs Todd

- Run the deploy with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- Copy the workers.dev URL from that command
- DNS for `cloud.chartkit.dev`, then uncomment the route in `wrangler.toml`
- KV if keys and stored charts should outlive an isolate
- R2 if the hashed images should live outside the Workers cache
- Stripe, later, for selling the watermark key
