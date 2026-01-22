'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { MiniArea } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const generateData = () => Array.from({ length: 30 }, () => ({ value: Math.random() * 100 }));

const props = [
  { name: 'data', type: 'T[] | number[]', description: 'Data array', required: true },
  { name: 'dataKey', type: 'keyof T', default: '"value"', description: 'Key for numeric values' },
  { name: 'width', type: 'number', default: 'auto', description: 'Chart width (auto-fills container if not set)' },
  { name: 'height', type: 'number', default: '40', description: 'Chart height' },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'color', type: 'string', description: 'Override color' },
];

export default function MiniAreaPage() {
  const data = useMemo(() => generateData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="mini-area">MiniArea</h1>
      <p className="lead">
        A small area chart with gradient fill. Similar to Sparkline but with a filled area effect.
      </p>

      <h2 id="playground">Playground</h2>
      <Playground
        name="MiniArea"
        defaultProps={{ width: 200, height: 48 }}
        responsive={false}
        controls={[
          { label: 'width', type: 'number', min: 80, max: 400, step: 10 },
          { label: 'height', type: 'number', min: 20, max: 100, step: 4 },
        ]}
        render={(p) => (
          <MiniArea
            data={data}
            theme={p.theme as any}
            width={p.width as number}
            height={p.height as number}
          />
        )}
      />

      <h2 id="usage">Usage</h2>
      <p>The chart automatically fills its container width:</p>

      <CodeBlock
        language="tsx"
        code={`import { MiniArea } from '@derpdaderp/chartkit';

// Responsive - fills container width automatically
<MiniArea data={data} theme="${themeName}" />

// Fixed width
<MiniArea data={data} theme="${themeName}" width={160} height={40} />`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
