import { useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, interpolateY } from '../utils';
import { useUniqueId, useMouseTracking } from '../hooks';
import type { DataPointClickEvent, TooltipRenderProps, Annotation } from './types';
import { Annotations } from './Annotations';

export interface SeriesConfig {
  /** Unique key matching data property */
  key: string;
  /** Display label */
  label: string;
  /** Current/summary value shown in legend badge */
  displayValue?: string;
}

export interface MonitorLineProps<T extends Record<string, unknown>> {
  /** Data array with time and series values */
  data: T[];
  /** Series configuration */
  series: SeriesConfig[];
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Key for time/x-axis values */
  timeKey?: keyof T;
  /** Unit label for values (e.g., "ms", "req/s") */
  unit?: string;
  /** Enable glow effect on lines */
  glow?: boolean;
  /** Padding around the chart */
  padding?: number;
  /** Connect null/missing values (draw line through gaps) */
  connectNulls?: boolean;
  /** Click handler for data points */
  onDataPointClick?: (event: DataPointClickEvent<T>) => void;
  /** Custom tooltip renderer */
  renderTooltip?: (props: TooltipRenderProps<T>) => ReactNode;
  /** Reference lines and areas */
  annotations?: Annotation[];
  /** Additional CSS class */
  className?: string;
  /** Custom styles for container */
  style?: CSSProperties;
}

interface TooltipData {
  key: string;
  label: string;
  y: number;
  value: number;
  color: string;
}

// Responsive sizing helpers
function getResponsiveFontSize(width: number, base: number) {
  const scale = Math.max(0.7, Math.min(1, width / 600));
  return Math.round(base * scale);
}

// Estimate text width (approximate: monospace chars are ~0.65 of font size)
function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.65;
}

// Calculate dynamic margins based on label content
function calculateMargins(width: number, maxYLabel: string, fontSize: number) {
  const scale = Math.min(1, width / 600);
  
  // Calculate left margin based on Y-axis label width
  const yLabelWidth = estimateTextWidth(maxYLabel, fontSize);
  const baseLeftMargin = Math.max(yLabelWidth + 12, 40 * scale);
  
  // Calculate bottom margin based on font size for X-axis (need room for labels)
  const baseBottomMargin = Math.max(fontSize * 2 + 16, 40);
  
  // Right margin needs room for half the last X-axis label (centered text)
  const baseRightMargin = Math.max(fontSize * 2.5, 20);
  
  return {
    top: Math.round(12 * scale),
    right: Math.round(baseRightMargin),
    bottom: Math.round(baseBottomMargin),
    left: Math.round(baseLeftMargin),
  };
}

/**
 * MonitorLine - Multi-series line chart with interactive legend toggles
 * 
 * @example
 * ```tsx
 * <MonitorLine
 *   data={latencyData}
 *   series={[
 *     { key: 'p50', label: 'p50', displayValue: '1.8 ms' },
 *     { key: 'p99', label: 'p99', displayValue: '5.2 ms' },
 *   ]}
 *   theme="monitor-dark"
 *   unit="ms"
 * />
 * ```
 */
