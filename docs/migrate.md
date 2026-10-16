# Migrate to @chartkitdev

ChartKit v1 keeps the React component API and adds a declarative JSON spec. Package names move off `@derpdaderp`.

| Before | After |
|---|---|
| `@derpdaderp/chartkit` | `@chartkitdev/react` (components, hooks, themes) |
| — | `@chartkitdev/core` (schema, `validate`, `render`) |
| later | `@chartkitdev/vue`, `@chartkitdev/svelte`, `@chartkitdev/mcp` |

The schema URL is `https://chartkit.dev/schema/v1.json`.

## Install

```bash
npm uninstall @derpdaderp/chartkit
npm install @chartkitdev/react
```

Add the core when you want the spec API without React:

```bash
npm install @chartkitdev/core
```

Update imports:

```ts
import { LineChart, Chart } from "@chartkitdev/react";
import { validate, render } from "@chartkitdev/core";
```

`<Chart spec={...} />` renders a v1 spec. The existing components (`LineChart`, `BarChart`, and the rest) keep their props. `theme` stays required on those components. On a spec it is optional and defaults to `auto`.

A minimal spec:

```json
{
  "version": "1",
  "type": "line",
  "data": [
    { "month": "Jan", "revenue": 120 },
    { "month": "Feb", "revenue": 150 }
  ],
  "encoding": { "x": "month", "y": "revenue" },
  "a11y": { "alt": "Revenue rose from January to February." }
}
```

`a11y.alt` is required. Formatting is a preset or an Intl-style object, not a function. Prop renames (`dataKey` → `encoding.y`, `categoryKey` → `encoding.x`, and the rest) are listed in the v1 spec notes. Transforms (aggregate, bin, sort, filter) are deferred to v1.1.

## Compatibility shim

`packages/compat-derpdaderp` is the next version of `@derpdaderp/chartkit`. It re-exports `@chartkitdev/react` and logs this once, in development only:

`This package has moved to @chartkitdev/react.`

Nothing in this repository publishes that shim. Publish stays a manual workflow (`.github/workflows/publish.yml`).

## Owner steps (not done by this change)

These need a human. Do them in order, after the npm org and the GitHub org exist.

1. Create the npm org `chartkitdev` (the scope was unclaimed when this was written; confirm it still is).
2. Create the GitHub org `chartkitdev` if you want the name reserved. This repo can stay at `toddynho/chartkit` until you move it.
3. Configure npm trusted publishing (or an `NPM_TOKEN` secret) for this GitHub repository.
4. Run the **Publish** workflow (`workflow_dispatch`) for `@chartkitdev/core`, then `@chartkitdev/react`, then the shim `@derpdaderp/chartkit`. Provenance is requested (`npm publish --provenance`). The workflow does not run on push.
5. After the shim is on npm, deprecate the old line. From a machine logged into npm as an owner of `@derpdaderp`:

```bash
npm deprecate @derpdaderp/chartkit@"<0.5.0" "Moved to @chartkitdev/react. 0.5.0+ is a compatibility shim that re-exports it."
```

To deprecate every version, including the shim, once you are ready to delete the name:

```bash
npm deprecate @derpdaderp/chartkit "Moved to @chartkitdev/react"
```

Do not run either command until the new packages are actually published.
