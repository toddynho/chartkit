'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { BarChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateBarData = () => [
  { month: 'Jan', revenue: 65000, expenses: 42000 },
  { month: 'Feb', revenue: 78000, expenses: 48000 },
  { month: 'Mar', revenue: 92000, expenses: 55000 },
  { month: 'Apr', revenue: 85000, expenses: 52000 },
  { month: 'May', revenue: 105000, expenses: 61000 },
  { month: 'Jun', revenue: 120000, expenses: 68000 },
];

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'dataKey', type: 'keyof T | (keyof T)[]', description: 'Key(s) for bar values', required: true },
  { name: 'categoryKey', type: 'keyof T', description: 'Key for category axis', required: true },
  { name: 'width', type: 'number', default: '500', description: 'Chart width' },
  { name: 'height', type: 'number', default: '300', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'orientation', type: '"vertical" | "horizontal"', default: '"vertical"', description: 'Bar orientation' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show value labels' },
  { name: 'format', type: '(value: number) => string', description: 'Value formatter' },
  { name: 'barGap', type: 'number', default: '0.1', description: 'Gap between bars (0-1)' },
  { name: 'groupGap', type: 'number', default: '0.2', description: 'Gap between groups (0-1)' },
  { name: 'barRadius', type: 'number', default: '4', description: 'Bar border radius' },
];

export default function BarChartPage() {
  const data = useMemo(() => generateBarData(), []);
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="bar-chart">BarChart</h1>
      <p className="lead">
        Vertical and horizontal bar charts with support for single series, grouped bars, and stacked bars.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="BarChart"
        defaultProps={{
          orientation: 'vertical',
          showLabels: false,
          barRadius: 4,
        }}
        aspectRatio={16 / 9}
        controls={[
          { label: 'orientation', type: 'segment', options: [
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' },
          ]},
          { label: 'showLabels', type: 'boolean' },
          { label: 'barRadius', type: 'number', min: 0, max: 12, step: 1 },
        ]}
        render={(p, dimensions) => (
          <BarChart
            data={data}
            dataKey="revenue"
            categoryKey="month"
            theme={p.theme as any}
            width={dimensions?.width ?? 600}
            height={dimensions?.height ?? 300}
            orientation={p.orientation as 'vertical' | 'horizontal'}
            showLabels={p.showLabels as boolean}
            barRadius={p.barRadius as number}
            format={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
        )}
      />

      <h2 id="grouped-bars">Grouped Bars</h2>
      <p>Pass an array of keys to create grouped bars:</p>
      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <BarChart
          data={data}
          dataKey={['revenue', 'expenses']}
          categoryKey="month"
          theme={themeName}
          width={600}
          height={300}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<BarChart
  data={data}
  dataKey={['revenue', 'expenses']}
  categoryKey="month"
  theme="${themeName}"
/>`}
      />

      <h2 id="horizontal-bars">Horizontal Bars</h2>
      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <BarChart
          data={data.slice(0, 4)}
          dataKey="revenue"
          categoryKey="month"
          theme={themeName}
          orientation="horizontal"
          showLabels
          width={500}
          height={250}
          format={(v) => `$${(v / 1000).toFixed(0)}K`}
        />
      </div>

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
