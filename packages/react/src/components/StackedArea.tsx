import { useMemo, useState, type CSSProperties } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, interpolateY } from '../utils';
import { useUniqueId, useMouseTracking } from '../hooks';

export interface StackedAreaProps<T extends Record<string, unknown>> {
  /** Data array */
  data: T[];
  /** Keys for stacked series */
  dataKeys: (keyof T)[];
  /** Key for time/x-axis values */
  timeKey?: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Unit label for values */
  unit?: string;
  /** Show area fill (vs just lines) */
  showArea?: boolean;
  /** Fill opacity */
  fillOpacity?: number;
  /** Custom series labels */
  seriesLabels?: Record<string, string>;
  /** Padding around the chart (includes space for labels) */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface StackedPoint {
  x: number;
  y0: number; // bottom
  y1: number; // top
  value: number;
}

interface TooltipData {
  time: string;
  series: { key: string; label: string; value: number; color: string }[];
  total: number;
}

// Responsive sizing helpers
function getResponsiveFontSize(width: number, base: number) {
  const scale = Math.max(0.7, Math.min(1, width / 600));
  return Math.round(base * scale);
}

// Estimate text width (approximate: monospace chars are ~0.6 of font size)
function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.65;
}

// Calculate dynamic margins based on label content
function calculateMargins(
  width: number,
  height: number,
  maxYLabel: string,
  fontSize: number,
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
) {
  const scale = Math.min(1, width / 600);
  
  // Calculate left margin based on Y-axis label width
  const yLabelWidth = estimateTextWidth(maxYLabel, fontSize);
  const baseLeftMargin = Math.max(yLabelWidth + 12, 40 * scale);
  
  // Calculate bottom margin based on font size for X-axis (need room for labels)
  const baseBottomMargin = Math.max(fontSize * 2 + 16, 40);
  
  // Right margin needs room for half the last X-axis label (centered text)
  const baseRightMargin = Math.max(fontSize * 2.5, 20);
  
  // Default margins
  const defaultMargins = {
    top: Math.round(12 * scale),
    right: Math.round(baseRightMargin),
    bottom: Math.round(baseBottomMargin),
    left: Math.round(baseLeftMargin),
  };
  
  // Apply padding overrides
  if (padding === undefined) {
    return defaultMargins;
  }
  
  if (typeof padding === 'number') {
    return {
      top: padding,
      right: padding,
      bottom: Math.max(padding, baseBottomMargin),
      left: Math.max(padding, baseLeftMargin),
    };
  }
  
  return {
    top: padding.top ?? defaultMargins.top,
    right: padding.right ?? defaultMargins.right,
    bottom: padding.bottom ?? Math.max(defaultMargins.bottom, baseBottomMargin),
    left: padding.left ?? Math.max(defaultMargins.left, baseLeftMargin),
  };
}

/**
 * StackedArea - Stacked area chart for cumulative time series
 * 
 * @example
 * ```tsx
 * <StackedArea
 *   data={trafficData}
 *   dataKeys={['direct', 'organic', 'referral', 'social']}
 *   timeKey="date"
 *   theme="monitor-dark"
 *   unit="visits"
 * />
 * ```
 */
