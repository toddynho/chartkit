import { type ReactNode } from 'react';

/**
 * Common types shared across chart components
 */

/** Click event data for data points */
export interface DataPointClickEvent<T = unknown> {
  /** The raw data item */
  data: T;
  /** Index in the data array */
  index: number;
  /** Series key (for multi-series charts) */
  seriesKey?: string;
  /** X coordinate of the click */
  x: number;
  /** Y coordinate of the click */
  y: number;
  /** The value at this point */
  value: number;
  /** Native mouse event */
  nativeEvent: React.MouseEvent;
}

/** Click event data for bar charts */
export interface BarClickEvent<T = unknown> extends DataPointClickEvent<T> {
  /** Category/label for this bar */
  category: string;
}

/** Click event data for pie/donut segments */
export interface SegmentClickEvent<T = unknown> extends DataPointClickEvent<T> {
  /** Label for this segment */
  label: string;
  /** Percentage of total */
  percentage: number;
}

/** Tooltip render props */
export interface TooltipRenderProps<T = unknown> {
  /** The raw data item(s) */
  data: T | T[];
  /** Index in the data array */
  index: number;
  /** X position for tooltip */
  x: number;
  /** Y position for tooltip */
  y: number;
  /** Active series (for multi-series) */
  series?: {
    key: string;
    label: string;
    value: number;
    color: string;
  }[];
  /** Category label (for bar/donut) */
  category?: string;
  /** Total value (for stacked/donut) */
  total?: number;
}

/** Custom tooltip renderer function */
export type TooltipRenderer<T = unknown> = (props: TooltipRenderProps<T>) => ReactNode;

/** Legend item data */
export interface LegendItem {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Color */
  color: string;
  /** Whether currently visible */
  visible?: boolean;
  /** Optional value to display */
  value?: string | number;
}

/** Legend click event */
export interface LegendClickEvent {
  /** Key of clicked item */
  key: string;
  /** Current visibility state */
  visible: boolean;
}

/** Annotation types */
export interface ReferenceLine {
  /** Type identifier */
  type: 'line';
  /** Value on the axis */
  value: number;
  /** Axis to draw on */
  axis: 'x' | 'y';
  /** Line color */
  color?: string;
  /** Line style */
  strokeDasharray?: string;
  /** Line width */
  strokeWidth?: number;
  /** Optional label */
  label?: string;
  /** Label position */
  labelPosition?: 'start' | 'center' | 'end';
}

export interface ReferenceArea {
  /** Type identifier */
  type: 'area';
  /** Start value */
  start: number;
  /** End value */
  end: number;
  /** Axis to draw on */
  axis: 'x' | 'y';
  /** Fill color */
  color?: string;
  /** Fill opacity */
  opacity?: number;
  /** Optional label */
  label?: string;
}

export type Annotation = ReferenceLine | ReferenceArea;

/** Grid configuration options */
export interface GridOptions {
  /** Show horizontal grid lines (default: true) */
  horizontal?: boolean;
  /** Show vertical grid lines (default: false) */
  vertical?: boolean;
  /** Dash pattern for grid lines (e.g., "4,4"). Default: solid lines */
  strokeDasharray?: string;
  /** Grid line color (overrides theme) */
  color?: string;
  /** Grid line opacity (0-1, default: 0.4) */
  opacity?: number;
  /** Grid line width (default: 1) */
  strokeWidth?: number;
}

/** Area gradient configuration */
export interface AreaGradientOptions {
  /** Starting opacity at top (default: 0.4) */
  from?: number;
  /** Ending opacity at bottom (default: 0.05) */
  to?: number;
  /** Gradient direction: 'vertical' (top to bottom) or 'horizontal' */
  direction?: 'vertical' | 'horizontal';
}
