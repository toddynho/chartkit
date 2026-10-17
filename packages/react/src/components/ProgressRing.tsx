import { type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';

export interface ProgressRingProps {
  /** Current value (0-100 or custom range with min/max) */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Ring size (diameter) */
  size?: number;
  /** Ring stroke width */
  strokeWidth?: number;
  /** Theme name */
  theme: ThemeName;
  /** Custom color (overrides theme) */
  color?: string;
  /** Track color (background ring) */
  trackColor?: string;
  /** Show percentage text */
  showValue?: boolean;
  /** Custom value formatter */
  format?: (value: number, percentage: number) => string;
  /** Content to display in center (overrides showValue) */
  children?: ReactNode;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Ring end style */
  strokeLinecap?: 'butt' | 'round' | 'square';
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

/**
 * ProgressRing - Circular progress indicator
 * 
 * @example
 * ```tsx
 * // Simple percentage
 * <ProgressRing value={75} theme="monitor-dark" />
 * 
 * // With custom content
 * <ProgressRing value={750} max={1000} theme="monitor-dark">
 *   <div>
 *     <div style={{ fontSize: 24, fontWeight: 700 }}>750</div>
 *     <div style={{ fontSize: 12 }}>of 1000</div>
 *   </div>
 * </ProgressRing>
 * ```
 */
export function ProgressRing({
  value,
  min = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  theme,
  color,
  trackColor,
  showValue = true,
  format,
  children,
  animationDuration = 500,
  strokeLinecap = 'round',
  className,
  style,
}: ProgressRingProps) {
  const t = themes[theme];

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  // Colors
  const progressColor = color || t.colors[0];
  const bgColor = trackColor || t.gridLine;

  // Format value
  const displayValue = format 
    ? format(value, percentage) 
    : `${Math.round(percentage)}%`;

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: `stroke-dashoffset ${animationDuration}ms ease-out`,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: t.text,
        }}
      >
        {children ?? (showValue && (
          <span
            style={{
              fontSize: size * 0.2,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {displayValue}
          </span>
        ))}
      </div>
    </div>
  );
}

// Also export as ProgressCircle for convenience
export { ProgressRing as ProgressCircle };
