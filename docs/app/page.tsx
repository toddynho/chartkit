'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Palette, Zap, Code2, Copy, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Logo, Wordmark } from '@/components/Logo';
import { LineChart, KpiCard, DonutChart, BarChart, ResponsiveChart } from '@derpdaderp/chartkit';
import { useMemo, useState } from 'react';
import { useChartTheme } from '@/components/ChartThemeProvider';

// Generate revenue + users data for hero chart
function generateHeroData() {
  return Array.from({ length: 50 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 150000 + Math.sin(i / 5) * 40000 + Math.sin(i / 2) * 15000 + Math.random() * 10000,
    value2: 120000 + Math.cos(i / 4) * 35000 + Math.sin(i / 3) * 12000 + Math.random() * 8000,
  }));
}

function generateKpiData() {
  return Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));
}

// Throughput data - requests per minute throughout the day
function generateThroughputData() {
  const data = [];
  const baseTime = new Date();
  baseTime.setHours(5, 0, 0, 0);
  
  for (let i = 0; i < 72; i++) {
    const time = new Date(baseTime.getTime() + i * 10 * 60 * 1000);
    const hour = time.getHours();
    const baseRequests = (hour >= 9 && hour <= 17) ? 85 : 45;
    const noise = Math.random() * 20 - 10;
    const releaseSpike = (i === 25 || i === 52) ? 25 : 0;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      requests: Math.max(20, baseRequests + noise + releaseSpike),
      index: i,
    });
  }
  return data;
}

// Duration data - response time percentiles
function generateDurationData() {
  const data = [];
  const baseTime = new Date();
  baseTime.setHours(5, 0, 0, 0);
  
  for (let i = 0; i < 48; i++) {
    const time = new Date(baseTime.getTime() + i * 15 * 60 * 1000);
    const hour = time.getHours();
    const isPeak = hour >= 10 && hour <= 16;
    
    const p50Base = isPeak ? 180 : 120;
    const p75Base = isPeak ? 450 : 280;
    const p95Base = isPeak ? 1200 : 600;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      p50: p50Base + Math.random() * 50,
      p75: p75Base + Math.random() * 100,
      p95: p95Base + Math.random() * 400,
      index: i,
    });
  }
  return data;
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

// 14 chart components (excludes utilities: Legend, Annotations, ResponsiveChart)

export default function HomePage() {
  const { themeName, theme } = useChartTheme();
  const heroData = useMemo(() => generateHeroData(), []);
  const kpiData = useMemo(() => generateKpiData(), []);
  const throughputData = useMemo(() => generateThroughputData(), []);
  const durationData = useMemo(() => generateDurationData(), []);
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
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ borderBottom: '1px solid var(--ck-border)' }}>
        {/* Background Chart - Full bleed, anchored to bottom, x-axis pushed below border */}
        <div 
          className="absolute"
          style={{ 
            left: '-60px', 
            right: '-60px', 
            bottom: '-80px',
            opacity: 0.5,
          }}
        >
          <LineChart
            data={heroData}
            series={[
              { key: 'value', label: 'Revenue', area: true, areaOpacity: 0.7, yAxisId: 'left' },
              { key: 'value2', label: 'Users', area: true, areaOpacity: 0.5, yAxisId: 'right' },
            ]}
            theme={themeName}
            height={700}
            responsive
            showLegend={false}
            curve="monotone"
            grid={false}
            yAxisLeft={{
              format: (v) => `$${(v / 1000).toFixed(0)}K`,
            }}
            yAxisRight={{
              format: (v) => `${(v / 1000).toFixed(0)}K`,
            }}
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
              14 components, 17 themes, ~15KB.
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
            <div className="flex items-center justify-center animate-in animate-in-delay-4">
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
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="pt-16 pb-16 px-6" style={{ backgroundColor: 'var(--ck-bg)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--ck-text)' }}>
              See it in action
            </h2>
            <p style={{ color: 'var(--ck-text-muted)' }}>
              Real components. Real themes. Try switching themes in the header.
            </p>
          </div>
          
          {/* Throughput + Duration Charts Side by Side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Throughput */}
            <div 
              className="p-5"
              style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold" style={{ color: theme.text }}>Throughput</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Requests per minute</p>
                </div>
              </div>
              <ResponsiveChart aspectRatio={16 / 9}>
                {({ width, height }) => (
                  <LineChart
                    data={throughputData}
                    dataKey="requests"
                    label="Requests/min"
                    theme={themeName}
                    width={width}
                    height={height}
                    unit="/min"
                    curve="monotone"
                    showLegend={false}
                  />
                )}
              </ResponsiveChart>
            </div>

            {/* Duration Percentiles */}
            <div 
              className="p-5"
              style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '12px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold" style={{ color: theme.text }}>Duration</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Response time percentiles</p>
                </div>
              </div>
              <ResponsiveChart aspectRatio={16 / 9}>
                {({ width, height }) => (
                  <LineChart
                    data={durationData}
                    series={[
                      { key: 'p50', label: 'p50' },
                      { key: 'p75', label: 'p75' },
                      { key: 'p95', label: 'p95', strokeDasharray: '4,2' },
                    ]}
                    theme={themeName}
                    width={width}
                    height={height}
                    unit="ms"
                    curve="monotone"
                    yAxisLeft={{ 
                      unit: 'ms',
                      format: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}s` : `${v.toFixed(0)}ms`
                    }}
                  />
                )}
              </ResponsiveChart>
            </div>
          </div>
          
          {/* Link to full demo */}
          <div className="text-center mt-8">
            <Link 
              href="/demo" 
              className="inline-flex items-center gap-2 font-medium"
              style={{ color: 'var(--ck-primary)' }}
            >
              See all charts in action
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid var(--ck-border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--ck-text)' }}>
                Why ChartKit?
              </h2>
              <div className="space-y-4" style={{ color: 'var(--ck-text-muted)' }}>
                <p>
                  <strong style={{ color: 'var(--ck-text)' }}>Beautiful by default.</strong>{' '}
                  Every chart looks polished out of the box. No design skills required.
                </p>
                <p>
                  <strong style={{ color: 'var(--ck-text)' }}>Incredibly light.</strong>{' '}
                  ~15KB gzipped with zero dependencies. Just React.
                </p>
                <p>
                  <strong style={{ color: 'var(--ck-text)' }}>TypeScript first.</strong>{' '}
                  Full type safety with autocomplete for every prop.
                </p>
                <p>
                  <strong style={{ color: 'var(--ck-text)' }}>17 curated themes.</strong>{' '}
                  Dark and light themes inspired by Vercel, GitHub, Linear, and more.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--ck-text)' }}>
                14 Components
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm" style={{ color: 'var(--ck-text-muted)' }}>
                {chartTypes.map((type) => (
                  <Link 
                    key={type}
                    href={`/components/${type.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)}`}
                    className="hover:underline"
                    style={{ color: 'var(--ck-text-secondary)' }}
                  >
                    {type}
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link 
                  href="/components" 
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--ck-primary)' }}
                >
                  View all components
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <Wordmark />
            </div>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              by{' '}
              <a
                href="https://x.com/toddo"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--ck-text-secondary)' }}
              >
                @toddo
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <a
              href="https://github.com/toddynho/chartkit"
              className="hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
