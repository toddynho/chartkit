'use client';

import { useMemo } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Playground } from '@/components/playground/Playground';
import { PropsTable } from '@/components/docs/PropsTable';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { CandlestickChart } from '@derpdaderp/chartkit';
import { useChartTheme } from '@/components/ChartThemeProvider';

function generateStockData(days: number = 30) {
  const data = [];
  let price = 150;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const change = (Math.random() - 0.48) * 8;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const volume = Math.floor(1000000 + Math.random() * 5000000);
    
    data.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    
    price = close;
  }
  return data;
}

const props = [
  { name: 'data', type: 'CandlestickDataPoint[]', description: 'OHLC data array', required: true },
  { name: 'theme', type: 'ThemeName', description: 'Theme name', required: true },
  { name: 'width', type: 'number', default: '600', description: 'Chart width (ignored if responsive)' },
  { name: 'height', type: 'number', default: '400', description: 'Chart height in pixels' },
  { name: 'responsive', type: 'boolean', default: 'false', description: 'Auto-fill container width' },
  { name: 'showVolume', type: 'boolean', default: 'false', description: 'Show volume bars at bottom' },
  { name: 'volumeHeight', type: 'number', default: '0.2', description: 'Volume section height ratio (0-1)' },
  { name: 'upColor', type: 'string', description: 'Bullish candle color (default: theme positive)' },
  { name: 'downColor', type: 'string', description: 'Bearish candle color (default: theme negative)' },
  { name: 'wickWidth', type: 'number', default: '1', description: 'Wick line width in pixels' },
  { name: 'candleWidth', type: 'number', default: '0.7', description: 'Candle body width ratio (0-1)' },
  { name: 'grid', type: 'GridOptions | boolean', default: 'true', description: 'Grid line configuration' },
  { name: 'formatY', type: '(value: number) => string', description: 'Y-axis value formatter' },
  { name: 'renderTooltip', type: 'function', description: 'Custom tooltip renderer' },
  { name: 'enableZoom', type: 'boolean', default: 'true', description: 'Enable zoom and pan interactions' },
  { name: 'showZoomControls', type: 'boolean', default: 'true', description: 'Show +/- zoom control buttons' },
  { name: 'minVisibleCandles', type: 'number', default: '10', description: 'Minimum candles visible when zoomed in' },
  { name: 'initialRange', type: '[number, number]', description: 'Initial visible range [startIndex, endIndex]' },
  { name: 'onRangeChange', type: '(range: [number, number]) => void', description: 'Callback when visible range changes' },
];

const dataPointProps = [
  { name: 'time', type: 'string', description: 'Time/date label for X-axis', required: true },
  { name: 'open', type: 'number', description: 'Opening price', required: true },
  { name: 'high', type: 'number', description: 'Highest price', required: true },
  { name: 'low', type: 'number', description: 'Lowest price', required: true },
  { name: 'close', type: 'number', description: 'Closing price', required: true },
  { name: 'volume', type: 'number', description: 'Trading volume (optional)' },
];

