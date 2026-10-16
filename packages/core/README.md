# @chartkitdev/core

Framework-free ChartKit core. Zero runtime dependencies.

- `schema/chartkit.schema.json` — ChartKit spec v1 (`$id`: `https://chartkit.dev/schema/v1.json`), exported as `@chartkitdev/core/schema.json`
- `validate(spec)` — `@chartkitdev/core/validate`. Structural and data-aware diagnostics (`CK1001`…`CK4004`). The runtime checker uses a stripped schema; codes, pointers, hints, and fixes match the published schema.
- `render(spec, target?)` — SVG. The package root is a registry plus the midnight theme. Chart modules are opt-in. An unregistered type returns an error SVG (`CK1010`) and does not throw.

One-line quick start: `import { render } from "@chartkitdev/core/all"`.

Theme colors are CSS variables (`var(--ck-series-1, …)`, `--ck-text`, `--ck-background`, and the rest) so a host stylesheet wins. Midnight ships with every renderer. Other presets are `@chartkitdev/core/themes/<name>` (a name that has not been imported renders as midnight). `@chartkitdev/core/all` registers all 17.

```ts
import { render } from "@chartkitdev/core/all";
import { validate } from "@chartkitdev/core/validate";

const spec = {
  version: "1",
  type: "line",
  data: [
    { month: "Jan", revenue: 120 },
    { month: "Feb", revenue: 150 },
  ],
  encoding: { x: "month", y: "revenue" },
  a11y: { alt: "Revenue rose from January to February." },
};

const result = validate(spec);
const svg = render(spec);
```

A line-only bundle registers just that chart:

```ts
import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);
```

`mark.sampling` defaults to `"auto"`: line, area, sparkline, mini-area, stacked-area, combo lines, and spike charts downsample above twice the plot width. See [SPEC.md](./SPEC.md).

TypeScript types in `src/generated/schema.ts` are generated from the schema (`npm run generate:types`). Do not edit that file by hand.

Not published yet. See [docs/migrate.md](../../docs/migrate.md).
