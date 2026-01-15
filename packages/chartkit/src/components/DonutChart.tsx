import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';

export interface DonutChartProps<T extends Record<string, unknown>> {
  /** Data array */
  data: T[];
  /** Key for segment values */
  dataKey: keyof T;
  /** Key for segment labels */
  labelKey: keyof T;
  /** Chart size (width and height) */
  size?: number;
  /** Theme name */
  theme: ThemeName;
  /** Inner radius ratio (0 = pie, 0.6 = donut) */
  innerRadius?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'right' | 'bottom';
  /** Custom value formatter */
  format?: (value: number) => string;
  /** Content to display in center (for donut) */
  centerContent?: ReactNode;
  /** Pad angle between segments in degrees */
  padAngle?: number;
  /** Corner radius for segments */
  cornerRadius?: number;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface Segment {
  label: string;
  value: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

interface TooltipState {
  segment: Segment;
  x: number;
  y: number;
}

/**
 * Converts polar coordinates to Cartesian
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

/**
 * Creates an SVG arc path
 */
function describeArc(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  if (innerRadius === 0) {
    // Pie slice
    return [
      'M', cx, cy,
      'L', outerEnd.x, outerEnd.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 1, outerStart.x, outerStart.y,
      'Z',
    ].join(' ');
  }

  // Donut segment
  return [
    'M', outerEnd.x, outerEnd.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, outerStart.x, outerStart.y,
    'L', innerStart.x, innerStart.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, innerEnd.x, innerEnd.y,
    'Z',
  ].join(' ');
}

/**
 * DonutChart - Donut or pie chart for proportional data
 * 
 * @example
 * ```tsx
 * <DonutChart
 *   data={[
 *     { category: 'Desktop', value: 65 },
 *     { category: 'Mobile', value: 30 },
 *     { category: 'Tablet', value: 5 },
 *   ]}
 *   dataKey="value"
 *   labelKey="category"
 *   theme="monitor-dark"
 *   centerContent={<span>100%</span>}
 * />
 * ```
 */
export function DonutChart<T extends Record<string, unknown>>({
  data,
  dataKey,
  labelKey,
  size = 200,
  theme,
  innerRadius = 0.6,
  showLegend = true,
  legendPosition = 'right',
  format = (v) => v.toLocaleString(),
  centerContent,
  padAngle = 2,
  cornerRadius = 0,
  className,
  style,
}: DonutChartProps<T>) {
  const t = themes[theme];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const outerRadius = size / 2 - 10;
  const innerRad = outerRadius * innerRadius;
  const cx = size / 2;
  const cy = size / 2;

  // Calculate segments
  const segments = useMemo<Segment[]>(() => {
    const total = data.reduce((sum, d) => sum + (Number(d[dataKey]) || 0), 0);
    if (total === 0) return [];

    let currentAngle = 0;
    const totalPadAngle = padAngle * data.length;
    const availableAngle = 360 - totalPadAngle;

    return data.map((d, i) => {
      const value = Number(d[dataKey]) || 0;
      const percentage = (value / total) * 100;
      const segmentAngle = (value / total) * availableAngle;
      
      const startAngle = currentAngle + padAngle / 2;
      const endAngle = startAngle + segmentAngle;
      currentAngle = endAngle + padAngle / 2;

      return {
        label: String(d[labelKey]),
        value,
        percentage,
        color: t.colors[i % t.colors.length],
        startAngle,
        endAngle,
      };
    });
  }, [data, dataKey, labelKey, padAngle, t.colors]);

  const handleSegmentHover = (segment: Segment, index: number, e: React.MouseEvent) => {
    setHoveredIndex(index);
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const containerRect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
    if (containerRect) {
      setTooltip({
        segment,
        x: rect.x - containerRect.x + rect.width / 2,
        y: rect.y - containerRect.y,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip(null);
  };

  const isHorizontal = legendPosition === 'right';
  
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: 'center',
    gap: '24px',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Chart */}
      <div style={{ position: 'relative' }}>
        <svg
          width={size}
          height={size}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block' }}
        >
          {segments.map((segment, i) => {
            const isHovered = hoveredIndex === i;
            const scale = isHovered ? 1.05 : 1;
            
            return (
              <path
                key={i}
                d={describeArc(
                  cx,
                  cy,
                  outerRadius * scale,
                  innerRad * scale,
                  segment.startAngle,
                  segment.endAngle
                )}
                fill={segment.color}
                opacity={hoveredIndex !== null && !isHovered ? 0.5 : 1}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                onMouseEnter={(e) => handleSegmentHover(segment, i, e)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        {innerRadius > 0 && centerContent && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: t.text,
              pointerEvents: 'none',
            }}
          >
            {centerContent}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {segments.map((segment, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? `${segment.color}15` : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: segment.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: t.textSecondary,
                    minWidth: '80px',
                  }}
                >
                  {segment.label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: t.text,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y - 60,
            left: tooltip.x,
            transform: 'translateX(-50%)',
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: tooltip.segment.color,
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: t.text }}>
              {tooltip.segment.label}
            </span>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: t.textSecondary,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {format(tooltip.segment.value)} ({tooltip.segment.percentage.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}
