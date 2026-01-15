'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TableOfContents } from './TableOfContents';
import { cn } from '@/lib/utils';

interface DocsLayoutProps {
  children: React.ReactNode;
  showToc?: boolean;
}

export function DocsLayout({ children, showToc = true }: DocsLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background p-6 overflow-y-auto transition-transform md:sticky md:translate-x-0',
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <article className="prose prose-slate dark:prose-invert max-w-none">
              {children}
            </article>
          </div>
        </main>

        {/* Table of contents */}
        {showToc && (
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-14 p-6 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <TableOfContents />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
