import { useState, useMemo, useEffect, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, interpolateY, linePathFromPoints, areaPathFromLine, type CurveType } from '../utils';
import { useUniqueId, useMouseTracking, useResizeObserver } from '../hooks';
import type { DataPointClickEvent, TooltipRenderProps, Annotation, GridOptions, AreaGradientOptions } from './types';
import { Annotations } from './Annotations';

export interface SeriesConfig {
  /** Unique key matching data property */
  key: string;
  /** Display label */
  label: string;
  /** Current/summary value shown in legend badge */
  displayValue?: string;
  /** Y-axis assignment for dual-axis charts */
  yAxisId?: 'left' | 'right';
  /** Fill area under the line */
  area?: boolean;
  /** Area fill opacity (0-1, default 0.4) - top of gradient */
  areaOpacity?: number;
  /** Custom line color (overrides theme) */
  color?: string;
  /** Stroke dash pattern (e.g., "5,5" for dashed) */
  strokeDasharray?: string;
  /** Stroke width (default 2) */
  strokeWidth?: number;
}

export interface YAxisConfig {
  /** Unit label for this axis (e.g., "ms", "req/s", "%") */
  unit?: string;
  /** Minimum value (auto-calculated if not set) */
  min?: number;
  /** Maximum value (auto-calculated if not set) */
  max?: number;
  /** Number of ticks (default 3) */
  tickCount?: number;
  /** Format function for tick labels */
  format?: (value: number) => string;
}

export interface LineChartProps<T extends Record<string, unknown>> {
  /** Data array with time and series values */
  data: T[];
  /** Series configuration (can omit if using dataKey for single series) */
  series?: SeriesConfig[];
  /** Single series data key (simplified API for single-series charts) */
  dataKey?: keyof T;
  /** Label for single series (used with dataKey) */
  label?: string;
  /** Chart width in pixels (ignored if responsive=true) */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Enable responsive width (fills parent container) */
  responsive?: boolean;
  /** Key for time/x-axis values */
  timeKey?: keyof T;
  /** Unit label for values - shorthand for left Y-axis unit */
  unit?: string;
  /** Left Y-axis configuration */
  yAxisLeft?: YAxisConfig;
  /** Right Y-axis configuration (enables dual-axis mode) */
  yAxisRight?: YAxisConfig;
  /** Curve interpolation type */
  curve?: CurveType;
  /** Show dots on data points */
  showDots?: boolean;
  /** Dot radius (default 3) */
  dotSize?: number;
  /** Show dots only on hover */
  dotsOnHover?: boolean;
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
  /** Grid customization options (or false to disable) */
  grid?: GridOptions | boolean;
  /** Area gradient customization for area fills */
  areaGradient?: AreaGradientOptions;
  /** Show/hide legend (default true) */
  showLegend?: boolean;
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
  yAxisId: 'left' | 'right';
}

interface Point {
  x: number;
  y: number;
}

// Responsive sizing helpers
function getResponsiveFontSize(width: number, base: number) {
  const scale = Math.max(0.7, Math.min(1, width / 600));
  return Math.round(base * scale);
}

function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.65;
}

function calculateMargins(
  width: number,
  leftYLabel: string,
  rightYLabel: string | null,
  fontSize: number
) {
  const scale = Math.min(1, width / 600);
  
  const leftLabelWidth = estimateTextWidth(leftYLabel, fontSize);
  const baseLeftMargin = Math.max(leftLabelWidth + 12, 40 * scale);
  
  const rightLabelWidth = rightYLabel ? estimateTextWidth(rightYLabel, fontSize) : 0;
  const baseRightMargin = rightYLabel 
    ? Math.max(rightLabelWidth + 12, 40 * scale)
    : Math.max(fontSize * 2.5, 20);
  
  const baseBottomMargin = Math.max(fontSize * 2 + 16, 40);
  
  return {
    top: Math.round(12 * scale),
    right: Math.round(baseRightMargin),
    bottom: Math.round(baseBottomMargin),
    left: Math.round(baseLeftMargin),
  };
}

