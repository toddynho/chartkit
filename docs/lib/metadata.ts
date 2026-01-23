import { Metadata } from 'next';

const BASE_URL = 'https://chartkit.dev';

export const siteConfig = {
  name: 'ChartKit',
  description: '14 chart types. 17 themes. Zero dependencies. ~15KB. Charts that don\'t weigh you down.',
  url: BASE_URL,
  ogImage: `${BASE_URL}/og.png`,
  twitter: '@toddo',
  github: 'https://github.com/toddynho/chartkit',
};

export function createMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ChartKit`,
      description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ChartKit`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ChartKit`,
      description,
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      images: [siteConfig.ogImage],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// Page-specific metadata configurations
export const pageMetadata = {
  home: {
    title: 'ChartKit - Lightweight charts for React & Next.js',
    description: 'Beautiful, lightweight React charts. 14 chart types, 17 themes, zero dependencies, ~15KB gzipped. Build stunning dashboards in minutes.',
    path: '',
  },
  gettingStarted: {
    title: 'Getting Started',
    description: 'Learn how to install and use ChartKit in your React or Next.js project. Get beautiful charts running in minutes.',
    path: '/getting-started',
  },
  components: {
    title: 'Components',
    description: 'Browse all 14 ChartKit components: LineChart, BarChart, DonutChart, Heatmap, KpiCard, Sparkline, and more.',
    path: '/components',
  },
  themes: {
    title: 'Themes',
    description: 'Explore 17 beautiful built-in themes for ChartKit. Dark and light themes inspired by Vercel, GitHub, Linear, and more.',
    path: '/themes',
  },
  hooks: {
    title: 'Hooks',
    description: 'ChartKit hooks for responsive charts, animations, and mouse tracking. useContainerWidth, useAnimatedMount, and more.',
    path: '/hooks',
  },
  utilities: {
    title: 'Utilities',
    description: 'ChartKit utility components: Legend, Annotations, and ResponsiveChart for building complete dashboards.',
    path: '/utilities',
  },
  examples: {
    title: 'Examples',
    description: 'Real-world examples and code snippets for ChartKit dashboards. Copy and paste ready-to-use chart configurations.',
    path: '/examples',
  },
  demo: {
    title: 'Live Demo',
    description: 'Interactive live demo of all ChartKit components. Try different themes and configurations in real-time.',
    path: '/demo',
  },
  about: {
    title: 'About',
    description: 'Learn about ChartKit, its philosophy, and the team behind it. Built for developers who care about performance and design.',
    path: '/about',
  },
} as const;

// Component metadata
export const componentMetadata: Record<string, { title: string; description: string }> = {
  'sparkline': {
    title: 'Sparkline',
    description: 'Tiny inline charts for KPIs and trends. Perfect for dashboards, tables, and compact data displays.',
  },
  'mini-area': {
    title: 'MiniArea',
    description: 'Compact area chart for showing trends. Ideal for KPI cards and dashboard widgets.',
  },
  'line-chart': {
    title: 'LineChart',
    description: 'Feature-rich line chart with dual Y-axis, multiple curve types, area fills, and interactive legends. Perfect for time series.',
  },
  'stacked-area': {
    title: 'StackedArea',
    description: 'Stacked area chart for showing composition over time. Great for visualizing part-to-whole relationships.',
  },
  'bar-chart': {
    title: 'BarChart',
    description: 'Horizontal and vertical bar charts with grouped and stacked variants. Ideal for categorical comparisons.',
  },
  'donut-chart': {
    title: 'DonutChart',
    description: 'Donut and pie charts with interactive segments and customizable center content. Perfect for composition data.',
  },
  'scatter-chart': {
    title: 'ScatterChart',
    description: 'Scatter plot for correlation analysis with optional trend lines and bubble sizing.',
  },
  'combo-chart': {
    title: 'ComboChart',
    description: 'Combine bars and lines in one chart. Great for comparing different metrics on the same timeline.',
  },
  'heatmap': {
    title: 'Heatmap',
    description: 'Grid-based heatmap for activity and density visualization. GitHub contribution graph style.',
  },
  'spike-chart': {
    title: 'SpikeChart',
    description: 'Spike chart for event and activity visualization. Perfect for showing discrete events over time.',
  },
  'kpi-card': {
    title: 'KpiCard',
    description: 'Key performance indicator card with sparkline, delta indicators, and customizable formatting.',
  },
  'progress-ring': {
    title: 'ProgressRing',
    description: 'Circular progress indicator with customizable size, thickness, and animations.',
  },
  'gauge-chart': {
    title: 'GaugeChart',
    description: 'Gauge chart for displaying single values within a range. Perfect for performance metrics and scores.',
  },
  'candlestick-chart': {
    title: 'CandlestickChart',
    description: 'Financial candlestick chart for OHLC data. Essential for stock and crypto trading dashboards.',
  },
};

// Utility metadata
export const utilityMetadata: Record<string, { title: string; description: string }> = {
  'legend': {
    title: 'Legend',
    description: 'Customizable chart legend component with interactive toggles and multiple layout options.',
  },
  'annotations': {
    title: 'Annotations',
    description: 'Add reference lines, areas, and markers to your charts. Perfect for highlighting thresholds and events.',
  },
  'responsive-chart': {
    title: 'ResponsiveChart',
    description: 'Wrapper component for creating responsive charts that adapt to container size.',
  },
};
