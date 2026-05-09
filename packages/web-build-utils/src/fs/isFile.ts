import { pathExists, pathExistsSync, stat, statSync } from 'fs-extra';
import { extname } from 'node:path';

/**
 * Returns whether a path exists and resolves to a file.
 *
 * @param path - Path to test
 */
export async function isFile(path: string) {
  return !!path && (await pathExists(path)) && (await stat(path)).isFile();
}

/**
 * Synchronous version of {@link isFile}.
 *
 * @param path - Path to test
 */
export function isFileSync(path: string) {
  return !!path && pathExistsSync(path) && statSync(path).isFile();
}

/**
 * Heuristically treats a path with an extension as file-like.
 *
 * @remarks
 * This does not check the filesystem.
 *
 * @param path - Path string to inspect
 */
export function isFilePath(path: string) {
  return !!path && !!extname(path);
}
