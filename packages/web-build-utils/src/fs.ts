import path from 'path';

/**
 * Checks if the given file path is a safe filename.
 *
 * A safe filename:
 * - Is not empty or undefined
 * - Does not start with a dot (e.g. `.DS_Store`)
 * - Contains only alphanumeric characters, underscores, dots, hyphens, at signs, or dollar signs
 *
 * @param {string} p - The file path to check.
 * @param {boolean} [log] - Whether to log a warning if the filename is unsafe.
 * @returns {boolean} Returns `true` if the filename is safe, otherwise `false`.
 *
 * @example
 * isSafeFilename('foo.txt'); // true
 * isSafeFilename('.env'); // false
 * isSafeFilename('my-file@2024.js'); // true
 * isSafeFilename('bad/file\\name'); // false
 * isSafeFilename(''); // false
 */
export function isSafeFilename(p: string, log?: boolean) {
  if (!p) {
    return false;
  }
  const name = path.basename(p);
  // Exclude like .DS_Store etc.
  if (name.startsWith('.')) {
    return false;
  }
  if (/^[\w.\-@$]+$/.test(name)) {
    return true;
  }
  if (log) {
    console.warn('Found a unsafe file:', p);
  }
  return false;
}
