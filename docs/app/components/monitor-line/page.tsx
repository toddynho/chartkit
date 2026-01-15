'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { MonitorLine } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

function generateMultiSeriesData() {
  const data = [];
  const times = ['09:00', '12:00', '15:00', '18:00', '21:00', '00:00', '03:00', '06:00'];

  for (let i = 0; i < 60; i++) {
    const timeIndex = Math.floor(i / 8);
    const base = 1.5;

    data.push({
      time: times[timeIndex] || '08:00',
      p50: base + Math.random() * 0.3,
      p95: base + 0.5 + Math.random() * 0.8,
      p99: base + 1.2 + Math.random() * 1.5,
    });
  }
  return data;
}

const props = [
  { name: 'data', type: 'T[]', description: 'Data array with time and series values', required: true },
  { name: 'series', type: 'SeriesConfig[]', description: 'Series configuration (optional if using dataKey)' },
  { name: 'dataKey', type: 'keyof T', description: 'Single series data key (simplified API)' },
  { name: 'label', type: 'string', description: 'Label for single series (used with dataKey)' },
  { name: 'width', type: 'number', default: '600', description: 'Chart width (ignored if responsive=true)' },
  { name: 'height', type: 'number', default: '260', description: 'Chart height in pixels' },
  { name: 'responsive', type: 'boolean', default: 'false', description: 'Auto-fill container width' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'timeKey', type: 'keyof T', default: '"time"', description: 'Key for time/x-axis values' },
  { name: 'unit', type: 'string', default: '"ms"', description: 'Unit label for values' },
  { name: 'glow', type: 'boolean', default: 'false', description: 'Enable glow effect on lines' },
  { name: 'grid', type: 'GridOptions | boolean', default: 'true', description: 'Grid line configuration' },
  { name: 'className', type: 'string', description: 'Additional CSS class' },
  { name: 'style', type: 'CSSProperties', description: 'Custom styles for container' },
];

const seriesConfigProps = [
  { name: 'key', type: 'string', description: 'Unique key matching data property', required: true },
  { name: 'label', type: 'string', description: 'Display label', required: true },
  { name: 'displayValue', type: 'string', description: 'Current/summary value shown in legend badge' },
];

export default function MonitorLinePage() {
  const data = useMemo(() => generateMultiSeriesData(), []);
  const { themeName, theme } = useChartTheme();

  const series = [
    { key: 'p50', label: 'p50', displayValue: '1.8 ms' },
    { key: 'p95', label: 'p95', displayValue: '2.3 ms' },
    { key: 'p99', label: 'p99', displayValue: '3.5 ms' },
  ];

  return (
    <DocsLayout>
      <h1 id="monitor-line">MonitorLine</h1>
      <p className="lead">
        A multi-series line chart with interactive legend toggles, smooth tooltip
        tracking, and optional glow effects. Inspired by monitoring dashboards like
        Turso and Datadog.
      </p>

      <h2 id="playground">Playground</h2>
      <p>
        Click the legend badges to toggle series visibility. Hover over the chart
        to see interpolated values at any point. Toggle the glow effect and adjust settings below.
      </p>

      <Playground
        name="MonitorLine"
        defaultProps={{
          glow: false,
          unit: 'ms',
        }}
        aspectRatio={16 / 9}
        controls={[
          { label: 'glow', type: 'boolean' },
          { label: 'unit', type: 'select', options: [
            { label: 'ms', value: 'ms' },
            { label: 's', value: 's' },
            { label: '%', value: '%' },
          ]},
        ]}
        render={(p, dimensions) => (
          <MonitorLine
            data={data}
            series={series}
            theme={p.theme as any}
            width={dimensions?.width ?? 700}
            height={dimensions?.height ?? 300}
            glow={p.glow as boolean}
            unit={p.unit as string}
            padding={16}
          />
        )}
      />

      <h2 id="usage">Usage</h2>
      <p>Import the component and configure your series:</p>

      <CodeBlock
        language="tsx"
        code={`import { MonitorLine } from '@derpdaderp/chartkit';

const data = [
  { time: '09:00', p50: 1.5, p95: 2.1, p99: 3.2 },
  { time: '10:00', p50: 1.8, p95: 2.4, p99: 3.8 },
  { time: '11:00', p50: 1.6, p95: 2.2, p99: 3.5 },
  // ...more data points
];

const series = [
  { key: 'p50', label: 'p50', displayValue: '1.8 ms' },
  { key: 'p95', label: 'p95', displayValue: '2.3 ms' },
  { key: 'p99', label: 'p99', displayValue: '3.5 ms' },
];

<MonitorLine
  data={data}
  series={series}
  theme="${themeName}"
  width={600}
  height={260}
  unit="ms"
/>`}
      />

      <h2 id="with-glow">With Glow Effect</h2>
      <p>Enable the glow effect for a more dramatic look:</p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <MonitorLine
          data={data}
          series={series}
          theme={themeName}
          width={800}
          height={300}
          unit="ms"
          glow
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<MonitorLine
  data={data}
  series={series}
  theme="${themeName}"
  glow
/>`}
      />

      <h2 id="responsive">Responsive Width</h2>
      <p>
        Use the <code>responsive</code> prop to automatically fill the container width:
      </p>

      <CodeBlock
        language="tsx"
        code={`<MonitorLine
  data={data}
  series={series}
  theme="${themeName}"
  responsive
  height={300}
/>`}
      />

      <h2 id="single-series">Single Series (Simplified API)</h2>
      <p>
        For single-series charts, use <code>dataKey</code> and <code>label</code> instead of the <code>series</code> array:
      </p>

      <CodeBlock
        language="tsx"
        code={`// Instead of series={[{ key: 'connections', label: 'Active Connections' }]}
<MonitorLine
  data={data}
  dataKey="connections"
  label="Active Connections"
  theme="${themeName}"
  responsive
/>`}
      />

      <h2 id="grid-options">Grid Customization</h2>
      <p>
        Customize the grid lines with the <code>grid</code> prop:
      </p>

      <CodeBlock
        language="tsx"
        code={`<MonitorLine
  data={data}
  series={series}
  theme="${themeName}"
  grid={{
    horizontal: true,
    vertical: false,
    strokeDasharray: "3 3",
    color: "rgba(255,255,255,0.1)",
  }}
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />

      <h2 id="series-config">SeriesConfig</h2>
      <p>Each series is configured with the following properties:</p>
      <PropsTable props={seriesConfigProps} />
    </DocsLayout>
  );
}
