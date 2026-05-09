import { toPercent } from '../src';

describe('toPercent', () => {
  test('should convert number to percentage with default fraction digits', () => {
    expect(toPercent(1)).toBe(100);
    expect(toPercent(0.5)).toBe(50);
    expect(toPercent(0.1234)).toBe(12);
    expect(toPercent(0)).toBe(0);
    expect(toPercent(-0.25)).toBe(-25);
  });

  test('should convert number to percentage with specified fraction digits', () => {
    expect(toPercent(0.1234, 2)).toBe(12.34);
    expect(toPercent(0.5, 1)).toBe(50);
    expect(toPercent(0.007, 3)).toBe(0.7);
    expect(toPercent(-0.25, 1)).toBe(-25);
    expect(toPercent(0, 2)).toBe(0);
    expect(toPercent(1, 4)).toBe(100);
  });

  test('should handle edge cases', () => {
    expect(toPercent(0.123456789, 5)).toBe(12.34568); // Rounding test
    expect(toPercent(0.9999, 3)).toBe(99.99); // Near 100%
  });
});
