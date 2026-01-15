import { useMemo } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, extent, padExtent, linePath, areaPath } from '../utils';
import { useUniqueId } from '../hooks';

export interface MiniAreaProps<T = Record<string, unknown>> {
  /** Data array - can be objects or plain numbers */
  data: T[] | number[];
  /** Key to extract numeric value when data contains objects */
  dataKey?: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Override line/fill color */
  color?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * MiniArea - A small area chart with gradient fill
 * 
 * @example
 * ```tsx
 * <MiniArea 
 *   data={[10, 20, 15, 30, 25]} 
 *   theme="monitor-dark"
 * />
 * ```
 */
export function MiniArea<T extends Record<string, unknown>>({
  data,
  dataKey = 'value' as keyof T,
  width = 160,
  height = 40,
  theme,
  color,
  className,
}: MiniAreaProps<T>) {
  const t = themes[theme];
  const lineColor = color ?? t.colors[0];
  const gradientId = useUniqueId('mini-area-gradient');

  const { pathD, areaD } = useMemo(() => {
    // Extract numeric values from data
    const values = data.map((d) =>
      typeof d === 'number' ? d : Number(d[dataKey]) || 0
    );

    if (values.length === 0) {
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

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
      role="img"
      aria-label="Mini area chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
