'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { SpikeChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

function generateSpikeData() {
  const data = [];
  const baseTime = new Date();
  baseTime.setHours(7, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const time = new Date(baseTime.getTime() + i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      value: Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0,
    });
  }
  return data;
}

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'dataKey', type: 'keyof T', default: '"value"', description: 'Key for values' },
  { name: 'timeKey', type: 'keyof T', default: '"time"', description: 'Key for time axis' },
  { name: 'width', type: 'number', default: '600', description: 'Chart width' },
  { name: 'height', type: 'number', default: '200', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'baselineColor', type: 'string', description: 'Override baseline color' },
  { name: 'label', type: 'string', default: '"Allowed Requests"', description: 'Tooltip label' },
];

export default function SpikeChartPage() {
  const data = useMemo(() => generateSpikeData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="spike-chart">SpikeChart</h1>
      <p className="lead">
        A chart for displaying discrete events or spikes over time, similar to Cloudflare&apos;s blocked requests visualization.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Visualize event spikes with a baseline reference:</p>

      <Playground
        name="SpikeChart"
        defaultProps={{
          label: 'Blocked Requests',
        }}
        aspectRatio={2.5}
        controls={[
          { label: 'label', type: 'string' },
        ]}
        render={(p, dimensions) => (
          <SpikeChart
            data={data}
            dataKey="value"
            timeKey="time"
            theme={p.theme as any}
            width={dimensions?.width ?? 700}
            height={dimensions?.height ?? 220}
            label={p.label as string}
          />
        )}
      />

      <h2 id="usage">Usage</h2>

      <CodeBlock
        language="tsx"
        code={`<SpikeChart
  data={eventData}
  dataKey="value"
  timeKey="time"
  theme="${themeName}"
  width={800}
  height={220}
  label="Blocked Requests"
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
