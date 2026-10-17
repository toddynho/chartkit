import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, logScale, logTicks, padExtent, extent, type Extent } from '../utils';
import type { DataPointClickEvent, TooltipRenderer, Annotation } from './types';
import { Annotations } from './Annotations';

export type ScaleType = 'linear' | 'log';

export interface ScatterChartProps<T extends Record<string, unknown>> {
  /** Data array */
  data: T[];
  /** Key for X values */
  xKey: keyof T;
  /** Key for Y values */
  yKey: keyof T;
  /** Key for bubble size (optional - creates bubble chart) */
  sizeKey?: keyof T;
  /** Key for categories/series (optional - creates colored groups) */
  categoryKey?: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** X-axis scale type (linear or log) */
  xScaleType?: ScaleType;
  /** Y-axis scale type (linear or log) */
  yScaleType?: ScaleType;
  /** Min point size */
  minSize?: number;
  /** Max point size */
  maxSize?: number;
  /** Point opacity */
  opacity?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Custom value formatter for X */
  formatX?: (value: number) => string;
  /** Custom value formatter for Y */
  formatY?: (value: number) => string;
  /** Click handler */
  onPointClick?: (event: DataPointClickEvent<T>) => void;
  /** Custom tooltip renderer */
  renderTooltip?: TooltipRenderer<T>;
  /** Reference lines and areas */
  annotations?: Annotation[];
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface TooltipState<T> {
  data: T;
  x: number;
  y: number;
  index: number;
  xValue: number;
  yValue: number;
  size?: number;
  category?: string;
  color: string;
}

const MARGIN = { top: 20, right: 20, bottom: 50, left: 60 };

/**
 * ScatterChart - Scatter plot with optional bubble sizing and categories
 * 
 * @example
 * ```tsx
 * // Basic scatter plot
 * <ScatterChart
 *   data={salesData}
 *   xKey="price"
 *   yKey="quantity"
 *   theme="monitor-dark"
 * />
 * 
 * // Bubble chart with categories
 * <ScatterChart
 *   data={salesData}
 *   xKey="price"
 *   yKey="quantity"
 *   sizeKey="revenue"
 *   categoryKey="region"
 *   theme="monitor-dark"
 * />
 * ```
 */
export function ScatterChart<T extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
  sizeKey,
  categoryKey,
  width = 500,
  height = 400,
  theme,
  xLabel,
  yLabel,
  xScaleType = 'linear',
  yScaleType = 'linear',
  minSize = 6,
  maxSize = 30,
  opacity = 0.7,
  showGrid = true,
  formatX = (v) => v.toLocaleString(),
  formatY = (v) => v.toLocaleString(),
  onPointClick,
  renderTooltip,
  annotations = [],
  className,
  style,
}: ScatterChartProps<T>) {
  const t = themes[theme];
  const [tooltip, setTooltip] = useState<TooltipState<T> | null>(null);

  const chartWidth = width - MARGIN.left - MARGIN.right;
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Get unique categories for coloring
  const categories = useMemo(() => {
    if (!categoryKey) return [];
    const unique = Array.from(new Set(data.map((d) => String(d[categoryKey]))));
    return unique;
  }, [data, categoryKey]);

  // Calculate scales
  const { xScale, yScale, sizeScale, xTicks, yTicks } = useMemo(() => {
    const xValues = data.map((d) => Number(d[xKey]) || 0);
    const yValues = data.map((d) => Number(d[yKey]) || 0);
    
    // For log scale, ensure positive values and don't pad into negative
    const xRawExtent = extent(xValues);
    const yRawExtent = extent(yValues);
    
    const xExtent: Extent = xScaleType === 'log' 
      ? [Math.max(xRawExtent[0], 1e-10), xRawExtent[1]]
      : padExtent(xRawExtent, 0.1);
    const yExtent: Extent = yScaleType === 'log'
      ? [Math.max(yRawExtent[0], 1e-10), yRawExtent[1]]
      : padExtent(yRawExtent, 0.1);

    // Create appropriate scale functions
    const xS = xScaleType === 'log' 
      ? logScale(xExtent, [0, chartWidth])
      : linearScale(xExtent, [0, chartWidth]);
    const yS = yScaleType === 'log'
      ? logScale(yExtent, [chartHeight, 0])
      : linearScale(yExtent, [chartHeight, 0]);

    // Size scale for bubbles (always linear)
    let sizeS = (_: number) => minSize;
    if (sizeKey) {
      const sizeValues = data.map((d) => Number(d[sizeKey]) || 0);
      const sizeExtent = extent(sizeValues);
      sizeS = linearScale(sizeExtent, [minSize, maxSize]);
    }

    // Generate ticks
    const xTickCount = 5;
    const yTickCount = 5;
    
    const xTicksArr = xScaleType === 'log'
      ? logTicks(xExtent, xTickCount)
      : Array.from({ length: xTickCount }, (_, i) => 
          xExtent[0] + (xExtent[1] - xExtent[0]) * (i / (xTickCount - 1))
        );
    const yTicksArr = yScaleType === 'log'
      ? logTicks(yExtent, yTickCount)
      : Array.from({ length: yTickCount }, (_, i) => 
          yExtent[0] + (yExtent[1] - yExtent[0]) * (i / (yTickCount - 1))
        );

    return {
      xScale: xS,
      yScale: yS,
      sizeScale: sizeS,
      xTicks: xTicksArr,
      yTicks: yTicksArr,
    };
  }, [data, xKey, yKey, sizeKey, chartWidth, chartHeight, minSize, maxSize, xScaleType, yScaleType]);

  const handlePointHover = (
    d: T,
    index: number,
    px: number,
    py: number,
    color: string,
    e: React.MouseEvent
  ) => {
    setTooltip({
      data: d,
      x: px,
      y: py,
      index,
      xValue: Number(d[xKey]) || 0,
      yValue: Number(d[yKey]) || 0,
      size: sizeKey ? Number(d[sizeKey]) || 0 : undefined,
      category: categoryKey ? String(d[categoryKey]) : undefined,
      color,
    });
  };

  const handlePointClick = (
    d: T,
    index: number,
    px: number,
    py: number,
    e: React.MouseEvent
  ) => {
    if (onPointClick) {
      onPointClick({
        data: d,
        index,
        x: px,
        y: py,
        value: Number(d[yKey]) || 0,
        nativeEvent: e,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Legend for categories */}
      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat, i) => (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: t.colors[i % t.colors.length],
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  color: t.textSecondary,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {cat}
              </span>
            </div>
          ))}
        </div>
      )}

      <svg
        width={width}
        height={height}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {showGrid && (
            <>
              {yTicks.map((tick, i) => (
                <line
                  key={`y-${i}`}
                  x1={0}
                  y1={yScale(tick)}
                  x2={chartWidth}
                  y2={yScale(tick)}
                  stroke={t.gridLine}
                  strokeDasharray="4,4"
                />
              ))}
              {xTicks.map((tick, i) => (
                <line
                  key={`x-${i}`}
                  x1={xScale(tick)}
                  y1={0}
                  x2={xScale(tick)}
                  y2={chartHeight}
                  stroke={t.gridLine}
                  strokeDasharray="4,4"
                />
              ))}
            </>
          )}

          {/* Annotations */}
          {annotations.length > 0 && (
            <Annotations
              annotations={annotations}
              theme={theme}
              xScale={xScale}
              yScale={yScale}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          )}

          {/* X-axis */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={t.border}
          />
          {xTicks.map((tick, i) => (
            <text
              key={`x-label-${i}`}
              x={xScale(tick)}
              y={chartHeight + 20}
              textAnchor="middle"
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatX(tick)}
            </text>
          ))}
          {xLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight + 40}
              textAnchor="middle"
              fill={t.textSecondary}
              style={{ fontSize: '11px' }}
            >
              {xLabel}
            </text>
          )}

          {/* Y-axis */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke={t.border} />
          {yTicks.map((tick, i) => (
            <text
              key={`y-label-${i}`}
              x={-10}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatY(tick)}
            </text>
          ))}
          {yLabel && (
            <text
              x={-40}
              y={chartHeight / 2}
              textAnchor="middle"
              fill={t.textSecondary}
              style={{ fontSize: '11px' }}
              transform={`rotate(-90, -40, ${chartHeight / 2})`}
            >
              {yLabel}
            </text>
          )}

          {/* Data points */}
          {data.map((d, i) => {
            const xVal = Number(d[xKey]) || 0;
            const yVal = Number(d[yKey]) || 0;
            const size = sizeKey ? sizeScale(Number(d[sizeKey]) || 0) : minSize;
            const catIndex = categoryKey 
              ? categories.indexOf(String(d[categoryKey]))
              : 0;
            const color = t.colors[catIndex % t.colors.length];
            const px = xScale(xVal);
            const py = yScale(yVal);

            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={size / 2}
                fill={color}
                opacity={tooltip?.index === i ? 1 : opacity}
                stroke={tooltip?.index === i ? t.text : 'none'}
                strokeWidth={2}
                style={{ cursor: onPointClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => handlePointHover(d, i, px, py, color, e)}
                onClick={(e) => handlePointClick(d, i, px, py, e)}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        renderTooltip ? (
          <div
            style={{
              position: 'absolute',
              top: MARGIN.top + tooltip.y - 10,
              left: MARGIN.left + tooltip.x + 15,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {renderTooltip({
              data: tooltip.data,
              index: tooltip.index,
              x: tooltip.x,
              y: tooltip.y,
            })}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: MARGIN.top + tooltip.y - 10,
              left: MARGIN.left + tooltip.x + 15,
              backgroundColor: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: '8px',
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '120px',
            }}
          >
            {tooltip.category && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  paddingBottom: '6px',
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tooltip.color,
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: t.text }}>
                  {tooltip.category}
                </span>
              </div>
            )}
            <div style={{ fontSize: '11px', color: t.textSecondary, marginBottom: '4px' }}>
              {xLabel || String(xKey)}: <span style={{ color: t.text, fontWeight: 600 }}>{formatX(tooltip.xValue)}</span>
            </div>
            <div style={{ fontSize: '11px', color: t.textSecondary, marginBottom: tooltip.size !== undefined ? '4px' : 0 }}>
              {yLabel || String(yKey)}: <span style={{ color: t.text, fontWeight: 600 }}>{formatY(tooltip.yValue)}</span>
            </div>
            {tooltip.size !== undefined && (
              <div style={{ fontSize: '11px', color: t.textSecondary }}>
                {String(sizeKey)}: <span style={{ color: t.text, fontWeight: 600 }}>{tooltip.size.toLocaleString()}</span>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
