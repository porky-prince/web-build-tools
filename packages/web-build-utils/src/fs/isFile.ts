import fs from 'fs-extra';
import path from 'path';

export async function isFile(filepath: string) {
  return (
    !!filepath &&
    (await fs.pathExists(filepath)) &&
    (await fs.stat(filepath)).isFile()
  );
}

export function isFileSync(filepath: string) {
  return (
    !!filepath && fs.pathExistsSync(filepath) && fs.statSync(filepath).isFile()
  );
}

export function isFilePath(filepath: string) {
  return !!filepath && !!path.extname(filepath);
}
