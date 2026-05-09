import { basename } from 'node:path';

/**
 * Returns whether the basename of a path is safe to use as a filename.
 *
 * @remarks
 * This check rejects dotfiles such as `.DS_Store` and only allows
 * alphanumeric characters, underscores, dots, hyphens, at signs, and dollar
 * signs in the basename.
 *
 * @param path - Path whose basename should be validated
 * @param log - Whether to log a warning for unsafe names
 *
 * @example
 * ```ts
 * isSafeFilename('foo.txt'); // true
 * isSafeFilename('.env'); // false
 * isSafeFilename('my-file@2024.js'); // true
 * isSafeFilename('bad/file\\name'); // false
 * isSafeFilename(''); // false
 * ```
 */
export function isSafeFilename(path: string, log?: boolean) {
  if (!path) {
    return false;
  }
  const name = basename(path);
  if (name.startsWith('.')) {
    return false;
  }
  if (/^[\w.\-@$]+$/.test(name)) {
    return true;
  }
  if (log) {
    console.warn('Found a unsafe file:', path);
  }
  return false;
}
