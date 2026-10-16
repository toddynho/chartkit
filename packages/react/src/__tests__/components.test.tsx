import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Sparkline,
  MiniArea,
  BarChart,
  DonutChart,
  ProgressRing,
  GaugeChart,
  Legend,
} from '../components';

describe('Sparkline', () => {
  const data = [{ value: 10 }, { value: 50 }, { value: 30 }];

  it('should render SVG element', () => {
    const { container } = render(
      <Sparkline data={data} theme="midnight" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render with custom dimensions', () => {
    const { container } = render(
      <Sparkline data={data} theme="midnight" width={200} height={50} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('should render path element', () => {
    const { container } = render(
      <Sparkline data={data} theme="midnight" />
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });
});

describe('MiniArea', () => {
  const data = [{ value: 10 }, { value: 50 }, { value: 30 }];

  it('should render SVG element', () => {
    const { container } = render(
      <MiniArea data={data} theme="midnight" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render with gradient', () => {
    const { container } = render(
      <MiniArea data={data} theme="midnight" />
    );
    expect(container.querySelector('linearGradient')).toBeInTheDocument();
  });
});

describe('BarChart', () => {
  const data = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 200 },
    { month: 'Mar', value: 150 },
  ];

  it('should render SVG element', () => {
    const { container } = render(
      <BarChart
        data={data}
        dataKey="value"
        categoryKey="month"
        theme="midnight"
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render bars (rect elements)', () => {
    const { container } = render(
      <BarChart
        data={data}
        dataKey="value"
        categoryKey="month"
        theme="midnight"
      />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('should render category labels', () => {
    const { container } = render(
      <BarChart
        data={data}
        dataKey="value"
        categoryKey="month"
        theme="midnight"
      />
    );
    expect(container.textContent).toContain('Jan');
    expect(container.textContent).toContain('Feb');
    expect(container.textContent).toContain('Mar');
  });
});

describe('DonutChart', () => {
  const data = [
    { category: 'A', value: 30 },
    { category: 'B', value: 50 },
    { category: 'C', value: 20 },
  ];

  it('should render SVG element', () => {
    const { container } = render(
      <DonutChart
        data={data}
        dataKey="value"
        labelKey="category"
        theme="midnight"
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render segments (path elements)', () => {
    const { container } = render(
      <DonutChart
        data={data}
        dataKey="value"
        labelKey="category"
        theme="midnight"
      />
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  it('should render legend by default', () => {
    render(
      <DonutChart
        data={data}
        dataKey="value"
        labelKey="category"
        theme="midnight"
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should hide legend when showLegend is false', () => {
    const { container } = render(
      <DonutChart
        data={data}
        dataKey="value"
        labelKey="category"
        theme="midnight"
        showLegend={false}
      />
    );
    // Only SVG should contain the category text, not in legend
    expect(container.querySelectorAll('svg').length).toBe(1);
  });
});

describe('ProgressRing', () => {
  it('should render SVG element', () => {
    const { container } = render(
      <ProgressRing value={75} theme="midnight" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render circles for track and progress', () => {
    const { container } = render(
      <ProgressRing value={75} theme="midnight" />
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2); // Track + progress
  });

  it('should show percentage by default', () => {
    render(<ProgressRing value={75} theme="midnight" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should hide value when showValue is false', () => {
    const { container } = render(
      <ProgressRing value={75} theme="midnight" showValue={false} />
    );
    expect(container.textContent).not.toContain('75%');
  });

  it('should render custom children', () => {
    render(
      <ProgressRing value={75} theme="midnight">
        <span>Custom</span>
      </ProgressRing>
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});

describe('GaugeChart', () => {
  it('should render SVG element', () => {
    const { container } = render(
      <GaugeChart value={72} theme="midnight" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render arc paths', () => {
    const { container } = render(
      <GaugeChart value={72} theme="midnight" />
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should show value', () => {
    render(<GaugeChart value={72} theme="midnight" />);
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('should show label when provided', () => {
    render(<GaugeChart value={72} theme="midnight" label="Score" />);
    expect(screen.getByText('Score')).toBeInTheDocument();
  });
});

describe('Legend', () => {
  const items = [
    { key: 'a', label: 'Series A', color: '#ff0000' },
    { key: 'b', label: 'Series B', color: '#00ff00' },
    { key: 'c', label: 'Series C', color: '#0000ff' },
  ];

  it('should render all items', () => {
    render(<Legend items={items} theme="midnight" />);
    expect(screen.getByText('Series A')).toBeInTheDocument();
    expect(screen.getByText('Series B')).toBeInTheDocument();
    expect(screen.getByText('Series C')).toBeInTheDocument();
  });

  it('should show values when provided', () => {
    const itemsWithValues = items.map(item => ({ ...item, value: '100' }));
    render(<Legend items={itemsWithValues} theme="midnight" />);
    const values = screen.getAllByText('100');
    expect(values.length).toBe(3);
  });

  it('should render as buttons when interactive with onItemClick', () => {
    const { container } = render(
      <Legend 
        items={items} 
        theme="midnight" 
        interactive 
        onItemClick={() => {}} 
      />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should not render as buttons when not interactive', () => {
    const { container } = render(
      <Legend items={items} theme="midnight" interactive={false} />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});
