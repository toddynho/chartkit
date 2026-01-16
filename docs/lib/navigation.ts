export interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
  badge?: string;
}

export const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/getting-started',
  },
  {
    title: 'Components',
    href: '/components',
    items: [
      // Time Series
      { title: 'Sparkline', href: '/components/sparkline' },
      { title: 'MiniArea', href: '/components/mini-area' },
      { title: 'LineChart', href: '/components/line-chart' },
      { title: 'StackedArea', href: '/components/stacked-area' },
      // Categorical
      { title: 'BarChart', href: '/components/bar-chart' },
      { title: 'DonutChart', href: '/components/donut-chart' },
      // Correlation
      { title: 'ScatterChart', href: '/components/scatter-chart' },
      { title: 'ComboChart', href: '/components/combo-chart' },
      // Activity
      { title: 'Heatmap', href: '/components/heatmap' },
      { title: 'SpikeChart', href: '/components/spike-chart' },
      // KPI / Gauges
      { title: 'KpiCard', href: '/components/kpi-card' },
      { title: 'ProgressRing', href: '/components/progress-ring' },
      { title: 'GaugeChart', href: '/components/gauge-chart' },
    ],
  },
  {
    title: 'Utilities',
    href: '/utilities',
    items: [
      { title: 'Legend', href: '/utilities/legend' },
      { title: 'Annotations', href: '/utilities/annotations' },
      { title: 'ResponsiveChart', href: '/utilities/responsive-chart' },
    ],
  },
  {
    title: 'Themes',
    href: '/themes',
  },
  {
    title: 'Hooks',
    href: '/hooks',
  },
  {
    title: 'Examples',
    href: '/examples',
  },
];
