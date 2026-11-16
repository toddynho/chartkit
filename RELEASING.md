# Releasing ChartKit

Publishing is manual. The workflow is `.github/workflows/publish.yml` (`workflow_dispatch` only). Nothing in CI publishes on push. Todd is not publishing until the website is ready. Do not run the workflow before that.

Steady state uses GitHub OIDC. A token exists only for the one-time bootstrap, then it is revoked.

`npm stage publish` packs the package directory it is run in. It does not understand npm workspaces, so the workflow runs it inside each package directory. Order is `scripts/public-packages.txt`: `@chartkitdev/core` and `@chartkitdev/geo` first, then the adapters, `@chartkitdev/mcp`, and `@derpdaderp/chartkit` last.

The exact launch-day commands, in order, with a check after each, are in [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

## Version and dist-tag (recommendation)

**Launch as `0.5.0` on `latest`. All 14 public packages share one version and move together. Go to `1.0.0` later, as a deliberate release.**

Why `0.5.0` on `latest`:

- Everything already assumes it. Every package is `0.5.0`, and every internal range is `^0.5.0`. The shim is `@derpdaderp/chartkit@0.5.0`, so the deprecate command below targets `<0.5.0`. `publish.yml` passes no `--tag`.
- `npm install @chartkitdev/react` works with no tag. That is the line in every README, in `llms.txt`, and on the site.
- With `0.x`, a caret range pins the minor: `^0.5.0` never resolves to `0.6.0`. A breaking change in the next weeks can ship as `0.6.0` without breaking anyone who installed at launch.
- The spec's `"version": "1"` and `/schema/v1.json` are the schema version, not the package version. A `0.5.0` package that reads v1 specs is consistent. Say "the v1 spec" in posts, not "ChartKit 1.0".

When to cut `1.0.0`: once the spec, `validate()`/`repair()` and the adapter props are frozen, and a few weeks of real installs have produced no breaking fixes. Bump every package and every internal `^0.x` range in one PR. `npm` then needs nothing special, since `1.0.0` is not a prerelease.

If you want a prerelease soak instead (`1.0.0-beta.N` on `next`), it is not free:

1. **The workflow must pass `--tag next`.** npm refuses to publish a prerelease version without an explicit `--tag`. Add a `tag` input to `publish.yml` and pass it in every branch: bootstrap `npm publish`, `stage publish`, and both dry-runs. Check that `npm stage publish` accepts `--tag` before relying on it.
2. **Bump all 14 versions and rewrite every internal range.** `^0.5.0` does not match `1.0.0-beta.0`, and a caret range only matches prereleases of the same `major.minor.patch`. Use exact pins (`"@chartkitdev/core": "1.0.0-beta.0"`) or `^1.0.0-beta.0`.
3. **Decide the shim's version.** `@derpdaderp/chartkit` already has `latest = 0.4.1`. Publish it as a normal `0.5.0` on `latest`, depending on the beta range, so v0 users get the shim with a plain install.
4. **A brand-new package has no `latest`.** On a first publish under a custom tag, expect the registry to point `latest` at that version too, so `npm install @chartkitdev/core` would install the beta anyway. This is not verified here (it needs a real publish), so confirm it with `npm view @chartkitdev/core dist-tags` right after the first publish. Either way, `latest` must exist before the site says `npm install`.

Whichever you choose, keep every public package on the same version so `^` ranges between them always resolve.

## One-time setup

1. Turn on npm 2FA for Todd's account with a **security key** (WebAuthn). Do not use SMS.
2. Create the npm org **`chartkitdev`**. Package names are `@chartkitdev/*` (no hyphen in the scope).
3. In GitHub, on `toddynho/chartkit`, create an environment named **`npm`**.
   - Required reviewer: Todd.
   - Deployment branches: **main only**.
4. Protect **main**: require a pull request before merging, and require the CI checks. The publish workflow's environment rule then only allows a run from main.

Trusted publishing (OIDC) needs npm CLI 11.5.1 or newer and Node 22.14 or newer on a GitHub-hosted runner. This workflow uses Node 24 and installs npm `^11.15.0` (staged publishing and `npm trust` need 11.15 or newer). Provenance is automatic for an OIDC publish from this public repo. `repository.url` in each public package is `git+https://github.com/toddynho/chartkit.git`, which is what npm compares to the GitHub repo.

A trusted publisher can be attached only after the package exists on the registry. A new trusted-publisher config must complete a first OIDC publish within **2 days** or it expires.

## Launch day (once)

Do this only when the website is ready to tell people to `npm install` the packages.

1. Create a **granular access token**, expiry **1 day**, permission **read and write**, packages limited to `@chartkitdev/*` and `@derpdaderp/chartkit`. It has to publish from CI without an interactive 2FA prompt (automation / bypass 2FA). A token without that hangs the job. This is the only token that should ever bypass 2FA, and it is thrown away the same day.
2. Put the token in the GitHub environment **`npm`** as the secret **`NPM_TOKEN`**. Do not put it in the repository secrets. Other workflows do not use this environment.
3. On **main**, run **Publish**:
   - package: `all`
   - mode: `stage` (ignored for the upload while bootstrap is on)
   - bootstrap: **true**
   GitHub asks Todd to approve the `npm` environment. The job then uses `NPM_TOKEN` and runs `npm publish --provenance --access public` for each package, in order, and stops on the first failure. Provenance is signed with GitHub OIDC (`id-token: write`) even though the registry auth is the token. A token publish does not get provenance automatically; the flag is what requests it.
4. On your machine, logged in as the npm owner:

   ```bash
   scripts/npm-trust.sh
   ```

   That runs, for each public package, with a 2 second pause between them:

   ```bash
   npm trust github <pkg> --file publish.yml --repo toddynho/chartkit --env npm --allow-stage-publish --yes
   ```

   `--allow-stage-publish` does not grant direct `npm publish`. Preview the commands with `scripts/npm-trust.sh --dry-run` (it does not call npm).
   **Timing:** step 5 has to publish a version that is not on npm yet, and the bootstrap already published `0.5.0`. So run steps 4 and 5 together at the next release (for example `0.5.1`), not right after the bootstrap. Do steps 7 and 8 on launch day. LAUNCH_CHECKLIST.md uses that order.
5. Within **2 days**, run **Publish** again from main: bootstrap **false**, mode **`stage`**. This run must not have `NPM_TOKEN` set. It is the first OIDC publish and it binds each trusted publisher. If it does not succeed in time, delete the expired config and run `scripts/npm-trust.sh` again.
6. Approve the staged versions (below). Confirm each version is public and the provenance is present.
7. On npmjs.com, for every package, set Publishing access to **Require two-factor authentication and disallow tokens**.
8. Revoke the granular token. Delete the **`NPM_TOKEN`** secret from the `npm` environment.

`@chartkitdev/convert` stays private. It is not in this list.

After `@derpdaderp/chartkit@0.5.0` is on npm, deprecate the releases before the shim. Run this as an owner of `@derpdaderp`, with 2FA:

```bash
npm deprecate @derpdaderp/chartkit@"<0.5.0" "This package has moved to @chartkitdev/react and @chartkitdev/core. https://chartkit.dev/docs/migrate"
```

When nothing should install that name anymore, including the shim:

```bash
npm deprecate @derpdaderp/chartkit "This package has moved to @chartkitdev/react and @chartkitdev/core. https://chartkit.dev/docs/migrate"
```

## Steady state

Run **Publish** from main. Leave bootstrap off.

| Input | Default | Meaning |
| --- | --- | --- |
| package | `all` | One package, or `all` in dependency order |
| mode | `stage` | `stage`: `npm stage publish`. `publish`: direct `npm publish` (rejected if the trusted publisher is stage-only). `dry-run`: `npm stage publish --dry-run`, no upload |
| bootstrap | false | `true` only for the first release. Uses `NPM_TOKEN` and `npm publish --provenance`. `mode=dry-run` still does not upload |

The job waits for the `npm` environment reviewer, then runs `npm ci`, `npm run build:lib`, `npm test`, and `npm run release:check`. It then stages or publishes and prints a summary. A failure stops the list; packages earlier in the order are already staged or published.

OIDC auth has no npm token in the environment. Provenance is generated automatically because the repo is public, the packages are public (`publishConfig.access` and `publishConfig.provenance`), and the publish is from GitHub-hosted Actions.

Approve a staged version with 2FA. OIDC cannot approve.

```bash
npm stage list @chartkitdev/core
npm stage approve <stage-id>
```

Or open the package on npmjs.com, Staged Packages, and approve there.

`npm run release:check` is the local check. It does not talk to the registry except packing. It does not publish.
