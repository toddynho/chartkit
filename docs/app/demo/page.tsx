'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, AlertTriangle, Clock, Zap, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import {
  KpiCard,
  LineChart,
  BarChart,
  DonutChart,
  GaugeChart,
  ProgressRing,
  Heatmap,
  CandlestickChart,
  ResponsiveChart,
  themes,
  type HeatmapDataPoint,
} from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

// ============================================
// DATA GENERATORS
// ============================================

function generateThroughputData() {
  const data = [];
  const baseTime = new Date();
  baseTime.setHours(5, 0, 0, 0);
  
  for (let i = 0; i < 72; i++) {
    const time = new Date(baseTime.getTime() + i * 10 * 60 * 1000);
    const hour = time.getHours();
    // Higher traffic during business hours
    const baseRequests = (hour >= 9 && hour <= 17) ? 85 : 45;
    const noise = Math.random() * 20 - 10;
    // Spike around release times
    const releaseSpike = (i === 25 || i === 52) ? 25 : 0;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      requests: Math.max(20, baseRequests + noise + releaseSpike),
      index: i,
    });
  }
  return data;
}

function generateDurationData() {
  const data = [];
  const baseTime = new Date();
  baseTime.setHours(5, 0, 0, 0);
  
  for (let i = 0; i < 48; i++) {
    const time = new Date(baseTime.getTime() + i * 15 * 60 * 1000);
    const hour = time.getHours();
    const isPeak = hour >= 10 && hour <= 16;
    
    // Percentiles with realistic distribution
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

function generateErrorData() {
  return [
    { type: 'TypeError', count: 342, color: '#ef4444' },
    { type: 'NetworkError', count: 189, color: '#f59e0b' },
    { type: 'ValidationError', count: 156, color: '#8b5cf6' },
    { type: 'AuthError', count: 98, color: '#06b6d4' },
    { type: 'TimeoutError', count: 67, color: '#ec4899' },
  ];
}

function generateWebVitalsData() {
  return [
    { metric: 'LCP', value: 28, label: '1.11s', color: '#22c55e' },
    { metric: 'FCP', value: 22, label: '206ms', color: '#22c55e' },
    { metric: 'INP', value: 18, label: '48ms', color: '#22c55e' },
    { metric: 'CLS', value: 15, label: '0', color: '#22c55e' },
    { metric: 'TTFB', value: 17, label: '76ms', color: '#f59e0b' },
  ];
}

function generateAssetData() {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      js: 200 + Math.random() * 150,
      css: 80 + Math.random() * 60,
      images: 150 + Math.random() * 200,
      fonts: 40 + Math.random() * 30,
    });
  }
  return data;
}

