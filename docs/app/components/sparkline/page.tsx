'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Sparkline } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateData = (count: number = 30) =>
  Array.from({ length: count }, () => ({ value: Math.random() * 100 }));

const props = [
  { name: 'data', type: 'T[] | number[]', description: 'Data array - can be objects or plain numbers', required: true },
  { name: 'dataKey', type: 'keyof T', default: '"value"', description: 'Key to extract numeric value when data contains objects' },
  { name: 'width', type: 'number', default: '120', description: 'Chart width in pixels' },
  { name: 'height', type: 'number', default: '32', description: 'Chart height in pixels' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'color', type: 'string', description: 'Override line color' },
  { name: 'glow', type: 'boolean', default: 'false', description: 'Enable glow effect on line' },
  { name: 'fill', type: 'boolean', default: 'false', description: 'Fill area under the line' },
  { name: 'strokeWidth', type: 'number', default: '1.5', description: 'Line stroke width' },
  { name: 'className', type: 'string', description: 'Additional CSS class' },
];

export default function SparklinePage() {
  const data = useMemo(() => generateData(), []);
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="sparkline">Sparkline</h1>
      <p className="lead">
        A minimal inline chart for showing trends at a glance. Perfect for dashboards,
        tables, and anywhere you need to visualize data trends in a compact space.
      </p>

      <h2 id="playground">Playground</h2>
      <p>
        Experiment with different props to see how the Sparkline component behaves.
        Use the theme switcher in the header to see it adapt to different themes.
      </p>

      <Playground
        name="Sparkline"
        defaultProps={{
          width: 200,
          height: 48,
          glow: false,
          fill: false,
          strokeWidth: 1.5,
        }}
        responsive={false}
        controls={[
          { label: 'width', type: 'number', min: 80, max: 400, step: 10 },
          { label: 'height', type: 'number', min: 20, max: 100, step: 4 },
          { label: 'glow', type: 'boolean' },
          { label: 'fill', type: 'boolean' },
          { label: 'strokeWidth', type: 'number', min: 0.5, max: 4, step: 0.5 },
        ]}
        render={(p) => (
          <Sparkline
            data={data}
            theme={p.theme as any}
            width={p.width as number}
            height={p.height as number}
            glow={p.glow as boolean}
            fill={p.fill as boolean}
            strokeWidth={p.strokeWidth as number}
          />
        )}
      />

      <h2 id="usage">Usage</h2>
      <p>Import the component and pass your data:</p>

      <CodeBlock
        language="tsx"
        code={`import { Sparkline } from '@derpdaderp/chartkit';

const data = [
  { value: 10 },
  { value: 25 },
  { value: 15 },
  { value: 30 },
  { value: 22 },
];

<Sparkline
  data={data}
  theme="${themeName}"
  width={120}
  height={32}
/>`}
      />

      <h2 id="with-plain-numbers">With Plain Numbers</h2>
      <p>You can also pass an array of plain numbers:</p>

      <CodeBlock
        language="tsx"
        code={`<Sparkline
  data={[10, 25, 15, 30, 22, 28, 35]}
  theme="${themeName}"
/>`}
      />

      <h2 id="with-glow-effect">With Glow Effect</h2>
      <p>Add a glow effect for a more dramatic visualization:</p>

      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <Sparkline
          data={data}
          theme={themeName}
          width={200}
          height={48}
          glow
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<Sparkline
  data={data}
  theme="${themeName}"
  glow
/>`}
      />

      <h2 id="with-area-fill">With Area Fill</h2>
      <p>Fill the area under the line for a more substantial look:</p>

      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <Sparkline
          data={data}
          theme={themeName}
          width={200}
          height={48}
          fill
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<Sparkline
  data={data}
  theme="${themeName}"
  fill
/>`}
      />

      <h2 id="custom-color">Custom Color</h2>
      <p>Override the default theme color:</p>

      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex gap-4 items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <Sparkline data={data} theme={themeName} width={120} height={32} color="#f472b6" />
        <Sparkline data={data} theme={themeName} width={120} height={32} color="#fb923c" />
        <Sparkline data={data} theme={themeName} width={120} height={32} color="#a78bfa" />
      </div>

      <CodeBlock
        language="tsx"
        code={`<Sparkline
  data={data}
  theme="${themeName}"
  color="#f472b6"
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
