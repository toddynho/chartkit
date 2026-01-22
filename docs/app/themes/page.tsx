'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { themes, type ThemeName } from '@derpdaderp/chartkit';

const themeNames = Object.keys(themes) as ThemeName[];

export default function ThemesPage() {
  return (
    <DocsLayout>
      <h1 id="themes">Themes</h1>
      <p className="lead">
        ChartKit comes with 17 built-in themes — 13 dark and 4 light — inspired by popular developer tools and color schemes.
      </p>

      <h2 id="available-themes">Available Themes</h2>
      <div className="not-prose grid gap-6 my-8">
        {themeNames.map((name) => {
          const t = themes[name];
          return (
            <div key={name} className="rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-card">
                <h3 className="font-semibold">{t.name}</h3>
                <code className="text-sm text-muted-foreground">theme=&quot;{name}&quot;</code>
              </div>
              <div className="p-6" style={{ backgroundColor: t.bg }}>
                <div className="flex flex-wrap gap-3 mb-4">
                  {t.colors.map((color, i) => (
                    <div key={i} className="text-center">
                      <div
                        className="w-10 h-10 rounded-lg mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono" style={{ color: t.textMuted }}>
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <div className="mb-1" style={{ color: t.textSecondary }}>bg</div>
                    <div style={{ color: t.text }}>{t.bg}</div>
                  </div>
                  <div>
                    <div className="mb-1" style={{ color: t.textSecondary }}>text</div>
                    <div style={{ color: t.text }}>{t.text}</div>
                  </div>
                  <div>
                    <div className="mb-1" style={{ color: t.textSecondary }}>accent</div>
                    <div style={{ color: t.accent }}>{t.accent}</div>
                  </div>
                  <div>
                    <div className="mb-1" style={{ color: t.textSecondary }}>positive/negative</div>
                    <div>
                      <span style={{ color: t.positive }}>{t.positive}</span>
                      {' / '}
                      <span style={{ color: t.negative }}>{t.negative}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 id="using-themes">Using Themes</h2>
      <p>Pass the theme name to any component:</p>
      <CodeBlock
        language="tsx"
        code={`<Sparkline data={data} theme="midnight" />
<KpiCard data={data} theme="mono" />
<LineChart data={data} theme="slate" />`}
      />

      <h2 id="accessing-theme-colors">Accessing Theme Colors</h2>
      <p>Import the themes object to access colors directly:</p>
      <CodeBlock
        language="tsx"
        code={`import { themes } from '@derpdaderp/chartkit';

const t = themes['midnight'];

// Use in your components
<div style={{ backgroundColor: t.bg, color: t.text }}>
  <span style={{ color: t.positive }}>+12.5%</span>
</div>`}
      />

      <h2 id="theme-structure">Theme Structure</h2>
      <p>Each theme provides these color properties:</p>
      <CodeBlock
        language="tsx"
        code={`interface ChartTheme {
  name: string;           // Display name
  bg: string;             // Primary background
  bgSecondary: string;    // Secondary background
  bgCard: string;         // Card background
  text: string;           // Primary text
  textSecondary: string;  // Secondary text
  textMuted: string;      // Muted text
  border: string;         // Border color
  gridLine: string;       // Grid line color
  colors: string[];       // Chart series colors (5)
  accent: string;         // Accent color
  positive: string;       // Success/positive color
  negative: string;       // Error/negative color
  baseline?: string;      // Optional baseline color
}`}
      />
    </DocsLayout>
  );
}
