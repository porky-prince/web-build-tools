import { pathExists, pathExistsSync, stat, statSync } from 'fs-extra';
import { extname } from 'node:path';

/**
 * Returns whether a path exists and resolves to a directory.
 *
 * @param path - Path to test
 */
export async function isDir(path: string) {
  return !!path && (await pathExists(path)) && (await stat(path)).isDirectory();
}

/**
 * Synchronous version of {@link isDir}.
 *
 * @param path - Path to test
 */
export function isDirSync(path: string) {
  return !!path && pathExistsSync(path) && statSync(path).isDirectory();
}

/**
 * Heuristically treats a path without an extension as directory-like.
 *
 * @remarks
 * This does not check the filesystem.
 *
 * @param path - Path string to inspect
 */
export function isDirPath(path: string) {
  return !!path && !extname(path);
}
