'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ScatterChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateScatterData = () => {
  const regions = ['North', 'South', 'East', 'West'];
  return Array.from({ length: 50 }, (_, i) => ({
    price: Math.random() * 1000 + 100,
    quantity: Math.random() * 500 + 50,
    revenue: Math.random() * 50000 + 10000,
    region: regions[i % 4],
  }));
};

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'xKey', type: 'keyof T', description: 'Key for X-axis values', required: true },
  { name: 'yKey', type: 'keyof T', description: 'Key for Y-axis values', required: true },
  { name: 'sizeKey', type: 'keyof T', description: 'Key for bubble size (creates bubble chart)' },
  { name: 'categoryKey', type: 'keyof T', description: 'Key for categories (creates colored groups)' },
  { name: 'width', type: 'number', default: '500', description: 'Chart width' },
  { name: 'height', type: 'number', default: '400', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'xLabel', type: 'string', description: 'X-axis label' },
  { name: 'yLabel', type: 'string', description: 'Y-axis label' },
  { name: 'minSize', type: 'number', default: '6', description: 'Minimum point size' },
  { name: 'maxSize', type: 'number', default: '30', description: 'Maximum point size' },
  { name: 'opacity', type: 'number', default: '0.7', description: 'Point opacity' },
  { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show grid lines' },
  { name: 'formatX', type: '(value: number) => string', description: 'X-axis value formatter' },
  { name: 'formatY', type: '(value: number) => string', description: 'Y-axis value formatter' },
  { name: 'onPointClick', type: '(event: DataPointClickEvent) => void', description: 'Click handler for data points' },
  { name: 'renderTooltip', type: '(props: TooltipRenderProps) => ReactNode', description: 'Custom tooltip renderer' },
  { name: 'annotations', type: 'Annotation[]', description: 'Reference lines and areas' },
];

export default function ScatterChartPage() {
  const data = useMemo(() => generateScatterData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="scatter-chart">ScatterChart</h1>
      <p className="lead">
        Scatter plots for visualizing correlations between two variables. 
        Add a size dimension to create bubble charts, or categories for colored groupings.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="ScatterChart"
        defaultProps={{
          opacity: 0.7,
          showGrid: true,
          minSize: 6,
        }}
        aspectRatio={4 / 3}
        controls={[
          { label: 'opacity', type: 'number', min: 0.1, max: 1, step: 0.1 },
          { label: 'showGrid', type: 'boolean' },
          { label: 'minSize', type: 'number', min: 2, max: 20, step: 1 },
        ]}
        render={(p, dimensions) => (
          <ScatterChart
            data={data}
            xKey="price"
            yKey="quantity"
            theme={p.theme as any}
            width={dimensions?.width ?? 500}
            height={dimensions?.height ?? 400}
            xLabel="Price ($)"
            yLabel="Quantity"
            opacity={p.opacity as number}
            showGrid={p.showGrid as boolean}
            minSize={p.minSize as number}
          />
        )}
      />

      <h2 id="bubble-chart">Bubble Chart</h2>
      <p>Add a <code>sizeKey</code> to create a bubble chart where point size represents a third dimension:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ScatterChart
          data={data}
          xKey="price"
          yKey="quantity"
          sizeKey="revenue"
          theme={themeName}
          width={600}
          height={400}
          xLabel="Price ($)"
          yLabel="Quantity"
          formatX={(v) => `$${v.toFixed(0)}`}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<ScatterChart
  data={data}
  xKey="price"
  yKey="quantity"
  sizeKey="revenue"
  theme="${themeName}"
  xLabel="Price ($)"
  yLabel="Quantity"
/>`}
      />

      <h2 id="categories">Grouped by Category</h2>
      <p>Add a <code>categoryKey</code> to color points by category:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ScatterChart
          data={data}
          xKey="price"
          yKey="quantity"
          categoryKey="region"
          theme={themeName}
          width={600}
          height={400}
          xLabel="Price ($)"
          yLabel="Quantity"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<ScatterChart
  data={data}
  xKey="price"
  yKey="quantity"
  categoryKey="region"
  theme="${themeName}"
  xLabel="Price ($)"
  yLabel="Quantity"
/>`}
      />

      <h2 id="with-annotations">With Annotations</h2>
      <p>Add reference lines and areas to highlight thresholds:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ScatterChart
          data={data}
          xKey="price"
          yKey="quantity"
          theme={themeName}
          width={600}
          height={400}
          xLabel="Price ($)"
          yLabel="Quantity"
          annotations={[
            { type: 'line', value: 250, axis: 'y', label: 'Target', color: '#ef4444' },
            { type: 'area', start: 200, end: 300, axis: 'y', color: '#22c55e', opacity: 0.1 },
          ]}
        />
      </div>

      <h2 id="click-events">Click Events</h2>
      <p>Handle clicks on data points:</p>
      <CodeBlock
        language="tsx"
        code={`<ScatterChart
  data={data}
  xKey="price"
  yKey="quantity"
  theme="${themeName}"
  onPointClick={({ data, index, value }) => {
    console.log('Clicked point:', data, 'at index', index);
  }}
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
