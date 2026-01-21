import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ChartThemeProvider } from '@/components/ChartThemeProvider';
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
  title: {
    default: 'ChartKit - Lightweight charts for React & Next.js',
    template: '%s | ChartKit',
  },
  description: '14 chart types. 17 themes. Zero dependencies. ~15KB. Charts that don\'t weigh you down.',
  keywords: ['react', 'charts', 'nextjs', 'sparkline', 'monitoring', 'dashboard', 'visualization', 'typescript'],
  openGraph: {
    title: 'ChartKit - Lightweight charts for React & Next.js',
    description: '14 chart types. 17 themes. Zero dependencies. ~15KB.',
    url: 'https://chartkit.dev',
    siteName: 'ChartKit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChartKit - Lightweight charts for React & Next.js',
    description: '14 chart types. 17 themes. Zero dependencies. ~15KB.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
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
      </body>
    </html>
  );
}
