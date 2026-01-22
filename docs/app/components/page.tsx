'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import {
  Sparkline,
  MiniArea,
  LineChart,
  StackedArea,
  BarChart,
  DonutChart,
  ScatterChart,
  ComboChart,
  Heatmap,
  SpikeChart,
  KpiCard,
  ProgressRing,
  GaugeChart,
  CandlestickChart,
} from '@derpdaderp/chartkit';
import { useMemo } from 'react';
import { useChartTheme } from '@/components/ChartThemeProvider';

// Generate sample data for various chart types
const generateSparkData = (count: number = 20) =>
  Array.from({ length: count }, () => ({ value: Math.random() * 100 }));

const generateLineData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i}:00`,
    value: 50 + Math.random() * 50 + Math.sin(i / 2) * 20,
    value2: 30 + Math.random() * 40 + Math.cos(i / 2) * 15,
  }));
};

const generateBarData = () => [
  { category: 'A', value: 65 },
  { category: 'B', value: 85 },
  { category: 'C', value: 45 },
  { category: 'D', value: 70 },
];

const generateDonutData = () => [
  { label: 'Direct', value: 40 },
  { label: 'Organic', value: 30 },
  { label: 'Referral', value: 20 },
  { label: 'Social', value: 10 },
];

const generateScatterData = () =>
  Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 5 + Math.random() * 10,
  }));

const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 56; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (55 - i));
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10),
    });
  }
  return data;
};

const generateSpikeData = () =>
  Array.from({ length: 30 }, (_, i) => ({
    time: `${i}`,
    value: Math.random() > 0.8 ? 50 + Math.random() * 50 : Math.random() * 20,
  }));

const generateCandlestickData = () => {
  let price = 100;
  return Array.from({ length: 15 }, (_, i) => {
    const open = price;
    const change = (Math.random() - 0.5) * 10;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    price = close;
    return { time: `${i + 1}`, open, high, low, close, volume: 1000 + Math.random() * 500 };
  });
};

const generateStackedData = () =>
  Array.from({ length: 8 }, (_, i) => ({
    time: `W${i + 1}`,
    direct: 20 + Math.random() * 30,
    organic: 15 + Math.random() * 25,
    referral: 10 + Math.random() * 20,
  }));

const generateComboData = () =>
  Array.from({ length: 8 }, (_, i) => ({
    time: `${i + 1}`,
    revenue: 40 + Math.random() * 40,
    orders: 20 + Math.random() * 30,
  }));

export default function ComponentsPage() {
  const sparkData = useMemo(() => generateSparkData(), []);
  const lineData = useMemo(() => generateLineData(), []);
  const barData = useMemo(() => generateBarData(), []);
  const donutData = useMemo(() => generateDonutData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const spikeData = useMemo(() => generateSpikeData(), []);
  const candlestickData = useMemo(() => generateCandlestickData(), []);
  const stackedData = useMemo(() => generateStackedData(), []);
  const comboData = useMemo(() => generateComboData(), []);
  const { themeName } = useChartTheme();

  const components = [
    // Time Series
    {
      name: 'Sparkline',
      href: '/components/sparkline',
      description: 'Minimal inline charts for showing trends at a glance.',
      category: 'Time Series',
      preview: <Sparkline data={sparkData} theme={themeName} width={120} height={40} />,
    },
    {
      name: 'MiniArea',
      href: '/components/mini-area',
      description: 'Small area charts with gradient fills.',
      category: 'Time Series',
      preview: <MiniArea data={sparkData} theme={themeName} width={120} height={40} />,
    },
    {
      name: 'LineChart',
      href: '/components/line-chart',
      description: 'Multi-series line charts with dual Y-axis, curve types, and area fills.',
      category: 'Time Series',
      preview: (
        <LineChart
          data={lineData}
          series={[{ key: 'value', label: 'Value', area: true }]}
          theme={themeName}
          width={140}
          height={70}
          showLegend={false}
          curve="monotone"
        />
      ),
    },
    {
      name: 'StackedArea',
      href: '/components/stacked-area',
      description: 'Stacked area charts for cumulative time series.',
      category: 'Time Series',
      preview: (
        <StackedArea
          data={stackedData}
          dataKeys={['direct', 'organic', 'referral']}
          theme={themeName}
          width={140}
          height={70}
        />
      ),
    },
    // Categorical
    {
      name: 'BarChart',
      href: '/components/bar-chart',
      description: 'Vertical/horizontal bars with grouping support.',
      category: 'Categorical',
      preview: (
        <BarChart
          data={barData}
          dataKey="value"
          categoryKey="category"
          theme={themeName}
          width={140}
          height={70}
        />
      ),
    },
    {
      name: 'DonutChart',
      href: '/components/donut-chart',
      description: 'Donut and pie charts for proportional data.',
      category: 'Categorical',
      preview: (
        <DonutChart
          data={donutData}
          dataKey="value"
          labelKey="label"
          theme={themeName}
          size={70}
          innerRadius={0.6}
          showLegend={false}
        />
      ),
    },
    // Correlation
    {
      name: 'ScatterChart',
      href: '/components/scatter-chart',
      description: 'Scatter plots and bubble charts for correlation analysis.',
      category: 'Correlation',
      preview: (
        <ScatterChart
          data={scatterData}
          xKey="x"
          yKey="y"
          theme={themeName}
          width={140}
          height={70}
        />
      ),
    },
    {
      name: 'ComboChart',
      href: '/components/combo-chart',
      description: 'Combined line, bar, and area charts with dual Y-axes.',
      category: 'Correlation',
      preview: (
        <ComboChart
          data={comboData}
          categoryKey="time"
          series={[
            { key: 'revenue', label: 'Revenue', type: 'bar' },
            { key: 'orders', label: 'Orders', type: 'line' },
          ]}
          theme={themeName}
          width={140}
          height={70}
        />
      ),
    },
    // Activity
    {
      name: 'Heatmap',
      href: '/components/heatmap',
      description: 'GitHub-style contribution/activity heatmaps.',
      category: 'Activity',
      preview: (
        <Heatmap
          data={heatmapData}
          theme={themeName}
          cellSize={6}
          cellGap={1}
        />
      ),
    },
    {
      name: 'SpikeChart',
      href: '/components/spike-chart',
      description: 'Event spike visualization with baseline.',
      category: 'Activity',
      preview: (
        <SpikeChart
          data={spikeData}
          theme={themeName}
          width={140}
          height={50}
        />
      ),
    },
    // KPI / Gauges
    {
      name: 'KpiCard',
      href: '/components/kpi-card',
      description: 'Metric cards with sparklines and delta indicators.',
      category: 'KPI & Gauges',
      preview: (
        <KpiCard
          label="Users"
          value={12847}
          delta={8.2}
          data={sparkData}
          theme={themeName}
          format={(v) => `${(v / 1000).toFixed(1)}K`}
        />
      ),
    },
    {
      name: 'ProgressRing',
      href: '/components/progress-ring',
      description: 'Circular progress indicators for goals and loading.',
      category: 'KPI & Gauges',
      preview: <ProgressRing value={72} size={60} strokeWidth={5} theme={themeName} />,
    },
    {
      name: 'GaugeChart',
      href: '/components/gauge-chart',
      description: 'Semicircular gauges for single metrics with targets.',
      category: 'KPI & Gauges',
      preview: (
        <GaugeChart
          value={68}
          theme={themeName}
          size={80}
        />
      ),
    },
    // Financial
    {
      name: 'CandlestickChart',
      href: '/components/candlestick-chart',
      description: 'OHLC candlestick charts for stocks and crypto with zoom/pan.',
      category: 'Financial',
      preview: (
        <CandlestickChart
          data={candlestickData}
          theme={themeName}
          width={140}
          height={70}
          enableZoom={false}
          showZoomControls={false}
        />
      ),
    },
  ];

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
            className="group p-5 rounded-lg border border-border bg-card hover:border-accent/50 transition-all hoverable"
          >
            <div className="h-20 mb-4 flex items-center justify-center bg-muted/30 rounded overflow-hidden">
              {component.preview}
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
