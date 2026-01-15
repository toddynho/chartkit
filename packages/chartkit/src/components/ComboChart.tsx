import { useMemo, useState, type CSSProperties } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale } from '../utils';
import type { DataPointClickEvent, TooltipRenderer, Annotation } from './types';
import { Annotations } from './Annotations';

export interface ComboSeriesConfig {
  /** Unique key matching data property */
  key: string;
  /** Display label */
  label: string;
  /** Series type */
  type: 'line' | 'bar' | 'area';
  /** Which Y-axis to use */
  yAxis?: 'left' | 'right';
  /** Custom color (overrides theme) */
  color?: string;
}

export interface ComboChartProps<T extends Record<string, unknown>> {
  /** Data array */
  data: T[];
  /** Series configuration */
  series: ComboSeriesConfig[];
  /** Key for X-axis/category values */
  categoryKey: keyof T;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Left Y-axis label */
  yLabelLeft?: string;
  /** Right Y-axis label */
  yLabelRight?: string;
  /** X-axis label */
  xLabel?: string;
  /** Custom formatter for left Y-axis */
  formatYLeft?: (value: number) => string;
  /** Custom formatter for right Y-axis */
  formatYRight?: (value: number) => string;
  /** Bar width ratio (0-1) */
  barRatio?: number;
  /** Line stroke width */
  strokeWidth?: number;
  /** Area fill opacity */
  fillOpacity?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Click handler */
  onDataPointClick?: (event: DataPointClickEvent<T>) => void;
  /** Custom tooltip renderer */
  renderTooltip?: TooltipRenderer<T>;
  /** Reference lines and areas */
  annotations?: Annotation[];
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface TooltipState {
  category: string;
  index: number;
  x: number;
  series: { key: string; label: string; value: number; color: string; type: string }[];
}

const MARGIN = { top: 20, right: 60, bottom: 40, left: 60 };

/**
 * ComboChart - Combined line, bar, and area chart with dual Y-axes
 * 
 * @example
 * ```tsx
 * <ComboChart
 *   data={revenueData}
 *   series={[
 *     { key: 'revenue', label: 'Revenue', type: 'bar', yAxis: 'left' },
 *     { key: 'growth', label: 'Growth %', type: 'line', yAxis: 'right' },
 *   ]}
 *   categoryKey="month"
 *   theme="monitor-dark"
 *   yLabelLeft="Revenue ($)"
 *   yLabelRight="Growth (%)"
 * />
 * ```
 */
export function ComboChart<T extends Record<string, unknown>>({
  data,
  series,
  categoryKey,
  width = 600,
  height = 400,
  theme,
  yLabelLeft,
  yLabelRight,
  xLabel,
  formatYLeft = (v) => v.toLocaleString(),
  formatYRight = (v) => v.toLocaleString(),
  barRatio = 0.6,
  strokeWidth = 2,
  fillOpacity = 0.3,
  showGrid = true,
  onDataPointClick,
  renderTooltip,
  annotations = [],
  className,
  style,
}: ComboChartProps<T>) {
  const t = themes[theme];
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Calculate which series use which axis
  const leftSeries = series.filter((s) => s.yAxis !== 'right');
  const rightSeries = series.filter((s) => s.yAxis === 'right');
  const hasRightAxis = rightSeries.length > 0;

  const chartWidth = width - MARGIN.left - (hasRightAxis ? MARGIN.right : 20);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // Get bar series for width calculation
  const barSeries = series.filter((s) => s.type === 'bar');

  // Calculate scales
  const { xScale, yScaleLeft, yScaleRight, yTicksLeft, yTicksRight, barWidth, categoryWidth } = useMemo(() => {
    // X scale (categorical)
    const catWidth = chartWidth / data.length;
    const xS = (index: number) => index * catWidth + catWidth / 2;

    // Calculate bar width
    const barW = catWidth * barRatio / Math.max(1, barSeries.length);

    // Left Y scale
    const leftValues = data.flatMap((d) =>
      leftSeries.map((s) => Number(d[s.key]) || 0)
    );
    const maxLeft = Math.max(...leftValues, 0.1) * 1.1;
    const yLeft = linearScale([0, maxLeft], [chartHeight, 0]);
    const ticksLeft = [0, maxLeft * 0.25, maxLeft * 0.5, maxLeft * 0.75, maxLeft].map(
      (v) => Math.round(v * 10) / 10
    );

    // Right Y scale (if needed)
    let yRight = yLeft;
    let ticksRight: number[] = [];
    if (hasRightAxis) {
      const rightValues = data.flatMap((d) =>
        rightSeries.map((s) => Number(d[s.key]) || 0)
      );
      const maxRight = Math.max(...rightValues, 0.1) * 1.1;
      yRight = linearScale([0, maxRight], [chartHeight, 0]);
      ticksRight = [0, maxRight * 0.25, maxRight * 0.5, maxRight * 0.75, maxRight].map(
        (v) => Math.round(v * 10) / 10
      );
    }

    return {
      xScale: xS,
      yScaleLeft: yLeft,
      yScaleRight: yRight,
      yTicksLeft: ticksLeft,
      yTicksRight: ticksRight,
      barWidth: barW,
      categoryWidth: catWidth,
    };
  }, [data, leftSeries, rightSeries, hasRightAxis, chartWidth, chartHeight, barRatio, barSeries.length]);

  // Get color for series
  const getSeriesColor = (s: ComboSeriesConfig, index: number) => {
    return s.color || t.colors[index % t.colors.length];
  };

  // Generate paths for line/area series
  const linePaths = useMemo(() => {
    return series
      .filter((s) => s.type === 'line' || s.type === 'area')
      .map((s, i) => {
        const seriesIndex = series.indexOf(s);
        const yScale = s.yAxis === 'right' ? yScaleRight : yScaleLeft;
        const color = getSeriesColor(s, seriesIndex);

        const pathD = data
          .map((d, idx) => {
            const value = Number(d[s.key]) || 0;
            return `${idx === 0 ? 'M' : 'L'} ${xScale(idx)} ${yScale(value)}`;
          })
          .join(' ');

        // Area path (if needed)
        let areaD = '';
        if (s.type === 'area') {
          areaD = `${pathD} L ${xScale(data.length - 1)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`;
        }

        return {
          key: s.key,
          type: s.type,
          path: pathD,
          areaPath: areaD,
          color,
        };
      });
  }, [series, data, xScale, yScaleLeft, yScaleRight, chartHeight, t.colors]);

  const handleHover = (index: number, x: number) => {
    const d = data[index];
    const category = String(d[categoryKey]);

    const seriesData = series.map((s, i) => ({
      key: s.key,
      label: s.label,
      value: Number(d[s.key]) || 0,
      color: getSeriesColor(s, i),
      type: s.type,
    }));

    setTooltip({
      category,
      index,
      x,
      series: seriesData,
    });
  };

  const handleClick = (d: T, index: number, seriesKey: string, e: React.MouseEvent) => {
    if (onDataPointClick) {
      onDataPointClick({
        data: d,
        index,
        seriesKey,
        x: xScale(index),
        y: 0,
        value: Number(d[seriesKey]) || 0,
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
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        {series.map((s, i) => (
          <div
            key={s.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {s.type === 'line' ? (
              <div
                style={{
                  width: '16px',
                  height: '2px',
                  backgroundColor: getSeriesColor(s, i),
                }}
              />
            ) : (
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: s.type === 'bar' ? '2px' : '0',
                  backgroundColor: getSeriesColor(s, i),
                  opacity: s.type === 'area' ? 0.5 : 1,
                }}
              />
            )}
            <span
              style={{
                fontSize: '12px',
                color: t.textSecondary,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <svg
        width={width}
        height={height}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {showGrid &&
            yTicksLeft.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={0}
                y1={yScaleLeft(tick)}
                x2={chartWidth}
                y2={yScaleLeft(tick)}
                stroke={t.gridLine}
                strokeDasharray={i === 0 ? undefined : '4,4'}
              />
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

          {/* Left Y-axis labels */}
          {yTicksLeft.map((tick, i) => (
            <text
              key={`y-left-${i}`}
              x={-10}
              y={yScaleLeft(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatYLeft(tick)}
            </text>
          ))}
          {yLabelLeft && (
            <text
              x={-45}
              y={chartHeight / 2}
              textAnchor="middle"
              fill={t.textSecondary}
              style={{ fontSize: '11px' }}
              transform={`rotate(-90, -45, ${chartHeight / 2})`}
            >
              {yLabelLeft}
            </text>
          )}

          {/* Right Y-axis labels */}
          {hasRightAxis && (
            <>
              {yTicksRight.map((tick, i) => (
                <text
                  key={`y-right-${i}`}
                  x={chartWidth + 10}
                  y={yScaleRight(tick)}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill={t.textMuted}
                  style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {formatYRight(tick)}
                </text>
              ))}
              {yLabelRight && (
                <text
                  x={chartWidth + 45}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  fill={t.textSecondary}
                  style={{ fontSize: '11px' }}
                  transform={`rotate(90, ${chartWidth + 45}, ${chartHeight / 2})`}
                >
                  {yLabelRight}
                </text>
              )}
            </>
          )}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={`x-${i}`}
              x={xScale(i)}
              y={chartHeight + 20}
              textAnchor="middle"
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {String(d[categoryKey])}
            </text>
          ))}
          {xLabel && (
            <text
              x={chartWidth / 2}
              y={chartHeight + 36}
              textAnchor="middle"
              fill={t.textSecondary}
              style={{ fontSize: '11px' }}
            >
              {xLabel}
            </text>
          )}

          {/* Bar series */}
          {barSeries.map((s, seriesIdx) => {
            const yScale = s.yAxis === 'right' ? yScaleRight : yScaleLeft;
            const color = getSeriesColor(s, series.indexOf(s));
            const barOffset = (seriesIdx - (barSeries.length - 1) / 2) * barWidth;

            return data.map((d, i) => {
              const value = Number(d[s.key]) || 0;
              const barHeight = chartHeight - yScale(value);
              const x = xScale(i) - barWidth / 2 + barOffset;
              const y = yScale(value);

              return (
                <rect
                  key={`${s.key}-${i}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(0, barHeight)}
                  fill={color}
                  rx={2}
                  style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
                  onMouseEnter={() => handleHover(i, xScale(i))}
                  onClick={(e) => handleClick(d, i, s.key, e)}
                />
              );
            });
          })}

          {/* Area fills */}
          {linePaths
            .filter((p) => p.type === 'area')
            .map((p) => (
              <path
                key={`area-${p.key}`}
                d={p.areaPath}
                fill={p.color}
                opacity={fillOpacity}
              />
            ))}

          {/* Lines */}
          {linePaths.map((p) => (
            <path
              key={`line-${p.key}`}
              d={p.path}
              fill="none"
              stroke={p.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Line points */}
          {series
            .filter((s) => s.type === 'line')
            .map((s, si) => {
              const yScale = s.yAxis === 'right' ? yScaleRight : yScaleLeft;
              const color = getSeriesColor(s, series.indexOf(s));

              return data.map((d, i) => {
                const value = Number(d[s.key]) || 0;
                return (
                  <circle
                    key={`point-${s.key}-${i}`}
                    cx={xScale(i)}
                    cy={yScale(value)}
                    r={tooltip?.index === i ? 5 : 3}
                    fill={t.bgCard}
                    stroke={color}
                    strokeWidth={2}
                    style={{ cursor: onDataPointClick ? 'pointer' : 'default', transition: 'r 0.1s ease' }}
                    onMouseEnter={() => handleHover(i, xScale(i))}
                    onClick={(e) => handleClick(d, i, s.key, e)}
                  />
                );
              });
            })}

          {/* Hover regions for tooltip */}
          {data.map((d, i) => (
            <rect
              key={`hover-${i}`}
              x={xScale(i) - categoryWidth / 2}
              y={0}
              width={categoryWidth}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => handleHover(i, xScale(i))}
            />
          ))}

          {/* Cursor line */}
          {tooltip && (
            <line
              x1={tooltip.x}
              y1={0}
              x2={tooltip.x}
              y2={chartHeight}
              stroke={t.text}
              strokeWidth={1}
              opacity={0.2}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        renderTooltip ? (
          <div
            style={{
              position: 'absolute',
              top: MARGIN.top + 10,
              left: MARGIN.left + tooltip.x + 15,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {renderTooltip({
              data: data[tooltip.index],
              index: tooltip.index,
              x: tooltip.x,
              y: 0,
              series: tooltip.series,
              category: tooltip.category,
            })}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: MARGIN.top + 10,
              left: Math.min(MARGIN.left + tooltip.x + 15, width - 180),
              backgroundColor: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '140px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: t.text,
                marginBottom: '8px',
                paddingBottom: '6px',
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              {tooltip.category}
            </div>
            {tooltip.series.map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: s.type === 'line' ? '12px' : '8px',
                    height: s.type === 'line' ? '2px' : '8px',
                    borderRadius: '2px',
                    backgroundColor: s.color,
                  }}
                />
                <span style={{ fontSize: '11px', color: t.textSecondary }}>
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: t.text,
                    marginLeft: 'auto',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {s.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
