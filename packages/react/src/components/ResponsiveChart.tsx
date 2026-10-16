import { type CSSProperties, type ReactNode } from 'react';
import { useResizeObserver } from '../hooks';

export interface ResponsiveChartProps {
  /** Render function that receives the measured dimensions */
  children: (dimensions: { width: number; height: number }) => ReactNode;
  /** Fixed height in pixels. If not provided, height will be measured from container */
  height?: number;
  /** Minimum width before rendering (prevents rendering at 0 width) */
  minWidth?: number;
  /** Minimum height before rendering */
  minHeight?: number;
  /** Aspect ratio (width/height). Used when height is not specified */
  aspectRatio?: number;
  /** Additional CSS class for the container */
  className?: string;
  /** Additional inline styles for the container */
  style?: CSSProperties;
  /** Placeholder to show while measuring */
  placeholder?: ReactNode;
}

/**
 * ResponsiveChart - A wrapper component that handles responsive sizing
 * 
 * Eliminates boilerplate for making charts responsive in flex containers.
 * Uses ResizeObserver internally for efficient size tracking.
 * 
 * @example
 * ```tsx
 * // Basic usage with fixed height
 * <ResponsiveChart height={300}>
 *   {({ width }) => (
 *     <MonitorLine width={width} height={300} data={data} theme="cloudflare" />
 *   )}
 * </ResponsiveChart>
 * 
 * // With aspect ratio (16:9)
 * <ResponsiveChart aspectRatio={16/9}>
 *   {({ width, height }) => (
 *     <BarChart width={width} height={height} data={data} theme="vercel" />
 *   )}
 * </ResponsiveChart>
 * 
 * // Fully responsive (fills container)
 * <div style={{ width: '100%', height: '400px' }}>
 *   <ResponsiveChart>
 *     {({ width, height }) => (
 *       <StackedArea width={width} height={height} data={data} theme="turbo" />
 *     )}
 *   </ResponsiveChart>
 * </div>
 * ```
 */
export function ResponsiveChart({
  children,
  height: fixedHeight,
  minWidth = 1,
  minHeight = 1,
  aspectRatio,
  className,
  style,
  placeholder,
}: ResponsiveChartProps) {
  const { ref, size, ready } = useResizeObserver<HTMLDivElement>();

  // Calculate the effective height
  const effectiveHeight = fixedHeight ?? (aspectRatio ? size.width / aspectRatio : size.height);

  // Determine if we should render the chart
  const shouldRender = ready && size.width >= minWidth && effectiveHeight >= minHeight;

  // Build container styles
  const containerStyle: CSSProperties = {
    width: '100%',
    height: fixedHeight ?? (aspectRatio ? 'auto' : '100%'),
    position: 'relative',
    ...style,
  };

  // For aspect ratio mode, we need padding-bottom trick or explicit height
  if (aspectRatio && !fixedHeight) {
    containerStyle.height = size.width > 0 ? size.width / aspectRatio : 0;
  }

  return (
    <div ref={ref} className={className} style={containerStyle}>
      {shouldRender ? (
        children({ width: size.width, height: effectiveHeight })
      ) : (
        placeholder ?? null
      )}
    </div>
  );
}