export function MonitorLine<T extends Record<string, unknown>>({
  data,
  series,
  width = 600,
  height = 260,
  theme,
  timeKey = 'time' as keyof T,
  unit = 'ms',
  glow = false,
  padding,
  connectNulls = true,
  onDataPointClick,
  renderTooltip,
  annotations = [],
  className,
  style,
}: MonitorLineProps<T>) {
  const t = themes[theme];
  const glowId = useUniqueId('monitor-glow');

  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(() =>
    series.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Responsive font sizes
  const fontSize = {
    label: getResponsiveFontSize(width, 12),
    axis: getResponsiveFontSize(width, 11),
    tooltip: getResponsiveFontSize(width, 12),
  };

  // Calculate max value to determine Y-axis label width
  const maxValue = useMemo(() => {
    const visibleKeys = series.filter((s) => visibleSeries[s.key]).map((s) => s.key);
    const allValues = data.flatMap((d) =>
      visibleKeys.map((k) => Number(d[k]) || 0)
    );
    return Math.max(...allValues, 0.1) * 1.15; // Include padding
  }, [data, series, visibleSeries]);

  // Create the longest Y-axis label to calculate margin
  const maxYLabel = `${maxValue.toFixed(1)} ${unit}`.trim();

  // Container padding
  const containerPad = padding ?? Math.round(12 * Math.min(1, width / 600));

  // SVG dimensions (accounting for container padding)
  const svgWidth = width - (containerPad * 2);
  const svgHeight = height - (containerPad * 2) - 40; // 40 for legend approximate height

  // Calculate dynamic margins for axis labels inside SVG
  const MARGIN = calculateMargins(svgWidth, maxYLabel, fontSize.axis);

  const chartWidth = svgWidth - MARGIN.left - MARGIN.right;
  const chartHeight = svgHeight - MARGIN.top - MARGIN.bottom;

  const { svgRef, mouse, handleMouseMove, handleMouseLeave } = useMouseTracking({
    marginLeft: MARGIN.left,
    chartWidth,
  });

  // Calculate scales based on visible series
  const { xScale, yScale, yTicks, max } = useMemo(() => {
    const xS = linearScale([0, data.length - 1], [0, chartWidth]);
    const yS = linearScale([0, maxValue], [chartHeight, 0]);
    const ticks = [0, maxValue * 0.5, maxValue].map(
      (v) => Math.round(v * 10) / 10
    );

    return { xScale: xS, yScale: yS, yTicks: ticks, max: maxValue };
  }, [data, maxValue, chartWidth, chartHeight]);

  // Generate paths for each series (with null handling)
  const paths = useMemo(() => {
    return series.map((s, i) => {
      if (!visibleSeries[s.key]) return null;

      let pathD = '';
      let isFirstPoint = true;

      data.forEach((d, idx) => {
        const rawValue = d[s.key];
        // Check for null/undefined/NaN
        const isNull = rawValue === null || rawValue === undefined || Number.isNaN(Number(rawValue));

        if (isNull && !connectNulls) {
          // Break the line - next point will start with M
          isFirstPoint = true;
          return;
        }

        const value = isNull ? 0 : Number(rawValue);
        if (isNull && connectNulls) {
          // Skip this point entirely when connecting nulls
          return;
        }

        const cmd = isFirstPoint ? 'M' : 'L';
        pathD += `${cmd} ${xScale(idx)} ${yScale(value)} `;
        isFirstPoint = false;
      });

      return {
        key: s.key,
        path: pathD.trim(),
        color: t.colors[i % t.colors.length],
      };
    });
  }, [data, series, visibleSeries, xScale, yScale, t.colors, connectNulls]);

  // Calculate tooltip data when hovering
  const { tooltipData, tooltipIndex } = useMemo<{ tooltipData: TooltipData[] | null; tooltipIndex: number }>(() => {
    if (mouse.x === null) return { tooltipData: null, tooltipIndex: -1 };

    // Calculate the index for click events
    const xInverse = linearScale([0, chartWidth], [0, data.length - 1]);
    const index = Math.round(xInverse(mouse.x));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

    const seriesData = series
      .filter((s) => visibleSeries[s.key])
      .map((s, i) => {
        const { y, value } = interpolateY(data, s.key, mouse.x!, chartWidth, yScale);
        const seriesIndex = series.findIndex((ser) => ser.key === s.key);
        return {
          key: s.key,
          label: s.label,
          y,
          value,
          color: t.colors[seriesIndex % t.colors.length],
        };
      });

    return { tooltipData: seriesData, tooltipIndex: clampedIndex };
  }, [mouse.x, data, series, visibleSeries, chartWidth, yScale, t.colors]);

  // X-axis time labels
  const xLabels = [0, Math.floor(data.length / 2), data.length - 1]
    .filter((i) => i < data.length)
    .map((i) => ({ index: i, label: String(data[i]?.[timeKey] ?? '') }));

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    padding: `${containerPad}px`,
    boxSizing: 'border-box',
    width: `${width}px`,
    height: `${height}px`,
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Legend / Toggle buttons */}
      <div
        style={{
          display: 'flex',
          gap: `${Math.max(6, Math.round(12 * width / 600))}px`,
          marginBottom: `${Math.max(8, Math.round(16 * width / 600))}px`,
          flexWrap: 'wrap',
        }}
      >
        {series.map((s, i) => {
          const isVisible = visibleSeries[s.key];
          const color = t.colors[i % t.colors.length];
          const buttonPadding = Math.max(4, Math.round(6 * width / 600));

          return (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${Math.max(4, Math.round(8 * width / 600))}px`,
                padding: `${buttonPadding}px ${buttonPadding * 2}px`,
                backgroundColor: isVisible ? `${color}15` : t.bgSecondary,
                borderRadius: '6px',
                border: `1px solid ${isVisible ? color : t.border}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                opacity: isVisible ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  height: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  borderRadius: '50%',
                  backgroundColor: color,
                  opacity: isVisible ? 1 : 0.3,
                }}
              />
              <span
                style={{
                  fontSize: `${fontSize.label}px`,
                  color: isVisible ? t.text : t.textSecondary,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500,
                }}
              >
                {s.label}:
              </span>
              {s.displayValue && (
                <span
                  style={{
                    fontSize: `${fontSize.label}px`,
                    color: isVisible ? t.text : t.textMuted,
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {s.displayValue}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair', display: 'block', maxWidth: '100%' }}
      >
        {glow && (
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={0}
              y1={yScale(tick)}
              x2={chartWidth}
              y2={yScale(tick)}
              stroke={t.gridLine}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map((tick, i) => (
            <text
              key={i}
              x={-8}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize.axis}px`, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {tick.toFixed(1)} {unit}
            </text>
          ))}

          {/* X axis labels */}
          {xLabels.map(({ index, label }) => (
            <text
              key={index}
              x={xScale(index)}
              y={chartHeight + Math.max(16, Math.round(24 * width / 600))}
              textAnchor="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize.axis}px`, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {label}
            </text>
          ))}

          {/* Annotations */}
          {annotations.length > 0 && (
            <Annotations
              annotations={annotations}
              theme={theme}
              xScale={(v) => xScale(v)}
              yScale={yScale}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          )}

          {/* Lines for each series */}
          {paths.map(
            (p) =>
              p && (
                <path
                  key={p.key}
                  d={p.path}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={glow ? `url(#${glowId})` : undefined}
                  style={{ transition: 'opacity 0.2s ease' }}
                />
              )
          )}

          {/* Cursor tracking line */}
          {mouse.x !== null && (
            <line
              x1={mouse.x}
              y1={0}
              x2={mouse.x}
              y2={chartHeight}
              stroke={t.text}
              strokeWidth={1}
              opacity={0.2}
              style={{ transition: 'x1 0.05s ease-out, x2 0.05s ease-out' }}
            />
          )}

          {/* Tracking dots for each series */}
          {tooltipData?.map((s) => (
            <circle
              key={s.key}
              cx={mouse.x!}
              cy={s.y}
              r={4}
              fill={t.bgCard}
              stroke={s.color}
              strokeWidth={2}
              style={{ transition: 'cy 0.05s ease-out', cursor: onDataPointClick ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (onDataPointClick && tooltipIndex >= 0) {
                  onDataPointClick({
                    data: data[tooltipIndex],
                    index: tooltipIndex,
                    seriesKey: s.key,
                    x: mouse.x!,
                    y: s.y,
                    value: s.value,
                    nativeEvent: e,
                  });
                }
              }}
            />
          ))}
        </g>
      </svg>

      {/* Floating tooltip */}
      {tooltipData && mouse.x !== null && (() => {
        // Calculate tooltip position - flip to left side if near right edge
        const tooltipW = Math.max(90, Math.round(120 * Math.min(1, width / 400)));
        const tooltipOffset = Math.max(10, Math.round(20 * width / 600));
        const isNearRightEdge = mouse.x > chartWidth - tooltipW;
        const tooltipLeft = isNearRightEdge 
          ? MARGIN.left + mouse.x - tooltipW - tooltipOffset
          : MARGIN.left + mouse.x + tooltipOffset;
        const tooltipPadding = Math.max(8, Math.round(12 * width / 600));

        // Use custom renderer if provided
        if (renderTooltip) {
          return (
            <div
              style={{
                position: 'absolute',
                top: MARGIN.top + 10,
                left: tooltipLeft,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {renderTooltip({
                data: data[tooltipIndex],
                index: tooltipIndex,
                x: mouse.x,
                y: 0,
                series: tooltipData.map((s) => ({
                  key: s.key,
                  label: s.label,
                  value: s.value,
                  color: s.color,
                })),
              })}
            </div>
          );
        }
        
        return (
        <div
          style={{
            position: 'absolute',
            top: MARGIN.top + 10,
            left: tooltipLeft,
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '8px',
            padding: `${tooltipPadding}px`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: `${tooltipW}px`,
            transition: 'left 0.05s ease-out, opacity 0.1s ease',
          }}
        >
          {tooltipData.map((s, i) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${Math.max(4, Math.round(8 * width / 600))}px`,
                marginBottom: i < tooltipData.length - 1 ? `${Math.round(6 * width / 600)}px` : 0,
              }}
            >
              <div
                style={{
                  width: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  height: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                }}
              />
              <span
                style={{
                  fontSize: `${fontSize.tooltip}px`,
                  color: t.textSecondary,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: `${fontSize.tooltip}px`,
                  color: t.text,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  marginLeft: 'auto',
                }}
              >
                {s.value.toFixed(2)} {unit}
              </span>
            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );
}
