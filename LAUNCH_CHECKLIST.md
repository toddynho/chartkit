# Launch checklist

The commands Todd runs to publish ChartKit to npm and put the v1 site on chartkit.dev, in order. Each step has a check. Do not go to the next step until the check passes.

Version: every public package is `0.5.0` on `latest` (see [RELEASING.md](./RELEASING.md#version-and-dist-tag-recommendation)). Background, the token policy, and steady-state releases are in RELEASING.md. This file is only the launch-day run.

State before launch (checked 2026-11-16):

- `@chartkitdev/*` returns 404 on npm. `@derpdaderp/chartkit` is at `0.4.1` (`latest`).
- chartkit.dev still serves the v0 Next.js site through Cloudflare (`x-powered-by: Next.js`). `/llms.txt` is the v0 file (`@derpdaderp/chartkit v0.4.1`) with `cache-control: public, max-age=86400`. `/docs`, `/benchmarks`, `/when-to-use` and `/schema/v1.json` all 404.

Order: deploy the Cloud worker, publish packages, then deploy the site, then deprecate v0. Publishing first is invisible, because nothing links to `@chartkitdev/*` yet. Once the site is deployed, every install line on it resolves.

## 0. Merge to main

Merge the launch PRs into `main`. The Publish workflow only runs from `main`.

```bash
git checkout main && git pull
```

Check: `git log -1` is the commit you want released and live.

## 1. Local pre-flight (Node 22.23.4 or newer)

```bash
npm ci
```

`npm test` also runs the rival-library checks in `bench/`, which need their own install and a Playwright browser, as in CI:

```bash
(cd bench && npm ci && npx playwright install chromium)
```

```bash
npm test
```

```bash
npm run size
```

```bash
npm run release:check
```

```bash
npm run build:web
```

Check: each command exits 0, and `release:check` ends with `release:check ok` (publint "All good!", attw "No problems found" for all 14 packages). Then confirm the built site has the v1 agent files:

```bash
cmp catalog/public/llms.txt apps/web/dist/llms.txt && cmp catalog/public/llms.txt apps/web/dist/.well-known/llms.txt && ls apps/web/dist/schema/v1.json apps/web/dist/docs/index.html apps/web/dist/docs/migrate/index.html apps/web/dist/benchmarks/index.html apps/web/dist/when-to-use/index.html
```

## 2. One-time account setup (skip what is already done)

RELEASING.md, "One-time setup": npm 2FA with a security key, the npm org `chartkitdev`, the GitHub environment `npm` (Todd as required reviewer, `main` only), and branch protection on `main`.

Check:

```bash
npm whoami
```

```bash
npm org ls chartkitdev
```

The first prints your npm user. The second lists you as `owner`.

## 3. Bootstrap token

Create the 1-day granular token (read and write, limited to `@chartkitdev/*` and `@derpdaderp/chartkit`, bypass 2FA for automation). Save it as the secret `NPM_TOKEN` on the GitHub environment `npm`, not as a repository secret.

Check: GitHub, Settings, Environments, `npm` lists `NPM_TOKEN`.

## 4. Dry-run the publish in CI

GitHub, Actions, **Publish**, Run workflow on `main`: package `all`, mode `dry-run`, bootstrap **true**. Or from a terminal:

```bash
gh workflow run publish.yml --ref main -f package=all -f mode=dry-run -f bootstrap=true
```

Approve the `npm` environment when asked.

Check: the run is green, and its summary says `dry-run 14 package(s)`.

## 4b. Deploy ChartKit Cloud

Do this before publishing. `@chartkitdev/mcp`'s `render_chart` tool calls `https://cloud.chartkit.dev` by default, and the README and site link to it, so the worker has to answer before either is public.

Follow [apps/cloud/README.md, "Launch"](apps/cloud/README.md#launch), steps 0 to 8: confirm Workers Paid, create the KV namespace and paste its id into `apps/cloud/wrangler.toml`, uncomment the `cloud.chartkit.dev` route, `npm run deploy` from `apps/cloud`, issue a key, and run the smoke checks. If `cloud.chartkit.dev` already has a DNS record, remove it first: a custom domain cannot be created over an existing CNAME.

Check:

```bash
curl -s https://cloud.chartkit.dev/health
```

Prints `"ok":true` with `"storage":"kv-binding"`. Then the smoke checks in the Cloud README all pass, including the oversized PNG returning `422 image/png`.

## 5. Publish (bootstrap)

```bash
gh workflow run publish.yml --ref main -f package=all -f mode=stage -f bootstrap=true
```

Approve the `npm` environment. With bootstrap on, this is `npm publish --provenance --access public` for each package, in `scripts/public-packages.txt` order, stopping at the first failure.

Check: the summary says `published 14 package(s)`. Then confirm every package is on npm with `latest = 0.5.0`:

```bash
for p in core geo react vue svelte vanilla astro solid qwik angular element markdown mcp; do echo "@chartkitdev/$p $(npm view @chartkitdev/$p dist-tags.latest)"; done; echo "@derpdaderp/chartkit $(npm view @derpdaderp/chartkit dist-tags.latest)"
```

Every line ends in `0.5.0`. If the run stopped partway, the packages before the failure are already published. Fix the failure and re-run with `package` set to each missing package. Do not re-run `all`, because republishing a version fails.

## 6. Smoke-test the published packages

In a scratch directory outside the repo:

```bash
mkdir -p /tmp/ck-smoke && cd /tmp/ck-smoke && npm init -y >/dev/null && npm install @chartkitdev/core @chartkitdev/react react react-dom @derpdaderp/chartkit
```

```bash
node --input-type=module -e 'import { render } from "@chartkitdev/core/all"; import { validate } from "@chartkitdev/core/validate"; const s={"version":"1","type":"line","data":[{"quarter":"Q1","units":40},{"quarter":"Q2","units":55}],"encoding":{"x":"quarter","y":"units"},"a11y":{"alt":"Units rose in Q2."}}; console.log(validate(s).ok, render(s).slice(0,4));'
```

```bash
npm audit signatures
```

Check: the `node` line prints `true <svg`. `npm audit signatures` reports verified registry signatures and verified attestations (provenance) for the `@chartkitdev` packages. The npm page for `@chartkitdev/core` shows the "Built and signed on GitHub Actions" provenance badge.

## 7. Deploy chartkit.dev (Cloudflare Workers static assets)

The site is static. `apps/web/wrangler.jsonc` uploads `apps/web/dist` as a Worker named `chartkit-web` with no script. `apps/web/public/_headers` carries the CORS and cache headers for the agent files. The config has no `chartkit.dev` route on purpose: deploying only updates the `workers.dev` URL, and the live domain moves in 7c.

### 7a. Deploy to workers.dev

Use the `dist` built in step 1 (or run `npm run build` again from the repo root; the libraries build first). Log in once with `npx wrangler login`, or export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

```bash
npm run deploy:check --workspace=chartkit-web
```

```bash
npm run deploy --workspace=chartkit-web
```

Check: the first reads the assets and exits with `--dry-run: exiting now.` The second prints the live URL, `https://chartkit-web.<account-subdomain>.workers.dev`.

### 7b. Check the workers.dev copy before moving the domain

Set the URL Wrangler printed, then run the checks:

```bash
export CK_PREVIEW=https://chartkit-web.<account-subdomain>.workers.dev
```

```bash
for u in / /docs /docs/migrate /benchmarks /when-to-use /schema/v1.json /llms-full.txt /llms.json /features.json /benchmarks.json /recipes.json /showcase.json /sitemap.xml; do echo "$(curl -s -o /dev/null -w '%{http_code}' $CK_PREVIEW$u) $u"; done
```

```bash
curl -s $CK_PREVIEW/llms.txt | cmp - catalog/public/llms.txt && curl -s $CK_PREVIEW/.well-known/llms.txt | cmp - catalog/public/llms.txt && echo llms ok
```

```bash
curl -sI $CK_PREVIEW/schema/v1.json | grep -i access-control-allow-origin
```

Check: every line of the first starts with `200`, the second prints `llms ok`, and the third prints `access-control-allow-origin: *`. Open the URL in a browser and click through the home page, `/docs` and `/playground`.

### 7c. Move chartkit.dev to the Worker

The zone already proxies `chartkit.dev` to the v0 origin. Add a **Route**, not a Custom Domain: a route runs the Worker in front of the existing DNS record, so the record stays and removing the route is the rollback. (A Custom Domain cannot be created on a hostname that still has a CNAME record.)

Cloudflare dashboard, Workers & Pages, `chartkit-web`, Settings, Domains & Routes, Add, Route: `chartkit.dev/*`, zone `chartkit.dev`. Add `www.chartkit.dev/*` too if `www` has a DNS record.

Rollback: delete the route. Requests go back to the v0 origin. Leave the v0 origin running until the checks below pass and you are happy with the site; shut it down later. Once it is gone, replace the route with a Custom Domain so Cloudflare manages the DNS record.

If the site should call the Cloud render worker on a host other than `https://cloud.chartkit.dev`, set `PUBLIC_CHARTKIT_CLOUD_URL` for the build (see `apps/web/README.md`).

Then purge Cloudflare's cache for chartkit.dev (dashboard, Caching, Configuration, Purge Everything) so no edge keeps the v0 `llms.txt`.

Check (each must pass):

```bash
curl -sI https://chartkit.dev | grep -i x-powered-by
```

No output. The v0 site sent `x-powered-by: Next.js`.

```bash
curl -s https://chartkit.dev/llms.txt | head -1
```

Prints `# ChartKit JSON spec`, not `# ChartKit - AI Assistant Reference`.

```bash
curl -s https://chartkit.dev/llms.txt | cmp - catalog/public/llms.txt && curl -s https://chartkit.dev/.well-known/llms.txt | cmp - catalog/public/llms.txt && echo llms ok
```

```bash
for u in / /docs /docs/migrate /benchmarks /when-to-use /schema/v1.json /llms-full.txt /llms.json /features.json /benchmarks.json /recipes.json /showcase.json /sitemap.xml; do echo "$(curl -s -o /dev/null -w '%{http_code}' https://chartkit.dev$u) $u"; done
```

Every line starts with `200`.

```bash
curl -s https://chartkit.dev/getting-started | grep -o 'url=/docs'
```

Prints `url=/docs`, so the v0 path redirects.

`/llms.txt` was served with `max-age=86400`, so a client that fetched v0 within the last day can keep it until it expires. Nothing on our side shortens that. The v1 file is served with `max-age=3600`.

## 8. Deprecate v0

Only after step 7 passes, because the message links to `/docs/migrate`. Logged in as an owner of `@derpdaderp`, with 2FA:

```bash
npm deprecate @derpdaderp/chartkit@"<0.5.0" "This package has moved to @chartkitdev/react and @chartkitdev/core. https://chartkit.dev/docs/migrate"
```

Check:

```bash
npm view @derpdaderp/chartkit@0.4.1 deprecated
```

Prints the message. `npm view @derpdaderp/chartkit@0.5.0 deprecated` prints nothing: the shim stays installable.

## 9. Lock down (same day)

1. On npmjs.com, revoke the bootstrap granular token.
2. Delete `NPM_TOKEN` from the GitHub environment `npm`.
3. On npmjs.com, for each of the 14 packages: Settings, Publishing access, **Require two-factor authentication and disallow tokens**. Trusted publishing (step 10) still works with this setting.

Check: npmjs.com, Access Tokens, no granular token for `@chartkitdev`. GitHub, Environments, `npm` has no secrets.

## 10. Trusted publishing (at the next release, not on launch day)

A new trusted-publisher config expires unless a first OIDC publish completes within 2 days. That publish needs a version that is not on npm yet, so `0.5.0` cannot be republished. Configure trust only when the next version (for example `0.5.1`) is merged to `main` and ready to go:

```bash
scripts/npm-trust.sh --dry-run
```

```bash
scripts/npm-trust.sh
```

Then, the same day, run Publish from `main` with bootstrap **false** and mode **stage**:

```bash
gh workflow run publish.yml --ref main -f package=all -f mode=stage -f bootstrap=false
```

Approve each staged version with 2FA:

```bash
npm stage list @chartkitdev/core
```

```bash
npm stage approve <stage-id>
```

Check: `npm view @chartkitdev/core dist-tags.latest` is the new version, and the package page on npmjs.com shows the GitHub provenance badge and, under Settings, the trusted publisher `toddynho/chartkit`, `publish.yml`, environment `npm`.

## Known follow-ups (not launch blockers)

- `@chartkitdev/core` is 3.6 MB packed (15.6 MB unpacked) after dropping sourcemaps from the tarball. Most of that is because each `charts/*` entry is built with `splitting: false` and carries its own copy of the renderer (about 100 KB per entry, two formats). The size-budget work owns that build change.
- `@chartkitdev/vanilla` is 570 kB packed.
- `llms.txt` is at 6,399 of its 6,400-byte cap, so it has no room for the v0 rename note. That note is in `llms-full.txt` and on `/docs/migrate`.
