'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ProgressRing } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const props = [
  { name: 'value', type: 'number', description: 'Current value', required: true },
  { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
  { name: 'size', type: 'number', default: '120', description: 'Ring diameter in pixels' },
  { name: 'strokeWidth', type: 'number', default: '8', description: 'Ring stroke width' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'color', type: 'string', description: 'Custom progress color (overrides theme)' },
  { name: 'trackColor', type: 'string', description: 'Background track color' },
  { name: 'showValue', type: 'boolean', default: 'true', description: 'Show percentage text' },
  { name: 'format', type: '(value: number, percentage: number) => string', description: 'Custom value formatter' },
  { name: 'children', type: 'ReactNode', description: 'Custom center content' },
  { name: 'animationDuration', type: 'number', default: '500', description: 'Animation duration in ms' },
  { name: 'strokeLinecap', type: '"butt" | "round" | "square"', default: '"round"', description: 'Stroke end style' },
];

export default function ProgressRingPage() {
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="progress-ring">ProgressRing</h1>
      <p className="lead">
        Circular progress indicators for displaying completion percentages, 
        loading states, or goal progress.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="ProgressRing"
        defaultProps={{
          value: 72,
          size: 150,
          strokeWidth: 10,
          showValue: true,
        }}
        aspectRatio={1}
        controls={[
          { label: 'value', type: 'number', min: 0, max: 100, step: 1 },
          { label: 'size', type: 'number', min: 60, max: 200, step: 10 },
          { label: 'strokeWidth', type: 'number', min: 2, max: 20, step: 1 },
          { label: 'showValue', type: 'boolean' },
        ]}
        render={(p) => (
          <div className="flex items-center justify-center w-full h-full">
            <ProgressRing
              value={p.value as number}
              size={p.size as number}
              strokeWidth={p.strokeWidth as number}
              showValue={p.showValue as boolean}
              theme={p.theme as any}
            />
          </div>
        )}
      />

      <h2 id="basic">Basic Usage</h2>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <ProgressRing value={25} theme={themeName} />
        <ProgressRing value={50} theme={themeName} />
        <ProgressRing value={75} theme={themeName} />
        <ProgressRing value={100} theme={themeName} />
      </div>

      <CodeBlock
        language="tsx"
        code={`<ProgressRing value={75} theme="${themeName}" />`}
      />

      <h2 id="custom-range">Custom Range</h2>
      <p>Use <code>min</code> and <code>max</code> to define custom value ranges:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <ProgressRing
          value={750}
          min={0}
          max={1000}
          theme={themeName}
          format={(v) => `${v}`}
        />
        <ProgressRing
          value={3.5}
          min={0}
          max={5}
          theme={themeName}
          format={(v, pct) => `${v}/5`}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<ProgressRing
  value={750}
  min={0}
  max={1000}
  theme="${themeName}"
  format={(v) => \`\${v}\`}
/>`}
      />

      <h2 id="custom-content">Custom Center Content</h2>
      <p>Use <code>children</code> to display custom content in the center:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <ProgressRing value={68} size={140} theme={themeName}>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.text }}>68%</div>
            <div className="text-xs" style={{ color: theme.textSecondary }}>Complete</div>
          </div>
        </ProgressRing>
        <ProgressRing value={42} size={140} theme={themeName} color="#ef4444">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: theme.text }}>42</div>
            <div className="text-xs" style={{ color: theme.textSecondary }}>Tasks Left</div>
          </div>
        </ProgressRing>
      </div>

      <CodeBlock
        language="tsx"
        code={`<ProgressRing value={68} size={140} theme="${themeName}">
  <div className="text-center">
    <div className="text-2xl font-bold">68%</div>
    <div className="text-xs">Complete</div>
  </div>
</ProgressRing>`}
      />

      <h2 id="sizes">Sizes & Stroke Width</h2>
      <p>Adjust <code>size</code> and <code>strokeWidth</code> for different visual styles:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <ProgressRing value={65} size={60} strokeWidth={4} theme={themeName} />
        <ProgressRing value={65} size={100} strokeWidth={8} theme={themeName} />
        <ProgressRing value={65} size={140} strokeWidth={12} theme={themeName} />
        <ProgressRing value={65} size={140} strokeWidth={20} theme={themeName} />
      </div>

      <h2 id="colors">Custom Colors</h2>
      <p>Override the theme color with a custom <code>color</code> prop:</p>
      <div className="not-prose my-6 p-8 rounded-lg border border-border flex items-center justify-center gap-8">
        <ProgressRing value={80} theme={themeName} color="#22c55e" />
        <ProgressRing value={60} theme={themeName} color="#f59e0b" />
        <ProgressRing value={40} theme={themeName} color="#ef4444" />
        <ProgressRing value={90} theme={themeName} color="#8b5cf6" />
      </div>

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
