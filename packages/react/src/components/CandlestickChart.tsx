import { useState, useMemo, useCallback, useRef, useEffect, type CSSProperties, type ReactNode } from 'react';
import { themes, type ThemeName } from '../themes';
import { linearScale, clamp } from '../utils';
import { useResizeObserver } from '../hooks';
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
  /** Enable zoom and pan (default true) */
  enableZoom?: boolean;
  /** Show zoom controls (default true when enableZoom is true) */
  showZoomControls?: boolean;
  /** Minimum visible candles when zoomed in */
  minVisibleCandles?: number;
  /** Initial visible range [startIndex, endIndex] */
  initialRange?: [number, number];
  /** Callback when visible range changes */
  onRangeChange?: (range: [number, number]) => void;
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
 * CandlestickChart - Financial OHLC candlestick chart with zoom and pan
 * 
 * @example
 * ```tsx
 * <CandlestickChart
 *   data={stockData}
 *   theme="midnight"
 *   showVolume
 *   enableZoom
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
  enableZoom = true,
  showZoomControls = true,
  minVisibleCandles = 10,
  initialRange,
  onRangeChange,
  className,
  style,
}: CandlestickChartProps) {
  const t = themes[theme];
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Colors - both filled solid
  const bullishColor = upColor || t.positive || '#22c55e';
  const bearishColor = downColor || t.negative || '#ef4444';
  
  // Responsive sizing
  const { ref: resizeRef, size: containerSize, ready: containerReady } = useResizeObserver<HTMLDivElement>();
  const width = responsive ? (containerSize.width || widthProp) : widthProp;

  // Zoom/pan state - use floating point for smooth transitions
  const [visibleRange, setVisibleRange] = useState<[number, number]>(() => 
    initialRange || [0, data.length - 1]
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startRange: [number, number] } | null>(null);
  
  // For smooth wheel zoom accumulation
  const wheelAccumulator = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tooltip state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [crosshairY, setCrosshairY] = useState<number | null>(null);

  // Update range when data changes
  useEffect(() => {
    if (initialRange) {
      setVisibleRange(initialRange);
    } else {
      setVisibleRange([0, data.length - 1]);
    }
  }, [data.length, initialRange]);

  // Notify parent of range changes (debounced to integer values)
  const lastReportedRange = useRef<[number, number]>([0, 0]);
  useEffect(() => {
    const intRange: [number, number] = [Math.round(visibleRange[0]), Math.round(visibleRange[1])];
    if (intRange[0] !== lastReportedRange.current[0] || intRange[1] !== lastReportedRange.current[1]) {
      lastReportedRange.current = intRange;
      onRangeChange?.(intRange);
    }
  }, [visibleRange, onRangeChange]);

  // Format function
  const format = formatY || ((v: number) => v.toFixed(2));

  // Get visible data slice - use floor/ceil for smooth sub-candle panning
  const visibleData = useMemo(() => {
    const [start, end] = visibleRange;
    const startIdx = Math.max(0, Math.floor(start));
    const endIdx = Math.min(data.length - 1, Math.ceil(end));
    return data.slice(startIdx, endIdx + 1);
  }, [data, visibleRange]);
  
  // Calculate the fractional offset for smooth panning
  const startOffset = visibleRange[0] - Math.floor(visibleRange[0]);

  // Calculate price range for visible data
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (visibleData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1 };
    
    const prices = visibleData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1 || 1;
    const volumes = showVolume ? visibleData.map(d => d.volume || 0) : [0];
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVolume: Math.max(...volumes) || 1,
    };
  }, [visibleData, showVolume]);

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

  // Scales - include fractional offset for smooth sub-candle panning
  const visibleCount = visibleRange[1] - visibleRange[0];
  const candleSpacing = chartWidth / Math.max(1, visibleCount);
  
  const xScale = useCallback((index: number) => {
    // Offset by the fractional start position for smooth panning
    return (index - startOffset) * candleSpacing + candleSpacing / 2;
  }, [candleSpacing, startOffset]);

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

  // Candle width in pixels - based on visible range, not data array length
  const candlePixelWidth = Math.max(2, candleSpacing * candleWidth);

  // Smooth wheel zoom handler - TradingView-style
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    
    const [start, end] = visibleRange;
    const currentLength = end - start;
    
    // Get mouse position for zoom anchor point
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - MARGIN.left;
    const mouseRatio = clamp(mouseX / chartWidth, 0, 1);
    
    // Detect pinch-to-zoom (trackpad) vs scroll wheel
    // Pinch gestures set ctrlKey and have smaller, more frequent deltas
    const isPinch = e.ctrlKey;
    
    // Normalize delta - different browsers/devices report different values
    // deltaMode: 0 = pixels, 1 = lines, 2 = pages
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20; // lines to pixels
    if (e.deltaMode === 2) delta *= 400; // pages to pixels
    
    // Use much smaller zoom factor for smooth, controllable zoom
    // Pinch gestures need even smaller factor since they fire rapidly
    const sensitivity = isPinch ? 0.008 : 0.0015;
    const zoomAmount = delta * sensitivity;
    
    // Calculate new length with exponential zoom for natural feel
    // Positive delta = zoom out (increase length), negative = zoom in
    const scaleFactor = Math.exp(zoomAmount);
    const newLength = clamp(
      currentLength * scaleFactor,
      minVisibleCandles - 1,
      data.length - 1
    );
    
    // Calculate new range, anchoring zoom to mouse position
    const lengthDiff = newLength - currentLength;
    let newStart = start - lengthDiff * mouseRatio;
    let newEnd = newStart + newLength;
    
    // Clamp to data bounds
    if (newStart < 0) {
      newStart = 0;
      newEnd = newLength;
    }
    if (newEnd > data.length - 1) {
      newEnd = data.length - 1;
      newStart = Math.max(0, newEnd - newLength);
    }
    
    setVisibleRange([newStart, newEnd]);
  }, [enableZoom, visibleRange, data.length, minVisibleCandles, chartWidth, MARGIN.left]);

  // Pan handlers - smooth floating-point dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableZoom) return;
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startRange: [...visibleRange] as [number, number] };
  }, [enableZoom, visibleRange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update crosshair
    if (y >= MARGIN.top && y <= MARGIN.top + priceChartHeight) {
      setCrosshairY(y - MARGIN.top);
    } else {
      setCrosshairY(null);
    }
    
    // Handle dragging for pan - smooth floating-point
    if (isDragging && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const rangeLength = dragRef.current.startRange[1] - dragRef.current.startRange[0];
      
      // Convert pixel delta to candle delta (floating-point for smoothness)
      const candlesPerPixel = rangeLength / chartWidth;
      const candlesDelta = -dx * candlesPerPixel;
      
      // Calculate new range with floating-point precision
      let newStart = dragRef.current.startRange[0] + candlesDelta;
      let newEnd = dragRef.current.startRange[1] + candlesDelta;
      
      // Clamp to data bounds
      if (newStart < 0) {
        newStart = 0;
        newEnd = rangeLength;
      }
      if (newEnd > data.length - 1) {
        newEnd = data.length - 1;
        newStart = Math.max(0, newEnd - rangeLength);
      }
      
      setVisibleRange([newStart, newEnd]);
      return;
    }
    
    // Tooltip tracking - use floating-point range for accurate indexing
    const chartX = x - MARGIN.left;
    
    if (chartX < 0 || chartX > chartWidth) {
      setHoveredIndex(null);
      setTooltipPos(null);
      return;
    }
    
    // Calculate which candle we're hovering based on current visible range
    const rangeLength = visibleRange[1] - visibleRange[0];
    const candleAtCursor = visibleRange[0] + (chartX / chartWidth) * rangeLength;
    const globalIndex = Math.round(clamp(candleAtCursor, 0, data.length - 1));
    
    setHoveredIndex(globalIndex);
    setTooltipPos({ x, y });
  }, [isDragging, chartWidth, MARGIN.left, MARGIN.top, priceChartHeight, visibleRange, data.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltipPos(null);
    setCrosshairY(null);
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  // Zoom control handlers - smooth floating-point
  const handleZoomIn = useCallback(() => {
    const [start, end] = visibleRange;
    const currentLength = end - start;
    const newLength = Math.max(minVisibleCandles - 1, currentLength * 0.75);
    const center = (start + end) / 2;
    let newStart = center - newLength / 2;
    let newEnd = center + newLength / 2;
    
    // Clamp to bounds
    if (newStart < 0) {
      newStart = 0;
      newEnd = newLength;
    }
    if (newEnd > data.length - 1) {
      newEnd = data.length - 1;
      newStart = Math.max(0, newEnd - newLength);
    }
    
    setVisibleRange([newStart, newEnd]);
  }, [visibleRange, minVisibleCandles, data.length]);

  const handleZoomOut = useCallback(() => {
    const [start, end] = visibleRange;
    const currentLength = end - start;
    const newLength = Math.min(data.length - 1, currentLength * 1.35);
    const center = (start + end) / 2;
    let newStart = center - newLength / 2;
    let newEnd = center + newLength / 2;
    
    // Clamp to bounds
    if (newStart < 0) {
      newStart = 0;
      newEnd = Math.min(data.length - 1, newLength);
    }
    if (newEnd > data.length - 1) {
      newEnd = data.length - 1;
      newStart = Math.max(0, newEnd - newLength);
    }
    
    setVisibleRange([newStart, newEnd]);
  }, [visibleRange, data.length]);

  const handleReset = useCallback(() => {
    setVisibleRange([0, data.length - 1]);
  }, [data.length]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: responsive ? '100%' : `${width}px`,
    height: `${height}px`,
    userSelect: 'none',
    ...style,
  };

  // Wait for container measurement
  if (responsive && !containerReady) {
    return <div ref={resizeRef} className={className} style={containerStyle} />;
  }

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredIsUp = hoveredData ? hoveredData.close >= hoveredData.open : false;
  // Calculate local index relative to visible data array for rendering crosshair
  const startIdx = Math.floor(visibleRange[0]);
  const hoveredLocalIndex = hoveredIndex !== null ? hoveredIndex - startIdx : null;

  return (
    <div 
      ref={responsive ? resizeRef : containerRef} 
      className={className} 
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={width}
        height={height}
        onWheel={handleWheel}
        style={{ 
          display: 'block', 
          cursor: isDragging ? 'grabbing' : enableZoom ? 'crosshair' : 'default',
        }}
      >
        {/* Clip path for chart area */}
        <defs>
          <clipPath id="chart-clip">
            <rect x={0} y={0} width={chartWidth} height={priceChartHeight} />
          </clipPath>
        </defs>

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
              strokeDasharray={typeof grid === 'object' ? grid.strokeDasharray : undefined}
              opacity={typeof grid === 'object' && grid.opacity !== undefined ? grid.opacity : 0.4}
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
          <g clipPath="url(#chart-clip)">
            {visibleData.map((d, i) => {
              const isUp = d.close >= d.open;
              const color = isUp ? bullishColor : bearishColor;
              const x = xScale(i);
              const bodyTop = yScale(Math.max(d.open, d.close));
              const bodyBottom = yScale(Math.min(d.open, d.close));
              const bodyHeight = Math.max(1, bodyBottom - bodyTop);
              const globalIndex = startIdx + i;
              const isHovered = hoveredIndex === globalIndex;
              
              return (
                <g key={i} opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1}>
                  {/* Wick (high-low line) */}
                  <line
                    x1={x}
                    y1={yScale(d.high)}
                    x2={x}
                    y2={yScale(d.low)}
                    stroke={color}
                    strokeWidth={wickWidth}
                  />
                  {/* Body - both filled solid */}
                  <rect
                    x={x - candlePixelWidth / 2}
                    y={bodyTop}
                    width={candlePixelWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth={0.5}
                  />
                </g>
              );
            })}
          </g>

          {/* Crosshair */}
          {hoveredLocalIndex !== null && (
            <>
              {/* Vertical line */}
              <line
                x1={xScale(hoveredLocalIndex)}
                y1={0}
                x2={xScale(hoveredLocalIndex)}
                y2={priceChartHeight}
                stroke={t.text}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.4}
              />
              {/* Horizontal line */}
              {crosshairY !== null && (
                <line
                  x1={0}
                  y1={crosshairY}
                  x2={chartWidth}
                  y2={crosshairY}
                  stroke={t.text}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                  opacity={0.4}
                />
              )}
            </>
          )}
        </g>

        {/* Volume bars */}
        {showVolume && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top + priceChartHeight + 8})`}>
            {visibleData.map((d, i) => {
              const isUp = d.close >= d.open;
              const color = isUp ? bullishColor : bearishColor;
              const x = xScale(i);
              const barHeight = d.volume ? volumeChartHeight - volumeScale(d.volume) : 0;
              const globalIndex = startIdx + i;
              const isHovered = hoveredIndex === globalIndex;
              
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - candlePixelWidth / 2}
                  y={volumeChartHeight - barHeight}
                  width={candlePixelWidth}
                  height={barHeight}
                  fill={color}
                  opacity={hoveredIndex !== null && !isHovered ? 0.3 : 0.6}
                />
              );
            })}
          </g>
        )}

        {/* X-axis labels */}
        <g transform={`translate(${MARGIN.left}, ${height - 8})`}>
          {(() => {
            const labelCount = Math.min(5, visibleData.length);
            const step = Math.max(1, Math.floor(visibleData.length / labelCount));
            const indices = [];
            for (let i = 0; i < visibleData.length; i += step) {
              indices.push(i);
            }
            if (indices[indices.length - 1] !== visibleData.length - 1 && visibleData.length > 1) {
              indices.push(visibleData.length - 1);
            }
            return indices.map((i) => (
              <text
                key={`x-${i}`}
                x={xScale(i)}
                y={0}
                textAnchor="middle"
                fill={t.textMuted}
                style={{ fontSize: `${fontSize}px`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {visibleData[i]?.time}
              </text>
            ));
          })()}
        </g>
      </svg>

      {/* Zoom controls */}
      {enableZoom && showZoomControls && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <button
            onClick={handleZoomIn}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: `1px solid ${t.border}`,
              backgroundColor: t.bgCard,
              color: t.text,
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: `1px solid ${t.border}`,
              backgroundColor: t.bgCard,
              color: t.text,
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleReset}
            style={{
              height: '28px',
              padding: '0 8px',
              borderRadius: '6px',
              border: `1px solid ${t.border}`,
              backgroundColor: t.bgCard,
              color: t.textSecondary,
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      )}

      {/* Tooltip */}
      {hoveredData && tooltipPos && !isDragging && (
        <div
          style={{
            position: 'absolute',
            top: Math.min(tooltipPos.y + 10, height - 140),
            left: Math.min(tooltipPos.x + 10, width - 160),
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 20px -2px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '140px',
            backdropFilter: 'blur(8px)',
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
