import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ChartThemeProvider } from '@/components/ChartThemeProvider';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/lib/metadata';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'ChartKit - Lightweight charts for React & Next.js',
    template: '%s | ChartKit',
  },
  description: 'Beautiful, lightweight React charts. 14 chart types, 17 themes, zero dependencies, ~15KB gzipped. Build stunning dashboards in minutes.',
  keywords: [
    'react charts',
    'react charting library',
    'nextjs charts',
    'typescript charts',
    'dashboard components',
    'data visualization',
    'sparkline',
    'line chart',
    'bar chart',
    'donut chart',
    'kpi dashboard',
    'lightweight charts',
  ],
  authors: [{ name: 'Todd Garland', url: 'https://x.com/toddo' }],
  creator: 'Todd Garland',
  publisher: 'ChartKit',
  openGraph: {
    title: 'ChartKit - Lightweight charts for React & Next.js',
    description: 'Beautiful, lightweight React charts. 14 chart types, 17 themes, zero dependencies, ~15KB gzipped.',
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'ChartKit - Lightweight charts for React & Next.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChartKit - Lightweight charts for React & Next.js',
    description: 'Beautiful, lightweight React charts. 14 chart types, 17 themes, zero dependencies, ~15KB gzipped.',
    site: siteConfig.twitter,
    creator: siteConfig.twitter,
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'ai:llms': '/llms.txt',
    'ai:llms-full': '/llms-full.txt',
    'ai:llms-json': '/llms.json',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <JsonLd />
        {/* AI/LLM Discovery Links */}
        <link rel="ai-resource" href="/llms.txt" title="LLM Context (Summary)" />
        <link rel="ai-resource" href="/llms-full.txt" title="LLM Context (Full API)" />
        <link rel="ai-resource" href="/llms.json" title="LLM Context (JSON)" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Context" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChartThemeProvider defaultTheme="midnight">
            {children}
          </ChartThemeProvider>
        </ThemeProvider>
        <Script
          id="fullres-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var fullres = document.createElement('script');
                fullres.async = true;
                fullres.src = 'https://t.fullres.net/chartkit.js?'+(new Date()-new Date()%43200000);
                document.head.appendChild(fullres);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
