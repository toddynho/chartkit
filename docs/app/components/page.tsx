'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import {
  Sparkline,
  MiniArea,
  BarChart,
  DonutChart,
  ProgressRing,
  themes,
} from '@derpdaderp/chartkit';
import { useMemo } from 'react';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateData = (count: number = 20) =>
  Array.from({ length: count }, () => ({ value: Math.random() * 100 }));

const components = [
  // Time Series
  {
    name: 'Sparkline',
    href: '/components/sparkline',
    description: 'Minimal inline charts for showing trends at a glance.',
    category: 'Time Series',
    preview: (data: { value: number }[], theme: string) => (
      <Sparkline data={data} theme={theme as any} width={100} height={30} />
    ),
  },
  {
    name: 'MiniArea',
    href: '/components/mini-area',
    description: 'Small area charts with gradient fills.',
    category: 'Time Series',
    preview: (data: { value: number }[], theme: string) => (
      <MiniArea data={data} theme={theme as any} width={100} height={30} />
    ),
  },
  {
    name: 'LineChart',
    href: '/components/line-chart',
    description: 'Multi-series line charts with dual Y-axis, curve types, and area fills.',
    category: 'Time Series',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  {
    name: 'StackedArea',
    href: '/components/stacked-area',
    description: 'Stacked area charts for cumulative time series.',
    category: 'Time Series',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  // Categorical
  {
    name: 'BarChart',
    href: '/components/bar-chart',
    description: 'Vertical/horizontal bars with grouping support.',
    category: 'Categorical',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  {
    name: 'DonutChart',
    href: '/components/donut-chart',
    description: 'Donut and pie charts for proportional data.',
    category: 'Categorical',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  // Correlation - NEW
  {
    name: 'ScatterChart',
    href: '/components/scatter-chart',
    description: 'Scatter plots and bubble charts for correlation analysis.',
    category: 'Correlation',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  {
    name: 'ComboChart',
    href: '/components/combo-chart',
    description: 'Combined line, bar, and area charts with dual Y-axes.',
    category: 'Correlation',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  // Activity
  {
    name: 'Heatmap',
    href: '/components/heatmap',
    description: 'GitHub-style contribution/activity heatmaps.',
    category: 'Activity',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  {
    name: 'SpikeChart',
    href: '/components/spike-chart',
    description: 'Event spike visualization with baseline.',
    category: 'Activity',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  // KPI / Gauges
  {
    name: 'KpiCard',
    href: '/components/kpi-card',
    description: 'Metric cards with sparklines and delta indicators.',
    category: 'KPI & Gauges',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  {
    name: 'ProgressRing',
    href: '/components/progress-ring',
    description: 'Circular progress indicators for goals and loading.',
    category: 'KPI & Gauges',
    preview: (data: any, theme: string) => (
      <ProgressRing value={72} size={50} strokeWidth={4} theme={theme as any} />
    ),
  },
  {
    name: 'GaugeChart',
    href: '/components/gauge-chart',
    description: 'Semicircular gauges for single metrics with targets.',
    category: 'KPI & Gauges',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
  // Financial
  {
    name: 'CandlestickChart',
    href: '/components/candlestick-chart',
    description: 'OHLC candlestick charts for stocks and crypto.',
    category: 'Financial',
    preview: () => (
      <div className="text-xs text-center text-muted-foreground">
        See full demo
      </div>
    ),
  },
];

export default function ComponentsPage() {
  const data = useMemo(() => generateData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout showToc={false}>
      <h1 id="components">Components</h1>
      <p className="lead">
        ChartKit provides 15 chart components designed for monitoring dashboards and
        data visualization.
      </p>

      <div className="not-prose grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {components.map((component) => (
          <Link
            key={component.name}
            href={component.href}
            className="group p-5 rounded-lg border border-border bg-card hover:border-accent/50 transition-all"
          >
            <div className="h-16 mb-4 flex items-center justify-center bg-muted/30 rounded">
              {component.preview(data, themeName)}
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold group-hover:text-accent transition-colors">
                {component.name}
              </h3>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground">{component.description}</p>
            <div className="mt-2 text-xs text-muted-foreground/60">{component.category}</div>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
