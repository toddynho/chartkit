'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ResponsiveChart, LineChart, BarChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';
import { useMemo } from 'react';

const props = [
  { name: 'children', type: '(dimensions: { width: number; height: number }) => ReactNode', description: 'Render function receiving dimensions', required: true },
  { name: 'height', type: 'number', description: 'Fixed height in pixels' },
  { name: 'aspectRatio', type: 'number', description: 'Aspect ratio (width/height)' },
  { name: 'minHeight', type: 'number', default: '100', description: 'Minimum height in pixels' },
  { name: 'maxHeight', type: 'number', description: 'Maximum height in pixels' },
  { name: 'debounce', type: 'number', default: '100', description: 'Resize debounce in ms' },
  { name: 'className', type: 'string', description: 'Additional CSS class' },
  { name: 'style', type: 'CSSProperties', description: 'Additional styles' },
];

const generateLineData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    p50: 20 + Math.random() * 30,
    p99: 80 + Math.random() * 40,
  }));

const generateBarData = () => [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 78000 },
  { month: 'Mar', revenue: 92000 },
  { month: 'Apr', revenue: 85000 },
  { month: 'May', revenue: 105000 },
  { month: 'Jun', revenue: 120000 },
];

export default function ResponsiveChartPage() {
  const { themeName, theme } = useChartTheme();
  const lineData = useMemo(() => generateLineData(), []);
  const barData = useMemo(() => generateBarData(), []);

  return (
    <DocsLayout>
      <h1 id="responsive-chart">ResponsiveChart</h1>
      <p className="lead">
        A wrapper component that provides responsive sizing for charts, 
        automatically measuring container width and calculating height.
      </p>

      <h2 id="basic">Basic Usage</h2>
      <p>
        Wrap your chart in <code>ResponsiveChart</code> and use the render function 
        to receive the calculated dimensions:
      </p>
      <div className="not-prose my-6 rounded-lg border border-border overflow-hidden">
        <ResponsiveChart aspectRatio={16 / 9}>
          {({ width, height }) => (
            <LineChart
              data={lineData}
              series={[
                { key: 'p50', label: 'p50' },
                { key: 'p99', label: 'p99' },
              ]}
              theme={themeName}
              width={width}
              height={height}
              unit="ms"
            />
          )}
        </ResponsiveChart>
      </div>

      <CodeBlock
        language="tsx"
        code={`import { ResponsiveChart, LineChart } from '@derpdaderp/chartkit';

<ResponsiveChart aspectRatio={16 / 9}>
  {({ width, height }) => (
    <LineChart
      data={data}
      series={series}
      theme="${themeName}"
      width={width}
      height={height}
    />
  )}
</ResponsiveChart>`}
      />

      <h2 id="aspect-ratio">Aspect Ratio</h2>
      <p>
        Use <code>aspectRatio</code> to maintain proportions. The chart will fill 
        the container width and calculate height based on the ratio:
      </p>
      <div className="not-prose my-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="text-xs text-muted-foreground p-2 border-b border-border">16:9</div>
          <ResponsiveChart aspectRatio={16 / 9}>
            {({ width, height }) => (
              <BarChart
                data={barData}
                dataKey="revenue"
                categoryKey="month"
                theme={themeName}
                width={width}
                height={height}
              />
            )}
          </ResponsiveChart>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="text-xs text-muted-foreground p-2 border-b border-border">4:3</div>
          <ResponsiveChart aspectRatio={4 / 3}>
            {({ width, height }) => (
              <BarChart
                data={barData}
                dataKey="revenue"
                categoryKey="month"
                theme={themeName}
                width={width}
                height={height}
              />
            )}
          </ResponsiveChart>
        </div>
      </div>

      <h2 id="fixed-height">Fixed Height</h2>
      <p>
        Use <code>height</code> for a fixed pixel height while still getting responsive width:
      </p>
      <div className="not-prose my-6 rounded-lg border border-border overflow-hidden">
        <ResponsiveChart height={250}>
          {({ width, height }) => (
            <LineChart
              data={lineData}
              series={[
                { key: 'p50', label: 'p50' },
                { key: 'p99', label: 'p99' },
              ]}
              theme={themeName}
              width={width}
              height={height}
              unit="ms"
            />
          )}
        </ResponsiveChart>
      </div>

      <CodeBlock
        language="tsx"
        code={`<ResponsiveChart height={250}>
  {({ width, height }) => (
    <LineChart
      data={data}
      series={series}
      theme="${themeName}"
      width={width}
      height={height}
    />
  )}
</ResponsiveChart>`}
      />

      <h2 id="min-max-height">Min/Max Height</h2>
      <p>
        Constrain the calculated height with <code>minHeight</code> and <code>maxHeight</code>:
      </p>
      <CodeBlock
        language="tsx"
        code={`<ResponsiveChart 
  aspectRatio={16 / 9} 
  minHeight={200} 
  maxHeight={500}
>
  {({ width, height }) => (
    <LineChart
      data={data}
      series={series}
      theme="${themeName}"
      width={width}
      height={height}
    />
  )}
</ResponsiveChart>`}
      />

      <h2 id="debounce">Resize Debounce</h2>
      <p>
        Control how quickly the chart responds to window resizes with <code>debounce</code>:
      </p>
      <CodeBlock
        language="tsx"
        code={`// Fast response (less smooth)
<ResponsiveChart aspectRatio={16 / 9} debounce={50}>
  ...
</ResponsiveChart>

// Slower response (smoother)
<ResponsiveChart aspectRatio={16 / 9} debounce={200}>
  ...
</ResponsiveChart>`}
      />

      <h2 id="full-container">Full Container</h2>
      <p>
        When neither <code>height</code> nor <code>aspectRatio</code> is provided, 
        the chart will fill 100% of its container:
      </p>
      <CodeBlock
        language="tsx"
        code={`<div style={{ height: '400px' }}>
  <ResponsiveChart>
    {({ width, height }) => (
      <LineChart
        data={data}
        series={series}
        theme="${themeName}"
        width={width}
        height={height}
      />
    )}
  </ResponsiveChart>
</div>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
