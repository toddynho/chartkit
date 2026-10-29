# Releasing ChartKit

Publishing is manual. The workflow is `.github/workflows/publish.yml` (`workflow_dispatch` only). Nothing in CI publishes on push. Todd is not publishing until the website is ready. Do not run the workflow before that.

Steady state uses GitHub OIDC. A token exists only for the one-time bootstrap, then it is revoked.

`npm stage publish` packs the package directory it is run in. It does not understand npm workspaces, so the workflow runs it inside each package directory. Order is `scripts/public-packages.txt`: `@chartkitdev/core` and `@chartkitdev/geo` first, then the adapters, `@chartkitdev/mcp`, and `@derpdaderp/chartkit` last.

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
