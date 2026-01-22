'use client';

import { useState } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Legend } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

const props = [
  { name: 'items', type: 'LegendItem[]', description: 'Legend items to display', required: true },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'direction', type: '"horizontal" | "vertical"', default: '"horizontal"', description: 'Layout direction' },
  { name: 'align', type: '"start" | "center" | "end"', default: '"start"', description: 'Alignment' },
  { name: 'interactive', type: 'boolean', default: 'false', description: 'Enable toggle interaction' },
  { name: 'onItemClick', type: '(event: LegendClickEvent) => void', description: 'Click handler for interactive mode' },
  { name: 'marker', type: '"circle" | "square" | "line"', default: '"circle"', description: 'Marker shape' },
  { name: 'markerSize', type: 'number', default: '10', description: 'Marker size in pixels' },
  { name: 'showValues', type: 'boolean', default: 'true', description: 'Show values next to labels' },
  { name: 'gap', type: 'number', default: '16', description: 'Gap between items in pixels' },
];

const legendItemProps = [
  { name: 'key', type: 'string', description: 'Unique identifier', required: true },
  { name: 'label', type: 'string', description: 'Display label', required: true },
  { name: 'color', type: 'string', description: 'Item color', required: true },
  { name: 'visible', type: 'boolean', description: 'Visibility state (for interactive)' },
  { name: 'value', type: 'string | number', description: 'Optional value to display' },
];

export default function LegendPage() {
  const { themeName, theme } = useChartTheme();
  const [visibility, setVisibility] = useState({
    sales: true,
    revenue: true,
    costs: true,
  });

  const items = [
    { key: 'sales', label: 'Sales', color: theme.colors[0], value: '$12,345' },
    { key: 'revenue', label: 'Revenue', color: theme.colors[1], value: '$45,678' },
    { key: 'costs', label: 'Costs', color: theme.colors[2], value: '$8,900' },
  ];

  const interactiveItems = items.map((item) => ({
    ...item,
    visible: visibility[item.key as keyof typeof visibility],
  }));

  return (
    <DocsLayout>
      <h1 id="legend">Legend</h1>
      <p className="lead">
        A standalone legend component for building custom chart layouts or adding 
        external legends to any visualization.
      </p>

      <h2 id="basic">Basic Usage</h2>
      <p>Display a simple legend with items:</p>
      <div className="not-prose my-6 p-6 rounded-lg border border-border" style={{ backgroundColor: theme.bg }}>
        <Legend
          items={items}
          theme={themeName}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`import { Legend } from '@derpdaderp/chartkit';

<Legend
  items={[
    { key: 'sales', label: 'Sales', color: '#4ade80', value: '$12,345' },
    { key: 'revenue', label: 'Revenue', color: '#38bdf8', value: '$45,678' },
    { key: 'costs', label: 'Costs', color: '#a78bfa', value: '$8,900' },
  ]}
  theme="${themeName}"
/>`}
      />

      <h2 id="direction">Layout Direction</h2>
      <p>Use <code>direction</code> for vertical or horizontal layouts:</p>
      <div className="not-prose my-6 p-6 rounded-lg border border-border grid grid-cols-2 gap-8" style={{ backgroundColor: theme.bg }}>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Horizontal (default)</div>
          <Legend items={items} theme={themeName} direction="horizontal" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Vertical</div>
          <Legend items={items} theme={themeName} direction="vertical" />
        </div>
      </div>

      <h2 id="markers">Marker Styles</h2>
      <p>Choose between circle, square, or line markers:</p>
      <div className="not-prose my-6 p-6 rounded-lg border border-border space-y-4" style={{ backgroundColor: theme.bg }}>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Circle (default)</div>
          <Legend items={items} theme={themeName} marker="circle" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Square</div>
          <Legend items={items} theme={themeName} marker="square" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2">Line</div>
          <Legend items={items} theme={themeName} marker="line" />
        </div>
      </div>

      <h2 id="interactive">Interactive Legend</h2>
      <p>Enable <code>interactive</code> mode to allow toggling series visibility:</p>
      <div className="not-prose my-6 p-6 rounded-lg border border-border" style={{ backgroundColor: theme.bg }}>
        <Legend
          items={interactiveItems}
          theme={themeName}
          interactive
          onItemClick={({ key, visible }) => {
            setVisibility((prev) => ({ ...prev, [key]: !visible }));
          }}
        />
        <div className="mt-4 text-xs" style={{ color: theme.textSecondary }}>
          Visible: {Object.entries(visibility)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(', ') || 'None'}
        </div>
      </div>

      <CodeBlock
        language="tsx"
        code={`const [visibility, setVisibility] = useState({
  sales: true,
  revenue: true,
  costs: true,
});

<Legend
  items={items.map((item) => ({
    ...item,
    visible: visibility[item.key],
  }))}
  theme="${themeName}"
  interactive
  onItemClick={({ key, visible }) => {
    setVisibility((prev) => ({ ...prev, [key]: !visible }));
  }}
/>`}
      />

      <h2 id="without-values">Without Values</h2>
      <p>Set <code>showValues={'{false}'}</code> to hide values:</p>
      <div className="not-prose my-6 p-6 rounded-lg border border-border" style={{ backgroundColor: theme.bg }}>
        <Legend
          items={items.map(({ value, ...rest }) => rest)}
          theme={themeName}
          showValues={false}
        />
      </div>

      <h2 id="legend-item">LegendItem Interface</h2>
      <PropsTable props={legendItemProps} />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />
    </DocsLayout>
  );
}
