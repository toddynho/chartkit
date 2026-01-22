'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { KpiCard } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateData = (count: number = 20) =>
  Array.from({ length: count }, () => ({ value: Math.random() * 100 }));

const props = [
  { name: 'label', type: 'string', description: 'Label text displayed above the value', required: true },
  { name: 'value', type: 'number', description: 'Main KPI value', required: true },
  { name: 'delta', type: 'number', description: 'Percentage change (positive or negative)' },
  { name: 'data', type: 'T[] | number[]', description: 'Optional sparkline data' },
  { name: 'dataKey', type: 'keyof T', default: '"value"', description: 'Key to extract numeric value when data contains objects' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'format', type: '(value: number) => string', description: 'Custom value formatter' },
  { name: 'className', type: 'string', description: 'Additional CSS class' },
  { name: 'style', type: 'CSSProperties', description: 'Custom styles' },
  { name: 'children', type: 'ReactNode', description: 'Optional children to render below the sparkline' },
];

export default function KpiCardPage() {
  const data = useMemo(() => generateData(), []);
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="kpi-card">KpiCard</h1>
      <p className="lead">
        A card component for displaying key metrics with optional trend indicators
        and sparklines. Perfect for dashboard headers and summary sections.
      </p>

      <h2 id="playground">Playground</h2>
      <p>
        Experiment with different props to customize your KPI card:
      </p>

      <Playground
        name="KpiCard"
        defaultProps={{
          label: 'Revenue',
          value: 125000,
          delta: 12.5,
        }}
        responsive={false}
        controls={[
          { label: 'label', type: 'string' },
          { label: 'value', type: 'number', min: 0, max: 1000000, step: 1000 },
          { label: 'delta', type: 'number', min: -100, max: 100, step: 0.5 },
        ]}
        render={(p) => (
          <KpiCard
            label={p.label as string}
            value={p.value as number}
            delta={p.delta as number}
            data={data}
            theme={p.theme as any}
            format={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
        )}
      />

      <h2 id="usage">Usage</h2>
      <p>Import the component and configure your metric:</p>

      <CodeBlock
        language="tsx"
        code={`import { KpiCard } from '@derpdaderp/chartkit';

const revenueData = [
  { value: 95000 },
  { value: 102000 },
  { value: 98000 },
  { value: 125000 },
];

<KpiCard
  label="Revenue"
  value={125000}
  delta={12.5}
  data={revenueData}
  theme="${themeName}"
  format={(v) => \`$\${(v / 1000).toFixed(0)}K\`}
/>`}
      />

      <h2 id="without-sparkline">Without Sparkline</h2>
      <p>The sparkline is optional - just omit the data prop:</p>

      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <KpiCard
          label="Active Users"
          value={1234}
          delta={5.2}
          theme={themeName}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<KpiCard
  label="Active Users"
  value={1234}
  delta={5.2}
  theme="${themeName}"
/>`}
      />

      <h2 id="negative-delta">Negative Delta</h2>
      <p>Negative deltas are automatically styled in red:</p>

      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex gap-4 items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <KpiCard
          label="Bounce Rate"
          value={32.5}
          delta={-8.3}
          data={data}
          theme={themeName}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <KpiCard
          label="Load Time"
          value={1.2}
          delta={-15.7}
          data={data}
          theme={themeName}
          format={(v) => `${v.toFixed(1)}s`}
        />
      </div>

      <h2 id="custom-formatting">Custom Formatting</h2>
      <p>Use the format prop to customize how values are displayed:</p>

      <CodeBlock
        language="tsx"
        code={`// Currency
format={(v) => \`$\${v.toLocaleString()}\`}

// Percentage
format={(v) => \`\${v.toFixed(2)}%\`}

// Abbreviated
format={(v) => \`\${(v / 1000000).toFixed(2)}M\`}

// Duration
format={(v) => \`\${v}ms\`}`}
      />

      <h2 id="grid-layout">Grid Layout</h2>
      <p>KpiCards work great in grid layouts:</p>

      <div 
        className="not-prose my-6 p-6 rounded-lg border border-border transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Total Revenue"
            value={2780000}
            delta={12.5}
            data={data}
            theme={themeName}
            format={(v) => `$${(v / 1000000).toFixed(2)}M`}
          />
          <KpiCard
            label="Active Users"
            value={45230}
            delta={8.3}
            data={data}
            theme={themeName}
            format={(v) => v.toLocaleString()}
          />
          <KpiCard
            label="Conversion Rate"
            value={3.24}
            delta={-2.1}
            data={data}
            theme={themeName}
            format={(v) => `${v.toFixed(2)}%`}
          />
        </div>
      </div>

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
