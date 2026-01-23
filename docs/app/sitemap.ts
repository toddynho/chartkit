import { MetadataRoute } from 'next';

const BASE_URL = 'https://chartkit.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/getting-started', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/components', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/themes', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/hooks', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/utilities', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/examples', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/demo', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // Component pages
  const components = [
    'sparkline',
    'mini-area',
    'line-chart',
    'stacked-area',
    'bar-chart',
    'donut-chart',
    'scatter-chart',
    'combo-chart',
    'heatmap',
    'spike-chart',
    'kpi-card',
    'progress-ring',
    'gauge-chart',
    'candlestick-chart',
  ];

  // Utility pages
  const utilities = [
    'legend',
    'annotations',
    'responsive-chart',
  ];

  const componentPages = components.map((slug) => ({
    url: `/components/${slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }));

  const utilityPages = utilities.map((slug) => ({
    url: `/utilities/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }));

  const allPages = [...staticPages, ...componentPages, ...utilityPages];

  return allPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
