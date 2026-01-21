import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale } from '../utils';
import { useMouseTracking } from '../hooks';
import type { BarClickEvent, TooltipRenderProps, Annotation } from './types';
import { Annotations } from './Annotations';

export interface BarChartProps<T extends Record<string, unknown>> {
  /** Data array */
  data: T[];
  /** Key(s) for bar values - single key or array for grouped bars */
  dataKey: keyof T | (keyof T)[];
  /** Key for category/label axis */
  categoryKey: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Bar orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Show value labels on bars */
  showLabels?: boolean;
  /** Custom value formatter */
  format?: (value: number) => string;
  /** Gap between bars (0-1) */
  barGap?: number;
  /** Gap between groups (0-1) */
  groupGap?: number;
  /** Border radius for bars */
  barRadius?: number;
  /** Click handler for bars */
  onBarClick?: (event: BarClickEvent<T>) => void;
  /** Custom tooltip renderer */
  renderTooltip?: (props: TooltipRenderProps<T>) => ReactNode;
  /** Reference lines and areas */
  annotations?: Annotation[];
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface TooltipState {
  category: string;
  values: { key: string; value: number; color: string }[];
  x: number;
  y: number;
  dataIndex: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * BarChart - Vertical or horizontal bar chart with optional grouping
 * 
 * @example
 * ```tsx
 * // Single series
 * <BarChart
 *   data={salesData}
 *   dataKey="revenue"
 *   categoryKey="month"
 *   theme="monitor-dark"
 * />
 * 
 * // Grouped bars
 * <BarChart
 *   data={salesData}
 *   dataKey={['revenue', 'expenses']}
 *   categoryKey="month"
 *   theme="monitor-dark"
 * />
 * ```
 */
export function BarChart<T extends Record<string, unknown>>({
  data,
  dataKey,
  categoryKey,
  width = 500,
  height = 300,
  theme,
  orientation = 'vertical',
  showLabels = false,
  format = (v) => v.toLocaleString(),
  barGap = 0.1,
  groupGap = 0.2,
  barRadius = 4,
  onBarClick,
  renderTooltip,
  annotations = [],
  className,
  style,
}: BarChartProps<T>) {
  const t = themes[theme];
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const isVertical = orientation === 'vertical';
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey];
  const isGrouped = dataKeys.length > 1;

  const chartWidth = width - MARGIN.left - MARGIN.right;
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Calculate scales and bar dimensions
  const { categoryScale, valueScale, barWidth, groupWidth } = useMemo(() => {
    // Find max value across all series
    const allValues = data.flatMap((d) =>
      dataKeys.map((k) => Number(d[k]) || 0)
    );
    const maxValue = Math.max(...allValues, 0.1);

    const categoryCount = data.length;
    const totalGroupGap = groupGap * (categoryCount - 1);
    const availableSpace = isVertical ? chartWidth : chartHeight;
    const groupW = (availableSpace * (1 - totalGroupGap / categoryCount)) / categoryCount;
    
    const barCount = dataKeys.length;
    const totalBarGap = barGap * (barCount - 1);
    const barW = isGrouped 
      ? (groupW * (1 - totalBarGap / barCount)) / barCount
      : groupW * (1 - barGap);

    // Category scale maps index to position
    const catScale = (index: number) => {
      const spacing = availableSpace / categoryCount;
      return spacing * index + spacing / 2;
    };

    // Value scale
    const valScale = linearScale(
      [0, maxValue * 1.1],
      isVertical ? [chartHeight, 0] : [0, chartWidth]
    );

    return {
      categoryScale: catScale,
      valueScale: valScale,
      barWidth: barW,
      groupWidth: groupW,
    };
  }, [data, dataKeys, chartWidth, chartHeight, barGap, groupGap, isVertical, isGrouped]);

  const handleBarHover = (
    category: string,
    values: { key: string; value: number; color: string }[],
    x: number,
    y: number,
    dataIndex: number
  ) => {
    setTooltip({ category, values, x, y, dataIndex });
  };

  const handleBarClick = (
    d: T,
    dataIndex: number,
    keyIndex: number,
    category: string,
    x: number,
    y: number,
    e: React.MouseEvent
  ) => {
    if (onBarClick) {
      const key = dataKeys[keyIndex];
      onBarClick({
        data: d,
        index: dataIndex,
        seriesKey: String(key),
        category,
        x,
        y,
        value: Number(d[key]) || 0,
        nativeEvent: e,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Legend for grouped bars */}
      {isGrouped && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          {dataKeys.map((key, i) => (
            <div
              key={String(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
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
                {String(key)}
              </span>
            </div>
          ))}
        </div>
      )}

      <svg
        width={width}
        height={height}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {isVertical ? (
            // Horizontal grid lines for vertical bars
            [0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = chartHeight * (1 - pct);
              return (
                <line
                  key={i}
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={t.gridLine}
                  strokeWidth={1}
                  opacity={i === 0 ? 0.6 : 0.4}
                />
              );
            })
          ) : (
            // Vertical grid lines for horizontal bars
            [0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const x = chartWidth * pct;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={chartHeight}
                  stroke={t.gridLine}
                  strokeWidth={1}
                  opacity={i === 0 ? 0.6 : 0.4}
                />
              );
            })
          )}

          {/* Annotations */}
          {annotations.length > 0 && (
            <Annotations
              annotations={annotations}
              theme={theme}
              xScale={(v) => categoryScale(v)}
              yScale={valueScale}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
            />
          )}

          {/* Bars */}
          {data.map((d, dataIndex) => {
            const category = String(d[categoryKey]);
            const categoryPos = categoryScale(dataIndex);

            return dataKeys.map((key, keyIndex) => {
              const value = Number(d[key]) || 0;
              const color = t.colors[keyIndex % t.colors.length];

              // Calculate bar position
              let x: number, y: number, barW: number, barH: number;

              if (isVertical) {
                const groupOffset = isGrouped
                  ? (keyIndex - (dataKeys.length - 1) / 2) * (barWidth + barWidth * barGap)
                  : 0;
                x = categoryPos - barWidth / 2 + groupOffset;
                y = valueScale(value);
                barW = barWidth;
                barH = chartHeight - valueScale(value);
              } else {
                const groupOffset = isGrouped
                  ? (keyIndex - (dataKeys.length - 1) / 2) * (barWidth + barWidth * barGap)
                  : 0;
                x = 0;
                y = categoryPos - barWidth / 2 + groupOffset;
                barW = valueScale(value);
                barH = barWidth;
              }

              return (
                <g key={`${dataIndex}-${String(key)}`}>
                  <rect
                    x={x}
                    y={y}
                    width={Math.max(0, barW)}
                    height={Math.max(0, barH)}
                    fill={color}
                    rx={barRadius}
                    ry={barRadius}
                    style={{ transition: 'all 0.2s ease', cursor: onBarClick ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleBarHover(
                        category,
                        dataKeys.map((k, i) => ({
                          key: String(k),
                          value: Number(d[k]) || 0,
                          color: t.colors[i % t.colors.length],
                        })),
                        isVertical ? x + barW / 2 : barW,
                        isVertical ? y : y + barH / 2,
                        dataIndex
                      );
                    }}
                    onClick={(e) => handleBarClick(d, dataIndex, keyIndex, category, x, y, e)}
                  />
                  {/* Value labels */}
                  {showLabels && (
                    <text
                      x={isVertical ? x + barW / 2 : barW + 4}
                      y={isVertical ? y - 4 : y + barH / 2}
                      textAnchor={isVertical ? 'middle' : 'start'}
                      dominantBaseline={isVertical ? 'auto' : 'middle'}
                      fill={t.textSecondary}
                      style={{
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {format(value)}
                    </text>
                  )}
                </g>
              );
            });
          })}

          {/* Category labels */}
          {data.map((d, i) => {
            const category = String(d[categoryKey]);
            const pos = categoryScale(i);

            return (
              <text
                key={i}
                x={isVertical ? pos : -8}
                y={isVertical ? chartHeight + 20 : pos}
                textAnchor={isVertical ? 'middle' : 'end'}
                dominantBaseline={isVertical ? 'auto' : 'middle'}
                fill={t.textMuted}
                style={{
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {category}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (() => {
        // Calculate tooltip position - flip to left side if near right edge
        const tooltipWidth = 140;
        const tooltipOffset = 10;
        const isNearRightEdge = tooltip.x > chartWidth - tooltipWidth;
        const tooltipLeft = isNearRightEdge 
          ? MARGIN.left + tooltip.x - tooltipWidth - tooltipOffset
          : MARGIN.left + tooltip.x + tooltipOffset;
        
        // Use custom renderer if provided
        if (renderTooltip) {
          return (
            <div
              style={{
                position: 'absolute',
                top: MARGIN.top + tooltip.y - 10,
                left: tooltipLeft,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {renderTooltip({
                data: data[tooltip.dataIndex],
                index: tooltip.dataIndex,
                x: tooltip.x,
                y: tooltip.y,
                category: tooltip.category,
                series: tooltip.values.map((v) => ({
                  key: v.key,
                  label: v.key,
                  value: v.value,
                  color: v.color,
                })),
              })}
            </div>
          );
        }

        return (
        <div
          style={{
            position: 'absolute',
            top: MARGIN.top + tooltip.y - 10,
            left: tooltipLeft,
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 20px -2px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '100px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: t.text,
              marginBottom: '8px',
            }}
          >
            {tooltip.category}
          </div>
          {tooltip.values.map((v) => (
            <div
              key={v.key}
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
                  borderRadius: '2px',
                  backgroundColor: v.color,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  color: t.textSecondary,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {v.key}:
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: t.text,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  marginLeft: 'auto',
                }}
              >
                {format(v.value)}
              </span>
            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );
}
