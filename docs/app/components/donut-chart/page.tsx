'use client';

import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { DonutChart, themes } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const data = [
  { source: 'Direct', visits: 4500 },
  { source: 'Organic', visits: 3200 },
  { source: 'Referral', visits: 1800 },
  { source: 'Social', visits: 1200 },
  { source: 'Email', visits: 800 },
];

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'dataKey', type: 'keyof T', description: 'Key for segment values', required: true },
  { name: 'labelKey', type: 'keyof T', description: 'Key for segment labels', required: true },
  { name: 'size', type: 'number', default: '200', description: 'Chart size (width and height)' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'innerRadius', type: 'number', default: '0.6', description: 'Inner radius ratio (0 = pie)' },
  { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show legend' },
  { name: 'legendPosition', type: '"right" | "bottom"', default: '"right"', description: 'Legend position' },
  { name: 'centerContent', type: 'ReactNode', description: 'Content to display in center' },
  { name: 'padAngle', type: 'number', default: '2', description: 'Pad angle between segments' },
];

export default function DonutChartPage() {
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="donut-chart">DonutChart</h1>
      <p className="lead">
        Donut and pie charts for displaying proportional data with interactive hover states and optional center content.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="DonutChart"
        defaultProps={{
          size: 220,
          innerRadius: 0.6,
          showLegend: true,
          legendPosition: 'right',
          padAngle: 2,
        }}
        responsive={false}
        controls={[
          { label: 'size', type: 'number', min: 150, max: 300, step: 10 },
          { label: 'innerRadius', type: 'number', min: 0, max: 0.9, step: 0.1 },
          { label: 'showLegend', type: 'boolean' },
          { label: 'legendPosition', type: 'segment', options: [
            { label: 'Right', value: 'right' },
            { label: 'Bottom', value: 'bottom' },
          ]},
          { label: 'padAngle', type: 'number', min: 0, max: 10, step: 1 },
        ]}
        render={(p) => {
          const t = themes[p.theme as keyof typeof themes];
          return (
            <DonutChart
              data={data}
              dataKey="visits"
              labelKey="source"
              theme={p.theme as any}
              size={p.size as number}
              innerRadius={p.innerRadius as number}
              showLegend={p.showLegend as boolean}
              legendPosition={p.legendPosition as 'right' | 'bottom'}
              padAngle={p.padAngle as number}
              centerContent={
                (p.innerRadius as number) > 0.3 ? (
                  <div style={{ textAlign: 'center', color: t.text }}>
                    <div style={{ fontSize: '28px', fontWeight: 700 }}>11.5K</div>
                    <div style={{ fontSize: '12px', color: t.textSecondary }}>Total</div>
                  </div>
                ) : null
              }
            />
          );
        }}
      />

      <h2 id="with-center-content">With Center Content</h2>
      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <DonutChart
          data={data}
          dataKey="visits"
          labelKey="source"
          theme={themeName}
          size={220}
          centerContent={
            <div style={{ textAlign: 'center', color: theme.text }}>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>11.5K</div>
              <div style={{ fontSize: '12px', color: theme.textSecondary }}>Total</div>
            </div>
          }
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<DonutChart
  data={data}
  dataKey="visits"
  labelKey="source"
  theme="${themeName}"
  centerContent={
    <div>
      <div className="text-2xl font-bold">11.5K</div>
      <div className="text-sm text-muted">Total</div>
    </div>
  }
/>`}
      />

      <h2 id="pie-chart">Pie Chart</h2>
      <p>Set innerRadius to 0 for a traditional pie chart:</p>
      <div 
        className="not-prose my-6 p-8 rounded-lg border border-border flex justify-center transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <DonutChart
          data={data}
          dataKey="visits"
          labelKey="source"
          theme={themeName}
          size={220}
          innerRadius={0}
        />
      </div>

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
