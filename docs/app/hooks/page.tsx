import { DocsLayout } from '@/components/layout/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { PropsTable } from '@/components/docs/PropsTable';

export default function HooksPage() {
  return (
    <DocsLayout>
      <h1 id="hooks">Hooks</h1>
      <p className="lead">
        ChartKit exports several utility hooks for building responsive and animated charts.
      </p>

      <h2 id="use-auto-theme">useAutoTheme</h2>
      <p>
        Automatically switches chart themes based on your app&apos;s dark/light mode. Works with next-themes, Tailwind dark mode, or system preferences.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LineChart, useAutoTheme } from '@derpdaderp/chartkit';

function Chart({ data, series }) {
  // Automatically switches between themes based on dark mode
  const theme = useAutoTheme({ light: 'sunset', dark: 'neon' });
  
  return <LineChart data={data} series={series} theme={theme} />;
}

// Or use system preference instead of DOM class
const theme = useAutoTheme({ 
  light: 'sunset', 
  dark: 'midnight',
  useSystemPreference: true 
});`}
      />

      <h3>Options</h3>
      <PropsTable
        props={[
          { name: 'light', type: 'ThemeName', description: 'Theme for light mode', required: true },
          { name: 'dark', type: 'ThemeName', description: 'Theme for dark mode', required: true },
          { name: 'selector', type: 'string', default: '"html"', description: 'DOM selector to observe for class changes' },
          { name: 'darkClass', type: 'string', default: '"dark"', description: 'Class that indicates dark mode' },
          { name: 'useSystemPreference', type: 'boolean', default: 'false', description: 'Use system preference instead of DOM class' },
        ]}
      />

      <h2 id="use-container-width">useContainerWidth</h2>
      <p>
        A hook for making charts responsive by tracking their container width.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LineChart, useContainerWidth } from '@derpdaderp/chartkit';

function ResponsiveChart({ data, series }) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {width > 0 && (
        <LineChart
          data={data}
          series={series}
          width={width}
          theme="midnight"
        />
      )}
    </div>
  );
}`}
      />

      <h2 id="use-resize-observer">useResizeObserver</h2>
      <p>
        A more complete hook that tracks both width and height of an element.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useResizeObserver } from '@derpdaderp/chartkit';

function AdaptiveChart() {
  const { ref, size, ready } = useResizeObserver<HTMLDivElement>();
  
  return (
    <div ref={ref} style={{ width: '100%', height: '400px' }}>
      {ready && (
        <MyChart width={size.width} height={size.height} />
      )}
    </div>
  );
}`}
      />

      <h3>Return Value</h3>
      <PropsTable
        props={[
          { name: 'ref', type: 'RefObject<T>', description: 'Ref to attach to the container element' },
          { name: 'size', type: '{ width: number; height: number }', description: 'Current size of the element' },
          { name: 'ready', type: 'boolean', description: 'Whether the element has been measured' },
        ]}
      />

      <h2 id="use-animated-mount">useAnimatedMount</h2>
      <p>
        A hook for animating chart elements on mount with various animation styles.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useAnimatedMount, estimatePathLength } from '@derpdaderp/chartkit';

function AnimatedPath({ pathD }) {
  const { getPathStyle, fadeStyle } = useAnimatedMount({
    duration: 800,
    delay: 200,
  });
  
  const length = estimatePathLength(pathD);
  
  return (
    <svg style={fadeStyle}>
      <path
        d={pathD}
        style={getPathStyle(length)}
        fill="none"
        stroke="currentColor"
      />
    </svg>
  );
}`}
      />

      <h3>Options</h3>
      <PropsTable
        props={[
          { name: 'duration', type: 'number', default: '600', description: 'Animation duration in ms' },
          { name: 'delay', type: 'number', default: '0', description: 'Animation delay in ms' },
          { name: 'easing', type: 'string', default: '"ease-out"', description: 'CSS easing function' },
        ]}
      />

      <h3>Return Value</h3>
      <PropsTable
        props={[
          { name: 'isAnimated', type: 'boolean', description: 'Whether animation has completed' },
          { name: 'progress', type: 'number', description: 'Progress from 0 to 1' },
          { name: 'fadeStyle', type: 'CSSProperties', description: 'Styles for fade-in animation' },
          { name: 'scaleStyle', type: 'CSSProperties', description: 'Styles for scale animation' },
          { name: 'getPathStyle', type: '(pathLength: number) => CSSProperties', description: 'Returns styles for path draw animation' },
        ]}
      />

      <h2 id="use-unique-id">useUniqueId</h2>
      <p>
        Generates unique IDs for SVG elements like filters and gradients.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useUniqueId } from '@derpdaderp/chartkit';

function ChartWithGlow() {
  const glowId = useUniqueId('glow');
  
  return (
    <svg>
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path filter={\`url(#\${glowId})\`} />
    </svg>
  );
}`}
      />

      <h2 id="use-mouse-tracking">useMouseTracking</h2>
      <p>
        Tracks mouse position over an SVG chart for tooltips and crosshairs.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useMouseTracking } from '@derpdaderp/chartkit';

function InteractiveChart() {
  const { svgRef, mouse, handleMouseMove, handleMouseLeave } = useMouseTracking({
    marginLeft: 60,
    chartWidth: 500,
  });
  
  return (
    <svg
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {mouse.x !== null && (
        <line x1={mouse.x} y1={0} x2={mouse.x} y2={300} />
      )}
    </svg>
  );
}`}
      />
    </DocsLayout>
  );
}
