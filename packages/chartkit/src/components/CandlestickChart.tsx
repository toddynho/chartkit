import { useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale } from '../utils';
import { useUniqueId, useMouseTracking, useResizeObserver } from '../hooks';
import type { GridOptions } from './types';

export interface CandlestickDataPoint {
  /** Time/date label for X-axis */
  time: string;
  /** Opening price */
  open: number;
  /** Highest price */
  high: number;
  /** Lowest price */
  low: number;
  /** Closing price */
  close: number;
  /** Optional volume */
  volume?: number;
}

export interface CandlestickChartProps {
  /** OHLC data array */
  data: CandlestickDataPoint[];
  /** Chart width in pixels (ignored if responsive=true) */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Theme name */
  theme: ThemeName;
  /** Enable responsive width */
  responsive?: boolean;
  /** Show volume bars at bottom */
  showVolume?: boolean;
  /** Volume bar height ratio (0-1, default 0.2) */
  volumeHeight?: number;
  /** Bullish (up) candle color */
  upColor?: string;
  /** Bearish (down) candle color */
  downColor?: string;
  /** Wick (high-low line) width */
  wickWidth?: number;
  /** Candle body width ratio (0-1, default 0.8) */
  candleWidth?: number;
  /** Grid customization */
  grid?: GridOptions | boolean;
  /** Custom tooltip renderer */
  renderTooltip?: (props: CandlestickTooltipProps) => ReactNode;
  /** Y-axis value formatter */
  formatY?: (value: number) => string;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface CandlestickTooltipProps {
  data: CandlestickDataPoint;
  index: number;
  x: number;
  y: number;
  isUp: boolean;
}

// Calculate margins based on content
function calculateMargins(width: number, maxYLabel: string, fontSize: number, showVolume: boolean) {
  const scale = Math.min(1, width / 600);
  const yLabelWidth = maxYLabel.length * fontSize * 0.65;
  
  return {
    top: Math.round(16 * scale),
    right: Math.round(Math.max(20, yLabelWidth + 8)),
    bottom: Math.round(showVolume ? 40 : 32),
    left: Math.round(Math.max(yLabelWidth + 12, 50 * scale)),
  };
}

/**
 * CandlestickChart - Financial OHLC candlestick chart
 * 
 * @example
 * ```tsx
 * <CandlestickChart
 *   data={[
 *     { time: 'Jan 1', open: 100, high: 110, low: 95, close: 105 },
 *     { time: 'Jan 2', open: 105, high: 115, low: 100, close: 98 },
 *   ]}
 *   theme="midnight"
 *   showVolume
 * />
 * ```
 */
export function CandlestickChart({
  data,
  width: widthProp = 600,
  height = 400,
  theme,
  responsive = false,
  showVolume = false,
  volumeHeight = 0.2,
  upColor,
  downColor,
  wickWidth = 1,
  candleWidth = 0.7,
  grid = true,
  renderTooltip,
  formatY,
  className,
  style,
}: CandlestickChartProps) {
  const t = themes[theme];
  
  // Colors
  const bullishColor = upColor || t.positive || '#22c55e';
  const bearishColor = downColor || t.negative || '#ef4444';
  
  // Responsive sizing
  const { ref: containerRef, size: containerSize, ready: containerReady } = useResizeObserver<HTMLDivElement>();
  const width = responsive ? (containerSize.width || widthProp) : widthProp;

  // Tooltip state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Format function
  const format = formatY || ((v: number) => v.toFixed(2));

  // Calculate price range
  const { minPrice, maxPrice, maxVolume, priceRange } = useMemo(() => {
    const prices = data.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    const volumes = showVolume ? data.map(d => d.volume || 0) : [0];
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: Math.max(...volumes),
      priceRange: max - min,
    };
  }, [data, showVolume]);

  // Font size
  const fontSize = Math.max(10, Math.min(12, width / 50));
  
  // Create Y-axis label for margin calculation
  const maxYLabel = format(maxPrice);
  
  // Calculate margins
  const MARGIN = calculateMargins(width, maxYLabel, fontSize, showVolume);
  
  // Chart dimensions
  const chartWidth = width - MARGIN.left - MARGIN.right;
  const volumeChartHeight = showVolume ? (height - MARGIN.top - MARGIN.bottom) * volumeHeight : 0;
  const priceChartHeight = height - MARGIN.top - MARGIN.bottom - volumeChartHeight - (showVolume ? 8 : 0);

  // Scales
  const xScale = useMemo(() => {
    const candleSpacing = chartWidth / data.length;
    return (index: number) => candleSpacing * index + candleSpacing / 2;
  }, [chartWidth, data.length]);

  const yScale = useMemo(() => 
    linearScale([minPrice, maxPrice], [priceChartHeight, 0]),
    [minPrice, maxPrice, priceChartHeight]
  );

