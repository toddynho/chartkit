'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Heatmap, type HeatmapDataPoint } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

function generateHeatmapData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();
    const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
    const baseActivity = isWeekday ? Math.random() * 8 : Math.random() * 3;
    const spike = Math.random() > 0.9 ? Math.random() * 10 : 0;
    
    data.push({
      date: dateStr,
      value: Math.floor(baseActivity + spike),
    });
    
    current.setDate(current.getDate() + 1);
  }
  return data;
}

const props = [
  { name: 'data', type: 'HeatmapDataPoint[]', description: 'Array of { date, value } objects', required: true },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'weeks', type: 'number', default: '52', description: 'Number of weeks to display' },
  { name: 'cellSize', type: 'number', default: '12', description: 'Cell size in pixels' },
  { name: 'cellGap', type: 'number', default: '3', description: 'Gap between cells' },
  { name: 'cellRadius', type: 'number', default: '2', description: 'Cell border radius' },
  { name: 'showMonthLabels', type: 'boolean', default: 'true', description: 'Show month labels' },
  { name: 'showDayLabels', type: 'boolean', default: 'true', description: 'Show day labels' },
  { name: 'colorScale', type: 'string[]', description: 'Custom color scale array' },
  { name: 'format', type: '(value, date) => string', description: 'Tooltip formatter' },
  { name: 'emptyColor', type: 'string', description: 'Color for empty cells' },
];

export default function HeatmapPage() {
  const data = useMemo(() => generateHeatmapData(), []);
  const { themeName } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="heatmap">Heatmap</h1>
      <p className="lead">
        A GitHub-style contribution/activity heatmap for visualizing daily activity over time.
      </p>

      <h2 id="playground">Playground</h2>
      <p>Hover over cells to see the value and date:</p>

      <Playground
        name="Heatmap"
        defaultProps={{
          weeks: 52,
          cellSize: 12,
          cellGap: 3,
          cellRadius: 2,
          showMonthLabels: true,
          showDayLabels: true,
        }}
        responsive={false}
        controls={[
          { label: 'weeks', type: 'number', min: 12, max: 52, step: 4 },
          { label: 'cellSize', type: 'number', min: 8, max: 16, step: 1 },
          { label: 'cellGap', type: 'number', min: 1, max: 6, step: 1 },
          { label: 'cellRadius', type: 'number', min: 0, max: 6, step: 1 },
          { label: 'showMonthLabels', type: 'boolean' },
          { label: 'showDayLabels', type: 'boolean' },
        ]}
        render={(p) => (
          <Heatmap
            data={data}
            theme={p.theme as any}
            weeks={p.weeks as number}
            cellSize={p.cellSize as number}
            cellGap={p.cellGap as number}
            cellRadius={p.cellRadius as number}
            showMonthLabels={p.showMonthLabels as boolean}
            showDayLabels={p.showDayLabels as boolean}
            format={(value, date) => `${value} contributions on ${date}`}
          />
        )}
      />

      <h2 id="usage">Usage</h2>

      <CodeBlock
        language="tsx"
        code={`import { Heatmap, type HeatmapDataPoint } from '@derpdaderp/chartkit';

const data: HeatmapDataPoint[] = [
  { date: '2024-01-01', value: 5 },
  { date: '2024-01-02', value: 3 },
  { date: '2024-01-03', value: 8 },
  // ...more data
];

<Heatmap
  data={data}
  theme="${themeName}"
  weeks={52}
  format={(value, date) => \`\${value} contributions on \${date}\`}
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
