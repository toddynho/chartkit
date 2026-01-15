import { DocsLayout } from '@/components/layout/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';

export const metadata = {
  title: 'Getting Started',
  description: 'Get started with ChartKit in minutes.',
};

export default function GettingStartedPage() {
  return (
    <DocsLayout>
      <h1 id="getting-started">Getting Started</h1>
      <p className="lead">
        Get up and running with ChartKit in your Next.js project in just a few minutes.
      </p>

      <h2 id="installation">Installation</h2>
      <p>Install ChartKit using your preferred package manager:</p>
      
      <CodeBlock
        code="npm install @derpdaderp/chartkit"
        language="bash"
      />

      <p>Or with yarn:</p>
      
      <CodeBlock
        code="yarn add @derpdaderp/chartkit"
        language="bash"
      />

      <h2 id="basic-usage">Basic Usage</h2>
      <p>
        Import the components you need and start building beautiful charts:
      </p>

      <CodeBlock
        language="tsx"
        filename="app/dashboard/page.tsx"
        code={`import { Sparkline, KpiCard, MonitorLine } from '@derpdaderp/chartkit';

// Sample data
const data = [
  { value: 10 },
  { value: 25 },
  { value: 15 },
  { value: 30 },
  { value: 22 },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <KpiCard
        label="Revenue"
        value={125000}
        delta={12.5}
        data={data}
          theme="midnight"
        />
      )}
    </div>
  );
}`}
      />

      <h2 id="themes">Using Themes</h2>
      <p>
        ChartKit comes with 17 built-in themes. Pass the theme name to any component:
      </p>

      <CodeBlock
        language="tsx"
        code={`// Dark themes (13):
// 'midnight', 'emerald', 'mono', 'slate', 'arctic',
// 'orchid', 'obsidian', 'neon', 'mocha', 'owl',
// 'retro', 'copper', 'rose'

// Light themes (4):
// 'sunset', 'silver', 'pearl', 'latte'

<Sparkline
  data={data}
  theme="neon"
  width={120}
  height={32}
/>`}
      />

      <p>
        You can also access theme colors directly for custom styling:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { themes } from '@derpdaderp/chartkit';

const t = themes['midnight'];
console.log(t.colors); // ['#4ade80', '#38bdf8', ...]
console.log(t.bg);     // '#0c0c0c'`}
      />

      <h2 id="responsive-charts">Responsive Charts</h2>
      <p>
        Use the <code>useContainerWidth</code> hook to make charts responsive:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { MonitorLine, useContainerWidth } from '@derpdaderp/chartkit';

function ResponsiveChart({ data }) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {width > 0 && (
        <MonitorLine
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

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>
          <a href="/components">Browse all components</a> to see what&apos;s available
        </li>
        <li>
          <a href="/themes">Learn about theming</a> and customization
        </li>
        <li>
          <a href="/examples">View examples</a> of complete dashboards
        </li>
      </ul>
    </DocsLayout>
  );
}
