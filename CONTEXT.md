# ChartKit - AI/LLM Context

> This file provides context for AI assistants and LLMs working with this codebase.

## Project Overview

**ChartKit** ships `@chartkitdev/core` (framework-free schema, `validate`, and SVG `render`), `@chartkitdev/react` (the existing components plus `<Chart spec={...} />`), and thin spec adapters `@chartkitdev/vue`, `@chartkitdev/svelte`, and `@chartkitdev/vanilla` (`mount(el, spec)` → `{ update, destroy }`). `@derpdaderp/chartkit` is a compatibility shim. The spec id is `https://chartkit.dev/schema/v1.json`. It prioritizes:

- **Small core**: `@chartkitdev/core` has zero runtime dependencies. Chart renderers and themes past midnight are opt-in imports. `mark.sampling` defaults to `auto` and downsamples line, area, sparkline, mini-area, stacked-area, combo lines, and spike above twice the plot width (`packages/core/SPEC.md`). `npm run bench` prints bundle size and validate throughput. `npm run size` fails when the line, all-charts, validate, or adapter bundles grow past their budgets. Adapter budgets exclude core and the framework.
- **Dependencies**: `@chartkitdev/core` has none. `@chartkitdev/react` depends on the core and peers React 18+. `@chartkitdev/vue` peers Vue 3. `@chartkitdev/svelte` peers Svelte 4 or 5 (the component uses `export let`). `@chartkitdev/vanilla` depends only on the core.
- **Small core**: `@chartkitdev/core` has zero runtime dependencies. Chart renderers and themes past midnight are opt-in imports. `mark.sampling` defaults to `auto` and downsamples line, area, sparkline, mini-area, stacked-area, combo lines, and spike above twice the plot width (`packages/core/SPEC.md`). `npm run bench` writes the public comparison in `BENCHMARKS.md`. `npm run bench:core` prints core size and validate throughput. `npm run size` fails when the line, all-charts, or validate bundles grow past their budgets.
- **Dependencies**: `@chartkitdev/core` has none. `@chartkitdev/react` depends on the core and peers React 18+
- **Beautiful defaults**: 17 curated themes that work out of the box
- **TypeScript-first**: Full type safety and autocomplete

## Repository Structure

```
chartkit/
├── packages/
│   ├── core/                 # @chartkitdev/core — registry, charts/*, themes/*, validate
│   ├── react/                # @chartkitdev/react — components, hooks, themes
│   ├── vue/                  # @chartkitdev/vue — <Chart :spec="..." />
│   ├── svelte/               # @chartkitdev/svelte — <Chart {spec} />
│   ├── vanilla/              # @chartkitdev/vanilla — mount(el, spec)
│   └── compat-derpdaderp/    # @derpdaderp/chartkit shim
├── docs/                     # Documentation site (Next.js) and docs/migrate.md
└── CONTEXT.md
```

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `LineChart` | Time series, trends | `data`, `series`/`dataKey`, `theme`, `responsive`, `curve` |
| `BarChart` | Categorical comparison | `data`, `dataKey`, `categoryKey`, `theme` |
| `DonutChart` | Composition, percentages | `data`, `dataKey`, `labelKey`, `theme` |
| `KpiCard` | Metrics with sparkline | `label`, `value`, `delta`, `data`, `theme` |
| `Sparkline` | Inline trends | `data`, `theme`, `glow`, `fill` |
| `Heatmap` | Activity visualization | `data`, `theme`, `weeks` |
| `CandlestickChart` | Financial OHLC | `data`, `theme`, `showVolume` |

## Common Patterns

### Responsive Charts
```tsx
// Option 1: responsive prop
<LineChart data={data} dataKey="value" theme="midnight" responsive />

// Option 2: ResponsiveChart wrapper
<ResponsiveChart aspectRatio={16/9}>
  {({ width, height }) => <LineChart width={width} height={height} ... />}
</ResponsiveChart>
```

### Dark/Light Mode
```tsx
import { useAutoTheme } from '@chartkitdev/react';

const theme = useAutoTheme({ light: 'sunset', dark: 'midnight' });
<LineChart theme={theme} ... />
```

### Multi-Series with Dual Y-Axis
```tsx
<LineChart
  data={data}
  series={[
    { key: 'requests', label: 'Requests', yAxisId: 'left' },
    { key: 'latency', label: 'Latency', yAxisId: 'right' },
  ]}
  yAxisLeft={{ unit: 'req/s' }}
  yAxisRight={{ unit: 'ms' }}
  theme="midnight"
/>
```

## Theme System

- **Dark themes (13)**: midnight, emerald, mono, slate, arctic, orchid, obsidian, neon, mocha, owl, retro, copper, rose
- **Light themes (4)**: sunset, silver, pearl, latte

Access theme colors directly:
```tsx
import { themes } from '@chartkitdev/react';
const t = themes['midnight'];
// t.colors, t.bg, t.text, t.border, etc.
```

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Build the libraries (core, then react, then the shim)
npm run build:lib

# Run docs site
npm run dev -w docs

# Run tests
npm test

# Public comparison (bundle, browser, SSR). Writes BENCHMARKS.md
npm run bench

# Internal core size and validate throughput
npm run bench:core

# Fail if line, all-charts, or validate gzip exceeds the budget
npm run size
```

## Resources

- **Documentation**: https://chartkit.dev
- **npm (React)**: https://www.npmjs.com/package/@chartkitdev/react
- **npm (core)**: https://www.npmjs.com/package/@chartkitdev/core
- **Schema**: https://chartkit.dev/schema/v1.json
- **GitHub**: https://github.com/toddynho/chartkit
- **LLM Reference**: https://chartkit.dev/llms.txt (summary) or /llms-full.txt (complete API)
- **LLM JSON**: https://chartkit.dev/llms.json (structured data)
- **Migration**: docs/migrate.md

## When Generating Code

1. Prefer a v1 JSON spec (`version`, `type`, `data`, `encoding`, `a11y.alt`). One-line quick start: `import { render } from "@chartkitdev/core/all"`. Validate with `import { validate } from "@chartkitdev/core/validate"`. For a smaller bundle, `createRenderer([line])` after `import { line } from "@chartkitdev/core/charts/line"`. `<Chart spec={...} />` from `@chartkitdev/react` uses every chart unless you pass `render`.
2. Existing components still import from `@chartkitdev/react`. `theme` is required on those components — `"midnight"` is a solid default. It is optional on the JSON spec (default `auto`).
3. For responsive charts, use the `responsive` prop or `ResponsiveChart` wrapper
4. Use `useAutoTheme` hook when the app supports dark/light mode switching
5. Data format: arrays of objects with consistent keys
6. For single-series charts, use `dataKey` + `label` instead of `series` array
