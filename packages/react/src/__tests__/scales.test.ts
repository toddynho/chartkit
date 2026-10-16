import { describe, it, expect } from 'vitest';
import { linearScale, inverseLinearScale, clamp, extent, padExtent } from '../utils/scales';

describe('linearScale', () => {
  it('should map domain to range linearly', () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(0)).toBe(0);
    expect(scale(50)).toBe(250);
    expect(scale(100)).toBe(500);
  });

  it('should handle non-zero domain start', () => {
    const scale = linearScale([10, 20], [0, 100]);
    expect(scale(10)).toBe(0);
    expect(scale(15)).toBe(50);
    expect(scale(20)).toBe(100);
  });

  it('should handle inverted ranges', () => {
    const scale = linearScale([0, 100], [500, 0]); // Y-axis style
    expect(scale(0)).toBe(500);
    expect(scale(50)).toBe(250);
    expect(scale(100)).toBe(0);
  });

  it('should handle same domain values (division by zero)', () => {
    const scale = linearScale([50, 50], [0, 100]);
    // Should not throw, returns r0 for any input
    expect(scale(50)).toBe(0);
  });

  it('should extrapolate beyond domain', () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(150)).toBe(750);
    expect(scale(-50)).toBe(-250);
  });
});

describe('inverseLinearScale', () => {
  it('should map range back to domain', () => {
    const inverse = inverseLinearScale([0, 100], [0, 500]);
    expect(inverse(0)).toBe(0);
    expect(inverse(250)).toBe(50);
    expect(inverse(500)).toBe(100);
  });

  it('should be the inverse of linearScale', () => {
    const scale = linearScale([10, 50], [100, 300]);
    const inverse = inverseLinearScale([10, 50], [100, 300]);
    
    expect(inverse(scale(30))).toBeCloseTo(30);
    expect(scale(inverse(200))).toBeCloseTo(200);
  });

  it('should handle same range values', () => {
    const inverse = inverseLinearScale([0, 100], [50, 50]);
    expect(inverse(50)).toBe(0);
  });
});

describe('clamp', () => {
  it('should return value within bounds', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('should clamp below minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('should clamp above maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('should handle equal min and max', () => {
    expect(clamp(50, 25, 25)).toBe(25);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-50, -100, -10)).toBe(-50);
    expect(clamp(-5, -100, -10)).toBe(-10);
    expect(clamp(-150, -100, -10)).toBe(-100);
  });
});

describe('extent', () => {
  it('should find min and max', () => {
    expect(extent([1, 5, 3, 9, 2])).toEqual([1, 9]);
  });

  it('should handle single element', () => {
    expect(extent([42])).toEqual([42, 42]);
  });

  it('should handle empty array', () => {
    expect(extent([])).toEqual([0, 0]);
  });

  it('should handle negative values', () => {
    expect(extent([-5, -10, -1, -3])).toEqual([-10, -1]);
  });

  it('should handle mixed values', () => {
    expect(extent([-10, 0, 10, 5, -5])).toEqual([-10, 10]);
  });

  it('should handle all same values', () => {
    expect(extent([5, 5, 5, 5])).toEqual([5, 5]);
  });
});

describe('padExtent', () => {
  it('should add percentage padding', () => {
    const result = padExtent([0, 100], 0.1);
    expect(result[0]).toBe(-10);
    expect(result[1]).toBe(110);
  });

  it('should handle zero padding', () => {
    expect(padExtent([10, 50], 0)).toEqual([10, 50]);
  });

  it('should handle 50% padding', () => {
    const result = padExtent([0, 100], 0.5);
    expect(result[0]).toBe(-50);
    expect(result[1]).toBe(150);
  });

  it('should handle negative range', () => {
    const result = padExtent([-50, -10], 0.1);
    expect(result[0]).toBe(-54);
    expect(result[1]).toBe(-6);
  });

  it('should handle same min and max', () => {
    const result = padExtent([50, 50], 0.1);
    // Range is 0, so padding is 0
    expect(result).toEqual([50, 50]);
  });
});
