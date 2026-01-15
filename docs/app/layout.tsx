import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ChartThemeProvider } from '@/components/ChartThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ChartKit',
    template: '%s | ChartKit',
  },
  description: 'Lightweight charting library for Next.js with beautiful, minimal charts inspired by monitoring dashboards.',
  keywords: ['react', 'charts', 'nextjs', 'sparkline', 'monitoring', 'dashboard', 'visualization'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ChartThemeProvider defaultTheme="sunset">
            {children}
          </ChartThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
