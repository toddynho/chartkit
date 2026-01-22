'use client';

import { useMemo, useState } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import {
  KpiCard,
  LineChart,
  BarChart,
  DonutChart,
  Heatmap,
  ScatterChart,
  ComboChart,
  ProgressRing,
  GaugeChart,
  StackedArea,
  Legend,
  ResponsiveChart,
  themes,
  type HeatmapDataPoint,
} from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

// ============================================
// DATA GENERATORS
// ============================================

function generateKpiData() {
  return Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));
}

function generateLatencyData() {
  const data = [];
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    // Simulate higher latency during peak hours (10-14, 16-18)
    const isPeak = (hour >= 10 && hour <= 14) || (hour >= 16 && hour <= 18);
    data.push({
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      p50: 1.5 + Math.random() * 0.5 + (isPeak ? 0.8 : 0),
      p95: 2.5 + Math.random() * 1 + (isPeak ? 1.5 : 0),
      p99: 4 + Math.random() * 2 + (isPeak ? 3 : 0),
    });
  }
  return data;
}

function generateSalesData() {
  return [
    { month: 'Jan', revenue: 65000, expenses: 42000, growth: 8.5 },
    { month: 'Feb', revenue: 78000, expenses: 48000, growth: 12.3 },
    { month: 'Mar', revenue: 92000, expenses: 55000, growth: 15.1 },
    { month: 'Apr', revenue: 85000, expenses: 52000, growth: 10.2 },
    { month: 'May', revenue: 105000, expenses: 61000, growth: 18.4 },
    { month: 'Jun', revenue: 120000, expenses: 68000, growth: 22.1 },
  ];
}

function generateTrafficData() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    organic: 1200 + Math.random() * 800,
    paid: 800 + Math.random() * 600,
    referral: 400 + Math.random() * 400,
    social: 200 + Math.random() * 300,
  }));
}

function generateScatterData() {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  return Array.from({ length: 60 }, (_, i) => ({
    adSpend: Math.random() * 50000 + 5000,
    conversions: Math.random() * 500 + 50 + (Math.random() > 0.7 ? 200 : 0),
    revenue: Math.random() * 100000 + 20000,
    region: regions[i % 4],
  }));
}

function generateHeatmapData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 180);

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
    data.push({
      date: current.toISOString().split('T')[0],
      value: Math.floor((isWeekday ? 5 : 2) * Math.random() + (Math.random() > 0.9 ? 8 : 0)),
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

// ============================================
// DASHBOARD COMPONENTS
// ============================================

function MonitoringDashboard({ theme }: { theme: string }) {
  const t = themes[theme as keyof typeof themes];
  const kpiData = useMemo(() => generateKpiData(), []);
  const latencyData = useMemo(() => generateLatencyData(), []);

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ backgroundColor: t.bg }}>
      <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: t.text }}>Infrastructure Monitor</h3>
          <p className="text-sm mt-1" style={{ color: t.textSecondary }}>Real-time system health</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm" style={{ color: t.textSecondary }}>All systems operational</span>
        </div>
      </div>
      
      <div className="p-4 md:p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Requests/min"
            value={12450}
            delta={8.3}
            data={kpiData}
            theme={theme as any}
            format={(v) => v.toLocaleString()}
          />
          <KpiCard
            label="Avg Latency"
            value={2.4}
            delta={-12.5}
            data={kpiData}
            theme={theme as any}
            format={(v) => `${v.toFixed(1)}ms`}
          />
          <KpiCard
            label="Error Rate"
            value={0.05}
            delta={-25}
            data={kpiData}
            theme={theme as any}
            format={(v) => `${v.toFixed(2)}%`}
          />
          <KpiCard
            label="Uptime"
            value={99.99}
            delta={0.01}
            data={kpiData}
            theme={theme as any}
            format={(v) => `${v}%`}
          />
        </div>

        {/* Gauges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <GaugeChart
              value={68}
              size={120}
              strokeWidth={10}
              theme={theme as any}
              ranges={[
                { min: 0, max: 50, color: '#22c55e' },
                { min: 50, max: 80, color: '#f59e0b' },
                { min: 80, max: 100, color: '#ef4444' },
              ]}
              showTickLabels={false}
            />
            <span className="text-xs mt-2" style={{ color: t.textSecondary }}>CPU Usage</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <GaugeChart
              value={42}
              size={120}
              strokeWidth={10}
              theme={theme as any}
              ranges={[
                { min: 0, max: 50, color: '#22c55e' },
                { min: 50, max: 80, color: '#f59e0b' },
                { min: 80, max: 100, color: '#ef4444' },
              ]}
              showTickLabels={false}
            />
            <span className="text-xs mt-2" style={{ color: t.textSecondary }}>Memory</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <GaugeChart
              value={23}
              size={120}
              strokeWidth={10}
              theme={theme as any}
              ranges={[
                { min: 0, max: 50, color: '#22c55e' },
                { min: 50, max: 80, color: '#f59e0b' },
                { min: 80, max: 100, color: '#ef4444' },
              ]}
              showTickLabels={false}
            />
            <span className="text-xs mt-2" style={{ color: t.textSecondary }}>Disk I/O</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <GaugeChart
              value={31}
              size={120}
              strokeWidth={10}
              theme={theme as any}
              ranges={[
                { min: 0, max: 50, color: '#22c55e' },
                { min: 50, max: 80, color: '#f59e0b' },
                { min: 80, max: 100, color: '#ef4444' },
              ]}
              showTickLabels={false}
            />
            <span className="text-xs mt-2" style={{ color: t.textSecondary }}>Network</span>
          </div>
        </div>

        {/* Latency Chart with Annotations */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: t.textSecondary }}>Response Time (24h)</h4>
          <ResponsiveChart aspectRatio={16 / 7}>
            {({ width, height }) => (
              <LineChart
                data={latencyData}
                series={[
                  { key: 'p50', label: 'p50', displayValue: '1.8ms' },
                  { key: 'p95', label: 'p95', displayValue: '3.2ms' },
                  { key: 'p99', label: 'p99', displayValue: '5.1ms' },
                ]}
                theme={theme as any}
                width={width}
                height={height}
                unit="ms"
                curve="monotone"
                annotations={[
                  { type: 'line', value: 5, axis: 'y', label: 'SLA', color: '#ef4444', labelPosition: 'end' },
                  { type: 'area', start: 0, end: 3, axis: 'y', color: '#22c55e', opacity: 0.05 },
                ]}
              />
            )}
          </ResponsiveChart>
        </div>
      </div>
    </div>
  );
}