function formatAxisValue(value: number, unit: string, format?: (v: number) => string): string {
  if (format) return format(value);
  
  // Smart formatting based on value magnitude
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${unit}`.trim();
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K ${unit}`.trim();
  }
  if (Math.abs(value) < 1 && value !== 0) {
    return `${value.toFixed(2)} ${unit}`.trim();
  }
  return `${value.toFixed(1)} ${unit}`.trim();
}

/**
 * LineChart - Feature-rich line chart with dual Y-axis, curve types, and area fills
 * 
 * @example Basic usage
 * ```tsx
 * <LineChart
 *   data={data}
 *   dataKey="value"
 *   label="Revenue"
 *   theme="midnight"
 *   unit="$"
 * />
 * ```
 * 
 * @example Multi-series with dual Y-axis
 * ```tsx
 * <LineChart
 *   data={data}
 *   series={[
 *     { key: 'requests', label: 'Requests', yAxisId: 'left' },
 *     { key: 'latency', label: 'Latency', yAxisId: 'right', strokeDasharray: '5,5' },
 *   ]}
 *   yAxisLeft={{ unit: 'req/s' }}
 *   yAxisRight={{ unit: 'ms' }}
 *   theme="midnight"
 *   curve="monotone"
 * />
 * ```
 * 
 * @example Area chart with smooth curves
 * ```tsx
 * <LineChart
 *   data={data}
 *   series={[{ key: 'value', label: 'Sales', area: true }]}
 *   curve="monotone"
 *   theme="emerald"
 * />
 * ```
 */
