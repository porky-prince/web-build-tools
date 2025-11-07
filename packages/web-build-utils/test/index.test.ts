import { toPercent } from '../src';

describe('test', () => {
  test('base', () => {
    expect(toPercent(1)).toBe(100);
  });
});
