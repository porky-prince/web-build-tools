/**
 * Converts a number to a percentage with specified decimal places.
 * @param num The number to convert (e.g. 0.1234).
 * @param fractionDigits Number of decimal places (default: 0).
 * @returns The percentage value (e.g. 12.34).
 * @example
 * toPercent(0.1234, 2); // returns 12.34
 * toPercent(0.5); // returns 50
 * toPercent(1); // returns 100
 * toPercent(0.007, 3); // returns 0.7
 * toPercent(-0.25, 1); // returns -25
 * toPercent(0, 2); // returns 0
 */
export function toPercent(num: number, fractionDigits: number = 0) {
  const fix = Math.pow(10, fractionDigits);
  return Math.round(num * 100 * fix) / fix;
}
