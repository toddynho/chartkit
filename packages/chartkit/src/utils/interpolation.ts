import { inverseLinearScale, type ScaleFunction } from './scales';

/**
 * Result of interpolating a Y value at a given X position
 */
export interface InterpolatedPoint {
  /** Y coordinate in pixels */
  y: number;
  /** Actual data value */
  value: number;
  /** Nearest data index */
  index: number;
}

/**
 * Interpolates the Y value at a given X position between data points
 * This creates smooth tooltip tracking that doesn't snap to data points
 * 
 * @param data - Array of data objects
 * @param dataKey - Key to extract numeric value from data objects
 * @param xPos - X position in pixels
 * @param chartWidth - Total chart width
 * @param yScale - Scale function for Y values
 */
export function interpolateY<T extends Record<string, unknown>>(
  data: T[],
  dataKey: keyof T,
  xPos: number,
  chartWidth: number,
  yScale: ScaleFunction
): InterpolatedPoint {
  if (data.length === 0) {
    return { y: 0, value: 0, index: 0 };
  }

  const xInverse = inverseLinearScale([0, data.length - 1], [0, chartWidth]);
  const dataIndex = xInverse(xPos);

  const i0 = Math.floor(dataIndex);
  const i1 = Math.min(Math.ceil(dataIndex), data.length - 1);
  const clampedI0 = Math.max(0, Math.min(i0, data.length - 1));

  if (i0 === i1 || i0 < 0) {
    const value = Number(data[clampedI0][dataKey]) || 0;
    return {
      y: yScale(value),
      value,
      index: clampedI0,
    };
  }

  const t = dataIndex - i0;
  const v0 = Number(data[i0][dataKey]) || 0;
  const v1 = Number(data[i1][dataKey]) || 0;
  const interpolatedValue = v0 + (v1 - v0) * t;

  return {
    y: yScale(interpolatedValue),
    value: interpolatedValue,
    index: Math.round(dataIndex),
  };
}
