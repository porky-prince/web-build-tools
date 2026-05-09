import { join, relative } from 'node:path';
import { eachFile } from '../../src';
import { createTempDirTracker, writeFile } from './testUtils';

const tempDirs = createTempDirTracker('web-build-utils-eachFile-');

describe('eachFile', () => {
  afterEach(async () => {
    await tempDirs.cleanup();
  });

  test('invokes the callback when given a single file path', async () => {
    const root = await tempDirs.makeTempDir();
    const filePath = join(root, 'single.txt');
    const visited = jest.fn();

    await writeFile(filePath, 'single');
    await eachFile(filePath, visited);

    expect(visited).toHaveBeenCalledTimes(1);
    expect(visited).toHaveBeenCalledWith(filePath);
  });

  test('visits every file in a nested directory tree', async () => {
    const root = await tempDirs.makeTempDir();

    await writeFile(join(root, 'top.txt'), 'top');
    await writeFile(join(root, 'nested', 'child.txt'), 'child');
    await writeFile(join(root, 'nested', 'deep', 'grandchild.txt'), 'deep');

    const visited: string[] = [];

    await eachFile(root, async (filePath) => {
      visited.push(relative(root, filePath));
    });

    expect(visited.sort()).toEqual([
      join('nested', 'child.txt'),
      join('nested', 'deep', 'grandchild.txt'),
      'top.txt',
    ]);
  });

  test('applies the filter to directories and skips excluded subtrees', async () => {
    const root = await tempDirs.makeTempDir();

    await writeFile(join(root, 'keep', 'a.txt'), 'keep');
    await writeFile(join(root, 'keep', 'skip.txt'), 'skip file');
    await writeFile(join(root, 'skip-dir', 'b.txt'), 'skip dir');

    const seen: string[] = [];
    const visited: string[] = [];

    await eachFile(
      root,
      (filePath) => {
        visited.push(relative(root, filePath));
      },
      {
        filter: async (filePath) => {
          const relativePath = relative(root, filePath) || '.';
          seen.push(relativePath);

          return (
            !relativePath.startsWith('skip-dir') &&
            !relativePath.endsWith('skip.txt')
          );
        },
      }
    );

    expect(visited).toEqual([join('keep', 'a.txt')]);
    expect(seen).toEqual(
      expect.arrayContaining(['.', 'keep', join('keep', 'a.txt'), 'skip-dir'])
    );
    expect(seen).not.toContain(join('skip-dir', 'b.txt'));
  });
});
