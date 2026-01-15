/**
 * Scale function type - maps a value from domain to range
 */
export type ScaleFunction = (value: number) => number;

/**
 * Domain/range tuple type
 */
export type Extent = [number, number];

/**
 * Creates a linear scale function that maps values from domain to range
 * 
 * @example
 * ```ts
 * const xScale = linearScale([0, 100], [0, 500]);
 * xScale(50); // 250
 * ```
 */
export function linearScale(domain: Extent, range: Extent): ScaleFunction {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ratio = (r1 - r0) / (d1 - d0 || 1);
  return (value: number) => r0 + (value - d0) * ratio;
}

/**
 * Creates an inverse linear scale that maps from range back to domain
 * Useful for converting pixel positions back to data values
 * 
 * @example
 * ```ts
 * const inverseX = inverseLinearScale([0, 100], [0, 500]);
 * inverseX(250); // 50
 * ```
 */
export function inverseLinearScale(domain: Extent, range: Extent): ScaleFunction {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ratio = (d1 - d0) / (r1 - r0 || 1);
  return (value: number) => d0 + (value - r0) * ratio;
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates min and max values from an array of numbers
 */
export function extent(values: number[]): Extent {
  if (values.length === 0) return [0, 0];
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  return [min, max];
}

/**
 * Adds padding to an extent
 */
export function padExtent(ext: Extent, padding: number): Extent {
  const range = ext[1] - ext[0];
  const pad = range * padding;
  return [ext[0] - pad, ext[1] + pad];
}
