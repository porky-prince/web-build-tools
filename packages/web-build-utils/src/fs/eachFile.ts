import fs from 'fs-extra';
import path from 'path';

export type EachFileFn = (filepath: string) => void | Promise<void>;

export type EachFileFilter = (filepath: string) => boolean | Promise<boolean>;

export interface EachFileOptions {
  filter?: EachFileFilter;
}

export async function eachFile(
  filepath: string,
  fn: EachFileFn,
  options: EachFileOptions = {}
) {
  if (!filepath || !(await fs.pathExists(filepath))) {
    return;
  }

  const { filter } = options;
  if (filter && !(await filter(filepath))) {
    return;
  }

  if ((await fs.stat(filepath)).isDirectory()) {
    const baseNames = await fs.readdir(filepath);
    await Promise.all(
      baseNames.map((baseName) => {
        const subFilepath = path.join(filepath, baseName);
        return eachFile(subFilepath, fn, options);
      })
    );
    return;
  }

  return fn(filepath);
}