export function StackedArea<T extends Record<string, unknown>>({
  data,
  dataKeys,
  timeKey = 'time' as keyof T,
  width = 600,
  height = 300,
  theme,
  unit = '',
  showArea = true,
  fillOpacity = 0.5,
  seriesLabels = {},
  padding,
  className,
  style,
}: StackedAreaProps<T>) {
  const t = themes[theme];
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(() =>
    dataKeys.reduce((acc, k) => ({ ...acc, [String(k)]: true }), {})
  );

  // Get visible keys
  const visibleKeys = dataKeys.filter((k) => visibleSeries[String(k)]);

  // Responsive font sizes
  const fontSize = {
    label: getResponsiveFontSize(width, 12),
    axis: getResponsiveFontSize(width, 11),
    tooltip: getResponsiveFontSize(width, 11),
  };

  // Calculate max value to determine Y-axis label width
  const maxValue = useMemo(() => {
    const totals = data.map((d) =>
      visibleKeys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0)
    );
    return Math.max(...totals, 0.1);
  }, [data, visibleKeys]);

  // Container padding (separate from axis margins)
  const containerPad = typeof padding === 'number' 
    ? padding 
    : Math.round(12 * Math.min(1, width / 600));

  // Create the longest Y-axis label to calculate margin
  const maxYLabel = `${Math.round(maxValue).toLocaleString()} ${unit}`.trim();
  
  // SVG dimensions (accounting for container padding)
  const svgWidth = width - (containerPad * 2);
  const svgHeight = height - (containerPad * 2) - 40; // 40 for legend approximate height
  
  // Calculate dynamic margins for axis labels inside SVG
  const MARGIN = calculateMargins(svgWidth, svgHeight, maxYLabel, fontSize.axis);

  const chartWidth = svgWidth - MARGIN.left - MARGIN.right;
  const chartHeight = svgHeight - MARGIN.top - MARGIN.bottom;

  const { svgRef, mouse, handleMouseMove, handleMouseLeave } = useMouseTracking({
    marginLeft: MARGIN.left,
    chartWidth,
  });

  const gradientIds = dataKeys.map((_, i) => useUniqueId(`stacked-gradient-${i}`));

  // Calculate stacked data and scales
  const { stackedData, xScale, yScale, maxTotal, yTicks } = useMemo(() => {
    // Calculate totals for each data point (only visible series)
    const totals = data.map((d) =>
      visibleKeys.reduce((sum, k) => sum + (Number(d[k]) || 0), 0)
    );
    const maxT = Math.max(...totals, 0.1);

    const xS = linearScale([0, data.length - 1], [0, chartWidth]);
    const yS = linearScale([0, maxT * 1.1], [chartHeight, 0]);

    // Create stacked data for each series
    const stacked: Map<string, StackedPoint[]> = new Map();
    
    visibleKeys.forEach((key, keyIndex) => {
      const points: StackedPoint[] = data.map((d, i) => {
        // Calculate y0 (sum of all previous series)
        const y0 = visibleKeys
          .slice(0, keyIndex)
          .reduce((sum, k) => sum + (Number(d[k]) || 0), 0);
        
        const value = Number(d[key]) || 0;
        const y1 = y0 + value;

        return {
          x: xS(i),
          y0: yS(y0),
          y1: yS(y1),
          value,
        };
      });
      stacked.set(String(key), points);
    });

    // Y-axis ticks
    const ticks = [0, maxT * 0.25, maxT * 0.5, maxT * 0.75, maxT].map(
      (v) => Math.round(v * 10) / 10
    );

    return {
      stackedData: stacked,
      xScale: xS,
      yScale: yS,
      maxTotal: maxT,
      yTicks: ticks,
    };
  }, [data, visibleKeys, chartWidth, chartHeight]);

  // Generate area paths
  const areaPaths = useMemo(() => {
    return visibleKeys.map((key, keyIndex) => {
      const points = stackedData.get(String(key));
      if (!points || points.length === 0) return null;

      // Top line path
      const topLine = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y1}`)
        .join(' ');

      // Bottom line (reversed) for area
      const bottomLine = [...points]
        .reverse()
        .map((p) => `L ${p.x} ${p.y0}`)
        .join(' ');

      return {
        key: String(key),
        areaPath: `${topLine} ${bottomLine} Z`,
        linePath: topLine,
        color: t.colors[dataKeys.indexOf(key) % t.colors.length],
      };
    });
  }, [visibleKeys, stackedData, t.colors, dataKeys]);

  // Calculate tooltip data
  const tooltipData = useMemo<TooltipData | null>(() => {
    if (mouse.x === null || data.length === 0) return null;

    // Find nearest data index
    const xInverse = linearScale([0, chartWidth], [0, data.length - 1]);
    const index = Math.round(xInverse(mouse.x));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    const d = data[clampedIndex];

    const series = visibleKeys.map((key) => {
      const keyIndex = dataKeys.indexOf(key);
      return {
        key: String(key),
        label: seriesLabels[String(key)] || String(key),
        value: Number(d[key]) || 0,
        color: t.colors[keyIndex % t.colors.length],
      };
    }).reverse(); // Reverse to show top series first

    const total = series.reduce((sum, s) => sum + s.value, 0);

    return {
      time: String(d[timeKey] || ''),
      series,
      total,
    };
  }, [mouse.x, data, visibleKeys, dataKeys, timeKey, seriesLabels, t.colors, chartWidth]);

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // X-axis labels
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
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: `${Math.max(6, Math.round(12 * width / 600))}px`,
          marginBottom: `${Math.max(8, Math.round(16 * width / 600))}px`,
          flexWrap: 'wrap',
        }}
      >
        {dataKeys.map((key, i) => {
          const isVisible = visibleSeries[String(key)];
          const color = t.colors[i % t.colors.length];
          const label = seriesLabels[String(key)] || String(key);
          const buttonPadding = Math.max(4, Math.round(6 * width / 600));

          return (
            <button
              key={String(key)}
              onClick={() => toggleSeries(String(key))}
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
                  borderRadius: '2px',
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
                {label}
              </span>
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
        <defs>
          {dataKeys.map((key, i) => (
            <linearGradient
              key={String(key)}
              id={gradientIds[i]}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={t.colors[i % t.colors.length]}
                stopOpacity={fillOpacity}
              />
              <stop
                offset="100%"
                stopColor={t.colors[i % t.colors.length]}
                stopOpacity={fillOpacity * 0.15}
              />
            </linearGradient>
          ))}
        </defs>

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
              opacity={i === 0 ? 0.6 : 0.4}
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
              {tick.toFixed(0)} {unit}
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

          {/* Areas and lines (render in reverse order so first series is on top) */}
          {areaPaths
            .slice()
            .reverse()
            .map((path, i) => {
              if (!path) return null;
              const keyIndex = dataKeys.findIndex((k) => String(k) === path.key);

              return (
                <g key={path.key}>
                  {showArea && (
                    <path
                      d={path.areaPath}
                      fill={`url(#${gradientIds[keyIndex]})`}
                      style={{ transition: 'opacity 0.2s ease' }}
                    />
                  )}
                  <path
                    d={path.linePath}
                    fill="none"
                    stroke={path.color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

          {/* Cursor line */}
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
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipData && mouse.x !== null && (() => {
        // Calculate tooltip position - flip to left side if near right edge
        const tooltipW = Math.max(100, Math.round(140 * Math.min(1, width / 400)));
        const tooltipOffset = Math.max(10, Math.round(20 * width / 600));
        const isNearRightEdge = mouse.x > chartWidth - tooltipW;
        const tooltipLeft = isNearRightEdge 
          ? MARGIN.left + mouse.x - tooltipW - tooltipOffset
          : MARGIN.left + mouse.x + tooltipOffset;
        const tooltipPadding = Math.max(8, Math.round(12 * width / 600));
        
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
          <div
            style={{
              fontSize: `${fontSize.tooltip + 1}px`,
              fontWeight: 600,
              color: t.text,
              marginBottom: `${Math.round(8 * width / 600)}px`,
              borderBottom: `1px solid ${t.border}`,
              paddingBottom: `${Math.round(6 * width / 600)}px`,
            }}
          >
            {tooltipData.time}
          </div>
          {tooltipData.series.map((s) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${Math.max(4, Math.round(8 * width / 600))}px`,
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  height: `${Math.max(6, Math.round(8 * width / 600))}px`,
                  borderRadius: '2px',
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
                {s.value.toLocaleString()} {unit}
              </span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: `${Math.round(8 * width / 600)}px`,
              paddingTop: `${Math.round(6 * width / 600)}px`,
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <span style={{ fontSize: `${fontSize.tooltip}px`, color: t.textSecondary }}>Total</span>
            <span
              style={{
                fontSize: `${fontSize.tooltip}px`,
                fontWeight: 700,
                color: t.text,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {tooltipData.total.toLocaleString()} {unit}
            </span>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
