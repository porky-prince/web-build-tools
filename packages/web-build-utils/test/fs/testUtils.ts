import { mkdtemp, outputFile, remove } from 'fs-extra';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function createTempDirTracker(prefix: string) {
  const tempDirs: string[] = [];

  return {
    async cleanup() {
      await Promise.all(tempDirs.splice(0).map((dir) => remove(dir)));
    },

    async makeTempDir() {
      const dir = await mkdtemp(join(tmpdir(), prefix));
      tempDirs.push(dir);
      return dir;
    },
  };
}

export async function writeFile(
  filePath: string,
  content: string | Buffer = ''
) {
  await outputFile(filePath, content);
}
