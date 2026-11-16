# ChartKit Cloud

Free SVG and PNG renders of a ChartKit spec. An API key removes the small `chartkit.dev` mark. Checkout is off at launch. Keys are issued by hand (see [Issue a key by hand](#issue-a-key-by-hand)).

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

Bindings in `wrangler.toml`:

| Binding | Role |
| --- | --- |
| `CHARTKIT_KV` | Workers KV namespace for API keys and stored charts (`/c/<id>`). Commented until the namespace exists. |
| `CHARTKIT_RATE_LIMIT` | Workers rate-limiting binding, 120 requests per 60 seconds per client IP. On by default. Nothing to create first. |

Runtime secrets, set with `npx wrangler secret put <NAME>` from `apps/cloud`:

| Variable | Role |
| --- | --- |
| `KV_REST_API_URL` | Vercel KV or Upstash REST. Used when `CHARTKIT_KV` is not bound. The Node service uses it too. |
| `KV_REST_API_TOKEN` | Bearer token for that REST API. |
| `CHARTKIT_DEV_KEYS` | Comma-separated keys that remove the mark. Checked before the store, so it works with KV as well. |
| `CHARTKIT_ALLOW_MEMORY` | `1` lets `/health` pass with no durable store. Only for a throwaway workers.dev smoke test. |
| `STRIPE_SECRET_KEY` | Leave unset at launch. Checkout returns 503 until this and `STRIPE_PRICE_ID` exist. |
| `STRIPE_PRICE_ID` | Leave unset. |
| `STRIPE_WEBHOOK_SECRET` | Leave unset. Without it every webhook is rejected with 400, so no key is issued from Stripe. |

### Storage

Keys and stored charts use the first store that is configured: the `CHARTKIT_KV` binding, then `KV_REST_API_URL` plus `KV_REST_API_TOKEN`, then memory. Memory is lost whenever an isolate ends, which would break keys and `/c/<id>` links. So on Workers, with no durable store, `/health` answers 503 and the first request logs an error. Set `CHARTKIT_ALLOW_MEMORY=1` only to smoke-test a deploy before KV exists.

`GET /health` reports what is active:

```json
{ "ok": true, "service": "chartkit-cloud", "storage": "kv-binding", "rateLimit": "binding", "checkout": "off" }
```

`storage` is `kv-binding`, `kv-rest`, or `memory`. `rateLimit` is `binding` or `memory`.

Workers KV is eventually consistent. A chart written in one Cloudflare location can take up to about a minute to be readable in another, and a lookup that missed is cached for about as long. So a `/c/<id>` URL fetched at once from a far location (an image proxy, say) can 404 for that minute and then work. A key written with `wrangler kv key put` has the same delay. Each new stored chart is one KV write, so watch the plan's daily write quota. A failed write fails that `POST /render` or `POST /charts`.

Both durable stores use the same layout: `ck:key:<key>` = `1`, `ck:session:<stripe session>` = `<key>`, `ck:chart:<id>` = the stored spec. Moving from REST to the binding means copying those keys. Nothing else changes.

### Issue a key by hand

Checkout stays off at launch. To give someone a key that removes the mark, pick either way.

Workers KV (no redeploy, takes effect within about a minute as KV propagates):

```bash
cd apps/cloud
KEY="ck_live_$(openssl rand -hex 16)"
npx wrangler kv key put --binding=CHARTKIT_KV --remote "ck:key:$KEY" 1
echo "$KEY"
```

Revoke it with `npx wrangler kv key delete --binding=CHARTKIT_KV --remote "ck:key:$KEY"`.

`CHARTKIT_DEV_KEYS` (fine for a handful of keys; each change rewrites the secret):

```bash
cd apps/cloud
npx wrangler secret put CHARTKIT_DEV_KEYS   # paste key1,key2,...
```

Keep a private record of who has which key. The service does not store names or emails.

### Cache

A render is hashed from the spec, the frame, and whether a key was valid. The response sends `ETag` and `Cache-Control: public, max-age=31536000, immutable`. The isolate also keeps a small map of those hashes. GET renders are written to the Workers Cache API. That cache still bills the request. A browser or CDN that honors `Cache-Control` does not ask again for a year. R2 is the later place for the hashed bytes.

The rate limit is 120 a minute per IP, with or without a key. On Cloudflare the IP is `cf-connecting-ip`. With the `CHARTKIT_RATE_LIMIT` binding, the counter is shared by every isolate in a Cloudflare location. It is not exact across locations, and Cloudflare documents it as approximate. A blocked request gets 429 with `Retry-After: 60`, because the binding only answers yes or no. Without the binding (Node, or a worker without it), the counter is per isolate or per process. `/health` and the checkout routes are not limited.

### Routes

- `GET /health`
- `GET /render` and `POST /render`
- `POST /validate`
- `POST /charts` and `GET /c/<id>.svg` or `.png`
- `POST /mcp` — stateless [Streamable HTTP](https://modelcontextprotocol.io). `GET /mcp` is 405. This is not `@chartkitdev/mcp` on stdio. Three tools:
  - `render_chart` calls the same render path as `POST /render`. Omit `format`, or pass `svg`. Pass `png` only when the host cannot display SVG (email, a GitHub README image, some Slack clients), and then set `scale` to 2 or higher.
  - `validate_chart` runs `@chartkitdev/core/validate` and returns `ok`, `errors`, and `warnings` with CK codes, paths, hints, and fix patches. It does not change the spec. Pass `data` to check other rows.
  - `repair_chart` applies the safe fix patches and returns the repaired `spec`, the `applied` patches, and what is left. It takes `w`, `h`, and `theme` the way `render_chart` does. It is what `POST /validate` returns over HTTP.

Cloud SVGs add an outer margin so a chat attachment is not flush with the image edge: 24px on top, 16px on each side, and 12px under the 16px watermark band. The library drawing is unchanged. A keyed render gets the same margin without the mark. `/cloud` marketing previews are local SVGs and do not use this margin.

Soft's plot is transparent so a web page shows through. Cloud paints `#ffffff` when that preset (or Refined or Editorial) would otherwise be clear, so dark labels stay readable on a black lightbox. Pass `background` (`#112233`, `rgb()`, `hsl()`, `oklch()`, or `transparent`) on the query string or JSON body to override. `background` wins over `theme.tokens.background`. `theme=midnight` keeps its dark plate. PNG uses the same color.

### Point the Astro site at a deploy

`apps/web` bakes example URLs from `PUBLIC_CHARTKIT_CLOUD_URL`. `NEXT_PUBLIC_CHARTKIT_CLOUD_URL` still works. Unset, the examples stay on `https://cloud.chartkit.dev` and the site build still succeeds.

```bash
PUBLIC_CHARTKIT_CLOUD_URL=https://chartkit-cloud.<account-subdomain>.workers.dev npm run build:web
```

Use the host wrangler printed. Docs snippets are painted during that build, so the variable has to be set for `npm run build:web`, not only for the browser.

## Launch

Cloud launches with the v1 npm publish. Do these in order from `apps/cloud`, on a machine with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set (or after `npx wrangler login`). Nothing in this repo runs them.

1. **Create the KV namespace.**

   ```bash
   npx wrangler kv namespace create CHARTKIT_KV
   ```

   Paste the printed `id` into the `[[kv_namespaces]]` block in `wrangler.toml` and uncomment that block.

2. **Check the rate-limit binding.** `[[ratelimits]]` with `name = "CHARTKIT_RATE_LIMIT"` is already on in `wrangler.toml`. If `namespace_id = "1201"` is taken by another Worker on the account, pick any other unused positive integer. Nothing else is created.

3. **Set secrets.** Optional at launch, all of them:

   ```bash
   npx wrangler secret put CHARTKIT_DEV_KEYS
   ```

   Do not set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, or `STRIPE_WEBHOOK_SECRET`. Checkout stays off (503) without them. Until KV is bound, `/health` answers 503. That is intended. Do not set `CHARTKIT_ALLOW_MEMORY`. Skip `KV_REST_API_URL`/`KV_REST_API_TOKEN` when `CHARTKIT_KV` is bound.

4. **Put the chartkit.dev zone on the account.** Add `chartkit.dev` in the Cloudflare dashboard on the same account as the worker, and point the registrar's nameservers at Cloudflare. Wait until the zone is Active.

5. **Uncomment the route** in `wrangler.toml`:

   ```toml
   [[routes]]
   pattern = "cloud.chartkit.dev"
   custom_domain = true
   ```

   Wrangler creates the DNS record and certificate for a custom domain. Deploy fails if the zone is not on the account.

6. **Deploy.**

   ```bash
   npm run deploy
   ```

7. **Issue a first key** for the checks below, the way [Issue a key by hand](#issue-a-key-by-hand) shows, and keep it in `KEY`.

8. **Check it.** Set `HOST=https://cloud.chartkit.dev` (or the workers.dev URL wrangler printed).

   ```bash
   HOST=https://cloud.chartkit.dev
   SPEC='{"version":"1","type":"bar","data":[{"lane":"A","stops":12},{"lane":"C","stops":15}],"encoding":{"x":"lane","y":"stops"},"a11y":{"alt":"Lane C has more."}}'

   # 200 with "storage":"kv-binding","rateLimit":"binding","checkout":"off". A 503 means no durable store.
   curl -s "$HOST/health"

   # 200 image/svg+xml, X-ChartKit-Ok: 1, X-ChartKit-Watermark: 1
   curl -sG -D - -o /dev/null "$HOST/render" --data-urlencode "spec=$SPEC"

   # PNG
   curl -sG -o chart.png -w '%{http_code} %{content_type}\n' "$HOST/render" --data-urlencode "spec=$SPEC" --data-urlencode format=png

   # MCP: lists render_chart, validate_chart, repair_chart
   curl -s "$HOST/mcp" -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

   # MCP: validate_chart on the spec above
   curl -s "$HOST/mcp" -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
     -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"validate_chart\",\"arguments\":{\"spec\":$SPEC}}}"

   # Stored chart: POST /charts returns an id, then /c/<id>.svg serves it
   ID=$(curl -s "$HOST/charts" -H 'content-type: application/json' -d "{\"spec\":$SPEC}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
   curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$HOST/c/$ID.svg"

   # Key: with a key issued by hand, the mark is gone
   curl -s "$HOST/render" -H "authorization: Bearer $KEY" -H 'content-type: application/json' \
     -d "{\"spec\":$SPEC}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).watermark'   # false
   ```

   A repeat GET of `/c/<id>` can be answered by the Workers cache, so it does not prove the chart is in KV. Read KV directly:

   ```bash
   npx wrangler kv key list --binding=CHARTKIT_KV --remote --prefix=ck:chart:   # includes "ck:chart:<ID>"
   npx wrangler kv key list --binding=CHARTKIT_KV --remote --prefix=ck:key:     # includes the key from step 7
   ```

9. **Point the site at it.** Build `apps/web` with `PUBLIC_CHARTKIT_CLOUD_URL=https://cloud.chartkit.dev` (the default when unset).

Later, not at launch: R2 for hashed image bytes, and Stripe once a price exists.