export function LineChart<T extends Record<string, unknown>>({
  data,
  series: seriesProp,
  dataKey,
  label,
  width: widthProp = 600,
  height = 260,
  theme,
  responsive = false,
  timeKey = 'time' as keyof T,
  unit = '',
  yAxisLeft,
  yAxisRight,
  curve = 'linear',
  showDots = false,
  dotSize = 3,
  dotsOnHover = true,
  glow = false,
  padding,
  connectNulls = true,
  onDataPointClick,
  renderTooltip,
  annotations = [],
  grid = true,
  areaGradient,
  showLegend = true,
  className,
  style,
}: LineChartProps<T>) {
  const t = themes[theme];
  const glowId = useUniqueId('line-glow');
  const areaGradientId = useUniqueId('area-gradient');

  // Responsive sizing
  const { ref: containerRef, size: containerSize, ready: containerReady } = useResizeObserver<HTMLDivElement>();
  const width = responsive ? (containerSize.width || widthProp) : widthProp;

  // Determine if we have dual Y-axis
  const hasDualAxis = !!yAxisRight;
  const leftUnit = yAxisLeft?.unit ?? unit;
  const rightUnit = yAxisRight?.unit ?? '';

  // Support simplified single-series API
  const series: SeriesConfig[] = useMemo(() => {
    if (seriesProp) return seriesProp;
    if (dataKey) {
      return [{
        key: String(dataKey),
        label: label || String(dataKey),
        yAxisId: 'left',
      }];
    }
    return [];
  }, [seriesProp, dataKey, label]);

  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(() =>
    series.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );
  
  useEffect(() => {
    setVisibleSeries(series.reduce((acc, s) => ({ ...acc, [s.key]: true }), {}));
  }, [series]);

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Responsive font sizes
  const fontSize = {
    label: getResponsiveFontSize(width, 12),
    axis: getResponsiveFontSize(width, 11),
    tooltip: getResponsiveFontSize(width, 12),
  };

  // Calculate scales for left and right Y-axes
  const { leftScale, rightScale, leftTicks, rightTicks, leftMax, rightMax } = useMemo(() => {
    // Left axis series
    const leftKeys = series.filter((s) => visibleSeries[s.key] && (s.yAxisId ?? 'left') === 'left').map((s) => s.key);
    const leftValues = data.flatMap((d) => leftKeys.map((k) => Number(d[k]) || 0));
    const leftMinCalc = yAxisLeft?.min ?? 0;
    const leftMaxCalc = yAxisLeft?.max ?? Math.max(...leftValues, 0.1) * 1.15;
    
    // Right axis series
    const rightKeys = series.filter((s) => visibleSeries[s.key] && s.yAxisId === 'right').map((s) => s.key);
    const rightValues = data.flatMap((d) => rightKeys.map((k) => Number(d[k]) || 0));
    const rightMinCalc = yAxisRight?.min ?? 0;
    const rightMaxCalc = yAxisRight?.max ?? Math.max(...rightValues, 0.1) * 1.15;
    
    const leftTickCount = yAxisLeft?.tickCount ?? 3;
    const rightTickCount = yAxisRight?.tickCount ?? 3;

    return {
      leftMax: leftMaxCalc,
      rightMax: rightMaxCalc,
      leftTicks: Array.from({ length: leftTickCount }, (_, i) => leftMinCalc + (leftMaxCalc - leftMinCalc) * (i / (leftTickCount - 1))),
      rightTicks: hasDualAxis ? Array.from({ length: rightTickCount }, (_, i) => rightMinCalc + (rightMaxCalc - rightMinCalc) * (i / (rightTickCount - 1))) : [],
      leftScale: { min: leftMinCalc, max: leftMaxCalc },
      rightScale: { min: rightMinCalc, max: rightMaxCalc },
    };
  }, [data, series, visibleSeries, yAxisLeft, yAxisRight, hasDualAxis]);

  // Create longest labels for margin calculation
  const maxLeftLabel = formatAxisValue(leftMax, leftUnit, yAxisLeft?.format);
  const maxRightLabel = hasDualAxis ? formatAxisValue(rightMax, rightUnit, yAxisRight?.format) : null;

  // Container padding
  const containerPad = padding ?? Math.round(12 * Math.min(1, width / 600));

  // SVG dimensions
  const legendHeight = showLegend ? 40 : 0;
  const svgWidth = width - (containerPad * 2);
  const svgHeight = height - (containerPad * 2) - legendHeight;

  // Calculate dynamic margins
  const MARGIN = calculateMargins(svgWidth, maxLeftLabel, maxRightLabel, fontSize.axis);

  const chartWidth = svgWidth - MARGIN.left - MARGIN.right;
  const chartHeight = svgHeight - MARGIN.top - MARGIN.bottom;

  const { svgRef, mouse, handleMouseMove, handleMouseLeave } = useMouseTracking({
    marginLeft: MARGIN.left,
    chartWidth,
  });

  // Scale functions
  const xScale = useMemo(() => linearScale([0, data.length - 1], [0, chartWidth]), [data.length, chartWidth]);
  const yScaleLeft = useMemo(() => linearScale([leftScale.min, leftScale.max], [chartHeight, 0]), [leftScale, chartHeight]);
  const yScaleRight = useMemo(() => linearScale([rightScale.min, rightScale.max], [chartHeight, 0]), [rightScale, chartHeight]);

  // Generate paths for each series
  const paths = useMemo(() => {
    return series.map((s, i) => {
      if (!visibleSeries[s.key]) return null;

      const yScale = (s.yAxisId ?? 'left') === 'right' ? yScaleRight : yScaleLeft;
      const points: Point[] = [];
      const segments: Point[][] = [[]];

      data.forEach((d, idx) => {
        const rawValue = d[s.key];
        const isNull = rawValue === null || rawValue === undefined || Number.isNaN(Number(rawValue));

        if (isNull && !connectNulls) {
          if (segments[segments.length - 1].length > 0) {
            segments.push([]);
          }
          return;
        }

        if (isNull && connectNulls) return;

        const value = Number(rawValue);
        const point = { x: xScale(idx), y: yScale(value) };
        points.push(point);
        segments[segments.length - 1].push(point);
      });

      // Generate path(s) for each segment
      const pathStrings = segments
        .filter((seg) => seg.length > 0)
        .map((seg) => linePathFromPoints(seg, curve));

      const color = s.color || t.colors[i % t.colors.length];

      return {
        key: s.key,
        paths: pathStrings,
        points,
        color,
        area: s.area,
        areaOpacity: s.areaOpacity ?? areaGradient?.from ?? 0.4,
        strokeDasharray: s.strokeDasharray,
        strokeWidth: s.strokeWidth ?? 2,
        yAxisId: s.yAxisId ?? 'left',
      };
    });
  }, [data, series, visibleSeries, xScale, yScaleLeft, yScaleRight, t.colors, connectNulls, curve]);

  // Calculate tooltip data
  const { tooltipData, tooltipIndex } = useMemo<{ tooltipData: TooltipData[] | null; tooltipIndex: number }>(() => {
    if (mouse.x === null) return { tooltipData: null, tooltipIndex: -1 };

    const xInverse = linearScale([0, chartWidth], [0, data.length - 1]);
    const index = Math.round(xInverse(mouse.x));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

    const seriesData = series
      .filter((s) => visibleSeries[s.key])
      .map((s, i) => {
        const yScale = (s.yAxisId ?? 'left') === 'right' ? yScaleRight : yScaleLeft;
        const { y, value } = interpolateY(data, s.key, mouse.x!, chartWidth, yScale);
        const seriesIndex = series.findIndex((ser) => ser.key === s.key);
        return {
          key: s.key,
          label: s.label,
          y,
          value,
          color: s.color || t.colors[seriesIndex % t.colors.length],
          yAxisId: (s.yAxisId ?? 'left') as 'left' | 'right',
        };
      });

    return { tooltipData: seriesData, tooltipIndex: clampedIndex };
  }, [mouse.x, data, series, visibleSeries, chartWidth, yScaleLeft, yScaleRight, t.colors]);

  // X-axis labels
  const xLabels = [0, Math.floor(data.length / 2), data.length - 1]
    .filter((i) => i < data.length)
    .map((i) => ({ index: i, label: String(data[i]?.[timeKey] ?? '') }));

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    padding: `${containerPad}px`,
    boxSizing: 'border-box',
    width: responsive ? '100%' : `${width}px`,
    height: `${height}px`,
    ...style,
  };

  // Wait for container measurement in responsive mode
  if (responsive && !containerReady) {
    return <div ref={containerRef} className={className} style={containerStyle} />;
  }

  return (
    <div ref={responsive ? containerRef : undefined} className={className} style={containerStyle}>
      {/* Legend */}
      {showLegend && (
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
            const color = s.color || t.colors[i % t.colors.length];
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
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </span>
                {s.displayValue && (
                  <span
                    style={{
                      fontSize: `${fontSize.label}px`,
                      color: isVisible ? t.text : t.textMuted,
                      fontWeight: 600,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {s.displayValue}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair', display: 'block', maxWidth: '100%' }}
      >
        <defs>
          {glow && (
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          {/* Area gradients for each series */}
          {paths.map((p, i) => p?.area && (
            <linearGradient 
              key={`grad-${p.key}`} 
              id={`${areaGradientId}-${i}`} 
              x1="0" 
              y1={areaGradient?.direction === 'horizontal' ? '0' : '0'} 
              x2={areaGradient?.direction === 'horizontal' ? '1' : '0'} 
              y2={areaGradient?.direction === 'horizontal' ? '0' : '1'}
            >
              <stop offset="0%" stopColor={p.color} stopOpacity={p.areaOpacity} />
              <stop offset="100%" stopColor={p.color} stopOpacity={areaGradient?.to ?? 0.05} />
            </linearGradient>
          ))}
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Horizontal grid lines */}
          {grid !== false && (typeof grid !== 'object' || grid.horizontal !== false) && leftTicks.map((tick, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={yScaleLeft(tick)}
              x2={chartWidth}
              y2={yScaleLeft(tick)}
              stroke={typeof grid === 'object' && grid.color ? grid.color : t.gridLine}
              strokeWidth={typeof grid === 'object' && grid.strokeWidth ? grid.strokeWidth : 1}
              strokeDasharray={typeof grid === 'object' ? grid.strokeDasharray : undefined}
              opacity={typeof grid === 'object' && grid.opacity !== undefined ? grid.opacity : 0.4}
            />
          ))}

          {/* Vertical grid lines */}
          {grid !== false && typeof grid === 'object' && grid.vertical && xLabels.map(({ index }) => (
            <line
              key={`v-${index}`}
              x1={xScale(index)}
              y1={0}
              x2={xScale(index)}
              y2={chartHeight}
              stroke={grid.color || t.gridLine}
              strokeWidth={grid.strokeWidth || 1}
              strokeDasharray={grid.strokeDasharray}
              opacity={grid.opacity !== undefined ? grid.opacity : 0.4}
            />
          ))}

          {/* Left Y-axis labels */}
          {leftTicks.map((tick, i) => (
            <text
              key={`left-${i}`}
              x={-8}
              y={yScaleLeft(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize.axis}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {formatAxisValue(tick, leftUnit, yAxisLeft?.format)}
            </text>
          ))}

          {/* Right Y-axis labels (if dual axis) */}
          {hasDualAxis && rightTicks.map((tick, i) => (
            <text
              key={`right-${i}`}
              x={chartWidth + 8}
              y={yScaleRight(tick)}
              textAnchor="start"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize.axis}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {formatAxisValue(tick, rightUnit, yAxisRight?.format)}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map(({ index, label }) => (
            <text
              key={index}
              x={xScale(index)}
              y={chartHeight + Math.max(16, Math.round(24 * width / 600))}
              textAnchor="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize.axis}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
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
              yScale={yScaleLeft}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          )}

          {/* Area fills (rendered before lines) */}
          {paths.map((p, i) =>
            p?.area && p.paths.map((pathD, j) => (
              <path
                key={`area-${p.key}-${j}`}
                d={areaPathFromLine(pathD, p.points[0]?.x ?? 0, p.points[p.points.length - 1]?.x ?? chartWidth, chartHeight)}
                fill={`url(#${areaGradientId}-${i})`}
                style={{ transition: 'opacity 0.2s ease' }}
              />
            ))
          )}

          {/* Lines */}
          {paths.map((p) =>
            p && p.paths.map((pathD, j) => (
              <path
                key={`line-${p.key}-${j}`}
                d={pathD}
                fill="none"
                stroke={p.color}
                strokeWidth={p.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={p.strokeDasharray}
                filter={glow ? `url(#${glowId})` : undefined}
                style={{ transition: 'opacity 0.2s ease' }}
              />
            ))
          )}

          {/* Data point dots (always visible) */}
          {showDots && !dotsOnHover && paths.map((p) =>
            p && p.points.map((point, i) => (
              <circle
                key={`dot-${p.key}-${i}`}
                cx={point.x}
                cy={point.y}
                r={dotSize}
                fill={t.bgCard}
                stroke={p.color}
                strokeWidth={1.5}
              />
            ))
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

          {/* Tracking dots (on hover) */}
          {tooltipData?.map((s) => (
            <circle
              key={s.key}
              cx={mouse.x!}
              cy={s.y}
              r={dotSize + 1}
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
        const tooltipW = Math.max(100, Math.round(140 * Math.min(1, width / 400)));
        const tooltipOffset = Math.max(10, Math.round(20 * width / 600));
        const isNearRightEdge = mouse.x > chartWidth - tooltipW;
        const tooltipLeft = isNearRightEdge 
          ? MARGIN.left + mouse.x - tooltipW - tooltipOffset
          : MARGIN.left + mouse.x + tooltipOffset;
        const tooltipPadding = Math.max(8, Math.round(12 * width / 600));

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
            borderRadius: '10px',
            padding: `${tooltipPadding}px`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 20px -2px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: `${tooltipW}px`,
            transition: 'left 0.05s ease-out, opacity 0.1s ease',
            backdropFilter: 'blur(8px)',
            }}
          >
            {tooltipData.map((s, i) => {
              const axisUnit = s.yAxisId === 'right' ? rightUnit : leftUnit;
              const formatFn = s.yAxisId === 'right' ? yAxisRight?.format : yAxisLeft?.format;
              return (
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
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: `${fontSize.tooltip}px`,
                      color: t.text,
                      fontWeight: 600,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      marginLeft: 'auto',
                    }}
                  >
                    {formatFn ? formatFn(s.value) : `${s.value.toFixed(2)} ${axisUnit}`.trim()}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

/**
 * @deprecated Use LineChart instead. MonitorLine will be removed in v1.0.
 */
export const MonitorLine = LineChart;
