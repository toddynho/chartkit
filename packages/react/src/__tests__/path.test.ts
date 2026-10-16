import { describe, it, expect } from 'vitest';
import { linePath, areaPath, generateTicks } from '../utils/path';
import { linearScale } from '../utils/scales';

describe('linePath', () => {
  const xScale = linearScale([0, 3], [0, 300]);
  const yScale = linearScale([0, 100], [200, 0]);

  it('should generate SVG path string', () => {
    const values = [0, 50, 100, 25];
    const path = linePath(values, xScale, yScale);
    
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).toBe('M 0 200 L 100 100 L 200 0 L 300 150');
  });

  it('should handle empty array', () => {
    expect(linePath([], xScale, yScale)).toBe('');
  });

  it('should handle single value', () => {
    const path = linePath([50], xScale, yScale);
    expect(path).toBe('M 0 100');
    expect(path).not.toContain('L');
  });

  it('should handle two values', () => {
    const path = linePath([0, 100], 
      linearScale([0, 1], [0, 100]), 
      linearScale([0, 100], [100, 0])
    );
    expect(path).toBe('M 0 100 L 100 0');
  });
});

describe('areaPath', () => {
  const xScale = linearScale([0, 2], [0, 200]);
  const yScale = linearScale([0, 100], [100, 0]);

  it('should generate closed SVG path', () => {
    const values = [0, 50, 100];
    const path = areaPath(values, xScale, yScale, 200, 100);
    
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).toContain('Z');
    expect(path).toBe('M 0 100 L 100 50 L 200 0 L 200 100 L 0 100 Z');
  });

  it('should handle empty array', () => {
    expect(areaPath([], xScale, yScale, 200, 100)).toBe('');
  });

  it('should close path at bottom corners', () => {
    const path = areaPath([50], xScale, yScale, 200, 100);
    expect(path).toContain('L 200 100');
    expect(path).toContain('L 0 100');
    expect(path).toContain('Z');
  });
});

describe('generateTicks', () => {
  it('should generate correct number of ticks', () => {
    const ticks = generateTicks(0, 100, 5);
    expect(ticks).toHaveLength(5);
  });

  it('should include min and max', () => {
    const ticks = generateTicks(0, 100, 5);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(100);
  });

  it('should generate evenly spaced ticks', () => {
    const ticks = generateTicks(0, 100, 5);
    expect(ticks).toEqual([0, 25, 50, 75, 100]);
  });

  it('should handle non-zero minimum', () => {
    const ticks = generateTicks(10, 50, 5);
    expect(ticks).toEqual([10, 20, 30, 40, 50]);
  });

  it('should handle negative range', () => {
    const ticks = generateTicks(-100, 0, 5);
    expect(ticks).toEqual([-100, -75, -50, -25, 0]);
  });

  it('should default to 5 ticks', () => {
    const ticks = generateTicks(0, 100);
    expect(ticks).toHaveLength(5);
  });

  it('should handle 2 ticks', () => {
    const ticks = generateTicks(0, 100, 2);
    expect(ticks).toEqual([0, 100]);
  });

  it('should handle same min and max', () => {
    const ticks = generateTicks(50, 50, 5);
    // All ticks should be 50
    expect(ticks.every(t => t === 50)).toBe(true);
  });
});
