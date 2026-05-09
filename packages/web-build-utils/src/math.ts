/**
 * Converts a decimal ratio into a percentage.
 *
 * @param num - Ratio to convert, such as `0.1234`
 * @param fractionDigits - Number of digits to keep after rounding
 * @returns The percentage value
 *
 * @example
 * ```ts
 * toPercent(0.1234, 2); // returns 12.34
 * toPercent(0.5); // returns 50
 * ```
 */
export function toPercent(num: number, fractionDigits: number = 0) {
  const fix = Math.pow(10, fractionDigits);
  return Math.round(num * 100 * fix) / fix;
}