function SalesDashboard({ theme }: { theme: string }) {
  const t = themes[theme as keyof typeof themes];
  const salesData = useMemo(() => generateSalesData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);
  const trafficData = useMemo(() => generateTrafficData(), []);

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ backgroundColor: t.bg }}>
      <div className="p-4 md:p-6 border-b border-border/50">
        <h3 className="text-lg font-semibold" style={{ color: t.text }}>Sales Analytics</h3>
        <p className="text-sm mt-1" style={{ color: t.textSecondary }}>Revenue performance and marketing ROI</p>
      </div>
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <div className="text-xs" style={{ color: t.textSecondary }}>Total Revenue</div>
            <div className="text-2xl font-bold mt-1" style={{ color: t.text }}>$545K</div>
            <div className="text-xs mt-1 text-green-500">+22.1% from last period</div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: t.bgSecondary }}>
            <div className="text-xs" style={{ color: t.textSecondary }}>Net Profit</div>
            <div className="text-2xl font-bold mt-1" style={{ color: t.text }}>$219K</div>
            <div className="text-xs mt-1 text-green-500">+18.4% margin</div>
          </div>
          <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: t.bgSecondary }}>
            <ProgressRing value={78} size={60} strokeWidth={5} theme={theme as any} />
            <div>
              <div className="text-xs" style={{ color: t.textSecondary }}>Q2 Target</div>
              <div className="text-sm font-semibold" style={{ color: t.text }}>78% Complete</div>
            </div>
          </div>
          <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: t.bgSecondary }}>
            <ProgressRing value={92} size={60} strokeWidth={5} theme={theme as any} color="#22c55e" />
            <div>
              <div className="text-xs" style={{ color: t.textSecondary }}>Customer Sat.</div>
              <div className="text-sm font-semibold" style={{ color: t.text }}>92% Positive</div>
            </div>
          </div>
        </div>

        {/* Combo Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: t.textSecondary }}>Revenue vs Growth Rate</h4>
          <ResponsiveChart aspectRatio={16 / 8}>
            {({ width, height }) => (
              <ComboChart
                data={salesData}
                series={[
                  { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
                  { key: 'expenses', label: 'Expenses', type: 'bar', yAxis: 'left' },
                  { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
                ]}
                categoryKey="month"
                theme={theme as any}
                width={width}
                height={height}
                yLabelLeft="Revenue ($)"
                yLabelRight="Growth (%)"
                formatYLeft={(v) => `$${(v / 1000).toFixed(0)}K`}
                formatYRight={(v) => `${v.toFixed(0)}%`}
              />
            )}
          </ResponsiveChart>
        </div>

        {/* Scatter + Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: t.textSecondary }}>Ad Spend vs Conversions</h4>
            <ScatterChart
              data={scatterData}
              xKey="adSpend"
              yKey="conversions"
              categoryKey="region"
              theme={theme as any}
              width={400}
              height={300}
              xLabel="Ad Spend ($)"
              yLabel="Conversions"
              formatX={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: t.textSecondary }}>Traffic Sources (30 days)</h4>
            <StackedArea
              data={trafficData}
              dataKeys={['organic', 'paid', 'referral', 'social']}
              timeKey="day"
              theme={theme as any}
              width={400}
              height={300}
              unit="visits"
              seriesLabels={{
                organic: 'Organic',
                paid: 'Paid Ads',
                referral: 'Referral',
                social: 'Social',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamDashboard({ theme }: { theme: string }) {
  const t = themes[theme as keyof typeof themes];
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const teamMetrics = [
    { name: 'Alice', completed: 24, target: 30, color: t.colors[0] },
    { name: 'Bob', completed: 31, target: 30, color: t.colors[1] },
    { name: 'Carol', completed: 18, target: 25, color: t.colors[2] },
    { name: 'David', completed: 27, target: 30, color: t.colors[3] },
  ];

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ backgroundColor: t.bg }}>
      <div className="p-4 md:p-6 border-b border-border/50">
        <h3 className="text-lg font-semibold" style={{ color: t.text }}>Team Performance</h3>
        <p className="text-sm mt-1" style={{ color: t.textSecondary }}>Sprint progress and activity</p>
      </div>
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Team Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teamMetrics.map((member) => (
            <div key={member.name} className="p-4 rounded-lg text-center" style={{ backgroundColor: t.bgSecondary }}>
              <ProgressRing
                value={member.completed}
                max={member.target}
                size={80}
                strokeWidth={6}
                theme={theme as any}
                color={member.completed >= member.target ? '#22c55e' : member.color}
                format={(v, pct) => `${Math.round(pct)}%`}
              />
              <div className="mt-2 font-medium text-sm" style={{ color: t.text }}>{member.name}</div>
              <div className="text-xs" style={{ color: t.textSecondary }}>
                {member.completed}/{member.target} tasks
              </div>
            </div>
          ))}
        </div>

        {/* Sprint Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: t.bgSecondary }}>
            <div className="text-3xl font-bold" style={{ color: t.positive }}>100</div>
            <div className="text-xs mt-1" style={{ color: t.textSecondary }}>Completed</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: t.bgSecondary }}>
            <div className="text-3xl font-bold" style={{ color: t.accent }}>15</div>
            <div className="text-xs mt-1" style={{ color: t.textSecondary }}>In Progress</div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: t.bgSecondary }}>
            <div className="text-3xl font-bold" style={{ color: t.textMuted }}>8</div>
            <div className="text-xs mt-1" style={{ color: t.textSecondary }}>Blocked</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: t.textSecondary }}>Team Activity (6 months)</h4>
          <Heatmap
            data={heatmapData}
            theme={theme as any}
            weeks={26}
            format={(value, date) => `${value} contributions on ${date}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function ExamplesPage() {
  const { themeName } = useChartTheme();

  return (
    <DocsLayout showToc={false}>
      <h1 id="examples">Examples</h1>
      <p className="lead">
        Complete dashboard examples showing how to combine ChartKit components 
        for real-world applications. All dashboards use the currently selected theme.
      </p>

      <h2 id="monitoring-dashboard">Infrastructure Monitoring</h2>
      <p>
        Real-time system health dashboard with KPIs, gauges, and latency tracking.
        Features annotations to highlight SLA thresholds.
      </p>
      <div className="not-prose my-8">
        <MonitoringDashboard theme={themeName} />
      </div>

      <h2 id="sales-dashboard">Sales Analytics</h2>
      <p>
        Business intelligence dashboard combining revenue metrics, growth trends,
        marketing correlation analysis, and traffic source breakdown.
      </p>
      <div className="not-prose my-8">
        <SalesDashboard theme={themeName} />
      </div>

      <h2 id="team-dashboard">Team Performance</h2>
      <p>
        Sprint tracking dashboard with individual progress rings, task metrics,
        and contribution activity visualization.
      </p>
      <div className="not-prose my-8">
        <TeamDashboard theme={themeName} />
      </div>
    </DocsLayout>
  );
}
