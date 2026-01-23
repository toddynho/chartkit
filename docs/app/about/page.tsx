import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Logo, Wordmark } from '@/components/Logo';
import { createMetadata, pageMetadata } from '@/lib/metadata';

export const metadata = createMetadata(pageMetadata.about);

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ck-bg)' }}>
      <Header />
      
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 
          className="text-4xl font-semibold mb-8 tracking-tight"
          style={{ color: 'var(--ck-text)' }}
        >
          About ChartKit
        </h1>
        
        <div className="space-y-6" style={{ color: 'var(--ck-text-muted)' }}>
          <p className="text-lg leading-relaxed">
            ChartKit is a React chart library built for developers who want beautiful, 
            production-ready charts without the complexity of larger visualization libraries.
          </p>
          
          <p className="text-lg leading-relaxed">
            The goal is simple: provide a set of chart components that look great out of 
            the box, are lightweight (~15KB), and require minimal configuration. No fighting 
            with styling, no hunting through documentation for basic customization.
          </p>
          
          <p className="text-lg leading-relaxed">
            Every component is designed to work seamlessly in modern dashboards and admin 
            panels, with built-in support for dark mode, responsive layouts, and smooth 
            interactions.
          </p>
          
          <h2 
            className="text-2xl font-semibold mt-12 mb-4"
            style={{ color: 'var(--ck-text)' }}
          >
            Built by
          </h2>
          
          <p className="text-lg leading-relaxed">
            ChartKit is created by{' '}
            <a
              href="https://x.com/toddo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              @toddo
            </a>
            , founder of{' '}
            <a
              href="https://buysellads.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              BuySellAds
            </a>
            .
          </p>
          
          <p className="text-lg leading-relaxed">
            BuySellAds has been helping publishers and creators monetize their websites 
            since 2008, processing over $500M in sponsorship revenue. We run{' '}
            <a
              href="https://carbonads.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              Carbon Ads
            </a>
            , serving billions of ad impressions on developer and design-focused websites.
          </p>
          
          <p className="text-lg leading-relaxed">
            ChartKit was born from building internal dashboards at BuySellAds. We needed 
            charts that were simple to use, looked professional, and didn't bloat our 
            bundle size. After years of using various charting libraries, we decided to 
            build exactly what we wanted.
          </p>
          
          <h2 
            className="text-2xl font-semibold mt-12 mb-4"
            style={{ color: 'var(--ck-text)' }}
          >
            Get in touch
          </h2>
          
          <p className="text-lg leading-relaxed">
            Have questions or feedback? Find me on{' '}
            <a
              href="https://x.com/toddo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              Twitter/X
            </a>
            {' '}or open an issue on{' '}
            <a
              href="https://github.com/toddynho/chartkit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ck-primary)' }}
            >
              GitHub
            </a>
            .
          </p>
          
          <div 
            className="mt-12 pt-8"
            style={{ borderTop: '1px solid var(--ck-border)' }}
          >
            <p style={{ color: 'var(--ck-text-muted)' }}>
              Thanks for using ChartKit.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid var(--ck-border)' }}>
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--ck-text-muted)' }}>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <Wordmark />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">
              Home
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
