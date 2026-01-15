'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { GaugeChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const props = [
  { name: 'value', type: 'number', description: 'Current value', required: true },
  { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
  { name: 'size', type: 'number', default: '200', description: 'Chart diameter in pixels' },
  { name: 'strokeWidth', type: 'number', default: '16', description: 'Arc stroke width' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'startAngle', type: 'number', default: '-135', description: 'Arc start angle (0 = top)' },
  { name: 'endAngle', type: 'number', default: '135', description: 'Arc end angle' },
  { name: 'ranges', type: '{ min: number; max: number; color: string }[]', description: 'Color ranges for different values' },
  { name: 'target', type: 'number', description: 'Target value to show marker' },
  { name: 'showTicks', type: 'boolean', default: 'true', description: 'Show tick marks' },
  { name: 'tickCount', type: 'number', default: '5', description: 'Number of tick marks' },
  { name: 'showTickLabels', type: 'boolean', default: 'true', description: 'Show value labels on ticks' },
  { name: 'format', type: '(value: number) => string', description: 'Value formatter' },
  { name: 'label', type: 'string', description: 'Label below the value' },
  { name: 'children', type: 'ReactNode', description: 'Custom center content' },
];

export default function GaugeChartPage() {
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="gauge-chart">GaugeChart</h1>
      <p className="lead">
        Semicircular gauge charts for displaying single metrics with optional 
        color ranges and target markers.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="GaugeChart"
        defaultProps={{
          value: 72,
          size: 220,
          strokeWidth: 16,
          showTicks: true,
          showTickLabels: true,
        }}
        aspectRatio={4 / 3}
        controls={[
          { label: 'value', type: 'number', min: 0, max: 100, step: 1 },
          { label: 'size', type: 'number', min: 150, max: 300, step: 10 },
          { label: 'strokeWidth', type: 'number', min: 8, max: 30, step: 2 },
          { label: 'showTicks', type: 'boolean' },
          { label: 'showTickLabels', type: 'boolean' },
        ]}
        render={(p) => (
          <div className="flex items-center justify-center w-full h-full">
            <GaugeChart
              value={p.value as number}
              size={p.size as number}
              strokeWidth={p.strokeWidth as number}
              showTicks={p.showTicks as boolean}
              showTickLabels={p.showTickLabels as boolean}
              theme={p.theme as any}
              label="Score"
            />
          </div>
        )}
      />

      <h2 id="basic">Basic Usage</h2>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center">
        <GaugeChart
          value={72}
          theme={themeName}
          label="Performance"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<GaugeChart
  value={72}
  theme="${themeName}"
  label="Performance"
/>`}
      />

      <h2 id="color-ranges">Color Ranges</h2>
      <p>Define color ranges for different value thresholds:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <GaugeChart
          value={25}
          theme={themeName}
          ranges={[
            { min: 0, max: 30, color: '#ef4444' },
            { min: 30, max: 70, color: '#f59e0b' },
            { min: 70, max: 100, color: '#22c55e' },
          ]}
          label="Low"
        />
        <GaugeChart
          value={55}
          theme={themeName}
          ranges={[
            { min: 0, max: 30, color: '#ef4444' },
            { min: 30, max: 70, color: '#f59e0b' },
            { min: 70, max: 100, color: '#22c55e' },
          ]}
          label="Medium"
        />
        <GaugeChart
          value={85}
          theme={themeName}
          ranges={[
            { min: 0, max: 30, color: '#ef4444' },
            { min: 30, max: 70, color: '#f59e0b' },
            { min: 70, max: 100, color: '#22c55e' },
          ]}
          label="High"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<GaugeChart
  value={85}
  theme="${themeName}"
  ranges={[
    { min: 0, max: 30, color: '#ef4444' },
    { min: 30, max: 70, color: '#f59e0b' },
    { min: 70, max: 100, color: '#22c55e' },
  ]}
  label="Score"
/>`}
      />

      <h2 id="target-marker">With Target Marker</h2>
      <p>Add a <code>target</code> prop to show a goal marker on the gauge:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center">
        <GaugeChart
          value={68}
          target={80}
          theme={themeName}
          ranges={[
            { min: 0, max: 50, color: '#ef4444' },
            { min: 50, max: 80, color: '#f59e0b' },
            { min: 80, max: 100, color: '#22c55e' },
          ]}
          label="Progress to Goal"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<GaugeChart
  value={68}
  target={80}
  theme="${themeName}"
  ranges={[
    { min: 0, max: 50, color: '#ef4444' },
    { min: 50, max: 80, color: '#f59e0b' },
    { min: 80, max: 100, color: '#22c55e' },
  ]}
  label="Progress to Goal"
/>`}
      />

      <h2 id="custom-range">Custom Value Range</h2>
      <p>Use <code>min</code> and <code>max</code> for non-percentage values:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <GaugeChart
          value={42}
          min={0}
          max={60}
          theme={themeName}
          format={(v) => `${v}mph`}
          label="Wind Speed"
        />
        <GaugeChart
          value={78}
          min={32}
          max={120}
          theme={themeName}
          format={(v) => `${v}°F`}
          label="Temperature"
        />
      </div>

      <h2 id="sizes">Different Sizes</h2>
      <p>Adjust the <code>size</code> prop for different visual footprints:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-end gap-4">
        <GaugeChart
          value={75}
          size={120}
          strokeWidth={10}
          theme={themeName}
          showTickLabels={false}
        />
        <GaugeChart
          value={75}
          size={180}
          strokeWidth={14}
          theme={themeName}
        />
        <GaugeChart
          value={75}
          size={240}
          strokeWidth={18}
          theme={themeName}
          label="Performance"
        />
      </div>

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
