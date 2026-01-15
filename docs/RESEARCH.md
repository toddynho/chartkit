# User Research: Charting Library Pain Points

Research gathered from Reddit (r/reactjs) and developer community feedback about existing charting libraries.

## Top Complaints About Existing Libraries

### 1. Responsiveness Issues
> "Pain in the ass to make responsive in flex containers"

Most libraries require manual width/height management. Developers must write boilerplate like:
```tsx
const { ref, width } = useContainerWidth();
return (
  <div ref={ref} style={{ width: '100%' }}>
    {width > 0 && <Chart width={width} height={300} />}
  </div>
);
```

**ChartKit Solution:** `ResponsiveChart` wrapper component handles this automatically.

### 2. Performance with Large Datasets
SVG-based libraries struggle with 1000+ data points. Common issues:
- DOM gets bloated with SVG elements
- Re-renders become sluggish
- Browser memory usage spikes

Developers want:
- Canvas rendering option for large datasets
- Data downsampling/aggregation
- Virtualization for time series

### 3. Accessibility is Non-Existent
Most charting libraries completely ignore accessibility:
- No ARIA labels or roles
- No keyboard navigation
- No screen reader support
- No high contrast modes
- Color-only data differentiation

This is a major gap in the ecosystem.

### 4. Bundle Size Concerns
D3 dependency bloat is a common complaint:
- Full D3 bundle is ~500KB
- Most charts only use a fraction of D3's features
- Tree-shaking often doesn't work well
- Multiple charting libraries = duplicate D3 code

**ChartKit Solution:** Zero D3 dependency, ~15KB total bundle.

### 5. Maintenance and Abandonment
- **Recharts:** Understaffed, slow to merge PRs
- **Plotly React:** Wrapper is essentially abandoned
- **Victory:** Complex API, steep learning curve
- **Chart.js:** Canvas-only, limited customization
- **Nivo:** Heavy, over-engineered for simple use cases

### 6. TypeScript Gaps
- Incomplete type definitions
- Props not properly typed
- Generic support lacking
- Event handlers poorly typed

## Most Requested Features

### High Priority
1. **Large dataset support** (10k+ points)
2. **Interactivity** (zoom, pan, brush selection)
3. **Multiple Y-axes**
4. **Real-time updates** (streaming data)
5. **Better theming/dark mode**

### Medium Priority
6. Annotations and reference lines
7. Export to PNG/SVG
8. Stacked/grouped variations
9. Animation control
10. Custom tooltip components

### Nice to Have
11. Collaborative cursors
12. Print-friendly mode
13. Offline/SSR support
14. i18n for labels

## Libraries Compared

| Library | Bundle | Responsive | A11y | TypeScript | Maintenance |
|---------|--------|------------|------|------------|-------------|
| Recharts | ~150KB | Manual | Poor | Partial | Slow |
| Nivo | ~200KB | Built-in | Poor | Good | Active |
| Victory | ~100KB | Manual | Poor | Good | Moderate |
| Chart.js | ~60KB | Built-in | Poor | Good | Active |
| Plotly | ~3MB | Built-in | Moderate | Poor | Stale |
| **ChartKit** | ~15KB | Built-in | WIP | Full | Active |

## Key Takeaways for ChartKit

1. **Responsiveness solved** - `ResponsiveChart` wrapper eliminates boilerplate
2. **Bundle size is competitive** - No D3 dependency keeps us lightweight
3. **TypeScript is complete** - Full type coverage from day one
4. **A11y is a gap** - Industry-wide problem we can address
5. **Performance at scale** - Future consideration for canvas rendering
6. **Interactivity** - Zoom/pan would differentiate us

## Future Roadmap Considerations

Based on this research, priority features to consider:

1. **Accessibility improvements**
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader descriptions
   - High contrast theme

2. **Large dataset mode**
   - Data downsampling
   - Canvas rendering option
   - Virtual scrolling for wide charts

3. **Interactivity**
   - Zoom/pan controls
   - Brush selection
   - Click handlers on data points

4. **Multiple Y-axes**
   - Left/right axis support
   - Independent scales
   - Axis label positioning

---

*Research compiled January 2026*
