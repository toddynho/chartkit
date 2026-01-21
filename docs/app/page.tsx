'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Palette, Zap, Code2, Copy, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Logo, Wordmark } from '@/components/Logo';
import { LineChart, KpiCard, DonutChart, BarChart } from '@derpdaderp/chartkit';
import { useMemo, useState } from 'react';
import { useChartTheme } from '@/components/ChartThemeProvider';

// Generate smooth wave-like data for hero chart
function generateHeroData() {
  return Array.from({ length: 50 }, (_, i) => ({
    time: `${i}`,
    value: 50 + Math.sin(i / 5) * 25 + Math.sin(i / 2) * 10 + Math.random() * 5,
    value2: 40 + Math.cos(i / 4) * 20 + Math.sin(i / 3) * 8 + Math.random() * 5,
  }));
}

function generateKpiData() {
  return Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));
}

const features = [
  {
    icon: Sparkles,
    title: 'Beautiful by Default',
    description: 'Gorgeous charts out of the box. No design skills required.',
  },
  {
    icon: Palette,
    title: '17 Curated Themes',
    description: 'Dark & light themes inspired by Vercel, GitHub, and more.',
  },
  {
    icon: Zap,
    title: 'Incredibly Light',
    description: '~15KB gzipped. Zero dependencies. Just React.',
  },
  {
    icon: Code2,
    title: 'TypeScript First',
    description: 'Full type safety with autocomplete for every prop.',
  },
];

const chartTypes = [
  'LineChart', 'BarChart', 'DonutChart', 'StackedArea', 'ScatterChart',
  'ComboChart', 'Heatmap', 'GaugeChart', 'KpiCard', 'Sparkline',
  'MiniArea', 'ProgressRing', 'SpikeChart', 'CandlestickChart',
];