export default function CandlestickChartPage() {
  const data = useMemo(() => generateStockData(300), []);
  const { themeName, theme } = useChartTheme();

  return (
    <DocsLayout>
      <h1 id="candlestick-chart">CandlestickChart</h1>
      <p className="lead">
        Financial OHLC candlestick chart for visualizing stock prices, crypto markets, 
        and other time-series price data. Supports volume bars, interactive tooltips,
        zoom and pan, and crosshair cursor.
      </p>

      <h2 id="playground">Playground</h2>
      <p>
        Hover over candles to see OHLC values. Green candles indicate price increase 
        (close &gt; open), red candles indicate price decrease. Use mouse wheel to zoom
        and drag to pan. A crosshair follows your cursor for precise value reading.
      </p>

      <Playground
        name="CandlestickChart"
        defaultProps={{
          showVolume: true,
          enableZoom: true,
          showZoomControls: true,
        }}
        aspectRatio={16 / 10}
        controls={[
          { label: 'showVolume', type: 'boolean' },
          { label: 'enableZoom', type: 'boolean' },
          { label: 'showZoomControls', type: 'boolean' },
        ]}
        render={(p, dimensions) => (
          <CandlestickChart
            data={data}
            theme={p.theme as any}
            width={dimensions?.width ?? 700}
            height={dimensions?.height ?? 400}
            showVolume={p.showVolume as boolean}
            enableZoom={p.enableZoom as boolean}
            showZoomControls={p.showZoomControls as boolean}
          />
        )}
      />

      <h2 id="usage">Basic Usage</h2>
      <p>Import the component and provide OHLC data:</p>

      <CodeBlock
        language="tsx"
        code={`import { CandlestickChart } from '@derpdaderp/chartkit';

const data = [
  { time: 'Jan 1', open: 150.00, high: 155.50, low: 148.20, close: 153.80, volume: 2500000 },
  { time: 'Jan 2', open: 153.80, high: 158.00, low: 152.10, close: 149.50, volume: 3100000 },
  { time: 'Jan 3', open: 149.50, high: 152.30, low: 147.80, close: 151.20, volume: 2800000 },
  // ...more data
];

<CandlestickChart
  data={data}
  theme="${themeName}"
  height={400}
/>`}
      />

      <h2 id="with-volume">With Volume Bars</h2>
      <p>Enable volume visualization with the <code>showVolume</code> prop:</p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden"
        style={{ backgroundColor: theme.bgCard }}
      >
        <CandlestickChart
          data={data}
          theme={themeName as any}
          width={800}
          height={450}
          showVolume
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<CandlestickChart
  data={data}
  theme="${themeName}"
  showVolume
  volumeHeight={0.2}  // 20% of chart height for volume
/>`}
      />

      <h2 id="custom-colors">Custom Colors</h2>
      <p>Override the default bullish/bearish colors:</p>

      <div 
        className="not-prose my-6 rounded-lg border border-border overflow-hidden"
        style={{ backgroundColor: theme.bgCard }}
      >
        <CandlestickChart
          data={data}
          theme={themeName as any}
          width={800}
          height={350}
          upColor="#00d4aa"
          downColor="#ff6b6b"
        />
      </div>

      <CodeBlock
        language="tsx"
        code={`<CandlestickChart
  data={data}
  theme="${themeName}"
  upColor="#00d4aa"
  downColor="#ff6b6b"
/>`}
      />

      <h2 id="formatting">Price Formatting</h2>
      <p>Format Y-axis values with a custom formatter:</p>

      <CodeBlock
        language="tsx"
        code={`// Format as currency
<CandlestickChart
  data={data}
  theme="${themeName}"
  formatY={(value) => \`$\${value.toFixed(2)}\`}
/>

// Format for crypto (more decimals)
<CandlestickChart
  data={cryptoData}
  theme="${themeName}"
  formatY={(value) => value.toFixed(6)}
/>`}
      />

      <h2 id="zoom-pan">Zoom and Pan</h2>
      <p>
        CandlestickChart supports interactive zoom and pan out of the box, making it easy 
        to explore large datasets. This is enabled by default.
      </p>

      <h3>Interactions</h3>
      <ul>
        <li><strong>Mouse wheel</strong> - Scroll to zoom in/out (zooms toward cursor position)</li>
        <li><strong>Click and drag</strong> - Pan left/right through the data</li>
        <li><strong>Zoom controls</strong> - Use the +/- buttons in the top-right corner</li>
        <li><strong>Reset button</strong> - Click &quot;Reset&quot; to show all data</li>
        <li><strong>Crosshair</strong> - A crosshair follows your cursor for precise value reading</li>
      </ul>

      <CodeBlock
        language="tsx"
        code={`// Zoom and pan enabled by default
<CandlestickChart
  data={data}
  theme="${themeName}"
  enableZoom        // default: true
  showZoomControls  // default: true
  minVisibleCandles={10}
/>

// Disable zoom for static charts
<CandlestickChart
  data={data}
  theme="${themeName}"
  enableZoom={false}
/>

// Control visible range programmatically
<CandlestickChart
  data={data}
  theme="${themeName}"
  initialRange={[0, 30]}  // Show first 30 candles
  onRangeChange={(range) => console.log('Visible:', range)}
/>`}
      />

      <h2 id="responsive">Responsive</h2>
      <p>Use the <code>responsive</code> prop to auto-fill container width:</p>

      <CodeBlock
        language="tsx"
        code={`<CandlestickChart
  data={data}
  theme="${themeName}"
  responsive
  height={400}
  showVolume
/>`}
      />

      <h2 id="props">Props</h2>
      <PropsTable props={props} />

      <h2 id="data-point">CandlestickDataPoint</h2>
      <p>Each data point requires OHLC values:</p>
      <PropsTable props={dataPointProps} />

      <h2 id="reading-candles">Reading Candlestick Charts</h2>
      <ul>
        <li><strong>Green candles</strong> - Bullish (close &gt; open), price went up</li>
        <li><strong>Red candles</strong> - Bearish (close &lt; open), price went down</li>
        <li><strong>Wick (thin line)</strong> - Shows the high and low prices</li>
        <li><strong>Body (thick rectangle)</strong> - Shows the open and close prices</li>
        <li><strong>Volume bars</strong> - Trading activity, higher = more trades</li>
        <li><strong>Crosshair</strong> - Guides your eye to exact values on hover</li>
      </ul>
    </DocsLayout>
  );
}
