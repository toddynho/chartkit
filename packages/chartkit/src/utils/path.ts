import type { ScaleFunction } from './scales';

export type CurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

interface Point {
  x: number;
  y: number;
}

/**
 * Generate monotone cubic spline control points (Catmull-Rom to Bezier)
 * This creates smooth curves that pass through all data points
 */
function monotoneCurve(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const tension = 0.5;
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Generate step path (horizontal then vertical)
 */
function stepCurve(points: Point[], type: 'step' | 'stepBefore' | 'stepAfter'): string {
  if (points.length < 2) return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    if (type === 'stepAfter') {
      // Horizontal first, then vertical
      path += ` L ${curr.x} ${prev.y} L ${curr.x} ${curr.y}`;
    } else if (type === 'stepBefore') {
      // Vertical first, then horizontal
      path += ` L ${prev.x} ${curr.y} L ${curr.x} ${curr.y}`;
    } else {
      // Step at midpoint
      const midX = (prev.x + curr.x) / 2;
      path += ` L ${midX} ${prev.y} L ${midX} ${curr.y} L ${curr.x} ${curr.y}`;
    }
  }

  return path;
}

/**
 * Generates an SVG path string for a line chart with curve type support
 */
export function linePath(
  values: number[],
  xScale: ScaleFunction,
  yScale: ScaleFunction,
  curve: CurveType = 'linear'
): string {
  if (values.length === 0) return '';

  const points: Point[] = values.map((v, i) => ({
    x: xScale(i),
    y: yScale(v),
  }));

  if (curve === 'monotone') {
    return monotoneCurve(points);
  }

  if (curve === 'step' || curve === 'stepBefore' || curve === 'stepAfter') {
    return stepCurve(points, curve);
  }

  // Linear (default)
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
}

/**
 * Generate path from pre-computed points with curve support
 */
export function linePathFromPoints(
  points: Point[],
  curve: CurveType = 'linear'
): string {
  if (points.length === 0) return '';

  if (curve === 'monotone') {
    return monotoneCurve(points);
  }

  if (curve === 'step' || curve === 'stepBefore' || curve === 'stepAfter') {
    return stepCurve(points, curve);
  }

  // Linear (default)
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
}

/**
 * Generates an SVG path string for an area chart (closed path)
 */
export function areaPath(
  values: number[],
  xScale: ScaleFunction,
  yScale: ScaleFunction,
  width: number,
  height: number,
  curve: CurveType = 'linear'
): string {
  const line = linePath(values, xScale, yScale, curve);
  if (!line) return '';
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

/**
 * Generate area path from line path (closes the path at the bottom)
 */
export function areaPathFromLine(
  linePath: string,
  startX: number,
  endX: number,
  baseY: number
): string {
  if (!linePath) return '';
  return `${linePath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
}

/**
 * Generates tick positions for an axis
 */
export function generateTicks(min: number, max: number, count: number = 5): number[] {
  const range = max - min;
  const step = range / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}
