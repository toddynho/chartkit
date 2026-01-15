**Project: ChartKit - Lightweight charting library for Next.js**

**Context:**
We're building a standalone charting library from scratch (not wrapping Recharts/Chart.js) specifically for Next.js. The goal is beautiful, minimal charts inspired by monitoring dashboards like Turso, Cloudflare, and Vercel - not generic business charts.

**Design direction:**
- Minimal, no-nonsense aesthetic with dark themes as the default
- Sparklines and KPI cards as first-class citizens
- Glow effects on lines (SVG filter blur)
- Smooth tooltip transitions (interpolated Y values, CSS transitions)
- Interactive legend badges that toggle series on/off
- JetBrains Mono for data labels, system fonts for UI

**What's been built (v3):**
- Theme system with 5 themes: Monitor Dark, Turbo, Cloudflare, Vercel, GitHub
- Scale utilities (linearScale, inverseLinearScale, interpolateY)
- Components: Sparkline, MiniArea, KpiCard, MonitorLine (multi-series with toggles), SpikeChart
- All pure SVG, no D3 DOM manipulation - just the math parts conceptually
- Currently a single HTML file with React via CDN for prototyping

**Key technical decisions:**
- No external chart dependencies - just React
- SVG-based rendering with path generation
- Theme passed as prop, colors accessed via themes[theme]
- Interpolation for smooth cursor tracking between data points

**Reference screenshots saved:** Turso database sparkline with glow, latency monitor with percentile badges, Cloudflare spike chart with baseline, Vercel KPI cards with delta arrows

**Next steps to consider:**
1. Break into proper npm package structure (separate component files, TypeScript)
2. Add more chart types: bar, donut, stacked area, heatmap
3. Responsive width handling (ResizeObserver)
4. Animation on initial render (path drawing effect)
5. Server component variants for static charts
6. Documentation site

**Files:** The latest working prototype is `chartkit-v3.html` - download and open directly in browser to see current state.