function generateHeatmapData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
    const baseValue = isWeekday ? 6 : 2;
    data.push({
      date: current.toISOString().split('T')[0],
      value: Math.floor(baseValue * Math.random() + (Math.random() > 0.85 ? 10 : 0)),
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

function generateRecentErrors() {
  return [
    { id: 1, message: 'TypeError: Cannot read property "map" of undefined', count: 1243, lastSeen: '2 min ago', trend: 'up' },
    { id: 2, message: 'NetworkError: Failed to fetch /api/users', count: 892, lastSeen: '5 min ago', trend: 'down' },
    { id: 3, message: 'ValidationError: Invalid email format', count: 654, lastSeen: '12 min ago', trend: 'stable' },
    { id: 4, message: 'AuthError: Token expired', count: 421, lastSeen: '18 min ago', trend: 'up' },
    { id: 5, message: 'TimeoutError: Request timeout after 30s', count: 234, lastSeen: '25 min ago', trend: 'down' },
  ];
}

function generateStockData() {
  const data = [];
  let price = 185;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const change = (Math.random() - 0.48) * 6;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2.5;
    const low = Math.min(open, close) - Math.random() * 2.5;
    const volume = Math.floor(50000000 + Math.random() * 30000000);
    
    data.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    
    price = close;
  }
  return data;
}

// ============================================
// COMPONENTS
// ============================================

function MetricCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  trendValue,
  theme 
}: { 
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  theme: any;
}) {
  const trendColor = trend === 'up' ? theme.negative : trend === 'down' ? theme.positive : theme.textMuted;
  const trendIcon = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
  
  return (
    <div 
      className="p-4 rounded-xl border"
      style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm" style={{ color: theme.textSecondary }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color: theme.textMuted }} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color: theme.text }}>{value}</span>
        {subValue && <span className="text-sm" style={{ color: theme.textMuted }}>{subValue}</span>}
      </div>
      {trendValue && (
        <div className="mt-1 text-sm" style={{ color: trendColor }}>
          {trendIcon}{trendValue} vs last period
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useChartTheme();
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold" style={{ color: theme.text }}>{title}</h2>
      {subtitle && <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>{subtitle}</p>}
    </div>
  );
}

function ErrorsTable({ errors, theme }: { errors: ReturnType<typeof generateRecentErrors>; theme: any }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
      <div className="p-4 border-b" style={{ borderColor: theme.border }}>
        <h3 className="font-semibold" style={{ color: theme.text }}>Frequent Issues</h3>
      </div>
      <div className="divide-y" style={{ borderColor: theme.border }}>
        {errors.map((error) => (
          <div key={error.id} className="p-4 flex items-center justify-between hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium truncate" style={{ color: theme.negative }}>{error.message}</p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{error.count.toLocaleString()} events</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: theme.textSecondary }}>{error.lastSeen}</p>
              {error.trend === 'up' && <span className="text-xs" style={{ color: theme.negative }}>Increasing</span>}
              {error.trend === 'down' && <span className="text-xs" style={{ color: theme.positive }}>Decreasing</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebVitalsRing({ score, metrics, theme, themeName }: { score: number; metrics: ReturnType<typeof generateWebVitalsData>; theme: any; themeName: string }) {
  const scoreColor = score >= 90 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
      <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Web Vitals Score</h3>
      <div className="flex items-center gap-8">
        <div className="relative">
          <ProgressRing
            value={score}
            size={140}
            strokeWidth={12}
            theme={themeName as any}
            color={scoreColor}
            trackColor={theme.bgSecondary}
          >
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: theme.text }}>{score}</div>
              <div className="text-xs" style={{ color: theme.textMuted }}>Good</div>
            </div>
          </ProgressRing>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.metric} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <div>
                <div className="text-xs font-medium" style={{ color: theme.text }}>{m.metric}</div>
                <div className="text-xs" style={{ color: theme.textMuted }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function DemoPage() {
  const { themeName, theme } = useChartTheme();
  const [timeRange, setTimeRange] = useState('24h');
  
  // Generate data
  const throughputData = useMemo(() => generateThroughputData(), []);
  const durationData = useMemo(() => generateDurationData(), []);
  const errorData = useMemo(() => generateErrorData(), []);
  const webVitalsData = useMemo(() => generateWebVitalsData(), []);
  const assetData = useMemo(() => generateAssetData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const recentErrors = useMemo(() => generateRecentErrors(), []);
  const stockData = useMemo(() => generateStockData(), []);
  const kpiData = useMemo(() => Array.from({ length: 20 }, () => ({ value: Math.random() * 100 })), []);

  // Release annotations for throughput chart
  const releaseAnnotations = [
    { type: 'line' as const, axis: 'x' as const, value: 25, label: 'v2.4.1', color: '#8b5cf6', strokeDasharray: '4,4' },
    { type: 'line' as const, axis: 'x' as const, value: 52, label: 'v2.4.2', color: '#8b5cf6', strokeDasharray: '4,4' },
  ];

  // Duration threshold annotations
  const durationAnnotations = [
    { type: 'area' as const, axis: 'y' as const, start: 0, end: 200, color: '#22c55e', opacity: 0.05 },
    { type: 'line' as const, axis: 'y' as const, value: 1000, label: 'Target', color: '#f59e0b', strokeDasharray: '6,4' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ borderColor: theme.border, backgroundColor: `${theme.bg}ee` }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                style={{ color: theme.textSecondary }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to docs
              </Link>
              <div className="h-6 w-px" style={{ backgroundColor: theme.border }} />
              <div>
                <h1 className="text-xl font-bold" style={{ color: theme.text }}>Observability Dashboard</h1>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Frontend Performance Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time range selector */}
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: theme.border }}>
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: timeRange === range ? theme.accent : 'transparent',
                      color: timeRange === range ? '#fff' : theme.textSecondary,
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button 
                className="p-2 rounded-lg border hover:opacity-70 transition-opacity"
                style={{ borderColor: theme.border, color: theme.textSecondary }}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Requests"
            value={2847503}
            delta={12.4}
            data={kpiData}
            theme={themeName as any}
            format={(v) => `${(v / 1000000).toFixed(2)}M`}
          />
          <KpiCard
            label="Error Rate"
            value={0.23}
            delta={-18.5}
            data={kpiData}
            theme={themeName as any}
            format={(v) => `${v.toFixed(2)}%`}
          />
          <KpiCard
            label="Avg Duration"
            value={245}
            delta={-8.2}
            data={kpiData}
            theme={themeName as any}
            format={(v) => `${v}ms`}
          />
          <KpiCard
            label="Apdex Score"
            value={0.94}
            delta={2.1}
            data={kpiData}
            theme={themeName as any}
            format={(v) => v.toFixed(2)}
          />
        </div>

        {/* Charts Row 1: Throughput + Duration + Errors Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Throughput */}
          <div className="lg:col-span-1 rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>Throughput</h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>Requests per minute</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors[0] }} />
                  <span style={{ color: theme.textSecondary }}>Requests</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span style={{ color: theme.textSecondary }}>Releases</span>
                </div>
              </div>
            </div>
            <ResponsiveChart aspectRatio={16 / 10}>
              {({ width, height }) => (
                <LineChart
                  data={throughputData}
                  dataKey="requests"
                  label="Requests/min"
                  theme={themeName as any}
                  width={width}
                  height={height}
                  unit="/min"
                  curve="monotone"
                  showLegend={false}
                  annotations={releaseAnnotations}
                />
              )}
            </ResponsiveChart>
          </div>

          {/* Duration Percentiles */}
          <div className="lg:col-span-1 rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>Duration</h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>Response time percentiles</p>
              </div>
            </div>
            <ResponsiveChart aspectRatio={16 / 10}>
              {({ width, height }) => (
                <LineChart
                  data={durationData}
                  series={[
                    { key: 'p50', label: 'p50', displayValue: '180ms' },
                    { key: 'p75', label: 'p75', displayValue: '420ms' },
                    { key: 'p95', label: 'p95', displayValue: '1.1s', strokeDasharray: '4,2' },
                  ]}
                  theme={themeName as any}
                  width={width}
                  height={height}
                  unit="ms"
                  curve="monotone"
                  yAxisLeft={{ 
                    unit: 'ms',
                    format: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}s` : `${v.toFixed(0)}ms`
                  }}
                  annotations={durationAnnotations}
                />
              )}
            </ResponsiveChart>
          </div>

          {/* Errors Table */}
          <div className="lg:col-span-1">
            <ErrorsTable errors={recentErrors} theme={theme} />
          </div>
        </div>

        {/* Charts Row 2: Web Vitals + Error Distribution + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Web Vitals */}
          <WebVitalsRing score={95} metrics={webVitalsData} theme={theme} themeName={themeName} />

          {/* Error Distribution */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Error Distribution</h3>
            <DonutChart
              data={errorData}
              dataKey="count"
              labelKey="type"
              theme={themeName as any}
              size={200}
              innerRadius={0.6}
              centerContent={
                <div className="text-center">
                  <div className="text-xl font-bold" style={{ color: theme.text }}>852</div>
                  <div className="text-xs" style={{ color: theme.textMuted }}>Total</div>
                </div>
              }
            />
          </div>

          {/* Activity Heatmap */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Deployment Activity</h3>
            <Heatmap
              data={heatmapData}
              theme={themeName as any}
              weeks={13}
            />
          </div>
        </div>

        {/* Charts Row 3: Asset Timing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets by Time */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>Asset Load Time</h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>Time spent loading resources</p>
              </div>
            </div>
            <ResponsiveChart aspectRatio={16 / 8}>
              {({ width, height }) => (
                <LineChart
                  data={assetData}
                  series={[
                    { key: 'js', label: 'JavaScript', area: true, areaOpacity: 0.1 },
                    { key: 'images', label: 'Images', area: true, areaOpacity: 0.1 },
                    { key: 'css', label: 'CSS' },
                    { key: 'fonts', label: 'Fonts' },
                  ]}
                  theme={themeName as any}
                  width={width}
                  height={height}
                  unit="ms"
                  curve="monotone"
                />
              )}
            </ResponsiveChart>
          </div>

          {/* Resource Breakdown */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>Resource Breakdown</h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>By content type</p>
              </div>
            </div>
            <BarChart
              data={[
                { type: 'JavaScript', size: 847, requests: 45 },
                { type: 'Images', size: 1240, requests: 89 },
                { type: 'CSS', size: 234, requests: 12 },
                { type: 'Fonts', size: 156, requests: 8 },
                { type: 'API', size: 423, requests: 67 },
              ]}
              dataKey="size"
              categoryKey="type"
              theme={themeName as any}
              width={500}
              height={250}
              orientation="horizontal"
            />
          </div>
        </div>

        {/* Stock Chart */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: theme.text }}>ACME Corp (ACME)</h3>
              <p className="text-xs" style={{ color: theme.textMuted }}>NASDAQ - 30 Day Price History</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ color: stockData[stockData.length - 1]?.close >= stockData[0]?.open ? theme.positive : theme.negative }}>
                ${stockData[stockData.length - 1]?.close.toFixed(2)}
              </div>
              <div className="text-xs" style={{ color: stockData[stockData.length - 1]?.close >= stockData[0]?.open ? theme.positive : theme.negative }}>
                {stockData[stockData.length - 1]?.close >= stockData[0]?.open ? '+' : ''}
                {((stockData[stockData.length - 1]?.close - stockData[0]?.open) / stockData[0]?.open * 100).toFixed(2)}%
              </div>
            </div>
          </div>
          <ResponsiveChart aspectRatio={16 / 7}>
            {({ width, height }) => (
              <CandlestickChart
                data={stockData}
                theme={themeName as any}
                width={width}
                height={height}
                showVolume
                formatY={(v) => `$${v.toFixed(0)}`}
              />
            )}
          </ResponsiveChart>
        </div>

        {/* Performance Gauges */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }}>
          <h3 className="font-semibold mb-6" style={{ color: theme.text }}>Core Web Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'LCP', value: 1.1, unit: 's', target: 2.5, good: 2.5 },
              { label: 'FID', value: 48, unit: 'ms', target: 100, good: 100 },
              { label: 'CLS', value: 0.02, unit: '', target: 0.1, good: 0.1 },
              { label: 'TTFB', value: 76, unit: 'ms', target: 200, good: 200 },
              { label: 'INP', value: 48, unit: 'ms', target: 200, good: 200 },
            ].map((metric) => {
              const percentage = Math.min(100, (metric.value / metric.target) * 100);
              const isGood = metric.value <= metric.good;
              return (
                <div key={metric.label} className="text-center">
                  <GaugeChart
                    value={percentage}
                    theme={themeName as any}
                    size={100}
                    strokeWidth={8}
                    ranges={[
                      { min: 0, max: 50, color: '#22c55e' },
                      { min: 50, max: 75, color: '#f59e0b' },
                      { min: 75, max: 100, color: '#ef4444' },
                    ]}
                  >
                    {/* Empty to hide default value display */}
                    <span />
                  </GaugeChart>
                  <div className="mt-2">
                    <div className="text-lg font-bold" style={{ color: isGood ? theme.positive : theme.negative }}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>{metric.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t" style={{ borderColor: theme.border }}>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Built with{' '}
            <Link href="/" className="font-medium hover:underline" style={{ color: theme.accent }}>
              ChartKit
            </Link>
            {' '}- Lightweight React charting library
          </p>
        </div>
      </main>
    </div>
  );
}
