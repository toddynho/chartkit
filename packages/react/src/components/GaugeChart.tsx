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
  strokeWidth,
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
  const arcWidth = strokeWidth ?? Math.min(28, Math.max(18, size * 0.11));

  const center = size / 2;
  const radius = (size - arcWidth * 2 - 36) / 2; // Extra padding for labels
  const innerRadius = radius - arcWidth / 2;

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

      const innerX = center + (radius + arcWidth / 2 + 2) * Math.cos(angleRad);
      const innerY = center + (radius + arcWidth / 2 + 2) * Math.sin(angleRad);
      const outerX = center + (radius + arcWidth / 2 + 9) * Math.cos(angleRad);
      const outerY = center + (radius + arcWidth / 2 + 9) * Math.sin(angleRad);
      const labelX = center + (radius + arcWidth / 2 + 20) * Math.cos(angleRad);
      const labelY = center + (radius + arcWidth / 2 + 20) * Math.sin(angleRad);

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
  }, [min, max, tickCount, radius, arcWidth, center, startAngle, endAngle]);

  // Calculate needle position — same angle as the value arc, ending on its inner edge.
  const needleAngleRad = ((currentAngle - 90) * Math.PI) / 180;
  const needleLength = innerRadius;
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
    const x1 = center + (radius + arcWidth / 2 + 2) * Math.cos(angleRad);
    const y1 = center + (radius + arcWidth / 2 + 2) * Math.sin(angleRad);
    const x2 = center + (radius + arcWidth / 2 + 12) * Math.cos(angleRad);
    const y2 = center + (radius + arcWidth / 2 + 12) * Math.sin(angleRad);
    return { x1, y1, x2, y2 };
  }, [target, radius, arcWidth, center, startAngle, endAngle, min, max]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size * 0.7, // Slightly shorter for semi-circle gauges
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <svg width={size} height={size} style={{ marginTop: -size * 0.15 }} data-ck-target={target}>
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle, radius)}
          fill="none"
          stroke={t.gridLine}
          strokeWidth={arcWidth}
          strokeLinecap="butt"
        />

        {/* Range segments (if provided) */}
        {ranges?.map((range, i) => {
          const rangeStart = valueToAngle(Math.max(min, range.min));
          const rangeEnd = valueToAngle(Math.min(max, range.max));
          const bandRadius = radius - arcWidth / 2 - 6;
          return (
            <path
              key={i}
              d={describeArc(rangeStart, rangeEnd, bandRadius)}
              fill="none"
              stroke={range.color}
              strokeWidth={Math.max(3, arcWidth * 0.28)}
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
          strokeWidth={arcWidth}
          strokeLinecap="butt"
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

        {/* Target is a tick on the scale, not a floating handle. */}
        {targetMarker && (
          <line
            x1={targetMarker.x1}
            y1={targetMarker.y1}
            x2={targetMarker.x2}
            y2={targetMarker.y2}
            stroke={t.text}
            strokeWidth={1.75}
          >
            <title>{`Target ${format(target ?? 0)}`}</title>
          </line>
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
                fontSize: size * 0.2,
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
                  fontSize: 12,
                  color: t.textSecondary,
                  marginTop: 10,
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
