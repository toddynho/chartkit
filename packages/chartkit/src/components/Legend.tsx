import { type CSSProperties } from 'react';
import { themes, type ThemeName } from '../themes';
import type { LegendItem, LegendClickEvent } from './types';

export interface LegendProps {
  /** Legend items to display */
  items: LegendItem[];
  /** Theme name */
  theme: ThemeName;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  /** Whether items are interactive (toggleable) */
  interactive?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (event: LegendClickEvent) => void;
  /** Marker shape */
  marker?: 'circle' | 'square' | 'line';
  /** Marker size */
  markerSize?: number;
  /** Show values next to labels */
  showValues?: boolean;
  /** Gap between items */
  gap?: number;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

/**
 * Legend - Standalone legend component for charts
 * 
 * @example
 * ```tsx
 * <Legend
 *   items={[
 *     { key: 'sales', label: 'Sales', color: '#4ade80', value: '$12,345' },
 *     { key: 'costs', label: 'Costs', color: '#f87171', value: '$8,900' },
 *   ]}
 *   theme="monitor-dark"
 *   interactive
 *   onItemClick={({ key }) => toggleSeries(key)}
 * />
 * ```
 */
export function Legend({
  items,
  theme,
  direction = 'horizontal',
  align = 'start',
  interactive = false,
  onItemClick,
  marker = 'circle',
  markerSize = 10,
  showValues = true,
  gap = 16,
  className,
  style,
}: LegendProps) {
  const t = themes[theme];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
    justifyContent: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start',
    gap: `${gap}px`,
    ...style,
  };

  const getMarkerStyle = (color: string, visible: boolean): CSSProperties => {
    const baseStyle: CSSProperties = {
      width: `${markerSize}px`,
      height: marker === 'line' ? '2px' : `${markerSize}px`,
      backgroundColor: color,
      opacity: visible ? 1 : 0.3,
      flexShrink: 0,
      transition: 'opacity 0.15s ease',
    };

    if (marker === 'circle') {
      baseStyle.borderRadius = '50%';
    } else if (marker === 'square') {
      baseStyle.borderRadius = '2px';
    }

    return baseStyle;
  };

  return (
    <div className={className} style={containerStyle}>
      {items.map((item) => {
        const isVisible = item.visible !== false;
        const isClickable = interactive && onItemClick;

        const itemStyle: CSSProperties = {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: interactive ? '6px 12px' : '4px 0',
          backgroundColor: interactive && isVisible ? `${item.color}15` : 'transparent',
          borderRadius: interactive ? '6px' : '0',
          border: interactive ? `1px solid ${isVisible ? item.color : t.border}` : 'none',
          cursor: isClickable ? 'pointer' : 'default',
          opacity: isVisible ? 1 : 0.5,
          transition: 'all 0.15s ease',
        };

        const content = (
          <>
            <div style={getMarkerStyle(item.color, isVisible)} />
            <span
              style={{
                fontSize: '12px',
                color: isVisible ? t.text : t.textSecondary,
                fontFamily: 'inherit',
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
            {showValues && item.value !== undefined && (
              <span
                style={{
                  fontSize: '12px',
                  color: isVisible ? t.text : t.textMuted,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {item.value}
              </span>
            )}
          </>
        );

        if (isClickable) {
          return (
            <button
              key={item.key}
              onClick={() => onItemClick({ key: item.key, visible: isVisible })}
              style={itemStyle}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={item.key} style={itemStyle}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
