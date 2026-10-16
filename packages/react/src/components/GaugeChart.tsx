import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';

export interface GaugeChartProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Chart size (diameter) */
  size?: number;
  /** Arc stroke width */
  strokeWidth?: number;
  /** Theme name */
  theme: ThemeName;
  /** Arc start angle in degrees (0 = top) */
  startAngle?: number;
  /** Arc end angle in degrees */
  endAngle?: number;
  /** Color ranges for different values */
  ranges?: { min: number; max: number; color: string }[];
  /** Target/goal value to show marker */
  target?: number;
  /** Show tick marks */
  showTicks?: boolean;
  /** Number of tick marks */
  tickCount?: number;
  /** Show value labels on ticks */
  showTickLabels?: boolean;
  /** Custom value formatter */
  format?: (value: number) => string;
  /** Label below the value */
  label?: string;
  /** Content to display in center (overrides default) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

/**
 * GaugeChart - Semicircular or arc gauge for single metrics
 * 
 * @example
 * ```tsx
 * <GaugeChart
 *   value={72}
 *   max={100}
 *   theme="monitor-dark"
 *   ranges={[
 *     { min: 0, max: 30, color: '#ef4444' },
 *     { min: 30, max: 70, color: '#f59e0b' },
 *     { min: 70, max: 100, color: '#22c55e' },
 *   ]}
 *   target={80}
 *   label="Performance Score"
 * />
 * ```
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  size = 200,
  strokeWidth = 16,
  theme,
  startAngle = -135,
  endAngle = 135,
  ranges,
  target,
  showTicks = true,
  tickCount = 5,
  showTickLabels = true,
  format = (v) => v.toLocaleString(),
  label,
  children,
  className,
  style,
}: GaugeChartProps) {
  const t = themes[theme];

  const center = size / 2;
  const radius = (size - strokeWidth * 2 - 20) / 2; // Extra padding for labels
  const innerRadius = radius - strokeWidth / 2;

  // Calculate the total angle span
  const angleSpan = endAngle - startAngle;

  // Convert value to angle
  const valueToAngle = (v: number) => {
    const percentage = (v - min) / (max - min);
    return startAngle + percentage * angleSpan;
  };

  const currentAngle = valueToAngle(Math.min(max, Math.max(min, value)));

  // Generate arc path
  const describeArc = (start: number, end: number, r: number) => {
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((end - 90) * Math.PI) / 180;

    const x1 = center + r * Math.cos(startRad);
    const y1 = center + r * Math.sin(startRad);
    const x2 = center + r * Math.cos(endRad);
    const y2 = center + r * Math.sin(endRad);

    const largeArc = end - start > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Generate tick marks
  const ticks = useMemo(() => {
    const result = [];
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + (max - min) * (i / (tickCount - 1));
      const angle = valueToAngle(tickValue);
      const angleRad = ((angle - 90) * Math.PI) / 180;

      const innerX = center + (radius - strokeWidth / 2 - 4) * Math.cos(angleRad);
      const innerY = center + (radius - strokeWidth / 2 - 4) * Math.sin(angleRad);
      const outerX = center + (radius + strokeWidth / 2 + 2) * Math.cos(angleRad);
      const outerY = center + (radius + strokeWidth / 2 + 2) * Math.sin(angleRad);
      const labelX = center + (radius + strokeWidth / 2 + 14) * Math.cos(angleRad);
      const labelY = center + (radius + strokeWidth / 2 + 14) * Math.sin(angleRad);

      result.push({
        value: tickValue,
        innerX,
        innerY,
        outerX,
        outerY,
        labelX,
        labelY,
      });
    }
    return result;
  }, [min, max, tickCount, radius, strokeWidth, center]);

  // Calculate needle position
  const needleAngleRad = ((currentAngle - 90) * Math.PI) / 180;
  const needleLength = radius - strokeWidth / 2 - 8;
  const needleX = center + needleLength * Math.cos(needleAngleRad);
  const needleY = center + needleLength * Math.sin(needleAngleRad);

  // Get color for current value
  const getValueColor = () => {
    if (!ranges) return t.colors[0];
    for (const range of ranges) {
      if (value >= range.min && value <= range.max) {
        return range.color;
      }
    }
    return t.colors[0];
  };

  const valueColor = getValueColor();

  // Target marker position
  const targetMarker = useMemo(() => {
    if (target === undefined) return null;
    const angle = valueToAngle(target);
    const angleRad = ((angle - 90) * Math.PI) / 180;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    return { x, y, angle };
  }, [target, radius, center]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size * 0.7, // Slightly shorter for semi-circle gauges
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <svg width={size} height={size} style={{ marginTop: -size * 0.15 }}>
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle, radius)}
          fill="none"
          stroke={t.gridLine}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Range segments (if provided) */}
        {ranges?.map((range, i) => {
          const rangeStart = valueToAngle(Math.max(min, range.min));
          const rangeEnd = valueToAngle(Math.min(max, range.max));
          return (
            <path
              key={i}
              d={describeArc(rangeStart, rangeEnd, radius)}
              fill="none"
              stroke={range.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              opacity={0.3}
            />
          );
        })}

        {/* Value arc */}
        <path
          d={describeArc(startAngle, currentAngle, radius)}
          fill="none"
          stroke={valueColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'all 0.5s ease-out' }}
        />

        {/* Tick marks */}
        {showTicks &&
          ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.innerX}
                y1={tick.innerY}
                x2={tick.outerX}
                y2={tick.outerY}
                stroke={t.textMuted}
                strokeWidth={1.5}
              />
              {showTickLabels && (
                <text
                  x={tick.labelX}
                  y={tick.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={t.textMuted}
                  style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {format(tick.value)}
                </text>
              )}
            </g>
          ))}

        {/* Target marker */}
        {targetMarker && (
          <g>
            <circle
              cx={targetMarker.x}
              cy={targetMarker.y}
              r={6}
              fill={t.bgCard}
              stroke={t.accent}
              strokeWidth={2}
            />
          </g>
        )}

        {/* Needle */}
        <g>
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke={valueColor}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease-out' }}
          />
          <circle
            cx={center}
            cy={center}
            r={8}
            fill={t.bgCard}
            stroke={valueColor}
            strokeWidth={3}
          />
        </g>
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: t.text,
        }}
      >
        {children ?? (
          <>
            <div
              style={{
                fontSize: size * 0.15,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: valueColor,
              }}
            >
              {format(value)}
            </div>
            {label && (
              <div
                style={{
                  fontSize: size * 0.07,
                  color: t.textSecondary,
                  marginTop: '4px',
                }}
              >
                {label}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
