import { useMemo, type CSSProperties } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, inverseLinearScale, interpolateY } from '../utils';
import { useMouseTracking } from '../hooks';

export interface SpikeChartProps<T extends Record<string, unknown>> {
  /** Data array with time and value */
  data: T[];
  /** Key to extract numeric value */
  dataKey?: keyof T;
  /** Key for time/x-axis values */
  timeKey?: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Override baseline color */
  baselineColor?: string;
  /** Tooltip label */
  label?: string;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface TooltipState {
  y: number;
  value: number;
  time: string;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 40 };

/**
 * SpikeChart - For displaying discrete events/spikes over time
 * Similar to Cloudflare's blocked requests visualization
 * 
 * @example
 * ```tsx
 * <SpikeChart
 *   data={eventData}
 *   dataKey="count"
 *   timeKey="timestamp"
 *   theme="cloudflare"
 *   label="Blocked Requests"
 * />
 * ```
 */
export function SpikeChart<T extends Record<string, unknown>>({
  data,
  dataKey = 'value' as keyof T,
  timeKey = 'time' as keyof T,
  width = 600,
  height = 200,
  theme,
  baselineColor,
  label = 'Allowed Requests',
  className,
  style,
}: SpikeChartProps<T>) {
  const t = themes[theme];

  const chartWidth = width - MARGIN.left - MARGIN.right;
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  const { svgRef, mouse, handleMouseMove, handleMouseLeave } = useMouseTracking({
    marginLeft: MARGIN.left,
    chartWidth,
  });

  // Calculate scales
  const { xScale, yScale, pathD, yTicks, xTicks, max } = useMemo(() => {
    const values = data.map((d) => Number(d[dataKey]) || 0);
    const maxVal = Math.max(...values, 1);

    const xS = linearScale([0, data.length - 1], [0, chartWidth]);
    const yS = linearScale([0, maxVal + 0.5], [chartHeight, 0]);

    const path = data
      .map((d, i) => {
        const value = Number(d[dataKey]) || 0;
        return `${i === 0 ? 'M' : 'L'} ${xS(i)} ${yS(value)}`;
      })
      .join(' ');

    const yT = Array.from({ length: Math.min(maxVal + 1, 6) }, (_, i) => i);
    const xT = [
      0,
      Math.floor(data.length * 0.33),
      Math.floor(data.length * 0.66),
      data.length - 1,
    ].filter((i) => i < data.length);

    return { xScale: xS, yScale: yS, pathD: path, yTicks: yT, xTicks: xT, max: maxVal };
  }, [data, dataKey, chartWidth, chartHeight]);

  // Calculate tooltip data when hovering
  const tooltipData = useMemo<TooltipState | null>(() => {
    if (mouse.x === null) return null;

    const { y, value } = interpolateY(data, dataKey, mouse.x, chartWidth, yScale);

    // Find nearest time label
    const xInverse = inverseLinearScale([0, data.length - 1], [0, chartWidth]);
    const nearestIndex = Math.round(xInverse(mouse.x));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, nearestIndex));

    return {
      y,
      value: Math.round(value),
      time: String(data[clampedIndex][timeKey] ?? ''),
    };
  }, [mouse.x, data, dataKey, timeKey, chartWidth, yScale]);

  const resolvedBaselineColor = baselineColor ?? t.baseline ?? t.colors[4];

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair', display: 'block', maxWidth: '100%' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Y axis labels */}
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-12}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: '12px' }}
            >
              {tick}
            </text>
          ))}

          {/* X axis labels */}
          {xTicks.map((tick) => (
            <text
              key={tick}
              x={xScale(tick)}
              y={chartHeight + 24}
              textAnchor="middle"
              fill={t.textMuted}
              style={{ fontSize: '11px' }}
            >
              {String(data[tick]?.[timeKey] ?? '')}
            </text>
          ))}

          {/* Baseline */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={resolvedBaselineColor}
            strokeWidth={2}
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={t.colors[0]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cursor tracking line */}
          {mouse.x !== null && (
            <>
              <line
                x1={mouse.x}
                y1={0}
                x2={mouse.x}
                y2={chartHeight}
                stroke={t.text}
                strokeWidth={1}
                opacity={0.3}
                style={{ transition: 'x1 0.05s ease-out, x2 0.05s ease-out' }}
              />
              {tooltipData && (
                <circle
                  cx={mouse.x}
                  cy={tooltipData.y}
                  r={5}
                  fill={t.colors[0]}
                  style={{ transition: 'cy 0.05s ease-out' }}
                />
              )}
            </>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipData && mouse.x !== null && (() => {
        // Calculate tooltip position - flip to left side if near right edge
        const tooltipWidth = 160;
        const tooltipOffset = 16;
        const isNearRightEdge = mouse.x > chartWidth - tooltipWidth;
        const tooltipLeft = isNearRightEdge 
          ? MARGIN.left + mouse.x - tooltipWidth - tooltipOffset
          : MARGIN.left + mouse.x + tooltipOffset;
        
        return (
        <div
          style={{
            position: 'absolute',
            top: MARGIN.top,
            left: tooltipLeft,
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 10,
            transition: 'left 0.05s ease-out',
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
                borderRadius: '50%',
                backgroundColor: t.colors[0],
              }}
            />
            <span style={{ fontSize: '13px', color: t.text, fontWeight: 500 }}>
              {label}
            </span>
            <span style={{ fontSize: '13px', color: t.text, fontWeight: 700 }}>
              {tooltipData.value}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: t.textSecondary }}>
            {tooltipData.time}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
