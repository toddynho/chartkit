import { useMemo } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, extent, padExtent, linePath, areaPath } from '../utils';
import { useUniqueId, useResizeObserver } from '../hooks';

export interface SparklineProps<T = Record<string, unknown>> {
  /** Data array - can be objects or plain numbers */
  data: T[] | number[];
  /** Key to extract numeric value when data contains objects */
  dataKey?: keyof T;
  /** Chart width in pixels (auto-fills container if not specified) */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Override line color */
  color?: string;
  /** Enable glow effect on line */
  glow?: boolean;
  /** Fill area under the line */
  fill?: boolean;
  /** Line stroke width */
  strokeWidth?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Sparkline - A minimal inline chart for showing trends
 * 
 * Automatically fills container width if width prop is not specified.
 * 
 * @example
 * ```tsx
 * // Auto-fills container width
 * <div style={{ width: '100%' }}>
 *   <Sparkline data={[10, 20, 15, 30, 25]} theme="midnight" />
 * </div>
 * 
 * // Fixed width
 * <Sparkline data={[10, 20, 15, 30, 25]} width={120} theme="midnight" />
 * ```
 */
export function Sparkline<T extends Record<string, unknown>>({
  data,
  dataKey = 'value' as keyof T,
  width: widthProp,
  height = 32,
  theme,
  color,
  glow = false,
  fill = false,
  strokeWidth = 1.5,
  className,
}: SparklineProps<T>) {
  const t = themes[theme];
  const lineColor = color ?? t.colors[0];
  const glowId = useUniqueId('sparkline-glow');
  
  // Use resize observer for responsive sizing
  const { ref, size, ready } = useResizeObserver<HTMLDivElement>();
  const isResponsive = widthProp === undefined;
  const width = isResponsive ? (size.width || 120) : widthProp;

  const { pathD, areaD } = useMemo(() => {
    // Extract numeric values from data
    const values = data.map((d) =>
      typeof d === 'number' ? d : Number(d[dataKey]) || 0
    );

    if (values.length === 0 || width <= 0) {
      return { pathD: '', areaD: '' };
    }

    // Calculate scales
    const [min, max] = extent(values);
    const [yMin, yMax] = padExtent([min, max], 0.1);
    
    const xScale = linearScale([0, values.length - 1], [0, width]);
    const yScale = linearScale([yMin, yMax], [height, 0]);

    return {
      pathD: linePath(values, xScale, yScale),
      areaD: areaPath(values, xScale, yScale, width, height),
    };
  }, [data, dataKey, width, height]);

  // For responsive mode, wrap in a div that fills container
  if (isResponsive) {
    return (
      <div 
        ref={ref} 
        className={className}
        style={{ width: '100%', height }}
      >
        {ready && width > 0 && (
          <svg
            width={width}
            height={height}
            style={{ display: 'block' }}
            role="img"
            aria-label="Sparkline chart"
          >
            {glow && (
              <defs>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            )}
            {fill && <path d={areaD} fill={lineColor} opacity={0.1} />}
            <path
              d={pathD}
              fill="none"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={glow ? `url(#${glowId})` : undefined}
            />
          </svg>
        )}
      </div>
    );
  }

  // Fixed width mode
  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
      role="img"
      aria-label="Sparkline chart"
    >
      {glow && (
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {fill && <path d={areaD} fill={lineColor} opacity={0.1} />}
      <path
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#${glowId})` : undefined}
      />
    </svg>
  );
}