export default function HomePage() {
  const { themeName } = useChartTheme();
  const heroData = useMemo(() => generateHeroData(), []);
  const kpiData = useMemo(() => generateKpiData(), []);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install @derpdaderp/chartkit');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ck-bg)' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Chart - Full bleed, anchored to bottom, fully visible */}
        <div 
          className="absolute"
          style={{ 
            left: '-60px', 
            right: '-60px', 
            bottom: '-40px',
            opacity: 0.5,
          }}
        >
          <LineChart
            data={heroData}
            series={[
              { key: 'value', label: 'Revenue', area: true, areaOpacity: 0.7 },
              { key: 'value2', label: 'Users', area: true, areaOpacity: 0.5 },
            ]}
            theme={themeName}
            height={350}
            responsive
            showLegend={false}
            curve="monotone"
            grid={false}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Glow behind content */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, var(--ck-bg) 40%, transparent 70%)`,
            }}
          />
          
          <div className="relative">
            {/* Logo */}
            <div className="flex justify-center mb-6 animate-in">
              <Logo size={64} />
            </div>
            
            {/* Main headline */}
            <h1 
              className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 animate-in animate-in-delay-1"
              style={{ color: 'var(--ck-text)' }}
            >
              Beautiful charts.
              <br />
              <span className="text-gradient">Zero config.</span>
            </h1>
            
            {/* Subheadline */}
            <p 
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto animate-in animate-in-delay-2"
              style={{ color: 'var(--ck-text-muted)' }}
            >
              The React chart library for dashboards that look as good as they perform. 
              15 components, 17 themes, ~15KB.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-in animate-in-delay-3">
              <Link href="/getting-started" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/components" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
                View Components
              </Link>
            </div>

            {/* Install command */}
            <div className="flex items-center justify-center gap-2 animate-in animate-in-delay-4">
              <div 
                className="flex items-center gap-3 px-4 py-2.5 rounded-md font-mono text-sm"
                style={{ 
                  backgroundColor: 'var(--ck-dark-bg)', 
                  border: '1px solid var(--ck-dark-border)',
                  color: 'var(--ck-dark-text)'
                }}
              >
                <span style={{ color: 'var(--ck-dark-text-muted)' }}>$</span>
                <span>npm install @derpdaderp/chartkit</span>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4" style={{ color: 'var(--ck-success)' }} />
                  ) : (
                    <Copy className="h-4 w-4" style={{ color: 'var(--ck-dark-text-muted)' }} />
                  )}
                </button>
              </div>
              <a
                href="https://www.npmjs.com/package/@derpdaderp/chartkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--ck-surface)', 
                  border: '1px solid var(--ck-border)',
                  color: 'var(--ck-text-muted)'
                }}
              >
                npm
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--ck-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--ck-text)' }}>
              See it in action
            </h2>
            <p style={{ color: 'var(--ck-text-muted)' }}>
              Real components. Real themes. Try switching themes in the header.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <div className="space-y-4">
              <KpiCard
                label="Monthly Revenue"
                value={284500}
                delta={12.5}
                data={kpiData}
                theme={themeName}
                format={(v) => `$${(v / 1000).toFixed(0)}K`}
              />
              <KpiCard
                label="Active Users"
                value={18420}
                delta={8.2}
                data={kpiData}
                theme={themeName}
                format={(v) => v.toLocaleString()}
              />
            </div>

            {/* Line Chart */}
            <div 
              className="md:col-span-2 rounded-md p-4"
              style={{ backgroundColor: 'var(--ck-bg)', border: '1px solid var(--ck-border)' }}
            >
              <LineChart
                data={heroData.slice(0, 30)}
                series={[
                  { key: 'value', label: 'This month', area: true },
                  { key: 'value2', label: 'Last month', strokeDasharray: '4,4' },
                ]}
                theme={themeName}
                height={250}
                responsive
                curve="monotone"
                unit=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--ck-text)' }}>
              Why ChartKit?
            </h2>
            <p style={{ color: 'var(--ck-text-muted)' }}>
              Built for developers who want great charts without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-md mb-4"
                  style={{ backgroundColor: 'var(--ck-surface)', border: '1px solid var(--ck-border)' }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: 'var(--ck-primary)' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--ck-text)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--ck-text-muted)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Types Section */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid var(--ck-border)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--ck-text)' }}>
            15 Chart Components
          </h2>
          <p className="mb-10" style={{ color: 'var(--ck-text-muted)' }}>
            Everything you need for dashboards, analytics, and data visualization.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {chartTypes.map((type) => (
              <span 
                key={type}
                className="px-3 py-1.5 rounded-md text-sm"
                style={{ 
                  backgroundColor: 'var(--ck-surface)', 
                  border: '1px solid var(--ck-border)',
                  color: 'var(--ck-text-secondary)'
                }}
              >
                {type}
              </span>
            ))}
          </div>

          <Link 
            href="/components" 
            className="inline-flex items-center gap-2 font-medium"
            style={{ color: 'var(--ck-primary)' }}
          >
            Explore all components
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--ck-surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--ck-text)' }}>
              Simple API, powerful results
            </h2>
            <p style={{ color: 'var(--ck-text-muted)' }}>
              Get a beautiful chart with just a few lines of code.
            </p>
          </div>

          <div 
            className="rounded-md overflow-hidden"
            style={{ border: '1px solid var(--ck-border)' }}
          >
            <div 
              className="px-4 py-3 text-sm font-medium"
              style={{ backgroundColor: 'var(--ck-dark-elevated)', color: 'var(--ck-dark-text-muted)' }}
            >
              MyDashboard.tsx
            </div>
            <pre 
              className="p-6 overflow-x-auto text-sm"
              style={{ backgroundColor: 'var(--ck-dark-bg)', color: 'var(--ck-dark-text)' }}
            >
              <code>{`import { LineChart, KpiCard } from '@derpdaderp/chartkit';

export function Dashboard({ data }) {
  return (
    <div>
      <KpiCard
        label="Revenue"
        value={284500}
        delta={12.5}
        data={data}
        theme="midnight"
      />
      
      <LineChart
        data={data}
        series={[{ key: 'value', label: 'Sales', area: true }]}
        theme="midnight"
        curve="monotone"
      />
    </div>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6" style={{ color: 'var(--ck-text)' }}>
            Ready to build beautiful dashboards?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--ck-text-muted)' }}>
            Get started in minutes. No configuration required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/getting-started" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a 
              href="https://github.com/toddynho/chartkit"
              className="btn-outline inline-flex items-center gap-2 text-base px-8 py-3"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid var(--ck-border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--ck-text-muted)' }}>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <Wordmark />
          </div>
          <div>
            Built with Next.js. Open source on{' '}
            <a
              href="https://github.com/toddynho/chartkit"
              className="hover:underline"
              style={{ color: 'var(--ck-primary)' }}
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
