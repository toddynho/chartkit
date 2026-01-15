'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Palette, Box, Code, Package, Download, FileCode, Bot } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@derpdaderp/chartkit';
import { useMemo } from 'react';
import { useChartTheme, themeColors } from '@/components/ChartThemeProvider';

const PACKAGE_VERSION = '0.2.0';
const BUNDLE_SIZE = '~15KB';

// Generate sample data
function generateData(count: number = 20) {
  return Array.from({ length: count }, () => ({
    value: Math.random() * 100,
  }));
}

const features = [
  {
    icon: Zap,
    title: 'Lightweight',
    description: 'No D3 or heavy chart dependencies. Pure React + SVG. ~15KB gzipped.',
  },
  {
    icon: Palette,
    title: '17 Themes',
    description: 'Dark and light themes inspired by Vercel, GitHub, Nord, Dracula, and more.',
  },
  {
    icon: Box,
    title: '14 Components',
    description: 'Lines, bars, gauges, scatter plots, heatmaps, KPI cards, and more.',
  },
  {
    icon: Code,
    title: 'TypeScript First',
    description: 'Full type safety with comprehensive types for all props.',
  },
];

const components = [
  { name: 'MonitorLine', href: '/components/monitor-line', description: 'Multi-series line charts with tooltips' },
  { name: 'BarChart', href: '/components/bar-chart', description: 'Grouped bar charts with annotations' },
  { name: 'ComboChart', href: '/components/combo-chart', description: 'Mixed line, bar, area with dual Y-axis' },
  { name: 'ScatterChart', href: '/components/scatter-chart', description: 'Scatter and bubble charts' },
  { name: 'GaugeChart', href: '/components/gauge-chart', description: 'Semicircular gauges with ranges' },
  { name: 'KpiCard', href: '/components/kpi-card', description: 'Metric cards with sparklines & deltas' },
];

export default function HomePage() {
  const { themeName, theme } = useChartTheme();
  const kpiData = useMemo(() => generateData(), []);
  const accentColor = themeColors[themeName];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Beautiful charts for{' '}
            <span style={{ color: accentColor }} className="transition-colors duration-300">Next.js</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Lightweight, theme-aware charting library with components inspired by monitoring dashboards like Vercel, Turso, and Cloudflare.
          </p>
          
          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
              <Package className="h-3.5 w-3.5" />
              v{PACKAGE_VERSION}
            </span>
            <a
              href="https://www.npmjs.com/package/@derpdaderp/chartkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border hover:border-accent/50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              npm
            </a>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
              <FileCode className="h-3.5 w-3.5" />
              {BUNDLE_SIZE} gzipped
            </span>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border hover:border-accent/50 transition-colors"
            >
              <Bot className="h-3.5 w-3.5" />
              AI-ready
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/getting-started"
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300"
              style={{ backgroundColor: accentColor }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/components"
              className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              View Components
            </Link>
          </div>
        </div>

        {/* Demo preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div
            className="rounded-xl border border-border p-6 transition-colors duration-300"
            style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
          >
            <div className="flex flex-wrap gap-6 justify-center">
              <KpiCard
                label="Requests"
                value={2780000}
                delta={12.5}
                data={kpiData}
                theme={themeName}
                format={(v) => `${(v / 1000000).toFixed(2)}M`}
              />
              <KpiCard
                label="Latency"
                value={45}
                delta={-8.2}
                data={kpiData}
                theme={themeName}
                format={(v) => `${v}ms`}
              />
              <KpiCard
                label="Error Rate"
                value={0.12}
                delta={-15.3}
                data={kpiData}
                theme={themeName}
                format={(v) => `${v.toFixed(2)}%`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Why ChartKit?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <feature.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Components grid */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Components</h2>
          <p className="text-muted-foreground text-center mb-12">
            Everything you need to build beautiful dashboards
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((component) => (
              <Link
                key={component.name}
                href={component.href}
                className="group p-6 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-accent transition-colors">
                    {component.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/components"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              View all components
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Quick Install</h2>
          <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm text-left">
            <span className="text-muted-foreground">$</span>{' '}
            <span>npm install @derpdaderp/chartkit</span>
          </div>
          <p className="text-muted-foreground mt-6">
            Or check out the{' '}
            <Link href="/getting-started" className="text-accent hover:underline">
              getting started guide
            </Link>{' '}
            for detailed setup instructions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span style={{ color: accentColor }} className="transition-colors duration-300">●</span>
            <span>ChartKit</span>
          </div>
          <div>
            Built with Next.js. Open source on{' '}
            <a
              href="https://github.com/toddynho/chartkit"
              className="hover:underline transition-colors duration-300"
              style={{ color: accentColor }}
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </footer>
    </div>
  );
}
