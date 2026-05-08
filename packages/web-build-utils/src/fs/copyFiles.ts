import fs from 'fs-extra';
import path from 'path';
import { eachFile, EachFileOptions } from './eachFile';

type Content = string | Buffer;

type CopyFilesTransform = (
  src: string,
  dest: string,
  content: Buffer
) => Content | Promise<Content>;

export interface CopyFilesOptions extends EachFileOptions {
  overwrite?: boolean;
  transform?: CopyFilesTransform;
}

export async function copyFiles(
  src: string,
  dest: string,
  options: CopyFilesOptions = {}
) {
  const { overwrite, transform } = options;

  return eachFile(
    src,
    async (filepath) => {
      const relative = path.relative(src, filepath);
      const destPath = path.join(dest, relative);
      if (!overwrite && (await fs.pathExists(destPath))) {
        return;
      }

      let content: Content = await fs.readFile(filepath);
      if (transform) {
        content = await transform(filepath, destPath, content as Buffer);
      }

      return fs.outputFile(destPath, content);
    },
    options
  );
}