  const volumeScale = useMemo(() => 
    linearScale([0, maxVolume], [volumeChartHeight, 0]),
    [maxVolume, volumeChartHeight]
  );

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const step = (maxPrice - minPrice) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => minPrice + step * i);
  }, [minPrice, maxPrice]);

  // Candle width in pixels
  const candlePixelWidth = Math.max(3, (chartWidth / data.length) * candleWidth);

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN.left;
    
    if (x < 0 || x > chartWidth) {
      setHoveredIndex(null);
      setTooltipPos(null);
      return;
    }
    
    const candleSpacing = chartWidth / data.length;
    const index = Math.floor(x / candleSpacing);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    
    setHoveredIndex(clampedIndex);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: responsive ? '100%' : `${width}px`,
    height: `${height}px`,
    ...style,
  };

  // Wait for container measurement
  if (responsive && !containerReady) {
    return <div ref={containerRef} className={className} style={containerStyle} />;
  }

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredIsUp = hoveredData ? hoveredData.close >= hoveredData.open : false;

  return (
    <div ref={responsive ? containerRef : undefined} className={className} style={containerStyle}>
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', cursor: 'crosshair' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {grid !== false && yTicks.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              y1={yScale(tick)}
              x2={chartWidth}
              y2={yScale(tick)}
              stroke={typeof grid === 'object' && grid.color ? grid.color : t.gridLine}
              strokeWidth={typeof grid === 'object' && grid.strokeWidth ? grid.strokeWidth : 1}
              strokeDasharray={typeof grid === 'object' && grid.strokeDasharray ? grid.strokeDasharray : "4,4"}
              opacity={typeof grid === 'object' && grid.opacity !== undefined ? grid.opacity : 0.5}
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <text
              key={`y-${i}`}
              x={-8}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={t.textMuted}
              style={{ fontSize: `${fontSize}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {format(tick)}
            </text>
          ))}

          {/* Candlesticks */}
          {data.map((d, i) => {
            const isUp = d.close >= d.open;
            const color = isUp ? bullishColor : bearishColor;
            const x = xScale(i);
            const bodyTop = yScale(Math.max(d.open, d.close));
            const bodyBottom = yScale(Math.min(d.open, d.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            const isHovered = hoveredIndex === i;
            
            return (
              <g key={i} opacity={hoveredIndex !== null && !isHovered ? 0.5 : 1}>
                {/* Wick (high-low line) */}
                <line
                  x1={x}
                  y1={yScale(d.high)}
                  x2={x}
                  y2={yScale(d.low)}
                  stroke={color}
                  strokeWidth={wickWidth}
                />
                {/* Body */}
                <rect
                  x={x - candlePixelWidth / 2}
                  y={bodyTop}
                  width={candlePixelWidth}
                  height={bodyHeight}
                  fill={isUp ? 'transparent' : color}
                  stroke={color}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Hover line */}
          {hoveredIndex !== null && (
            <line
              x1={xScale(hoveredIndex)}
              y1={0}
              x2={xScale(hoveredIndex)}
              y2={priceChartHeight}
              stroke={t.text}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.3}
            />
          )}
        </g>

        {/* Volume bars */}
        {showVolume && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top + priceChartHeight + 8})`}>
            {data.map((d, i) => {
              const isUp = d.close >= d.open;
              const color = isUp ? bullishColor : bearishColor;
              const x = xScale(i);
              const barHeight = d.volume ? volumeChartHeight - volumeScale(d.volume) : 0;
              const isHovered = hoveredIndex === i;
              
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - candlePixelWidth / 2}
                  y={volumeChartHeight - barHeight}
                  width={candlePixelWidth}
                  height={barHeight}
                  fill={color}
                  opacity={hoveredIndex !== null && !isHovered ? 0.3 : 0.5}
                />
              );
            })}
          </g>
        )}

        {/* X-axis labels (show a few) */}
        <g transform={`translate(${MARGIN.left}, ${height - 8})`}>
          {[0, Math.floor(data.length / 2), data.length - 1]
            .filter((i, idx, arr) => i < data.length && arr.indexOf(i) === idx)
            .map((i) => (
              <text
                key={`x-${i}`}
                x={xScale(i)}
                y={0}
                textAnchor="middle"
                fill={t.textMuted}
                style={{ fontSize: `${fontSize}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {data[i]?.time}
              </text>
            ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredData && tooltipPos && (
        <div
          style={{
            position: 'absolute',
            top: Math.min(tooltipPos.y + 10, height - 120),
            left: Math.min(tooltipPos.x + 10, width - 150),
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '140px',
          }}
        >
          {renderTooltip ? (
            renderTooltip({
              data: hoveredData,
              index: hoveredIndex!,
              x: tooltipPos.x,
              y: tooltipPos.y,
              isUp: hoveredIsUp,
            })
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: t.text, fontSize: '13px' }}>
                {hoveredData.time}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '12px' }}>
                <span style={{ color: t.textSecondary }}>Open</span>
                <span style={{ color: t.text, textAlign: 'right' }}>{format(hoveredData.open)}</span>
                <span style={{ color: t.textSecondary }}>High</span>
                <span style={{ color: t.text, textAlign: 'right' }}>{format(hoveredData.high)}</span>
                <span style={{ color: t.textSecondary }}>Low</span>
                <span style={{ color: t.text, textAlign: 'right' }}>{format(hoveredData.low)}</span>
                <span style={{ color: t.textSecondary }}>Close</span>
                <span style={{ color: hoveredIsUp ? bullishColor : bearishColor, textAlign: 'right', fontWeight: 600 }}>
                  {format(hoveredData.close)}
                </span>
                {hoveredData.volume !== undefined && (
                  <>
                    <span style={{ color: t.textSecondary }}>Volume</span>
                    <span style={{ color: t.text, textAlign: 'right' }}>{hoveredData.volume.toLocaleString()}</span>
                  </>
                )}
              </div>
              <div 
                style={{ 
                  marginTop: '8px', 
                  paddingTop: '8px', 
                  borderTop: `1px solid ${t.border}`,
                  fontSize: '12px',
                  color: hoveredIsUp ? bullishColor : bearishColor,
                  fontWeight: 600,
                }}
              >
                {hoveredIsUp ? '▲' : '▼'} {((hoveredData.close - hoveredData.open) / hoveredData.open * 100).toFixed(2)}%
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
