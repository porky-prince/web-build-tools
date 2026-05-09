import { pathExists, readFile } from 'fs-extra';
import { join } from 'node:path';
import { copyFiles } from '../../src';
import { createTempDirTracker, writeFile } from './testUtils';

const tempDirs = createTempDirTracker('web-build-utils-copyFiles-');

describe('copyFiles', () => {
  afterEach(async () => {
    await tempDirs.cleanup();
  });

  test('copies a nested directory tree and preserves relative paths', async () => {
    const root = await tempDirs.makeTempDir();
    const src = join(root, 'src');
    const dest = join(root, 'dest');

    await writeFile(join(src, 'top.txt'), 'top');
    await writeFile(join(src, 'nested', 'child.txt'), 'child');

    await copyFiles(src, dest);

    await expect(readFile(join(dest, 'top.txt'), 'utf8')).resolves.toBe('top');
    await expect(
      readFile(join(dest, 'nested', 'child.txt'), 'utf8')
    ).resolves.toBe('child');
  });

  test('applies filter and transform before writing destination files', async () => {
    const root = await tempDirs.makeTempDir();
    const src = join(root, 'src');
    const dest = join(root, 'dest');
    const keepFile = join(src, 'keep.txt');
    const skipFile = join(src, 'skip.txt');
    const transform = jest.fn(
      async (srcPath: string, destPath: string, content: Buffer) => {
        expect(srcPath).toBe(keepFile);
        expect(destPath).toBe(join(dest, 'keep.txt'));
        expect(Buffer.isBuffer(content)).toBe(true);
        return content.toString('utf8').toUpperCase();
      }
    );

    await writeFile(keepFile, 'keep');
    await writeFile(skipFile, 'skip');

    await copyFiles(src, dest, {
      filter: async (filePath) => !filePath.endsWith('skip.txt'),
      transform,
    });

    await expect(readFile(join(dest, 'keep.txt'), 'utf8')).resolves.toBe(
      'KEEP'
    );
    await expect(pathExists(join(dest, 'skip.txt'))).resolves.toBe(false);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test('does not overwrite existing files unless overwrite is true', async () => {
    const root = await tempDirs.makeTempDir();
    const src = join(root, 'src');
    const dest = join(root, 'dest');
    const srcFile = join(src, 'file.txt');
    const destFile = join(dest, 'file.txt');

    await writeFile(srcFile, 'new');
    await writeFile(destFile, 'old');

    await copyFiles(src, dest);
    await expect(readFile(destFile, 'utf8')).resolves.toBe('old');

    await copyFiles(src, dest, { overwrite: true });
    await expect(readFile(destFile, 'utf8')).resolves.toBe('new');
  });
});
