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

/**
 * Creates a logarithmic scale function that maps values from domain to range
 * Handles zero/negative values by using a small epsilon
 * 
 * @example
 * ```ts
 * const xScale = logScale([1, 1000], [0, 500]);
 * xScale(10); // ~167
 * xScale(100); // ~333
 * ```
 */
export function logScale(domain: Extent, range: Extent): ScaleFunction {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  
  // Ensure positive values for log scale
  const minDomain = Math.max(d0, 1e-10);
  const maxDomain = Math.max(d1, minDomain + 1e-10);
  
  const logMin = Math.log10(minDomain);
  const logMax = Math.log10(maxDomain);
  const logRange = logMax - logMin || 1;
  
  return (value: number) => {
    const safeValue = Math.max(value, 1e-10);
    const logValue = Math.log10(safeValue);
    const normalized = (logValue - logMin) / logRange;
    return r0 + normalized * (r1 - r0);
  };
}

/**
 * Creates an inverse logarithmic scale that maps from range back to domain
 * 
 * @example
 * ```ts
 * const inverseX = inverseLogScale([1, 1000], [0, 500]);
 * inverseX(167); // ~10
 * ```
 */
export function inverseLogScale(domain: Extent, range: Extent): ScaleFunction {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  
  const minDomain = Math.max(d0, 1e-10);
  const maxDomain = Math.max(d1, minDomain + 1e-10);
  
  const logMin = Math.log10(minDomain);
  const logMax = Math.log10(maxDomain);
  const logRange = logMax - logMin || 1;
  
  return (value: number) => {
    const normalized = (value - r0) / (r1 - r0 || 1);
    const logValue = logMin + normalized * logRange;
    return Math.pow(10, logValue);
  };
}

/**
 * Generates nice tick values for a logarithmic scale
 * Returns values like 1, 10, 100, 1000, etc.
 */
export function logTicks(domain: Extent, count: number = 5): number[] {
  const [d0, d1] = domain;
  const minVal = Math.max(d0, 1e-10);
  const maxVal = Math.max(d1, minVal);
  
  const logMin = Math.floor(Math.log10(minVal));
  const logMax = Math.ceil(Math.log10(maxVal));
  
  const ticks: number[] = [];
  
  // Generate powers of 10
  for (let i = logMin; i <= logMax; i++) {
    const tick = Math.pow(10, i);
    if (tick >= minVal && tick <= maxVal) {
      ticks.push(tick);
    }
  }
  
  // If we don't have enough ticks, add intermediate values (2, 5)
  if (ticks.length < count) {
    const moreTicks: number[] = [];
    for (let i = logMin; i <= logMax; i++) {
      const base = Math.pow(10, i);
      [1, 2, 5].forEach(mult => {
        const tick = base * mult;
        if (tick >= minVal && tick <= maxVal) {
          moreTicks.push(tick);
        }
      });
    }
    return [...new Set(moreTicks)].sort((a, b) => a - b).slice(0, count);
  }
  
  return ticks;
}
