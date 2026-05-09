import { outputFile, pathExists, readFile } from 'fs-extra';
import { join, relative } from 'node:path';
import { eachFile, EachFileOptions } from './eachFile';

type Content = string | Buffer;

export type CopyFilesTransform = (
  src: string,
  dest: string,
  content: Buffer
) => Content | Promise<Content>;

export interface CopyFilesOptions extends EachFileOptions {
  overwrite?: boolean;
  transform?: CopyFilesTransform;
}

/**
 * Copies files from a source path into a destination path.
 *
 * @remarks
 * Relative paths under `src` are preserved under `dest`. When provided, the
 * transform runs after the source file is read and before the destination file
 * is written.
 *
 * @param src - Source file or directory to copy from
 * @param dest - Destination root to copy into
 * @param options - Copy behavior and traversal options
 */
export async function copyFiles(
  src: string,
  dest: string,
  options: CopyFilesOptions = {}
) {
  const { overwrite, transform } = options;

  return eachFile(
    src,
    async (filepath) => {
      const relativePath = relative(src, filepath);
      const destPath = join(dest, relativePath);
      if (!overwrite && (await pathExists(destPath))) {
        return;
      }

      let content: Content = await readFile(filepath);
      if (transform) {
        content = await transform(filepath, destPath, content as Buffer);
      }

      return outputFile(destPath, content);
    },
    options
  );
}
