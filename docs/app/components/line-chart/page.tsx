'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { LineChart } from '@derpdaderp/chartkit';
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

function generateDualAxisData() {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      requests: 800 + Math.random() * 400 + (i > 8 && i < 20 ? 300 : 0),
      latency: 45 + Math.random() * 30 + (i > 8 && i < 20 ? 15 : 0),
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
  { name: 'unit', type: 'string', default: '""', description: 'Unit label for left Y-axis (shorthand)' },
  { name: 'yAxisLeft', type: 'YAxisConfig', description: 'Left Y-axis configuration' },
  { name: 'yAxisRight', type: 'YAxisConfig', description: 'Right Y-axis configuration (enables dual-axis)' },
  { name: 'curve', type: 'CurveType', default: '"linear"', description: 'Line interpolation: linear, monotone, step, stepBefore, stepAfter' },
  { name: 'showDots', type: 'boolean', default: 'false', description: 'Show dots on data points' },
  { name: 'dotSize', type: 'number', default: '3', description: 'Dot radius in pixels' },
  { name: 'dotsOnHover', type: 'boolean', default: 'true', description: 'Show dots only on hover' },
  { name: 'glow', type: 'boolean', default: 'false', description: 'Enable glow effect on lines' },
  { name: 'grid', type: 'GridOptions | boolean', default: 'true', description: 'Grid line configuration' },
  { name: 'areaGradient', type: 'AreaGradientOptions', description: 'Customize area gradient: { from, to, direction }' },
  { name: 'showLegend', type: 'boolean', default: 'true', description: 'Show/hide legend' },
  { name: 'annotations', type: 'Annotation[]', description: 'Reference lines and areas' },
  { name: 'connectNulls', type: 'boolean', default: 'true', description: 'Connect lines through null values' },
  { name: 'onDataPointClick', type: 'function', description: 'Click handler for data points' },
  { name: 'renderTooltip', type: 'function', description: 'Custom tooltip renderer' },
  { name: 'className', type: 'string', description: 'Additional CSS class' },
  { name: 'style', type: 'CSSProperties', description: 'Custom styles for container' },
];

const seriesConfigProps = [
  { name: 'key', type: 'string', description: 'Unique key matching data property', required: true },
  { name: 'label', type: 'string', description: 'Display label', required: true },
  { name: 'displayValue', type: 'string', description: 'Current/summary value shown in legend badge' },
  { name: 'yAxisId', type: "'left' | 'right'", default: "'left'", description: 'Y-axis assignment for dual-axis charts' },
  { name: 'area', type: 'boolean', default: 'false', description: 'Fill area under the line (gradient fill)' },
  { name: 'areaOpacity', type: 'number', default: '0.4', description: 'Area gradient start opacity (fades to 0.05)' },
  { name: 'color', type: 'string', description: 'Custom line color (overrides theme)' },
  { name: 'strokeDasharray', type: 'string', description: 'Dash pattern (e.g., "5,5")' },
  { name: 'strokeWidth', type: 'number', default: '2', description: 'Line stroke width' },
];

const yAxisConfigProps = [
  { name: 'unit', type: 'string', description: 'Unit label (e.g., "ms", "req/s", "%")' },
  { name: 'min', type: 'number', description: 'Minimum value (auto-calculated if not set)' },
  { name: 'max', type: 'number', description: 'Maximum value (auto-calculated if not set)' },
  { name: 'tickCount', type: 'number', default: '3', description: 'Number of ticks' },
  { name: 'format', type: '(value: number) => string', description: 'Custom tick label formatter' },
];

