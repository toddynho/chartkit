import { describe, it, expect } from 'vitest';
import { interpolateY } from '../utils/interpolation';
import { linearScale } from '../utils/scales';

describe('interpolateY', () => {
  const data = [
    { time: '0', value: 0 },
    { time: '1', value: 50 },
    { time: '2', value: 100 },
    { time: '3', value: 25 },
  ];
  const chartWidth = 300;
  const yScale = linearScale([0, 100], [200, 0]); // Inverted Y axis

  it('should return exact value at data points', () => {
    // At index 0
    const result0 = interpolateY(data, 'value', 0, chartWidth, yScale);
    expect(result0.value).toBe(0);
    expect(result0.index).toBe(0);

    // At index 2 (x = 200)
    const result2 = interpolateY(data, 'value', 200, chartWidth, yScale);
    expect(result2.value).toBe(100);
    expect(result2.index).toBe(2);
  });

  it('should interpolate between data points', () => {
    // Halfway between index 0 (value 0) and index 1 (value 50)
    // x = 50 is between 0 and 100
    const result = interpolateY(data, 'value', 50, chartWidth, yScale);
    expect(result.value).toBe(25); // Midpoint between 0 and 50
    expect(result.index).toBe(1); // Rounds to nearest
  });

  it('should handle edge cases at start', () => {
    const result = interpolateY(data, 'value', 0, chartWidth, yScale);
    expect(result.value).toBe(0);
    expect(result.index).toBe(0);
  });

  it('should handle edge cases at end', () => {
    const result = interpolateY(data, 'value', chartWidth, chartWidth, yScale);
    expect(result.value).toBe(25);
    expect(result.index).toBe(3);
  });

  it('should handle empty data', () => {
    const result = interpolateY([], 'value', 100, chartWidth, yScale);
    expect(result.value).toBe(0);
    expect(result.y).toBe(0);
    expect(result.index).toBe(0);
  });

  it('should handle single data point', () => {
    const singleData = [{ value: 42 }];
    const result = interpolateY(singleData, 'value', 150, chartWidth, yScale);
    expect(result.value).toBe(42);
    expect(result.index).toBe(0);
  });

  it('should calculate correct Y pixel position', () => {
    const result = interpolateY(data, 'value', 200, chartWidth, yScale);
    // value = 100, yScale maps 0->200, 100->0
    expect(result.y).toBe(0);
  });

  it('should handle missing/undefined values', () => {
    const dataWithMissing = [
      { time: '0', value: 10 },
      { time: '1' }, // no value
      { time: '2', value: 30 },
    ];
    
    // At index 1 (no value)
    const result = interpolateY(dataWithMissing, 'value', 150, 300, yScale);
    // Should treat undefined as 0
    expect(result).toBeDefined();
  });
});
