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
import { render } from "@chartkitdev/core/all";
import { validate } from "@chartkitdev/core/validate";
```

`import { render } from "@chartkitdev/core/all"` is the one-line quick start. To ship a single chart, register it yourself:

```ts
import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);
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

`packages/compat-derpdaderp` is `@derpdaderp/chartkit`. It re-exports `@chartkitdev/react` and logs this once, in development only:

`This package has moved to @chartkitdev/react.`

The publish steps, including that shim (last) and the `npm deprecate` commands, are in [RELEASING.md](../RELEASING.md). The workflow does not run on push.
