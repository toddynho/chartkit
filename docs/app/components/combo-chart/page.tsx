'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComboChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateComboData = () => [
  { month: 'Jan', revenue: 65000, expenses: 42000, growth: 8.5 },
  { month: 'Feb', revenue: 78000, expenses: 48000, growth: 12.3 },
  { month: 'Mar', revenue: 92000, expenses: 55000, growth: 15.1 },
  { month: 'Apr', revenue: 85000, expenses: 52000, growth: 10.2 },
  { month: 'May', revenue: 105000, expenses: 61000, growth: 18.4 },
  { month: 'Jun', revenue: 120000, expenses: 68000, growth: 22.1 },
  { month: 'Jul', revenue: 115000, expenses: 65000, growth: 19.8 },
  { month: 'Aug', revenue: 130000, expenses: 72000, growth: 25.3 },
];

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'series', type: 'ComboSeriesConfig[]', description: 'Series configuration', required: true },
  { name: 'categoryKey', type: 'keyof T', description: 'Key for X-axis categories', required: true },
  { name: 'width', type: 'number', default: '600', description: 'Chart width' },
  { name: 'height', type: 'number', default: '400', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'yLabelLeft', type: 'string', description: 'Left Y-axis label' },
  { name: 'yLabelRight', type: 'string', description: 'Right Y-axis label' },
  { name: 'xLabel', type: 'string', description: 'X-axis label' },
  { name: 'formatYLeft', type: '(value: number) => string', description: 'Left Y-axis formatter' },
  { name: 'formatYRight', type: '(value: number) => string', description: 'Right Y-axis formatter' },
  { name: 'barRatio', type: 'number', default: '0.6', description: 'Bar width ratio (0-1)' },
  { name: 'strokeWidth', type: 'number', default: '2', description: 'Line stroke width' },
  { name: 'fillOpacity', type: 'number', default: '0.3', description: 'Area fill opacity' },
  { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show grid lines' },
  { name: 'onDataPointClick', type: '(event: DataPointClickEvent) => void', description: 'Click handler' },
  { name: 'renderTooltip', type: '(props: TooltipRenderProps) => ReactNode', description: 'Custom tooltip' },
  { name: 'annotations', type: 'Annotation[]', description: 'Reference lines and areas' },
];

const seriesConfigProps = [
  { name: 'key', type: 'string', description: 'Data key for this series', required: true },
  { name: 'label', type: 'string', description: 'Display label', required: true },
  { name: 'type', type: '"line" | "bar" | "area"', description: 'Series type', required: true },
  { name: 'yAxis', type: '"left" | "right"', default: '"left"', description: 'Which Y-axis to use' },
  { name: 'color', type: 'string', description: 'Custom color (overrides theme)' },
];

export default function ComboChartPage() {
  const data = useMemo(() => generateComboData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="combo-chart">ComboChart</h1>
      <p className="lead">
        Combine lines, bars, and areas in a single chart with optional dual Y-axes. 
        Perfect for showing correlated metrics with different scales.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Experiment with different settings:</p>

      <Playground
        name="ComboChart"
        defaultProps={{
          barRatio: 0.6,
          strokeWidth: 2,
          showGrid: true,
        }}
        aspectRatio={16 / 9}
        controls={[
          { label: 'barRatio', type: 'number', min: 0.2, max: 0.9, step: 0.1 },
          { label: 'strokeWidth', type: 'number', min: 1, max: 4, step: 0.5 },
          { label: 'showGrid', type: 'boolean' },
        ]}
        render={(p, dimensions) => (
          <ComboChart
            data={data}
            series={[
              { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
              { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
            ]}
            categoryKey="month"
            theme={p.theme as any}
            width={dimensions?.width ?? 600}
            height={dimensions?.height ?? 400}
            yLabelLeft="Revenue ($)"
            yLabelRight="Growth (%)"
            barRatio={p.barRatio as number}
            strokeWidth={p.strokeWidth as number}
            showGrid={p.showGrid as boolean}
            formatYLeft={(v) => `$${(v / 1000).toFixed(0)}K`}
            formatYRight={(v) => `${v.toFixed(0)}%`}
          />
        )}
      />

      <h2 id="bar-line">Bar + Line (Dual Axis)</h2>
      <p>The classic combo chart: bars for absolute values, line for rates/percentages:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ComboChart
          data={data}
          series={[
            { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
            { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
          ]}
          categoryKey="month"
          theme={themeName}
          width={650}
          height={400}
          yLabelLeft="Revenue ($)"
          yLabelRight="Growth (%)"
          formatYLeft={(v) => `$${(v / 1000).toFixed(0)}K`}
          formatYRight={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<ComboChart
  data={data}
  series={[
    { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
    { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
  ]}
  categoryKey="month"
  theme="${themeName}"
  yLabelLeft="Revenue ($)"
  yLabelRight="Growth (%)"
  formatYLeft={(v) => \`$\${(v / 1000).toFixed(0)}K\`}
  formatYRight={(v) => \`\${v.toFixed(0)}%\`}
/>`}
      />

      <h2 id="multiple-bars">Multiple Bars + Line</h2>
      <p>Compare multiple bar series with a trend line:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ComboChart
          data={data}
          series={[
            { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
            { key: 'expenses', label: 'Expenses', type: 'bar', yAxis: 'left' },
            { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
          ]}
          categoryKey="month"
          theme={themeName}
          width={650}
          height={400}
          formatYLeft={(v) => `$${(v / 1000).toFixed(0)}K`}
          formatYRight={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <h2 id="area-line">Area + Line</h2>
      <p>Use area for volume and line for rates:</p>
      <div className="not-prose my-6 p-4 rounded-lg border border-border">
        <ComboChart
          data={data}
          series={[
            { key: 'revenue', label: 'Revenue', type: 'area', yAxis: 'left' },
            { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
          ]}
          categoryKey="month"
          theme={themeName}
          width={650}
          height={400}
          fillOpacity={0.4}
          formatYLeft={(v) => `$${(v / 1000).toFixed(0)}K`}
          formatYRight={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <h2 id="series-config">Series Configuration</h2>
      <p>Each series is configured with a <code>ComboSeriesConfig</code> object:</p>
      <PropsTable props={seriesConfigProps} />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
