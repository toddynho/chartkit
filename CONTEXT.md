# ChartKit - AI/LLM Context

> This file provides context for AI assistants and LLMs working with this codebase.

## Project Overview

**ChartKit** (`@derpdaderp/chartkit`) is a lightweight React charting library designed for dashboards and analytics applications. It prioritizes:

- **Small bundle size**: ~15KB gzipped
- **Zero dependencies**: Only peer dependency is React 18+
- **Beautiful defaults**: 17 curated themes that work out of the box
- **TypeScript-first**: Full type safety and autocomplete

## Repository Structure

```
chartkit/
├── packages/
│   └── chartkit/           # Main library package
│       ├── src/
│       │   ├── components/ # All chart components
│       │   ├── hooks/      # React hooks (useAutoTheme, etc.)
│       │   ├── themes/     # Theme definitions
│       │   └── utils/      # Scale functions, path generation
│       └── package.json    # Published as @derpdaderp/chartkit
├── docs/                   # Documentation site (Next.js)
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Doc site components
│   ├── lib/               # Utilities and metadata
│   └── public/            # Static assets, llms.txt
└── CONTEXT.md             # This file
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
import { useAutoTheme } from '@derpdaderp/chartkit';

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
import { themes } from '@derpdaderp/chartkit';
const t = themes['midnight'];
// t.colors, t.bg, t.text, t.border, etc.
```

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Build the library
npm run build -w packages/chartkit

# Run docs site
npm run dev -w docs

# Run tests
npm test -w packages/chartkit
```

## Resources

- **Documentation**: https://chartkit.dev
- **npm**: https://www.npmjs.com/package/@derpdaderp/chartkit
- **GitHub**: https://github.com/toddynho/chartkit
- **LLM Reference**: https://chartkit.dev/llms.txt (summary) or /llms-full.txt (complete API)
- **LLM JSON**: https://chartkit.dev/llms.json (structured data)

## When Generating Code

1. Always import from `@derpdaderp/chartkit`
2. Every chart requires a `theme` prop - use `"midnight"` as default for dark UIs
3. For responsive charts, use the `responsive` prop or `ResponsiveChart` wrapper
4. Use `useAutoTheme` hook when the app supports dark/light mode switching
5. Data format: arrays of objects with consistent keys
6. For single-series charts, use `dataKey` + `label` instead of `series` array
