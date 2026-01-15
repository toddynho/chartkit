'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DocsLayout } from '@/components/layout/DocsLayout';

const utilities = [
  {
    name: 'Legend',
    href: '/utilities/legend',
    description: 'Standalone legend component for custom chart layouts.',
    isNew: true,
  },
  {
    name: 'Annotations',
    href: '/utilities/annotations',
    description: 'Reference lines and areas to highlight thresholds and ranges.',
    isNew: true,
  },
  {
    name: 'ResponsiveChart',
    href: '/utilities/responsive-chart',
    description: 'Wrapper component for responsive chart sizing.',
  },
];

export default function UtilitiesPage() {
  return (
    <DocsLayout showToc={false}>
      <h1 id="utilities">Utilities</h1>
      <p className="lead">
        Helper components for building custom chart layouts, adding annotations, 
        and handling responsive sizing.
      </p>

      <div className="not-prose grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {utilities.map((utility) => (
          <Link
            key={utility.name}
            href={utility.href}
            className="group p-5 rounded-lg border border-border bg-card hover:border-accent/50 transition-all relative"
          >
            {utility.isNew && (
              <span className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                New
              </span>
            )}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold group-hover:text-accent transition-colors">
                {utility.name}
              </h3>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground">{utility.description}</p>
          </Link>
        ))}
      </div>
    </DocsLayout>
  );
}
