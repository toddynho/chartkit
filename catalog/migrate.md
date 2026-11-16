# Migrate to @chartkitdev

Published at https://chartkit.dev/docs/migrate.

ChartKit v1 is a declarative JSON spec, rendered in React by `<Chart spec={...} />`. The v0 React components keep working: they are frozen and live at `@chartkitdev/react/legacy`. Package names move off `@derpdaderp`.

| Before | After |
|---|---|
| `@derpdaderp/chartkit` | `@chartkitdev/react/legacy` (the v0 components, hooks, themes, scale and path helpers) |
| — | `@chartkitdev/react` (`<Chart spec={...} />`) |
| — | `@chartkitdev/core` (schema, `validate`, `render`) |
| — | `@chartkitdev/vue`, `@chartkitdev/svelte`, `@chartkitdev/vanilla`, `@chartkitdev/mcp`, and the other adapters |

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
import { LineChart, KpiCard, useAutoTheme } from "@chartkitdev/react/legacy";
import { Chart } from "@chartkitdev/react";
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

### The legacy entry

Everything `@derpdaderp/chartkit` exported is at `@chartkitdev/react/legacy`, under the same names: the 14 components, `Legend`, `Annotations`, `ResponsiveChart`, the hooks (`useAutoTheme` and the rest), `themes`, `getTheme` and the scale and path helpers. That entry is frozen. It gets fixes, not features.

During 0.x the main entry, `@chartkitdev/react`, still exports those names so an import you have not changed keeps working. They are marked `@deprecated` there, so your editor strikes them through, and they are removed from the main entry in `@chartkitdev/react@1.0.0`. That is the package version, not the v1 spec: the launch release is 0.5.0 and keeps them. `@chartkitdev/react/legacy` stays.

An app that imports only `Chart` from `@chartkitdev/react` does not bundle the legacy components.

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

`packages/compat-derpdaderp` is `@derpdaderp/chartkit`. It re-exports `@chartkitdev/react/legacy`, which is the v0 API and nothing else, and logs this once, in development only:

`This package has moved to @chartkitdev/react.`

The publish steps, including that shim (last) and the `npm deprecate` commands, are in [RELEASING.md](../RELEASING.md). The workflow does not run on push.
