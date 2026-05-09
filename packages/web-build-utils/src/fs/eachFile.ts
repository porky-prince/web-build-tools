import { pathExists, readdir, stat } from 'fs-extra';
import { join } from 'node:path';

export type EachFileFn = (path: string) => void | Promise<void>;

export type EachFileFilter = (path: string) => boolean | Promise<boolean>;

export interface EachFileOptions {
  filter?: EachFileFilter;
}

/**
 * Traverses a file or directory tree and invokes a callback for each file.
 *
 * @remarks
 * The optional filter is evaluated for every visited path, including
 * directories, before recursion continues.
 *
 * @param path - File or directory to start from
 * @param fn - Callback invoked for each matched file
 * @param options - Traversal options
 */
export async function eachFile(
  path: string,
  fn: EachFileFn,
  options: EachFileOptions = {}
) {
  if (!path || !(await pathExists(path))) {
    return;
  }

  const { filter } = options;
  if (filter && !(await filter(path))) {
    return;
  }

  if ((await stat(path)).isDirectory()) {
    const baseNames = await readdir(path);
    await Promise.all(
      baseNames.map((baseName) => {
        const subPath = join(path, baseName);
        return eachFile(subPath, fn, options);
      })
    );
    return;
  }

  return fn(path);
}
