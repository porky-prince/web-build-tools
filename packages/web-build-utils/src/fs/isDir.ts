import fs from 'fs-extra';
import path from 'path';

export async function isDir(filepath: string) {
  return (
    !!filepath &&
    (await fs.pathExists(filepath)) &&
    (await fs.stat(filepath)).isDirectory()
  );
}

export function isDirSync(filepath: string) {
  return (
    !!filepath &&
    fs.pathExistsSync(filepath) &&
    fs.statSync(filepath).isDirectory()
  );
}

export function isDirPath(filepath: string) {
  return !!filepath && !path.extname(filepath);
}
