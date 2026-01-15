'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { MonitorLine, ScatterChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';
import { useMemo } from 'react';

const referenceLineProps = [
  { name: 'type', type: '"line"', description: 'Annotation type', required: true },
  { name: 'value', type: 'number', description: 'Value on the axis', required: true },
  { name: 'axis', type: '"x" | "y"', description: 'Which axis to draw on', required: true },
  { name: 'color', type: 'string', description: 'Line color (defaults to theme accent)' },
  { name: 'strokeDasharray', type: 'string', default: '"4,4"', description: 'Line dash pattern' },
  { name: 'strokeWidth', type: 'number', default: '1', description: 'Line width' },
  { name: 'label', type: 'string', description: 'Optional label text' },
  { name: 'labelPosition', type: '"start" | "center" | "end"', default: '"start"', description: 'Label position' },
];

const referenceAreaProps = [
  { name: 'type', type: '"area"', description: 'Annotation type', required: true },
  { name: 'start', type: 'number', description: 'Start value', required: true },
  { name: 'end', type: 'number', description: 'End value', required: true },
  { name: 'axis', type: '"x" | "y"', description: 'Which axis to draw on', required: true },
  { name: 'color', type: 'string', description: 'Fill color (defaults to theme accent)' },
  { name: 'opacity', type: 'number', default: '0.1', description: 'Fill opacity' },
  { name: 'label', type: 'string', description: 'Optional label text' },
];

const generateData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency: 50 + Math.random() * 100 + (i > 12 && i < 18 ? 80 : 0),
  }));

const generateScatterData = () =>
  Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

export default function AnnotationsPage() {
  const { themeName, theme } = useChartTheme();
  const lineData = useMemo(() => generateData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);

  return (
    <DocsLayout>
      <h1 id="annotations">Annotations</h1>
      <p className="lead">
        Add reference lines and areas to highlight thresholds, targets, 
        safe ranges, or notable regions on your charts.
      </p>

      <h2 id="reference-lines">Reference Lines</h2>
      <p>Draw horizontal or vertical lines at specific values:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <MonitorLine
          data={lineData}
          series={[{ key: 'latency', label: 'Latency' }]}
          theme={themeName}
          width={650}
          height={300}
          unit="ms"
          annotations={[
            { type: 'line', value: 100, axis: 'y', label: 'Warning', color: '#f59e0b' },
            { type: 'line', value: 150, axis: 'y', label: 'Critical', color: '#ef4444' },
          ]}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<MonitorLine
  data={data}
  series={[{ key: 'latency', label: 'Latency' }]}
  theme="${themeName}"
  annotations={[
    { type: 'line', value: 100, axis: 'y', label: 'Warning', color: '#f59e0b' },
    { type: 'line', value: 150, axis: 'y', label: 'Critical', color: '#ef4444' },
  ]}
/>`}
      />

      <h2 id="reference-areas">Reference Areas</h2>
      <p>Highlight ranges with filled areas:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <MonitorLine
          data={lineData}
          series={[{ key: 'latency', label: 'Latency' }]}
          theme={themeName}
          width={650}
          height={300}
          unit="ms"
          annotations={[
            { type: 'area', start: 0, end: 80, axis: 'y', color: '#22c55e', opacity: 0.1, label: 'Normal' },
            { type: 'area', start: 80, end: 120, axis: 'y', color: '#f59e0b', opacity: 0.1 },
            { type: 'area', start: 120, end: 200, axis: 'y', color: '#ef4444', opacity: 0.1, label: 'Critical' },
          ]}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<MonitorLine
  data={data}
  series={[{ key: 'latency', label: 'Latency' }]}
  theme="${themeName}"
  annotations={[
    { type: 'area', start: 0, end: 80, axis: 'y', color: '#22c55e', opacity: 0.1, label: 'Normal' },
    { type: 'area', start: 80, end: 120, axis: 'y', color: '#f59e0b', opacity: 0.1 },
    { type: 'area', start: 120, end: 200, axis: 'y', color: '#ef4444', opacity: 0.1, label: 'Critical' },
  ]}
/>`}
      />

      <h2 id="combined">Lines + Areas</h2>
      <p>Combine lines and areas for comprehensive annotations:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ScatterChart
          data={scatterData}
          xKey="x"
          yKey="y"
          theme={themeName}
          width={600}
          height={400}
          annotations={[
            { type: 'area', start: 40, end: 60, axis: 'x', color: '#8b5cf6', opacity: 0.1 },
            { type: 'area', start: 40, end: 60, axis: 'y', color: '#8b5cf6', opacity: 0.1 },
            { type: 'line', value: 50, axis: 'x', color: '#8b5cf6', label: 'Center X' },
            { type: 'line', value: 50, axis: 'y', color: '#8b5cf6', label: 'Center Y' },
          ]}
        />
      </div>

      <h2 id="label-position">Label Positioning</h2>
      <p>Control where labels appear with <code>labelPosition</code>:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <MonitorLine
          data={lineData}
          series={[{ key: 'latency', label: 'Latency' }]}
          theme={themeName}
          width={650}
          height={300}
          unit="ms"
          annotations={[
            { type: 'line', value: 80, axis: 'y', label: 'Start (default)', labelPosition: 'start', color: theme.colors[0] },
            { type: 'line', value: 120, axis: 'y', label: 'Center', labelPosition: 'center', color: theme.colors[1] },
            { type: 'line', value: 160, axis: 'y', label: 'End', labelPosition: 'end', color: theme.colors[2] },
          ]}
        />
      </div>

      <h2 id="supported-charts">Supported Charts</h2>
      <p>Annotations are supported in the following chart components:</p>
      <ul>
        <li><code>MonitorLine</code> - via <code>annotations</code> prop</li>
        <li><code>BarChart</code> - via <code>annotations</code> prop</li>
        <li><code>ScatterChart</code> - via <code>annotations</code> prop</li>
        <li><code>ComboChart</code> - via <code>annotations</code> prop</li>
      </ul>

      <h2 id="reference-line-props">ReferenceLine Props</h2>
      <PropsTable props={referenceLineProps} />

      <h2 id="reference-area-props">ReferenceArea Props</h2>
      <PropsTable props={referenceAreaProps} />
    </DocsLayout>
  );
}
