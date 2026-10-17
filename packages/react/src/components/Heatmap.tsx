import { useMemo, useState, type CSSProperties } from 'react';
import { themes, type ThemeName } from '../themes';

export interface HeatmapDataPoint {
  /** Date string (YYYY-MM-DD format) */
  date: string;
  /** Value for the day */
  value: number;
}

export interface HeatmapProps {
  /** Data array with date and value */
  data: HeatmapDataPoint[];
  /** Chart width in pixels (auto-calculated if not provided) */
  width?: number;
  /** Theme name */
  theme: ThemeName;
  /** Number of weeks to display */
  weeks?: number;
  /** Cell size in pixels */
  cellSize?: number;
  /** Gap between cells */
  cellGap?: number;
  /** Cell border radius */
  cellRadius?: number;
  /** Show month labels */
  showMonthLabels?: boolean;
  /** Show day labels (Mon, Wed, Fri) */
  showDayLabels?: boolean;
  /** Custom color scale (array of colors from low to high) */
  colorScale?: string[];
  /** Custom value formatter for tooltip */
  format?: (value: number, date: string) => string;
  /** Empty cell color */
  emptyColor?: string;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

interface CellData {
  date: string;
  value: number;
  x: number;
  y: number;
  color: string;
  week: number;
  dayOfWeek: number;
}

interface TooltipState {
  cell: CellData;
  x: number;
  y: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get color for a value based on color scale
 */
function getColorForValue(
  value: number,
  maxValue: number,
  colorScale: string[],
  emptyColor: string
): string {
  if (value === 0) return emptyColor;
  
  const ratio = Math.min(value / maxValue, 1);
  const index = Math.floor(ratio * (colorScale.length - 1));
  return colorScale[Math.min(index, colorScale.length - 1)];
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Heatmap - GitHub-style contribution/activity chart
 * 
 * @example
 * ```tsx
 * <Heatmap
 *   data={[
 *     { date: '2024-01-01', value: 5 },
 *     { date: '2024-01-02', value: 3 },
 *     // ...
 *   ]}
 *   theme="github"
 *   weeks={52}
 * />
 * ```
 */
export function Heatmap({
  data,
  width,
  theme,
  weeks = 52,
  cellSize = 12,
  cellGap = 3,
  cellRadius = 2,
  showMonthLabels = true,
  showDayLabels = true,
  colorScale,
  format = (value, date) => `${value} contributions on ${date}`,
  emptyColor,
  className,
  style,
}: HeatmapProps) {
  const t = themes[theme];
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Default color scale based on theme
  const colors = colorScale ?? [
    t.bgSecondary,
    `${t.colors[0]}40`,
    `${t.colors[0]}80`,
    `${t.colors[0]}c0`,
    t.colors[0],
  ];

  const emptyCellColor = emptyColor ?? t.bgSecondary;

  // Calculate dimensions
  const dayLabelWidth = showDayLabels ? 30 : 0;
  const monthLabelHeight = showMonthLabels ? 20 : 0;
  const chartWidth = width ?? dayLabelWidth + weeks * (cellSize + cellGap);
  const chartHeight = monthLabelHeight + 7 * (cellSize + cellGap);

  // Build data map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.value));
    return map;
  }, [data]);

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  // Generate cells
  const { cells, monthLabels } = useMemo(() => {
    const cellList: CellData[] = [];
    const months: { label: string; x: number }[] = [];

    // Start from today and go back
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1));

    // Align to start of week (Sunday)
    const dayOffset = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOffset);

    let currentDate = new Date(startDate);
    let currentMonth = -1;
    let weekIndex = 0;

    while (currentDate <= endDate && weekIndex < weeks) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = formatDate(currentDate);
      const value = dataMap.get(dateStr) ?? 0;

      // Track month changes for labels
      if (currentDate.getMonth() !== currentMonth) {
        currentMonth = currentDate.getMonth();
        months.push({
          label: MONTH_NAMES[currentMonth],
          x: dayLabelWidth + weekIndex * (cellSize + cellGap),
        });
      }

      const x = dayLabelWidth + weekIndex * (cellSize + cellGap);
      const y = monthLabelHeight + dayOfWeek * (cellSize + cellGap);

      cellList.push({
        date: dateStr,
        value,
        x,
        y,
        color: getColorForValue(value, maxValue, colors, emptyCellColor),
        week: weekIndex,
        dayOfWeek,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Update week index when we hit Sunday
      if (currentDate.getDay() === 0) {
        weekIndex++;
      }
    }

    return { cells: cellList, monthLabels: months };
  }, [weeks, cellSize, cellGap, dataMap, maxValue, colors, emptyCellColor, dayLabelWidth, monthLabelHeight]);

  const handleCellHover = (cell: CellData, e: React.MouseEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const containerRect = (e.currentTarget as SVGElement).closest('div')?.getBoundingClientRect();
    if (containerRect) {
      setTooltip({
        cell,
        x: rect.x - containerRect.x + cellSize / 2,
        y: rect.y - containerRect.y - 10,
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
      <svg
        width={chartWidth}
        height={chartHeight}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {showMonthLabels &&
          monthLabels.map((month, i) => (
            <text
              key={i}
              x={month.x}
              y={12}
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {month.label}
            </text>
          ))}

        {/* Day labels */}
        {showDayLabels &&
          [1, 3, 5].map((day) => (
            <text
              key={day}
              x={0}
              y={monthLabelHeight + day * (cellSize + cellGap) + cellSize / 2 + 3}
              fill={t.textMuted}
              style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {DAY_LABELS[day].slice(0, 3)}
            </text>
          ))}

        {/* Cells */}
        {cells.map((cell) => (
          <rect
            key={cell.date}
            x={cell.x}
            y={cell.y}
            width={cellSize}
            height={cellSize}
            rx={cellRadius}
            ry={cellRadius}
            fill={cell.color}
            style={{ cursor: 'pointer', transition: 'fill 0.1s ease' }}
            onMouseEnter={(e) => handleCellHover(cell, e)}
          />
        ))}
      </svg>

      {/* Color legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: '10px', color: t.textMuted }}>Less</span>
        {colors.map((color, i) => (
          <div
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: cellRadius,
              backgroundColor: color,
            }}
          />
        ))}
        <span style={{ fontSize: '10px', color: t.textMuted }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y - 40,
            left: tooltip.x,
            transform: 'translateX(-50%)',
            backgroundColor: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '6px',
            padding: '8px 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: t.text,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {format(tooltip.cell.value, tooltip.cell.date)}
          </div>
        </div>
      )}
    </div>
  );
}
