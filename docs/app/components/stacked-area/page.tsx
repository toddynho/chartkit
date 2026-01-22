'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { StackedArea } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

function generateStackedData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      date: `Day ${i + 1}`,
      direct: Math.floor(1000 + Math.random() * 500),
      organic: Math.floor(800 + Math.random() * 400),
      referral: Math.floor(400 + Math.random() * 300),
      social: Math.floor(200 + Math.random() * 200),
    });
  }
  return data;
}

const props = [
  { name: 'data', type: 'T[]', description: 'Data array', required: true },
  { name: 'dataKeys', type: '(keyof T)[]', description: 'Keys for stacked series', required: true },
  { name: 'timeKey', type: 'keyof T', default: '"time"', description: 'Key for x-axis' },
  { name: 'width', type: 'number', default: '600', description: 'Chart width' },
  { name: 'height', type: 'number', default: '300', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'unit', type: 'string', description: 'Unit label for values' },
  { name: 'showArea', type: 'boolean', default: 'true', description: 'Show area fill' },
  { name: 'fillOpacity', type: 'number', default: '0.6', description: 'Area fill opacity' },
  { name: 'seriesLabels', type: 'Record<string, string>', description: 'Custom series labels' },
];

export default function StackedAreaPage() {
  const data = useMemo(() => generateStackedData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="stacked-area">StackedArea</h1>
      <p className="lead">
        Stacked area charts for visualizing cumulative time series data with toggleable series.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Click the legend badges to toggle series visibility:</p>

      <Playground
        name="StackedArea"
        defaultProps={{
          showArea: true,
          fillOpacity: 0.6,
          unit: 'visits',
        }}
        aspectRatio={16 / 9}
        controls={[
          { label: 'showArea', type: 'boolean' },
          { label: 'fillOpacity', type: 'number', min: 0.1, max: 1, step: 0.1 },
        ]}
        render={(p, dimensions) => (
          <StackedArea
            data={data}
            dataKeys={['direct', 'organic', 'referral', 'social']}
            timeKey="date"
            theme={p.theme as any}
            width={dimensions?.width ?? 700}
            height={dimensions?.height ?? 320}
            unit={p.unit as string}
            showArea={p.showArea as boolean}
            fillOpacity={p.fillOpacity as number}
            padding={16}
            seriesLabels={{
              direct: 'Direct',
              organic: 'Organic Search',
              referral: 'Referral',
              social: 'Social Media',
            }}
          />
        )}
      />

      <h2 id="usage">Usage</h2>

      <CodeBlock
        language="tsx"
        code={`<StackedArea
  data={trafficData}
  dataKeys={['direct', 'organic', 'referral', 'social']}
  timeKey="date"
  theme="${themeName}"
  unit="visits"
  seriesLabels={{
    direct: 'Direct',
    organic: 'Organic Search',
    referral: 'Referral',
    social: 'Social Media',
  }}
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