export default function LineChartPage() {
  const data = useMemo(() => generateMultiSeriesData(), []);
  const dualAxisData = useMemo(() => generateDualAxisData(), []);
  const { themeName, theme } = useChartTheme();

  const series = [
    { key: 'p50', label: 'p50', displayValue: '1.8 ms' },
    { key: 'p95', label: 'p95', displayValue: '2.3 ms' },
    { key: 'p99', label: 'p99', displayValue: '3.5 ms' },
  ];

  return (
    <DocsLayout>
      <h1 id="line-chart">LineChart</h1>
      <p className="lead">
        Feature-rich line chart with dual Y-axis support, multiple curve types, 
        area fills, and interactive legends. Perfect for time series data, 
        metrics dashboards, and analytics.
      </p>

      <h2 id="playground">Playground</h2>
      <p>
        Click the legend badges to toggle series visibility. Hover over the chart
        to see interpolated values. Try different curve types and settings below.
      </p>

      <Playground
        name="LineChart"
        defaultProps={{
          glow: false,
          curve: 'linear',
          showDots: false,
        }}
        aspectRatio={16 / 9}
        controls={[
          { label: 'curve', type: 'select', options: [
            { label: 'linear', value: 'linear' },
            { label: 'monotone', value: 'monotone' },
            { label: 'step', value: 'step' },
            { label: 'stepBefore', value: 'stepBefore' },
            { label: 'stepAfter', value: 'stepAfter' },
          ]},
          { label: 'glow', type: 'boolean' },
          { label: 'showDots', type: 'boolean' },
        ]}
        render={(p, dimensions) => (
          <LineChart
            data={data}
            series={series}
            theme={p.theme as any}
            width={dimensions?.width ?? 700}
            height={dimensions?.height ?? 300}
            curve={p.curve as any}
            glow={p.glow as boolean}
            showDots={p.showDots as boolean}
            unit="ms"
            padding={16}
          />
        )}
      />

      <h2 id="usage">Basic Usage</h2>
      <p>Import the component and configure your series:</p>

      <CodeBlock
        language="tsx"
        code={`import { LineChart } from '@derpdaderp/chartkit';

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

<LineChart
  data={data}
  series={series}
  theme="${themeName}"
  unit="ms"
/>`}
      />

      <h2 id="single-series">Single Series (Simplified API)</h2>
      <p>
        For single-series charts, use <code>dataKey</code> and <code>label</code> instead of the <code>series</code> array:
      </p>

      <CodeBlock
        language="tsx"
        code={`<LineChart
  data={data}
  dataKey="value"
  label="Revenue"
  theme="${themeName}"
  unit="$"
  responsive
/>`}
      />

      <h2 id="curve-types">Curve Types</h2>
      <p>
        Choose from 5 interpolation methods with the <code>curve</code> prop:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {(['linear', 'monotone', 'step', 'stepAfter'] as const).map((curveType) => (
          <div 
            key={curveType}
            className="rounded-lg border border-border overflow-hidden"
            style={{ backgroundColor: theme.bgCard }}
          >
            <div className="px-3 py-2 border-b border-border text-sm font-medium" style={{ color: theme.text }}>
              curve="{curveType}"
            </div>
            <LineChart
              data={data.slice(0, 20)}
              series={[{ key: 'p50', label: 'p50' }]}
              theme={themeName}
              height={150}
              width={380}
              curve={curveType}
              unit="ms"
              showLegend={false}
            />
          </div>
        ))}
      </div>

      <CodeBlock
        language="tsx"
        code={`// Smooth curves (Catmull-Rom spline)
<LineChart data={data} series={series} theme="${themeName}" curve="monotone" />

// Step function (horizontal then vertical)
<LineChart data={data} series={series} theme="${themeName}" curve="step" />`}
      />

      <h2 id="dual-axis">Dual Y-Axis</h2>
      <p>
        Display series with different scales using <code>yAxisLeft</code>, <code>yAxisRight</code>, 
        and <code>yAxisId</code> per series:
      </p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <LineChart
          data={dualAxisData}
          series={[
            { key: 'requests', label: 'Requests', yAxisId: 'left' },
            { key: 'latency', label: 'Latency', yAxisId: 'right', strokeDasharray: '5,5' },
          ]}
          yAxisLeft={{ unit: 'req/s' }}
          yAxisRight={{ unit: 'ms' }}
          theme={themeName}
          width={800}
          height={300}
          curve="monotone"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<LineChart
  data={data}
  series={[
    { key: 'requests', label: 'Requests', yAxisId: 'left' },
    { key: 'latency', label: 'Latency', yAxisId: 'right', strokeDasharray: '5,5' },
  ]}
  yAxisLeft={{ unit: 'req/s' }}
  yAxisRight={{ unit: 'ms' }}
  theme="${themeName}"
  curve="monotone"
/>`}
      />

      <h2 id="area-chart">Area Chart</h2>
      <p>
        Create beautiful area charts by adding <code>area: true</code> to your series.
        The gradient automatically fades from the line color to transparent.
      </p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <LineChart
          data={data.slice(0, 30)}
          series={[
            { key: 'p50', label: 'Revenue', area: true },
          ]}
          theme={themeName}
          width={800}
          height={280}
          curve="monotone"
          unit="$"
          showLegend={false}
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`// Simple area chart
<LineChart
  data={data}
  series={[{ key: 'value', label: 'Revenue', area: true }]}
  theme="${themeName}"
  curve="monotone"
  unit="$"
/>`}
      />

      <h3 id="area-opacity">Customizing Area Opacity</h3>
      <p>
        Control the gradient intensity with <code>areaOpacity</code> (default: 0.4 at top, fading to 0.05 at bottom):
      </p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <LineChart
          data={data.slice(0, 30)}
          series={[
            { key: 'p50', label: 'Light fill', area: true, areaOpacity: 0.2 },
            { key: 'p95', label: 'Heavy fill', area: true, areaOpacity: 0.6 },
          ]}
          theme={themeName}
          width={800}
          height={300}
          curve="monotone"
          unit="ms"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`// Multiple areas with different opacities
<LineChart
  data={data}
  series={[
    { key: 'p50', label: 'p50', area: true, areaOpacity: 0.2 },
    { key: 'p95', label: 'p95', area: true, areaOpacity: 0.6 },
  ]}
  theme="${themeName}"
  curve="monotone"
/>`}
      />

      <h2 id="with-dots">Data Point Dots</h2>
      <p>
        Show dots on data points with <code>showDots</code>:
      </p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <LineChart
          data={data.slice(0, 15)}
          series={[{ key: 'p50', label: 'p50' }]}
          theme={themeName}
          width={800}
          height={250}
          showDots
          dotsOnHover={false}
          dotSize={4}
          unit="ms"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<LineChart
  data={data}
  series={[{ key: 'value', label: 'Value' }]}
  theme="${themeName}"
  showDots
  dotsOnHover={false}  // Always show dots (not just on hover)
  dotSize={4}
/>`}
      />

      <h2 id="with-glow">Glow Effect</h2>
      <p>Enable the glow effect for a more dramatic look:</p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden transition-colors duration-300"
      >
        <LineChart
          data={data}
          series={series}
          theme={themeName}
          width={800}
          height={300}
          unit="ms"
          glow
        />
      </div>

      <h2 id="custom-series-styling">Custom Series Styling</h2>
      <p>
        Override colors and stroke styles per series:
      </p>

      <CodeBlock
        language="tsx"
        code={`<LineChart
  data={data}
  series={[
    { key: 'actual', label: 'Actual', color: '#22c55e', strokeWidth: 2 },
    { key: 'target', label: 'Target', color: '#f59e0b', strokeDasharray: '8,4' },
    { key: 'forecast', label: 'Forecast', color: '#6b7280', strokeDasharray: '2,2' },
  ]}
  theme="${themeName}"
  curve="monotone"
/>`}
      />

      <h2 id="responsive">Responsive Width</h2>
      <p>
        Use the <code>responsive</code> prop to automatically fill the container width:
      </p>

      <CodeBlock
        language="tsx"
        code={`<LineChart
  data={data}
  series={series}
  theme="${themeName}"
  responsive
  height={300}
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />

      <h2 id="series-config">SeriesConfig</h2>
      <p>Each series is configured with the following properties:</p>
      <PropsTable props={seriesConfigProps} />

      <h2 id="y-axis-config">YAxisConfig</h2>
      <p>Configure Y-axis behavior:</p>
      <PropsTable props={yAxisConfigProps} />

      <h2 id="migration">Migration from MonitorLine</h2>
      <p>
        <code>MonitorLine</code> has been renamed to <code>LineChart</code>. 
        The API is backward compatible, just update your imports:
      </p>

      <CodeBlock
        language="tsx"
        code={`// Before
import { MonitorLine } from '@derpdaderp/chartkit';

// After
import { LineChart } from '@derpdaderp/chartkit';

// MonitorLine is still exported as a deprecated alias`}
      />
    </DocsLayout>
  );
}
