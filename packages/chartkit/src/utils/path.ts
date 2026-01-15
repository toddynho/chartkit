import type { ScaleFunction } from './scales';

/**
 * Generates an SVG path string for a line chart
 * 
 * @param values - Array of numeric values
 * @param xScale - Scale function for X coordinates
 * @param yScale - Scale function for Y coordinates
 */
export function linePath(
  values: number[],
  xScale: ScaleFunction,
  yScale: ScaleFunction
): string {
  if (values.length === 0) return '';
  
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`)
    .join(' ');
}

/**
 * Generates an SVG path string for an area chart (closed path)
 * 
 * @param values - Array of numeric values
 * @param xScale - Scale function for X coordinates
 * @param yScale - Scale function for Y coordinates
 * @param width - Chart width for closing the path
 * @param height - Chart height for closing the path
 */
export function areaPath(
  values: number[],
  xScale: ScaleFunction,
  yScale: ScaleFunction,
  width: number,
  height: number
): string {
  const line = linePath(values, xScale, yScale);
  if (!line) return '';
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

/**
 * Generates tick positions for an axis
 * 
 * @param min - Minimum value
 * @param max - Maximum value
 * @param count - Desired number of ticks
 */
export function generateTicks(min: number, max: number, count: number = 5): number[] {
  const range = max - min;
  const step = range / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}
