# @chartkitdev/core

Framework-free ChartKit core. Zero runtime dependencies.

- `schema/chartkit.schema.json` — ChartKit spec v1 (`$id`: `https://chartkit.dev/schema/v1.json`)
- `validate(spec)` — structural and data-aware diagnostics (`CK1001`…`CK4004`)
- `render(spec, target?)` — SVG string for line, bar, and area (including `stacked-area`). Other types return a placeholder and do not throw.

Theme colors are CSS variables (`var(--ck-series-1, …)`, `--ck-text`, `--ck-background`, and the rest) so a host stylesheet wins.

```ts
import { validate, render } from "@chartkitdev/core";

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

TypeScript types in `src/generated/schema.ts` are generated from the schema (`npm run generate:types`). Do not edit that file by hand.

Not published yet. See [docs/migrate.md](../../docs/migrate.md).
